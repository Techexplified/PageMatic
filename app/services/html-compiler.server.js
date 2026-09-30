/**
 * PageMatic HTML & Storefront Compiler
 * Converts JSON AST Section Trees into high-converting, semantic, SEO-optimized Storefront HTML.
 */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderButtonHtml(buttonSchema, defaultLabel = "Shop Now", defaultStyle = "primary", extraAttrs = "") {
  const schema = buttonSchema || {};
  const label = escapeHtml(schema.label || defaultLabel);
  const actionType = schema.actionType || "LINK";
  const target = escapeHtml(schema.target || "");
  const style = schema.style || defaultStyle;

  const btnStyle =
    style === "primary"
      ? "background: var(--pm-primary); color: #ffffff; border: 1px solid var(--pm-primary);"
      : style === "secondary"
      ? "background: var(--pm-surface); color: var(--pm-text-heading); border: 1px solid #e2e8f0;"
      : "background: transparent; color: var(--pm-primary); border: 2px solid var(--pm-primary);";

  return `
    <button
      type="button"
      class="pm-action-btn pm-btn-${style}"
      data-pm-action="${actionType}"
      data-pm-target="${target}"
      style="display: inline-flex; align-items: center; justify-content: center; padding: 14px 28px; border-radius: var(--pm-radius); font-weight: 700; font-size: 15px; cursor: pointer; text-decoration: none; transition: all 0.2s ease; ${btnStyle}"
      ${extraAttrs}
    >
      <span>${label}</span>
    </button>
  `;
}

export function compilePageToHtml(contentJson = {}) {
  const theme = contentJson.themeTokens || {};
  const sections = Array.isArray(contentJson.sections) ? contentJson.sections : [];

  const cssVars = [
    `--pm-primary: ${theme["--pm-primary"] || "#0052FF"}`,
    `--pm-accent: ${theme["--pm-accent"] || "#2563EB"}`,
    `--pm-bg: ${theme["--pm-bg"] || "#FFFFFF"}`,
    `--pm-surface: ${theme["--pm-surface"] || "#F8FAFC"}`,
    `--pm-text-heading: ${theme["--pm-text-heading"] || "#0F172A"}`,
    `--pm-text-body: ${theme["--pm-text-body"] || "#475569"}`,
    `--pm-radius: ${theme["--pm-radius"] || "8px"}`,
    `--pm-font-heading: ${theme["--pm-font-heading"] || "Inter, -apple-system, sans-serif"}`,
  ].join("; ");

  const renderedSections = sections
    .filter((sec) => sec && sec.visible !== false)
    .map((sec) => compileSection(sec, theme))
    .join("\n");

  return `
<!-- PageMatic Storefront Page -->
<div
  id="pagematic-root"
  class="pagematic-page-container"
  style="${cssVars}; background-color: var(--pm-bg); color: var(--pm-text-body); font-family: var(--pm-font-heading); width: 100%; min-height: 100vh; margin: 0 auto; box-sizing: border-box; line-height: 1.6;"
>
  ${renderedSections}
</div>
`;
}

