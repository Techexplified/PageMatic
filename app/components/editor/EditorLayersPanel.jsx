import { useState, useRef } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Plus,
  Layout,
  Star,
  HelpCircle,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Tag,
  Clock,
  BookOpen,
  Mail,
  Grid,
  Zap,
  MousePointer,
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
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'top' | 'bottom'
  const dragNodeRef = useRef(null);

  const getSectionIcon = (type) => {
    const t = (type || "").toUpperCase();
    switch (t) {
      case "ANNOUNCEMENT_BAR":
      case "PROMO_BANNER":
        return <Tag size={14} color="#F59E0B" />;
      case "PAGE_HEADER":
      case "HEADER":
        return <Layout size={14} color="#3B82F6" />;
      case "HERO":
        return <Sparkles size={14} color="#8B5CF6" />;
      case "PRODUCT_SHOWCASE":
      case "PRODUCT_DETAILS":
      case "FEATURED_PRODUCT":
      case "FEATURED_GRID":
        return <ShoppingBag size={14} color="#10B981" />;
      case "TRUST_BADGES":
      case "BENEFITS":
      case "BENEFITS_GRID":
      case "FEATURES":
        return <ShieldCheck size={14} color="#06B6D4" />;
      case "FEATURE_SPOTLIGHT":
      case "COMPARISON_TABLE":
        return <Grid size={14} color="#6366F1" />;
      case "COLLECTION_LIST":
        return <Layers size={14} color="#3B82F6" />;
      case "BRAND_STORY":
        return <BookOpen size={14} color="#D97706" />;
      case "TESTIMONIALS":
      case "REVIEWS":
        return <Star size={14} color="#F59E0B" />;
      case "FAQ":
      case "FAQ_GROUP_SHIPPING":
      case "FAQ_GROUP_RETURNS":
      case "FAQ_GROUP_GENERAL":
        return <HelpCircle size={14} color="#EC4899" />;
      case "QUICK_HELP_GRID":
      case "CONTACT_SUPPORT_CARD":
      case "NEWSLETTER_SIGNUP":
        return <Mail size={14} color="#059669" />;
      case "STICKY_BUY_BAR":
      case "FINAL_CTA":
        return <Zap size={14} color="#EF4444" />;
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
    // Only reset if leaving the card entirely
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
          const isDragging = draggedIndex === index;
          const isTarget = dragOverIndex === index;

          return (
            <div
              key={sec.id || index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`pm-layer-item ${isSelected ? "pm-layer-item--active" : ""} ${
                isDragging ? "pm-layer-item--dragging" : ""
              } ${isTarget ? (dropPosition === "top" ? "pm-drag-over-top" : "pm-drag-over-bottom") : ""}`}
              onClick={() => setSelectedSectionId(sec.id)}
            >
              <div className="pm-layer-left">
                {/* Drag Grip Handle */}
                <div
                  className="pm-layer-grip"
                  title="Drag to reorder"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical size={13} color="#94A3B8" />
                </div>
                {getSectionIcon(sec.type)}
                <span style={{ opacity: isHidden ? 0.5 : 1 }}>
                  {formatSectionName(sec.type)}
                </span>
              </div>

              <div className="pm-layer-actions" onClick={(e) => e.stopPropagation()}>
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

