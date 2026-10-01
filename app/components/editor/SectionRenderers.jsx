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
  Truck,
  RotateCcw,
  Mail,
  Zap,
  Award,
  Lock,
  Tag,
  Clock,
  HelpCircle,
} from "lucide-react";

/**
 * Master Section Renderer for all 4 Deterministic Templates
 */
export default function SectionRenderer({ section, themeTokens = {} }) {
  if (!section || section.visible === false) return null;

  const type = (section.type || "").toUpperCase();
  const data = section.data || {};

  switch (type) {
    case "ANNOUNCEMENT_BAR":
      return <RenderAnnouncementBar data={data} theme={themeTokens} />;
    case "PROMO_BANNER":
      return <RenderPromoBanner data={data} theme={themeTokens} />;
    case "PAGE_HEADER":
      return <RenderPageHeader data={data} theme={themeTokens} />;
    case "HEADER":
      return <RenderHeader data={data} theme={themeTokens} />;
    case "HERO":
      return <RenderHero data={data} theme={themeTokens} sectionId={section.id} />;
    case "SOCIAL_PROOF_STRIP":
      return <RenderSocialProofStrip data={data} theme={themeTokens} />;
    case "TRUST_BADGES":
      return <RenderTrustBadges data={data} theme={themeTokens} />;
    case "BENEFITS_GRID":
    case "BENEFITS":
    case "FEATURES":
      return <RenderBenefitsGrid data={data} theme={themeTokens} />;
    case "FEATURE_SPOTLIGHT":
      return <RenderFeatureSpotlight data={data} theme={themeTokens} />;
    case "PRODUCT_SHOWCASE":
    case "PRODUCT_DETAILS":
    case "FEATURED_PRODUCT":
      return <RenderProductShowcase data={data} theme={themeTokens} />;
    case "COMPARISON_TABLE":
      return <RenderComparisonTable data={data} theme={themeTokens} />;
    case "COLLECTION_LIST":
      return <RenderCollectionList data={data} theme={themeTokens} sectionId={section.id} />;
    case "FEATURED_GRID":
      return <RenderFeaturedGrid data={data} theme={themeTokens} sectionId={section.id} />;
    case "BRAND_STORY":
      return <RenderBrandStory data={data} theme={themeTokens} sectionId={section.id} />;
    case "TESTIMONIALS":
    case "REVIEWS":
      return <RenderTestimonials data={data} theme={themeTokens} sectionId={section.id} />;
    case "FAQ":
    case "FAQ_GROUP_SHIPPING":
    case "FAQ_GROUP_RETURNS":
    case "FAQ_GROUP_GENERAL":
      return <RenderFAQ data={data} type={type} theme={themeTokens} sectionId={section.id} />;
    case "QUICK_HELP_GRID":
      return <RenderQuickHelpGrid data={data} theme={themeTokens} sectionId={section.id} />;
    case "CONTACT_SUPPORT_CARD":
      return <RenderContactSupportCard data={data} theme={themeTokens} sectionId={section.id} />;
    case "STICKY_BUY_BAR":
      return <RenderStickyBuyBar data={data} theme={themeTokens} sectionId={section.id} />;
    case "FINAL_CTA":
      return <RenderFinalCta data={data} theme={themeTokens} sectionId={section.id} />;
    case "NEWSLETTER_SIGNUP":
      return <RenderNewsletterSignup data={data} theme={themeTokens} sectionId={section.id} />;
    case "FOOTER":
      return <RenderFooter data={data} theme={themeTokens} sectionId={section.id} />;
    default:
      return <RenderGenericSection data={data} type={type} theme={themeTokens} sectionId={section.id} />;
  }
}

/* ==========================================================================
   BUTTON RUNTIME HANDLER
   ========================================================================== */
