import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Sliders,
  Plus,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

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
          <p>Select any section in the layers list or canvas to customize its copy, imagery, and style.</p>
        </div>
      </aside>
    );
  }

  const data = selectedSection.data || {};

  const handleFieldChange = (key, value) => {
    onUpdateSectionData(selectedSection.id, {
      ...data,
      [key]: value,
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
            {selectedSection.type} Inspector
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
              placeholder="e.g. Make copy more urgent, add 20% discount..."
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

        {/* Dynamic Fields Based on Section Data */}
        {/* Badge / Eyebrow */}
        {"badge" in data && (
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

        {/* Headline */}
        {"headline" in data && (
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

        {/* Title / Heading */}
        {"title" in data && (
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

        {"heading" in data && (
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

        {/* Price */}
        {"price" in data && (
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

        {/* Subheadline / Subtitle / Description */}
        {"subheadline" in data && (
          <div className="pm-form-field">
            <label className="pm-form-field-label">Subheadline</label>
            <textarea
              className="pm-form-textarea"
              value={data.subheadline || ""}
              onChange={(e) => handleFieldChange("subheadline", e.target.value)}
            />
          </div>
        )}

        {"subtitle" in data && (
          <div className="pm-form-field">
            <label className="pm-form-field-label">Subtitle</label>
            <textarea
              className="pm-form-textarea"
              value={data.subtitle || ""}
              onChange={(e) => handleFieldChange("subtitle", e.target.value)}
            />
          </div>
        )}

        {"description" in data && (
          <div className="pm-form-field">
            <label className="pm-form-field-label">Description</label>
            <textarea
              className="pm-form-textarea"
              value={data.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
            />
          </div>
        )}

        {/* Primary CTA */}
        {"ctaPrimary" in data && (
          <div className="pm-form-field">
            <label className="pm-form-field-label">Primary Button Text</label>
            <input
              type="text"
              className="pm-form-input"
              value={data.ctaPrimary || ""}
              onChange={(e) => handleFieldChange("ctaPrimary", e.target.value)}
            />
          </div>
        )}

        {"ctaText" in data && (
          <div className="pm-form-field">
            <label className="pm-form-field-label">CTA Button Text</label>
            <input
              type="text"
              className="pm-form-input"
              value={data.ctaText || ""}
              onChange={(e) => handleFieldChange("ctaText", e.target.value)}
            />
          </div>
        )}

        {/* Image URL */}
        {"imageUrl" in data && (
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

        {/* Repeatable Items: FAQs, Features, Testimonials */}
        {Array.isArray(data.items) && (
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
                    value={item.answer || ""}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx] = { ...newItems[idx], answer: e.target.value };
                      handleFieldChange("items", newItems);
                    }}
                  />
                )}

                {/* Benefit item */}
                {"title" in item && (
                  <input
                    type="text"
                    className="pm-form-input"
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
                    value={item.description || item.desc || ""}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx] = { ...newItems[idx], description: e.target.value };
                      handleFieldChange("items", newItems);
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
