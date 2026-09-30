/**
 * PageMatic HTML & Storefront Compiler
 * Converts JSON AST Section Trees into high-converting, semantic, SEO-optimized Storefront HTML.
 * Guaranteed 1:1 visual parity with SectionRenderers.jsx.
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

function extractCleanVariantId(val) {
  if (!val) return "";
  const str = String(val).trim();
  const gidMatch = str.match(/\/ProductVariant\/(\d+)/i) || str.match(/\/Product\/(\d+)/i);
  if (gidMatch && gidMatch[1]) return gidMatch[1];
  const digits = str.match(/\d{5,}/) || str.match(/\d+/);
  return digits ? digits[0] : "";
}

function renderButtonHtml(buttonSchema, defaultLabel = "Shop Now", defaultStyle = "primary", extraAttrs = "") {
  if (!buttonSchema && !defaultLabel) return "";
  const schema = buttonSchema || {};
  const label = escapeHtml(schema.label || defaultLabel);
  const actionType = schema.actionType || "LINK";
  const target = escapeHtml(schema.target || "");
  const style = schema.style || defaultStyle;

  // Auto-extract variant ID if ADD_TO_CART or BUY_NOW and not explicitly provided in extraAttrs
  let variantAttr = "";
  if (!extraAttrs.includes("data-pm-variant-id") && (actionType === "ADD_TO_CART" || actionType === "BUY_NOW")) {
    const cleanVariant = extractCleanVariantId(schema.target || schema.variantId || "");
    if (cleanVariant) {
      variantAttr = `data-pm-variant-id="${cleanVariant}"`;
    }
  }

  const btnStyle =
    style === "primary"
      ? "background: var(--pm-primary); color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(0, 82, 255, 0.25);"
      : style === "secondary"
      ? "background: #ffffff; color: #1e293b; border: 1.5px solid #cbd5e1;"
      : "background: transparent; color: var(--pm-primary); border: 1.5px solid var(--pm-primary);";

  return `
    <button
      type="button"
      class="pm-action-btn pm-btn-${style}"
      data-pm-action="${actionType}"
      data-pm-target="${target}"
      ${variantAttr}
      style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; border-radius: var(--pm-radius); font-weight: 700; font-size: 14px; cursor: pointer; text-decoration: none; transition: all 0.2s ease; ${btnStyle}"
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
    // 1. ANNOUNCEMENT BAR
    case "ANNOUNCEMENT_BAR": {
      const text = escapeHtml(data.text || data.headline || "Free Worldwide Shipping On Orders Over $50 • 30-Day Money Back Guarantee");
      const badge = data.badge ? escapeHtml(data.badge) : null;
      return `
        <div id="${sectionId}" class="pm-section pm-announcement-bar" style="background: var(--pm-primary); color: #ffffff; padding: 10px 24px; text-align: center; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px; letter-spacing: 0.01em;">
          ${badge ? `<span style="background: rgba(255, 255, 255, 0.2); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${badge}</span>` : ""}
          <span>${text}</span>
        </div>
      `;
    }

    // 2. PROMO BANNER
    case "PROMO_BANNER": {
      const heading = escapeHtml(data.heading || data.headline || "LIMITED-TIME OFFER: 20% OFF ALL GEAR");
      const countdownText = escapeHtml(data.countdownText || "Offer expires at midnight");
      const code = escapeHtml(data.code || "SAVE20");
      return `
        <div id="${sectionId}" class="pm-section pm-promo-banner" style="background: #09090b; color: #ffffff; padding: 14px 24px; border-bottom: 1px solid #27272a; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: #f59e0b; font-size: 16px;">🏷️</span>
            <span style="font-size: 14px; font-weight: 700; letter-spacing: -0.01em;">${heading}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 12.5px; color: #a1a1aa; display: flex; align-items: center; gap: 5px;">
              ⏱️ ${countdownText}
            </span>
            <span style="background: #18181b; border: 1px dashed #f59e0b; color: #f59e0b; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em;">
              CODE: ${code}
            </span>
          </div>
        </div>
      `;
    }

    // 3. PAGE HEADER
    case "PAGE_HEADER": {
      const title = escapeHtml(data.title || "Help Center & FAQ");
      const subtitle = escapeHtml(data.subtitle || "Find answers to frequently asked questions about shipping, orders, warranty, and returns.");
      const breadcrumbs = escapeHtml(data.breadcrumbs || "Home / Help Center");
      return `
        <div id="${sectionId}" class="pm-section pm-page-header" style="padding: 50px 32px 30px; background: var(--pm-surface); border-bottom: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 12px;">${breadcrumbs}</div>
          <h1 style="font-size: 36px; font-weight: 800; color: var(--pm-text-heading); letter-spacing: -0.03em; margin: 0 0 12px;">${title}</h1>
          <p style="font-size: 16px; color: var(--pm-text-body); max-width: 640px; margin: 0 auto; line-height: 1.6;">${subtitle}</p>
        </div>
      `;
    }

    // 4. HEADER
    case "HEADER": {
      const brandName = escapeHtml(data.brandName || "Store");
      const navLinks = Array.isArray(data.navLinks) ? data.navLinks : ["Collection", "Features", "Reviews", "FAQ"];
      const ctaText = escapeHtml(data.ctaText || "Shop Now");
      return `
        <header id="${sectionId}" class="pm-section pm-header" style="padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; background: var(--pm-bg); font-family: var(--pm-font-heading);">
          <div style="font-size: 18px; font-weight: 800; color: var(--pm-text-heading); letter-spacing: -0.02em;">${brandName}</div>
          <nav style="display: flex; gap: 24px;">
            ${navLinks.map((link) => `<span style="font-size: 13.5px; font-weight: 500; color: var(--pm-text-body); cursor: pointer;">${escapeHtml(typeof link === "string" ? link : link.label || "Link")}</span>`).join("")}
          </nav>
          <button type="button" class="pm-action-btn" style="padding: 8px 18px; background: var(--pm-primary); color: #ffffff; border: none; border-radius: var(--pm-radius); font-size: 13px; font-weight: 600; cursor: pointer;">${ctaText}</button>
        </header>
      `;
    }

    // 5. HERO SECTION
    case "HERO": {
      const headline = escapeHtml(data.headline || data.title || "Elevate Your Experience With Precision Performance");
      const subheadline = escapeHtml(data.subheadline || data.description || "Engineered for maximum durability, control, and unmatched craftsmanship.");
      const badge = data.badge ? escapeHtml(data.badge) : null;
      const price = data.price ? escapeHtml(data.price) : null;
      const compareAtPrice = data.compareAtPrice ? escapeHtml(data.compareAtPrice) : null;
      const imageUrl = data.imageUrl ? escapeHtml(data.imageUrl) : null;
      const galleryImages = Array.isArray(data.galleryImages) && data.galleryImages.length > 0 ? data.galleryImages : (imageUrl ? [imageUrl] : []);
      const displayedImage = galleryImages[0] || imageUrl;
      const trustBadges = Array.isArray(data.trustBadges) ? data.trustBadges : [];
      const variantSelector = Array.isArray(data.variantSelector) ? data.variantSelector : [];

      const primaryBtn = data.buttonPrimary || data.primaryButton || data.buttonAction || (data.ctaPrimary ? { label: data.ctaPrimary, actionType: "BUY_NOW", style: "primary" } : { label: "Add to Cart", actionType: "ADD_TO_CART", style: "primary" });
      const secondaryBtn = data.buttonSecondary || data.secondaryButton || null;
      const heroVariantId = extractCleanVariantId(
        data.variantId ||
        data.primaryVariantId ||
        data.buttonPrimary?.target ||
        data.primaryButton?.target ||
        data.buttonAction?.target ||
        data.variantSelector?.[0]?.id ||
        data.productId ||
        ""
      );

      return `
        <section id="${sectionId}" class="pm-section pm-hero" style="padding: 60px 32px; background: var(--pm-bg); max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: ${displayedImage ? "1.1fr 0.9fr" : "1fr"}; gap: 48px; align-items: center;">
            <div>
              ${badge ? `<div style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px; background: #eff6ff; color: var(--pm-primary); font-size: 12.5px; font-weight: 700; margin-bottom: 16px; border: 1px solid #dbeafe;">${badge}</div>` : ""}
              <h1 style="font-size: 36px; font-weight: 800; color: var(--pm-text-heading); line-height: 1.15; letter-spacing: -0.03em; margin: 0 0 16px;">${headline}</h1>
              <p style="font-size: 16px; line-height: 1.6; color: var(--pm-text-body); margin: 0 0 24px;">${subheadline}</p>

              ${price ? `
                <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 20px;">
                  <span style="font-size: 28px; font-weight: 800; color: var(--pm-primary);">${price}</span>
                  ${compareAtPrice ? `<span style="font-size: 16px; text-decoration: line-through; color: #94a3b8;">${compareAtPrice}</span>` : ""}
                  <span style="font-size: 11px; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">IN STOCK</span>
                </div>
              ` : ""}

              ${variantSelector.length > 1 ? `
                <div style="margin-bottom: 24px;">
                  <span style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; display: block; margin-bottom: 8px;">Select Option:</span>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${variantSelector.map((v, idx) => {
                      const vId = extractCleanVariantId(v.id || v.variantId || "");
                      return `
                        <button type="button" class="pm-variant-btn ${idx === 0 ? "pm-variant-selected" : ""}" data-variant-id="${vId}" style="padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; border: ${idx === 0 ? "2px solid var(--pm-primary)" : "1px solid #cbd5e1"}; background: ${idx === 0 ? "#eff6ff" : "#ffffff"}; color: ${idx === 0 ? "var(--pm-primary)" : "#334155"}; cursor: pointer;">
                          ${escapeHtml(v.title || `Variant ${idx + 1}`)}
                        </button>
                      `;
                    }).join("")}
                  </div>
                </div>
              ` : ""}

              <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
                ${renderButtonHtml(primaryBtn, "Add to Cart", "primary", heroVariantId ? `data-pm-variant-id="${heroVariantId}"` : "")}
                ${secondaryBtn ? renderButtonHtml(secondaryBtn, "Buy It Now", "secondary", heroVariantId ? `data-pm-variant-id="${heroVariantId}"` : "") : ""}
              </div>

              ${trustBadges.length > 0 ? `
                <div style="display: flex; gap: 16px; flex-wrap: wrap; border-top: 1px solid #e2e8f0; padding-top: 18px;">
                  ${trustBadges.map((tBadge) => `
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #475569; font-weight: 500;">
                      <span style="color: #16a34a; font-weight: bold;">✓</span>
                      <span>${escapeHtml(tBadge)}</span>
                    </div>
                  `).join("")}
                </div>
              ` : ""}
            </div>

            ${displayedImage ? `
              <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
                <div style="width: 100%; background: #f8fafc; border-radius: var(--pm-radius); border: 1px solid #e2e8f0; padding: 20px; text-align: center; display: flex; align-items: center; justify-content: center; min-height: 320px;">
                  <img src="${displayedImage}" alt="${headline}" style="max-width: 100%; max-height: 360px; object-fit: contain; filter: drop-shadow(0 12px 24px rgba(0,0,0,0.08));" />
                </div>
                ${galleryImages.length > 1 ? `
                  <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                    ${galleryImages.map((imgUrl, i) => `
                      <div style="width: 56px; height: 56px; border-radius: 6px; border: ${i === 0 ? "2px solid var(--pm-primary)" : "1px solid #e2e8f0"}; padding: 3px; background: #ffffff; cursor: pointer; overflow: hidden;">
                        <img src="${escapeHtml(imgUrl)}" alt="Thumbnail" style="width: 100%; height: 100%; object-fit: cover; border-radius: 3px;" />
                      </div>
                    `).join("")}
                  </div>
                ` : ""}
              </div>
            ` : ""}
          </div>
        </section>
      `;
    }

    // 6. SOCIAL PROOF STRIP
    case "SOCIAL_PROOF_STRIP": {
      const heading = escapeHtml(data.heading || "Featured & Endorsed By Leading Industry Outlets");
      const logos = Array.isArray(data.logos) ? data.logos : ["VOGUE", "FORBES", "WIRED", "GQ", "OUTSIDE"];
      return `
        <div id="${sectionId}" class="pm-section pm-social-proof" style="padding: 32px; background: #fafafa; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; text-align: center;">
          <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: #64748b; text-transform: uppercase; margin-bottom: 20px;">${heading}</p>
          <div style="display: flex; align-items: center; justify-content: center; gap: 40px; flex-wrap: wrap;">
            ${logos.map((logo) => `<span style="font-size: 18px; font-weight: 900; color: #94a3b8; letter-spacing: 0.12em; font-family: Inter, sans-serif;">${escapeHtml(typeof logo === "string" ? logo : logo.name || logo.title || "")}</span>`).join("")}
          </div>
        </div>
      `;
    }

    // 7. TRUST BADGES
    case "TRUST_BADGES": {
      const items = Array.isArray(data.items) ? data.items : [
        { title: "30-Day Risk-Free Trial", description: "100% money back guarantee" },
        { title: "Fast 24H Dispatch", description: "Free express carbon-neutral shipping" },
        { title: "2-Year Manufacturer Warranty", description: "Crafted to withstand peak intensity" },
      ];
      return `
        <section id="${sectionId}" class="pm-section pm-trust-badges" style="padding: 40px 32px; background: #ffffff; border-bottom: 1px solid #e2e8f0;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; max-width: 1000px; margin: 0 auto;">
            ${items.map((item, idx) => `
              <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: var(--pm-surface); border-radius: var(--pm-radius); border: 1px solid #e2e8f0;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center; color: var(--pm-primary); font-size: 18px; flex-shrink: 0;">
                  ${idx === 0 ? "🛡️" : idx === 1 ? "🚚" : "🏆"}
                </div>
                <div>
                  <h4 style="font-size: 14.5px; font-weight: 700; color: var(--pm-text-heading); margin: 0 0 2px;">${escapeHtml(item.title || "")}</h4>
                  <p style="font-size: 12.5px; color: var(--pm-text-body); margin: 0;">${escapeHtml(item.description || "")}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    // 8. BENEFITS GRID
    case "BENEFITS_GRID":
    case "BENEFITS":
    case "FEATURES": {
      const heading = escapeHtml(data.heading || data.headline || data.title || "Why Our Gear Stands Alone");
      const subtitle = escapeHtml(data.subtitle || data.subheadline || data.description || "");
      const items = Array.isArray(data.items) ? data.items : [];
      return `
        <section id="${sectionId}" class="pm-section pm-benefits" style="padding: 60px 32px; background: var(--pm-bg);">
          <div style="text-align: center; max-width: 600px; margin: 0 auto 40px;">
            <h2 style="font-size: 28px; font-weight: 800; color: var(--pm-text-heading); margin: 0 0 10px; letter-spacing: -0.02em;">${heading}</h2>
            ${subtitle ? `<p style="font-size: 15px; color: var(--pm-text-body); margin: 0;">${subtitle}</p>` : ""}
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto;">
            ${items.map((item) => `
              <div style="background: var(--pm-surface); border: 1px solid #e2e8f0; border-radius: var(--pm-radius); padding: 24px; text-align: left;">
                <div style="width: 38px; height: 38px; border-radius: 8px; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 16px; color: var(--pm-primary);">✦</div>
                <h3 style="font-size: 16px; font-weight: 700; color: var(--pm-text-heading); margin: 0 0 8px;">${escapeHtml(item.title || item.headline || "")}</h3>
                <p style="font-size: 13.5px; line-height: 1.5; color: var(--pm-text-body); margin: 0;">${escapeHtml(item.description || item.text || "")}</p>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    // 9. FEATURE SPOTLIGHT
    case "FEATURE_SPOTLIGHT": {
      const heading = escapeHtml(data.heading || data.headline || "Engineered Down to the Microscopic Detail");
      const subtitle = escapeHtml(data.subtitle || data.subheadline || "Every layer is conceived and tested across extreme environments.");
      const rows = Array.isArray(data.rows) ? data.rows : [];
      return `
        <section id="${sectionId}" class="pm-section pm-feature-spotlight" style="padding: 60px 32px; background: var(--pm-surface); border-top: 1px solid #e2e8f0;">
          <div style="text-align: center; max-width: 600px; margin: 0 auto 48px;">
            <h2 style="font-size: 28px; font-weight: 800; color: var(--pm-text-heading); margin: 0 0 10px;">${heading}</h2>
            <p style="font-size: 15px; color: var(--pm-text-body); margin: 0;">${subtitle}</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 48px; max-width: 960px; margin: 0 auto;">
            ${rows.map((row, idx) => {
              const isReverse = row.reverse || idx % 2 === 1;
              return `
                <div style="display: grid; grid-template-columns: ${row.imageUrl ? "1fr 1fr" : "1fr"}; gap: 40px; align-items: center; direction: ${isReverse ? "rtl" : "ltr"};">
                  <div style="direction: ltr;">
                    ${row.badge ? `<span style="font-size: 11px; font-weight: 800; color: var(--pm-primary); letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 8px;">${escapeHtml(row.badge)}</span>` : ""}
                    <h3 style="font-size: 22px; font-weight: 800; color: var(--pm-text-heading); margin: 0 0 12px;">${escapeHtml(row.title || "")}</h3>
                    <p style="font-size: 14.5px; line-height: 1.6; color: var(--pm-text-body); margin: 0;">${escapeHtml(row.description || "")}</p>
                  </div>
                  ${row.imageUrl ? `
                    <div style="direction: ltr; text-align: center; background: #ffffff; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0;">
                      <img src="${escapeHtml(row.imageUrl)}" alt="${escapeHtml(row.title || "")}" style="max-width: 100%; max-height: 260px; object-fit: contain;" />
                    </div>
                  ` : ""}
                </div>
              `;
            }).join("")}
          </div>
        </section>
      `;
    }

    // 10. PRODUCT SHOWCASE
    case "PRODUCT_SHOWCASE":
    case "PRODUCT_DETAILS":
    case "FEATURED_PRODUCT": {
      const title = escapeHtml(data.title || "Featured Spotlight");
      const price = escapeHtml(data.price || "$149.00");
      const description = escapeHtml(data.description || "Crafted for performance and durability.");
      const features = Array.isArray(data.features) ? data.features : ["100% Guaranteed", "Free Worldwide Delivery"];
      const imageUrl = data.imageUrl ? escapeHtml(data.imageUrl) : null;
      const btn = data.buttonPrimary || data.buttonAction || { label: "Add to Cart", actionType: "ADD_TO_CART", style: "primary" };

      return `
        <section id="${sectionId}" class="pm-section pm-product-showcase" style="padding: 60px 32px; background: #ffffff; border-top: 1px solid #e2e8f0;">
          <div style="max-width: 800px; margin: 0 auto; background: var(--pm-surface); border: 1px solid #e2e8f0; border-radius: var(--pm-radius); padding: 36px; display: grid; grid-template-columns: ${imageUrl ? "1fr 1.2fr" : "1fr"}; gap: 36px; align-items: center;">
            ${imageUrl ? `
              <div style="text-align: center; background: #ffffff; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0;">
                <img src="${imageUrl}" alt="${title}" style="max-width: 100%; max-height: 240px; object-fit: contain;" />
              </div>
            ` : ""}
            <div>
              <span style="font-size: 11px; font-weight: 800; color: var(--pm-primary); letter-spacing: 0.08em; text-transform: uppercase;">Spotlight Offer</span>
              <h2 style="font-size: 24px; font-weight: 800; color: var(--pm-text-heading); margin: 6px 0 10px;">${title}</h2>
              <div style="font-size: 22px; font-weight: 800; color: var(--pm-primary); margin-bottom: 12px;">${price}</div>
              <p style="font-size: 14px; line-height: 1.6; color: var(--pm-text-body); margin-bottom: 18px;">${description}</p>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
                ${features.map((feat) => `<div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #334155;"><span style="color: #16a34a; font-weight: bold;">✓</span><span>${escapeHtml(feat)}</span></div>`).join("")}
              </div>
              ${renderButtonHtml(btn, "Claim Offer", "primary")}
            </div>
          </div>
        </section>
      `;
    }

    // 11. COMPARISON TABLE
    case "COMPARISON_TABLE": {
      const heading = escapeHtml(data.heading || "Why We Beat Traditional Alternatives");
      const ourBrand = escapeHtml(data.ourBrand || "Our Brand");
      const competitorName = escapeHtml(data.competitorName || "Traditional Alternatives");
      const rows = Array.isArray(data.rows) ? data.rows : [];
      return `
        <section id="${sectionId}" class="pm-section pm-comparison" style="padding: 60px 32px; background: var(--pm-bg); border-top: 1px solid #e2e8f0;">
          <div style="text-align: center; max-width: 600px; margin: 0 auto 36px;">
            <h2 style="font-size: 28px; font-weight: 800; color: var(--pm-text-heading); margin: 0;">${heading}</h2>
          </div>
          <div style="max-width: 720px; margin: 0 auto; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
              <thead>
                <tr style="border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 14px 16px; color: #64748b; font-weight: 600;">Feature / Guarantee</th>
                  <th style="padding: 14px 16px; color: var(--pm-primary); font-weight: 800; background: #eff6ff; border-radius: 8px 8px 0 0;">✨ ${ourBrand}</th>
                  <th style="padding: 14px 16px; color: #94a3b8; font-weight: 600;">${competitorName}</th>
                </tr>
              </thead>
              <tbody>
                ${rows.map((row) => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 14px 16px; font-weight: 600; color: #1e293b;">${escapeHtml(row.feature || "")}</td>
                    <td style="padding: 14px 16px; font-weight: 700; color: #16a34a; background: #f8fafc;">✓ ${escapeHtml(row.us || "")}</td>
                    <td style="padding: 14px 16px; color: #64748b;">${escapeHtml(row.them || "")}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </section>
      `;
    }

    // 12. COLLECTION LIST
    case "COLLECTION_LIST": {
      const heading = escapeHtml(data.heading || "Shop By Category");
      const items = Array.isArray(data.items) ? data.items : [];
      return `
        <section id="${sectionId}" class="pm-section pm-collections" style="padding: 60px 32px; background: var(--pm-bg);">
          <div style="text-align: center; max-width: 600px; margin: 0 auto 36px;">
            <h2 style="font-size: 28px; font-weight: 800; color: var(--pm-text-heading); margin: 0;">${heading}</h2>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; max-width: 960px; margin: 0 auto;">
            ${items.map((cat) => `
              <div style="background: var(--pm-surface); border-radius: var(--pm-radius); border: 1px solid #e2e8f0; overflow: hidden; cursor: pointer;">
                ${cat.imageUrl ? `<img src="${escapeHtml(cat.imageUrl)}" alt="${escapeHtml(cat.title || "")}" style="width: 100%; height: 140px; object-fit: cover;" />` : `<div style="height: 140px; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 32px;">🛍️</div>`}
                <div style="padding: 16px; text-align: center;">
                  <h3 style="font-size: 16px; font-weight: 700; color: var(--pm-text-heading); margin: 0 0 4px;">${escapeHtml(cat.title || "")}</h3>
                  <span style="font-size: 12px; color: var(--pm-primary); font-weight: 600;">Explore ↗</span>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    // 13. FEATURED GRID
    case "FEATURED_GRID": {
      const heading = escapeHtml(data.heading || "Curated Best Sellers");
      const subtitle = escapeHtml(data.subtitle || "Handpicked favorites engineered for peak performance.");
      const products = Array.isArray(data.products) ? data.products : [];
      return `
        <section id="${sectionId}" class="pm-section pm-featured-grid" style="padding: 60px 32px; background: var(--pm-surface); border-top: 1px solid #e2e8f0;">
          <div style="text-align: center; max-width: 600px; margin: 0 auto 40px;">
            <h2 style="font-size: 28px; font-weight: 800; color: var(--pm-text-heading); margin: 0 0 8px;">${heading}</h2>
            <p style="font-size: 14.5px; color: var(--pm-text-body); margin: 0;">${subtitle}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; max-width: 1040px; margin: 0 auto;">
            ${products.map((prod) => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: var(--pm-radius); padding: 16px; display: flex; flex-direction: column; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="height: 160px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px;">
                  ${prod.imageUrl ? `<img src="${escapeHtml(prod.imageUrl)}" alt="${escapeHtml(prod.title || "")}" style="max-width: 100%; max-height: 140px; object-fit: contain;" />` : `<span style="font-size: 28px; color: #94a3b8;">🛍️</span>`}
                </div>
                <h3 style="font-size: 15px; font-weight: 700; color: var(--pm-text-heading); margin: 0 0 6px; flex: 1;">${escapeHtml(prod.title || "")}</h3>
                <div style="font-size: 16px; font-weight: 800; color: var(--pm-primary); margin-bottom: 12px;">${escapeHtml(prod.price || "")}</div>
                ${renderButtonHtml(prod.buttonAction || { label: "Add to Cart", actionType: "ADD_TO_CART", target: prod.id, style: "primary" }, "Add to Cart", "primary")}
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    // 14. BRAND STORY
    case "BRAND_STORY": {
      const heading = escapeHtml(data.heading || "Crafted For Riders, By Riders");
      const storyQuote = escapeHtml(data.storyQuote || "We started with one mission: to build responsive, durable gear without compromise.");
      const founderName = escapeHtml(data.founderName || "Design & Craftsmanship Team");
      const bodyText = escapeHtml(data.bodyText || "Every product in our catalog is conceived, tested, and refined in real-world mountain conditions.");
      const imageUrl = data.imageUrl ? escapeHtml(data.imageUrl) : null;
      return `
        <section id="${sectionId}" class="pm-section pm-brand-story" style="padding: 60px 32px; background: #ffffff; border-top: 1px solid #e2e8f0;">
          <div style="max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: ${imageUrl ? "1.1fr 0.9fr" : "1fr"}; gap: 40px; align-items: center;">
            <div>
              <span style="font-size: 11px; font-weight: 800; color: var(--pm-primary); letter-spacing: 0.08em; text-transform: uppercase;">Our Ethos & Origin</span>
              <h2 style="font-size: 28px; font-weight: 800; color: var(--pm-text-heading); margin: 8px 0 16px;">${heading}</h2>
              <blockquote style="margin: 0 0 18px; padding-left: 16px; border-left: 3px solid var(--pm-primary); font-size: 16px; font-style: italic; color: #1e293b; line-height: 1.5;">"${storyQuote}"</blockquote>
              <p style="font-size: 14.5px; line-height: 1.6; color: var(--pm-text-body); margin: 0 0 12px;">${bodyText}</p>
              <span style="font-size: 13px; font-weight: 700; color: #0f172a;">— ${founderName}</span>
            </div>
            ${imageUrl ? `
              <div style="text-align: center; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <img src="${imageUrl}" alt="${heading}" style="max-width: 100%; max-height: 280px; object-fit: contain;" />
              </div>
            ` : ""}
          </div>
        </section>
      `;
    }

    // 15. TESTIMONIALS / REVIEWS
    case "TESTIMONIALS":
    case "REVIEWS": {
      const heading = escapeHtml(data.heading || data.title || "Real Feedback From Verified Owners");
      const subtitle = escapeHtml(data.subtitle || data.subheadline || "Discover why customers around the world rate us 4.9/5 stars.");
      const items = Array.isArray(data.items || data.reviews) ? (data.items || data.reviews) : [];
      return `
        <section id="${sectionId}" class="pm-section pm-testimonials" style="padding: 60px 32px; background: var(--pm-surface); border-top: 1px solid #e2e8f0;">
          <div style="text-align: center; max-width: 600px; margin: 0 auto 40px;">
            <h2 style="font-size: 28px; font-weight: 800; color: var(--pm-text-heading); margin: 0 0 8px;">${heading}</h2>
            <p style="font-size: 14.5px; color: var(--pm-text-body); margin: 0;">${subtitle}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; max-width: 1000px; margin: 0 auto;">
            ${items.map((rev) => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: var(--pm-radius); padding: 24px; display: flex; flex-direction: column; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="color: #f59e0b; font-size: 15px; margin-bottom: 12px;">★★★★★</div>
                <p style="font-size: 13.5px; line-height: 1.6; color: #334155; font-style: italic; flex: 1; margin: 0 0 16px;">"${escapeHtml(rev.comment || rev.quote || rev.text || rev.review || "")}"</p>
                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                  <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${escapeHtml(rev.name || rev.author || "Verified Customer")}</span>
                  <span style="font-size: 11px; color: #16a34a; font-weight: 600; display: flex; align-items: center; gap: 3px;">✓ ${escapeHtml(rev.badge || "Verified")}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    // 16. FAQ & FAQ ACCORDION GROUPS
    case "FAQ":
    case "FAQ_GROUP_SHIPPING":
    case "FAQ_GROUP_RETURNS":
    case "FAQ_GROUP_GENERAL": {
      const heading = escapeHtml(data.heading || data.groupTitle || data.title || "Frequently Asked Questions");
      const items = Array.isArray(data.items || data.faqs) ? (data.items || data.faqs) : [];
      return `
        <section id="${sectionId}" class="pm-section pm-faq" style="padding: 50px 32px; background: var(--pm-bg); border-top: 1px solid #e2e8f0;">
          <div style="text-align: center; max-width: 600px; margin: 0 auto 32px;">
            <h2 style="font-size: 26px; font-weight: 800; color: var(--pm-text-heading); margin: 0;">${heading}</h2>
          </div>
          <div style="max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px;">
            ${items.map((item, idx) => `
              <details class="pm-faq-accordion" ${idx === 0 ? "open" : ""} style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; transition: all 0.2s ease;">
                <summary style="padding: 16px 20px; font-size: 14px; font-weight: 600; color: #0f172a; cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: space-between;">
                  <span>${escapeHtml(item.question || item.q || "")}</span>
                  <span class="pm-faq-arrow" style="font-size: 12px; color: #64748b;">▼</span>
                </summary>
                <div style="padding: 0 20px 16px; font-size: 13.5px; line-height: 1.6; color: #475569;">
                  ${escapeHtml(item.answer || item.a || "")}
                </div>
              </details>
            `).join("")}
          </div>
        </section>
      `;
    }

    // 17. QUICK HELP GRID
    case "QUICK_HELP_GRID": {
      const cards = Array.isArray(data.cards) ? data.cards : [];
      return `
        <section id="${sectionId}" class="pm-section pm-quick-help" style="padding: 40px 32px; background: #ffffff; border-bottom: 1px solid #e2e8f0;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; max-width: 860px; margin: 0 auto;">
            ${cards.map((card, idx) => `
              <a href="${escapeHtml(card.link || "#")}" style="display: flex; align-items: center; gap: 14px; padding: 20px; background: var(--pm-surface); border: 1px solid #e2e8f0; border-radius: var(--pm-radius); text-decoration: none; color: inherit;">
                <div style="width: 42px; height: 42px; border-radius: 10px; background: #eff6ff; display: flex; align-items: center; justify-content: center; color: var(--pm-primary); font-size: 20px; flex-shrink: 0;">
                  ${idx === 0 ? "🚚" : idx === 1 ? "🔄" : "✉️"}
                </div>
                <div>
                  <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px;">${escapeHtml(card.title || "")}</h4>
                  <p style="font-size: 12px; color: #64748b; margin: 0;">${escapeHtml(card.description || "")}</p>
                </div>
              </a>
            `).join("")}
          </div>
        </section>
      `;
    }

    // 18. CONTACT SUPPORT CARD
    case "CONTACT_SUPPORT_CARD": {
      const heading = escapeHtml(data.heading || "Still have questions?");
      const subtitle = escapeHtml(data.subtitle || "Our customer support team is available 7 days a week.");
      return `
        <section id="${sectionId}" class="pm-section pm-contact-support" style="padding: 60px 32px; background: var(--pm-surface); border-top: 1px solid #e2e8f0; text-align: center;">
          <div style="max-width: 560px; margin: 0 auto;">
            <h3 style="font-size: 24px; font-weight: 800; color: var(--pm-text-heading); margin: 0 0 10px;">${heading}</h3>
            <p style="font-size: 14.5px; color: var(--pm-text-body); margin: 0 0 24px;">${subtitle}</p>
            ${renderButtonHtml(data.buttonAction || { label: "Contact Support", actionType: "LINK", target: "/pages/contact", style: "primary" }, "Contact Support", "primary")}
          </div>
        </section>
      `;
    }

    // 19. STICKY BUY BAR
    case "STICKY_BUY_BAR": {
      const title = escapeHtml(data.title || data.headline || "Special Offer");
      const price = data.price ? escapeHtml(data.price) : "";
      const imageUrl = data.imageUrl ? escapeHtml(data.imageUrl) : null;
      const btn = data.buttonAction || { label: "Instant Checkout", actionType: "BUY_NOW", style: "primary" };

      return `
        <div id="${sectionId}" class="pm-section pm-sticky-buy-bar" style="position: fixed; bottom: 0; left: 0; right: 0; background: #ffffff; border-top: 2px solid #e2e8f0; box-shadow: 0 -4px 16px rgba(0,0,0,0.06); padding: 12px 24px; z-index: 999; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 6px;" />` : ""}
            <div>
              <span style="font-size: 13.5px; font-weight: 700; color: #0f172a; display: block;">${title}</span>
              ${price ? `<span style="font-size: 13px; font-weight: 800; color: var(--pm-primary);">${price}</span>` : ""}
            </div>
          </div>
          <div>
            ${renderButtonHtml(btn, "Instant Checkout", "primary", data.variantId ? `data-pm-variant-id="${escapeHtml(data.variantId)}"` : "")}
          </div>
        </div>
      `;
    }

    // 20. FINAL CTA BANNER
    case "FINAL_CTA": {
      const heading = escapeHtml(data.heading || data.headline || "Ready to Elevate Your Performance?");
      const subheading = escapeHtml(data.subheading || data.subheadline || data.description || "Claim your limited-time discount before promotion ends.");
      const btn = data.buttonPrimary || data.buttonAction || data.primaryButton || { label: "Claim Offer Now", actionType: "BUY_NOW", style: "secondary" };
      return `
        <section id="${sectionId}" class="pm-section pm-final-cta" style="padding: 60px 32px; background: var(--pm-primary); color: #ffffff; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="font-size: 32px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em; color: #ffffff;">${heading}</h2>
            <p style="font-size: 16px; color: rgba(255, 255, 255, 0.9); margin: 0 0 28px;">${subheading}</p>
            ${renderButtonHtml(btn, "Claim Offer Now", "secondary")}
          </div>
        </section>
      `;
    }

    // 21. NEWSLETTER SIGNUP
    case "NEWSLETTER_SIGNUP": {
      const heading = escapeHtml(data.heading || "Join Our Community");
      const subtitle = escapeHtml(data.subtitle || "Get 15% off your first order + early access to limited edition drops.");
      const buttonText = escapeHtml(data.buttonText || "Subscribe");
      return `
        <section id="${sectionId}" class="pm-section pm-newsletter" style="padding: 60px 32px; background: var(--pm-surface); border-top: 1px solid #e2e8f0; text-align: center;">
          <div style="max-width: 520px; margin: 0 auto;">
            <h2 style="font-size: 26px; font-weight: 800; color: var(--pm-text-heading); margin: 0 0 8px;">${heading}</h2>
            <p style="font-size: 14px; color: var(--pm-text-body); margin: 0 0 24px;">${subtitle}</p>
            <form onsubmit="event.preventDefault(); alert('Thanks for subscribing!');" style="display: flex; gap: 8px; max-width: 420px; margin: 0 auto;">
              <input type="email" placeholder="Enter your email" required style="flex: 1; padding: 12px 16px; border-radius: var(--pm-radius); border: 1px solid #cbd5e1; font-size: 14px; outline: none;" />
              <button type="submit" class="pm-action-btn" style="padding: 12px 20px; background: var(--pm-primary); color: #ffffff; border: none; border-radius: var(--pm-radius); font-size: 14px; font-weight: 700; cursor: pointer;">${buttonText}</button>
            </form>
          </div>
        </section>
      `;
    }

    // 22. FOOTER
    case "FOOTER": {
      const copyright = escapeHtml(data.copyright || `© ${new Date().getFullYear()} Store. All rights reserved.`);
      const policyLinks = Array.isArray(data.policyLinks) ? data.policyLinks : ["Refund Policy", "Privacy Policy", "Terms of Service"];
      return `
        <footer id="${sectionId}" class="pm-section pm-footer" style="padding: 32px; background: #0f172a; color: #94a3b8; display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; flex-wrap: wrap; gap: 16px;">
          <span>${copyright}</span>
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            ${policyLinks.map((link) => `<span style="color: #cbd5e1; cursor: pointer;">${escapeHtml(typeof link === "string" ? link : link.label || "")}</span>`).join("")}
          </div>
        </footer>
      `;
    }

    // GENERIC FALLBACK
    default:
      return `
        <section id="${sectionId}" class="pm-section pm-generic" style="padding: 40px 32px; background: #ffffff; border-top: 1px solid #e2e8f0; text-align: center;">
          <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 10px;">${type}</h3>
          <p style="font-size: 14px; color: #64748b;">${escapeHtml(data.heading || data.title || "Custom section content")}</p>
        </section>
      `;
  }
}
