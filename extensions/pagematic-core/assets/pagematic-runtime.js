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

  // Global Click Event Delegation
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-pm-action]");
    if (!button) return;

    const actionType = button.getAttribute("data-pm-action");
    let variantId = button.getAttribute("data-pm-variant-id");
    const target = button.getAttribute("data-pm-target") || "";

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

    // 3. 1-CLICK INSTANT BUY NOW (Checkout Bypass)
    if (actionType === "BUY_NOW") {
      event.preventDefault();

      // If variantId is not explicitly set, check if target has numeric ID
      if (!variantId && target && /^\d+$/.test(target.trim())) {
        variantId = target.trim();
      }

      if (variantId) {
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

      if (!variantId && target && /^\d+$/.test(target.trim())) {
        variantId = target.trim();
      }

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
          }),
        });

        const data = await res.json();

        if (res.ok) {
          // Success Feedback
          button.innerHTML = "<span>Added! ✓</span>";

          // Dispatch standard Shopify theme events so theme drawers open & counters update
          document.dispatchEvent(
            new CustomEvent("cart:updated", {
              bubbles: true,
              detail: { cart: data },
            })
          );
          document.dispatchEvent(new CustomEvent("cart:refresh", { bubbles: true }));
          document.dispatchEvent(new CustomEvent("cart:build", { bubbles: true }));

          // Support for Dawn & modern Shopify theme web components
          const cartDrawer = document.querySelector("cart-drawer") || document.querySelector("cart-notification");
          if (cartDrawer && typeof cartDrawer.renderContents === "function") {
            cartDrawer.renderContents(data);
          }

          // If no cart drawer opened after 800ms, redirect to cart page as safe fallback
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

  // Run on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStickyBuyBar);
  } else {
    initStickyBuyBar();
  }
})();