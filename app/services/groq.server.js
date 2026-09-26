import { AI_MODELS } from "../libs/ai-config";

/**
 * High-speed Groq client for instant sub-second section re-rolls and micro-edits.
 */
export async function generateWithGroq({
  systemPrompt,
  userPrompt,
  model = AI_MODELS.MICRO_EDITS.PRIMARY,
  temperature = 0.5,
  maxTokens = 1000,
}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY environment variable. Please add it to your .env file."
    );
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error ${response.status}: ${errorText}`);
  }

  const jsonResponse = await response.json();
  const content = jsonResponse.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from Groq API.");
  }

  try {
    return JSON.parse(content);
  } catch (err) {
    // Basic repair if markdown backticks were returned
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    return JSON.parse(cleaned);
  }
}
