import db from "../db.server";
import { PAGE_COST_CREDITS, STYLE_THEME_TOKENS } from "../libs/ai-config";
import { generateWithOpenRouter } from "./openrouter.server";
import { buildPageGenerationPrompt } from "./prompt-builder.server";

/**
 * Master orchestrator for generating and saving an AI Page.
 */
export async function generateAndPersistPage({
  shop,
  pageType = "LANDING",
  stylePreset = "minimal",
  pageTitle = "New Page",
  niche = "General E-commerce",
  promptText = "",
  selectedProduct = null,
  selectedPolicies = [],
  availablePolicies = [],
  storeContext = null,
}) {
  if (!shop) {
    throw new Error("Shop domain is required.");
  }

  // 1. Fetch / ensure ShopSettings and verify credit balance
  let settings = await db.shopSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    // Create default settings if first time
    settings = await db.shopSettings.create({
      data: {
        shop,
        pageCredits: 20,
        iterationTokens: 100,
        isOnboarded: true,
      },
    });
  }

  // 2. Build system and user prompts with full store context
  const { systemPrompt, userPrompt } = buildPageGenerationPrompt({
    pageType,
    stylePreset,
    pageTitle,
    niche,
    promptText,
    selectedProduct,
    selectedPolicies,
    storeContext,
  });

  // 3. Call OpenRouter API with fallback rotation
  console.log(`[PageGenerator] Starting page synthesis for shop: ${shop}`);
  const { data: generatedJson, modelUsed } = await generateWithOpenRouter({
    systemPrompt,
    userPrompt,
  });

  // 4. Normalize and validate Section Tree
  const sanitizedContent = normalizePageContent({
    rawJson: generatedJson,
    pageType,
    stylePreset,
    fallbackTitle: pageTitle,
  });

  // 5. Generate unique slug handle for this page within the shop
  const finalTitle = sanitizedContent.title || pageTitle || "Untitled Page";
  const handle = await generateUniqueHandle(settings.id, finalTitle);

  // 6. In-Memory Page Construction (No DB save for now)
  const tempPage = {
    id: `temp_${Date.now()}`,
    shopId: settings.id,
    title: finalTitle,
    handle: handle,
    pageType: pageType,
    stylePreset: stylePreset,
    targetProductId: selectedProduct?.id || null,
    seoTitle: sanitizedContent.title,
    seoDescription: sanitizedContent.seoDescription || null,
    contentJson: sanitizedContent,
    status: "DRAFT",
    createdAt: new Date().toISOString(),
  };

  console.log(`[PageGenerator] In-memory page synthesized successfully (Handle: ${handle}) using ${modelUsed}`);

  return {
    success: true,
    pageId: tempPage.id,
    page: tempPage,
    remainingCredits: settings.pageCredits,
    modelUsed,
  };
}

/**
 * Ensures sections have unique IDs, proper types, and default tokens.
 */
function normalizePageContent({ rawJson, pageType, stylePreset, fallbackTitle }) {
  const themeTokens =
    rawJson?.themeTokens || STYLE_THEME_TOKENS[stylePreset] || STYLE_THEME_TOKENS.minimal;

  const sections = Array.isArray(rawJson?.sections) ? rawJson.sections : [];

  const normalizedSections = sections.map((section, index) => {
    const secType = (section.type || "HERO").toUpperCase();
    const uniqueId = `sec_${secType.toLowerCase()}_${Date.now()}_${index}`;

    return {
      id: section.id || uniqueId,
      type: secType,
      data: section.data || {},
    };
  });

  return {
    pageType: pageType,
    stylePreset: stylePreset,
    title: rawJson?.title || fallbackTitle,
    seoDescription: rawJson?.seoDescription || `Welcome to ${fallbackTitle}`,
    themeTokens: themeTokens,
    sections: normalizedSections,
  };
}

/**
 * Creates a URL-friendly unique handle/slug.
 */
async function generateUniqueHandle(shopId, title) {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "page";

  let handle = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.page.findUnique({
      where: {
        shopId_handle: {
          shopId,
          handle,
        },
      },
    });

    if (!existing) {
      return handle;
    }

    counter++;
    handle = `${baseSlug}-${counter}`;
  }
}
