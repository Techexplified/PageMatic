import { AI_MODELS } from "../libs/ai-config";

/**
 * Robust OpenRouter client with automated model fallback rotation and resilient JSON parsing.
 */
export async function generateWithOpenRouter({
  systemPrompt,
  userPrompt,
  model = AI_MODELS.PAGE_BUILDER.PRIMARY,
  fallbacks = AI_MODELS.PAGE_BUILDER.FALLBACKS,
  temperature = 0.7,
  maxTokens = 4000,
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing OPENROUTER_API_KEY environment variable. Please add it to your .env file."
    );
  }

  const modelQueue = [model, ...(fallbacks || [])];
  let lastError = null;

  for (let i = 0; i < modelQueue.length; i++) {
    const currentModel = modelQueue[i];
    console.log(`[OpenRouter] Attempting generation with model (${i + 1}/${modelQueue.length}): ${currentModel}`);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://pagematic.app",
          "X-Title": "PageMatic Shopify AI Builder",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: currentModel,
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
        console.warn(
          `[OpenRouter] Model ${currentModel} returned HTTP ${response.status}: ${errorText}`
        );
        lastError = new Error(`OpenRouter HTTP ${response.status}: ${errorText}`);
        continue; // Try next fallback model
      }

      const jsonResponse = await response.json();
      const rawContent = jsonResponse.choices?.[0]?.message?.content;

      if (!rawContent) {
        console.warn(`[OpenRouter] Model ${currentModel} returned empty content.`);
        lastError = new Error("Empty response content from LLM");
        continue;
      }

      const parsedData = extractAndParseJSON(rawContent);
      console.log(`[OpenRouter] Generation successful with model: ${currentModel}`);

      return {
        success: true,
        data: parsedData,
        modelUsed: currentModel,
        usage: jsonResponse.usage,
      };
    } catch (err) {
      console.warn(`[OpenRouter] Error with model ${currentModel}:`, err.message);
      lastError = err;
    }
  }

  throw new Error(
    `All OpenRouter models failed. Last error: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Sanitizes and extracts valid JSON from raw LLM responses.
 * Handles markdown backticks, leading/trailing notes, and formatting artifacts.
 */
function extractAndParseJSON(rawText) {
  if (typeof rawText !== "string") {
    return rawText;
  }

  let cleaned = rawText.trim();

  // Strip ```json and ``` markdown code fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }

  // Find first { and last } if extra commentary is present
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt minor repair: remove trailing commas before } or ]
    const repaired = cleaned
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // strip control characters

    return JSON.parse(repaired);
  }
}
