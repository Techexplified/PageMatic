import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Layout,
  Star,
  HelpCircle,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function EditorLayersPanel({
  sections = [],
  selectedSectionId,
  setSelectedSectionId,
  onToggleVisibility,
  onMoveSection,
  onDeleteSection,
  onAddSection,
}) {
  const getSectionIcon = (type) => {
    const t = (type || "").toUpperCase();
    switch (t) {
      case "HEADER":
        return <Layout size={14} color="#3B82F6" />;
      case "HERO":
        return <Sparkles size={14} color="#8B5CF6" />;
      case "PRODUCT_DETAILS":
      case "FEATURED_PRODUCT":
        return <ShoppingBag size={14} color="#10B981" />;
      case "BENEFITS":
      case "FEATURES":
        return <ShieldCheck size={14} color="#06B6D4" />;
      case "TESTIMONIALS":
      case "REVIEWS":
        return <Star size={14} color="#F59E0B" />;
      case "FAQ":
        return <HelpCircle size={14} color="#EC4899" />;
      default:
        return <Layers size={14} color="#64748B" />;
    }
  };

  const formatSectionName = (type) => {
    if (!type) return "Section";
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <aside className="pm-editor-layers-panel">
      {/* Panel Header */}
      <div className="pm-panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Layers size={15} color="#64748B" />
          <h2 className="pm-panel-title">Page Layers</h2>
        </div>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>
          {sections.length}
        </span>
      </div>

      {/* Layers List */}
      <div className="pm-layers-list">
        {sections.map((sec, index) => {
          const isSelected = sec.id === selectedSectionId;
          const isHidden = sec.visible === false;

          return (
            <div
              key={sec.id || index}
              className={`pm-layer-item ${isSelected ? "pm-layer-item--active" : ""}`}
              onClick={() => setSelectedSectionId(sec.id)}
            >
              <div className="pm-layer-left">
                {getSectionIcon(sec.type)}
                <span style={{ opacity: isHidden ? 0.5 : 1 }}>
                  {formatSectionName(sec.type)}
                </span>
              </div>

              <div className="pm-layer-actions" onClick={(e) => e.stopPropagation()}>
                {/* Move Up */}
                {index > 0 && (
                  <button
                    type="button"
                    className="pm-layer-action-btn"
                    onClick={() => onMoveSection(index, index - 1)}
                    title="Move Up"
                  >
                    <ChevronUp size={13} />
                  </button>
                )}

                {/* Move Down */}
                {index < sections.length - 1 && (
                  <button
                    type="button"
                    className="pm-layer-action-btn"
                    onClick={() => onMoveSection(index, index + 1)}
                    title="Move Down"
                  >
                    <ChevronDown size={13} />
                  </button>
                )}

                {/* Visibility Toggle */}
                <button
                  type="button"
                  className="pm-layer-action-btn"
                  onClick={() => onToggleVisibility(sec.id)}
                  title={isHidden ? "Show section" : "Hide section"}
                >
                  {isHidden ? <EyeOff size={13} color="#94A3B8" /> : <Eye size={13} />}
                </button>

                {/* Delete */}
                {sections.length > 1 && (
                  <button
                    type="button"
                    className="pm-layer-action-btn"
                    onClick={() => onDeleteSection(sec.id)}
                    title="Delete section"
                  >
                    <Trash2 size={13} color="#EF4444" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Section Button */}
      <div style={{ padding: "12px", borderTop: "1px solid #E2E8F0" }}>
        <button
          type="button"
          className="pm-btn-add-item"
          onClick={onAddSection}
        >
          <Plus size={14} />
          <span>Add Section</span>
        </button>
      </div>
    </aside>
  );
}
