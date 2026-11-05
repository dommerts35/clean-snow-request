import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { ASSISTANT_SYSTEM_PROMPT } from "./assistant-prompt";
import { shouldReply } from "./assistant-rules";

export { shouldReply };

type Msg = { sender_id: string | null; body: string; is_ai: boolean; created_at: string };

export async function generateAssistantReply(history: Msg[], clientId: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const messages: ModelMessage[] = history.map((m) =>
    m.sender_id === clientId
      ? { role: "user", content: `<client_message>\n${m.body}\n</client_message>` }
      : { role: "assistant", content: m.is_ai ? m.body : `[Team member wrote]: ${m.body}` },
  );
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: ASSISTANT_SYSTEM_PROMPT,
    messages,
    maxRetries: 0,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return (await result.text).trim();
}
