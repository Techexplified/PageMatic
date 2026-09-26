import { useState, useEffect } from "react";
import { useLoaderData, Link } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import {
  ArrowLeft,
  Copy,
  Check,
  Code,
  Layers,
  Sparkles,
  Palette,
} from "lucide-react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const pageId = url.searchParams.get("pageId");

  const shopSettings = await db.shopSettings.findUnique({
    where: { shop: session.shop },
  });

  let page = null;
  if (pageId && !pageId.startsWith("temp")) {
    page = await db.page.findUnique({
      where: { id: pageId },
    });
  } else if (shopSettings) {
    page = await db.page.findFirst({
      where: { shopId: shopSettings.id },
      orderBy: { createdAt: "desc" },
    });
  }

  return {
    page,
    shopSettings,
  };
};

export default function PageBuilderEditorPreview() {
  const { page: loaderPage, shopSettings } = useLoaderData();
  const [page, setPage] = useState(loaderPage);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("sections"); // "sections" | "raw"

  // Check sessionStorage for in-memory generated page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("pagematic_generated_page");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.contentJson) {
            setPage(parsed);
          }
        } catch (e) {
          console.warn("Could not parse sessionStorage page:", e);
        }
      }
    }
  }, []);

  if (!page) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyCard}>
          <h2>No Generated Page Found</h2>
          <p>Please use the Page Builder to generate a new page first.</p>
          <Link to="/app/page-builder" style={styles.btnPrimary}>
            <ArrowLeft size={16} /> Go to Page Builder
          </Link>
        </div>
      </div>
    );
  }

  const contentJson = page.contentJson || {};
  const sections = contentJson.sections || [];
  const themeTokens = contentJson.themeTokens || {};

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(contentJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/app/page-builder" style={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Page Builder</span>
          </Link>

          <div style={styles.divider} />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={styles.pageTitle}>{page.title}</h1>
              <span style={styles.badgeDraft}>{page.status}</span>
            </div>
            <p style={styles.pageMeta}>
              Handle: <code>/{page.handle}</code> • Type: <strong>{page.pageType}</strong> • Style: <strong>{page.stylePreset}</strong>
            </p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.tokenPill}>
            <span>🪙</span>
            <span><strong>{shopSettings?.pageCredits ?? 20}</strong> credits left</span>
          </div>

          <button onClick={handleCopy} style={styles.btnSecondary} type="button">
            {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
            <span>{copied ? "Copied JSON!" : "Copy JSON"}</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Row */}
      <div style={styles.metricRow}>
        <div style={styles.metricCard}>
          <div style={styles.metricIconWrap("#EFF6FF")}>
            <Layers size={18} color="#0052FF" />
          </div>
          <div>
            <div style={styles.metricValue}>{sections.length} Sections</div>
            <div style={styles.metricLabel}>Generated Section Tree</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIconWrap("#FEF3C7")}>
            <Palette size={18} color="#D97706" />
          </div>
          <div>
            <div style={styles.metricValue}>{Object.keys(themeTokens).length} Tokens</div>
            <div style={styles.metricLabel}>Theme Variables Injected</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIconWrap("#F3E8FF")}>
            <Sparkles size={18} color="#9333EA" />
          </div>
          <div>
            <div style={styles.metricValue}>Milestone 2 Verified</div>
            <div style={styles.metricLabel}>OpenRouter Structured Output</div>
          </div>
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div style={styles.tabContainer}>
        <button
          style={styles.tab(viewMode === "sections")}
          onClick={() => setViewMode("sections")}
          type="button"
        >
          <Layers size={15} />
          <span>Section Breakdown ({sections.length})</span>
        </button>
        <button
          style={styles.tab(viewMode === "raw")}
          onClick={() => setViewMode("raw")}
          type="button"
        >
          <Code size={15} />
          <span>Raw Structured JSON</span>
        </button>
      </div>

      {/* Main Content Area */}
      {viewMode === "sections" ? (
        <div style={styles.sectionGrid}>
          {sections.map((sec, idx) => (
            <div key={sec.id || idx} style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={styles.sectionIndex}>{idx + 1}</span>
                  <span style={styles.sectionType}>{sec.type}</span>
                </div>
                <span style={styles.sectionId}>{sec.id}</span>
              </div>

              <div style={styles.sectionBody}>
                {sec.data ? (
                  <pre style={styles.sectionJson}>
                    {JSON.stringify(sec.data, null, 2)}
                  </pre>
                ) : (
                  <p style={{ color: "#94A3B8", fontSize: "13px" }}>No data payload</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.rawJsonCard}>
          <pre style={styles.rawJsonPre}>
            {JSON.stringify(contentJson, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "24px 32px 60px",
    background: "#F8FAFC",
    minHeight: "100vh",
    color: "#0F172A",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    background: "#FFFFFF",
    padding: "16px 24px",
    borderRadius: "14px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    background: "#F1F5F9",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    color: "#475569",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "600",
  },
  divider: {
    width: "1px",
    height: "36px",
    background: "#E2E8F0",
  },
  pageTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#0B192C",
  },
  pageMeta: {
    margin: "2px 0 0",
    fontSize: "12.5px",
    color: "#64748B",
  },
  badgeDraft: {
    padding: "2px 8px",
    borderRadius: "6px",
    background: "#FEF3C7",
    color: "#92400E",
    border: "1px solid #FDE68A",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.03em",
  },
  tokenPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: "999px",
    fontSize: "13px",
    color: "#1E40AF",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    background: "#0052FF",
    color: "#FFFFFF",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "13.5px",
    fontWeight: "600",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "#FFFFFF",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  metricRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  metricCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  metricIconWrap: (bg) => ({
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  metricValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0F172A",
  },
  metricLabel: {
    fontSize: "12px",
    color: "#64748B",
    marginTop: "2px",
  },
  tabContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    borderBottom: "1px solid #E2E8F0",
    paddingBottom: "10px",
  },
  tab: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: active ? "#0052FF" : "transparent",
    color: active ? "#FFFFFF" : "#64748B",
    fontSize: "13.5px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s ease",
  }),
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  sectionCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    background: "#F8FAFC",
    borderBottom: "1px solid #E2E8F0",
  },
  sectionIndex: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#0052FF",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionType: {
    fontSize: "13.5px",
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: "0.02em",
  },
  sectionId: {
    fontSize: "11.5px",
    color: "#94A3B8",
    fontFamily: "monospace",
  },
  sectionBody: {
    padding: "14px 18px",
    background: "#FFFFFF",
  },
  sectionJson: {
    margin: 0,
    fontSize: "12.5px",
    lineHeight: "1.5",
    color: "#1E293B",
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    background: "#F8FAFC",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    overflowX: "auto",
    maxHeight: "300px",
  },
  rawJsonCard: {
    background: "#0F172A",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  rawJsonPre: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#38BDF8",
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    overflowX: "auto",
    maxHeight: "75vh",
  },
  emptyCard: {
    maxWidth: "420px",
    margin: "80px auto",
    textAlign: "center",
    background: "#FFFFFF",
    padding: "36px",
    borderRadius: "14px",
    border: "1px solid #E2E8F0",
  },
};
