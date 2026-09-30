import { STYLE_THEME_TOKENS, BUTTON_ACTION_TYPES } from "../libs/ai-config";

/**
 * STEP 1: Strategic Planning Prompt Builder
 * Guides OpenRouter LLM to act as a world-class CRO marketing strategist & copywriter,
 * writing authentic, conversion-engineered copy tailored specifically for the 4 deterministic templates.
 */
export function buildStrategicPlanPrompt({
  pageType = "LANDING",
  stylePreset = "minimal",
  pageTitle = "New Page",
  niche = "General E-commerce",
  promptText = "",
  selectedProduct = null,
  selectedProducts = [],
  selectedCollection = null,
  selectedPolicies = [],
  storeContext = null,
}) {
  const shopInfo = storeContext?.shop || {};
  const storeProducts = storeContext?.products || [];
  const storeCollections = storeContext?.collections || [];
  const storePolicies = storeContext?.policies || [];

  const storeBrandName = shopInfo.name || "Store";
  const currentYear = new Date().getFullYear();

  // 1. Identify collection products if a collection is selected
  let collectionProducts = [];
  if (selectedCollection) {
    if (Array.isArray(selectedCollection.products) && selectedCollection.products.length > 0) {
      collectionProducts = selectedCollection.products;
    } else {
      const match = storeCollections.find(
        (c) => c.id === selectedCollection.id || c.handle === selectedCollection.handle || c.title?.toLowerCase() === selectedCollection.title?.toLowerCase()
      );
      if (match && Array.isArray(match.products) && match.products.length > 0) {
        collectionProducts = match.products;
      }
    }
  }

  // 2. Filter non-gift-card physical products from storeProducts
  const nonGiftCardProducts = storeProducts.filter(
    (p) => !p.title?.toLowerCase().includes("gift card")
  );
  const candidateProducts = nonGiftCardProducts.length > 0 ? nonGiftCardProducts : storeProducts;

  // 3. Resolve targetProduct (prioritize selected product, then collection product, then candidate)
  let targetProduct = selectedProduct;
  if (!targetProduct && collectionProducts.length > 0) {
    targetProduct = collectionProducts[0];
  } else if (!targetProduct && candidateProducts.length > 0) {
    targetProduct = candidateProducts[0];
  }

  // 4. Resolve active products for grid (HOME)
  let activeGridProducts = [];
  if (selectedProducts && selectedProducts.length > 0) {
    activeGridProducts = selectedProducts;
  } else if (collectionProducts.length > 0) {
    activeGridProducts = collectionProducts;
  } else if (candidateProducts.length > 0) {
    activeGridProducts = candidateProducts.slice(0, 4);
  }

  // 1. Format Merchant Custom Directives with Top-Level Priority
  const hasCustomPrompt = Boolean(promptText && promptText.trim().length > 0);
  const merchantDirectives = hasCustomPrompt
    ? `🎯 PRIMARY DIRECTIVE & MERCHANT INSTRUCTIONS:
================================================================================
"${promptText.trim()}"
================================================================================
CRITICAL: The merchant's custom instructions, angles, tone, promotional discounts, and focus areas above MUST be deeply infused into the page's headlines, subheadlines, benefit bullet points, and FAQ items.`
    : `🎯 PRIMARY DIRECTIVE:
Craft a high-converting, authentic, and compelling conversion brief highlighting the brand's unique value propositions, craftsmanship, and products.`;

  // System Prompt for Strategic Copywriting
  const systemPrompt = `You are an elite E-commerce Conversion Rate Optimization (CRO) strategist and master brand copywriter.
Your task is to generate a comprehensive, highly persuasive marketing copy brief and dynamic brand color palette for a "${pageType}" page for the brand "${storeBrandName}".

### CRITICAL RULES:
1. **OBEY MERCHANT DIRECTIVES:** The merchant's custom instructions, angles, discounts, tone, and focus points are YOUR HIGHEST PRIORITY. You MUST weave them directly into the headlines, value props, callouts, and design palette.
2. **GROUND TRUTH ONLY:** Ground all product specs, materials, and features strictly in the merchant's real store catalog products and policies provided below.
3. **NO FAKE PRODUCTS:** Do NOT invent unrelated products (e.g. if the store sells snowboards, write about snowboards, flex rating, camber, edges, and mountain riding).
4. **BRAND IDENTITY:** The brand name is "${storeBrandName}". NEVER use the word "PageMatic" or "Pagematic" in any copy.
5. **NO INPUT FIELDS OR FORMS:** NEVER generate email capture boxes, text inputs, or forms. All conversion actions MUST be actionable buttons (links, cart actions, or scroll anchors).
6. **DYNAMIC BRAND COLOR PALETTE (\`themeTokens\`):** Choose an exquisite, harmonious, and conversion-optimized CSS color palette that harmonizes with the brand niche ("${niche}"), products, selected style preset ("${stylePreset}"), and ANY merchant color directives.
   - **Contrast & Legibility:** ALWAYS maintain high visual contrast (dark text on light backgrounds or light text on dark backgrounds). NEVER use low-contrast text.
   - **Merchant Color Directives:** Strictly honor any color preferences, prohibitions, or brand rules in the merchant instructions (e.g. if the merchant forbids red and black, select fresh compliant colors like emerald green, royal blue, slate, and clean white).
7. **CURRENT YEAR:** Use ${currentYear} in copyright notices.
8. **OUTPUT FORMAT:** Return ONLY a valid JSON object matching the requested template schema. Do not include markdown backticks or conversational text.`;

  // Build Comprehensive Real Store Context
  let storeDump = `=== REAL STORE CATALOG & INGESTED CONTEXT ===
Store Brand Name: ${storeBrandName}
Domain: ${shopInfo.myshopifyDomain || ""}
Currency: ${shopInfo.currencyCode || "USD"}
Contact Email: ${shopInfo.email || `support@${shopInfo.myshopifyDomain || "store.com"}`}
Niche: ${niche || "General E-commerce"}`;

  if (hasCustomPrompt) {
    storeDump += `\n\nMERCHANT CUSTOM INSTRUCTIONS (PRIORITIZE THESE):
"${promptText.trim()}"`;
  }

  if (targetProduct && targetProduct.title) {
    storeDump += `\n\nPRIMARY FEATURED / ANCHOR PRODUCT:
- Title: ${targetProduct.title}
- Price: ${targetProduct.price || "$149.00"}
- Description: ${targetProduct.description || "High-performance craftsmanship."}`;
  }

  if (storeProducts && storeProducts.length > 0) {
    const prodsList = storeProducts
      .slice(0, 8)
      .map((p) => `• "${p.title}" | Price: ${p.price || "$99"} | Description: ${p.description ? p.description.slice(0, 140) : "Premium product"}`)
      .join("\n");
    storeDump += `\n\nSTORE CATALOG PRODUCTS:\n${prodsList}`;
  }

  if (selectedCollection && selectedCollection.title) {
    storeDump += `\n\nFEATURED HOMEPAGE COLLECTION:
- Title: "${selectedCollection.title}"
- Handle: "${selectedCollection.handle || "all"}"`;
  }

  if (storeCollections && storeCollections.length > 0) {
    const colList = storeCollections.map((c) => `• Collection: "${c.title}"`).join("\n");
    storeDump += `\n\nSTORE COLLECTIONS:\n${colList}`;
  }

  if (storePolicies && storePolicies.length > 0) {
    const polList = storePolicies
      .map((p) => `• Policy (${p.type || p.title}): ${p.body ? p.body.slice(0, 250) : "Standard store policy"}`)
      .join("\n");
    storeDump += `\n\nSTORE LEGAL POLICIES:\n${polList}`;
  }

  // Define Template-Specific Output Schemas
  let templateSpecificInstructions = "";

  if (pageType === "PRODUCT") {
    templateSpecificInstructions = `### REQUIRED OUTPUT JSON SCHEMA FOR "PRODUCT" PAGE:
{
  "seoTitle": string (Compelling product page title),
  "seoDescription": string (150-160 char meta description),
  "themeTokens": {
    "--pm-primary": string (Hex code for primary CTA buttons and highlights, e.g. "#2563EB"),
    "--pm-accent": string (Hex code for secondary accents/hover, e.g. "#1D4ED8"),
    "--pm-bg": string (Hex code for main page background, e.g. "#FFFFFF"),
    "--pm-surface": string (Hex code for card and section surfaces, e.g. "#F8FAFC"),
    "--pm-text-heading": string (Hex code for main headings with maximum contrast, e.g. "#0F172A"),
    "--pm-text-body": string (Hex code for body text with high readability, e.g. "#475569")
  },
  "announcementBar": {
    "text": string (e.g. "Free Worldwide Express Shipping on Orders Over $50 • 30-Day Risk-Free Trial"),
    "badge": "LIMITED OFFER"
  },
  "hero": {
    "headline": string (Punchy product hook emphasizing peak performance/results),
    "subheadline": string (2-sentence value proposition explaining key benefit),
    "badge": string (e.g. "2026 Collection" or "Best Seller"),
    "trustBadges": string[] (3 short badges e.g. ["Free Express Shipping", "30-Day Money Back", "Lifetime Warranty"])
  },
  "socialProof": {
    "heading": string (e.g. "Trusted by Over 10,000+ Enthusiasts & Pro Athletes"),
    "logos": ["VOGUE", "WIRED", "FORBES", "GQ", "OUTSIDE"]
  },
  "benefits": {
    "heading": string (e.g. "Why Choose ${targetProduct?.title || "Our Gear"}"),
    "subtitle": string (1-sentence overview),
    "items": [
      { "title": string, "description": string },
      { "title": string, "description": string },
      { "title": string, "description": string }
    ]
  },
  "featureSpotlight": {
    "heading": string (e.g. "Engineered Down to the Microscopic Detail"),
    "subtitle": string (Breakdown of materials, flex, or technology),
    "rows": [
      { "title": string, "description": string, "badge": "PRECISION CRAFTED" },
      { "title": string, "description": string, "badge": "ALL-TERRAIN PROVEN" }
    ]
  },
  "testimonials": {
    "heading": string (e.g. "Real Feedback From Real Riders"),
    "subtitle": string,
    "items": [
      { "name": string, "rating": 5, "comment": string, "badge": "Verified Buyer" },
      { "name": string, "rating": 5, "comment": string, "badge": "Verified Buyer" },
      { "name": string, "rating": 5, "comment": string, "badge": "Verified Buyer" }
    ]
  },
  "faq": {
    "heading": string (e.g. "Frequently Asked Questions"),
    "items": [
      { "question": string, "answer": string },
      { "question": string, "answer": string },
      { "question": string, "answer": string },
      { "question": string, "answer": string }
    ]
  }
}`;
  } else if (pageType === "LANDING") {
    templateSpecificInstructions = `### REQUIRED OUTPUT JSON SCHEMA FOR "LANDING" PAGE:
{
  "seoTitle": string,
  "seoDescription": string,
  "themeTokens": {
    "--pm-primary": string (Hex code for primary CTA buttons and highlights, e.g. "#2563EB"),
    "--pm-accent": string (Hex code for secondary accents/hover, e.g. "#1D4ED8"),
    "--pm-bg": string (Hex code for main page background, e.g. "#FFFFFF"),
    "--pm-surface": string (Hex code for card and section surfaces, e.g. "#F8FAFC"),
    "--pm-text-heading": string (Hex code for main headings with maximum contrast, e.g. "#0F172A"),
    "--pm-text-body": string (Hex code for body text with high readability, e.g. "#475569")
  },
  "promoBanner": {
    "heading": string (e.g. "EXCLUSIVE SEASON SALE: 20% OFF TODAY"),
    "countdownText": "Offer expires at midnight",
    "code": "SAVE20"
  },
  "hero": {
    "headline": string (High-urgency, conversion-driven headline),
    "subheadline": string (Explains problem and immediate solution),
    "badge": string (e.g. "Special Limited-Time Promotion"),
    "ctaText": string (e.g. "Claim Your 20% Discount")
  },
  "trustBadges": {
    "items": [
      { "title": "30-Day Trial", "description": "100% risk-free return guarantee" },
      { "title": "Fast 24H Dispatch", "description": "Free carbon-neutral shipping" },
      { "title": "2-Year Warranty", "description": "Crafted to withstand peak intensity" }
    ]
  },
  "productShowcase": {
    "title": "${targetProduct?.title || "Featured Product"}",
    "price": "${targetProduct?.price || "$149.00"}",
    "description": string (Persuasive product summary),
    "features": string[] (3-4 bullet points)
  },
  "comparisonTable": {
    "heading": string (e.g. "Why We Beat Traditional Alternatives"),
    "ourBrand": "${storeBrandName}",
    "competitorName": "Standard Alternatives",
    "rows": [
      { "feature": "Racing-Grade Core Materials", "us": "Yes - 100% Premium", "them": "Generic Composite" },
      { "feature": "30-Day In-Field Trial", "us": "Included", "them": "No Returns if Used" },
      { "feature": "Durability Rating", "us": "Extreme (5/5)", "them": "Moderate (3/5)" },
      { "feature": "Direct Customer Support", "us": "24/7 Dedicated", "them": "Automated Bot Only" }
    ]
  },
  "testimonials": {
    "heading": "What Early Adopters Are Saying",
    "subtitle": "Real before-and-after results",
    "items": [
      { "name": string, "rating": 5, "comment": string, "badge": "Verified Buyer" },
      { "name": string, "rating": 5, "comment": string, "badge": "Verified Buyer" },
      { "name": string, "rating": 5, "comment": string, "badge": "Verified Buyer" }
    ]
  },
  "faq": {
    "heading": "Campaign Terms & FAQ",
    "items": [
      { "question": string, "answer": string },
      { "question": string, "answer": string },
      { "question": string, "answer": string }
    ]
  },
  "finalCta": {
    "heading": string (High impact closing call to action),
    "subheading": string,
    "ctaText": string (e.g. "Claim Offer Now")
  }
}`;
  } else if (pageType === "HOME") {
    templateSpecificInstructions = `### REQUIRED OUTPUT JSON SCHEMA FOR "HOME" PAGE:
{
  "seoTitle": string,
  "seoDescription": string,
  "themeTokens": {
    "--pm-primary": string (Hex code for primary CTA buttons and highlights, e.g. "#2563EB"),
    "--pm-accent": string (Hex code for secondary accents/hover, e.g. "#1D4ED8"),
    "--pm-bg": string (Hex code for main page background, e.g. "#FFFFFF"),
    "--pm-surface": string (Hex code for card and section surfaces, e.g. "#F8FAFC"),
    "--pm-text-heading": string (Hex code for main headings with maximum contrast, e.g. "#0F172A"),
    "--pm-text-body": string (Hex code for body text with high readability, e.g. "#475569")
  },
  "hero": {
    "headline": string (Welcoming, bold brand mission headline),
    "subheadline": string (Engaging 2-sentence brand ethos),
    "badge": "2026 Collection",
    "ctaText": "Explore Collection"
  },
  "collectionList": {
    "heading": "Shop By Category",
    "categories": [
      { "title": "Best Sellers", "description": "Our most wanted performance gear" },
      { "title": "New Arrivals", "description": "Fresh releases for the season" },
      { "title": "Accessories & Care", "description": "Essential tuning and protection" }
    ]
  },
  "featuredGrid": {
    "heading": "Featured Best Sellers",
    "subtitle": "Handpicked favorites engineered for peak performance"
  },
  "brandStory": {
    "heading": "Crafted For Riders, By Riders",
    "storyQuote": string (Inspiring founder quote about why the brand was created),
    "founderName": "Founder & Design Lead",
    "bodyText": string (2 paragraphs describing craftsmanship, sustainability, and quality standards)
  },
  "testimonials": {
    "heading": "Community Praise",
    "subtitle": "Join over 10,000+ satisfied customers",
    "items": [
      { "name": string, "rating": 5, "comment": string, "badge": "Verified Buyer" },
      { "name": string, "rating": 5, "comment": string, "badge": "Verified Buyer" },
      { "name": string, "rating": 5, "comment": string, "badge": "Verified Buyer" }
    ]
  },
  "finalCta": {
    "heading": string (e.g. "Ready to Upgrade Your Experience?"),
    "subheading": string (e.g. "Explore our latest arrivals and enjoy free worldwide express shipping on orders over $50."),
    "ctaText": string (e.g. "Explore All Collections")
  }
}`;
  } else if (pageType === "FAQ") {
    templateSpecificInstructions = `### REQUIRED OUTPUT JSON SCHEMA FOR "FAQ" PAGE:
{
  "seoTitle": string,
  "seoDescription": string,
  "themeTokens": {
    "--pm-primary": string (Hex code for primary CTA buttons and highlights, e.g. "#2563EB"),
    "--pm-accent": string (Hex code for secondary accents/hover, e.g. "#1D4ED8"),
    "--pm-bg": string (Hex code for main page background, e.g. "#FFFFFF"),
    "--pm-surface": string (Hex code for card and section surfaces, e.g. "#F8FAFC"),
    "--pm-text-heading": string (Hex code for main headings with maximum contrast, e.g. "#0F172A"),
    "--pm-text-body": string (Hex code for body text with high readability, e.g. "#475569")
  },
  "pageHeader": {
    "title": "Help Center & FAQ",
    "subtitle": "Instant answers regarding shipping times, returns, warranty, and product care."
  },
  "quickHelp": {
    "cards": [
      { "title": "Track Your Order", "description": "Real-time courier updates & dispatch info" },
      { "title": "Hassle-Free Returns", "description": "Initiate a 30-day exchange or refund" },
      { "title": "Direct Support", "description": "Our team responds in under 2 hours" }
    ]
  },
  "shippingFaq": {
    "groupTitle": "Shipping & Delivery",
    "items": [
      { "question": "How long does shipping take?", "answer": string (Grounded in shipping policy: 24h dispatch, 3-5 business days) },
      { "question": "Do you ship internationally?", "answer": string },
      { "question": "How do I track my package?", "answer": string }
    ]
  },
  "returnsFaq": {
    "groupTitle": "Returns & Warranty",
    "items": [
      { "question": "What is your return policy?", "answer": string (Grounded in refund policy: 30-day trial/unworn returns) },
      { "question": "How do I exchange an item?", "answer": string },
      { "question": "What is covered under warranty?", "answer": string }
    ]
  },
  "generalFaq": {
    "groupTitle": "Product Care & General Inquiries",
    "items": [
      { "question": "How do I care for my gear?", "answer": string },
      { "question": "Are your materials sustainably sourced?", "answer": string }
    ]
  },
  "contactSupport": {
    "heading": "Still need assistance?",
    "subtitle": "Our customer care team is available 7 days a week.",
    "buttonText": "Contact Support"
  }
}`;
  }

  const userPrompt = `Synthesize a comprehensive, high-converting CRO marketing brief for "${pageTitle}".

${merchantDirectives}

${storeDump}

${templateSpecificInstructions}

REMINDER: Strictly execute the merchant's directives while grounding product specs in the store catalog above. Return valid raw JSON only.`;

  return {
    systemPrompt,
    userPrompt,
    targetProduct,
    activeGridProducts,
  };
}

