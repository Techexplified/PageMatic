import { useState, useEffect } from "react";
import { useFetcher, redirect, data, useLoaderData } from "react-router";
import { ArrowRight, CheckCircle2, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import db from "../db.server";
import { authenticate } from "../shopify.server";
import { isAppEmbedEnabled } from "../libs/embed-check.server";
import PagematicLogoSvg from "../components/PagematicLogoSvg";
import "../styles/onboarding.css";

export async function loader({ request }) {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  let [shopRecord, isEmbedded] = await Promise.all([
    db.shopSettings.findUnique({ where: { shop } }),
    isAppEmbedEnabled(admin, "pagematic"),
  ]);

  if (!shopRecord) {
    shopRecord = await db.shopSettings.create({
      data: { shop },
    });
  }

    // Removed redirect to allow repeated testing
    // if (shopRecord.isOnboarded) {
    //     return redirect("/app");
    // }

  // deep linking
  const themeEditorUrl = `https://${shop}/admin/themes/current/editor?context=apps`;

  return data({
    shopRecord,
    isEmbedded: Boolean(isEmbedded),
    themeEditorUrl,
  });
}

export async function action({ request }) {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "check_embed") {
    const isEmbedded = await isAppEmbedEnabled(admin, "pagematic");
    return data({ isEmbedded: Boolean(isEmbedded) });
  }

  if (intent === "save" || intent === "complete_onboarding") {
    try {
      const isEmbedded = await isAppEmbedEnabled(admin, "pagematic");
      if (!isEmbedded) {
        return data(
          { error: "Please enable the PageMatic Theme Extension before proceeding." },
          { status: 400 }
        );
      }

      await db.shopSettings.upsert({
        where: { shop },
        update: { isOnboarded: true },
        create: { shop, isOnboarded: true },
      });

      return redirect("/app");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      return data({ error: "Failed to save onboarding status." }, { status: 500 });
    }
  }

  return data({ error: "Invalid intent" }, { status: 400 });
}

export default function Onboarding() {
  const { isEmbedded: initialEmbedded, themeEditorUrl } = useLoaderData();
  const checkFetcher = useFetcher();
  const saveFetcher = useFetcher();

  // Derive real-time embed status from fetcher updates or initial loader data
  const isEmbedded =
    checkFetcher.data?.isEmbedded !== undefined
      ? Boolean(checkFetcher.data.isEmbedded)
      : Boolean(initialEmbedded);

  const isChecking = checkFetcher.state !== "idle";
  const isSaving = saveFetcher.state !== "idle";

  // Re-check embed status automatically whenever the merchant returns to this browser tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkFetcher.submit({ intent: "check_embed" }, { method: "post" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkFetcher]);

  const handleManualRefresh = () => {
    checkFetcher.submit({ intent: "check_embed" }, { method: "post" });
  };

  const handleSave = () => {
    if (!isEmbedded || isSaving) return;
    saveFetcher.submit({ intent: "save" }, { method: "post" });
  };

  return (
    <div className="pm-onboarding-wrapper">
      {/* 1. Top-Left Concentric Curved Arcs */}
      <div className="pm-corner-decor pm-corner-decor--top-left">
        <div className="pm-ring pm-ring-tl-1" />
        <div className="pm-ring pm-ring-tl-2" />
        <div className="pm-ring pm-ring-tl-3" />
        <div className="pm-ring pm-ring-tl-4" />
      </div>

      {/* 2. Bottom-Right Concentric Curved Arcs */}
      <div className="pm-corner-decor pm-corner-decor--bottom-right">
        <div className="pm-ring pm-ring-br-1" />
        <div className="pm-ring pm-ring-br-2" />
        <div className="pm-ring pm-ring-br-3" />
        <div className="pm-ring pm-ring-br-4" />
      </div>

      <div className="pm-onboarding-container">
        {/* 3D Window & Cursor Vector Illustration */}
        <div className="pm-logo-wrapper">
          <PagematicLogoSvg className="pm-logo-svg" />
        </div>

        {/* Heading & Subtitle */}
        <h1 className="pm-title">PageMatic – AI Page Builder</h1>
        <p className="pm-subtitle">
          Turn your ideas into high-converting Shopify pages in seconds.
        </p>

        {/* Extension Enable Card */}
        <div className={`pm-embed-card ${isEmbedded ? "pm-embed-card--active" : ""}`}>
          <div className="pm-embed-info">
            <h3 className="pm-embed-title">Enable PageMatic Theme Extension</h3>
            <p className="pm-embed-desc">
              Enable this extension for PageMatic to work on your store.
            </p>
          </div>

          <div className="pm-embed-action">
            {isEmbedded ? (
              <span className="pm-badge-embedded">
                <CheckCircle2 size={15} />
                Embedded
              </span>
            ) : (
              <a
                href={themeEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pm-btn-theme-editor"
              >
                Enable in Theme Editor
                <ExternalLink size={14} />
              </a>
            )}

            {/* Manual re-check button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              className="pm-recheck-btn"
              title="Check extension status"
              disabled={isChecking}
            >
              <RefreshCw
                size={16}
                className={isChecking ? "pm-spinner" : ""}
              />
            </button>
          </div>
        </div>

        {/* Error message display if any */}
        {saveFetcher.data?.error && (
          <p style={{ color: "#EF4444", fontSize: "14px", marginBottom: "16px" }}>
            {saveFetcher.data.error}
          </p>
        )}

        {/* Action Button: Get Started */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!isEmbedded || isSaving}
          className="pm-btn-get-started"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="pm-spinner" />
              Getting Started...
            </>
          ) : (
            <>
              Get started
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {!isEmbedded && (
          <p className="pm-hint-text">
            Enable the theme extension in your Shopify theme editor to continue.
          </p>
        )}
      </div>
    </div>
  );
}