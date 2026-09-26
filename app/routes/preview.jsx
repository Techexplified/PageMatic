import { useState, useEffect } from "react";
import SectionRenderer from "../components/editor/SectionRenderers";

export const meta = () => {
  return [
    { title: "PageMatic Live Preview" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
};

export const loader = () => {
  return null;
};

export default function StandaloneLivePreview() {
  const [page, setPage] = useState(null);
  const [bannerVisible, setBannerVisible] = useState(true);

  // Load from localStorage or BroadcastChannel
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Initial load from localStorage
      const stored =
        localStorage.getItem("pagematic_live_preview") ||
        sessionStorage.getItem("pagematic_generated_page");

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.contentJson) {
            setPage(parsed);
          }
        } catch (e) {
          console.warn("Preview parse error:", e);
        }
      }

      // 2. Real-time Live Sync via BroadcastChannel
      let channel;
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel("pagematic_preview_sync");
        channel.onmessage = (event) => {
          if (event.data?.type === "PAGEMATIC_PREVIEW_UPDATE" && event.data.page) {
            setPage(event.data.page);
          }
        };
      }

      return () => {
        if (channel) channel.close();
      };
    }
  }, []);

  if (!page) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingBox}>
          <h2 style={{ margin: "0 0 8px", fontSize: "18px", color: "#0F172A" }}>
            Loading Live Preview...
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748B" }}>
            Waiting for page data from the Studio Editor.
          </p>
        </div>
      </div>
    );
  }

  const contentJson = page.contentJson || {};
  const sections = contentJson.sections || [];
  const themeTokens = contentJson.themeTokens || {};

  return (
    <div style={styles.previewRoot}>
      {/* Floating Preview Badge / Ribbon */}
      {bannerVisible && (
        <div style={styles.floatingBanner}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={styles.liveDot} />
            <span style={{ fontWeight: "700", color: "#0F172A", fontSize: "12.5px" }}>
              Live Sandboxed Preview
            </span>
            <span style={{ color: "#64748B", fontSize: "12px" }}>
              • {page.title || "Untitled Page"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "11px", color: "#94A3B8" }}>
              (Zero Shopify store pollution)
            </span>
            <button
              style={styles.closeBannerBtn}
              onClick={() => setBannerVisible(false)}
              type="button"
              title="Hide banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Full Page Renders */}
      <main style={styles.pageContainer}>
        {sections.map((section, idx) => (
          <SectionRenderer
            key={section.id || idx}
            section={section}
            themeTokens={themeTokens}
          />
        ))}
      </main>

      <style>{`
        body {
          margin: 0;
          padding: 0;
          background: #FFFFFF;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        @keyframes pmPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  previewRoot: {
    minHeight: "100vh",
    width: "100%",
    position: "relative",
    background: "#FFFFFF",
  },
  loadingContainer: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, sans-serif",
    background: "#F8FAFC",
  },
  loadingBox: {
    textAlign: "center",
    padding: "32px 40px",
    background: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },
  floatingBanner: {
    position: "fixed",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
    border: "1px solid #CBD5E1",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    borderRadius: "999px",
    padding: "8px 18px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22C55E",
    animation: "pmPulse 2s infinite ease-in-out",
  },
  closeBannerBtn: {
    background: "none",
    border: "none",
    fontSize: "12px",
    color: "#64748B",
    cursor: "pointer",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  pageContainer: {
    width: "100%",
    minHeight: "100vh",
  },
};
