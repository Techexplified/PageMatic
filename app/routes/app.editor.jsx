import { useState, useEffect, useRef } from "react";
import { useLoaderData, useFetcher, data } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { generateWithOpenRouter } from "../services/openrouter.server";
import { publishPageToShopify, unpublishPageFromShopify } from "../services/page-publisher.server";
import { AI_MODELS, SECTION_ALLOWED_KEYS, STYLE_THEME_TOKENS, SECTION_COST_TOKENS } from "../libs/ai-config";
import { embedRedirect } from "../utils/shopify-embed-nav.server.js";

/**
 * Strips phantom or mismatched schema fields from section data based on section type
 */
function sanitizeSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections.map((sec) => {
    const secType = (sec.type || "").toUpperCase();
    const allowed = SECTION_ALLOWED_KEYS[secType];
    if (!allowed || !sec.data) return sec;
    const cleanData = {};
    for (const [k, v] of Object.entries(sec.data)) {
      if (allowed.includes(k) && v !== undefined) {
        cleanData[k] = v;
      }
    }
    return { ...sec, data: cleanData };
  });
}

// Studio Editor Sub-components
import EditorHeader from "../components/editor/EditorHeader";
import EditorSidebar from "../components/editor/EditorSidebar";
import EditorPreviewCanvas from "../components/editor/EditorPreviewCanvas";
import PublishModal from "../components/editor/PublishModal";
import PageSelectionScreen from "../components/editor/PageSelectionScreen";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import "../styles/dashboard.css";
import "../styles/editor.css";

