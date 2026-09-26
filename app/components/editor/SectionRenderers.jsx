import { useState } from "react";
import {
  Check,
  Star,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function SectionRenderer({ section, themeTokens = {} }) {
  if (!section || section.visible === false) return null;

  const type = (section.type || "").toUpperCase();
  const data = section.data || {};

  switch (type) {
    case "HEADER":
      return <RenderHeader data={data} theme={themeTokens} />;
    case "HERO":
      return <RenderHero data={data} theme={themeTokens} />;
    case "PRODUCT_DETAILS":
    case "FEATURED_PRODUCT":
      return <RenderProductDetails data={data} theme={themeTokens} />;
    case "BENEFITS":
    case "FEATURES":
      return <RenderBenefits data={data} theme={themeTokens} />;
    case "TESTIMONIALS":
    case "REVIEWS":
      return <RenderTestimonials data={data} theme={themeTokens} />;
    case "FAQ":
      return <RenderFAQ data={data} theme={themeTokens} />;
    case "FOOTER":
      return <RenderFooter data={data} theme={themeTokens} />;
    default:
      return <RenderGenericSection data={data} type={type} theme={themeTokens} />;
  }
}

/* ==========================================================================
   1. HEADER SECTION
   ========================================================================== */
function RenderHeader({ data, theme }) {
  const brandName = data.brandName || "PageMatic Store";
  const navLinks = Array.isArray(data.navLinks) ? data.navLinks : ["Features", "Benefits", "Reviews", "FAQ"];
  const ctaText = data.ctaText || "Shop Now";

  return (
    <header style={{
      padding: "16px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #E2E8F0",
      background: theme["--pm-bg"] || "#FFFFFF",
      fontFamily: theme["--pm-font-heading"] || "inherit",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", letterSpacing: "-0.02em" }}>
        {brandName}
      </div>

      <nav style={{ display: "flex", gap: "24px" }}>
        {navLinks.map((link, i) => (
          <span key={i} style={{ fontSize: "13.5px", fontWeight: "500", color: theme["--pm-text-body"] || "#475569" }}>
            {typeof link === "string" ? link : link.label || "Link"}
          </span>
        ))}
      </nav>

      <button style={{
        padding: "8px 18px",
        background: theme["--pm-primary"] || "#0052FF",
        color: "#FFFFFF",
        border: "none",
        borderRadius: theme["--pm-radius"] || "8px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
      }}>
        {ctaText}
      </button>
    </header>
  );
}

/* ==========================================================================
   2. HERO SECTION
   ========================================================================== */
function RenderHero({ data, theme }) {
  const headline = data.headline || "Elevate Your Shopping Experience";
  const subheadline = data.subheadline || "Discover handpicked collections designed for premium quality and performance.";
  const badge = data.badge;
  const ctaPrimary = data.ctaPrimary || "Shop Collection";
  const ctaSecondary = data.ctaSecondary;
  const imageUrl = data.imageUrl;

  return (
    <section style={{
      padding: "60px 32px",
      background: theme["--pm-bg"] || "#FFFFFF",
      display: "grid",
      gridTemplateColumns: imageUrl ? "1.1fr 0.9fr" : "1fr",
      gap: "40px",
      alignItems: "center",
    }}>
      <div>
        {badge && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 12px",
            borderRadius: "999px",
            background: "#EFF6FF",
            color: theme["--pm-primary"] || "#0052FF",
            fontSize: "12.5px",
            fontWeight: "700",
            marginBottom: "16px",
            border: "1px solid #DBEAFE",
          }}>
            {badge}
          </div>
        )}

        <h1 style={{
          fontSize: "36px",
          fontWeight: "800",
          color: theme["--pm-text-heading"] || "#0F172A",
          lineHeight: "1.15",
          letterSpacing: "-0.03em",
          margin: "0 0 16px",
        }}>
          {headline}
        </h1>

        <p style={{
          fontSize: "16px",
          lineHeight: "1.6",
          color: theme["--pm-text-body"] || "#475569",
          margin: "0 0 28px",
        }}>
          {subheadline}
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{
            padding: "12px 24px",
            background: theme["--pm-primary"] || "#0052FF",
            color: "#FFFFFF",
            border: "none",
            borderRadius: theme["--pm-radius"] || "8px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0, 82, 255, 0.25)",
          }}>
            {ctaPrimary}
          </button>

          {ctaSecondary && (
            <button style={{
              padding: "12px 20px",
              background: "#FFFFFF",
              border: "1.5px solid #CBD5E1",
              borderRadius: theme["--pm-radius"] || "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#334155",
              cursor: "pointer",
            }}>
              {ctaSecondary}
            </button>
          )}
        </div>
      </div>

      {imageUrl && (
        <div style={{ textAlign: "center" }}>
          <img
            src={imageUrl}
            alt={headline}
            style={{
              width: "100%",
              maxHeight: "380px",
              objectFit: "contain",
              borderRadius: theme["--pm-radius"] || "12px",
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.08))",
            }}
          />
        </div>
      )}
    </section>
  );
}

