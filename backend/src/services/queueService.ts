import { PgBoss } from "pg-boss";
import { PrismaClient } from "@prisma/client";
import { aiService } from "./aiService.js";

const prisma = new PrismaClient();

const boss = new PgBoss(process.env.DATABASE_URL || "");

boss.on("error", (error) => console.error("PgBoss error:", error));

export const queueService = {
  async start() {
    try {
      await boss.start();
      console.log("PgBoss started successfully");

      // Ensure the classify-ticket queue is created
      await boss.createQueue("classify-ticket");

      // Register the ticket classification worker
      await boss.work("classify-ticket", async (jobs) => {
        for (const job of jobs) {
          const { ticketId, subject, body } = job.data as any;
          console.log(`Processing background classification job for ticket: ${ticketId}`);

          const category = await aiService.classifyTicket(subject, body);
          if (category) {
            await prisma.ticket.update({
              where: { id: ticketId },
              data: {
                category: category as any,
                aiClassified: true,
              },
            });
            console.log(`Successfully classified ticket ${ticketId} as ${category}`);
          }
        }
      });
    } catch (error) {
      console.error("Failed to start queue service:", error);
    }
  },

  async enqueueClassification(ticketId: string, subject: string, body: string) {
    try {
      const jobId = await boss.send("classify-ticket", { ticketId, subject, body });
      console.log(`Enqueued ticket classification job ${jobId} for ticket ${ticketId}`);
    } catch (error) {
      console.error(`Failed to enqueue classification job for ticket ${ticketId}:`, error);
      // Fallback: run classification inline in background on failure
      aiService.classifyTicket(subject, body)
        .then(async (category) => {
          if (category) {
            await prisma.ticket.update({
              where: { id: ticketId },
              data: {
                category: category as any,
                aiClassified: true,
              },
            });
          }
        })
        .catch((err) => {
          console.error(`Fallback background classification failed for ticket ${ticketId}:`, err);
        });
    }
  },
};