/**
 * STEP 2: Deterministic Layout & Schema Assembler
 * Strictly maps the strategic copywriting plan into the 4 deterministic PageMatic templates.
 * Binds real Shopify CDN images, variant IDs, typed button actions, and handles fallbacks with 100% syntax reliability.
 */
export function assemblePageFromPlan({
  planJson,
  pageType = "LANDING",
  stylePreset = "minimal",
  pageTitle = "New Page",
  targetProduct = null,
  activeGridProducts = [],
  selectedCollection = null,
  storeProducts = [],
  storeCollections = [],
  shopInfo = {},
}) {
  const fallbackTokens = STYLE_THEME_TOKENS[stylePreset] || STYLE_THEME_TOKENS.minimal;
  const aiTokens = (planJson && typeof planJson.themeTokens === "object" && planJson.themeTokens) ? planJson.themeTokens : {};
  
  // Validate that AI provided actual valid CSS hex colors (#RGB, #RRGGBB, #RRGGBBAA)
  const isValidHex = (val) => typeof val === "string" && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(val.trim());

  const themeTokens = {
    ...fallbackTokens,
    ...(isValidHex(aiTokens["--pm-primary"]) ? { "--pm-primary": aiTokens["--pm-primary"].trim() } : {}),
    ...(isValidHex(aiTokens["--pm-accent"]) ? { "--pm-accent": aiTokens["--pm-accent"].trim() } : {}),
    ...(isValidHex(aiTokens["--pm-bg"]) ? { "--pm-bg": aiTokens["--pm-bg"].trim() } : {}),
    ...(isValidHex(aiTokens["--pm-surface"]) ? { "--pm-surface": aiTokens["--pm-surface"].trim() } : {}),
    ...(isValidHex(aiTokens["--pm-text-heading"]) ? { "--pm-text-heading": aiTokens["--pm-text-heading"].trim() } : {}),
    ...(isValidHex(aiTokens["--pm-text-body"]) ? { "--pm-text-body": aiTokens["--pm-text-body"].trim() } : {}),
    ...(typeof aiTokens["--pm-radius"] === "string" && aiTokens["--pm-radius"].trim() ? { "--pm-radius": aiTokens["--pm-radius"].trim() } : {}),
    ...(typeof aiTokens["--pm-font-heading"] === "string" && aiTokens["--pm-font-heading"].trim() ? { "--pm-font-heading": aiTokens["--pm-font-heading"].trim() } : {}),
  };
  const plan = planJson || {};
  const sections = [];
  const now = Date.now();

  const brandName = shopInfo.name || "Store";
  const contactEmail = shopInfo.email || `support@${shopInfo.myshopifyDomain || "store.com"}`;
  const contactUrl = "/pages/contact";

  // Non-gift-card physical merchandise candidates
  const nonGiftCardProducts = storeProducts.filter(
    (p) => !p.title?.toLowerCase().includes("gift card")
  );
  const candidateProducts = nonGiftCardProducts.length > 0 ? nonGiftCardProducts : storeProducts;

  // Resolve collection products if collection was selected
  let collectionProducts = [];
  if (selectedCollection) {
    if (Array.isArray(selectedCollection.products) && selectedCollection.products.length > 0) {
      collectionProducts = selectedCollection.products;
    } else {
      const match = storeCollections.find(
        (c) => c.id === selectedCollection.id || c.handle === selectedCollection.handle || c.title?.toLowerCase() === selectedCollection.title?.toLowerCase()
      );
      if (match && Array.isArray(match.products) && match.products.length > 0) {
        collectionProducts = match.products;
      }
    }
  }

  // Resolve effective product for hero / anchor
  const effectiveProduct =
    targetProduct ||
    (collectionProducts.length > 0 ? collectionProducts[0] : null) ||
    candidateProducts[0] ||
    storeProducts[0];

  const primaryVariantId = effectiveProduct?.primaryVariantId || effectiveProduct?.variants?.[0]?.id || effectiveProduct?.id || "default_variant";
  const primaryImageUrl = effectiveProduct?.imageUrl || effectiveProduct?.galleryImages?.[0] || candidateProducts[0]?.imageUrl || "";
  const galleryImages = (effectiveProduct?.galleryImages && effectiveProduct.galleryImages.length > 0)
    ? effectiveProduct.galleryImages
    : (primaryImageUrl ? [primaryImageUrl] : []);
  const productPrice = effectiveProduct?.price || "$149.00";
  const productTitle = effectiveProduct?.title || "Signature Performance Gear";

  // ============================================================================
  // TEMPLATE 1: PRODUCT PAGE (8 Deterministic Sections)
  // ============================================================================
  if (pageType === "PRODUCT") {
    // 1. ANNOUNCEMENT BAR
    sections.push({
      id: `sec_announcement_${now}_0`,
      type: "ANNOUNCEMENT_BAR",
      data: {
        text: plan.announcementBar?.text || "Free Worldwide Express Shipping on Orders Over $50 • 30-Day Risk-Free Trial",
        badge: plan.announcementBar?.badge || "LIMITED OFFER",
      },
    });

    // 2. HERO (Split Gallery / Buy Layout)
    sections.push({
      id: `sec_hero_${now}_1`,
      type: "HERO",
      data: {
        headline: plan.hero?.headline || `${productTitle} — Engineered For Peak Performance`,
        subheadline: plan.hero?.subheadline || targetProduct?.description || "Crafted with racing-grade materials for effortless control and maximum durability.",
        badge: plan.hero?.badge || "2026 Collection",
        price: productPrice,
        compareAtPrice: "$189.00",
        imageUrl: primaryImageUrl,
        galleryImages: galleryImages,
        trustBadges: Array.isArray(plan.hero?.trustBadges)
          ? plan.hero.trustBadges
          : ["Free Express Shipping", "30-Day Money Back", "Lifetime Warranty"],
        variantSelector: (targetProduct?.variants || []).slice(0, 4),
        buttonPrimary: {
          label: "Add to Cart",
          actionType: BUTTON_ACTION_TYPES.ADD_TO_CART,
          target: primaryVariantId,
          style: "primary",
        },
        buttonSecondary: {
          label: "Buy It Now",
          actionType: BUTTON_ACTION_TYPES.BUY_NOW,
          target: primaryVariantId,
          style: "secondary",
        },
      },
    });

    // 3. SOCIAL PROOF STRIP
    sections.push({
      id: `sec_social_proof_${now}_2`,
      type: "SOCIAL_PROOF_STRIP",
      data: {
        heading: plan.socialProof?.heading || "Trusted by Over 10,000+ Enthusiasts & Pro Athletes",
        logos: Array.isArray(plan.socialProof?.logos)
          ? plan.socialProof.logos
          : ["VOGUE", "WIRED", "FORBES", "GQ", "OUTSIDE"],
      },
    });

    // 4. BENEFITS GRID (3-Column)
    sections.push({
      id: `sec_benefits_grid_${now}_3`,
      type: "BENEFITS_GRID",
      data: {
        heading: plan.benefits?.heading || `Why Choose ${productTitle}`,
        subtitle: plan.benefits?.subtitle || "Engineered with precision for uncompromised control and longevity.",
        items: Array.isArray(plan.benefits?.items) && plan.benefits.items.length > 0
          ? plan.benefits.items
          : [
              { title: "Precision Control", description: "Engineered edge hold and responsiveness in any conditions." },
              { title: "Racing-Grade Core", description: "Ultra-lightweight core reinforced for high-impact durability." },
              { title: "30-Day In-Field Trial", description: "Test it in real conditions. 100% money back if not satisfied." },
            ],
      },
    });

    // 5. FEATURE SPOTLIGHT (Zig-Zag Specs/Materials)
    sections.push({
      id: `sec_feature_spotlight_${now}_4`,
      type: "FEATURE_SPOTLIGHT",
      data: {
        heading: plan.featureSpotlight?.heading || "Engineered Down to the Microscopic Detail",
        subtitle: plan.featureSpotlight?.subtitle || "Every layer is tested across extreme environments for peak performance.",
        rows: Array.isArray(plan.featureSpotlight?.rows) && plan.featureSpotlight.rows.length > 0
          ? plan.featureSpotlight.rows.map((r, i) => ({
              ...r,
              imageUrl: galleryImages[i % galleryImages.length] || primaryImageUrl,
              reverse: i % 2 === 1,
            }))
          : [
              {
                title: "Triaxial Carbon Matrix",
                description: "Delivers torsional rigidity without added weight, ensuring snap and stability on high-speed runs.",
                badge: "PRECISION CRAFTED",
                imageUrl: galleryImages[0] || primaryImageUrl,
                reverse: false,
              },
              {
                title: "Sintered Ultra-Fast Base",
                description: "High-density molecular structure retains wax longer and glides effortlessly across all snow temperatures.",
                badge: "ALL-TERRAIN PROVEN",
                imageUrl: galleryImages[1] || primaryImageUrl,
                reverse: true,
              },
            ],
      },
    });

    // 6. TESTIMONIALS (3 Cards)
    sections.push({
      id: `sec_testimonials_${now}_5`,
      type: "TESTIMONIALS",
      data: {
        heading: plan.testimonials?.heading || "Real Feedback From Verified Owners",
        subtitle: plan.testimonials?.subtitle || "Discover why riders around the world rate us 4.9/5 stars.",
        items: Array.isArray(plan.testimonials?.items) && plan.testimonials.items.length > 0
          ? plan.testimonials.items
          : [
              { name: "Marcus V.", rating: 5, comment: "The edge control and dampening on choppy snow is unlike anything I've ridden before.", badge: "Verified Buyer" },
              { name: "Elena S.", rating: 5, comment: "Shipped in 24 hours. The build quality and finish are world-class.", badge: "Verified Buyer" },
              { name: "David K.", rating: 5, comment: "Held up during 40+ days on the mountain this season with zero issues. Outstanding!", badge: "Verified Buyer" },
            ],
      },
    });

    // 7. FAQ (Accordion)
    sections.push({
      id: `sec_faq_${now}_6`,
      type: "FAQ",
      data: {
        heading: plan.faq?.heading || "Frequently Asked Questions",
        items: Array.isArray(plan.faq?.items) && plan.faq.items.length > 0
          ? plan.faq.items
          : [
              { question: "How do I choose the right size?", answer: "Check our sizing chart or consult our 24/7 fitting experts for personalized advice." },
              { question: "How long does delivery take?", answer: "Orders ship within 24 hours with express delivery taking 3-5 business days." },
              { question: "What is your return & exchange policy?", answer: "We offer a 30-day hassle-free return and exchange guarantee on all gear." },
              { question: "Does this product come with a warranty?", answer: "Yes, all products include our comprehensive 2-year manufacturer warranty." },
            ],
      },
    });

    // 8. STICKY BUY BAR
    sections.push({
      id: `sec_sticky_buy_bar_${now}_7`,
      type: "STICKY_BUY_BAR",
      data: {
        title: productTitle,
        price: productPrice,
        imageUrl: primaryImageUrl,
        buttonAction: {
          label: "Instant Checkout",
          actionType: BUTTON_ACTION_TYPES.BUY_NOW,
          target: primaryVariantId,
          style: "primary",
        },
      },
    });
  }

  // ============================================================================
  // TEMPLATE 2: GENERAL CAMPAIGN LANDING PAGE (8 Deterministic Sections)
  // ============================================================================
  else if (pageType === "LANDING") {
    // 1. PROMO BANNER
    sections.push({
      id: `sec_promo_banner_${now}_0`,
      type: "PROMO_BANNER",
      data: {
        heading: plan.promoBanner?.heading || "EXCLUSIVE SEASON SALE: 20% OFF TODAY",
        countdownText: plan.promoBanner?.countdownText || "Offer expires at midnight",
        code: plan.promoBanner?.code || "SAVE20",
      },
    });

    // 2. HERO
    sections.push({
      id: `sec_hero_${now}_1`,
      type: "HERO",
      data: {
        headline: plan.hero?.headline || "Upgrade Your Ride With Precision-Engineered Gear",
        subheadline: plan.hero?.subheadline || "Experience maximum stability, featherlight control, and superior craftsmanship on every run.",
        badge: plan.hero?.badge || "Special Limited Promotion",
        imageUrl: primaryImageUrl,
        buttonPrimary: {
          label: plan.hero?.ctaText || "Claim Your 20% Discount",
          actionType: BUTTON_ACTION_TYPES.BUY_NOW,
          target: primaryVariantId,
          style: "primary",
        },
        buttonSecondary: {
          label: "See Comparison",
          actionType: BUTTON_ACTION_TYPES.SCROLL_TO,
          target: `#sec_comparison_${now}_4`,
          style: "secondary",
        },
      },
    });

    // 3. TRUST BADGES (Guarantees)
    sections.push({
      id: `sec_trust_badges_${now}_2`,
      type: "TRUST_BADGES",
      data: {
        items: Array.isArray(plan.trustBadges?.items) && plan.trustBadges.items.length > 0
          ? plan.trustBadges.items
          : [
              { title: "30-Day Trial", description: "100% risk-free return guarantee" },
              { title: "Fast 24H Dispatch", description: "Free carbon-neutral shipping" },
              { title: "2-Year Warranty", description: "Crafted to withstand peak intensity" },
            ],
      },
    });

    // 4. PRODUCT SHOWCASE
    sections.push({
      id: `sec_product_showcase_${now}_3`,
      type: "PRODUCT_SHOWCASE",
      data: {
        title: plan.productShowcase?.title || productTitle,
        price: plan.productShowcase?.price || productPrice,
        description: plan.productShowcase?.description || "Engineered for maximum versatility, featherlight weight, and unbeatable edge hold.",
        features: Array.isArray(plan.productShowcase?.features)
          ? plan.productShowcase.features
          : ["Triaxial Carbon Weave", "Sintered High-Glide Base", "Reinforced Shock Absorbers"],
        imageUrl: primaryImageUrl,
        buttonPrimary: {
          label: "Claim Offer Now",
          actionType: BUTTON_ACTION_TYPES.ADD_TO_CART,
          target: primaryVariantId,
          style: "primary",
        },
      },
    });

    // 5. COMPARISON TABLE
    sections.push({
      id: `sec_comparison_${now}_4`,
      type: "COMPARISON_TABLE",
      data: {
        heading: plan.comparisonTable?.heading || "Why We Beat Traditional Alternatives",
        ourBrand: plan.comparisonTable?.ourBrand || brandName,
        competitorName: plan.comparisonTable?.competitorName || "Traditional Alternatives",
        rows: Array.isArray(plan.comparisonTable?.rows) && plan.comparisonTable.rows.length > 0
          ? plan.comparisonTable.rows
          : [
              { feature: "Racing-Grade Core Materials", us: "Yes - 100% Premium", them: "Generic Composite" },
              { feature: "30-Day In-Field Trial", us: "Included", them: "No Returns if Used" },
              { feature: "Durability Rating", us: "Extreme (5/5)", them: "Moderate (3/5)" },
              { feature: "Direct Customer Support", us: "24/7 Dedicated", them: "Automated Bot Only" },
            ],
      },
    });

    // 6. TESTIMONIALS
    sections.push({
      id: `sec_testimonials_${now}_5`,
      type: "TESTIMONIALS",
      data: {
        heading: plan.testimonials?.heading || "What Early Adopters Are Saying",
        subtitle: plan.testimonials?.subtitle || "Real before-and-after transformations.",
        items: Array.isArray(plan.testimonials?.items) && plan.testimonials.items.length > 0
          ? plan.testimonials.items
          : [
              { name: "Chris L.", rating: 5, comment: "Completely elevated my performance. Incredible responsiveness and lightweight feel.", badge: "Verified Buyer" },
              { name: "Sarah M.", rating: 5, comment: "The quality is unmatched for the price point. Highly recommend!", badge: "Verified Buyer" },
              { name: "Jason P.", rating: 5, comment: "Delivered fast, exactly as described. Best investment I've made all year.", badge: "Verified Buyer" },
            ],
      },
    });

    // 7. FAQ
    sections.push({
      id: `sec_faq_${now}_6`,
      type: "FAQ",
      data: {
        heading: plan.faq?.heading || "Campaign Terms & FAQ",
        items: Array.isArray(plan.faq?.items) && plan.faq.items.length > 0
          ? plan.faq.items
          : [
              { question: "How does the 20% discount apply?", answer: "Use code SAVE20 at checkout for an instant 20% discount on your order." },
              { question: "What is your shipping timeframe?", answer: "Orders ship within 24 hours and typically arrive within 3-5 business days." },
              { question: "Can I return the item if I change my mind?", answer: "Yes, we provide 30-day hassle-free returns on all products." },
            ],
      },
    });

    // 8. FINAL CTA BANNER
    sections.push({
      id: `sec_final_cta_${now}_7`,
      type: "FINAL_CTA",
      data: {
        heading: plan.finalCta?.heading || `Ready to Experience ${brandName}?`,
        subheading: plan.finalCta?.subheading || "Claim your limited-time 20% discount before stock runs out.",
        buttonPrimary: {
          label: plan.finalCta?.ctaText || "Claim Offer Now",
          actionType: BUTTON_ACTION_TYPES.BUY_NOW,
          target: primaryVariantId,
          style: "primary",
        },
      },
    });
  }

  // ============================================================================
  // TEMPLATE 3: HOME PAGE (6 Deterministic Sections)
  // ============================================================================
  else if (pageType === "HOME") {
    // 1. HERO
    sections.push({
      id: `sec_hero_${now}_0`,
      type: "HERO",
      data: {
        headline: plan.hero?.headline || `Welcome to ${brandName} — Pure Performance`,
        subheadline: plan.hero?.subheadline || "Discover handpicked collections crafted with uncompromised attention to detail.",
        badge: plan.hero?.badge || "2026 Collection",
        imageUrl: primaryImageUrl,
        buttonPrimary: {
          label: plan.hero?.ctaText || "Explore Collection",
          actionType: BUTTON_ACTION_TYPES.SCROLL_TO,
          target: `#sec_featured_grid_${now}_2`,
          style: "primary",
        },
      },
    });

    // 2. COLLECTION LIST (3-4 Category Cards)
    let categoryList = [];
    if (selectedCollection && selectedCollection.title) {
      const colCover =
        selectedCollection.imageUrl ||
        selectedCollection.products?.[0]?.imageUrl ||
        collectionProducts[0]?.imageUrl ||
        primaryImageUrl;

      categoryList.push({
        title: selectedCollection.title,
        handle: selectedCollection.handle || "all",
        imageUrl: colCover,
        link: `/collections/${selectedCollection.handle || "all"}`,
      });
    }

    if (storeCollections && storeCollections.length > 0) {
      for (const c of storeCollections) {
        if (!categoryList.some((item) => item.title.toLowerCase() === c.title.toLowerCase())) {
          const colCover = c.imageUrl || c.products?.[0]?.imageUrl || primaryImageUrl;
          categoryList.push({
            title: c.title,
            handle: c.handle || "all",
            imageUrl: colCover,
            link: `/collections/${c.handle || "all"}`,
          });
        }
        if (categoryList.length >= 4) break;
      }
    }

    if (categoryList.length === 0) {
      categoryList = plan.collectionList?.categories || [
        { title: "Best Sellers", description: "Our most wanted performance gear", link: "/collections/all" },
        { title: "New Arrivals", description: "Fresh releases for the season", link: "/collections/all" },
        { title: "Pro Equipment", description: "Tuning and accessories", link: "/collections/all" },
      ];
    }

    sections.push({
      id: `sec_collection_list_${now}_1`,
      type: "COLLECTION_LIST",
      data: {
        heading: plan.collectionList?.heading || "Shop By Category",
        items: categoryList,
      },
    });

    // 3. FEATURED GRID (4-Product Grid with Real Ingested Catalog Items)
    let gridSource = activeGridProducts;
    if (!gridSource || gridSource.length === 0) {
      if (collectionProducts.length > 0) {
        gridSource = collectionProducts;
      } else {
        gridSource = candidateProducts.slice(0, 4);
      }
    }

    const gridItems = (gridSource && gridSource.length > 0)
      ? gridSource.slice(0, 4).map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price || "$99.00",
          imageUrl: p.imageUrl || p.featuredImage?.url || primaryImageUrl,
          handle: p.handle || "product",
          buttonAction: {
            label: "Add to Cart",
            actionType: BUTTON_ACTION_TYPES.ADD_TO_CART,
            target: p.primaryVariantId || p.variants?.[0]?.id || p.id,
            style: "primary",
          },
        }))
      : [
          {
            id: "sample_1",
            title: productTitle,
            price: productPrice,
            imageUrl: primaryImageUrl,
            buttonAction: { label: "Add to Cart", actionType: BUTTON_ACTION_TYPES.ADD_TO_CART, target: primaryVariantId, style: "primary" },
          },
        ];

    sections.push({
      id: `sec_featured_grid_${now}_2`,
      type: "FEATURED_GRID",
      data: {
        heading: plan.featuredGrid?.heading || "Curated Best Sellers",
        subtitle: plan.featuredGrid?.subtitle || "Handpicked favorites engineered for peak performance.",
        products: gridItems,
      },
    });

    // 4. BRAND STORY
    sections.push({
      id: `sec_brand_story_${now}_3`,
      type: "BRAND_STORY",
      data: {
        heading: plan.brandStory?.heading || "Crafted For Riders, By Riders",
        storyQuote: plan.brandStory?.storyQuote || "We started with one mission: to build durable, responsive gear without cutting corners.",
        founderName: plan.brandStory?.founderName || `${brandName} Design Team`,
        bodyText: plan.brandStory?.bodyText || "Every product in our collection is conceived, tested, and refined in real-world conditions. We believe superior performance comes from thoughtful engineering and sustainable materials.",
        imageUrl: primaryImageUrl,
      },
    });

    // 5. TESTIMONIALS
    sections.push({
      id: `sec_testimonials_${now}_4`,
      type: "TESTIMONIALS",
      data: {
        heading: plan.testimonials?.heading || "Community Praise",
        subtitle: plan.testimonials?.subtitle || "Join over 10,000+ satisfied customers worldwide.",
        items: Array.isArray(plan.testimonials?.items) && plan.testimonials.items.length > 0
          ? plan.testimonials.items
          : [
              { name: "Alex T.", rating: 5, comment: "Top quality gear and lightning-fast delivery. Will definitely buy again!", badge: "Verified Buyer" },
              { name: "Taylor K.", rating: 5, comment: "Transformed my experience on the slopes. Truly premium craftsmanship.", badge: "Verified Buyer" },
            ],
      },
    });

    // 6. FINAL CTA BANNER (Closing Conversion Banner with Button Action)
    sections.push({
      id: `sec_final_cta_${now}_5`,
      type: "FINAL_CTA",
      data: {
        heading: plan.finalCta?.heading || `Ready to Experience ${brandName}?`,
        subheading: plan.finalCta?.subheading || "Explore our latest collection and enjoy free worldwide shipping on orders over $50.",
        buttonPrimary: {
          label: plan.finalCta?.ctaText || "Explore All Collections →",
          actionType: BUTTON_ACTION_TYPES.LINK,
          target: selectedCollection ? `/collections/${selectedCollection.handle || "all"}` : "/collections/all",
          style: "primary",
        },
      },
    });
  }

  // ============================================================================
  // TEMPLATE 4: FAQ / TRUST PAGE (6 Deterministic Sections)
  // ============================================================================
  else if (pageType === "FAQ") {
    // 1. PAGE HEADER
    sections.push({
      id: `sec_page_header_${now}_0`,
      type: "PAGE_HEADER",
      data: {
        title: plan.pageHeader?.title || "Help Center & FAQ",
        subtitle: plan.pageHeader?.subtitle || "Everything you need to know about our products, shipping speeds, and returns.",
        breadcrumbs: "Home / Help Center",
      },
    });

    // 2. QUICK HELP GRID (3 Action Cards)
    sections.push({
      id: `sec_quick_help_${now}_1`,
      type: "QUICK_HELP_GRID",
      data: {
        cards: Array.isArray(plan.quickHelp?.cards) && plan.quickHelp.cards.length > 0
          ? plan.quickHelp.cards.map((c, i) => ({
              ...c,
              link: i === 2 ? `mailto:${contactEmail}` : contactUrl,
              icon: i === 0 ? "truck" : i === 1 ? "refresh" : "mail",
            }))
          : [
              { title: "Track Your Order", description: "Real-time courier updates & dispatch info", icon: "truck", link: contactUrl },
              { title: "Start a Return", description: "30-day hassle-free exchanges & returns", icon: "refresh", link: contactUrl },
              { title: "Contact Support", description: "Our expert team responds in under 2 hours", icon: "mail", link: `mailto:${contactEmail}` },
            ],
      },
    });

    // 3. SHIPPING FAQ GROUP
    sections.push({
      id: `sec_faq_shipping_${now}_2`,
      type: "FAQ_GROUP_SHIPPING",
      data: {
        groupTitle: plan.shippingFaq?.groupTitle || "Shipping & Delivery",
        items: Array.isArray(plan.shippingFaq?.items) && plan.shippingFaq.items.length > 0
          ? plan.shippingFaq.items
          : [
              { question: "How long does shipping take?", answer: "Orders are processed within 24 hours and delivered in 3-5 business days across North America and Europe." },
              { question: "Do you offer free shipping?", answer: "Yes! All orders over $50 qualify for free express shipping." },
              { question: "How do I track my package?", answer: "You will receive an automated tracking link via email as soon as your parcel leaves our fulfillment hub." },
            ],
      },
    });

    // 4. RETURNS FAQ GROUP
    sections.push({
      id: `sec_faq_returns_${now}_3`,
      type: "FAQ_GROUP_RETURNS",
      data: {
        groupTitle: plan.returnsFaq?.groupTitle || "Returns & Warranty",
        items: Array.isArray(plan.returnsFaq?.items) && plan.returnsFaq.items.length > 0
          ? plan.returnsFaq.items
          : [
              { question: "What is your return policy?", answer: "We offer a 30-day money-back guarantee. If you are not 100% satisfied, send it back for a full refund or exchange." },
              { question: "How do I start a return?", answer: "Simply contact our support team with your order number and we will generate a prepaid return label." },
              { question: "Is my gear covered by warranty?", answer: "Yes! All our products come with a 2-year warranty covering manufacturing defects." },
            ],
      },
    });

    // 5. GENERAL FAQ GROUP
    sections.push({
      id: `sec_faq_general_${now}_4`,
      type: "FAQ_GROUP_GENERAL",
      data: {
        groupTitle: plan.generalFaq?.groupTitle || "Product Care & General Inquiries",
        items: Array.isArray(plan.generalFaq?.items) && plan.generalFaq.items.length > 0
          ? plan.generalFaq.items
          : [
              { question: "How do I properly care for and maintain my gear?", answer: "Store in a cool, dry place after wiping down with a clean microfibre cloth. Regular maintenance ensures lifetime performance." },
              { question: "Are your materials sustainably sourced?", answer: "Yes, we prioritize recycled and eco-certified materials in 100% of our production line." },
            ],
      },
    });

    // 6. CONTACT SUPPORT CARD
    sections.push({
      id: `sec_contact_support_${now}_5`,
      type: "CONTACT_SUPPORT_CARD",
      data: {
        heading: plan.contactSupport?.heading || "Still have questions?",
        subtitle: plan.contactSupport?.subtitle || "Our customer care specialists are available 7 days a week.",
        buttonText: plan.contactSupport?.buttonText || "Contact Support",
        buttonAction: {
          label: "Contact Support",
          actionType: BUTTON_ACTION_TYPES.LINK,
          target: contactUrl || `mailto:${contactEmail}`,
          style: "primary",
        },
      },
    });
  }

  return {
    pageType,
    stylePreset,
    title: pageTitle || plan.seoTitle || "New Page",
    seoTitle: plan.seoTitle || pageTitle || "New Page",
    seoDescription: plan.seoDescription || `Discover ${pageTitle || brandName}`,
    themeTokens,
    sections,
  };
}
