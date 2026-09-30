/**
 * PageMatic Storefront Runtime Engine
 * Executes native Shopify AJAX Cart actions, 1-Click Buy Now checkout bypass,
 * smooth scrolling, and sticky buy bar transitions on live storefront pages.
 */
(function () {
  "use strict";

  // Prevent double initialization
  if (window.__pagematic_runtime_initialized) return;
  window.__pagematic_runtime_initialized = true;

  // Helper: Extract clean numeric ID from Shopify GID or raw string
  function extractNumericVariantId(rawId) {
    if (!rawId) return null;
    const str = String(rawId).trim();
    // 1. Check for Shopify Global ID (GID) format: gid://shopify/ProductVariant/123456
    const gidMatch = str.match(/\/ProductVariant\/(\d+)/i) || str.match(/\/Product\/(\d+)/i);
    if (gidMatch && gidMatch[1]) {
      return gidMatch[1];
    }
    // 2. Pure digits or numbers within string (e.g. 1234567890)
    const digitMatch = str.match(/\d{5,}/) || str.match(/\d+/);
    if (digitMatch && digitMatch[0]) {
      return digitMatch[0];
    }
    return null;
  }

  // Helper: Resolve variant ID from button attributes or enclosing section
  function resolveVariantId(button) {
    // 1. Direct attribute
    const attrId = button.getAttribute("data-pm-variant-id");
    if (attrId) {
      const clean = extractNumericVariantId(attrId);
      if (clean) return clean;
    }

    // 2. Check target attribute
    const target = button.getAttribute("data-pm-target");
    if (target) {
      const clean = extractNumericVariantId(target);
      if (clean) return clean;
    }

    // 3. Check for selected variant button in the same section
    const section = button.closest(".pm-section, #pagematic-root") || document;
    const variantBtn = section.querySelector(".pm-variant-btn.pm-variant-selected, .pm-variant-btn[data-variant-id], [data-variant-id]");
    if (variantBtn) {
      const clean = extractNumericVariantId(variantBtn.getAttribute("data-variant-id"));
      if (clean) return clean;
    }

    return null;
  }

  // Interactive Variant Selection Handler
  document.addEventListener("click", (event) => {
    const variantBtn = event.target.closest(".pm-variant-btn, [data-variant-id]");
    if (!variantBtn) return;

    const rawVariantId = variantBtn.getAttribute("data-variant-id");
    const cleanVariantId = extractNumericVariantId(rawVariantId);
    if (!cleanVariantId) return;

    const section = variantBtn.closest(".pm-section, #pagematic-root") || document;

    // Reset styles on sibling variant buttons
    const siblings = section.querySelectorAll(".pm-variant-btn, [data-variant-id]");
    siblings.forEach((b) => {
      b.classList.remove("pm-variant-selected");
      b.style.border = "1px solid #cbd5e1";
      b.style.background = "#ffffff";
      b.style.color = "#334155";
    });

    // Highlight selected button
    variantBtn.classList.add("pm-variant-selected");
    variantBtn.style.border = "2px solid var(--pm-primary, #0052FF)";
    variantBtn.style.background = "#eff6ff";
    variantBtn.style.color = "var(--pm-primary, #0052FF)";

    // Update variant ID on action buttons in this section
    const actionBtns = section.querySelectorAll('[data-pm-action="ADD_TO_CART"], [data-pm-action="BUY_NOW"]');
    actionBtns.forEach((btn) => {
      btn.setAttribute("data-pm-variant-id", cleanVariantId);
    });
  });

  // Global Click Event Delegation
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-pm-action]");
    if (!button) return;

    const actionType = button.getAttribute("data-pm-action");
    const target = button.getAttribute("data-pm-target") || "";
    const variantId = resolveVariantId(button);

    // 1. LINK ACTION
    if (actionType === "LINK") {
      if (target) {
        if (
          target.startsWith("/") ||
          target.startsWith("http://") ||
          target.startsWith("https://") ||
          target.startsWith("mailto:") ||
          target.startsWith("tel:")
        ) {
          window.location.href = target;
        } else {
          window.location.href = "/" + target;
        }
      }
      return;
    }

    // 2. SMOOTH SCROLL ACTION
    if (actionType === "SCROLL_TO") {
      event.preventDefault();
      if (target) {
        const cleanId = target.replace(/^#/, "");
        const targetEl =
          document.getElementById(cleanId) ||
          document.querySelector(target) ||
          document.querySelector(`[id*="${cleanId}"]`);

        if (targetEl) {
          targetEl.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
      return;
    }

    // 3. 1-CLICK INSTANT BUY NOW (Direct Checkout Bypass)
    if (actionType === "BUY_NOW") {
      event.preventDefault();

      if (variantId) {
        // Direct redirect to Shopify checkout with this variant
        window.location.href = `/cart/${encodeURIComponent(variantId)}:1`;
      } else if (target && (target.startsWith("/") || target.startsWith("http"))) {
        window.location.href = target;
      } else {
        window.location.href = "/collections/all";
      }
      return;
    }

    // 4. AJAX ADD TO CART
    if (actionType === "ADD_TO_CART") {
      event.preventDefault();

      if (!variantId) {
        console.warn("[PageMatic] No variant ID found for Add to Cart action.");
        if (target && (target.startsWith("/") || target.startsWith("http"))) {
          window.location.href = target;
        }
        return;
      }

      // Visual Loading Feedback
      const originalContent = button.innerHTML;
      button.disabled = true;
      button.classList.add("pm-btn-loading");
      button.innerHTML = "<span>Adding...</span>";

      try {
        const rootUrl = window.Shopify?.routes?.root || "/";
        const endpoint = (rootUrl.endsWith("/") ? rootUrl : rootUrl + "/") + "cart/add.js";

        // Request updated sections from Shopify's Section Rendering API for Dawn / OS 2.0 themes
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                id: Number(variantId) || variantId,
                quantity: 1,
              },
            ],
            sections: "cart-drawer,cart-icon-bubble,cart-live-region-text,main-cart-items",
            sections_url: window.location.pathname,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          // Success State
          button.innerHTML = "<span>Added! ✓</span>";

          // Dispatch standard Shopify theme cart refresh events
          document.documentElement.dispatchEvent(
            new CustomEvent("cart:updated", {
              bubbles: true,
              detail: { cart: data },
            })
          );
          document.documentElement.dispatchEvent(
            new CustomEvent("cart:refresh", {
              bubbles: true,
              detail: { cart: data },
            })
          );

          // Support Dawn & standard OS 2.0 cart drawers safely
          try {
            const cartDrawer = document.querySelector("cart-drawer, cart-notification");
            if (cartDrawer) {
              if (typeof cartDrawer.renderContents === "function" && data.sections) {
                cartDrawer.renderContents(data);
              } else if (typeof cartDrawer.open === "function") {
                cartDrawer.open();
              } else {
                cartDrawer.classList.add("active", "is-open");
              }
            }

            // Update cart bubbles if theme provides them
            const bubbles = document.querySelectorAll(".cart-count-bubble, [data-cart-count]");
            if (bubbles.length > 0) {
              const countRes = await fetch((rootUrl.endsWith("/") ? rootUrl : rootUrl + "/") + "cart.js");
              const cartState = await countRes.json();
              bubbles.forEach((b) => {
                b.textContent = cartState.item_count || 1;
                b.classList.remove("hidden");
              });
            }
          } catch (drawerErr) {
            console.warn("[PageMatic] Theme drawer notice:", drawerErr);
          }

          // Reset button feedback
          setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
            button.classList.remove("pm-btn-loading");
          }, 2000);
        } else {
          // Error Feedback (e.g. Sold Out)
          const errorMsg = data?.description || data?.message || "Unavailable";
          button.innerHTML = `<span>${errorMsg}</span>`;

          setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
            button.classList.remove("pm-btn-loading");
          }, 2500);
        }
      } catch (err) {
        console.error("[PageMatic] Cart add error:", err);
        button.innerHTML = "<span>Error</span>";
        setTimeout(() => {
          button.innerHTML = originalContent;
          button.disabled = false;
          button.classList.remove("pm-btn-loading");
        }, 2000);
      }
    }
  });

  // Sticky Buy Bar Scroll Behavior
  function initStickyBuyBar() {
    const stickyBar = document.querySelector(".pm-sticky-buy-bar");
    if (!stickyBar) return;

    let isVisible = false;
    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        if (scrollY > 350 && !isVisible) {
          stickyBar.style.display = "flex";
          isVisible = true;
        } else if (scrollY <= 350 && isVisible) {
          stickyBar.style.display = "none";
          isVisible = false;
        }
      },
      { passive: true }
    );
  }

  // Automatic Theme Breakout & Duplicate Header Cleanup
  function initStorefrontBreakout() {
    const root = document.getElementById("pagematic-root") || document.querySelector(".pagematic-page-container");
    if (!root) return;

    // 1. Expand parent theme wrappers
    let parent = root.parentElement;
    while (parent && parent !== document.body) {
      if (
        parent.classList.contains("page-width") ||
        parent.classList.contains("page-width--narrow") ||
        parent.classList.contains("rte") ||
        parent.classList.contains("main-page-section") ||
        parent.classList.contains("section-main-page")
      ) {
        parent.style.setProperty("max-width", "100%", "important");
        parent.style.setProperty("width", "100%", "important");
        parent.style.setProperty("padding-left", "0", "important");
        parent.style.setProperty("padding-right", "0", "important");
        parent.style.setProperty("margin-left", "0", "important");
        parent.style.setProperty("margin-right", "0", "important");
      }
      parent = parent.parentElement;
    }

    // 2. Hide redundant theme <h1> title above PageMatic page
    const themeTitles = document.querySelectorAll(".main-page-title, .page-title, .main-page__title, h1.title, .section-header");
    themeTitles.forEach((titleEl) => {
      if (titleEl.closest(".main-page-section, .section-main-page, .shopify-section, main")?.querySelector("#pagematic-root, .pagematic-page-container")) {
        titleEl.style.setProperty("display", "none", "important");
      }
    });
  }

  // Run on load
  function init() {
    initStorefrontBreakout();
    initStickyBuyBar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();