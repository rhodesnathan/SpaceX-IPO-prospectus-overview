import Anthropic from "@anthropic-ai/sdk";

const systemPrompt = `You are a helpful assistant answering questions about SpaceX's IPO. You have detailed knowledge of:
- IPO offering details (price, shares, proceeds, valuation)
- Financial metrics and performance
- Business segments (Starship, Satellite, Commercial Crew)
- Company structure and leadership
- Key risks and opportunities
- Timeline and milestones

Provide clear, concise answers based on the IPO prospectus information. Be professional but approachable.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, conversationHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const client = new Anthropic({ apiKey });

    const messages = [
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    return res.status(200).json({
      message: assistantMessage,
      usage: response.usage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Failed to process message" });
  }
}
