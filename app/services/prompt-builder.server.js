import { STYLE_THEME_TOKENS } from "../libs/ai-config";

/**
 * Builds high-converting system and user prompts for OpenRouter page generation.
 */
export function buildPageGenerationPrompt({
  pageType = "LANDING",
  stylePreset = "minimal",
  pageTitle = "New Page",
  niche = "General E-commerce",
  promptText = "",
  selectedProduct = null,
  selectedPolicies = [],
  availablePolicies = [],
}) {
  const themeTokens = STYLE_THEME_TOKENS[stylePreset] || STYLE_THEME_TOKENS.minimal;

  // System Prompt
  const systemPrompt = `You are PageMatic AI, a world-class e-commerce landing page architect and conversion copywriter.
Your job is to generate a complete, high-converting, production-ready Shopify page structure in strict JSON format.

### CORE REQUIREMENTS:
1. **Never use placeholder text like "Lorem ipsum" or "Add text here".** Write real, highly engaging, persuasive sales copy specifically tailored to the niche and merchant instructions.
2. **Style Preset Alignment:**
   - "minimal": Modern, airy, clean, generous whitespace, tech/lifestyle vibe, sans-serif.
   - "bold": High-contrast, dark mode accents, vibrant punchy badges, bold statement typography.
   - "editorial": Sophisticated, narrative-driven storytelling, elegant serif accents, luxury feel.
3. **Structured Section Output:** Return a JSON object with:
   - "title": string (SEO-optimized page title)
   - "seoDescription": string (150-160 char meta description)
   - "themeTokens": CSS variable map matching the style preset
   - "sections": Array of section objects. Each section MUST have:
     - "type": (e.g. "HEADER", "HERO", "PRODUCT_DETAILS", "BENEFITS", "TESTIMONIALS", "FAQ", "FOOTER")
     - "data": Section-specific properties

### SECTION BLUEPRINT BY PAGE TYPE:
- **PRODUCT Page**:
  1. HEADER: { brandName, navLinks, ctaText }
  2. HERO: { headline, subheadline, badge, ctaPrimary, ctaSecondary, imageUrl }
  3. PRODUCT_DETAILS: { title, price, description, features: string[], guaranteeBadge }
  4. BENEFITS: { heading, subtitle, items: [{ title, description, iconName }] }
  5. TESTIMONIALS: { heading, subtitle, items: [{ name, rating: 5, comment, verified: true }] }
  6. FAQ: { heading, subtitle, items: [{ question, answer }] }
  7. FOOTER: { copyright, policyLinks: string[], socialLinks: string[] }

- **LANDING Page**:
  1. HEADER, 2. HERO, 3. BENEFITS / FEATURES, 4. TESTIMONIALS / SOCIAL_PROOF, 5. FAQ, 6. FOOTER.

- **HOME Page**:
  1. HEADER, 2. HERO, 3. BENEFITS, 4. FEATURED_PRODUCT / HIGHLIGHT, 5. TESTIMONIALS, 6. NEWSLETTER_CTA, 7. FOOTER.

- **FAQ Page**:
  1. HEADER, 2. HERO (Clear FAQ search/title header), 3. FAQ (Comprehensive categorized questions based on policies or common customer inquiries), 4. CONTACT_SUPPORT (Help box), 5. FOOTER.

### CRITICAL:
Return ONLY the raw JSON object. Do not include markdown code block tags or any conversational text.`;

  // Context Ingestion for User Prompt
  let contextBlock = `PAGE DETAILS:
- Page Type: ${pageType}
- Style Preset: ${stylePreset}
- Working Title: ${pageTitle}
- Niche / Industry: ${niche || "General E-commerce"}`;

  if (promptText && promptText.trim()) {
    contextBlock += `\n\nMERCHANT INSTRUCTIONS & CUSTOM DIRECTIONS:
"${promptText.trim()}"`;
  }

  if (selectedProduct && selectedProduct.title) {
    contextBlock += `\n\nFEATURED PRODUCT CONTEXT:
- Title: ${selectedProduct.title}
- Price: ${selectedProduct.price || "Check store"}
- Description: ${selectedProduct.description ? selectedProduct.description.slice(0, 800) : "N/A"}
- Product Image: ${selectedProduct.imageUrl || "N/A"}`;
  }

  if (selectedPolicies && selectedPolicies.length > 0) {
    const policyDetails = selectedPolicies
      .map((policyKey) => {
        const found = availablePolicies?.find((p) => p.key === policyKey);
        if (found && found.body) {
          return `- ${found.title}: ${found.body.slice(0, 500)}`;
        }
        return `- ${policyKey}`;
      })
      .join("\n");

    contextBlock += `\n\nSTORE POLICIES TO INCORPORATE INTO COPY/FAQ:
${policyDetails}`;
  }

  const userPrompt = `Generate the complete page JSON structure for the following page request:

${contextBlock}

DEFAULT THEME TOKENS TO USE:
${JSON.stringify(themeTokens, null, 2)}

Ensure all headlines, descriptions, testimonials, and FAQs are specific to the niche and product details. Return valid JSON only.`;

  return {
    systemPrompt,
    userPrompt,
  };
}
