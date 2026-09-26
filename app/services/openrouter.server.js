import { AI_MODELS } from "../libs/ai-config";

/**
 * Robust OpenRouter client with automated model fallback rotation and resilient JSON parsing.
 */
export async function generateWithOpenRouter({
  systemPrompt,
  userPrompt,
  model = AI_MODELS.PAGE_BUILDER.PRIMARY,
  fallbacks = AI_MODELS.PAGE_BUILDER.FALLBACKS,
  temperature = 0.5,
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
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `[OpenRouter] Model ${currentModel} returned HTTP ${response.status}: ${errorText}`
        );
        lastError = new Error(`OpenRouter (${currentModel}) HTTP ${response.status}: ${errorText}`);
        continue; // Try next fallback model
      }

      const jsonResponse = await response.json();
      const rawContent = jsonResponse.choices?.[0]?.message?.content;

      if (!rawContent || !rawContent.trim()) {
        console.warn(`[OpenRouter] Model ${currentModel} returned empty content.`);
        lastError = new Error(`Model ${currentModel} returned empty content.`);
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
      lastError = new Error(`Model ${currentModel}: ${err.message}`);
    }
  }

  throw new Error(
    `All OpenRouter models failed. Last error: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Sanitizes, repairs, and parses valid JSON from raw LLM responses.
 * Employs multiple robust repair strategies for malformed LLM outputs.
 */
function extractAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty or invalid LLM response content.");
  }

  let cleaned = rawText.trim();

  // 1. Strip markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/g, "").trim();

  // 2. Locate the outermost JSON object braces { ... }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error(`No JSON object found in response (received: "${cleaned.slice(0, 100)}")`);
  }

  cleaned = cleaned.slice(firstBrace, lastBrace + 1);

  // Strategy 1: Native standard JSON parse
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    // Proceed to repair strategies
  }

  // Strategy 2: Remove trailing commas & control chars
  let repaired = cleaned
    .replace(/,\s*([}\]])/g, "$1") // trailing commas before } or ]
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, ""); // control characters

  try {
    return JSON.parse(repaired);
  } catch (e2) {
    // Proceed
  }

  // Strategy 3: Fix missing commas between array items, objects, or key-value pairs
  repaired = repaired
    .replace(/}\s*([{\[])/g, "},$1")
    .replace(/]\s*([{\[])/g, "],$1")
    .replace(/"\s*\n\s*"/g, '",\n"')
    .replace(/(\d+|true|false|null)\s*\n\s*"/g, '$1,\n"');

  try {
    return JSON.parse(repaired);
  } catch (e3) {
    // Proceed
  }

  // Strategy 4: Handle unescaped newlines inside strings
  repaired = repaired.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, "\\n");

  try {
    return JSON.parse(repaired);
  } catch (e4) {
    // Proceed
  }

  // Strategy 5: Fix unclosed strings/brackets if truncated
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "{") openBraces++;
      else if (ch === "}") openBraces--;
      else if (ch === "[") openBrackets++;
      else if (ch === "]") openBrackets--;
    }
  }

  if (inString) repaired += '"';
  while (openBrackets > 0) {
    repaired += "]";
    openBrackets--;
  }
  while (openBraces > 0) {
    repaired += "}";
    openBraces--;
  }

  try {
    return JSON.parse(repaired);
  } catch (e5) {
    throw new Error(`Failed to parse JSON: ${e5.message}`);
  }
}
