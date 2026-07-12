import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { PrismaClient } from "@prisma/client";
import { queueService } from "./queueService.js";
import { emailService } from "./emailService.js";

const prisma = new PrismaClient();

// ─── helpers ─────────────────────────────────────────────────────────────────

function log(msg: string) {
  const ts = new Date().toLocaleTimeString("en-IN", { hour12: false });
  console.log(`[${ts}] 📬 IMAP | ${msg}`);
}

function logError(msg: string, err?: any) {
  const ts = new Date().toLocaleTimeString("en-IN", { hour12: false });
  console.error(`[${ts}] ❌ IMAP | ${msg}`, err ? (err?.message || err) : "");
}

// ─── core processor ──────────────────────────────────────────────────────────

async function processEmail(parsed: any, uid: number): Promise<boolean> {
  const fromRaw: string = parsed.from?.text || "";
  const emailMatch = fromRaw.match(/<([^>]+)>/) || fromRaw.match(/([^\s]+@[^\s]+)/);
  const fromEmail = (emailMatch ? emailMatch[1] : fromRaw.trim()).toLowerCase();
  const fromName  = parsed.from?.value?.[0]?.name?.trim() || fromEmail.split("@")[0];
  const receivedAt = parsed.date ? new Date(parsed.date).toLocaleString("en-IN") : "unknown";

  log(`📨  Email received at ${receivedAt}`);
  log(`    From    : ${fromName} <${fromEmail}>`);
  log(`    Subject : ${parsed.subject || "(No Subject)"}`);
  log(`    UID     : ${uid}`);

  // Guard: no valid address
  if (!fromEmail || !fromEmail.includes("@")) {
    log(`⚠️  Skipping UID ${uid} — no valid sender address`);
    return false;
  }

  // Guard: skip our own outgoing emails (loop prevention)
  const ownEmail = (process.env.GMAIL_USER || process.env.SMTP_USER || "").toLowerCase();
  if (fromEmail === ownEmail) {
    log(`⏭️  Skipping UID ${uid} — sent by ourselves (loop prevention)`);
    return false;
  }

  // Guard: skip no-reply / newsletter senders (not real customers)
  const skipPatterns = [
    /^noreply@/i, /^no-reply@/i, /^donotreply@/i,
    /^newsletter@/i, /^notifications@/i, /^mailer@/i,
    /^bounce@/i, /^automated@/i, /^updates@/i,
    /\.news$/i, /\.news\./, /newsletter/i, /digest@/i,
  ];
  const isSpam = skipPatterns.some((p) => p.test(fromEmail) || p.test(fromRaw));
  if (isSpam) {
    log(`⏭️  Skipping UID ${uid} — newsletter/no-reply sender (${fromEmail})`);
    return false;
  }

  const subject = (parsed.subject || "(No Subject)").replace(/^(Re|Fwd|FWD|RE|FW):\s*/i, "").trim();
  const body =
    parsed.text?.trim() ||
    (parsed.html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ||
    "(empty)";

  // Guard: dedup — don't create the same ticket twice
  const existing = await prisma.ticket.findFirst({
    where: { fromEmail: { equals: fromEmail, mode: "insensitive" }, subject },
  });
  if (existing) {
    log(`⏭️  Skipping UID ${uid} — ticket already exists (ID: ${existing.id}) for "${subject}" from ${fromEmail}`);
    return false;
  }

  // Find the AI agent for initial assignment
  const aiAgent = await prisma.user.findFirst({ where: { name: "AI", role: "AGENT" } });

  const ticket = await prisma.ticket.create({
    data: {
      subject,
      body,
      fromEmail,
      fromName,
      source: "EMAIL",
      status: "NEW",
      category: "GENERAL_QUESTION",
      aiClassified: false,
      assignedToId: aiAgent?.id || null,
    },
  });

  log(`✅  Ticket created!`);
  log(`    Ticket ID : ${ticket.id}`);
  log(`    Status    : ${ticket.status}`);
  log(`    Assigned  : ${aiAgent ? "AI Agent" : "Unassigned"}`);

  // Send acknowledgement back to customer
  const ackSent = await emailService.sendAutoReplyAcknowledgement(fromEmail, fromName, subject, ticket.id);
  log(`    Ack email : ${ackSent ? "Sent ✉️" : "Failed ⚠️"}`);

  // Enqueue for AI classification + auto-resolution
  await queueService.enqueueClassification(ticket.id, ticket.subject, ticket.body);
  log(`    AI queue  : Enqueued for classification/auto-resolution`);
  log(`─────────────────────────────────────────────────────────`);

  return true;
}

// ─── poll function ────────────────────────────────────────────────────────────

async function pollOnce(): Promise<void> {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER || "";
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "";

  if (!user || !pass) {
    console.warn("IMAP: GMAIL_USER or SMTP_USER not set — skipping poll");
    return;
  }

  const client = new ImapFlow({
    host: process.env.IMAP_HOST || "imap.gmail.com",
    port: parseInt(process.env.IMAP_PORT || "993"),
    secure: process.env.IMAP_TLS !== "false",
    auth: { user, pass },
    logger: false,
    tls: { rejectUnauthorized: false },
    socketTimeout: 30000,
    greetingTimeout: 15000,
    connectionTimeout: 20000,
  } as any);

  // Prevent unhandled error crash
  client.on("error", (err: Error) => {
    logError("Socket error", err);
  });

  try {
    log(`🔌 Connecting to ${process.env.IMAP_HOST || "imap.gmail.com"}:${process.env.IMAP_PORT || "993"}...`);
    await client.connect();

    const mailbox = process.env.IMAP_MAILBOX || "INBOX";
    const mb = await client.mailboxOpen(mailbox);
    log(`📂 Opened mailbox: ${mailbox} (${mb.exists} total messages)`);

    // ── Only fetch UNSEEN emails received within the last 7 days ──
    // This prevents processing old unread newsletters from months ago while ensuring timezone resilience.
    const since = new Date();
    since.setDate(since.getDate() - 7); // last 7 days

    const unseenUids: number[] = await client.search(
      { seen: false, since },
      { uid: true }
    ) as number[];

    if (unseenUids.length === 0) {
      log(`📭 No new unread emails in the last 7 days`);
      await client.logout();
      return;
    }

    log(`📬 Found ${unseenUids.length} recent unread email(s) to process`);

    let processed = 0;
    let skipped   = 0;

    for (const uid of unseenUids) {
      try {
        log(`─────────────────────────────────────────────────────────`);
        log(`🔄 Processing UID ${uid} (${processed + skipped + 1}/${unseenUids.length})...`);

        // Fetch source of this specific UID
        const messages = await client.fetch({ uid }, { source: true }, { uid: true });
        let raw: Buffer | null = null;
        for await (const msg of messages) {
          raw = msg.source as Buffer;
        }

        if (!raw) {
          log(`⚠️  UID ${uid} — no source data, skipping`);
          skipped++;
          continue;
        }

        const parsed = await simpleParser(raw);
        const created = await processEmail(parsed, uid);

        // Always mark as Seen so we don't re-process it
        await client.messageFlagsAdd({ uid }, ["\\Seen"]);

        if (created) {
          processed++;
        } else {
          skipped++;
        }
      } catch (err: any) {
        logError(`Error processing UID ${uid}`, err);
        skipped++;
      }
    }


    log(`═══════════════════════════════════════════════════════════`);
    log(`📊 Poll complete — Tickets created: ${processed} | Skipped: ${skipped}`);
    log(`═══════════════════════════════════════════════════════════`);

    await client.logout();
  } catch (err: any) {
    logError("Poll failed", err);
    try { await client.logout(); } catch { /* ignore */ }
  }
}

// ─── exported service ─────────────────────────────────────────────────────────

export const emailPollerService = {
  async startPolling(intervalMs?: number) {
    const pollInterval = intervalMs ?? parseInt(process.env.IMAP_POLL_INTERVAL_MS || "60000");
    const user = process.env.GMAIL_USER || process.env.SMTP_USER || "";
    const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "";

    if (!user || !pass) {
      console.log("⚠️  Email polling requires GMAIL_USER/SMTP_USER and GMAIL_APP_PASSWORD/SMTP_PASS in env");
      return;
    }

    console.log(`\n${"═".repeat(57)}`);
    console.log(`📧  IMAP Email Polling started`);
    console.log(`    Account  : ${user}`);
    console.log(`    Server   : ${process.env.IMAP_HOST || "imap.gmail.com"}:${process.env.IMAP_PORT || "993"}`);
    console.log(`    Interval : every ${pollInterval / 1000}s`);
    console.log(`${"═".repeat(57)}\n`);

    // Poll immediately on startup
    await pollOnce();

    // Recurring poll
    setInterval(async () => {
      try {
        await pollOnce();
      } catch (err) {
        logError("Unexpected error in poll interval", err);
      }
    }, pollInterval);
  },

  // Manual trigger (used by POST /settings/poll-email)
  async pollGmail() {
    log("🖱️  Manual poll triggered`");
    return pollOnce();
  },
};
