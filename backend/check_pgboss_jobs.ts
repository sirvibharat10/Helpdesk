import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const jobs: any[] = await prisma.$queryRawUnsafe("SELECT id, name, state, start_after, created_on, output FROM pgboss.job ORDER BY created_on DESC LIMIT 5");
  console.log("pg-boss jobs:", jobs);
}

run().catch(console.error);
