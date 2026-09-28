import { useState, useEffect } from "react";
import {
  Mic,
  Package,
  HelpCircle,
  Check,
  ChevronDown,
  AlertCircle,
  Layers,
  ShoppingBag,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import TokenBadge from "../TokenBadge";

export default function StepPromptInput({
  pageType,
  pageTitle,
  setPageTitle,
  promptText,
  setPromptText,
  niche,
  setNiche,
  selectedProduct,
  setSelectedProduct,
  selectedProducts = [],
  setSelectedProducts,
  selectedCollection = null,
  setSelectedCollection,
  selectedPolicies = [],
  setSelectedPolicies,
  products = [],
  collections = [],
  policies = [],
  hasSufficientCredits,
  shopSettings,
}) {
  const [voiceSuccess, setVoiceSuccess] = useState(null);

  // Listen for voice dictation from popup via BroadcastChannel and postMessage
  useEffect(() => {
    const handleVoiceText = (text) => {
      if (!text || typeof text !== "string") return;
      const cleanText = text.trim();
      if (!cleanText) return;

      setPromptText((prev) => {
        const combined = prev ? `${prev.trim()} ${cleanText}` : cleanText;
        return combined.slice(0, 2500);
      });

      setVoiceSuccess("✨ Voice instructions added!");
      setTimeout(() => {
        setVoiceSuccess(null);
      }, 3500);
    };

    // 1. BroadcastChannel (modern, reliable across same-origin windows/iframes)
    let channel;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel("pagematic_voice_sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "PAGEMATIC_VOICE_TRANSCRIPT") {
          handleVoiceText(event.data.text);
        }
      };
    }

    // 2. window.addEventListener("message") (fallback for postMessage from popup opener)
    const handleMessage = (event) => {
      if (event.data?.type === "PAGEMATIC_VOICE_TRANSCRIPT") {
        handleVoiceText(event.data.text);
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("message", handleMessage);
    };
  }, [setPromptText]);

  // Open the dedicated top-level voice dictation popup window
  const openVoicePopup = () => {
    if (typeof window === "undefined") return;

    const width = 480;
    const height = 440;
    const left = Math.max(0, Math.round(window.screen.width / 2 - width / 2));
    const top = Math.max(0, Math.round(window.screen.height / 2 - height / 2));

    const popup = window.open(
      "/voice-dictate",
      "pagematic_voice_dictate",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`
    );

    if (popup && popup.focus) {
      popup.focus();
    }
  };

  // 1. Single Product Picker (PRODUCT / LANDING)
  const handleOpenSingleProductPicker = async () => {
    if (typeof window !== "undefined" && window.shopify && window.shopify.resourcePicker) {
      try {
        const selected = await window.shopify.resourcePicker({
          type: "product",
          action: "select",
          multiple: false,
        });

        if (selected && selected.length > 0) {
          const prod = selected[0];
          const galleryImages = (prod.images || []).map((img) => img.originalSrc || img.src).filter(Boolean);
          const variants = (prod.variants || []).map((v) => ({
            id: v.id,
            title: v.title,
            price: v.price,
          }));

          setSelectedProduct({
            id: prod.id,
            title: prod.title,
            handle: prod.handle || "",
            description: prod.description || prod.descriptionHtml || "",
            vendor: prod.vendor || "",
            imageUrl: galleryImages[0] || prod.images?.[0]?.originalSrc || "",
            galleryImages: galleryImages.length > 0 ? galleryImages : [],
            price: variants[0]?.price ? `$${variants[0].price}` : "$49.00",
            variants,
            primaryVariantId: variants[0]?.id || prod.id,
          });
          return;
        }
      } catch (err) {
        console.warn("Shopify resourcePicker single-select warning:", err);
      }
    }
  };

  // 2. Multi-Product Picker (HOME)
  const handleOpenMultiProductPicker = async () => {
    if (typeof window !== "undefined" && window.shopify && window.shopify.resourcePicker) {
      try {
        const selected = await window.shopify.resourcePicker({
          type: "product",
          action: "select",
          multiple: true,
        });

        if (selected && selected.length > 0) {
          const formatted = selected.map((prod) => {
            const galleryImages = (prod.images || []).map((img) => img.originalSrc || img.src).filter(Boolean);
            const variants = (prod.variants || []).map((v) => ({
              id: v.id,
              title: v.title,
              price: v.price,
            }));
            return {
              id: prod.id,
              title: prod.title,
              handle: prod.handle || "",
              description: prod.description || "",
              imageUrl: galleryImages[0] || prod.images?.[0]?.originalSrc || "",
              galleryImages,
              price: variants[0]?.price ? `$${variants[0].price}` : "$49.00",
              variants,
              primaryVariantId: variants[0]?.id || prod.id,
            };
          });

          if (setSelectedProducts) setSelectedProducts(formatted);
          if (setSelectedCollection) setSelectedCollection(null); // Clear conflicting collection
          return;
        }
      } catch (err) {
        console.warn("Shopify resourcePicker multi-select warning:", err);
      }
    }
  };

  // 3. Collection Picker (HOME alternative)
  const handleOpenCollectionPicker = async () => {
    if (typeof window !== "undefined" && window.shopify && window.shopify.resourcePicker) {
      try {
        const selected = await window.shopify.resourcePicker({
          type: "collection",
          action: "select",
          multiple: false,
        });

        if (selected && selected.length > 0) {
          const col = selected[0];
          const matchingCol = (collections || []).find(
            (c) => c.id === col.id || c.handle === col.handle || c.title?.toLowerCase() === col.title?.toLowerCase()
          );
          const colProducts = matchingCol?.products || [];
          const coverImage = col.image?.originalSrc || col.image?.src || matchingCol?.imageUrl || colProducts[0]?.imageUrl || "";

          if (setSelectedCollection) {
            setSelectedCollection({
              id: col.id,
              title: col.title,
              handle: col.handle || "",
              imageUrl: coverImage,
              products: colProducts,
            });
          }
          if (setSelectedProducts) setSelectedProducts([]); // Clear conflicting products
          return;
        }
      } catch (err) {
        console.warn("Shopify collection picker warning:", err);
      }
    }
  };

  // Remove Handlers
  const handleRemoveProduct = (productId) => {
    if (!setSelectedProducts) return;
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleRemoveCollection = () => {
    if (setSelectedCollection) setSelectedCollection(null);
  };

  const handleRemoveSingleProduct = () => {
    if (setSelectedProduct) setSelectedProduct(null);
  };

  // Toggle Policy Selection for FAQ
  const togglePolicy = (policy) => {
    if (!setSelectedPolicies) return;
    setSelectedPolicies((prev) => {
      const exists = prev.find((p) => p.type === policy.type);
      if (exists) {
        return prev.filter((p) => p.type !== policy.type);
      } else {
        return [...prev, policy];
      }
    });
  };

  return (
    <div className="pm-prompt-form-container">
      {/* Title Row with Title on Left and Token Badge on Right */}
      <div className="pm-wizard-title-row">
        <h1 className="pm-wizard-title">Tell AI what to create</h1>
        <TokenBadge shopSettings={shopSettings} />
      </div>

      <p className="pm-wizard-subtitle">
        {pageType === "PRODUCT" && "Select a featured product to automatically pull high-resolution photos, pricing, variants, and copy."}
        {pageType === "LANDING" && "Select an anchor product to center your paid ad campaign, problem/solution narrative, and comparison around."}
        {pageType === "HOME" && "Select catalog products or a collection to spotlight on your brand's official homepage."}
        {pageType === "FAQ" && "AI will automatically query your store's legal policies (Shipping, Refund, Terms) to construct accurate, compliant answers."}
      </p>

      {/* 1. DYNAMIC INGESTION AREA: PRODUCT PAGE (Single Product Anchor) */}
      {pageType === "PRODUCT" && (
        <div className="pm-ingestion-card">
          <div className="pm-ingestion-info">
            <div className="pm-ingestion-icon-wrapper">
              <Package size={22} />
            </div>
            <div>
              <h4 className="pm-ingestion-text-title">
                {selectedProduct ? `Selected: ${selectedProduct.title}` : "Sync Featured Product from Your Store"}
              </h4>
              <p className="pm-ingestion-text-sub">
                {selectedProduct
                  ? `Price: ${selectedProduct.price} • ${(selectedProduct.galleryImages || []).length || 1} Photos & Variants Synced`
                  : "Pulls product title, price, variants, and full gallery CDN URLs directly into the split-hero & buy bar."}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className="pm-btn-ingest"
              onClick={handleOpenSingleProductPicker}
            >
              {selectedProduct ? "Change Product" : "Select Product ↗"}
            </button>
            {selectedProduct && (
              <button
                type="button"
                onClick={handleRemoveSingleProduct}
                style={{
                  background: "none",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#DC2626",
                  cursor: "pointer",
                }}
                title="Remove selected product"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. DYNAMIC INGESTION AREA: LANDING PAGE (Single Campaign Anchor Product) */}
      {pageType === "LANDING" && (
        <div className="pm-ingestion-card">
          <div className="pm-ingestion-info">
            <div className="pm-ingestion-icon-wrapper" style={{ background: "#F5F3FF", color: "#7C3AED" }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="pm-ingestion-text-title">
                {selectedProduct ? `Campaign Anchor: ${selectedProduct.title}` : "Select Campaign Anchor Product"}
              </h4>
              <p className="pm-ingestion-text-sub">
                {selectedProduct
                  ? `Price: ${selectedProduct.price} • Anchor product specs and comparison matrix mapped`
                  : "Acts as the primary conversion anchor for ad traffic, discount offers, and the comparison table."}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className="pm-btn-ingest"
              onClick={handleOpenSingleProductPicker}
            >
              {selectedProduct ? "Change Anchor" : "Select Product ↗"}
            </button>
            {selectedProduct && (
              <button
                type="button"
                onClick={handleRemoveSingleProduct}
                style={{
                  background: "none",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#DC2626",
                  cursor: "pointer",
                }}
                title="Remove anchor product"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. DYNAMIC INGESTION AREA: HOME PAGE (Multi-Product 4-8 Items or Collection) */}
      {pageType === "HOME" && (
        <div className="pm-ingestion-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "14px" }}>
          <div className="pm-ingestion-info" style={{ width: "100%", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div className="pm-ingestion-icon-wrapper" style={{ background: "#ECFDF5", color: "#059669" }}>
                <ShoppingBag size={22} />
              </div>
              <div>
                <h4 className="pm-ingestion-text-title">
                  {selectedCollection
                    ? `Featured Collection: ${selectedCollection.title}`
                    : selectedProducts && selectedProducts.length > 0
                    ? `${selectedProducts.length} Featured Catalog Products Selected`
                    : "Select Catalog Products or Collection for Homepage"}
                </h4>
                <p className="pm-ingestion-text-sub">
                  Pops real titles, CDN images, handles, and prices directly into the 4-item featured grid & collection list.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button
                type="button"
                className="pm-btn-ingest"
                onClick={handleOpenMultiProductPicker}
                style={selectedProducts && selectedProducts.length > 0 ? { background: "#0052FF", color: "#FFFFFF", borderColor: "#0052FF" } : {}}
              >
                {selectedProducts && selectedProducts.length > 0 ? "Change Products (4-8)" : "Pick Products ↗"}
              </button>
              <button
                type="button"
                className="pm-btn-ingest"
                style={selectedCollection ? { background: "#0052FF", color: "#FFFFFF", borderColor: "#0052FF" } : { background: "#F1F5F9", color: "#334155", borderColor: "#CBD5E1" }}
                onClick={handleOpenCollectionPicker}
              >
                {selectedCollection ? "Change Collection" : "Pick Collection"}
              </button>
            </div>
          </div>

          {/* 1. If Collection is Selected, Show Collection Preview Card */}
          {selectedCollection && (
            <div
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: "10px",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {selectedCollection.imageUrl ? (
                  <img
                    src={selectedCollection.imageUrl}
                    alt={selectedCollection.title}
                    style={{
                      width: "44px",
                      height: "44px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      background: "#FFFFFF",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "8px",
                      background: "#E0F2FE",
                      color: "#0284C7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #BAE6FD",
                    }}
                  >
                    <Layers size={20} />
                  </div>
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A" }}>
                      {selectedCollection.title}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "#ECFDF5",
                        color: "#059669",
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      Active Homepage Collection
                    </span>
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B" }}>
                    Path: <code style={{ background: "#EEF2F6", padding: "1px 5px", borderRadius: "4px" }}>/collections/{selectedCollection.handle || "all"}</code>
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleRemoveCollection}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#DC2626",
                    cursor: "pointer",
                  }}
                  title="Remove collection"
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          )}

          {/* 2. If Products are Selected, Render Individual Product Chips */}
          {selectedProducts && selectedProducts.length > 0 && (
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748B" }}>
                  {selectedProducts.length} Products Selected for Grid:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProducts && setSelectedProducts([])}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#EF4444",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Clear all
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", width: "100%" }}>
                {selectedProducts.map((p, idx) => (
                  <span
                    key={p.id || idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#FFFFFF",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "8px",
                      padding: "4px 8px 4px 6px",
                      fontSize: "12px",
                      color: "#1E293B",
                      fontWeight: "600",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    }}
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        style={{ width: "20px", height: "20px", borderRadius: "4px", objectFit: "cover" }}
                      />
                    ) : (
                      <Check size={12} color="#16A34A" />
                    )}
                    <span>{p.title}</span>
                    <span style={{ color: "#64748B", fontWeight: "500", fontSize: "11.5px" }}>({p.price || "USD"})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(p.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94A3B8",
                        cursor: "pointer",
                        padding: "0 2px",
                        fontSize: "13px",
                        lineHeight: 1,
                      }}
                      title="Remove product"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. DYNAMIC INGESTION AREA: FAQ PAGE (Automatic Policy Extraction) */}
      {pageType === "FAQ" && (
        <div className="pm-ingestion-card" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <div className="pm-ingestion-info" style={{ width: "100%", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div className="pm-ingestion-icon-wrapper" style={{ background: "#FDF2F8", color: "#DB2777" }}>
                <HelpCircle size={22} />
              </div>
              <div>
                <h4 className="pm-ingestion-text-title">Store Legal & Support Policies (Auto-Ingested)</h4>
                <p className="pm-ingestion-text-sub">
                  Direct synthesis from legal policy text. No catalog picker needed:
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {policies && policies.length > 0 ? (
              policies.map((p) => {
                const isSelected = selectedPolicies.some((sp) => sp.type === p.type);
                return (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => togglePolicy(p)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected ? "1.5px solid #0052FF" : "1px solid #CBD5E1",
                      background: isSelected ? "#EFF6FF" : "#FFFFFF",
                      color: isSelected ? "#0052FF" : "#475569",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {isSelected && <Check size={13} />} {p.type || p.title}
                  </button>
                );
              })
            ) : (
              <span style={{ fontSize: "12.5px", color: "#64748B" }}>
                Policies will be automatically synthesized from standard e-commerce best practices (30-day returns, fast worldwide shipping).
              </span>
            )}
          </div>
        </div>
      )}

      {/* Page Name Field */}
      <div className="pm-form-group">
        <label className="pm-form-label" htmlFor="pageTitleInput">
          Page name
        </label>
        <input
          id="pageTitleInput"
          type="text"
          className="pm-form-input"
          placeholder="e.g. Summer Collection Landing Page"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
        />
      </div>

      {/* Big Prompt Textarea with Voice Dictation */}
      <div className="pm-form-group">
        <label className="pm-form-label" htmlFor="promptInput">
          Custom instructions, tone & offers
        </label>
        <div className="pm-textarea-container">
          <textarea
            id="promptInput"
            className="pm-textarea"
            maxLength={2500}
            placeholder={
              pageType === "PRODUCT"
                ? "Example: Emphasize our all-mountain durability, racing-grade base, and include a 100% satisfaction guarantee. Highlight that it's designed for riders seeking precision carve."
                : pageType === "LANDING"
                ? "Example: Write a high-urgency campaign landing page with a limited-time 20% discount badge. Emphasize why our brand beats traditional competitors in durability and weight."
                : pageType === "HOME"
                ? "Example: Welcoming, editorial brand tone introducing our 2026 collection. Emphasize sustainable craftsmanship, community ethos, and newsletter discount."
                : "Example: Focus on resolving shipping delivery times, our 30-day exchange process, and how to contact customer support."
            }
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
          />

          <div className="pm-textarea-footer">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                className="pm-btn-voice"
                onClick={openVoicePopup}
                title="Open voice dictation window"
              >
                <Mic size={15} />
                <span>Use voice input</span>
              </button>

              {voiceSuccess && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#16A34A",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    animation: "fadeIn 0.2s ease-in-out",
                  }}
                >
                  {voiceSuccess}
                </span>
              )}
            </div>

            <span className="pm-char-count">{promptText.length}/2500</span>
          </div>
        </div>
      </div>

      {/* Niche Dropdown Selector */}
      <div className="pm-form-group">
        <label className="pm-form-label" htmlFor="nicheSelect">
          Your niche
        </label>
        <div className="pm-select-wrapper">
          <select
            id="nicheSelect"
            className="pm-form-select"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          >
            <option value="">Select or type your niche</option>
            <option value="Snowboarding & Outdoor Sports">Snowboarding & Outdoor Sports</option>
            <option value="Fashion & Apparel">Fashion & Apparel</option>
            <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
            <option value="Health & Wellness">Health & Wellness</option>
            <option value="Electronics & Gadgets">Electronics & Gadgets</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Jewelry & Accessories">Jewelry & Accessories</option>
            <option value="Fitness & Sports">Fitness & Sports</option>
            <option value="Food & Beverages">Food & Beverages</option>
            <option value="Pet Supplies">Pet Supplies</option>
            <option value="General E-commerce">General E-commerce</option>
          </select>
          <ChevronDown size={18} className="pm-select-chevron" />
        </div>
      </div>

      {/* Credit Warning if Insufficient */}
      {!hasSufficientCredits && (
        <div className="pm-credits-alert">
          <AlertCircle size={20} />
          <span>
            You currently have {shopSettings?.pageCredits || 0} credits. You need at least 5 credits to generate a new page.
          </span>
        </div>
      )}
    </div>
  );
}
