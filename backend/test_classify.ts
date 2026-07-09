import "dotenv/config";
import { aiService } from "./src/services/aiService.js";

async function run() {
  console.log("Classifying Ticket B...");
  const category = await aiService.classifyTicket(
    "Custom Integration Question",
    "Hi support, we are building a custom integration using some legacy API. Can we hop on a Zoom call to discuss this?"
  );
  console.log("Category:", category);

  console.log("Running autoResolve...");
  const kbContent = "Some knowledge base content about integration.";
  const autoResolvedResult = await aiService.autoResolve(
    "Custom Integration Question",
    "Hi support, we are building a custom integration using some legacy API. Can we hop on a Zoom call to discuss this?",
    kbContent,
    "Case B"
  );
  console.log("Auto Resolve Result:", autoResolvedResult);
}

run().catch(console.error);
