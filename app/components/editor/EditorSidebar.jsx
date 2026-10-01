import { useState, useEffect, useRef } from "react";
import {
  Palette,
  Sparkles,
  RefreshCw,
  Layers,
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  MousePointer,
  Layout,
  Star,
  HelpCircle,
  ShoppingBag,
  ShieldCheck,
  Tag,
  BookOpen,
  Mail,
  Grid,
  Zap,
  Plus,
} from "lucide-react";
import { BUTTON_ACTION_TYPES, SECTION_ALLOWED_KEYS, PRESET_PALETTES } from "../../libs/ai-config";

export default function EditorSidebar({
  sections = [],
  themeTokens = {},
  selectedSectionId,
  setSelectedSectionId,
  onToggleVisibility,
  onMoveSection,
  onDeleteSection,
  onUpdateSectionData,
  onAiReRollSection,
  isReRollingSection,
  onUpdateThemeTokens,
  onAiReRollTheme,
  isReRollingTheme,
}) {
  // Theme customizer open/close state (Default closed)
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [themePrompt, setThemePrompt] = useState("");

  // Drag & drop state for layers
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'top' | 'bottom'
  const dragNodeRef = useRef(null);

  // Section icon resolver with distinct accent colors
  const getSectionIcon = (type) => {
    const t = (type || "").toUpperCase();
    switch (t) {
      case "ANNOUNCEMENT_BAR":
      case "PROMO_BANNER":
        return <Tag size={15} color="#F59E0B" />;
      case "PAGE_HEADER":
      case "HEADER":
        return <Layout size={15} color="#3B82F6" />;
      case "HERO":
        return <Sparkles size={15} color="#8B5CF6" />;
      case "PRODUCT_SHOWCASE":
      case "PRODUCT_DETAILS":
      case "FEATURED_PRODUCT":
      case "FEATURED_GRID":
        return <ShoppingBag size={15} color="#10B981" />;
      case "TRUST_BADGES":
      case "BENEFITS":
      case "BENEFITS_GRID":
      case "FEATURES":
        return <ShieldCheck size={15} color="#06B6D4" />;
      case "FEATURE_SPOTLIGHT":
      case "COMPARISON_TABLE":
        return <Grid size={15} color="#6366F1" />;
      case "COLLECTION_LIST":
        return <Layers size={15} color="#3B82F6" />;
      case "BRAND_STORY":
        return <BookOpen size={15} color="#D97706" />;
      case "TESTIMONIALS":
      case "REVIEWS":
        return <Star size={15} color="#F59E0B" />;
      case "FAQ":
      case "FAQ_GROUP_SHIPPING":
      case "FAQ_GROUP_RETURNS":
      case "FAQ_GROUP_GENERAL":
        return <HelpCircle size={15} color="#EC4899" />;
      case "QUICK_HELP_GRID":
      case "CONTACT_SUPPORT_CARD":
      case "NEWSLETTER_SIGNUP":
        return <Mail size={15} color="#059669" />;
      case "STICKY_BUY_BAR":
      case "FINAL_CTA":
        return <Zap size={15} color="#EF4444" />;
      default:
        return <Layers size={15} color="#64748B" />;
    }
  };

  const formatSectionName = (type) => {
    if (!type) return "Section";
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedIndex === null || draggedIndex === index) {
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isTop = e.clientY < midY;

    setDragOverIndex(index);
    setDropPosition(isTop ? "top" : "bottom");
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    let finalTargetIndex = targetIndex;
    if (dropPosition === "bottom" && draggedIndex > targetIndex) {
      finalTargetIndex = targetIndex + 1;
    } else if (dropPosition === "top" && draggedIndex < targetIndex) {
      finalTargetIndex = targetIndex - 1;
    }

    onMoveSection(draggedIndex, finalTargetIndex);
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
    dragNodeRef.current = null;
  };

  // Trigger AI Theme Re-Roll
  const handleTriggerAiTheme = () => {
    if (onAiReRollTheme && themePrompt.trim()) {
      onAiReRollTheme(themePrompt);
      setThemePrompt("");
    }
  };

  // Handle Token Change
  const handleTokenChange = (key, value) => {
    onUpdateThemeTokens({
      ...themeTokens,
      [key]: value,
    });
  };

  return (
    <aside className="pm-editor-sidebar">
      {/* 1. GLOBAL THEME & PALETTE ACCORDION CARD */}
      <div className={`pm-theme-card ${isThemeOpen ? "pm-theme-card--open" : ""}`}>
        <div
          className="pm-theme-card-header"
          onClick={() => setIsThemeOpen(!isThemeOpen)}
        >
          <div className="pm-theme-header-left">
            <div className="pm-theme-icon-badge">
              <Palette size={16} color="#0052FF" />
            </div>
            <div>
              <div className="pm-theme-title">Global Theme & Palette</div>
              <div className="pm-theme-subtitle">
                {isThemeOpen ? "6 Design Tokens • Live Sync" : "Click to customize colors & style"}
              </div>
            </div>
          </div>

          <div className="pm-theme-header-right">
            {/* 6-Color Swatch Preview when closed */}
            {!isThemeOpen && (
              <div className="pm-theme-preview-dots">
                <span style={{ background: themeTokens["--pm-primary"] || "#0052FF" }} />
                <span style={{ background: themeTokens["--pm-accent"] || "#2563EB" }} />
                <span style={{ background: themeTokens["--pm-bg"] || "#FFFFFF" }} />
                <span style={{ background: themeTokens["--pm-surface"] || "#F8FAFC" }} />
                <span style={{ background: themeTokens["--pm-text-heading"] || "#0F172A" }} />
                <span style={{ background: themeTokens["--pm-text-body"] || "#475569" }} />
              </div>
            )}
            <div className={`pm-chevron-wrap ${isThemeOpen ? "pm-chevron-wrap--open" : ""}`}>
              <ChevronDown size={15} color="#64748B" />
            </div>
          </div>
        </div>

        {/* Expanded Theme Customizer Body */}
        {isThemeOpen && (
          <div className="pm-theme-card-body">
            {/* AI Theme Palette Generator Bar */}
            <div className="pm-ai-box pm-ai-box--theme">
              <div className="pm-ai-box-header">
                <div className="pm-ai-box-title">
                  <Sparkles size={14} color="#0052FF" />
                  <span>AI Color Palette Generator</span>
                </div>
                <span className="pm-ai-badge">AI Assistant</span>
              </div>
              
              <p className="pm-ai-box-desc">
                Describe your desired look or vibe and let AI generate a high-contrast 6-color design system:
              </p>

              <div className="pm-ai-input-row">
                <input
                  type="text"
                  className="pm-ai-input"
                  placeholder="e.g. Luxury emerald & gold, Cyberpunk dark neon, Warm earthy pastel..."
                  value={themePrompt}
                  onChange={(e) => setThemePrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isReRollingTheme && themePrompt.trim()) handleTriggerAiTheme();
                  }}
                />
                <button
                  type="button"
                  className="pm-ai-reroll-btn"
                  onClick={handleTriggerAiTheme}
                  disabled={isReRollingTheme || !themePrompt.trim()}
                  title="Generate theme palette with AI"
                >
                  <RefreshCw size={12} className={isReRollingTheme ? "pm-spin" : ""} />
                  <span>{isReRollingTheme ? "Generating..." : "Re-roll"}</span>
                </button>
              </div>

              {/* Quick Prompt Ideas */}
              <div className="pm-ai-prompt-suggestions">
                <span className="pm-ai-suggestions-label">Ideas:</span>
                {[
                  "Luxury Emerald & Gold",
                  "Cyberpunk Dark Neon",
                  "Warm Earthy Terracotta",
                  "Clean Minimalist Tech",
                  "Soft Pastel Boutique",
                ].map((promptIdea) => (
                  <button
                    key={promptIdea}
                    type="button"
                    className="pm-ai-suggestion-chip"
                    onClick={() => setThemePrompt(promptIdea)}
                  >
                    {promptIdea}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick 1-Click Preset Palettes */}
            <div style={{ marginTop: "14px" }}>
              <label className="pm-field-label">Curated Presets</label>
              <div className="pm-preset-chips-grid">
                {(PRESET_PALETTES || [
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
                ]).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="pm-preset-chip"
                    onClick={() => onUpdateThemeTokens({ ...themeTokens, ...preset.tokens })}
                  >
                    <div className="pm-preset-chip-dots">
                      <span style={{ background: preset.tokens["--pm-primary"] }} />
                      <span style={{ background: preset.tokens["--pm-accent"] }} />
                      <span style={{ background: preset.tokens["--pm-bg"] }} />
                      <span style={{ background: preset.tokens["--pm-surface"] }} />
                    </div>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6 Manual CSS Color Pickers */}
            <div style={{ marginTop: "14px" }}>
              <label className="pm-field-label">Design Tokens (6 Colors)</label>
              <div className="pm-color-pickers-list">
                <ColorPickerRow
                  label="Primary Brand"
                  hint="Buttons & Badges"
                  tokenKey="--pm-primary"
                  value={themeTokens?.["--pm-primary"] || "#0052FF"}
                  onChange={handleTokenChange}
                />

                <ColorPickerRow
                  label="Accent / Hover"
                  hint="Secondary Accents"
                  tokenKey="--pm-accent"
                  value={themeTokens?.["--pm-accent"] || "#2563EB"}
                  onChange={handleTokenChange}
                />

                <ColorPickerRow
                  label="Canvas Background"
                  hint="Main Background"
                  tokenKey="--pm-bg"
                  value={themeTokens?.["--pm-bg"] || "#FFFFFF"}
                  onChange={handleTokenChange}
                />

                <ColorPickerRow
                  label="Surface / Card Fill"
                  hint="Section & Card BG"
                  tokenKey="--pm-surface"
                  value={themeTokens?.["--pm-surface"] || "#F8FAFC"}
                  onChange={handleTokenChange}
                />

                <ColorPickerRow
                  label="Headings Color"
                  hint="Titles & Headings"
                  tokenKey="--pm-text-heading"
                  value={themeTokens?.["--pm-text-heading"] || "#0F172A"}
                  onChange={handleTokenChange}
                />

                <ColorPickerRow
                  label="Body Text Color"
                  hint="Paragraphs & Text"
                  tokenKey="--pm-text-body"
                  value={themeTokens?.["--pm-text-body"] || "#475569"}
                  onChange={handleTokenChange}
                />
              </div>
            </div>

            {/* Corner Radius Pill Selector */}
            <div style={{ marginTop: "14px" }}>
              <label className="pm-field-label">Corner Radius</label>
              <div className="pm-radius-pills">
                {["0px", "4px", "8px", "12px", "16px", "999px"].map((rad) => {
                  const isActive = (themeTokens?.["--pm-radius"] || "8px") === rad;
                  return (
                    <button
                      key={rad}
                      type="button"
                      className={`pm-radius-pill ${isActive ? "pm-radius-pill--active" : ""}`}
                      onClick={() => handleTokenChange("--pm-radius", rad)}
                    >
                      {rad === "0px" ? "Sharp" : rad === "999px" ? "Pill" : rad}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. PAGE LAYERS ACCORDION LIST */}
      <div className="pm-sidebar-section-header">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Layers size={14} color="#64748B" />
          <span className="pm-sidebar-section-title">PAGE LAYERS</span>
        </div>
        <span className="pm-sidebar-badge">{sections.length}</span>
      </div>

      <div className="pm-layers-accordion-list">
        {sections.map((sec, index) => {
          const isSelected = sec.id === selectedSectionId;
          const isHidden = sec.visible === false;
          const isDragging = draggedIndex === index;
          const isTarget = dragOverIndex === index;

          return (
            <div
              key={sec.id || index}
              className={`pm-layer-card ${isSelected ? "pm-layer-card--active" : ""} ${
                isDragging ? "pm-layer-item--dragging" : ""
              } ${isTarget ? (dropPosition === "top" ? "pm-drag-over-top" : "pm-drag-over-bottom") : ""}`}
            >
              {/* Layer Card Header */}
              <div
                className="pm-layer-header"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedSectionId(isSelected ? null : sec.id)}
              >
                <div className="pm-layer-header-left">
                  {/* Drag Grip Handle */}
                  <div
                    className="pm-layer-grip"
                    title="Drag to reorder"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GripVertical size={14} />
                  </div>
                  {getSectionIcon(sec.type)}
                  <span className="pm-layer-title" style={{ opacity: isHidden ? 0.45 : 1 }}>
                    {formatSectionName(sec.type)}
                  </span>
                </div>

                <div className="pm-layer-header-actions" onClick={(e) => e.stopPropagation()}>
                  {/* Visibility Toggle Button */}
                  <button
                    type="button"
                    className="pm-icon-ghost-btn"
                    onClick={() => onToggleVisibility(sec.id)}
                    title={isHidden ? "Show section" : "Hide section"}
                  >
                    {isHidden ? <EyeOff size={14} color="#94A3B8" /> : <Eye size={14} color="#64748B" />}
                  </button>

                  {/* Delete Button */}
                  {sections.length > 1 && (
                    <button
                      type="button"
                      className="pm-icon-ghost-btn pm-icon-ghost-btn--danger"
                      onClick={() => onDeleteSection(sec.id)}
                      title="Delete section"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {/* Expand / Collapse Chevron */}
                  <div
                    className={`pm-chevron-wrap ${isSelected ? "pm-chevron-wrap--open" : ""}`}
                    onClick={() => setSelectedSectionId(isSelected ? null : sec.id)}
                  >
                    <ChevronDown size={14} color="#64748B" />
                  </div>
                </div>
              </div>

              {/* Inline Section Inspector Body */}
              {isSelected && (
                <div className="pm-layer-body">
                  <SectionInlineEditor
                    section={sec}
                    onUpdateData={(newData) => onUpdateSectionData(sec.id, newData)}
                    onAiReRoll={(prompt) => onAiReRollSection(sec, prompt)}
                    isReRolling={isReRollingSection}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

/**
 * 6-Token Color Picker Row with Swatch & Hex Text Input
 */
function ColorPickerRow({ label, hint, tokenKey, value, onChange }) {
  const normalizeHex = (raw) => {
    if (typeof raw !== "string") return null;
    let val = raw.trim();
    if (!val.startsWith("#")) val = "#" + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) return val;
    if (/^#[0-9A-Fa-f]{3}$/.test(val)) {
      return `#${val[1]}${val[1]}${val[2]}${val[2]}${val[3]}${val[3]}`;
    }
    return null;
  };

  const currentValidHex = normalizeHex(value) || "#0052FF";
  const [localText, setLocalText] = useState(typeof value === "string" ? value : currentValidHex);

  useEffect(() => {
    if (typeof value === "string") {
      setLocalText(value);
    }
  }, [value]);

  const handleNativeColorChange = (e) => {
    const val = e.target.value.toUpperCase();
    setLocalText(val);
    if (onChange) onChange(tokenKey, val);
  };

  const handleTextChange = (e) => {
    const raw = e.target.value;
    setLocalText(raw);

    const cleaned = normalizeHex(raw);
    if (cleaned && onChange) {
      onChange(tokenKey, cleaned.toUpperCase());
    }
  };

  const handleBlur = () => {
    const cleaned = normalizeHex(localText);
    if (cleaned) {
      const upper = cleaned.toUpperCase();
      setLocalText(upper);
      if (onChange) onChange(tokenKey, upper);
    } else {
      setLocalText(currentValidHex.toUpperCase());
    }
  };

  const swatchHex = normalizeHex(localText) || currentValidHex;

  return (
    <div className="pm-color-row">
      <div className="pm-color-row-left">
        <label
          className="pm-color-swatch-wrapper"
          style={{ background: swatchHex }}
          title="Click to open color picker"
        >
          <input
            type="color"
            className="pm-color-native-input"
            value={swatchHex.toLowerCase()}
            onChange={handleNativeColorChange}
          />
        </label>
        <div>
          <div className="pm-color-label">{label}</div>
          {hint && <div className="pm-color-hint">{hint}</div>}
        </div>
      </div>

      <input
        type="text"
        className="pm-color-hex-input"
        value={localText}
        maxLength={7}
        placeholder="#000000"
        onChange={handleTextChange}
        onBlur={handleBlur}
      />
    </div>
  );
}

/**
 * Inline Section Inspector Editor (Renders inside the expanded accordion card)
 */
function SectionInlineEditor({ section, onUpdateData, onAiReRoll, isReRolling }) {
  const [aiPrompt, setAiPrompt] = useState("");
  const data = section.data || {};

  const secType = (section.type || "").toUpperCase();
  const allowedKeys = SECTION_ALLOWED_KEYS[secType];
  const isFieldAllowed = (fieldKey) => !allowedKeys || allowedKeys.includes(fieldKey);

  const handleFieldChange = (key, value) => {
    onUpdateData({
      ...data,
      [key]: value,
    });
  };

  const handleButtonSchemaChange = (buttonKey, updatedField, value) => {
    const currentBtn = data[buttonKey] || {};
    onUpdateData({
      ...data,
      [buttonKey]: {
        ...currentBtn,
        [updatedField]: value,
      },
    });
  };

  const handleTriggerReRoll = () => {
    if (onAiReRoll) {
      onAiReRoll(aiPrompt);
      setAiPrompt("");
    }
  };

  return (
    <div className="pm-inline-editor-wrap">
      {/* AI Section Micro-Edit Bar */}
      <div className="pm-ai-box">
        <div className="pm-ai-box-title">
          <Sparkles size={13} color="#0052FF" />
          <span>AI Section Re-roll</span>
        </div>
        <div className="pm-ai-input-row">
          <input
            type="text"
            className="pm-ai-input"
            placeholder="e.g. Make copy punchier, add 20% discount..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isReRolling) handleTriggerReRoll();
            }}
          />
          <button
            type="button"
            className="pm-ai-reroll-btn"
            onClick={handleTriggerReRoll}
            disabled={isReRolling}
            title="Re-roll this section using AI"
          >
            <RefreshCw size={12} className={isReRolling ? "pm-spin" : ""} />
            <span>{isReRolling ? "..." : "Re-roll"}</span>
          </button>
        </div>
      </div>

      {/* 1. TEXT FIELDS */}
      {isFieldAllowed("text") && "text" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Banner Text</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.text || ""}
            onChange={(e) => handleFieldChange("text", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("badge") && "badge" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Badge Text</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.badge || ""}
            onChange={(e) => handleFieldChange("badge", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("headline") && "headline" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Headline</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.headline || ""}
            onChange={(e) => handleFieldChange("headline", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("title") && "title" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Title</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.title || ""}
            onChange={(e) => handleFieldChange("title", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("heading") && "heading" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Heading</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.heading || ""}
            onChange={(e) => handleFieldChange("heading", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("groupTitle") && "groupTitle" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Group Title</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.groupTitle || ""}
            onChange={(e) => handleFieldChange("groupTitle", e.target.value)}
          />
        </div>
      )}

      {/* Pricing Fields */}
      {isFieldAllowed("price") && "price" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Price</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.price || ""}
            onChange={(e) => handleFieldChange("price", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("compareAtPrice") && "compareAtPrice" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Compare-At Price (Strikethrough)</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.compareAtPrice || ""}
            onChange={(e) => handleFieldChange("compareAtPrice", e.target.value)}
          />
        </div>
      )}

      {/* Subheadings / Descriptions */}
      {isFieldAllowed("subheadline") && "subheadline" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Subheadline</label>
          <textarea
            className="pm-form-textarea"
            value={data.subheadline || ""}
            onChange={(e) => handleFieldChange("subheadline", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("subtitle") && "subtitle" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Subtitle</label>
          <textarea
            className="pm-form-textarea"
            value={data.subtitle || ""}
            onChange={(e) => handleFieldChange("subtitle", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("subheading") && "subheading" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Subheading</label>
          <textarea
            className="pm-form-textarea"
            value={data.subheading || ""}
            onChange={(e) => handleFieldChange("subheading", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("description") && "description" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Description</label>
          <textarea
            className="pm-form-textarea"
            value={data.description || ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("storyQuote") && "storyQuote" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Story Quote</label>
          <textarea
            className="pm-form-textarea"
            value={data.storyQuote || ""}
            onChange={(e) => handleFieldChange("storyQuote", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("bodyText") && "bodyText" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Body Text</label>
          <textarea
            className="pm-form-textarea"
            value={data.bodyText || ""}
            onChange={(e) => handleFieldChange("bodyText", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("founderName") && "founderName" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Founder / Signature</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.founderName || ""}
            onChange={(e) => handleFieldChange("founderName", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("countdownText") && "countdownText" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Countdown Text</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.countdownText || ""}
            onChange={(e) => handleFieldChange("countdownText", e.target.value)}
          />
        </div>
      )}

      {isFieldAllowed("code") && "code" in data && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Coupon Code</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.code || ""}
            onChange={(e) => handleFieldChange("code", e.target.value)}
          />
        </div>
      )}

      {/* 2. IMAGE URL FIELD */}
      {Boolean(isFieldAllowed("imageUrl") && "imageUrl" in data && data.imageUrl !== undefined && typeof data.imageUrl === "string") && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Image URL</label>
          <input
            type="text"
            className="pm-form-input"
            value={data.imageUrl || ""}
            onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
          />
          {data.imageUrl && (
            <img
              src={data.imageUrl}
              alt="Preview"
              style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "6px", marginTop: "6px" }}
            />
          )}
        </div>
      )}

      {/* 3. BUTTON ACTION SCHEMA INSPECTORS */}
      {Boolean(isFieldAllowed("buttonPrimary") && data.buttonPrimary && typeof data.buttonPrimary === "object") && (
        <InlineButtonInspector
          title="Primary Button Action"
          buttonSchema={data.buttonPrimary}
          onChange={(field, val) => handleButtonSchemaChange("buttonPrimary", field, val)}
        />
      )}

      {Boolean(isFieldAllowed("buttonSecondary") && data.buttonSecondary && typeof data.buttonSecondary === "object") && (
        <InlineButtonInspector
          title="Secondary Button Action"
          buttonSchema={data.buttonSecondary}
          onChange={(field, val) => handleButtonSchemaChange("buttonSecondary", field, val)}
        />
      )}

      {Boolean(isFieldAllowed("buttonAction") && (data.buttonAction || secType === "CONTACT_SUPPORT_CARD" || secType === "STICKY_BUY_BAR")) && (
        <InlineButtonInspector
          title={secType === "CONTACT_SUPPORT_CARD" ? "Contact Button Action" : "Button Action"}
          buttonSchema={
            data.buttonAction || {
              label: data.buttonText || "Contact Support",
              actionType: "LINK",
              target: data.buttonLink || "/pages/contact",
              style: "primary",
            }
          }
          onChange={(field, val) => {
            const currentBtn = data.buttonAction || {
              label: data.buttonText || "Contact Support",
              actionType: "LINK",
              target: data.buttonLink || "/pages/contact",
              style: "primary",
            };
            handleFieldChange("buttonAction", {
              ...currentBtn,
              [field]: val,
            });
          }}
        />
      )}

      {/* 4. REPEATABLE ITEMS (COLLECTION_LIST, FAQ, TESTIMONIALS, BENEFITS) */}
      {isFieldAllowed("items") && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">
            {secType === "COLLECTION_LIST" ? "Collection Cards" : "Items"} ({Array.isArray(data.items) ? data.items.length : 0})
          </label>
          {Array.isArray(data.items) && data.items.map((item, idx) => {
            const itemObj = typeof item === "object" && item !== null ? item : { title: typeof item === "string" ? item : "" };
            const itemTitle = itemObj.title || (typeof item === "string" ? item : "Untitled");

            return (
              <div key={idx} className="pm-repeatable-card" style={{ marginBottom: "12px" }}>
                <div className="pm-repeatable-header">
                  <span style={{ fontWeight: "700" }}>
                    {secType === "COLLECTION_LIST"
                      ? `Category ${idx + 1}: ${itemTitle}`
                      : `Item ${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    className="pm-icon-ghost-btn pm-icon-ghost-btn--danger"
                    onClick={() => {
                      const newItems = data.items.filter((_, i) => i !== idx);
                      handleFieldChange("items", newItems);
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* COLLECTION_LIST item */}
                {secType === "COLLECTION_LIST" ? (
                  <>
                    <div style={{ marginBottom: "6px" }}>
                      <label className="pm-sub-label">Collection Title</label>
                      <input
                        type="text"
                        className="pm-form-input"
                        placeholder="e.g. Snowboards"
                        value={itemObj.title || ""}
                        onChange={(e) => {
                          const newItems = [...data.items];
                          newItems[idx] = { ...itemObj, title: e.target.value };
                          handleFieldChange("items", newItems);
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "6px" }}>
                      <label className="pm-sub-label">Collection Destination (URL Path or Section Anchor)</label>
                      <input
                        type="text"
                        className="pm-form-input"
                        placeholder="/collections/all"
                        value={itemObj.link || itemObj.url || (itemObj.handle ? `/collections/${itemObj.handle}` : "")}
                        onChange={(e) => {
                          const newItems = [...data.items];
                          newItems[idx] = {
                            ...itemObj,
                            link: e.target.value,
                            url: e.target.value,
                          };
                          handleFieldChange("items", newItems);
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "6px" }}>
                      <label className="pm-sub-label">Image URL</label>
                      <input
                        type="text"
                        className="pm-form-input"
                        placeholder="https://..."
                        value={itemObj.imageUrl || ""}
                        onChange={(e) => {
                          const newItems = [...data.items];
                          newItems[idx] = { ...itemObj, imageUrl: e.target.value };
                          handleFieldChange("items", newItems);
                        }}
                      />
                      {itemObj.imageUrl && (
                        <img
                          src={itemObj.imageUrl}
                          alt={itemTitle}
                          style={{ width: "100%", height: "70px", objectFit: "contain", background: "#FFFFFF", borderRadius: "6px", marginTop: "4px", border: "1px solid #E2E8F0" }}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* FAQ item */}
                    {("question" in itemObj || secType.includes("FAQ")) && (
                      <input
                        type="text"
                        className="pm-form-input"
                        placeholder="Question"
                        style={{ marginBottom: "6px" }}
                        value={itemObj.question || ""}
                        onChange={(e) => {
                          const newItems = [...data.items];
                          newItems[idx] = { ...itemObj, question: e.target.value };
                          handleFieldChange("items", newItems);
                        }}
                      />
                    )}
                    {("answer" in itemObj || secType.includes("FAQ")) && (
                      <textarea
                        className="pm-form-textarea"
                        placeholder="Answer"
                        value={itemObj.answer || ""}
                        onChange={(e) => {
                          const newItems = [...data.items];
                          newItems[idx] = { ...itemObj, answer: e.target.value };
                          handleFieldChange("items", newItems);
                        }}
                      />
                    )}

                    {/* Title / Description item */}
                    {("title" in itemObj && !secType.includes("FAQ") && !secType.includes("TESTIMONIALS") && !secType.includes("REVIEWS")) && (
                      <input
                        type="text"
                        className="pm-form-input"
                        placeholder="Title"
                        style={{ marginBottom: "6px" }}
                        value={itemObj.title || ""}
                        onChange={(e) => {
                          const newItems = [...data.items];
                          newItems[idx] = { ...itemObj, title: e.target.value };
                          handleFieldChange("items", newItems);
                        }}
                      />
                    )}
                    {("description" in itemObj || "desc" in itemObj) && (
                      <textarea
                        className="pm-form-textarea"
                        placeholder="Description"
                        value={itemObj.description || itemObj.desc || ""}
                        onChange={(e) => {
                          const newItems = [...data.items];
                          newItems[idx] = { ...itemObj, description: e.target.value };
                          handleFieldChange("items", newItems);
                        }}
                      />
                    )}

                    {/* Review item */}
                    {("name" in itemObj || secType.includes("TESTIMONIALS") || secType.includes("REVIEWS")) && (
                      <input
                        type="text"
                        className="pm-form-input"
                        placeholder="Reviewer Name"
                        style={{ marginBottom: "6px" }}
                        value={itemObj.name || ""}
                        onChange={(e) => {
                          const newItems = [...data.items];
                          newItems[idx] = { ...itemObj, name: e.target.value };
                          handleFieldChange("items", newItems);
                        }}
                      />
                    )}
                    {("comment" in itemObj || secType.includes("TESTIMONIALS") || secType.includes("REVIEWS")) && (
                      <textarea
                        className="pm-form-textarea"
                        placeholder="Review Comment"
                        value={itemObj.comment || ""}
                        onChange={(e) => {
                          const newItems = [...data.items];
                          newItems[idx] = { ...itemObj, comment: e.target.value };
                          handleFieldChange("items", newItems);
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}

          <button
            type="button"
            className="pm-add-item-btn"
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "1px dashed #CBD5E1",
              borderRadius: "6px",
              color: "#0052FF",
              fontSize: "12px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
              marginTop: "4px",
            }}
            onClick={() => {
              const newItem = secType === "COLLECTION_LIST"
                ? { title: "New Collection", link: "/collections/all", imageUrl: "" }
                : secType.includes("FAQ")
                ? { question: "New Question?", answer: "Answer details here." }
                : (secType.includes("TESTIMONIALS") || secType.includes("REVIEWS"))
                ? { name: "Customer Name", comment: "Great product!", rating: 5, badge: "Verified Buyer" }
                : { title: "New Benefit", description: "Benefit description" };
              const newItems = [...(Array.isArray(data.items) ? data.items : []), newItem];
              handleFieldChange("items", newItems);
            }}
          >
            <Plus size={13} />
            <span>{secType === "COLLECTION_LIST" ? "Add Collection Card" : "Add Item"}</span>
          </button>
        </div>
      )}

      {/* 5. REPEATABLE PRODUCTS (FEATURED_GRID) */}
      {isFieldAllowed("products") && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">
            Featured Products ({Array.isArray(data.products) ? data.products.length : 0})
          </label>
          {Array.isArray(data.products) && data.products.map((prod, idx) => {
            const targetVariantId = prod.variantId || prod.primaryVariantId || prod.id || "";
            const prodBtn = prod.buttonAction || {
              label: "Add to Cart",
              actionType: "ADD_TO_CART",
              target: targetVariantId,
              variantId: targetVariantId,
              style: "primary",
            };

            return (
              <div key={prod.id || idx} className="pm-repeatable-card" style={{ marginBottom: "14px" }}>
                <div className="pm-repeatable-header">
                  <span style={{ fontWeight: "700" }}>Product {idx + 1}: {prod.title || "Untitled"}</span>
                  <button
                    type="button"
                    className="pm-icon-ghost-btn pm-icon-ghost-btn--danger"
                    onClick={() => {
                      const newProducts = data.products.filter((_, i) => i !== idx);
                      handleFieldChange("products", newProducts);
                    }}
                    title="Remove product"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <label className="pm-sub-label">Product Name</label>
                  <input
                    type="text"
                    className="pm-form-input"
                    value={prod.title || ""}
                    placeholder="Product Title"
                    onChange={(e) => {
                      const newProds = [...data.products];
                      newProds[idx] = { ...newProds[idx], title: e.target.value };
                      handleFieldChange("products", newProds);
                    }}
                  />
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <label className="pm-sub-label">Price</label>
                  <input
                    type="text"
                    className="pm-form-input"
                    value={prod.price || ""}
                    placeholder="$99.00 USD"
                    onChange={(e) => {
                      const newProds = [...data.products];
                      newProds[idx] = { ...newProds[idx], price: e.target.value };
                      handleFieldChange("products", newProds);
                    }}
                  />
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <label className="pm-sub-label">Image URL</label>
                  <input
                    type="text"
                    className="pm-form-input"
                    value={prod.imageUrl || ""}
                    placeholder="https://..."
                    onChange={(e) => {
                      const newProds = [...data.products];
                      newProds[idx] = { ...newProds[idx], imageUrl: e.target.value };
                      handleFieldChange("products", newProds);
                    }}
                  />
                  {prod.imageUrl && (
                    <img
                      src={prod.imageUrl}
                      alt={prod.title || "Product"}
                      style={{ width: "100%", height: "80px", objectFit: "contain", background: "#FFFFFF", borderRadius: "6px", marginTop: "4px", border: "1px solid #E2E8F0" }}
                    />
                  )}
                </div>

                {/* Product Action Button Inspector */}
                <InlineButtonInspector
                  title="Product Add-to-Cart Action"
                  buttonSchema={prodBtn}
                  onChange={(field, val) => {
                    const newProds = [...data.products];
                    const updatedButton = {
                      ...prodBtn,
                      [field]: val,
                    };
                    if (field === "target" && (updatedButton.actionType === "ADD_TO_CART" || updatedButton.actionType === "BUY_NOW")) {
                      updatedButton.variantId = val;
                    }
                    newProds[idx] = {
                      ...newProds[idx],
                      buttonAction: updatedButton,
                      ...(field === "target" ? { variantId: val } : {}),
                    };
                    handleFieldChange("products", newProds);
                  }}
                />
              </div>
            );
          })}

          <button
            type="button"
            className="pm-add-item-btn"
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "1px dashed #CBD5E1",
              borderRadius: "6px",
              color: "#0052FF",
              fontSize: "12px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
              marginTop: "4px",
            }}
            onClick={() => {
              const newProducts = [
                ...(Array.isArray(data.products) ? data.products : []),
                {
                  id: `prod_${Date.now()}`,
                  title: "Featured Product",
                  price: "$99.00 USD",
                  imageUrl: "",
                  buttonAction: {
                    label: "Add to Cart",
                    actionType: "ADD_TO_CART",
                    target: "",
                    variantId: "",
                    style: "primary",
                  },
                },
              ];
              handleFieldChange("products", newProducts);
            }}
          >
            <Plus size={13} />
            <span>Add Featured Product</span>
          </button>
        </div>
      )}

      {/* 6. REPEATABLE CARDS (QUICK_HELP_GRID) */}
      {isFieldAllowed("cards") && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">
            Policy & Help Cards ({Array.isArray(data.cards) ? data.cards.length : 0})
          </label>
          {Array.isArray(data.cards) && data.cards.map((card, idx) => (
            <div key={idx} className="pm-repeatable-card" style={{ marginBottom: "12px" }}>
              <div className="pm-repeatable-header">
                <span>Card {idx + 1}</span>
                <button
                  type="button"
                  className="pm-icon-ghost-btn pm-icon-ghost-btn--danger"
                  onClick={() => {
                    const newCards = data.cards.filter((_, i) => i !== idx);
                    handleFieldChange("cards", newCards);
                  }}
                  title="Remove card"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div style={{ marginBottom: "6px" }}>
                <label className="pm-sub-label">Card Title</label>
                <input
                  type="text"
                  className="pm-form-input"
                  placeholder="Card Title (e.g. 30-Day Money Back)"
                  value={card.title || ""}
                  onChange={(e) => {
                    const newCards = [...data.cards];
                    newCards[idx] = { ...newCards[idx], title: e.target.value };
                    handleFieldChange("cards", newCards);
                  }}
                />
              </div>

              <div>
                <label className="pm-sub-label">Card Description</label>
                <textarea
                  className="pm-form-textarea"
                  placeholder="Card Description (e.g. Free returns within 30 days of purchase)"
                  value={card.description || ""}
                  onChange={(e) => {
                    const newCards = [...data.cards];
                    newCards[idx] = { ...newCards[idx], description: e.target.value };
                    handleFieldChange("cards", newCards);
                  }}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            className="pm-add-item-btn"
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "1px dashed #CBD5E1",
              borderRadius: "6px",
              color: "#0052FF",
              fontSize: "12px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
              marginTop: "4px",
            }}
            onClick={() => {
              const newCards = [
                ...(Array.isArray(data.cards) ? data.cards : []),
                { title: "New Policy / Feature", description: "Details and policy summary" },
              ];
              handleFieldChange("cards", newCards);
            }}
          >
            <Plus size={13} />
            <span>Add Help Card</span>
          </button>
        </div>
      )}

      {/* 7. SPOTLIGHT ROWS */}
      {isFieldAllowed("rows") && Array.isArray(data.rows) && (
        <div className="pm-form-field">
          <label className="pm-form-field-label">Spotlight Rows ({data.rows.length})</label>
          {data.rows.map((row, idx) => (
            <div key={idx} className="pm-repeatable-card">
              <div className="pm-repeatable-header">
                <span>Row {idx + 1}</span>
                <button
                  type="button"
                  className="pm-icon-ghost-btn pm-icon-ghost-btn--danger"
                  onClick={() => {
                    const newRows = data.rows.filter((_, i) => i !== idx);
                    handleFieldChange("rows", newRows);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {"feature" in row && (
                <input
                  type="text"
                  className="pm-form-input"
                  placeholder="Feature / Comparison Metric"
                  style={{ marginBottom: "6px" }}
                  value={row.feature || ""}
                  onChange={(e) => {
                    const newRows = [...data.rows];
                    newRows[idx] = { ...newRows[idx], feature: e.target.value };
                    handleFieldChange("rows", newRows);
                  }}
                />
              )}
              {"us" in row && (
                <input
                  type="text"
                  className="pm-form-input"
                  placeholder="Our Value (e.g. Yes - 100%)"
                  style={{ marginBottom: "6px" }}
                  value={row.us || ""}
                  onChange={(e) => {
                    const newRows = [...data.rows];
                    newRows[idx] = { ...newRows[idx], us: e.target.value };
                    handleFieldChange("rows", newRows);
                  }}
                />
              )}
              {"them" in row && (
                <input
                  type="text"
                  className="pm-form-input"
                  placeholder="Competitor Value (e.g. No)"
                  style={{ marginBottom: "6px" }}
                  value={row.them || ""}
                  onChange={(e) => {
                    const newRows = [...data.rows];
                    newRows[idx] = { ...newRows[idx], them: e.target.value };
                    handleFieldChange("rows", newRows);
                  }}
                />
              )}

              {"title" in row && (
                <input
                  type="text"
                  className="pm-form-input"
                  placeholder="Row Title"
                  style={{ marginBottom: "6px" }}
                  value={row.title || ""}
                  onChange={(e) => {
                    const newRows = [...data.rows];
                    newRows[idx] = { ...newRows[idx], title: e.target.value };
                    handleFieldChange("rows", newRows);
                  }}
                />
              )}
              {"description" in row && (
                <textarea
                  className="pm-form-textarea"
                  placeholder="Row Description"
                  value={row.description || ""}
                  onChange={(e) => {
                    const newRows = [...data.rows];
                    newRows[idx] = { ...newRows[idx], description: e.target.value };
                    handleFieldChange("rows", newRows);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Inline Button Action Schema Inspector
 */
function InlineButtonInspector({ title, buttonSchema, onChange }) {
  const schema = buttonSchema || {};

  return (
    <div className="pm-button-inspector-card">
      <div className="pm-button-inspector-header">
        <MousePointer size={13} color="#0052FF" />
        <span>{title}</span>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label className="pm-sub-label">Button Label</label>
        <input
          type="text"
          className="pm-form-input"
          value={schema.label || ""}
          placeholder="e.g. Add to Cart"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label className="pm-sub-label">Action Type</label>
        <select
          className="pm-form-select"
          value={schema.actionType || "ADD_TO_CART"}
          onChange={(e) => onChange("actionType", e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="ADD_TO_CART">ADD_TO_CART (AJAX /cart/add.js)</option>
          <option value="BUY_NOW">BUY_NOW (Direct Checkout /cart/{`{id}`}:1)</option>
          <option value="SCROLL_TO">SCROLL_TO (Smooth Scroll to Section)</option>
          <option value="LINK">LINK (Storefront Page or External URL)</option>
        </select>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label className="pm-sub-label">
          Target ({schema.actionType === "SCROLL_TO" ? "Anchor e.g. #sec_faq" : schema.actionType === "LINK" ? "URL Path" : "Variant GID / ID"})
        </label>
        <input
          type="text"
          className="pm-form-input"
          value={schema.target || ""}
          placeholder={
            schema.actionType === "SCROLL_TO"
              ? "#sec_comparison"
              : schema.actionType === "LINK"
              ? "/collections/all"
              : "gid://shopify/ProductVariant/..."
          }
          onChange={(e) => onChange("target", e.target.value)}
        />
      </div>

      <div>
        <label className="pm-sub-label">Visual Style</label>
        <select
          className="pm-form-select"
          value={schema.style || "primary"}
          onChange={(e) => onChange("style", e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="primary">Primary (Solid Brand Color)</option>
          <option value="secondary">Secondary (White with Border)</option>
          <option value="outline">Outline (Brand Border Transparent)</option>
        </select>
      </div>
    </div>
  );
}
