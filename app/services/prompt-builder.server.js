import { STYLE_THEME_TOKENS } from "../libs/ai-config";

/**
 * Builds dynamic, store-grounded system and user prompts using real store catalog & profile data.
 */
export function buildPageGenerationPrompt({
  pageType = "LANDING",
  stylePreset = "minimal",
  pageTitle = "New Page",
  niche = "General E-commerce",
  promptText = "",
  selectedProduct = null,
  selectedPolicies = [],
  storeContext = null,
}) {
  const themeTokens = STYLE_THEME_TOKENS[stylePreset] || STYLE_THEME_TOKENS.minimal;

  const shopInfo = storeContext?.shop || {};
  const storeProducts = storeContext?.products || [];
  const storeCollections = storeContext?.collections || [];
  const storePolicies = storeContext?.policies || [];

  // Tightly constrained, store-grounded System Prompt
  const systemPrompt = `You are PageMatic AI, an expert Shopify page architect.
Your job is to generate a custom, high-converting Shopify page structure in strict JSON format using ONLY the merchant's real store context and instructions.

### DYNAMIC SECTION COMPOSITION (STRICT GROUNDING):
1. **NO FAKE OR FABRICATED CONTENT:** Do NOT invent fictional customer reviews, fake quotes, non-existent statistics (e.g. "10,000+ happy customers"), or claims that are not in the store data or instructions.
2. **FREE SECTION SELECTION:** You have full creative freedom to choose the best combination of sections to highlight the store's actual products, policies, and value propositions. You do NOT have to force sections if data doesn't exist (for example, if there are no customer reviews, skip TESTIMONIALS and instead use BENEFITS, PRODUCT_DETAILS, or FAQ).
3. **AVAILABLE SECTION TYPES & SCHEMAS:**
   - **HEADER**: { "brandName": string, "navLinks": string[], "ctaText": string }
   - **HERO**: { "headline": string, "subheadline": string, "badge"?: string, "ctaPrimary": string, "ctaSecondary"?: string, "imageUrl"?: string }
   - **PRODUCT_DETAILS**: { "title": string, "price": string, "description": string, "features": string[] }
   - **BENEFITS**: { "heading": string, "subtitle"?: string, "items": [{ "title": string, "description": string }] }
   - **TESTIMONIALS**: ONLY use if merchant provides reviews in custom instructions: { "heading": string, "items": [{ "name": string, "comment": string, "rating": 5 }] }
   - **FAQ**: { "heading": string, "items": [{ "question": string, "answer": string }] }
   - **FOOTER**: { "copyright": string, "policyLinks": string[] }

4. **STYLE PRESETS:**
   - "minimal": Modern, clean, generous whitespace, sans-serif typography.
   - "bold": High-contrast, dark mode accents, punchy badges, bold statement typography.
   - "editorial": Sophisticated, narrative storytelling, elegant serif typography.

### OUTPUT JSON SCHEMA:
Return a single JSON object with:
- "title": string (Page title)
- "seoDescription": string (Meta description based on store)
- "themeTokens": CSS variables dictionary
- "sections": Array of chosen section objects ({ "type": string, "data": object })

### CRITICAL:
Return ONLY the raw JSON object. Do not include markdown code block tags or conversational text.`;

  // Build Comprehensive Real Store Context
  let storeDump = `=== REAL STORE DATA & INGESTED CONTEXT ===
Store Name: ${shopInfo.name || "Shopify Store"}
Domain: ${shopInfo.myshopifyDomain || ""}
Currency: ${shopInfo.currencyCode || "USD"}
Store Description: ${shopInfo.description || "N/A"}
Niche: ${niche || "General E-commerce"}`;

  if (promptText && promptText.trim()) {
    storeDump += `\n\nMERCHANT CUSTOM INSTRUCTIONS (PRIORITIZE THESE):
"${promptText.trim()}"`;
  }

  if (selectedProduct && selectedProduct.title) {
    storeDump += `\n\nTARGET SELECTED PRODUCT:
- Title: ${selectedProduct.title}
- Price: ${selectedProduct.price || "See store"}
- Description: ${selectedProduct.description || "N/A"}
- Image URL: ${selectedProduct.imageUrl || "N/A"}`;
  }

  // Include store catalog products with real Shopify images
  if (storeProducts && storeProducts.length > 0) {
    const prodsList = storeProducts
      .slice(0, 8)
      .map(
        (p) =>
          `• Product: "${p.title}" | Price: ${p.priceRangeV2?.minVariantPrice?.amount || ""} ${p.priceRangeV2?.minVariantPrice?.currencyCode || ""} | Image URL: "${p.featuredImage?.url || ""}" | Description: ${p.description || "Top rated item"}`
      )
      .join("\n");
    storeDump += `\n\nSTORE CATALOG PRODUCTS (USE THESE EXACT PRODUCTS AND IMAGES):\n${prodsList}`;
  }

  // Include store collections
  if (storeCollections && storeCollections.length > 0) {
    const colList = storeCollections
      .map((c) => `• ${c.title} (${c.productsCount?.count || 0} products)`)
      .join("\n");
    storeDump += `\n\nSTORE COLLECTIONS:\n${colList}`;
  }

  // Include store legal policies
  if (storePolicies && storePolicies.length > 0) {
    const polList = storePolicies
      .map((p) => `• ${p.title || p.type}: ${p.body ? p.body.slice(0, 300) : "Available"}`)
      .join("\n");
    storeDump += `\n\nSTORE LEGAL POLICIES:\n${polList}`;
  }

  const userPrompt = `Synthesize a high-converting ${pageType} page for "${pageTitle}" using ONLY the real store data and merchant instructions below.

${storeDump}

DEFAULT THEME TOKENS:
${JSON.stringify(themeTokens, null, 2)}

Select the most compelling sections to present this store's real products, collections, and policies. Return valid raw JSON only.`;

  return {
    systemPrompt,
    userPrompt,
  };
}
