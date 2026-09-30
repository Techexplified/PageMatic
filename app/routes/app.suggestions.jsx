import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, data, Link } from "react-router";
import {
  Lightbulb,
  CheckCircle2,
  ArrowLeft,
  PlusCircle,
  Send,
  Loader2,
} from "lucide-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { embedRedirect } from "../utils/shopify-embed-nav.server.js";
import "../styles/suggestions.css";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  let shopSettings = await db.shopSettings.findUnique({
    where: { shop },
  });

  if (!shopSettings) {
    shopSettings = await db.shopSettings.create({
      data: { shop },
    });
  }

  // Route Guard: If merchant has not completed onboarding, force redirection to onboarding flow
  if (!shopSettings.isOnboarded) {
    throw embedRedirect("/app/onboarding", request);
  }

  // Fetch store email from Shopify Admin GraphQL
  let defaultEmail = "";
  try {
    const response = await admin.graphql(`
      #graphql
      query getShopContactEmail {
        shop {
          email
          contactEmail
        }
      }
    `);
    const resJson = await response.json();
    defaultEmail =
      resJson.data?.shop?.contactEmail || resJson.data?.shop?.email || "";
  } catch (err) {
    console.error("Failed to query shop email from GraphQL:", err);
  }

  return data({ shopSettings, defaultEmail });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent");

  const shopSettings = await db.shopSettings.findUnique({
    where: { shop },
  });

  if (!shopSettings) {
    return data({ error: "Shop settings not found" }, { status: 404 });
  }

  if (intent === "submit_suggestion") {
    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const email = formData.get("email")?.toString().trim() || null;

    if (!title || !description) {
      return data(
        { error: "Please provide both a feature name and description." },
        { status: 400 },
      );
    }

    try {
      await db.suggestion.create({
        data: {
          shopId: shopSettings.id,
          title,
          description,
          email,
        },
      });

      return data({ success: true });
    } catch (err) {
      console.error("Failed to save suggestion:", err);
      return data(
        { error: "Failed to submit suggestion. Please try again." },
        { status: 500 },
      );
    }
  }

  return data({ error: "Invalid action intent" }, { status: 400 });
};

export default function SuggestionsRoute() {
  const { defaultEmail } = useLoaderData();
  const fetcher = useFetcher();
  const [submitted, setSubmitted] = useState(false);

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?.success) {
      setSubmitted(true);
    }
  }, [fetcher.data]);

  return (
    <div className="pm-sugg-page">
      <div className="pm-sugg-container">
        {submitted ? (
          /* Success State Card */
          <div className="pm-sugg-success-card">
            <div className="pm-sugg-success-icon-wrap">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="pm-sugg-success-title">Suggestion received!</h2>
            <p className="pm-sugg-success-desc">
              Thank you for your feedback! We review merchant suggestions regularly
              to design new features and templates for future updates.
            </p>
            <div className="pm-sugg-success-actions">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="pm-sugg-btn-primary"
              >
                <PlusCircle size={16} />
                <span>Submit another suggestion</span>
              </button>
              <Link to="/app/dashboard" className="pm-sugg-btn-outline">
                <ArrowLeft size={16} />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className="pm-sugg-card">
            {/* Header */}
            <div className="pm-sugg-header">
              <div className="pm-sugg-title-row">
                <div className="pm-sugg-badge-icon">
                  <Lightbulb size={20} />
                </div>
                <h1 className="pm-sugg-title">Suggest a feature</h1>
              </div>
              <p className="pm-sugg-subtitle">
                Don&apos;t see something you need? Tell us what you&apos;d want PageMatic
                to support, and we&apos;ll consider it for a future update.
              </p>
            </div>

            {/* Error banner if any */}
            {fetcher.data?.error && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  marginBottom: "20px",
                  fontWeight: "500",
                }}
              >
                {fetcher.data.error}
              </div>
            )}

            {/* Form */}
            <fetcher.Form method="post" className="pm-sugg-form">
              <input
                type="hidden"
                name="intent"
                value="submit_suggestion"
              />

              {/* 1. Feature Title */}
              <div className="pm-sugg-field">
                <label htmlFor="sugg-title" className="pm-sugg-label">
                  What should we call this feature?
                </label>
                <input
                  id="sugg-title"
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Product comparison table slider"
                  className="pm-sugg-input"
                />
              </div>

              {/* 2. Problem / Description */}
              <div className="pm-sugg-field">
                <label htmlFor="sugg-desc" className="pm-sugg-label">
                  What problem would this solve for you?
                </label>
                <textarea
                  id="sugg-desc"
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe what you want to achieve and how it helps your store..."
                  className="pm-sugg-textarea"
                />
              </div>

              {/* 3. Email (Prefilled with Shopify store email) */}
              <div className="pm-sugg-field">
                <label htmlFor="sugg-email" className="pm-sugg-label">
                  Email (optional)
                </label>
                <span className="pm-sugg-helper">
                  We&apos;ll let you know if we build this.
                </span>
                <input
                  id="sugg-email"
                  type="email"
                  name="email"
                  defaultValue={defaultEmail}
                  placeholder="e.g. store@example.com"
                  className="pm-sugg-input"
                />
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="pm-sugg-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="pm-spin" />
                    <span>Submitting suggestion...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit suggestion</span>
                  </>
                )}
              </button>
            </fetcher.Form>
          </div>
        )}
      </div>
    </div>
  );
}
