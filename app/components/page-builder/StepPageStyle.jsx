import { ArrowLeft, Check } from "lucide-react";
import TokenBadge from "../TokenBadge";

export default function StepPageStyle({ pageStyle, setPageStyle, shopSettings }) {
  return (
    <div>
      {/* Title Row with Title on Left and Token Badge on Right */}
      <div className="pm-wizard-title-row">
        <h1 className="pm-wizard-title">Choose a page style</h1>
        <TokenBadge shopSettings={shopSettings} />
      </div>

      <p className="pm-wizard-subtitle">
        Pick a style that matches your brand and goals. The AI will design your page based on the selected style.
      </p>

      <div className="pm-page-styles-grid">
        {/* 1. Minimal */}
        <div
          className={`pm-style-card ${pageStyle === "MINIMAL" ? "pm-style-card--selected" : ""}`}
          onClick={() => setPageStyle("MINIMAL")}
        >
          <div className="pm-card-radio">
            {pageStyle === "MINIMAL" && <div className="pm-card-radio-dot" />}
          </div>
          <div className="pm-style-preview-box" style={{ background: "#FAFAFA" }}>
            <div style={{ textAlign: "center", padding: "16px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Simple Looks Better
              </div>
              <div style={{ fontSize: "11px", color: "#64748B" }}>Clean design. Better focus.</div>
              <div
                style={{
                  marginTop: "10px",
                  display: "inline-block",
                  padding: "4px 12px",
                  background: "#0052FF",
                  color: "#FFF",
                  fontSize: "10px",
                  borderRadius: "6px",
                  fontWeight: 700,
                }}
              >
                Shop Now
              </div>
            </div>
          </div>
          <h3 className="pm-style-name">Minimal</h3>
          <p className="pm-style-desc">Clean, modern and distraction-free.</p>
          <div className="pm-style-tags">
            <span className="pm-style-tag-pill"><Check size={12} /> Whitespace</span>
            <span className="pm-style-tag-pill"><Check size={12} /> Simple layout</span>
            <span className="pm-style-tag-pill"><Check size={12} /> Clean typography</span>
          </div>
        </div>

        {/* 2. Bold */}
        <div
          className={`pm-style-card ${pageStyle === "BOLD" ? "pm-style-card--selected" : ""}`}
          onClick={() => setPageStyle("BOLD")}
        >
          <div className="pm-card-radio">
            {pageStyle === "BOLD" && <div className="pm-card-radio-dot" />}
          </div>
          <div
            className="pm-style-preview-box"
            style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)", color: "#FFF" }}
          >
            <div style={{ textAlign: "center", padding: "16px" }}>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#FFFFFF", marginBottom: "4px" }}>
                Step Into Better Performance
              </div>
              <div style={{ fontSize: "11px", color: "#93C5FD" }}>High impact. Drives action.</div>
              <div
                style={{
                  marginTop: "10px",
                  display: "inline-block",
                  padding: "4px 12px",
                  background: "#38BDF8",
                  color: "#0F172A",
                  fontSize: "10px",
                  borderRadius: "6px",
                  fontWeight: 800,
                }}
              >
                Shop Now →
              </div>
            </div>
          </div>
          <h3 className="pm-style-name">Bold</h3>
          <p className="pm-style-desc">High impact. Drives action.</p>
          <div className="pm-style-tags">
            <span className="pm-style-tag-pill"><Check size={12} /> Large typography</span>
            <span className="pm-style-tag-pill"><Check size={12} /> Vibrant visuals</span>
            <span className="pm-style-tag-pill"><Check size={12} /> Strong CTAs</span>
          </div>
        </div>

        {/* 3. Professional */}
        <div
          className={`pm-style-card ${pageStyle === "PROFESSIONAL" ? "pm-style-card--selected" : ""}`}
          onClick={() => setPageStyle("PROFESSIONAL")}
        >
          <div className="pm-card-radio">
            {pageStyle === "PROFESSIONAL" && <div className="pm-card-radio-dot" />}
          </div>
          <div
            className="pm-style-preview-box"
            style={{
              background: "linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)",
              border: "1px solid #94A3B8",
              boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.6), 0 2px 6px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div style={{ textAlign: "center", padding: "16px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", marginBottom: "4px", letterSpacing: "-0.01em" }}>
                Build What Matters
              </div>
              <div style={{ fontSize: "11px", color: "#475569", fontWeight: 500 }}>Structured, trustworthy. Built for business.</div>
              <div
                style={{
                  marginTop: "8px",
                  display: "inline-block",
                  padding: "4px 14px",
                  background: "#0F172A",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  borderRadius: "6px",
                  fontWeight: 700,
                  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.25)",
                }}
              >
                Get Started →
              </div>
            </div>
          </div>
          <h3 className="pm-style-name">Professional</h3>
          <p className="pm-style-desc">Structured, trustworthy. Built for business.</p>
          <div className="pm-style-tags">
            <span className="pm-style-tag-pill"><Check size={12} /> Clear hierarchy</span>
            <span className="pm-style-tag-pill"><Check size={12} /> Informative layout</span>
            <span className="pm-style-tag-pill"><Check size={12} /> Trust signals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
