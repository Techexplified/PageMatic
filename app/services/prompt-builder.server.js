import { STYLE_THEME_TOKENS } from "../libs/ai-config";

/**
 * Builds rich, conversion-optimized system and user prompts using real store catalog & profile data.
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

  const storeBrandName = shopInfo.name || "Snowboard Store";
  const currentYear = new Date().getFullYear();

  // Tightly constrained, store-grounded System Prompt
  const systemPrompt = `You are an elite Shopify conversion rate optimization architect.
Your job is to generate a comprehensive, high-converting 5 to 7 section Shopify page in strict JSON format for the merchant's store brand "${storeBrandName}".

### CRITICAL BRANDING & CURRENT YEAR RULES:
- The store's BRAND NAME is "${storeBrandName}".
- NEVER use the word "PageMatic" or "Pagematic" in any section titles, headlines, copy, badges, benefits, or footer copyright! (PageMatic is the builder tool, NOT the merchant's brand).
- In HEADER: "brandName" MUST be "${storeBrandName}".
- In FOOTER: "copyright" MUST be "© ${currentYear} ${storeBrandName}. All rights reserved." (Current year is ${currentYear}).
- In BENEFITS: "heading" MUST be about "${storeBrandName}" (e.g. "Why Choose ${storeBrandName}", "The ${storeBrandName} Difference", or "Engineered for Peak Performance").

### PAGE STRUCTURE REQUIREMENTS:
A complete, high-converting ${pageType} page MUST contain between 5 and 7 rich sections in this logical flow:
1. **HEADER**: { "brandName": "${storeBrandName}", "navLinks": string[], "ctaText": string }
2. **HERO**: { "headline": string, "subheadline": string, "badge": string, "ctaPrimary": string, "ctaSecondary": string, "imageUrl": string }
   - *CRITICAL*: "imageUrl" MUST be one of the real Image URLs from the STORE CATALOG PRODUCTS below.
3. **PRODUCT_DETAILS**: { "title": string, "price": string, "description": string, "features": string[] }
   - Spotlight one of the store's real products with its actual price, description, and key features.
4. **BENEFITS**: { "heading": string, "subtitle": string, "items": [{ "title": string, "description": string }] }
   - Highlight 3 key craftsmanship, performance, or quality benefits of the store's products.
5. **FAQ**: { "heading": string, "items": [{ "question": string, "answer": string }] }
   - 3 to 4 helpful questions and answers grounded in the store's products and shipping.
6. **FOOTER**: { "copyright": "© ${currentYear} ${storeBrandName}. All rights reserved.", "policyLinks": string[] }

### STRICT DATA GROUNDING:
- **ZERO HALLUCINATION:** Ground every headline, price, and feature strictly in the store's actual catalog products (${storeProducts.map((p) => p.title).join(", ") || "store catalog"}).
- **STYLE PRESETS:**
  - "minimal": Modern, clean, generous whitespace, sans-serif typography.
  - "bold": High-contrast, dark mode accents, punchy badges, bold statement typography.
  - "editorial": Sophisticated, narrative storytelling, elegant serif typography.

### OUTPUT JSON SCHEMA:
Return a single JSON object with:
- "title": string (Page title)
- "seoDescription": string (Accurate 150-160 char meta description)
- "themeTokens": CSS variables dictionary
- "sections": Array of 5-7 section objects ({ "type": string, "data": object })

### CRITICAL:
Return ONLY the raw JSON object. Do not include markdown code block tags or conversational text.`;

  // If no product explicitly selected, auto-target the store's primary product from the catalog
  let targetProduct = selectedProduct;
  if (!targetProduct && storeProducts.length > 0) {
    const firstP = storeProducts[0];
    targetProduct = {
      title: firstP.title,
      price: `${firstP.priceRangeV2?.minVariantPrice?.amount || ""} ${firstP.priceRangeV2?.minVariantPrice?.currencyCode || ""}`.trim(),
      description: firstP.description || "High performance gear crafted for the slopes.",
      imageUrl: firstP.featuredImage?.url || "",
    };
  }

  // Build Comprehensive Real Store Context
  let storeDump = `=== REAL STORE DATA & INGESTED CONTEXT ===
Store Brand Name: ${storeBrandName}
Domain: ${shopInfo.myshopifyDomain || ""}
Currency: ${shopInfo.currencyCode || "USD"}
Niche: ${niche || "Snowboarding & Winter Sports"}`;

  if (promptText && promptText.trim()) {
    storeDump += `\n\nMERCHANT CUSTOM INSTRUCTIONS (PRIORITIZE THESE):
"${promptText.trim()}"`;
  }

  if (targetProduct && targetProduct.title) {
    storeDump += `\n\nFEATURED SPOTLIGHT PRODUCT (USE THIS EXACT PRODUCT FOR PRODUCT_DETAILS SECTION):
- Title: ${targetProduct.title}
- Price: ${targetProduct.price || "See store"}
- Description: ${targetProduct.description || "N/A"}
- Image URL: ${targetProduct.imageUrl || "N/A"}`;
  }

  // Include store catalog products with real Shopify images
  if (storeProducts && storeProducts.length > 0) {
    const prodsList = storeProducts
      .slice(0, 10)
      .map(
        (p) =>
          `• Product: "${p.title}" | Price: ${p.priceRangeV2?.minVariantPrice?.amount || ""} ${p.priceRangeV2?.minVariantPrice?.currencyCode || ""} | Image URL: "${p.featuredImage?.url || ""}" | Description: ${p.description || "Premium quality item"}`
      )
      .join("\n");
    storeDump += `\n\nSTORE CATALOG PRODUCTS (ALL HEADLINES, HERO, AND DETAILS MUST FEATURE THESE PRODUCTS):\n${prodsList}`;
  }

  // Include store collections
  if (storeCollections && storeCollections.length > 0) {
    const colList = storeCollections
      .map((c) => `• Collection: "${c.title}"`)
      .join("\n");
    storeDump += `\n\nSTORE COLLECTIONS:\n${colList}`;
  }

  // Include store legal policies
  if (storePolicies && storePolicies.length > 0) {
    const polList = storePolicies
      .map((p) => `• Policy: ${p.title || p.type}: ${p.body ? p.body.slice(0, 300) : "Available"}`)
      .join("\n");
    storeDump += `\n\nSTORE LEGAL POLICIES (GROUND FAQ IN THESE):\n${polList}`;
  }

  const userPrompt = `Synthesize a comprehensive, high-converting 5 to 7 section ${pageType} page for "${pageTitle}".
CRITICAL:
1. Ground all content strictly in the merchant's real store catalog (${storeProducts.map((p) => p.title).join(", ") || "store products"}).
2. Use "${storeBrandName}" as the brand name (NEVER use "PageMatic" or "Pagematic").
3. Use ${currentYear} in the footer copyright.

${storeDump}

DEFAULT THEME TOKENS:
${JSON.stringify(themeTokens, null, 2)}

Ensure you include HEADER, HERO (with a real product Image URL from above), PRODUCT_DETAILS (using the featured spotlight product), BENEFITS, FAQ, and FOOTER. Return valid raw JSON only.`;

  return {
    systemPrompt,
    userPrompt,
  };
}
