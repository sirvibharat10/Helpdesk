import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  console.log("1. Logging in as admin to get auth token...");
  const loginRes = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@sahayak.ai",
      password: "admin123",
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // ----------------------------------------------------
  // TEST Case C: Auto-Resolvable Ticket (Should stay assigned to AI)
  // ----------------------------------------------------
  console.log("\n2. Creating auto-resolvable ticket...");
  const createResA = await fetch("http://localhost:3001/api/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      subject: "Password Reset Help",
      body: "I forgot my password. How can I reset it?",
      fromEmail: "case_c@example.com",
      fromName: "Case C",
    }),
  });
  const ticketA = await createResA.json();
  console.log(`Created Ticket C ID: ${ticketA.id}, Initial Assigned To ID: ${ticketA.assignedToId}`);

  // ----------------------------------------------------
  // TEST Case D: Non-Resolvable Ticket (Should be unassigned from AI)
  // ----------------------------------------------------
  console.log("\n3. Creating non-resolvable ticket...");
  const createResB = await fetch("http://localhost:3001/api/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      subject: "Custom Integration Question",
      body: "Hi support, we are building a custom integration using some legacy API. Can we hop on a Zoom call to discuss this?",
      fromEmail: "case_d@example.com",
      fromName: "Case D",
    }),
  });
  const ticketB = await createResB.json();
  console.log(`Created Ticket D ID: ${ticketB.id}, Initial Assigned To ID: ${ticketB.assignedToId}`);

  console.log("\n4. Waiting 20 seconds for pg-boss processing...");
  await new Promise((resolve) => setTimeout(resolve, 20000));

  console.log("\n5. Fetching final states from database...");
  const finalTicketA = await prisma.ticket.findUnique({
    where: { id: ticketA.id },
    include: { assignedTo: true },
  });

  const finalTicketB = await prisma.ticket.findUnique({
    where: { id: ticketB.id },
    include: { assignedTo: true },
  });

  console.log("\n--- TEST CASE A RESULTS ---");
  console.log("Status:", finalTicketA?.status);
  console.log("Assigned To Agent Name:", finalTicketA?.assignedTo?.name || "Unassigned");

  console.log("\n--- TEST CASE B RESULTS ---");
  console.log("Status:", finalTicketB?.status);
  console.log("Assigned To Agent Name:", finalTicketB?.assignedTo?.name || "Unassigned");

  const successA = finalTicketA?.status === "RESOLVED" && finalTicketA?.assignedTo?.name === "AI";
  const successB = finalTicketB?.status === "OPEN" && !finalTicketB?.assignedTo;

  if (successA && successB) {
    console.log("\nSUCCESS: All assignment and unassignment checks passed!");
  } else {
    console.error("\nFAILURE: Assignment logic failed one or more checks!");
    process.exit(1);
  }
}

run().catch(console.error);
