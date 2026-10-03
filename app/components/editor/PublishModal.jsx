import { useState, useEffect } from "react";
import {
  X,
  UploadCloud,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  EyeOff,
  RefreshCw,
} from "lucide-react";

export default function PublishModal({
  isOpen,
  onClose,
  page,
  shop,
  onConfirmPublish,
  onConfirmUnpublish,
  isPublishing,
  isUnpublishing,
  publishResult,
}) {
  const [copied, setCopied] = useState(false);
  const [confirmingUnpublish, setConfirmingUnpublish] = useState(false);
  const [justUnpublished, setJustUnpublished] = useState(false);
  const [customHandle, setCustomHandle] = useState(page?.handle || "my-page");

  useEffect(() => {
    if (page?.handle) {
      setCustomHandle(page.handle);
    }
  }, [page?.handle]);

  useEffect(() => {
    if (isUnpublishing) {
      setJustUnpublished(true);
    }
  }, [isUnpublishing]);

  if (!isOpen) return null;

  const handleClose = () => {
    setConfirmingUnpublish(false);
    setJustUnpublished(false);
    if (onClose) onClose();
  };

  const isAlreadyPublished = page?.status === "PUBLISHED";
  const cleanShop = (shop || "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const activeHandle = (customHandle || page?.handle || "my-page")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "my-page";
  const storefrontUrl =
    publishResult?.storefrontUrl || `https://${cleanShop}/pages/${activeHandle}`;

  const isBusy = isPublishing || isUnpublishing;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(storefrontUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUnpublishClick = () => {
    if (!confirmingUnpublish) {
      setConfirmingUnpublish(true);
    } else {
      setJustUnpublished(true);
      if (onConfirmUnpublish) onConfirmUnpublish();
      setConfirmingUnpublish(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "pmModalFadeIn 0.2s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBusy) handleClose();
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.2)",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: isAlreadyPublished ? "#DCFCE7" : "#EFF6FF",
                color: isAlreadyPublished ? "#16A34A" : "#0052FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isAlreadyPublished ? <Globe size={18} /> : <UploadCloud size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0B192C" }}>
                {isAlreadyPublished ? "Manage Live Storefront Page" : "Publish to Storefront"}
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                {isAlreadyPublished
                  ? "Page is currently active on your Shopify store."
                  : "Deliver this page directly to your live Shopify store."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              cursor: isBusy ? "not-allowed" : "pointer",
              padding: "6px",
              borderRadius: "8px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          {justUnpublished && publishResult?.actionType === "UNPUBLISH" && publishResult?.success ? (
            /* UNPUBLISHED SUCCESS STATE */
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", textAlign: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#FEF3C7",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <EyeOff size={30} />
              </div>

              <div>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: 700, color: "#0F172A" }}>
                  Page Unpublished (Reverted to Draft)
                </h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#64748B" }}>
                  This page has been hidden from your public storefront. All your content remains safely saved in PageMatic.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#0052FF",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Done
              </button>
            </div>
          ) : (
            /* MAIN VERIFICATION & ACTION STATE */
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {publishResult?.error && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    padding: "12px 14px",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: "10px",
                    color: "#DC2626",
                    fontSize: "13.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <AlertCircle size={17} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontWeight: 600 }}>{publishResult.error}</span>
                  </div>
                  {publishResult.error.toLowerCase().includes("handle") && (
                    <div style={{ paddingLeft: "27px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          const base = customHandle.replace(/-\d+$/, "");
                          const nextHandle = `${base}-${Math.floor(100 + Math.random() * 900)}`;
                          setCustomHandle(nextHandle);
                        }}
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #F87171",
                          color: "#B91C1C",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ⚡ Auto-assign unique handle
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Destination URL & Status Box with Editable Handle */}
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.5px" }}>
                    Storefront URL & Slug
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: isAlreadyPublished ? "#DCFCE7" : "#FEF3C7",
                      color: isAlreadyPublished ? "#15803D" : "#92400E",
                      border: isAlreadyPublished ? "1px solid #BBF7D0" : "1px solid #FDE68A",
                    }}
                  >
                    {isAlreadyPublished ? "PUBLISHED (LIVE)" : "DRAFT (UNPUBLISHED)"}
                  </span>
                </div>

                {/* Editable URL Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#FFFFFF",
                      border: "1.5px solid #CBD5E1",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      gap: "6px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Globe size={15} color="#0052FF" style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: "13px",
                        fontFamily: "monospace",
                        color: "#64748B",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                      }}
                    >
                      https://{cleanShop}/pages/
                    </span>
                    <input
                      type="text"
                      value={customHandle}
                      onChange={(e) => {
                        const formatted = e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-_]/g, "");
                        setCustomHandle(formatted);
                      }}
                      placeholder="page-handle"
                      title="Edit URL handle slug"
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: "13.5px",
                        color: "#0F172A",
                        padding: 0,
                        minWidth: "60px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      title="Copy complete storefront URL"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "#F1F5F9",
                        border: "1px solid #CBD5E1",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#334155",
                        cursor: "pointer",
                        flexShrink: 0,
                        marginLeft: "auto",
                      }}
                    >
                      {copied ? (
                        <>
                          <Check size={12} color="#16A34A" />
                          <span style={{ color: "#16A34A" }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <span style={{ fontSize: "11.5px", color: "#64748B", padding: "0 2px" }}>
                    You can edit and customize this URL handle slug before publishing.
                  </span>
                </div>
              </div>

              {/* Checklist details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <Check size={15} color="#16A34A" />
                  <span>Mapped to <strong>/pages/{activeHandle}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <Check size={15} color="#16A34A" />
                  <span>Zero Theme Overwrite: Preserves active theme templates</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <Check size={15} color="#16A34A" />
                  <span>Full SEO pre-rendering with live JSON AST Metafield backup</span>
                </div>
              </div>

              {/* Action Buttons */}
              {isAlreadyPublished ? (
                /* PUBLISHED STATE CONTROLS */
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <a
                      href={storefrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        background: "#F8FAFC",
                        color: "#0F172A",
                        border: "1px solid #CBD5E1",
                        borderRadius: "10px",
                        padding: "11px",
                        fontWeight: 600,
                        fontSize: "13.5px",
                        textDecoration: "none",
                      }}
                    >
                      <span>View Live Page</span>
                      <ExternalLink size={14} />
                    </a>

                    <button
                      type="button"
                      onClick={() => onConfirmPublish && onConfirmPublish(activeHandle)}
                      disabled={isBusy}
                      style={{
                        flex: 1.3,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        background: "#0052FF",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "10px",
                        padding: "11px",
                        fontWeight: 700,
                        fontSize: "13.5px",
                        cursor: isBusy ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 12px rgba(0, 82, 255, 0.2)",
                      }}
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 size={15} className="pm-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={14} />
                          <span>Update Live Page</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Unpublish Button */}
                  <button
                    type="button"
                    onClick={handleUnpublishClick}
                    disabled={isBusy}
                    style={{
                      width: "100%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px",
                      borderRadius: "10px",
                      border: confirmingUnpublish ? "1.5px solid #EF4444" : "1px solid #E2E8F0",
                      background: confirmingUnpublish ? "#FEF2F2" : "#FFFFFF",
                      color: confirmingUnpublish ? "#DC2626" : "#64748B",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: isBusy ? "not-allowed" : "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isUnpublishing ? (
                      <>
                        <Loader2 size={14} className="pm-spin" />
                        <span>Unpublishing...</span>
                      </>
                    ) : confirmingUnpublish ? (
                      <>
                        <EyeOff size={14} />
                        <span>Confirm Unpublish (Hide from Storefront)?</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} />
                        <span>Unpublish (Revert to Draft)</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* DRAFT STATE CONTROLS */
                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isBusy}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      color: "#475569",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: isBusy ? "not-allowed" : "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => onConfirmPublish && onConfirmPublish(activeHandle)}
                    disabled={isBusy}
                    style={{
                      flex: 2,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px",
                      borderRadius: "10px",
                      background: "#0052FF",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "14px",
                      border: "none",
                      cursor: isBusy ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(0, 82, 255, 0.25)",
                    }}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 size={16} className="pm-spin" />
                        <span>Publishing to Shopify...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} />
                        <span>Publish Page Now</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
