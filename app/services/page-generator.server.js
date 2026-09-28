import db from "../db.server";
import { PAGE_COST_CREDITS, STYLE_THEME_TOKENS } from "../libs/ai-config";
import { generateWithOpenRouter } from "./openrouter.server";
import {
  buildStrategicPlanPrompt,
  assemblePageFromPlan,
} from "./prompt-builder.server";

/**
 * Master orchestrator for generating and saving an AI Page via 2-Step Strategic Pipeline.
 */
export async function generateAndPersistPage({
  shop,
  pageType = "LANDING",
  stylePreset = "minimal",
  pageTitle = "New Page",
  niche = "General E-commerce",
  promptText = "",
  selectedProduct = null,
  selectedProducts = [],
  selectedCollection = null,
  selectedPolicies = [],
  availablePolicies = [],
  storeContext = null,
}) {
  if (!shop) {
    throw new Error("Shop domain is required.");
  }

  // 1. Fetch / ensure ShopSettings
  let settings = await db.shopSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await db.shopSettings.create({
      data: {
        shop,
        pageCredits: 20,
        iterationTokens: 100,
        isOnboarded: true,
      },
    });
  }

  // 2. STEP 1: Build Strategic Planning Prompt & Query LLM (Pass 1)
  console.log(`[PageGenerator] STEP 1: Synthesizing strategic plan & copywriting for: ${shop} (Type: ${pageType})`);
  const { systemPrompt, userPrompt, targetProduct, activeGridProducts } = buildStrategicPlanPrompt({
    pageType,
    stylePreset,
    pageTitle,
    niche,
    promptText,
    selectedProduct,
    selectedProducts,
    selectedCollection,
    selectedPolicies,
    storeContext,
  });

  const { data: planJson, modelUsed } = await generateWithOpenRouter({
    systemPrompt,
    userPrompt,
  });

  // 3. STEP 2: Assemble Deterministic Page Schema with Image & Variant Bindings (Pass 2)
  console.log(`[PageGenerator] STEP 2: Assembling layout & section tree for: ${shop} (Type: ${pageType})`);
  const sanitizedContent = assemblePageFromPlan({
    planJson,
    pageType,
    stylePreset,
    pageTitle,
    targetProduct,
    activeGridProducts,
    selectedCollection,
    storeProducts: storeContext?.products || [],
    storeCollections: storeContext?.collections || [],
    shopInfo: storeContext?.shop || {},
  });

  // 4. Generate unique slug handle for this page within the shop
  const finalTitle = pageTitle || sanitizedContent.title || "Untitled Page";
  const handle = await generateUniqueHandle(settings.id, finalTitle);

  // 5. In-Memory Page Construction (Draft)
  const tempPage = {
    id: `temp_${Date.now()}`,
    shopId: settings.id,
    title: finalTitle,
    handle: handle,
    pageType: pageType,
    stylePreset: stylePreset,
    targetProductId: targetProduct?.id || selectedProduct?.id || null,
    seoTitle: sanitizedContent.seoTitle || sanitizedContent.title || finalTitle,
    seoDescription: sanitizedContent.seoDescription || null,
    contentJson: sanitizedContent,
    status: "DRAFT",
    createdAt: new Date().toISOString(),
  };

  console.log(`[PageGenerator] 2-Step Page synthesized successfully (Handle: ${handle}) using ${modelUsed}`);

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
