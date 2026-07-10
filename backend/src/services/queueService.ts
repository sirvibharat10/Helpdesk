import { PgBoss } from "pg-boss";
import { PrismaClient } from "@prisma/client";
import { aiService } from "./aiService.js";
import { emailService } from "./emailService.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
let boss: PgBoss | null = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const queueService = {
  async start() {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        console.warn("⚠️ DATABASE_URL is not set in environment variables. PgBoss queue service will not run.");
        return;
      }

      boss = new PgBoss(dbUrl);
      boss.on("error", (error) => console.error("PgBoss error:", error));

      await boss.start();
      console.log("PgBoss started successfully");

      // Ensure the classify-ticket queue is created
      await boss.createQueue("classify-ticket");

      // Register the ticket classification worker
      await boss.work("classify-ticket", async (jobs) => {
        for (const job of jobs) {
          const { ticketId, subject, body } = job.data as any;
          console.log(`Processing background classification job for ticket: ${ticketId}`);

          try {
            // Set status to PROCESSING as AI starts to classify/resolve it
            const ticket = await prisma.ticket.update({
              where: { id: ticketId },
              data: { status: "PROCESSING" },
            });

            const category = await aiService.classifyTicket(subject, body).catch(err => {
              console.error(`Error in classifyTicket for ticket ${ticketId}:`, err);
              return "GENERAL_QUESTION";
            });
            
            let autoResolvedResult = { canResolve: false, reply: "" };
            try {
              const kbPath = path.join(__dirname, "../../knowledge-base.md");
              if (fs.existsSync(kbPath)) {
                const kbContent = fs.readFileSync(kbPath, "utf-8");
                autoResolvedResult = await aiService.autoResolve(subject, body, kbContent, ticket.fromName);
              } else {
                console.warn(`Knowledge base file not found at ${kbPath}`);
              }
            } catch (kbError) {
              console.error("Error running auto-resolve inside queue worker:", kbError);
            }

            const updateData: any = {};
            if (category) {
              updateData.category = category as any;
              updateData.aiClassified = true;
            }

            if (autoResolvedResult.canResolve && autoResolvedResult.reply) {
              updateData.status = "RESOLVED";
              updateData.aiResolved = true;
              const aiAgent = await prisma.user.findFirst({ where: { name: "AI", role: "AGENT" } });
              if (aiAgent) {
                updateData.assignedToId = aiAgent.id;
              }
            } else {
              // If AI cannot resolve, status changes to OPEN and we unassign from the AI agent
              updateData.status = "OPEN";
              updateData.assignedToId = null;
            }

            if (autoResolvedResult.canResolve && autoResolvedResult.reply) {
              await prisma.$transaction([
                prisma.ticket.update({
                  where: { id: ticketId },
                  data: updateData,
                }),
                prisma.reply.create({
                  data: {
                    ticketId,
                    body: autoResolvedResult.reply,
                    isAI: true,
                    senderType: "AI",
                    sentViaEmail: true,
                  },
                }),
              ]);
              // Send the AI reply to the customer via SMTP
              await emailService.sendTicketReply(
                ticket.fromEmail,
                ticket.subject,
                autoResolvedResult.reply,
                ticketId,
              );
              console.log(`Successfully auto-resolved ticket ${ticketId} with AI reply`);
            } else {
              await prisma.ticket.update({
                where: { id: ticketId },
                data: updateData,
              });
              if (category) {
                console.log(`Successfully classified ticket ${ticketId} as ${category} and set status to OPEN`);
              }
            }
          } catch (jobError) {
            console.error(`Failed to process job for ticket ${ticketId}:`, jobError);
            try {
              await prisma.ticket.update({
                where: { id: ticketId },
                data: { status: "OPEN", assignedToId: null },
              });
            } catch (dbErr) {
              console.error(`Failed to execute fallback update for ticket ${ticketId}:`, dbErr);
            }
          }
        }
      });
    } catch (error) {
      console.error("Failed to start queue service:", error);
    }
  },

  async enqueueClassification(ticketId: string, subject: string, body: string) {
    try {
      if (!boss) {
        throw new Error("PgBoss is not initialized (DATABASE_URL is missing)");
      }
      const jobId = await boss.send("classify-ticket", { ticketId, subject, body });
      console.log(`Enqueued ticket classification job ${jobId} for ticket ${ticketId}`);
    } catch (error) {
      console.error(`Failed to enqueue classification job for ticket ${ticketId}:`, error);
      // Fallback: run classification and auto-resolve inline in background on failure
      try {
        const ticket = await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: "PROCESSING" },
        });

        const category = await aiService.classifyTicket(subject, body);
        let autoResolvedResult = { canResolve: false, reply: "" };
        const kbPath = path.join(__dirname, "../../knowledge-base.md");
        if (fs.existsSync(kbPath)) {
          const kbContent = fs.readFileSync(kbPath, "utf-8");
          autoResolvedResult = await aiService.autoResolve(subject, body, kbContent, ticket.fromName);
        }

        const updateData: any = {};
        if (category) {
          updateData.category = category as any;
          updateData.aiClassified = true;
        }

        if (autoResolvedResult.canResolve && autoResolvedResult.reply) {
          updateData.status = "RESOLVED";
          updateData.aiResolved = true;
        } else {
          updateData.status = "OPEN";
          updateData.assignedToId = null;
        }

        if (autoResolvedResult.canResolve && autoResolvedResult.reply) {
          await prisma.$transaction([
            prisma.ticket.update({
              where: { id: ticketId },
              data: updateData,
            }),
            prisma.reply.create({
              data: {
                ticketId,
                body: autoResolvedResult.reply,
                isAI: true,
                senderType: "AI",
                sentViaEmail: true,
              },
            }),
          ]);
          await emailService.sendTicketReply(
            ticket.fromEmail,
            ticket.subject,
            autoResolvedResult.reply,
            ticketId,
          );
        } else {
          await prisma.ticket.update({
            where: { id: ticketId },
            data: updateData,
          });
        }
      } catch (fallbackError) {
        console.error(`Fallback background classification/resolution failed for ticket ${ticketId}:`, fallbackError);
      }
    }
  },
};