// ============================================================================
// LOADER (Fetches shop settings and initial page state)
// ============================================================================
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const pageId = url.searchParams.get("pageId");

  const shopSettings = await db.shopSettings.findUnique({
    where: { shop: session.shop },
  });

  // Route Guard: If merchant has not completed onboarding, force redirection to onboarding flow
  if (!shopSettings || !shopSettings.isOnboarded) {
    throw embedRedirect("/app/onboarding", request);
  }

  let page = null;
  if (pageId && !pageId.startsWith("temp")) {
    page = await db.page.findUnique({
      where: { id: pageId },
    });
  }

  // Fetch all pages for the shop in case user needs to select one
  const pages = shopSettings?.id
    ? await db.page.findMany({
        where: { shopId: shopSettings.id },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return data({
    page,
    pages,
    shopSettings,
    shop: session.shop,
    pageId,
  });
};

// ============================================================================
// ACTION (Handles AI Micro-Edits & Page Saving to Database)
// ============================================================================
export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  let shopSettings = await db.shopSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!shopSettings) {
    shopSettings = await db.shopSettings.create({
      data: { shop: session.shop },
    });
  }

  // 1. SAVE PAGE TO DATABASE (DRAFT OR UPDATE)
  if (intent === "SAVE_PAGE") {
    const pageId = formData.get("pageId");
    const title = formData.get("title") || "Untitled Page";
    const handle = formData.get("handle") || "";
    const pageType = formData.get("pageType") || "LANDING";
    const stylePreset = formData.get("stylePreset") || "minimal";
    const targetProductId = formData.get("targetProductId") || null;
    const contentJsonStr = formData.get("contentJson");

    let contentJson = {};
    try {
      if (contentJsonStr) contentJson = JSON.parse(contentJsonStr);
    } catch (e) {
      console.warn("contentJson parse error in save action:", e);
    }

    const baseHandle = (handle || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "page";

    let finalHandle = baseHandle;
    let savedPage = null;

    // If existing page in database, update it
    if (pageId && !pageId.startsWith("temp")) {
      const existing = await db.page.findFirst({
        where: { id: String(pageId), shopId: shopSettings.id },
      });

      if (existing) {
        savedPage = await db.page.update({
          where: { id: existing.id },
          data: {
            title,
            pageType,
            stylePreset,
            targetProductId: targetProductId || existing.targetProductId,
            seoTitle: contentJson.title || title,
            seoDescription: contentJson.seoDescription || null,
            contentJson,
            updatedAt: new Date(),
          },
        });
      }
    }

    // If new page (or temp ID), create record with collision-free handle
    if (!savedPage) {
      let counter = 1;
      while (true) {
        const collision = await db.page.findUnique({
          where: {
            shopId_handle: {
              shopId: shopSettings.id,
              handle: finalHandle,
            },
          },
        });
        if (!collision) break;
        counter++;
        finalHandle = `${baseHandle}-${counter}`;
      }

      savedPage = await db.page.create({
        data: {
          shopId: shopSettings.id,
          title,
          handle: finalHandle,
          pageType,
          status: "DRAFT",
          stylePreset,
          targetProductId,
          seoTitle: contentJson.title || title,
          seoDescription: contentJson.seoDescription || null,
          contentJson,
        },
      });
    }

    console.log(`[Editor] Successfully saved page "${savedPage.title}" (ID: ${savedPage.id}, Handle: ${savedPage.handle}) for ${session.shop}`);

    return data({
      success: true,
      savedPage,
      pageId: savedPage.id,
      message: "Page saved successfully",
    });
  }

  // 2. PUBLISH PAGE DIRECTLY TO SHOPIFY ONLINE STORE
  if (intent === "PUBLISH_PAGE") {
    const pageId = formData.get("pageId");
    const title = formData.get("title") || "Untitled Page";
    const contentJsonStr = formData.get("contentJson");

    let contentJson = {};
    try {
      if (contentJsonStr) contentJson = JSON.parse(contentJsonStr);
    } catch (e) {}

    let targetPage = null;
    if (pageId && !pageId.startsWith("temp")) {
      targetPage = await db.page.findFirst({
        where: { id: String(pageId), shopId: shopSettings.id },
      });
    }

    if (targetPage) {
      targetPage = await db.page.update({
        where: { id: targetPage.id },
        data: {
          title,
          contentJson,
          updatedAt: new Date(),
        },
      });
    } else {
      const baseHandle = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "page";

      let finalHandle = baseHandle;
      let counter = 1;
      while (true) {
        const collision = await db.page.findUnique({
          where: {
            shopId_handle: {
              shopId: shopSettings.id,
              handle: finalHandle,
            },
          },
        });
        if (!collision) break;
        counter++;
        finalHandle = `${baseHandle}-${counter}`;
      }

      targetPage = await db.page.create({
        data: {
          shopId: shopSettings.id,
          title,
          handle: finalHandle,
          pageType: "LANDING",
          status: "DRAFT",
          stylePreset: "minimal",
          contentJson,
        },
      });
    }

    // Call Shopify GraphQL Publisher
    const publishRes = await publishPageToShopify({
      admin,
      shop: session.shop,
      page: targetPage,
    });

    if (!publishRes.success) {
      return data({
        success: false,
        error: publishRes.error || "Failed to publish page to Shopify.",
      });
    }

    return data({
      success: true,
      storefrontUrl: publishRes.storefrontUrl,
      shopifyPageId: publishRes.shopifyPageId,
      handle: publishRes.handle,
      page: publishRes.page,
      message: `Page published live to ${publishRes.storefrontUrl}`,
    });
  }

  // 3. UNPUBLISH PAGE DIRECTLY FROM SHOPIFY ONLINE STORE
  if (intent === "UNPUBLISH_PAGE") {
    const pageId = formData.get("pageId");
    if (!pageId) {
      return data({ success: false, error: "Page ID is required to unpublish." });
    }

    const targetPage = await db.page.findFirst({
      where: { id: String(pageId), shopId: shopSettings.id },
    });

    if (!targetPage) {
      return data({ success: false, error: "Page not found." });
    }

    const unpublishRes = await unpublishPageFromShopify({
      admin,
      shop: session.shop,
      page: targetPage,
    });

    if (!unpublishRes.success) {
      return data({
        success: false,
        error: unpublishRes.error || "Failed to unpublish page.",
      });
    }

    return data({
      success: true,
      actionType: "UNPUBLISH",
      page: unpublishRes.page,
      message: "Page has been unpublished and reverted to Draft.",
    });
  }

  // 4. OPENROUTER AI MICRO-EDIT RE-ROLL (Sub-second Copy Optimization)
  if (intent === "REROLL_SECTION") {
    const pageId = formData.get("pageId");
    const sectionId = formData.get("sectionId");
    const sectionType = formData.get("sectionType");
    const currentDataStr = formData.get("currentData");
    const prompt = formData.get("prompt") || "Improve and polish this section copy for higher conversion.";

    // Check token balance
    if ((shopSettings?.iterationTokens ?? 0) < SECTION_COST_TOKENS) {
      return data({
        success: false,
        error: `You have insufficient Silver Tokens for AI micro-edits (needed: ${SECTION_COST_TOKENS}, available: ${shopSettings?.iterationTokens ?? 0}). Tokens refresh weekly.`,
      });
    }

    let currentData = {};
    try {
      if (currentDataStr) currentData = JSON.parse(currentDataStr);
    } catch (e) {}

    const systemPrompt = `You are an elite E-commerce Conversion Rate Optimization (CRO) copywriter and micro-editor.
Your task is to rewrite and optimize the copy for a "${sectionType}" landing page section.

### STRICT RULES:
1. **OBEY MERCHANT INSTRUCTIONS:** Prioritize the user's rewrite instructions (tone, promotional angles, urgency, benefits).
2. **PRESERVE STRUCTURE & BINDINGS:** You MUST retain all non-text fields (such as "buttonAction", "target", "actionType", "imageUrl", "galleryImages", "price", and variant IDs). Only update or improve the copy fields (headlines, subheadlines, subtitles, badges, descriptions, questions, answers, reviews) unless explicitly instructed to modify other elements.
3. **NO FORMS / INPUT FIELDS:** NEVER insert email capture inputs or text forms.
4. **OUTPUT FORMAT:** Return ONLY the valid raw JSON object matching the section data schema. Do not output markdown code fences or conversational text.`;

    const userPrompt = `Rewrite and optimize this "${sectionType}" section data according to this instruction:
"${prompt}"

CURRENT SECTION DATA:
${JSON.stringify(currentData, null, 2)}

Return the updated section data JSON object:`;

    try {
      const res = await generateWithOpenRouter({
        systemPrompt,
        userPrompt,
        model: AI_MODELS.MICRO_EDITS.PRIMARY,
        fallbacks: AI_MODELS.MICRO_EDITS.FALLBACKS,
        maxTokens: AI_MODELS.MICRO_EDITS.MAX_TOKENS,
        temperature: AI_MODELS.MICRO_EDITS.TEMPERATURE,
      });

      const aiData = res.data || {};
      if (!aiData || Object.keys(aiData).length === 0) {
        return data({
          success: false,
          error: "Our AI assistant was unable to rewrite this section. Please try rephrasing your prompt or click Re-roll again.",
        });
      }

      // Deduct Silver Tokens upon successful micro-edit
      const updatedSettings = await db.shopSettings.update({
        where: { id: shopSettings.id },
        data: {
          iterationTokens: {
            decrement: SECTION_COST_TOKENS,
          },
        },
      });

      const updatedData = { ...currentData };
      const secType = (sectionType || "").toUpperCase();
      const allowedKeys = SECTION_ALLOWED_KEYS[secType];

      let changedFieldsCount = 0;
      // Copy valid fields from aiData that belong to this section
      for (const [k, v] of Object.entries(aiData)) {
        if (v !== undefined && v !== null) {
          // If allowedKeys is defined, only copy fields that belong to this section type
          if (allowedKeys && !allowedKeys.includes(k)) {
            continue;
          }
          if (JSON.stringify(updatedData[k]) !== JSON.stringify(v)) {
            changedFieldsCount++;
          }
          updatedData[k] = v;
        }
      }

      // If currentData originally had button actions or images, preserve them if AI omitted them
      if (allowedKeys) {
        if (allowedKeys.includes("imageUrl") && "imageUrl" in currentData && !updatedData.imageUrl) {
          updatedData.imageUrl = currentData.imageUrl;
        }
        if (allowedKeys.includes("galleryImages") && "galleryImages" in currentData && (!updatedData.galleryImages || updatedData.galleryImages.length === 0)) {
          updatedData.galleryImages = currentData.galleryImages;
        }
        if (allowedKeys.includes("buttonAction") && "buttonAction" in currentData && !updatedData.buttonAction) {
          updatedData.buttonAction = currentData.buttonAction;
        }
        if (allowedKeys.includes("buttonPrimary") && "buttonPrimary" in currentData && !updatedData.buttonPrimary) {
          updatedData.buttonPrimary = currentData.buttonPrimary;
        }
        if (allowedKeys.includes("buttonSecondary") && "buttonSecondary" in currentData && !updatedData.buttonSecondary) {
          updatedData.buttonSecondary = currentData.buttonSecondary;
        }

        // Clean any extraneous keys from updatedData
        for (const k of Object.keys(updatedData)) {
          if (!allowedKeys.includes(k)) {
            delete updatedData[k];
          }
        }
      }

      // Persist to database if pageId provided to keep DB in sync
      if (pageId) {
        try {
          const existingPage = await db.page.findUnique({ where: { id: pageId } });
          if (existingPage) {
            const rawContent = existingPage.contentJson;
            const existingContent = typeof rawContent === "object" && rawContent !== null ? rawContent : (typeof rawContent === "string" ? JSON.parse(rawContent || "{}") : {});
            const existingSections = Array.isArray(existingContent.sections) ? existingContent.sections : [];
            const updatedSections = existingSections.map((s) => s.id === sectionId ? { ...s, data: updatedData } : s);
            await db.page.update({
              where: { id: pageId },
              data: {
                contentJson: {
                  ...existingContent,
                  sections: updatedSections,
                },
              },
            });
          }
        } catch (dbErr) {
          console.warn("[Editor Section Re-roll DB Sync Warn]:", dbErr);
        }
      }

      return data({
        success: true,
        sectionId,
        updatedData,
        remainingTokens: updatedSettings.iterationTokens,
        modelUsed: res.modelUsed,
      });
    } catch (err) {
      console.error("[Editor Re-roll Error]:", err);
      let userFriendly = "Our AI micro-editor is momentarily busy. Please click Re-roll again in a few seconds.";
      if (err.message && err.message.includes("Tokens")) {
        userFriendly = err.message;
      }
      return data({
        success: false,
        error: userFriendly,
      });
    }
  }

  // 3. OPENROUTER AI THEME & PALETTE RE-ROLL
  if (intent === "REROLL_THEME") {
    const pageId = formData.get("pageId");
    const currentThemeStr = formData.get("currentTheme");
    const prompt = formData.get("prompt") || "Generate a modern, high-converting aesthetic color palette.";

    // Check token balance
    if ((shopSettings?.iterationTokens ?? 0) < SECTION_COST_TOKENS) {
      return data({
        success: false,
        error: `You have insufficient Silver Tokens for theme generation (needed: ${SECTION_COST_TOKENS}, available: ${shopSettings?.iterationTokens ?? 0}). Tokens refresh weekly.`,
      });
    }

    let currentTheme = {};
    try {
      if (currentThemeStr) currentTheme = JSON.parse(currentThemeStr);
    } catch (e) {}

    const systemPrompt = `You are a world-class UI/UX Design System Architect specializing in E-commerce color harmonies and conversion palettes.
Your task is to generate a beautiful, high-contrast, cohesive 6-part CSS theme palette for an e-commerce storefront.

### STRICT PALETTE REQUIREMENTS:
1. **HIGH CONTRAST & WCAG READABILITY:**
   - "--pm-text-heading" and "--pm-text-body" MUST contrast strongly against "--pm-bg" and "--pm-surface".
   - Dark mode pages must have light heading/body text; Light mode pages must have dark heading/body text.
2. **HEX FORMAT ONLY:** All color values must be valid 6-character hex codes (e.g. "#0052FF", "#0F172A", "#FFFFFF").
3. **TOKEN SCHEMA:**
   - "--pm-primary": Main CTA button background and primary brand color.
   - "--pm-accent": Secondary button background, hover states, and accent highlights.
   - "--pm-bg": Main canvas background color.
   - "--pm-surface": Card surface, review box, and alternating section background.
   - "--pm-text-heading": Main title & heading contrast color.
   - "--pm-text-body": Secondary body & paragraph text.
   - "--pm-radius": (Optional) Border radius e.g. "8px" or "12px".
   - "--pm-font-heading": (Optional) Font family e.g. "Inter, sans-serif" or "Georgia, serif".
4. **OUTPUT FORMAT:** Return ONLY a valid raw JSON object matching the themeTokens schema. Do NOT include markdown formatting, conversational text, or backticks.`;

    const userPrompt = `Generate a cohesive theme palette based on this merchant instruction:
"${prompt}"

CURRENT THEME TOKENS:
${JSON.stringify(currentTheme, null, 2)}

Return the updated themeTokens JSON object:`;

    try {
      const res = await generateWithOpenRouter({
        systemPrompt,
        userPrompt,
        model: AI_MODELS.MICRO_EDITS.PRIMARY,
        fallbacks: AI_MODELS.MICRO_EDITS.FALLBACKS,
        maxTokens: 1000,
        temperature: 0.7,
      });

      const aiTokens = res.data || {};
      const isValidHex = (val) => typeof val === "string" && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(val.trim());

      const validKeys = Object.keys(aiTokens).filter(k => isValidHex(aiTokens[k]));
      if (validKeys.length === 0) {
        return data({
          success: false,
          error: "AI could not generate valid color codes. Try describing specific colors (e.g. 'Emerald green with warm gold').",
        });
      }

      // Deduct Silver Tokens upon successful theme generation
      const updatedSettings = await db.shopSettings.update({
        where: { id: shopSettings.id },
        data: {
          iterationTokens: {
            decrement: SECTION_COST_TOKENS,
          },
        },
      });

      const updatedTheme = {
        ...currentTheme,
        ...(isValidHex(aiTokens["--pm-primary"]) ? { "--pm-primary": aiTokens["--pm-primary"].trim() } : {}),
        ...(isValidHex(aiTokens["--pm-accent"]) ? { "--pm-accent": aiTokens["--pm-accent"].trim() } : {}),
        ...(isValidHex(aiTokens["--pm-bg"]) ? { "--pm-bg": aiTokens["--pm-bg"].trim() } : {}),
        ...(isValidHex(aiTokens["--pm-surface"]) ? { "--pm-surface": aiTokens["--pm-surface"].trim() } : {}),
        ...(isValidHex(aiTokens["--pm-text-heading"]) ? { "--pm-text-heading": aiTokens["--pm-text-heading"].trim() } : {}),
        ...(isValidHex(aiTokens["--pm-text-body"]) ? { "--pm-text-body": aiTokens["--pm-text-body"].trim() } : {}),
        ...(typeof aiTokens["--pm-radius"] === "string" && aiTokens["--pm-radius"].trim() ? { "--pm-radius": aiTokens["--pm-radius"].trim() } : {}),
        ...(typeof aiTokens["--pm-font-heading"] === "string" && aiTokens["--pm-font-heading"].trim() ? { "--pm-font-heading": aiTokens["--pm-font-heading"].trim() } : {}),
      };

      // Persist to database if pageId provided to keep DB in sync
      if (pageId) {
        try {
          const existingPage = await db.page.findUnique({ where: { id: pageId } });
          if (existingPage) {
            const rawContent = existingPage.contentJson;
            const existingContent = typeof rawContent === "object" && rawContent !== null ? rawContent : (typeof rawContent === "string" ? JSON.parse(rawContent || "{}") : {});
            await db.page.update({
              where: { id: pageId },
              data: {
                contentJson: {
                  ...existingContent,
                  themeTokens: updatedTheme,
                },
              },
            });
          }
        } catch (dbErr) {
          console.warn("[Editor Theme Re-roll DB Sync Warn]:", dbErr);
        }
      }

      return data({
        success: true,
        updatedTheme,
        remainingTokens: updatedSettings.iterationTokens,
        modelUsed: res.modelUsed,
      });
    } catch (err) {
      console.error("[Editor Theme Re-roll Error]:", err);
      let userFriendly = "Our AI design engine could not generate a palette right now. Please try again in a few seconds.";
      if (err.message && err.message.includes("Tokens")) {
        userFriendly = err.message;
      }
      return data({
        success: false,
        error: userFriendly,
      });
    }
  }

  return data({ success: true });
};

