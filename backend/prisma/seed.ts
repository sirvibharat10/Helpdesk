import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sahayak.ai" },
    update: {},
    create: {
      email: "admin@sahayak.ai",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Create sample agent
  const agentPassword = await bcrypt.hash("agent123", 10);
  const agent = await prisma.user.upsert({
    where: { email: "agent@sahayak.ai" },
    update: {},
    create: {
      email: "agent@sahayak.ai",
      password: agentPassword,
      name: "Agent User",
      role: "AGENT",
    },
  });

  // Create AI agent
  const aiPassword = await bcrypt.hash("aiagent123", 10);
  const aiAgent = await prisma.user.upsert({
    where: { email: "ai@sahayak.ai" },
    update: {},
    create: {
      email: "ai@sahayak.ai",
      password: aiPassword,
      name: "AI",
      role: "AGENT",
    },
  });

  // Create sample knowledge base articles
  await prisma.knowledgeBase.createMany({
    data: [
      {
        title: "How to reset password",
        content:
          'To reset your password, go to the login page and click "Forgot Password". Enter your email and follow the instructions sent to your inbox.',
        category: "ACCOUNT",
      },
      {
        title: "How to create a ticket",
        content:
          'To create a support ticket, navigate to the Help section and click "Create New Ticket". Fill in the subject and description of your issue.',
        category: "GENERAL",
      },
      {
        title: "Refund policy",
        content:
          "We offer a 30-day money-back guarantee. If you are not satisfied with our service, contact our support team for a full refund.",
        category: "BILLING",
      },
    ],
    skipDuplicates: true,
  });

  // Create sample tickets (idempotent: only create if subject doesn't exist)
  const sampleTickets = [
    {
      subject: "Unable to login to account",
      body: "I keep getting an invalid credentials error when trying to log in.",
      fromEmail: "customer1@example.com",
      fromName: "Jane Customer",
      category: "GENERAL_QUESTION",
      status: "NEW",
      source: "EMAIL",
      assignedToId: agent.id,
    },
    {
      subject: "Payment charged twice",
      body: "I was charged twice for my subscription this month.",
      fromEmail: "customer2@example.com",
      fromName: "Bob Buyer",
      category: "REFUND_REQUEST",
      status: "OPEN",
      source: "EMAIL",
      assignedToId: agent.id,
    },
    {
      subject: "Feature request: export data",
      body: "It would be great to export my tickets and reports as CSV.",
      fromEmail: "customer3@example.com",
      fromName: "Alice User",
      category: "TECHNICAL_QUESTION",
      status: "NEW",
      source: "MANUAL",
      assignedToId: null,
    },
  ];

  for (const t of sampleTickets) {
    const exists = await prisma.ticket.findFirst({
      where: { subject: t.subject },
    });
    if (!exists) {
      const created = await prisma.ticket.create({ data: t as any });
      // add one sample reply for the second ticket
      if (t.subject === "Payment charged twice") {
        await prisma.reply.create({
          data: {
            body: "Thanks for reaching out — we're looking into this and will refund the duplicate charge.",
            isAI: false,
            sentViaEmail: true,
            ticketId: created.id,
            authorId: agent.id,
          },
        });
      }
    }
  }

  console.log("Seeding complete!", { admin, agent });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
