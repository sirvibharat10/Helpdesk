import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const finalTicketA = await prisma.ticket.findUnique({
    where: { id: "cmrd324b80001qicjd6jhy84e" },
    include: { assignedTo: true },
  });

  const finalTicketB = await prisma.ticket.findUnique({
    where: { id: "cmrd324bx0003qicje1gqcq6g" },
    include: { assignedTo: true },
  });

  console.log("\n--- TICKET A (Auto-Resolvable) ---");
  console.log("Status:", finalTicketA?.status);
  console.log("Assigned To Agent Name:", finalTicketA?.assignedTo?.name || "Unassigned");

  console.log("\n--- TICKET B (Non-Resolvable) ---");
  console.log("Status:", finalTicketB?.status);
  console.log("Assigned To Agent Name:", finalTicketB?.assignedTo?.name || "Unassigned");
}

run().catch(console.error);
