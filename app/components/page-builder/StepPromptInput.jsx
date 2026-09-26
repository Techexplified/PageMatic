import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Package,
  HelpCircle,
  Check,
  ChevronDown,
  AlertCircle,
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
  selectedPolicies,
  setSelectedPolicies,
  products = [],
  policies = [],
  hasSufficientCredits,
  shopSettings,
  onBack,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Setup Web Speech API on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setPromptText((prev) => {
              const cleaned = prev ? `${prev.trim()} ${currentTranscript}` : currentTranscript;
              return cleaned.slice(0, 2500);
            });
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [setPromptText]);

  // Toggle voice dictation
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Could not start speech recognition:", err);
      }
    }
  };

  // Shopify App Bridge Native Resource Picker with fallback
  const handleOpenProductPicker = async () => {
    if (typeof window !== "undefined" && window.shopify && window.shopify.resourcePicker) {
      const selected = await window.shopify.resourcePicker({
        type: "product",
        action: "select",
        multiple: false,
      });

      if (selected && selected.length > 0) {
        const prod = selected[0];
        setSelectedProduct({
          id: prod.id,
          title: prod.title,
          description: prod.description || prod.descriptionHtml || "",
          imageUrl: prod.images?.[0]?.originalSrc || "",
          price: prod.variants?.[0]?.price || "",
        });
      }
    } else if (products && products.length > 0) {
      // Fallback: pick first recent product
      const first = products[0];
      setSelectedProduct({
        id: first.id,
        title: first.title,
        description: first.description || "",
        imageUrl: first.featuredImage?.url || "",
        price: first.priceRangeV2?.minVariantPrice?.amount || "",
      });
    }
  };

  // Toggle Policy Selection
  const togglePolicy = (policy) => {
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
        Describe the page you want to create or add custom instructions for the AI. The more details you provide, the better the result.
      </p>

      {/* 1. DYNAMIC INGESTION AREA: Product Page Context */}
      {pageType === "PRODUCT" && (
        <div className="pm-ingestion-card">
          <div className="pm-ingestion-info">
            <div className="pm-ingestion-icon-wrapper">
              <Package size={22} />
            </div>
            <div>
              <h4 className="pm-ingestion-text-title">
                {selectedProduct ? `Selected: ${selectedProduct.title}` : "Sync Product from Your Store"}
              </h4>
              <p className="pm-ingestion-text-sub">
                {selectedProduct
                  ? `Price: $${selectedProduct.price} • Description & photos synced`
                  : "Pick a product to pull its title, price, photos, and specs directly into the page."}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="pm-btn-ingest"
            onClick={handleOpenProductPicker}
          >
            {selectedProduct ? "Change Product" : "Select Product ↗"}
          </button>
        </div>
      )}

      {/* 2. DYNAMIC INGESTION AREA: FAQ Store Policies */}
      {pageType === "FAQ" && (
        <div className="pm-ingestion-card" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <div className="pm-ingestion-info" style={{ width: "100%", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div className="pm-ingestion-icon-wrapper">
                <HelpCircle size={22} />
              </div>
              <div>
                <h4 className="pm-ingestion-text-title">Store Legal & Support Policies Detected</h4>
                <p className="pm-ingestion-text-sub">
                  Select which policies to include so AI writes exact, compliant answers:
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
                    {isSelected && <Check size={13} />} {p.type}
                  </button>
                );
              })
            ) : (
              <span style={{ fontSize: "12.5px", color: "#64748B" }}>
                No store policies found. You can write your custom FAQ details below.
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
          Custom instructions & directions
        </label>
        <div className="pm-textarea-container">
          <textarea
            id="promptInput"
            className="pm-textarea"
            maxLength={2500}
            placeholder={`Example: Focus on our organic ingredients and eco-friendly packaging. Include a special 20% discount offer banner, emphasize customer reviews, and use a friendly, energetic tone.`}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
          />

          <div className="pm-textarea-footer">
            <button
              type="button"
              className={`pm-btn-voice ${isRecording ? "pm-btn-voice--recording" : ""}`}
              onClick={toggleVoiceInput}
              title="Click to dictate your prompt"
            >
              {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
              <span>{isRecording ? "Listening... (Click to stop)" : "Use voice input"}</span>
            </button>

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
