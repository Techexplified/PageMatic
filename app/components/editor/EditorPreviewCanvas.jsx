import SectionRenderer from "./SectionRenderers";

export default function EditorPreviewCanvas({
  sections = [],
  themeTokens = {},
  selectedSectionId,
  setSelectedSectionId,
  deviceMode = "desktop",
}) {
  const getViewportWidth = () => {
    switch (deviceMode) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
      default:
        return "100%";
    }
  };

  return (
    <main className="pm-editor-canvas-container">
      <div
        className="pm-canvas-viewport-frame"
        style={{
          width: getViewportWidth(),
          maxWidth: deviceMode === "desktop" ? "1080px" : getViewportWidth(),
        }}
      >
        {sections.map((section, idx) => {
          const isSelected = section.id === selectedSectionId;
          const isHidden = section.visible === false;

          if (isHidden) return null;

          return (
            <div
              key={section.id || idx}
              className={`pm-canvas-section-wrap ${
                isSelected ? "pm-canvas-section-wrap--active" : ""
              }`}
              onClick={() => setSelectedSectionId(section.id)}
            >
              {isSelected && (
                <div className="pm-canvas-section-badge">
                  {section.type}
                </div>
              )}

              <SectionRenderer section={section} themeTokens={themeTokens} />
            </div>
          );
        })}

        {sections.length === 0 && (
          <div style={{ padding: "80px 20px", textAlign: "center", color: "#94A3B8" }}>
            <p>No sections to display. Use the sidebar on the left to configure your page.</p>
          </div>
        )}
      </div>
    </main>
  );
}