/* ==========================================================================
   3. PRODUCT DETAILS SECTION
   ========================================================================== */
function RenderProductDetails({ data, theme }) {
  const title = data.title || "Signature Daily Essence";
  const price = data.price || "$48.00";
  const description = data.description || "Formulated to deeply hydrate and protect your skin throughout the day.";
  const features = Array.isArray(data.features)
    ? data.features
    : ["100% Organic & Cruelty Free", "Dermatologist Tested", "Free Worldwide Shipping"];

  return (
    <section style={{
      padding: "50px 32px",
      background: theme["--pm-surface"] || "#F8FAFC",
      borderTop: "1px solid #E2E8F0",
      borderBottom: "1px solid #E2E8F0",
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em", color: theme["--pm-primary"] || "#0052FF", textTransform: "uppercase" }}>
          Product Spotlight
        </span>

        <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "8px 0 12px" }}>
          {title}
        </h2>

        <div style={{ fontSize: "22px", fontWeight: "800", color: theme["--pm-primary"] || "#0052FF", marginBottom: "16px" }}>
          {price}
        </div>

        <p style={{ fontSize: "15px", lineHeight: "1.6", color: theme["--pm-text-body"] || "#475569", marginBottom: "24px" }}>
          {description}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", background: "#FFFFFF", padding: "18px 24px", borderRadius: "10px", border: "1px solid #E2E8F0", marginBottom: "24px" }}>
          {features.map((feat, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", color: "#334155" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={12} color="#16A34A" strokeWidth={3} />
              </div>
              <span>{typeof feat === "string" ? feat : feat.title || "Feature"}</span>
            </div>
          ))}
        </div>

        <button style={{
          width: "100%",
          padding: "14px",
          background: theme["--pm-primary"] || "#0052FF",
          color: "#FFFFFF",
          border: "none",
          borderRadius: theme["--pm-radius"] || "8px",
          fontSize: "15px",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0, 82, 255, 0.25)",
        }}>
          Add to Cart — {price}
        </button>
      </div>
    </section>
  );
}

/* ==========================================================================
   4. BENEFITS / FEATURES SECTION
   ========================================================================== */