function ActionButton({ buttonSchema, defaultLabel, defaultStyle = "primary", theme, onClickExtra }) {
  const schema = buttonSchema || {};
  const label = schema.label || defaultLabel || "Click Here";
  const actionType = schema.actionType || "LINK";
  const target = schema.target || "";
  const style = schema.style || defaultStyle;

  const handleClick = (e) => {
    if (onClickExtra) onClickExtra();

    if (actionType === "SCROLL_TO" && target) {
      e.preventDefault();
      const cleanTarget = target.trim();
      let el = document.querySelector(cleanTarget);
      if (!el && cleanTarget.startsWith("#")) {
        el = document.getElementById(cleanTarget.substring(1));
      }
      if (!el && (cleanTarget.includes("featured_grid") || cleanTarget.includes("featured"))) {
        el = document.querySelector(".pm-featured-grid") || document.querySelector("[id*='featured_grid']");
      }
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (actionType === "ADD_TO_CART") {
      e.preventDefault();
      const cleanTarget = (target || "").replace(/gid:\/\/shopify\/ProductVariant\//i, "").replace(/gid:\/\/shopify\/Product\//i, "");
      showToastNotification(`🛒 Added to Cart!${cleanTarget ? ` (Variant #${cleanTarget})` : ""}`);
    } else if (actionType === "BUY_NOW") {
      e.preventDefault();
      const cleanTarget = (target || "").replace(/gid:\/\/shopify\/ProductVariant\//i, "").replace(/gid:\/\/shopify\/Product\//i, "");
      showToastNotification(`⚡ Direct checkout initiated for ${cleanTarget ? `variant #${cleanTarget}` : "product"}!`);
    } else if (actionType === "LINK" && target) {
      if (typeof window !== "undefined" && window.top !== window.self) {
        e.preventDefault();
        showToastNotification(`🔗 Navigating to ${target}`);
      }
    }
  };

  const getButtonStyle = () => {
    const radius = theme["--pm-radius"] || "8px";
    const primary = theme["--pm-primary"] || "#0052FF";

    if (style === "outline") {
      return {
        padding: "12px 24px",
        background: "transparent",
        color: primary,
        border: `1.5px solid ${primary}`,
        borderRadius: radius,
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.2s ease",
      };
    }
    if (style === "secondary") {
      return {
        padding: "12px 24px",
        background: "#FFFFFF",
        color: "#1E293B",
        border: "1.5px solid #CBD5E1",
        borderRadius: radius,
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
      };
    }
    // Primary
    return {
      padding: "12px 26px",
      background: primary,
      color: "#FFFFFF",
      border: "none",
      borderRadius: radius,
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 4px 14px rgba(0, 82, 255, 0.25)",
      transition: "all 0.2s ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    };
  };

  return (
    <button type="button" style={getButtonStyle()} onClick={handleClick}>
      {label}
    </button>
  );
}

function showToastNotification(msg) {
  if (typeof window === "undefined") return;
  const toast = document.createElement("div");
  toast.innerText = msg;
  toast.style.position = "fixed";
  toast.style.bottom = "24px";
  toast.style.right = "24px";
  toast.style.background = "#0F172A";
  toast.style.color = "#FFFFFF";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "13px";
  toast.style.fontWeight = "600";
  toast.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
  toast.style.zIndex = "999999";
  toast.style.animation = "fadeIn 0.2s ease-in-out";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ==========================================================================
   1. ANNOUNCEMENT BAR
   ========================================================================== */
function RenderAnnouncementBar({ data, theme }) {
  const text = data.text || "Free Worldwide Shipping On Orders Over $50 • 30-Day Money Back Guarantee";
  const badge = data.badge;

  return (
    <div style={{
      background: theme["--pm-primary"] || "#0052FF",
      color: "#FFFFFF",
      padding: "10px 24px",
      textAlign: "center",
      fontSize: "13px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      letterSpacing: "0.01em",
    }}>
      {badge && (
        <span style={{
          background: "rgba(255, 255, 255, 0.2)",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          {badge}
        </span>
      )}
      <span>{text}</span>
    </div>
  );
}

/* ==========================================================================
   2. PROMO BANNER (Campaign Urgency Banner)
   ========================================================================== */
function RenderPromoBanner({ data, theme }) {
  const heading = data.heading || "LIMITED-TIME OFFER: 20% OFF ALL GEAR";
  const countdownText = data.countdownText || "Offer expires at midnight";
  const code = data.code || "SAVE20";

  return (
    <div style={{
      background: "#09090B",
      color: "#FFFFFF",
      padding: "14px 24px",
      borderBottom: "1px solid #27272A",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Tag size={16} color="#F59E0B" />
        <span style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "-0.01em" }}>{heading}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ fontSize: "12.5px", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "5px" }}>
          <Clock size={14} /> {countdownText}
        </span>
        <span style={{
          background: "#18181B",
          border: "1px dashed #F59E0B",
          color: "#F59E0B",
          padding: "3px 10px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: "800",
          letterSpacing: "0.08em",
        }}>
          CODE: {code}
        </span>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. PAGE HEADER (Help Center & FAQ Clean Headline)
   ========================================================================== */
function RenderPageHeader({ data, theme }) {
  const title = data.title || "Help Center & FAQ";
  const subtitle = data.subtitle || "Find answers to frequently asked questions about shipping, orders, warranty, and returns.";
  const breadcrumbs = data.breadcrumbs || "Home / Help Center";

  return (
    <div style={{
      padding: "50px 32px 30px",
      background: theme["--pm-surface"] || "#F8FAFC",
      borderBottom: "1px solid #E2E8F0",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", marginBottom: "12px" }}>
        {breadcrumbs}
      </div>
      <h1 style={{
        fontSize: "36px",
        fontWeight: "800",
        color: theme["--pm-text-heading"] || "#0F172A",
        letterSpacing: "-0.03em",
        margin: "0 0 12px",
      }}>
        {title}
      </h1>
      <p style={{
        fontSize: "16px",
        color: theme["--pm-text-body"] || "#475569",
        maxWidth: "640px",
        margin: "0 auto",
        lineHeight: "1.6",
      }}>
        {subtitle}
      </p>
    </div>
  );
}

/* ==========================================================================
   4. HEADER
   ========================================================================== */
function RenderHeader({ data, theme }) {
  const brandName = data.brandName || "Store";
  const navLinks = Array.isArray(data.navLinks) ? data.navLinks : ["Collection", "Features", "Reviews", "FAQ"];
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
          <span key={i} style={{ fontSize: "13.5px", fontWeight: "500", color: theme["--pm-text-body"] || "#475569", cursor: "pointer" }}>
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
   5. HERO SECTION (Supports Split Product Hero, Landing Hero, Home Hero)
   ========================================================================== */
function RenderHero({ data, theme, sectionId }) {
  const headline = data.headline || "Elevate Your Experience With Precision Performance";
  const subheadline = data.subheadline || "Engineered for maximum durability, control, and unmatched craftsmanship.";
  const badge = data.badge;
  const price = data.price;
  const compareAtPrice = data.compareAtPrice;
  const imageUrl = data.imageUrl;
  const galleryImages = Array.isArray(data.galleryImages) && data.galleryImages.length > 0 ? data.galleryImages : (imageUrl ? [imageUrl] : []);
  const trustBadges = Array.isArray(data.trustBadges) ? data.trustBadges : [];
  const variantSelector = Array.isArray(data.variantSelector) ? data.variantSelector : [];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const displayedImage = galleryImages[activeImageIdx] || imageUrl;

  return (
    <section
      id={sectionId}
      style={{
        padding: "60px 32px",
        background: theme["--pm-bg"] || "#FFFFFF",
        display: "grid",
        gridTemplateColumns: displayedImage ? "1.1fr 0.9fr" : "1fr",
        gap: "48px",
        alignItems: "center",
      }}
    >
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
          margin: "0 0 24px",
        }}>
          {subheadline}
        </p>

        {/* Pricing Block if Product Hero */}
        {price && (
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "20px" }}>
            <span style={{ fontSize: "28px", fontWeight: "800", color: theme["--pm-primary"] || "#0052FF" }}>
              {price}
            </span>
            {compareAtPrice && (
              <span style={{ fontSize: "16px", textDecoration: "line-through", color: "#94A3B8" }}>
                {compareAtPrice}
              </span>
            )}
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#16A34A", background: "#DCFCE7", padding: "2px 6px", borderRadius: "4px" }}>
              IN STOCK
            </span>
          </div>
        )}

        {/* Variant Pills if available */}
        {variantSelector.length > 1 && (
          <div style={{ marginBottom: "24px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Select Option:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {variantSelector.map((v, idx) => (
                <button
                  key={v.id || idx}
                  type="button"
                  onClick={() => setSelectedVariantIdx(idx)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    border: selectedVariantIdx === idx ? `2px solid ${theme["--pm-primary"] || "#0052FF"}` : "1px solid #CBD5E1",
                    background: selectedVariantIdx === idx ? "#EFF6FF" : "#FFFFFF",
                    color: selectedVariantIdx === idx ? (theme["--pm-primary"] || "#0052FF") : "#334155",
                    cursor: "pointer",
                  }}
                >
                  {v.title || `Variant ${idx + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
          {data.buttonPrimary ? (
            <ActionButton buttonSchema={data.buttonPrimary} defaultLabel="Claim Offer" defaultStyle="primary" theme={theme} />
          ) : (
            <ActionButton
              buttonSchema={{ label: data.ctaPrimary || "Shop Collection", actionType: "BUY_NOW", style: "primary" }}
              theme={theme}
            />
          )}

          {data.buttonSecondary && (
            <ActionButton buttonSchema={data.buttonSecondary} defaultLabel="Learn More" defaultStyle="secondary" theme={theme} />
          )}
        </div>

        {/* Micro Trust Badges Row */}
        {trustBadges.length > 0 && (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", borderTop: "1px solid #E2E8F0", paddingTop: "18px" }}>
            {trustBadges.map((badge, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "#475569", fontWeight: "500" }}>
                <Check size={14} color="#16A34A" strokeWidth={3} />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gallery Showcase on Right */}
      {displayedImage ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <div style={{
            width: "100%",
            background: "#F8FAFC",
            borderRadius: theme["--pm-radius"] || "12px",
            border: "1px solid #E2E8F0",
            padding: "20px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "320px",
          }}>
            <img
              src={displayedImage}
              alt={headline}
              style={{
                maxWidth: "100%",
                maxHeight: "360px",
                objectFit: "contain",
                filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.08))",
              }}
            />
          </div>

          {/* Gallery Thumbnails */}
          {galleryImages.length > 1 && (
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
              {galleryImages.map((imgUrl, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "6px",
                    border: activeImageIdx === i ? `2px solid ${theme["--pm-primary"] || "#0052FF"}` : "1px solid #E2E8F0",
                    padding: "3px",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <img src={imgUrl} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "3px" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          height: "320px",
          background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
          borderRadius: theme["--pm-radius"] || "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme["--pm-primary"] || "#0052FF",
        }}>
          <Sparkles size={48} />
        </div>
      )}
    </section>
  );
}

/* ==========================================================================
   6. SOCIAL PROOF STRIP (Press logos / badges)
   ========================================================================== */
function RenderSocialProofStrip({ data, theme }) {
  const heading = data.heading || "Featured & Endorsed By Leading Industry Outlets";
  const logos = Array.isArray(data.logos) ? data.logos : ["VOGUE", "FORBES", "WIRED", "GQ", "OUTSIDE"];

  return (
    <div style={{
      padding: "32px",
      background: "#FAFAFA",
      borderTop: "1px solid #F1F5F9",
      borderBottom: "1px solid #F1F5F9",
      textAlign: "center",
    }}>
      <p style={{
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.08em",
        color: "#64748B",
        textTransform: "uppercase",
        marginBottom: "20px",
      }}>
        {heading}
      </p>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px",
        flexWrap: "wrap",
      }}>
        {logos.map((logo, i) => (
          <span
            key={i}
            style={{
              fontSize: "18px",
              fontWeight: "900",
              color: "#94A3B8",
              letterSpacing: "0.12em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {logo}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   7. TRUST BADGES
   ========================================================================== */
function RenderTrustBadges({ data, theme }) {
  const items = Array.isArray(data.items) ? data.items : [
    { title: "30-Day Risk-Free Trial", description: "100% money back guarantee", icon: "shield" },
    { title: "Fast 24H Dispatch", description: "Free express carbon-neutral shipping", icon: "truck" },
    { title: "2-Year Manufacturer Warranty", description: "Crafted to withstand peak intensity", icon: "award" },
  ];

  return (
    <section style={{ padding: "44px 32px", background: theme["--pm-surface"] || "#F8FAFC", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", maxWidth: "1040px", margin: "0 auto" }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "18px 22px",
            background: theme["--pm-bg"] || "#FFFFFF",
            borderRadius: theme["--pm-radius"] || "12px",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme["--pm-primary"] || "#0052FF",
              flexShrink: 0,
            }}>
              {idx === 0 ? <Shield size={20} /> : idx === 1 ? <Truck size={20} /> : <Award size={20} />}
            </div>
            <div>
              <h4 style={{ fontSize: "14.5px", fontWeight: "700", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 2px" }}>
                {item.title}
              </h4>
              <p style={{ fontSize: "12.5px", color: theme["--pm-text-body"] || "#64748B", margin: 0 }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   8. BENEFITS GRID
   ========================================================================== */
function RenderBenefitsGrid({ data, theme }) {
  const heading = data.heading || "Why Our Gear Stands Alone";
  const subtitle = data.subtitle || "Crafted for maximum control, resilience, and all-terrain performance.";
  const items = Array.isArray(data.items) ? data.items : [
    { title: "Precision Control", description: "Engineered edge hold and responsiveness in any conditions." },
    { title: "Racing-Grade Core", description: "Ultra-lightweight core reinforced for high-impact durability." },
    { title: "30-Day In-Field Trial", description: "Test it in real conditions. 100% money back if not satisfied." },
  ];

  return (
    <section style={{ padding: "60px 32px", background: theme["--pm-bg"] || "#FFFFFF" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          {heading}
        </h2>
        <p style={{ fontSize: "15px", color: theme["--pm-text-body"] || "#64748B", margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            background: theme["--pm-surface"] || "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: theme["--pm-radius"] || "12px",
            padding: "24px",
            textAlign: "left",
          }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              background: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}>
              <Sparkles size={18} color={theme["--pm-primary"] || "#0052FF"} />
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: "700", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 8px" }}>
              {item.title}
            </h3>

            <p style={{ fontSize: "13.5px", lineHeight: "1.5", color: theme["--pm-text-body"] || "#64748B", margin: 0 }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   9. FEATURE SPOTLIGHT (Zig-Zag Rows)
   ========================================================================== */
function RenderFeatureSpotlight({ data, theme }) {
  const heading = data.heading || "Engineered Down to the Microscopic Detail";
  const subtitle = data.subtitle || "Every layer is conceived and tested across extreme environments.";
  const rows = Array.isArray(data.rows) ? data.rows : [];

  return (
    <section style={{ padding: "60px 32px", background: theme["--pm-surface"] || "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 10px" }}>
          {heading}
        </h2>
        <p style={{ fontSize: "15px", color: theme["--pm-text-body"] || "#64748B", margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "48px", maxWidth: "960px", margin: "0 auto" }}>
        {rows.map((row, idx) => {
          const isReverse = row.reverse || idx % 2 === 1;
          return (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: row.imageUrl ? "1fr 1fr" : "1fr",
                gap: "40px",
                alignItems: "center",
                direction: isReverse ? "rtl" : "ltr",
              }}
            >
              <div style={{ direction: "ltr" }}>
                {row.badge && (
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: theme["--pm-primary"] || "#0052FF",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "8px",
                  }}>
                    {row.badge}
                  </span>
                )}
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 12px" }}>
                  {row.title}
                </h3>
                <p style={{ fontSize: "14.5px", lineHeight: "1.6", color: theme["--pm-text-body"] || "#475569", margin: 0 }}>
                  {row.description}
                </p>
              </div>

              {row.imageUrl && (
                <div style={{ direction: "ltr", textAlign: "center", background: "#FFFFFF", padding: "18px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <img
                    src={row.imageUrl}
                    alt={row.title}
                    style={{ maxWidth: "100%", maxHeight: "260px", objectFit: "contain" }}
                  />
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
   10. PRODUCT SHOWCASE CARD
   ========================================================================== */
function RenderProductShowcase({ data, theme }) {
  const title = data.title || "Featured Spotlight";
  const price = data.price || "$149.00";
  const description = data.description || "Crafted for performance and durability.";
  const features = Array.isArray(data.features) ? data.features : ["100% Guaranteed", "Free Worldwide Delivery"];
  const imageUrl = data.imageUrl;

  return (
    <section style={{ padding: "70px 32px", background: theme["--pm-surface"] || "#F8FAFC", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{
        maxWidth: "920px",
        margin: "0 auto",
        background: theme["--pm-bg"] || "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: theme["--pm-radius"] || "16px",
        padding: "40px",
        display: "grid",
        gridTemplateColumns: imageUrl ? "1fr 1.2fr" : "1fr",
        gap: "40px",
        alignItems: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      }}>
        {imageUrl && (
          <div style={{ textAlign: "center", background: theme["--pm-surface"] || "#F8FAFC", padding: "24px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "260px" }}>
            <img src={imageUrl} alt={title} style={{ maxWidth: "100%", maxHeight: "260px", objectFit: "contain", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.06))" }} />
          </div>
        )}

        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: theme["--pm-primary"] || "#0052FF", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Spotlight Offer
          </span>
          <h2 style={{ fontSize: "26px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "6px 0 10px" }}>
            {title}
          </h2>
          <div style={{ fontSize: "24px", fontWeight: "800", color: theme["--pm-primary"] || "#0052FF", marginBottom: "12px" }}>
            {price}
          </div>
          <p style={{ fontSize: "14.5px", lineHeight: "1.6", color: theme["--pm-text-body"] || "#475569", marginBottom: "20px" }}>
            {description}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {features.map((feat, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", color: theme["--pm-text-heading"] || "#334155" }}>
                <Check size={15} color="#16A34A" strokeWidth={3} />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {data.buttonPrimary ? (
            <ActionButton buttonSchema={data.buttonPrimary} defaultLabel="Claim Offer" theme={theme} />
          ) : (
            <ActionButton buttonSchema={{ label: "Add to Cart", actionType: "ADD_TO_CART", style: "primary" }} theme={theme} />
          )}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   11. COMPARISON TABLE ("Our Brand vs. Traditional Alternatives")
   ========================================================================== */
function RenderComparisonTable({ data, theme }) {
  const heading = data.heading || "Why We Beat Traditional Alternatives";
  const ourBrand = data.ourBrand || "Our Brand";
  const competitorName = data.competitorName || "Traditional Alternatives";
  const rows = Array.isArray(data.rows) ? data.rows : [
    { feature: "Racing-Grade Core Materials", us: "Yes - 100% Premium", them: "Generic Composite" },
    { feature: "30-Day In-Field Trial", us: "Included", them: "No Returns if Used" },
    { feature: "Durability Rating", us: "Extreme (5/5)", them: "Moderate (3/5)" },
    { feature: "Direct Customer Support", us: "24/7 Dedicated", them: "Automated Bot Only" },
  ];

  return (
    <section id="sec_comparison" style={{ padding: "60px 32px", background: theme["--pm-bg"] || "#FFFFFF", borderTop: "1px solid #E2E8F0" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: 0 }}>
          {heading}
        </h2>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0" }}>
              <th style={{ padding: "14px 16px", color: "#64748B", fontWeight: "600" }}>Feature / Guarantee</th>
              <th style={{ padding: "14px 16px", color: theme["--pm-primary"] || "#0052FF", fontWeight: "800", background: "#EFF6FF", borderRadius: "8px 8px 0 0" }}>
                ✨ {ourBrand}
              </th>
              <th style={{ padding: "14px 16px", color: "#94A3B8", fontWeight: "600" }}>{competitorName}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "14px 16px", fontWeight: "600", color: "#1E293B" }}>{row.feature}</td>
                <td style={{ padding: "14px 16px", fontWeight: "700", color: "#16A34A", background: "#F8FAFC" }}>
                  ✓ {row.us}
                </td>
                <td style={{ padding: "14px 16px", color: "#64748B" }}>{row.them}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ==========================================================================
   12. COLLECTION LIST (Category cards routing to /collections/handle)
   ========================================================================== */
function RenderCollectionList({ data, theme, sectionId }) {
  const heading = data.heading || "Shop By Category";
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <section id={sectionId || "sec_collection_list"} style={{ padding: "60px 32px", background: theme["--pm-bg"] || "#FFFFFF" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: 0 }}>
          {heading}
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", maxWidth: "960px", margin: "0 auto" }}>
        {items.map((cat, idx) => {
          const colUrl = cat.link || cat.url || `/collections/${cat.handle || "all"}`;
          return (
            <a
              key={idx}
              href={colUrl}
              onClick={(e) => {
                if (typeof window !== "undefined" && window.top !== window.self) {
                  e.preventDefault();
                  showToastNotification(`📁 Opening collection: ${cat.title || colUrl}`);
                }
              }}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                background: theme["--pm-surface"] || "#F8FAFC",
                borderRadius: theme["--pm-radius"] || "12px",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div style={{
                height: "180px",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                boxSizing: "border-box",
                overflow: "hidden",
              }}>
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.title}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <ShoppingBag size={36} color={theme["--pm-primary"] || "#0052FF"} />
                )}
              </div>
              <div style={{
                padding: "16px",
                textAlign: "center",
                background: theme["--pm-surface"] || "#F8FAFC",
                borderTop: "1px solid #F1F5F9",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 4px" }}>
                  {cat.title}
                </h3>
                <span style={{ fontSize: "12px", color: theme["--pm-primary"] || "#0052FF", fontWeight: "700", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  Explore ↗
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

/* ==========================================================================
   13. FEATURED GRID (All Products Showcase with Add to Cart)
   ========================================================================== */
function RenderFeaturedGrid({ data, theme, sectionId }) {
  const heading = data.heading || "Featured Best Sellers";
  const subtitle = data.subtitle || "Handpicked favorites engineered for peak performance.";
  const products = Array.isArray(data.products) ? data.products : [];

  return (
    <section id={sectionId || "sec_featured_grid"} className="pm-featured-grid" style={{ padding: "60px 32px", background: theme["--pm-surface"] || "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 8px" }}>
          {heading}
        </h2>
        <p style={{ fontSize: "14.5px", color: theme["--pm-text-body"] || "#64748B", margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", maxWidth: "1040px", margin: "0 auto" }}>
        {products.map((prod, idx) => {
          const targetVariantId = prod.variantId || prod.primaryVariantId || prod.id || "";
          const btnSchema = prod.buttonAction || {
            label: "Add to Cart",
            actionType: "ADD_TO_CART",
            target: targetVariantId,
            variantId: targetVariantId,
            style: "primary",
          };

          return (
            <div
              key={prod.id || idx}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: theme["--pm-radius"] || "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{
                height: "180px",
                background: "#F8FAFC",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px",
                marginBottom: "14px",
                boxSizing: "border-box",
                overflow: "hidden",
              }}>
                {prod.imageUrl ? (
                  <img
                    src={prod.imageUrl}
                    alt={prod.title}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <ShoppingBag size={32} color="#94A3B8" />
                )}
              </div>

              <h3 style={{ fontSize: "15px", fontWeight: "700", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 6px", flex: 1 }}>
                {prod.title}
              </h3>

              <div style={{ fontSize: "16px", fontWeight: "800", color: theme["--pm-primary"] || "#0052FF", marginBottom: "12px" }}>
                {prod.price}
              </div>

              <ActionButton buttonSchema={btnSchema} defaultLabel="Add to Cart" theme={theme} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ==========================================================================
   14. BRAND STORY
   ========================================================================== */
function RenderBrandStory({ data, theme }) {
  const heading = data.heading || "Crafted For Riders, By Riders";
  const storyQuote = data.storyQuote || "We started with one mission: to build responsive, durable gear without compromise.";
  const founderName = data.founderName || "Design & Craftsmanship Team";
  const bodyText = data.bodyText || "Every product in our catalog is conceived, tested, and refined in real-world mountain conditions.";
  const imageUrl = data.imageUrl;

  return (
    <section style={{ padding: "60px 32px", background: theme["--pm-bg"] || "#FFFFFF", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{
        maxWidth: "960px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: imageUrl ? "1.1fr 0.9fr" : "1fr",
        gap: "40px",
        alignItems: "center",
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: theme["--pm-primary"] || "#0052FF", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Our Ethos & Origin
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "8px 0 16px" }}>
            {heading}
          </h2>
          <blockquote style={{
            margin: "0 0 18px",
            paddingLeft: "16px",
            borderLeft: `3px solid ${theme["--pm-primary"] || "#0052FF"}`,
            fontSize: "16px",
            fontStyle: "italic",
            color: "#1E293B",
            lineHeight: "1.5",
          }}>
            "{storyQuote}"
          </blockquote>
          <p style={{ fontSize: "14.5px", lineHeight: "1.6", color: theme["--pm-text-body"] || "#475569", margin: "0 0 12px" }}>
            {bodyText}
          </p>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>
            — {founderName}
          </span>
        </div>

        {imageUrl && (
          <div style={{ textAlign: "center", background: theme["--pm-surface"] || "#F8FAFC", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)" }}>
            <img src={imageUrl} alt={heading} style={{ maxWidth: "100%", maxHeight: "280px", objectFit: "contain" }} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ==========================================================================
   15. TESTIMONIALS
   ========================================================================== */
function RenderTestimonials({ data, theme }) {
  const heading = data.heading || "Real Feedback From Verified Owners";
  const subtitle = data.subtitle || "Discover why customers around the world rate us 4.9/5 stars.";
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <section style={{ padding: "60px 32px", background: theme["--pm-surface"] || "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 8px" }}>
          {heading}
        </h2>
        <p style={{ fontSize: "14.5px", color: theme["--pm-text-body"] || "#64748B", margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", maxWidth: "1000px", margin: "0 auto" }}>
        {items.map((rev, idx) => (
          <div key={idx} style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: theme["--pm-radius"] || "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          }}>
            <div style={{ display: "flex", gap: "3px", marginBottom: "12px" }}>
              {[...Array(rev.rating || 5)].map((_, starI) => (
                <Star key={starI} size={15} fill="#F59E0B" color="#F59E0B" />
              ))}
            </div>

            <p style={{ fontSize: "13.5px", lineHeight: "1.6", color: "#334155", fontStyle: "italic", flex: 1, margin: "0 0 16px" }}>
              "{rev.comment}"
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>
                {rev.name}
              </span>
              <span style={{ fontSize: "11px", color: "#16A34A", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}>
                <Check size={12} strokeWidth={3} /> {rev.badge || "Verified"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   16. FAQ SECTION & FAQ ACCORDION GROUPS
   ========================================================================== */
function RenderFAQ({ data, type, theme }) {
  const heading = data.heading || data.groupTitle || "Frequently Asked Questions";
  const items = Array.isArray(data.items) ? data.items : [];
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section style={{ padding: "50px 32px", background: theme["--pm-bg"] || "#FFFFFF", borderTop: "1px solid #E2E8F0" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 32px" }}>
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
   17. QUICK HELP GRID (FAQ Page Action Cards)
   ========================================================================== */
function RenderQuickHelpGrid({ data, theme }) {
  const cards = Array.isArray(data.cards) ? data.cards : [];

  return (
    <section style={{ padding: "44px 32px", background: theme["--pm-surface"] || "#F8FAFC", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", maxWidth: "860px", margin: "0 auto" }}>
        {cards.map((card, idx) => (
          <a
            key={idx}
            href={card.link || "#"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "20px",
              background: theme["--pm-bg"] || "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: theme["--pm-radius"] || "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.15s ease",
            }}
          >
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme["--pm-primary"] || "#0052FF",
              flexShrink: 0,
            }}>
              {idx === 0 ? <Truck size={20} /> : idx === 1 ? <RotateCcw size={20} /> : <Mail size={20} />}
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A", margin: "0 0 2px" }}>
                {card.title}
              </h4>
              <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                {card.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   18. CONTACT SUPPORT CARD
   ========================================================================== */
function RenderContactSupportCard({ data, theme }) {
  const heading = data.heading || "Still have questions?";
  const subtitle = data.subtitle || "Our customer support team is available 7 days a week.";

  return (
    <section style={{ padding: "60px 32px", background: theme["--pm-surface"] || "#F8FAFC", borderTop: "1px solid #E2E8F0", textAlign: "center" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <h3 style={{ fontSize: "24px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 10px" }}>
          {heading}
        </h3>
        <p style={{ fontSize: "14.5px", color: theme["--pm-text-body"] || "#64748B", margin: "0 0 24px" }}>
          {subtitle}
        </p>
        <ActionButton buttonSchema={data.buttonAction || { label: "Contact Support", actionType: "LINK", target: "/pages/contact", style: "primary" }} theme={theme} />
      </div>
    </section>
  );
}

/* ==========================================================================
   19. STICKY BUY BAR
   ========================================================================== */
function RenderStickyBuyBar({ data, theme }) {
  const title = data.title || "Featured Product";
  const price = data.price || "$149.00";
  const imageUrl = data.imageUrl;

  return (
    <div style={{
      padding: "12px 24px",
      background: "#FFFFFF",
      borderTop: "2px solid #E2E8F0",
      boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      bottom: 0,
      zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {imageUrl && (
          <img src={imageUrl} alt={title} style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px" }} />
        )}
        <div>
          <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A", display: "block" }}>
            {title}
          </span>
          <span style={{ fontSize: "13px", fontWeight: "800", color: theme["--pm-primary"] || "#0052FF" }}>
            {price}
          </span>
        </div>
      </div>

      <ActionButton buttonSchema={data.buttonAction || { label: "Instant Checkout", actionType: "BUY_NOW", style: "primary" }} theme={theme} />
    </div>
  );
}

/* ==========================================================================
   20. FINAL CTA BANNER
   ========================================================================== */
function RenderFinalCta({ data, theme, sectionId }) {
  const heading = data.heading || "Ready to Elevate Your Performance?";
  const subheading = data.subheading || "Claim your limited-time discount before promotion ends.";
  const btn = data.buttonPrimary || data.buttonAction || {
    label: "Explore All Collections",
    actionType: "LINK",
    target: "/collections",
    style: "secondary",
  };

  return (
    <section id={sectionId || "sec_final_cta"} style={{
      padding: "60px 32px",
      background: theme["--pm-primary"] || "#0052FF",
      color: "#FFFFFF",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "800", margin: "0 0 12px", letterSpacing: "-0.02em", color: "#FFFFFF" }}>
          {heading}
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.9)", margin: "0 0 28px" }}>
          {subheading}
        </p>
        <ActionButton buttonSchema={btn} defaultLabel="Explore All Collections" theme={theme} />
      </div>
    </section>
  );
}

/* ==========================================================================
   21. NEWSLETTER SIGNUP
   ========================================================================== */
function RenderNewsletterSignup({ data, theme }) {
  const heading = data.heading || "Join Our Community";
  const subtitle = data.subtitle || "Get 15% off your first order + early access to limited edition drops.";
  const buttonText = data.buttonText || "Subscribe";

  return (
    <section style={{ padding: "60px 32px", background: theme["--pm-surface"] || "#F8FAFC", borderTop: "1px solid #E2E8F0", textAlign: "center" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "800", color: theme["--pm-text-heading"] || "#0F172A", margin: "0 0 8px" }}>
          {heading}
        </h2>
        <p style={{ fontSize: "14px", color: theme["--pm-text-body"] || "#64748B", margin: "0 0 24px" }}>
          {subtitle}
        </p>
        <div style={{ display: "flex", gap: "8px", maxWidth: "420px", margin: "0 auto" }}>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: theme["--pm-radius"] || "8px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => showToastNotification("🎉 Thanks for subscribing!")}
            style={{
              padding: "12px 20px",
              background: theme["--pm-primary"] || "#0052FF",
              color: "#FFFFFF",
              border: "none",
              borderRadius: theme["--pm-radius"] || "8px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   22. FOOTER
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
      flexWrap: "wrap",
      gap: "16px",
    }}>
      <span>{copyright}</span>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
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
   GENERIC FALLBACK
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
