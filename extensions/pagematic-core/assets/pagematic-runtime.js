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
    if (event.__pmHandled) return;
    const button = event.target.closest("[data-pm-action]");
    if (!button) return;
    event.__pmHandled = true;

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
        } else {
          showPmToast("⚠️ Please select a product option first.", false);
        }
        return;
      }

      // Visual Loading Feedback
      const originalContent = button.innerHTML;
      button.disabled = true;
      button.classList.add("pm-btn-loading");
      button.innerHTML = "<span>Adding...</span>";

      try {
        const rootUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || "/";
        const cleanRoot = rootUrl.endsWith("/") ? rootUrl : rootUrl + "/";

        // Detect theme sections to render
        let sectionsList = ["cart-drawer", "cart-icon-bubble", "cart-notification", "cart-live-region-text", "main-cart-items"];
        const cartDrawerEl = document.querySelector("cart-drawer");
        if (cartDrawerEl && typeof cartDrawerEl.getSectionsToRender === "function") {
          try {
            const customSecs = cartDrawerEl.getSectionsToRender().map((s) => s.section || s.id);
            if (customSecs.length) sectionsList = customSecs;
          } catch (e) {}
        }

        const formData = new FormData();
        formData.append("id", parseInt(variantId, 10));
        formData.append("quantity", 1);
        formData.append("sections", sectionsList.join(","));
        formData.append("sections_url", "/");

        const res = await fetch(`${cleanRoot}cart/add`, {
          method: "POST",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json",
          },
          body: formData,
        });

        let data = null;
        if (res.ok) {
          data = await res.json();
        } else {
          // Fallback to JSON endpoint
          const resFallback = await fetch(`${cleanRoot}cart/add.js`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              id: parseInt(variantId, 10),
              quantity: 1,
            }),
          });
          if (!resFallback.ok) {
            throw new Error("Failed to add product to cart");
          }
          data = await resFallback.json();
        }

        // Success State on Button
        button.innerHTML = "<span>Added! ✓</span>";
        showPmToast("✓ Added to cart!", true);

        // Update Theme Cart & Open Drawer
        await updateThemeCart(data ? data.sections : null, data);

        // Reset button feedback
        setTimeout(() => {
          button.innerHTML = originalContent;
          button.disabled = false;
          button.classList.remove("pm-btn-loading");
        }, 2000);
      } catch (err) {
        console.error("[PageMatic] Cart add error:", err);
        button.innerHTML = "<span>Unavailable</span>";
        showPmToast("⚠️ Could not add item to cart.", false);
        setTimeout(() => {
          button.innerHTML = originalContent;
          button.disabled = false;
          button.classList.remove("pm-btn-loading");
        }, 2500);
      }
    }
  });

  // Helper: Visual Toast Notification
  function showPmToast(msg, isSuccess) {
    const existing = document.getElementById("pm-storefront-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "pm-storefront-toast";
    toast.innerHTML = msg;
    toast.style.cssText =
      "position: fixed; bottom: 24px; right: 24px; background: #0F172A; color: #FFFFFF; padding: 14px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.25); z-index: 999999; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; opacity: 0; transform: translateY(10px); border: " +
      (isSuccess ? "1px solid rgba(34, 197, 94, 0.4);" : "1px solid rgba(239, 68, 68, 0.4);");

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 20);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }

  // Helper: Update Theme Cart & Render Drawer Contents
  async function updateThemeCart(sectionsData, itemData) {
    const rootUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || "/";
    const cleanRoot = rootUrl.endsWith("/") ? rootUrl : rootUrl + "/";
    let sectionRendered = false;

    function renderItemsFromCartObject(cart) {
      if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) return;

      const itemsContainer = document.querySelector("#CartDrawer-CartItems, cart-drawer-items, .drawer__contents, .cart-drawer__items");
      if (itemsContainer) {
        let itemsHtml =
          '<table class="cart-items" role="table" style="width: 100%; border-collapse: collapse; margin-top: 12px;">' +
          '<thead><tr style="border-bottom: 1px solid #E2E8F0; font-size: 11px; text-transform: uppercase; color: #64748B;"><th style="text-align: left; padding: 6px 0;">Product</th><th style="text-align: right; padding: 6px 0;">Total</th></tr></thead>' +
          "<tbody>";

        cart.items.forEach((item) => {
          const imgUrl = item.featured_image ? item.featured_image.url || item.featured_image : item.image || "";
          const itemPrice = "$" + (item.final_price / 100).toFixed(2);
          const lineTotal = "$" + (item.final_line_price / 100).toFixed(2);
          const itemTitle = item.product_title || item.title || "Product";
          const varTitle = item.variant_title && item.variant_title !== "Default Title" ? item.variant_title : "";

          itemsHtml +=
            '<tr class="cart-item" style="border-bottom: 1px solid #F1F5F9; padding: 14px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px;">' +
            '<td style="display: flex; align-items: center; gap: 12px; flex: 1;">' +
            (imgUrl
              ? `<img src="${imgUrl}" alt="${itemTitle}" style="width: 60px; height: 60px; object-fit: contain; background: #FFFFFF; border-radius: 6px; border: 1px solid #E2E8F0; padding: 4px; flex-shrink: 0;" />`
              : '<div style="width: 60px; height: 60px; background: #F1F5F9; border-radius: 6px; flex-shrink: 0;"></div>') +
            "<div>" +
            `<div style="font-weight: 700; font-size: 13.5px; color: #0F172A; line-height: 1.3;">${itemTitle}</div>` +
            (varTitle ? `<div style="font-size: 12px; color: #64748B; margin-top: 2px;">${varTitle}</div>` : "") +
            `<div style="font-size: 13px; color: #0F172A; font-weight: 600; margin-top: 4px;">${itemPrice}</div>` +
            `<div style="font-size: 12px; color: #64748B; margin-top: 4px;">Qty: ${item.quantity}</div>` +
            "</div>" +
            "</td>" +
            `<td style="font-weight: 700; font-size: 14px; color: #0F172A; text-align: right; white-space: nowrap;">${lineTotal}</td>` +
            "</tr>";
        });

        itemsHtml += "</tbody></table>";
        itemsContainer.innerHTML = itemsHtml;
      }

      // Update Subtotal value (only target the value container, not the label)
      const subtotalVal = "$" + (cart.total_price / 100).toFixed(2) + " " + (cart.currency || "USD");
      const subtotalEls = document.querySelectorAll(".totals__subtotal-value, .drawer__footer .totals__subtotal-value, [data-cart-total]");
      subtotalEls.forEach((el) => {
        el.textContent = subtotalVal;
      });

      // Update header heading if empty
      const drawerHeader = document.querySelector(".drawer__header, .cart-drawer__header");
      if (drawerHeader && !drawerHeader.querySelector("h2, .drawer__heading")) {
        drawerHeader.innerHTML = '<h2 class="drawer__heading" style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 0;">Your cart</h2>';
      }
    }

    function applySections(sections) {
      if (!sections) return;

      const cartDrawerEl = document.querySelector("cart-drawer");
      const cartNotificationEl = document.querySelector("cart-notification");

      // 1. Try native Dawn / Shopify Custom Element renderContents
      let handledNative = false;
      if (cartDrawerEl && typeof cartDrawerEl.renderContents === "function") {
        try {
          cartDrawerEl.renderContents({
            id: itemData ? itemData.id : null,
            sections: sections,
          });
          handledNative = true;
          sectionRendered = true;
        } catch (e) {
          console.warn("[PageMatic] Native cartDrawer.renderContents error:", e);
        }
      }

      if (!handledNative && cartNotificationEl && typeof cartNotificationEl.renderContents === "function") {
        try {
          cartNotificationEl.renderContents({
            id: itemData ? itemData.id : null,
            sections: sections,
          });
          handledNative = true;
          sectionRendered = true;
        } catch (e) {}
      }

      // 2. Direct DOM HTML replacement from section HTML if not handled natively
      if (!handledNative && sections["cart-drawer"]) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(sections["cart-drawer"], "text/html");

          const liveInner = document.querySelector(".drawer__inner");
          const newInner = doc.querySelector(".drawer__inner");
          if (liveInner && newInner && newInner.innerHTML.trim().length > 30) {
            liveInner.innerHTML = newInner.innerHTML;
            sectionRendered = true;
          }

          const liveItems = document.querySelector("#CartDrawer-CartItems, cart-drawer-items, .drawer__contents");
          const newItems = doc.querySelector("#CartDrawer-CartItems, cart-drawer-items, .drawer__contents");
          if (liveItems && newItems && newItems.innerHTML.trim().length > 20) {
            liveItems.innerHTML = newItems.innerHTML;
            sectionRendered = true;
          }

          const liveFooter = document.querySelector(".cart-drawer__footer, .drawer__footer");
          const newFooter = doc.querySelector(".cart-drawer__footer, .drawer__footer");
          if (liveFooter && newFooter) {
            liveFooter.innerHTML = newFooter.innerHTML;
          }
        } catch (domErr) {
          console.warn("[PageMatic] DOM parser error for cart-drawer:", domErr);
        }
      }

      if (sections["cart-icon-bubble"]) {
        try {
          const bParser = new DOMParser();
          const bDoc = bParser.parseFromString(sections["cart-icon-bubble"], "text/html");
          const liveBubble = document.querySelector("#cart-icon-bubble");
          const newBubble = bDoc.querySelector("#cart-icon-bubble") || bDoc.body.firstElementChild;
          if (liveBubble && newBubble) {
            liveBubble.innerHTML = newBubble.innerHTML;
          }
        } catch (bErr) {}
      }

      // Remove is-empty classes across all drawer wrappers
      const emptyWrappers = document.querySelectorAll("cart-drawer, #CartDrawer, .drawer__inner, cart-drawer-items, .cart-drawer, .drawer");
      emptyWrappers.forEach((el) => {
        el.classList.remove("is-empty");
      });

      // Open drawer
      if (cartDrawerEl) {
        if (typeof cartDrawerEl.open === "function") {
          cartDrawerEl.open();
        } else {
          cartDrawerEl.classList.add("active", "animate", "is-open");
          document.documentElement.classList.add("overflow-hidden");
        }
      } else {
        const mainDrawer = document.querySelector("#CartDrawer, .cart-drawer, .drawer");
        if (mainDrawer) {
          mainDrawer.classList.add("active", "animate", "is-open");
          document.documentElement.classList.add("overflow-hidden");
        } else {
          const cartTrigger = document.querySelector('#cart-icon-bubble, [aria-controls="CartDrawer"], [data-drawer-trigger="cart"], a[href="#cart-drawer"]');
          if (cartTrigger) cartTrigger.click();
        }
      }
    }

    if (sectionsData && (sectionsData["cart-drawer"] || sectionsData["cart-icon-bubble"])) {
      applySections(sectionsData);
    } else {
      // Fallback: Fetch rendered sections from root URL
      try {
        const sRes = await fetch(`${cleanRoot}?sections=cart-drawer,cart-icon-bubble,cart-notification`);
        if (sRes.ok) {
          const sData = await sRes.json();
          applySections(sData);
        }
      } catch (err) {
        console.warn("[PageMatic] Section fetch error:", err);
      }
    }

    // Always fetch /cart.js to ensure live cart badges and theme events are dispatched
    try {
      const cRes = await fetch(`${cleanRoot}cart.js`);
      if (cRes.ok) {
        const cart = await cRes.json();

        // ONLY use client-side table rendering if theme section rendering completely failed/empty
        const liveItems = document.querySelector("#CartDrawer-CartItems, cart-drawer-items .cart-item, .drawer__contents .cart-item");
        if (!sectionRendered && !liveItems) {
          renderItemsFromCartObject(cart);
        }

        // Remove is-empty from all drawer wrappers
        const emptyEls = document.querySelectorAll("cart-drawer, #CartDrawer, .drawer__inner, cart-drawer-items, .cart-drawer, .drawer");
        emptyEls.forEach((el) => el.classList.remove("is-empty"));

        // Dispatch standard Shopify theme events
        document.documentElement.dispatchEvent(new CustomEvent("cart:updated", { bubbles: true, detail: { cart } }));
        document.documentElement.dispatchEvent(new CustomEvent("cart:refresh", { bubbles: true, detail: { cart } }));
        document.dispatchEvent(new CustomEvent("cart:build", { bubbles: true }));
        document.dispatchEvent(new CustomEvent("ajaxCart.afterCartLoad", { bubbles: true, detail: cart }));
        document.dispatchEvent(new CustomEvent("shopify:cart:update", { bubbles: true, detail: cart }));

        // Update badges
        const badges = document.querySelectorAll(".cart-count, .cart-count-bubble, [data-cart-count], #CartCount, .header__cart-count, #cart-icon-bubble span");
        badges.forEach((badge) => {
          badge.textContent = cart.item_count;
          badge.removeAttribute("hidden");
          badge.classList.remove("visually-hidden", "hidden");
        });

        // Open drawer if not already open
        const drawer = document.querySelector("cart-drawer, #CartDrawer, .cart-drawer, .drawer");
        if (drawer) {
          drawer.classList.remove("is-empty");
          if (typeof drawer.open === "function") drawer.open();
          else drawer.classList.add("active", "animate", "is-open");
        }
      }
    } catch (cartErr) {
      console.warn("[PageMatic] Cart sync error:", cartErr);
    }
  }

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

  // Bright Idea 3: Universal Dynamic Theme Breakout & Duplicate Header Cleanup
  function initStorefrontBreakout() {
    const root = document.getElementById("pagematic-root") || document.querySelector(".pagematic-page-container");
    if (!root) return;

    // 1. Walk up EVERY ancestor element to document.body and strip width/padding/margin constraints
    let parent = root.parentElement;
    while (parent && parent !== document.body && parent !== document.documentElement) {
      parent.style.setProperty("max-width", "100%", "important");
      parent.style.setProperty("width", "100%", "important");
      parent.style.setProperty("padding-left", "0px", "important");
      parent.style.setProperty("padding-right", "0px", "important");
      parent.style.setProperty("margin-left", "0px", "important");
      parent.style.setProperty("margin-right", "0px", "important");
      parent = parent.parentElement;
    }

    // 2. Hide redundant theme <h1> or <header> preceding or surrounding PageMatic in the same section
    const enclosingSection = root.closest(".shopify-section, main, #MainContent, .main-content, body") || document.body;
    const candidates = enclosingSection.querySelectorAll('h1, header, .main-page-title, .page-title, .main-page__title, .section-header, .page-header, .title-wrapper, [class*="title"], [class*="header"]');
    candidates.forEach((el) => {
      if (!root.contains(el)) {
        el.style.setProperty("display", "none", "important");
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