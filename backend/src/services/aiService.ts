import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const aiService = {
  async classifyTicket(subject: string, body: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Classify this support ticket into one of these categories:
- GENERAL_QUESTION
- TECHNICAL_QUESTION
- REFUND_REQUEST

Subject: ${subject}
Body: ${body}

Respond with ONLY the category name, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();

      const validCategories = [
        "GENERAL_QUESTION",
        "TECHNICAL_QUESTION",
        "REFUND_REQUEST",
      ];
      return validCategories.includes(response) ? response : "GENERAL_QUESTION";
    } catch (error) {
      console.error("Error classifying ticket:", error);
      return "GENERAL_QUESTION";
    }
  },

  async summarizeTicket(subject: string, body: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Summarize this support ticket in 2-3 sentences.

Subject: ${subject}
Body: ${body}

Provide only the summary, no additional text.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Error summarizing ticket:", error);
      return "";
    }
  },

  async suggestReply(
    subject: string,
    body: string,
    knowledgeBase: string,
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are a helpful support agent. Based on the knowledge base and the customer's ticket, draft a professional reply.

KNOWLEDGE BASE:
${knowledgeBase}

CUSTOMER TICKET:
Subject: ${subject}
Body: ${body}

Draft a helpful, professional reply addressing the customer's issue. Use information from the knowledge base when relevant.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Error suggesting reply:", error);
      return "";
    }
  },

  async autoResolve(
    subject: string,
    body: string,
    knowledgeBase: string,
  ): Promise<{ canResolve: boolean; reply: string }> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Analyze if this support ticket can be automatically resolved using the knowledge base.

KNOWLEDGE BASE:
${knowledgeBase}

CUSTOMER TICKET:
Subject: ${subject}
Body: ${body}

Respond in JSON format:
{
  "canResolve": boolean,
  "reply": "string - the auto-generated reply if canResolve is true, or empty string otherwise"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { canResolve: false, reply: "" };
    } catch (error) {
      console.error("Error in auto-resolve:", error);
      return { canResolve: false, reply: "" };
    }
  },
};
