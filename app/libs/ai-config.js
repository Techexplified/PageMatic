export const AI_MODELS = {
  PAGE_BUILDER: {
    PRIMARY: "google/gemini-2.0-flash-exp:free",
    FALLBACKS: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemini-2.0-pro-exp-02-05:free",
      "google/gemini-2.0-flash-lite-preview-02-05:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "deepseek/deepseek-r1:free",
      "mistralai/mistral-7b-instruct:free",
      "openrouter/free",
    ],
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.7,
  },
  MICRO_EDITS: {
    PRIMARY: "llama-3.1-8b-instant", // via Groq
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.5,
  },
};

export const PAGE_COST_CREDITS = 5;
export const SECTION_COST_TOKENS = 2;

// Interactive Button Action Types
export const BUTTON_ACTION_TYPES = {
  ADD_TO_CART: "ADD_TO_CART",
  BUY_NOW: "BUY_NOW",
  SCROLL_TO: "SCROLL_TO",
  LINK: "LINK",
};

// Deterministic Page Templates & Section Composition
export const PAGE_TEMPLATES = {
  PRODUCT: {
    id: "PRODUCT",
    name: "Product Page",
    description: "Maximize conversion on a single featured product with a high-impact split layout, trust strip, and sticky buy bar.",
    sectionSequence: [
      "ANNOUNCEMENT_BAR",
      "HERO",
      "SOCIAL_PROOF_STRIP",
      "BENEFITS_GRID",
      "FEATURE_SPOTLIGHT",
      "TESTIMONIALS",
      "FAQ",
      "STICKY_BUY_BAR",
    ],
  },
  LANDING: {
    id: "LANDING",
    name: "Landing Page",
    description: "Dedicated destination for ad traffic, seasonal promos, or bundles with problem/solution narrative and comparison table.",
    sectionSequence: [
      "PROMO_BANNER",
      "HERO",
      "TRUST_BADGES",
      "PRODUCT_SHOWCASE",
      "COMPARISON_TABLE",
      "TESTIMONIALS",
      "FAQ",
      "FINAL_CTA",
    ],
  },
  HOME: {
    id: "HOME",
    name: "Home Page",
    description: "Brand orientation, category routing, and catalog showcase with editorial brand story and high-converting closing CTA.",
    sectionSequence: [
      "HERO",
      "COLLECTION_LIST",
      "FEATURED_GRID",
      "BRAND_STORY",
      "TESTIMONIALS",
      "FINAL_CTA",
    ],
  },
  FAQ: {
    id: "FAQ",
    name: "FAQ / Trust Page",
    description: "Deflect support tickets and eliminate purchase friction with policy-driven categorised accordions and quick help links.",
    sectionSequence: [
      "PAGE_HEADER",
      "QUICK_HELP_GRID",
      "FAQ_GROUP_SHIPPING",
      "FAQ_GROUP_RETURNS",
      "FAQ_GROUP_GENERAL",
      "CONTACT_SUPPORT_CARD",
    ],
  },
};

// Style Preset Theme Token Defaults
export const STYLE_THEME_TOKENS = {
  minimal: {
    "--pm-primary": "#0052FF",
    "--pm-accent": "#2563EB",
    "--pm-bg": "#FFFFFF",
    "--pm-surface": "#F8FAFC",
    "--pm-text-heading": "#0F172A",
    "--pm-text-body": "#475569",
    "--pm-radius": "8px",
    "--pm-font-heading": "Inter, sans-serif",
  },
  bold: {
    "--pm-primary": "#E11D48",
    "--pm-accent": "#BE123C",
    "--pm-bg": "#09090B",
    "--pm-surface": "#18181B",
    "--pm-text-heading": "#FAFAFA",
    "--pm-text-body": "#A1A1AA",
    "--pm-radius": "16px",
    "--pm-font-heading": "Inter, sans-serif",
  },
  editorial: {
    "--pm-primary": "#4338CA",
    "--pm-accent": "#3730A3",
    "--pm-bg": "#FAF5EF",
    "--pm-surface": "#F5EFEB",
    "--pm-text-heading": "#1E1B4B",
    "--pm-text-body": "#4B5563",
    "--pm-radius": "4px",
    "--pm-font-heading": "Georgia, serif",
  },
};