function RenderBenefits({ data, theme }) {
  const heading = data.heading || "Why Customers Love PageMatic";
  const subtitle = data.subtitle || "Engineered for maximum conversion and lightning fast performance.";
  const items = Array.isArray(data.items) ? data.items : [
    { title: "Pure Ingredients", description: "Ethically sourced organic botanicals." },
    { title: "Rapid Results", description: "Noticeable difference in less than two weeks." },
    { title: "Risk Free Guarantee", description: "30-day money back promise if not satisfied." },
  ];

  return (
    <section style={{ padding: "50px 32px", background: theme["--pm-bg"] || "#FFFFFF" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 10px" }}>
          {heading}
        </h2>
        <p style={{ fontSize: "14.5px", color: theme["--pm-text-body"] || "#64748B", margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            background: theme["--pm-surface"] || "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: theme["--pm-radius"] || "12px",
            padding: "20px",
            textAlign: "left",
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
            }}>
              <Sparkles size={18} color={theme["--pm-primary"] || "#0052FF"} />
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: "700", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 6px" }}>
              {item.title}
            </h3>

            <p style={{ fontSize: "13px", lineHeight: "1.5", color: theme["--pm-text-body"] || "#64748B", margin: 0 }}>
              {item.description || item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   5. TESTIMONIALS SECTION
   ========================================================================== */
function RenderTestimonials({ data, theme }) {
  const heading = data.heading || "Loved by Over 10,000+ Happy Shoppers";
  const subtitle = data.subtitle || "Real stories from verified customers around the world.";
  const items = Array.isArray(data.items) ? data.items : [
    { name: "Jessica R.", rating: 5, comment: "Absolutely transformed my daily routine. I can't imagine my morning without it!" },
    { name: "Michael T.", rating: 5, comment: "Top quality craftsmanship and lightning fast delivery. Highly recommended!" },
  ];

  return (
    <section style={{ padding: "50px 32px", background: theme["--pm-surface"] || "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 10px" }}>
          {heading}
        </h2>
        <p style={{ fontSize: "14.5px", color: theme["--pm-text-body"] || "#64748B", margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
        {items.map((rev, idx) => (
          <div key={idx} style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: theme["--pm-radius"] || "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          }}>
            <div style={{ display: "flex", gap: "3px", marginBottom: "12px" }}>
              {[...Array(5)].map((_, starI) => (
                <Star key={starI} size={15} fill="#F59E0B" color="#F59E0B" />
              ))}
            </div>

            <p style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#334155", fontStyle: "italic", flex: 1, margin: "0 0 16px" }}>
              "{rev.comment}"
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F1F5F9", paddingTop: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>
                {rev.name || rev.author}
              </span>
              <span style={{ fontSize: "11px", color: "#16A34A", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}>
                <Check size={12} strokeWidth={3} /> Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   6. FAQ SECTION
   ========================================================================== */
function RenderFAQ({ data, theme }) {
  const heading = data.heading || "Frequently Asked Questions";
  const items = Array.isArray(data.items) ? data.items : [
    { question: "How long does shipping take?", answer: "Orders are processed within 24 hours and delivered in 3-5 business days." },
    { question: "What is your refund policy?", answer: "We offer a 30-day hassle-free money back guarantee." },
  ];

  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section style={{ padding: "50px 32px", background: theme["--pm-bg"] || "#FFFFFF", borderTop: "1px solid #E2E8F0" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: 0 }}>
          {heading}
        </h2>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          const q = item.question || item.q;
          const a = item.answer || item.a;

          return (
            <div key={idx} style={{
              background: isOpen ? "#F8FAFC" : "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
              overflow: "hidden",
            }}>
              <div
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#0F172A",
                }}
              >
                <span>{q}</span>
                {isOpen ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
              </div>

              {isOpen && (
                <div style={{ padding: "0 20px 16px", fontSize: "13.5px", lineHeight: "1.6", color: "#475569" }}>
                  {a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ==========================================================================
   7. FOOTER SECTION
   ========================================================================== */
function RenderFooter({ data, theme }) {
  const copyright = data.copyright || `© ${new Date().getFullYear()} Store. All rights reserved.`;
  const policyLinks = Array.isArray(data.policyLinks)
    ? data.policyLinks
    : ["Refund Policy", "Privacy Policy", "Terms of Service"];

  return (
    <footer style={{
      padding: "32px",
      background: "#0F172A",
      color: "#94A3B8",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "12.5px",
    }}>
      <span>{copyright}</span>

      <div style={{ display: "flex", gap: "20px" }}>
        {policyLinks.map((link, idx) => (
          <span key={idx} style={{ color: "#CBD5E1", cursor: "pointer" }}>
            {typeof link === "string" ? link : link.label}
          </span>
        ))}
      </div>
    </footer>
  );
}

/* ==========================================================================
   GENERIC FALLBACK SECTION
   ========================================================================== */
function RenderGenericSection({ data, type, theme }) {
  return (
    <div style={{ padding: "40px 32px", background: "#FFFFFF", borderTop: "1px solid #E2E8F0", textAlign: "center" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", margin: "0 0 10px" }}>
        {type}
      </h3>
      <p style={{ fontSize: "14px", color: "#64748B" }}>
        {data.heading || data.title || "Custom section content"}
      </p>
    </div>
  );
}
