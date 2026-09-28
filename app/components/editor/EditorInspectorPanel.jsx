import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Sliders,
  Plus,
  Trash2,
  MousePointer,
  Link,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { BUTTON_ACTION_TYPES, SECTION_ALLOWED_KEYS } from "../../libs/ai-config";

export default function EditorInspectorPanel({
  selectedSection,
  onUpdateSectionData,
  onAiReRoll,
  isReRolling,
}) {
  const [aiPrompt, setAiPrompt] = useState("");

  if (!selectedSection) {
    return (
      <aside className="pm-editor-inspector-panel">
        <div className="pm-panel-header">
          <h2 className="pm-panel-title">Inspector</h2>
        </div>
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>
          <Sliders size={24} style={{ marginBottom: "8px", opacity: 0.5 }} />
          <p>Select any section in the layers list or canvas to customize its copy, button actions, and imagery.</p>
        </div>
      </aside>
    );
  }

  const secType = (selectedSection.type || "").toUpperCase();
  const allowedKeys = SECTION_ALLOWED_KEYS[secType];
  const isFieldAllowed = (fieldKey) => !allowedKeys || allowedKeys.includes(fieldKey);

  const data = selectedSection.data || {};

  const handleFieldChange = (key, value) => {
    onUpdateSectionData(selectedSection.id, {
      ...data,
      [key]: value,
    });
  };

  const handleButtonSchemaChange = (buttonKey, updatedField, value) => {
    const currentBtn = data[buttonKey] || {};
    onUpdateSectionData(selectedSection.id, {
      ...data,
      [buttonKey]: {
        ...currentBtn,
        [updatedField]: value,
      },
    });
  };

  const handleTriggerAiReRoll = () => {
    if (onAiReRoll) {
      onAiReRoll(selectedSection, aiPrompt);
      setAiPrompt("");
    }
  };

  return (
    <aside className="pm-editor-inspector-panel">
      {/* Panel Header */}
      <div className="pm-panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Sliders size={15} color="#64748B" />
          <h2 className="pm-panel-title">
            {selectedSection.type.replace(/_/g, " ")} Inspector
          </h2>
        </div>
      </div>

      <div className="pm-inspector-scroll">
        {/* AI Section Assistant Bar */}
        <div className="pm-ai-box">
          <div className="pm-ai-box-title">
            <Sparkles size={14} color="#2563EB" />
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
                if (e.key === "Enter" && !isReRolling) handleTriggerAiReRoll();
              }}
            />
            <button
              type="button"
              className="pm-ai-reroll-btn"
              onClick={handleTriggerAiReRoll}
              disabled={isReRolling}
              title="Re-roll this section using AI"
            >
              <RefreshCw size={13} className={isReRolling ? "pm-spin" : ""} />
              <span>{isReRolling ? "Re-rolling..." : "Re-roll"}</span>
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

        {/* Subheadings / Paragraphs */}
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
        {/* Primary Button */}
        {Boolean(isFieldAllowed("buttonPrimary") && data.buttonPrimary && typeof data.buttonPrimary === "object") && (
          <ButtonInspectorBox
            title="Primary Button Action"
            buttonSchema={data.buttonPrimary}
            onChange={(field, val) => handleButtonSchemaChange("buttonPrimary", field, val)}
          />
        )}

        {/* Secondary Button */}
        {Boolean(isFieldAllowed("buttonSecondary") && data.buttonSecondary && typeof data.buttonSecondary === "object") && (
          <ButtonInspectorBox
            title="Secondary Button Action"
            buttonSchema={data.buttonSecondary}
            onChange={(field, val) => handleButtonSchemaChange("buttonSecondary", field, val)}
          />
        )}

        {/* General Button Action */}
        {Boolean(isFieldAllowed("buttonAction") && data.buttonAction && typeof data.buttonAction === "object") && (
          <ButtonInspectorBox
            title="Button Action"
            buttonSchema={data.buttonAction}
            onChange={(field, val) => handleButtonSchemaChange("buttonAction", field, val)}
          />
        )}

        {/* 4. REPEATABLE ITEMS (FAQ, Benefits, Testimonials, Trust Badges) */}
        {isFieldAllowed("items") && Array.isArray(data.items) && (
          <div className="pm-form-field">
            <label className="pm-form-field-label">Items ({data.items.length})</label>
            {data.items.map((item, idx) => (
              <div key={idx} className="pm-repeatable-card">
                <div className="pm-repeatable-header">
                  <span>Item {idx + 1}</span>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}
                    onClick={() => {
                      const newItems = data.items.filter((_, i) => i !== idx);
                      handleFieldChange("items", newItems);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* FAQ item */}
                {"question" in item && (
                  <input
                    type="text"
                    className="pm-form-input"
                    placeholder="Question"
                    style={{ marginBottom: "6px" }}
                    value={item.question || ""}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx] = { ...newItems[idx], question: e.target.value };
                      handleFieldChange("items", newItems);
                    }}
                  />
                )}
                {"answer" in item && (
                  <textarea
                    className="pm-form-textarea"
                    placeholder="Answer"
                    value={item.answer || ""}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx] = { ...newItems[idx], answer: e.target.value };
                      handleFieldChange("items", newItems);
                    }}
                  />
                )}

                {/* Title / Description item */}
                {"title" in item && (
                  <input
                    type="text"
                    className="pm-form-input"
                    placeholder="Title"
                    style={{ marginBottom: "6px" }}
                    value={item.title || ""}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx] = { ...newItems[idx], title: e.target.value };
                      handleFieldChange("items", newItems);
                    }}
                  />
                )}
                {"description" in item && (
                  <textarea
                    className="pm-form-textarea"
                    placeholder="Description"
                    value={item.description || item.desc || ""}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx] = { ...newItems[idx], description: e.target.value };
                      handleFieldChange("items", newItems);
                    }}
                  />
                )}

                {/* Review item */}
                {"name" in item && (
                  <input
                    type="text"
                    className="pm-form-input"
                    placeholder="Reviewer Name"
                    style={{ marginBottom: "6px" }}
                    value={item.name || ""}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx] = { ...newItems[idx], name: e.target.value };
                      handleFieldChange("items", newItems);
                    }}
                  />
                )}
                {"comment" in item && (
                  <textarea
                    className="pm-form-textarea"
                    placeholder="Review Comment"
                    value={item.comment || ""}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx] = { ...newItems[idx], comment: e.target.value };
                      handleFieldChange("items", newItems);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 5. FEATURE SPOTLIGHT ROWS */}
        {Array.isArray(data.rows) && (
          <div className="pm-form-field">
            <label className="pm-form-field-label">Spotlight Rows ({data.rows.length})</label>
            {data.rows.map((row, idx) => (
              <div key={idx} className="pm-repeatable-card">
                <div className="pm-repeatable-header">
                  <span>Row {idx + 1}</span>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}
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

      <style>{`
        @keyframes pmSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .pm-spin {
          animation: pmSpin 1s linear infinite;
        }
      `}</style>
    </aside>
  );
}

/**
 * Dedicated Button Action Schema Inspector Component
 */
function ButtonInspectorBox({ title, buttonSchema, onChange }) {
  const schema = buttonSchema || {};

  return (
    <div style={{
      background: "#F8FAFC",
      border: "1px solid #CBD5E1",
      borderRadius: "10px",
      padding: "14px",
      marginBottom: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", fontSize: "12.5px", fontWeight: "700", color: "#1E293B" }}>
        <MousePointer size={14} color="#0052FF" />
        <span>{title}</span>
      </div>

      {/* Button Label */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "4px" }}>
          Button Label
        </label>
        <input
          type="text"
          className="pm-form-input"
          value={schema.label || ""}
          placeholder="e.g. Add to Cart"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      {/* Action Type Selector */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "4px" }}>
          Action Type
        </label>
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

      {/* Target Field */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "4px" }}>
          Target ({schema.actionType === "SCROLL_TO" ? "Section Anchor e.g. #sec_faq" : schema.actionType === "LINK" ? "URL Path" : "Variant GID / ID"})
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

      {/* Button Style */}
      <div>
        <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "4px" }}>
          Visual Style
        </label>
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