// ============================================================================
// STUDIO EDITOR MASTER COMPONENT
// ============================================================================
export default function StudioEditor() {
  const { page: loaderPage, pages = [], shopSettings, shop, pageId } = useLoaderData();
  const saveFetcher = useFetcher();
  const rerollFetcher = useFetcher();
  const themeFetcher = useFetcher();
  const publishFetcher = useFetcher();

  // In-Memory / Loaded Page State
  const [page, setPage] = useState(loaderPage || null);
  const [currentShopSettings, setCurrentShopSettings] = useState(shopSettings);
  const [pageTitle, setPageTitle] = useState("");
  const [deviceMode, setDeviceMode] = useState("desktop"); // desktop | tablet | mobile
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [toast, setToast] = useState(null); // { id, message, type: 'success' | 'error' | 'info' }
  const loadedPageIdRef = useRef(null);

  // Sync token updates from re-roll and theme fetchers
  useEffect(() => {
    if (rerollFetcher.data?.remainingTokens !== undefined) {
      setCurrentShopSettings((prev) =>
        prev ? { ...prev, iterationTokens: rerollFetcher.data.remainingTokens } : prev
      );
    }
  }, [rerollFetcher.data]);

  useEffect(() => {
    if (themeFetcher.data?.remainingTokens !== undefined) {
      setCurrentShopSettings((prev) =>
        prev ? { ...prev, iterationTokens: themeFetcher.data.remainingTokens } : prev
      );
    }
  }, [themeFetcher.data]);

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Initialize from loader on mount or when switching to a different pageId
  useEffect(() => {
    if (loaderPage) {
      if (loadedPageIdRef.current !== loaderPage.id) {
        loadedPageIdRef.current = loaderPage.id;
        const defaultTokens = STYLE_THEME_TOKENS[loaderPage.stylePreset] || STYLE_THEME_TOKENS.minimal;
        const sanitized = {
          ...loaderPage,
          contentJson: {
            ...loaderPage.contentJson,
            themeTokens: loaderPage.contentJson?.themeTokens || defaultTokens,
            sections: sanitizeSections(loaderPage.contentJson?.sections),
          },
        };
        setPage(sanitized);
        setPageTitle(loaderPage.title || "Untitled Page");
      }
    } else if (pageId && pageId.startsWith("temp") && typeof window !== "undefined") {
      // ONLY load from temporary storage if URL explicitly specifies pageId=temp (fresh generation)
      try {
        const cached =
          sessionStorage.getItem("pagematic_generated_page") ||
          localStorage.getItem("pagematic_generated_page");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.contentJson) {
            loadedPageIdRef.current = parsed.id || "temp";
            const defaultTokens =
              STYLE_THEME_TOKENS[parsed.stylePreset] || STYLE_THEME_TOKENS.minimal;
            setPage({
              ...parsed,
              contentJson: {
                ...parsed.contentJson,
                themeTokens: parsed.contentJson?.themeTokens || defaultTokens,
                sections: sanitizeSections(parsed.contentJson?.sections),
              },
            });
            setPageTitle(parsed.title || "Untitled Page");
            return;
          }
        }
      } catch (e) {
        console.warn("Storage parse error in editor:", e);
      }
      loadedPageIdRef.current = null;
      setPage(null);
      setPageTitle("");
    } else {
      // No pageId provided in URL -> Reset state so PageSelectionScreen is displayed
      loadedPageIdRef.current = null;
      setPage(null);
      setPageTitle("");
    }
  }, [loaderPage, pageId]);

  // Sync state when page is saved to database
  useEffect(() => {
    if (saveFetcher.data) {
      if (saveFetcher.data.success && saveFetcher.data.savedPage) {
        const persisted = saveFetcher.data.savedPage;
        loadedPageIdRef.current = persisted.id;
        setPage(persisted);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("pagematic_generated_page", JSON.stringify(persisted));
          localStorage.setItem("pagematic_live_preview", JSON.stringify(persisted));

          const url = new URL(window.location.href);
          if (url.searchParams.get("pageId") !== persisted.id) {
            url.searchParams.set("pageId", persisted.id);
            window.history.replaceState({}, "", url.toString());
          }
        }
        showToast("Page draft saved to Shopify!", "success");
      } else if (saveFetcher.data.error || saveFetcher.data.success === false) {
        showToast(saveFetcher.data.error || "Failed to save page draft. Please try again.", "error");
      }
    }
  }, [saveFetcher.data]);

  // Handle AI Section Re-roll action response
  useEffect(() => {
    if (rerollFetcher.data) {
      if (rerollFetcher.data.success && rerollFetcher.data.updatedData) {
        const targetId = rerollFetcher.data.sectionId || selectedSectionId;
        if (targetId) {
          handleUpdateSectionData(targetId, rerollFetcher.data.updatedData);
          showToast("✨ AI section copy updated successfully!", "success");
        }
      } else if (rerollFetcher.data.error || rerollFetcher.data.success === false) {
        showToast(
          rerollFetcher.data.error || "AI was unable to rewrite this section. Please try rephrasing your prompt or click Re-roll again.",
          "error"
        );
      }
    }
  }, [rerollFetcher.data]);

  // Handle AI Theme Re-roll action response
  useEffect(() => {
    if (themeFetcher.data) {
      if (themeFetcher.data.success && themeFetcher.data.updatedTheme) {
        handleUpdateThemeTokens(themeFetcher.data.updatedTheme);
        showToast("🎨 AI color palette generated & applied!", "success");
      } else if (themeFetcher.data.error || themeFetcher.data.success === false) {
        showToast(
          themeFetcher.data.error || "AI was unable to generate a theme palette. Please try describing your desired colors (e.g. 'Emerald luxury with gold') and click Re-roll.",
          "error"
        );
      }
    }
  }, [themeFetcher.data]);

  // Handle Publish & Unpublish action responses
  useEffect(() => {
    if (publishFetcher.data) {
      if (publishFetcher.data.success) {
        if (publishFetcher.data.actionType === "UNPUBLISH") {
          showToast("⏸️ Page unpublished and reverted to Draft.", "info");
          setPage((prev) => ({
            ...prev,
            status: "DRAFT",
          }));
        } else {
          showToast("🎉 Page successfully published live to Shopify!", "success");
          setPage((prev) => ({
            ...prev,
            status: "PUBLISHED",
            shopifyPageId: publishFetcher.data.shopifyPageId || prev.shopifyPageId,
            handle: publishFetcher.data.handle || prev.handle,
          }));
        }
      } else if (publishFetcher.data.error) {
        showToast(publishFetcher.data.error, "error");
      }
    }
  }, [publishFetcher.data]);

  const contentJson = page?.contentJson || { sections: [], themeTokens: {} };
  const sections = contentJson.sections || [];
  const defaultTokens = STYLE_THEME_TOKENS[page?.stylePreset] || STYLE_THEME_TOKENS.minimal || {
    "--pm-primary": "#0052FF",
    "--pm-accent": "#2563EB",
    "--pm-bg": "#FFFFFF",
    "--pm-surface": "#F8FAFC",
    "--pm-text-heading": "#0F172A",
    "--pm-text-body": "#475569",
    "--pm-radius": "8px",
  };
  const themeTokens = {
    ...defaultTokens,
    ...(contentJson.themeTokens || {}),
  };

  // 1. Toggle Section Visibility (Hide/Show)
  const handleToggleVisibility = (sectionId) => {
    const updatedSections = sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, visible: sec.visible === false ? true : false };
      }
      return sec;
    });
    updateSectionsInState(updatedSections);
  };

  // 2. Reorder Sections
  const handleMoveSection = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    updateSectionsInState(updated);
  };

  // 3. Delete Section
  const handleDeleteSection = (sectionId) => {
    const updated = sections.filter((s) => s.id !== sectionId);
    updateSectionsInState(updated);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // 4. Update Section Data (from Sidebar inline fields)
  const handleUpdateSectionData = (sectionId, newData) => {
    setPage((prevPage) => {
      const prevContent = prevPage?.contentJson || { sections: [], themeTokens: {} };
      const prevSections = prevContent.sections || [];
      const updated = prevSections.map((sec) => {
        if (sec.id === sectionId) {
          return { ...sec, data: newData };
        }
        return sec;
      });
      const cleanSections = sanitizeSections(updated);
      const updatedContent = {
        ...prevContent,
        sections: cleanSections,
      };
      const updatedPage = {
        ...prevPage,
        title: pageTitle,
        contentJson: updatedContent,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pagematic_generated_page", JSON.stringify(updatedPage));
        localStorage.setItem("pagematic_live_preview", JSON.stringify(updatedPage));

        if ("BroadcastChannel" in window) {
          try {
            const bc = new BroadcastChannel("pagematic_preview_sync");
            bc.postMessage({ type: "PAGEMATIC_PREVIEW_UPDATE", page: updatedPage });
            setTimeout(() => bc.close(), 100);
          } catch (e) {}
        }
      }
      return updatedPage;
    });
  };

  // 5. Trigger AI Section Re-Roll
  const handleAiReRoll = (section, prompt) => {
    const formData = new FormData();
    formData.append("intent", "REROLL_SECTION");
    formData.append("sectionId", section.id);
    formData.append("sectionType", section.type);
    formData.append("currentData", JSON.stringify(section.data || {}));
    formData.append("prompt", prompt);
    if (page?.id) formData.append("pageId", page.id);

    rerollFetcher.submit(formData, { method: "POST" });
  };

  // 6. Update Theme Tokens (Colors & Styling)
  const handleUpdateThemeTokens = (newThemeTokens) => {
    setPage((prevPage) => {
      const prevContent = prevPage?.contentJson || { sections: [], themeTokens: {} };
      const updatedContent = {
        ...prevContent,
        themeTokens: newThemeTokens,
      };
      const updatedPage = {
        ...prevPage,
        title: pageTitle,
        contentJson: updatedContent,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pagematic_generated_page", JSON.stringify(updatedPage));
        localStorage.setItem("pagematic_live_preview", JSON.stringify(updatedPage));

        // Broadcast live changes to any open preview tab
        if ("BroadcastChannel" in window) {
          try {
            const bc = new BroadcastChannel("pagematic_preview_sync");
            bc.postMessage({ type: "PAGEMATIC_PREVIEW_UPDATE", page: updatedPage });
            setTimeout(() => bc.close(), 100);
          } catch (e) {}
        }
      }
      return updatedPage;
    });
  };

  // 7. Trigger AI Global Theme Re-Roll
  const handleAiThemeReRoll = (prompt) => {
    const formData = new FormData();
    formData.append("intent", "REROLL_THEME");
    formData.append("currentTheme", JSON.stringify(themeTokens));
    formData.append("prompt", prompt);
    if (page?.id) formData.append("pageId", page.id);

    themeFetcher.submit(formData, { method: "POST" });
  };

  // Listen for preview window asking for live data
  useEffect(() => {
    const handlePreviewMessage = (event) => {
      if (event.data?.type === "REQUEST_PAGEMATIC_PREVIEW") {
        const payload = { ...page, title: pageTitle, contentJson };
        if (event.source && typeof event.source.postMessage === "function") {
          event.source.postMessage({ type: "PAGEMATIC_PREVIEW_DATA", page: payload }, "*");
        }
      }
    };

    window.addEventListener("message", handlePreviewMessage);
    return () => window.removeEventListener("message", handlePreviewMessage);
  }, [page, pageTitle, contentJson]);

  // Helper to commit state & sync to storage + BroadcastChannel
  const updateSectionsInState = (newSections) => {
    setPage((prevPage) => {
      const prevContent = prevPage?.contentJson || { sections: [], themeTokens: {} };
      const cleanSections = sanitizeSections(newSections);
      const updatedContent = {
        ...prevContent,
        sections: cleanSections,
      };
      const updatedPage = {
        ...prevPage,
        title: pageTitle,
        contentJson: updatedContent,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pagematic_generated_page", JSON.stringify(updatedPage));
        localStorage.setItem("pagematic_live_preview", JSON.stringify(updatedPage));

        if ("BroadcastChannel" in window) {
          try {
            const bc = new BroadcastChannel("pagematic_preview_sync");
            bc.postMessage({ type: "PAGEMATIC_PREVIEW_UPDATE", page: updatedPage });
            setTimeout(() => bc.close(), 100);
          } catch (e) {}
        }
      }
      return updatedPage;
    });
  };

  // 8. Save Draft Page to PostgreSQL Database
  const handleSave = () => {
    const payload = { ...page, title: pageTitle, contentJson };
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pagematic_generated_page", JSON.stringify(payload));
      localStorage.setItem("pagematic_live_preview", JSON.stringify(payload));
    }

    const formData = new FormData();
    formData.append("intent", "SAVE_PAGE");
    formData.append("pageId", page?.id || "");
    formData.append("title", pageTitle || "Untitled Page");
    formData.append("handle", page?.handle || "");
    formData.append("pageType", page?.pageType || "LANDING");
    formData.append("stylePreset", page?.stylePreset || "minimal");
    formData.append("targetProductId", page?.targetProductId || "");
    formData.append("contentJson", JSON.stringify(contentJson));

    saveFetcher.submit(formData, { method: "POST" });
  };

  // 9. Standalone Sandboxed Live Preview in New Tab
  const handlePreview = () => {
    if (typeof window !== "undefined") {
      const payload = { ...page, title: pageTitle, contentJson };
      localStorage.setItem("pagematic_live_preview", JSON.stringify(payload));
      sessionStorage.setItem("pagematic_live_preview", JSON.stringify(payload));

      const targetUrl = page?.id ? `/preview?pageId=${page.id}` : "/preview";
      const previewWin = window.open(targetUrl, "_blank");

      // Broadcast and direct postMessage
      if ("BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("pagematic_preview_sync");
          bc.postMessage({ type: "PAGEMATIC_PREVIEW_UPDATE", page: payload });
          setTimeout(() => bc.close(), 200);
        } catch (e) {}
      }

      if (previewWin) {
        setTimeout(() => {
          try {
            previewWin.postMessage({ type: "PAGEMATIC_PREVIEW_DATA", page: payload }, "*");
          } catch (e) {}
        }, 300);
      }
    }
  };

  // 10. Publish Modal Controls & Action
  const handlePublish = () => {
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = () => {
    const formData = new FormData();
    formData.append("intent", "PUBLISH_PAGE");
    formData.append("pageId", page?.id || "");
    formData.append("title", pageTitle || "Untitled Page");
    formData.append("handle", page?.handle || "");
    formData.append("contentJson", JSON.stringify({ ...contentJson, title: pageTitle, sections, themeTokens }));
    publishFetcher.submit(formData, { method: "POST" });
  };

  const handleConfirmUnpublish = () => {
    const formData = new FormData();
    formData.append("intent", "UNPUBLISH_PAGE");
    formData.append("pageId", page?.id || "");
    publishFetcher.submit(formData, { method: "POST" });
  };

  // If no page is loaded (e.g. visited /app/editor directly without pageId), render the Page Selection Screen
  if (!page) {
    return <PageSelectionScreen pages={pages} shopSettings={currentShopSettings} />;
  }

  const isSaving = saveFetcher.state === "submitting" || saveFetcher.state === "loading";
  const isReRolling = rerollFetcher.state === "submitting" || rerollFetcher.state === "loading";
  const isReRollingTheme = themeFetcher.state === "submitting" || themeFetcher.state === "loading";
  const isBusy = publishFetcher.state === "submitting" || publishFetcher.state === "loading";
  const isUnpublishing = isBusy && publishFetcher.formData?.get("intent") === "UNPUBLISH_PAGE";
  const isPublishing = isBusy && !isUnpublishing;

  return (
    <div className="pm-editor-root">
      {/* Top Header */}
      <EditorHeader
        pageTitle={pageTitle}
        setPageTitle={(title) => {
          setPageTitle(title);
          updateSectionsInState(sections);
        }}
        pageStatus={page.status || "DRAFT"}
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        onSave={handleSave}
        onPreview={handlePreview}
        onPublish={handlePublish}
        isSaving={isSaving}
      />

      {/* 2-Column Body: Unified Sidebar + Expanded Live Canvas */}
      <div className="pm-editor-body">
        {/* Left Column: Sidebar (Global Theme + Accordion Layer Editors) */}
        <EditorSidebar
          sections={sections}
          themeTokens={themeTokens}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          onToggleVisibility={handleToggleVisibility}
          onMoveSection={handleMoveSection}
          onDeleteSection={handleDeleteSection}
          onUpdateSectionData={handleUpdateSectionData}
          onAiReRollSection={handleAiReRoll}
          isReRollingSection={isReRolling}
          onUpdateThemeTokens={handleUpdateThemeTokens}
          onAiReRollTheme={handleAiThemeReRoll}
          isReRollingTheme={isReRollingTheme}
        />

        {/* Right Column: Live Responsive Canvas (~65-70% width) */}
        <EditorPreviewCanvas
          sections={sections}
          themeTokens={themeTokens}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          deviceMode={deviceMode}
        />
      </div>

      {/* Publish / Unpublish Confirmation & Live Link Modal */}
      {isPublishModalOpen && (
        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          page={page}
          shop={shop}
          onConfirmPublish={handleConfirmPublish}
          onConfirmUnpublish={handleConfirmUnpublish}
          isPublishing={isPublishing}
          isUnpublishing={isUnpublishing}
          publishResult={publishFetcher.data}
        />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`pm-editor-toast pm-editor-toast--${toast.type || "success"}`}>
          <div className="pm-editor-toast-icon">
            {toast.type === "error" ? (
              <AlertTriangle size={16} color="#DC2626" />
            ) : toast.type === "info" ? (
              <Info size={16} color="#2563EB" />
            ) : (
              <CheckCircle2 size={16} color="#10B981" />
            )}
          </div>
          <span className="pm-editor-toast-text">{toast.message}</span>
          <button
            type="button"
            className="pm-editor-toast-dismiss"
            onClick={() => setToast(null)}
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
