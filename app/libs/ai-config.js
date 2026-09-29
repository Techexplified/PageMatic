export const AI_MODELS = {
  PAGE_BUILDER: {
    PRIMARY: "meta-llama/llama-3.3-70b-instruct:free",
    FALLBACKS: [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-2.0-flash-lite-preview-02-05:free",
      "meta-llama/llama-3.1-8b-instruct:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "deepseek/deepseek-chat:free",
      "mistralai/mistral-7b-instruct:free",
      "openrouter/free",
    ],
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.7,
  },
  MICRO_EDITS: {
    PRIMARY: "meta-llama/llama-3.3-70b-instruct:free",
    FALLBACKS: [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-2.0-flash-lite-preview-02-05:free",
      "meta-llama/llama-3.1-8b-instruct:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "mistralai/mistral-7b-instruct:free",
      "openrouter/free",
    ],
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.6,
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

// Style Preset Theme Token Defaults (Used as fallbacks and baseline styling)
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
    "--pm-primary": "#2563EB",
    "--pm-accent": "#1D4ED8",
    "--pm-bg": "#0F172A",
    "--pm-surface": "#1E293B",
    "--pm-text-heading": "#FAFAFA",
    "--pm-text-body": "#94A3B8",
    "--pm-radius": "12px",
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
  professional: {
    "--pm-primary": "#1E293B",
    "--pm-accent": "#334155",
    "--pm-bg": "#FFFFFF",
    "--pm-surface": "#F1F5F9",
    "--pm-text-heading": "#0F172A",
    "--pm-text-body": "#475569",
    "--pm-radius": "8px",
    "--pm-font-heading": "Inter, sans-serif",
  },
};

// Whitelist of valid schema fields per section type to prevent schema pollution
export const SECTION_ALLOWED_KEYS = {
  ANNOUNCEMENT_BAR: ["text", "badge"],
  PROMO_BANNER: ["heading", "countdownText", "code"],
  PAGE_HEADER: ["title", "subtitle", "breadcrumbs"],
  HEADER: ["brandName", "navLinks", "ctaText"],
  HERO: [
    "headline",
    "subheadline",
    "badge",
    "price",
    "compareAtPrice",
    "imageUrl",
    "galleryImages",
    "trustBadges",
    "variantSelector",
    "buttonPrimary",
    "buttonSecondary",
    "ctaPrimary",
  ],
  SOCIAL_PROOF_STRIP: ["heading", "logos"],
  TRUST_BADGES: ["items"],
  BENEFITS_GRID: ["heading", "subtitle", "items"],
  BENEFITS: ["heading", "subtitle", "items"],
  FEATURES: ["heading", "subtitle", "items"],
  FEATURE_SPOTLIGHT: ["heading", "subtitle", "rows"],
  PRODUCT_SHOWCASE: ["title", "price", "description", "features", "imageUrl", "buttonPrimary"],
  PRODUCT_DETAILS: ["title", "price", "description", "features", "imageUrl", "buttonPrimary"],
  FEATURED_PRODUCT: ["title", "price", "description", "features", "imageUrl", "buttonPrimary"],
  COMPARISON_TABLE: ["heading", "ourBrand", "competitorName", "rows"],
  COLLECTION_LIST: ["heading", "items"],
  FEATURED_GRID: ["heading", "subtitle", "products"],
  BRAND_STORY: ["heading", "storyQuote", "founderName", "bodyText", "imageUrl"],
  TESTIMONIALS: ["heading", "subtitle", "items"],
  REVIEWS: ["heading", "subtitle", "items"],
  FAQ: ["heading", "items"],
  FAQ_GROUP_SHIPPING: ["heading", "groupTitle", "items"],
  FAQ_GROUP_RETURNS: ["heading", "groupTitle", "items"],
  FAQ_GROUP_GENERAL: ["heading", "groupTitle", "items"],
  QUICK_HELP_GRID: ["cards"],
  CONTACT_SUPPORT_CARD: ["heading", "subtitle", "buttonText"],
  STICKY_BUY_BAR: ["title", "price", "imageUrl", "buttonAction"],
  FINAL_CTA: ["heading", "subheading", "buttonPrimary"],
  NEWSLETTER_SIGNUP: ["heading", "subheading", "buttonText"],
  FOOTER: ["brandName", "copyrightText", "links"],
};

// Curated 1-Click Aesthetic Presets for Global Theme Customizer
export const PRESET_PALETTES = [
  {
    id: "minimal",
    name: "Minimal Blue",
    tokens: {
      "--pm-primary": "#0052FF",
      "--pm-accent": "#2563EB",
      "--pm-bg": "#FFFFFF",
      "--pm-surface": "#F8FAFC",
      "--pm-text-heading": "#0F172A",
      "--pm-text-body": "#475569",
      "--pm-radius": "8px",
    },
  },
  {
    id: "midnight",
    name: "Midnight Dark",
    tokens: {
      "--pm-primary": "#3B82F6",
      "--pm-accent": "#1D4ED8",
      "--pm-bg": "#09090B",
      "--pm-surface": "#18181B",
      "--pm-text-heading": "#FAFAFA",
      "--pm-text-body": "#A1A1AA",
      "--pm-radius": "10px",
    },
  },
  {
    id: "emerald",
    name: "Emerald Luxury",
    tokens: {
      "--pm-primary": "#059669",
      "--pm-accent": "#10B981",
      "--pm-bg": "#F0FDF4",
      "--pm-surface": "#DCFCE7",
      "--pm-text-heading": "#064E3B",
      "--pm-text-body": "#065F46",
      "--pm-radius": "12px",
    },
  },
  {
    id: "terracotta",
    name: "Warm Earth",
    tokens: {
      "--pm-primary": "#C2410C",
      "--pm-accent": "#EA580C",
      "--pm-bg": "#FFF7ED",
      "--pm-surface": "#FFEDD5",
      "--pm-text-heading": "#431407",
      "--pm-text-body": "#7C2D12",
      "--pm-radius": "6px",
    },
  },
  {
    id: "editorial",
    name: "Editorial Purple",
    tokens: {
      "--pm-primary": "#4338CA",
      "--pm-accent": "#3730A3",
      "--pm-bg": "#FAF5EF",
      "--pm-surface": "#F5EFEB",
      "--pm-text-heading": "#1E1B4B",
      "--pm-text-body": "#4B5563",
      "--pm-radius": "4px",
    },
  },
  {
    id: "obsidian_gold",
    name: "Obsidian & Gold",
    tokens: {
      "--pm-primary": "#D97706",
      "--pm-accent": "#F59E0B",
      "--pm-bg": "#0F172A",
      "--pm-surface": "#1E293B",
      "--pm-text-heading": "#F8FAFC",
      "--pm-text-body": "#94A3B8",
      "--pm-radius": "8px",
    },
  },
];