function compileSection(section, theme) {
  const type = (section.type || "").toUpperCase();
  const data = section.data || {};
  const sectionId = escapeHtml(section.id || `pm-sec-${Math.random().toString(36).substring(2, 8)}`);

  switch (type) {
    case "ANNOUNCEMENT_BAR":
      return `
        <div id="${sectionId}" class="pm-section pm-announcement-bar" style="background: var(--pm-primary); color: #ffffff; text-align: center; padding: 10px 16px; font-size: 13.5px; font-weight: 600;">
          <span>${escapeHtml(data.headline || data.text || "Limited Time Offer • Free Shipping Worldwide")}</span>
        </div>
      `;

    case "PROMO_BANNER":
      return `
        <div id="${sectionId}" class="pm-section pm-promo-banner" style="background: var(--pm-surface); border-bottom: 1px solid #e2e8f0; text-align: center; padding: 12px 20px; font-size: 14px; font-weight: 600; color: var(--pm-text-heading);">
          <span style="display: inline-block; background: var(--pm-primary); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 8px;">PROMO</span>
          <span>${escapeHtml(data.headline || data.text || "Special Promotion")}</span>
        </div>
      `;

    case "HERO":
      return `
        <section id="${sectionId}" class="pm-section pm-hero" style="padding: 60px 24px; max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; align-items: center;">
            <div class="pm-hero-content">
              ${data.badge ? `<span style="display: inline-block; padding: 4px 12px; background: rgba(0,82,255,0.08); color: var(--pm-primary); border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">${escapeHtml(data.badge)}</span>` : ""}
              <h1 style="font-size: 40px; font-weight: 800; color: var(--pm-text-heading); line-height: 1.15; margin: 0 0 18px 0; letter-spacing: -0.02em;">${escapeHtml(data.headline || "Transform Your Daily Routine")}</h1>
              <p style="font-size: 17px; color: var(--pm-text-body); margin: 0 0 28px 0; line-height: 1.6;">${escapeHtml(data.subheadline || data.description || "")}</p>
              
              ${data.price ? `
                <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 24px;">
                  <span style="font-size: 28px; font-weight: 800; color: var(--pm-text-heading);">${escapeHtml(data.price)}</span>
                  ${data.compareAtPrice ? `<span style="font-size: 18px; color: #94a3b8; text-decoration: line-through;">${escapeHtml(data.compareAtPrice)}</span>` : ""}
                </div>
              ` : ""}

              <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center;">
                ${renderButtonHtml(data.buttonAction || data.primaryButton, "Add to Cart", "primary", data.variantId ? `data-pm-variant-id="${escapeHtml(data.variantId)}"` : "")}
                ${data.secondaryButton ? renderButtonHtml(data.secondaryButton, "Learn More", "secondary") : ""}
              </div>
            </div>

            <div class="pm-hero-media" style="text-align: center;">
              ${data.imageUrl ? `
                <img src="${escapeHtml(data.imageUrl)}" alt="${escapeHtml(data.headline || "Product")}" style="width: 100%; max-width: 500px; height: auto; border-radius: var(--pm-radius); box-shadow: 0 20px 40px rgba(0,0,0,0.08); object-fit: cover;" />
              ` : `
                <div style="width: 100%; height: 360px; background: var(--pm-surface); border-radius: var(--pm-radius); display: flex; align-items: center; justify-content: center; color: #94a3b8; border: 2px dashed #cbd5e1;">Product Showcase</div>
              `}
            </div>
          </div>
        </section>
      `;

    case "BENEFITS_GRID":
    case "BENEFITS":
    case "FEATURES": {
      const items = Array.isArray(data.items) ? data.items : [];
      return `
        <section id="${sectionId}" class="pm-section pm-benefits" style="padding: 60px 24px; background: var(--pm-surface);">
          <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 32px; font-weight: 800; color: var(--pm-text-heading); margin: 0 0 12px 0;">${escapeHtml(data.headline || "Engineered for Excellence")}</h2>
            ${data.subheadline ? `<p style="font-size: 16px; color: var(--pm-text-body); max-width: 600px; margin: 0 auto 48px auto;">${escapeHtml(data.subheadline)}</p>` : "<div style='height: 36px;'></div>"}
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px; text-align: left;">
              ${items.map((item) => `
                <div style="background: var(--pm-bg); padding: 28px; border-radius: var(--pm-radius); border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                  <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(0,82,255,0.08); color: var(--pm-primary); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; margin-bottom: 16px;">✦</div>
                  <h3 style="font-size: 18px; font-weight: 700; color: var(--pm-text-heading); margin: 0 0 8px 0;">${escapeHtml(item.title || item.headline || "Key Benefit")}</h3>
                  <p style="font-size: 14.5px; color: var(--pm-text-body); margin: 0; line-height: 1.5;">${escapeHtml(item.description || item.text || "")}</p>
                </div>
              `).join("")}
            </div>
          </div>
        </section>
      `;
    }

    case "TESTIMONIALS":
    case "REVIEWS": {
      const items = Array.isArray(data.items || data.reviews) ? (data.items || data.reviews) : [];
      return `
        <section id="${sectionId}" class="pm-section pm-testimonials" style="padding: 60px 24px; max-width: 1200px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 32px; font-weight: 800; color: var(--pm-text-heading); margin: 0 0 12px 0;">${escapeHtml(data.headline || "Loved by Thousands")}</h2>
          ${data.subheadline ? `<p style="font-size: 16px; color: var(--pm-text-body); margin: 0 0 48px 0;">${escapeHtml(data.subheadline)}</p>` : "<div style='height: 36px;'></div>"}
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; text-align: left;">
            ${items.map((rev) => `
              <div style="background: var(--pm-surface); padding: 28px; border-radius: var(--pm-radius); border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="color: #f59e0b; font-size: 16px; margin-bottom: 12px;">★★★★★</div>
                  <p style="font-size: 15px; color: var(--pm-text-heading); font-style: italic; margin: 0 0 18px 0; line-height: 1.5;">"${escapeHtml(rev.quote || rev.text || rev.review || "")}"</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--pm-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">${escapeHtml((rev.author || rev.name || "Customer")[0])}</div>
                  <div>
                    <div style="font-weight: 700; font-size: 14px; color: var(--pm-text-heading);">${escapeHtml(rev.author || rev.name || "Verified Customer")}</div>
                    ${rev.verified !== false ? `<div style="font-size: 12px; color: #16a34a; font-weight: 600;">✓ Verified Buyer</div>` : ""}
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    case "FAQ":
    case "FAQ_GROUP_SHIPPING":
    case "FAQ_GROUP_RETURNS":
    case "FAQ_GROUP_GENERAL": {
      const items = Array.isArray(data.items || data.faqs) ? (data.items || data.faqs) : [];
      return `
        <section id="${sectionId}" class="pm-section pm-faq" style="padding: 60px 24px; max-width: 860px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="font-size: 32px; font-weight: 800; color: var(--pm-text-heading); margin: 0 0 12px 0;">${escapeHtml(data.headline || "Frequently Asked Questions")}</h2>
            ${data.subheadline ? `<p style="font-size: 16px; color: var(--pm-text-body); margin: 0;">${escapeHtml(data.subheadline)}</p>` : ""}
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${items.map((item) => `
              <details class="pm-faq-accordion" style="background: var(--pm-surface); border: 1px solid #e2e8f0; border-radius: var(--pm-radius); overflow: hidden; transition: all 0.2s ease;">
                <summary style="padding: 18px 22px; font-size: 16px; font-weight: 700; color: var(--pm-text-heading); cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: space-between;">
                  <span>${escapeHtml(item.question || item.q || "Question")}</span>
                  <span class="pm-faq-arrow" style="font-size: 12px; color: #94a3b8;">▼</span>
                </summary>
                <div style="padding: 0 22px 18px 22px; font-size: 15px; color: var(--pm-text-body); line-height: 1.6;">
                  ${escapeHtml(item.answer || item.a || "")}
                </div>
              </details>
            `).join("")}
          </div>
        </section>
      `;
    }

    case "FINAL_CTA":
      return `
        <section id="${sectionId}" class="pm-section pm-final-cta" style="padding: 80px 24px; background: var(--pm-primary); color: #ffffff; text-align: center;">
          <div style="max-width: 760px; margin: 0 auto;">
            <h2 style="font-size: 36px; font-weight: 800; color: #ffffff; margin: 0 0 16px 0; letter-spacing: -0.01em;">${escapeHtml(data.headline || "Ready to Get Started?")}</h2>
            <p style="font-size: 18px; color: rgba(255,255,255,0.9); margin: 0 0 32px 0; line-height: 1.5;">${escapeHtml(data.subheadline || data.description || "")}</p>
            ${renderButtonHtml(data.buttonAction || data.primaryButton, "Claim Offer Now", "secondary")}
          </div>
        </section>
      `;

    case "STICKY_BUY_BAR":
      return `
        <div id="${sectionId}" class="pm-section pm-sticky-buy-bar" style="position: fixed; bottom: 0; left: 0; right: 0; background: #ffffff; border-top: 1px solid #e2e8f0; box-shadow: 0 -4px 16px rgba(0,0,0,0.08); padding: 12px 24px; z-index: 999; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${data.imageUrl ? `<img src="${escapeHtml(data.imageUrl)}" alt="${escapeHtml(data.title || "Product")}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" />` : ""}
            <div>
              <div style="font-weight: 700; font-size: 14.5px; color: var(--pm-text-heading);">${escapeHtml(data.title || data.headline || "Special Offer")}</div>
              ${data.price ? `<div style="font-size: 13.5px; font-weight: 600; color: var(--pm-primary);">${escapeHtml(data.price)}</div>` : ""}
            </div>
          </div>
          <div>
            ${renderButtonHtml(data.buttonAction, "Buy Now", "primary", data.variantId ? `data-pm-variant-id="${escapeHtml(data.variantId)}"` : "")}
          </div>
        </div>
      `;

    default:
      return `
        <section id="${sectionId}" class="pm-section pm-generic" style="padding: 40px 24px; max-width: 1200px; margin: 0 auto;">
          ${data.headline ? `<h2 style="font-size: 28px; font-weight: 700; color: var(--pm-text-heading); margin-bottom: 16px;">${escapeHtml(data.headline)}</h2>` : ""}
          ${data.subheadline ? `<p style="font-size: 16px; color: var(--pm-text-body); margin-bottom: 24px;">${escapeHtml(data.subheadline)}</p>` : ""}
        </section>
      `;
  }
}
