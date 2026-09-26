import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, data } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { generateAndPersistPage } from "../services/page-generator.server";

// Modular Page Builder Components
import StepPageType from "../components/page-builder/StepPageType";
import StepPageStyle from "../components/page-builder/StepPageStyle";
import StepPromptInput from "../components/page-builder/StepPromptInput";
import StepGenerating from "../components/page-builder/StepGenerating";
import WizardFooter from "../components/page-builder/WizardFooter";
import "../styles/page-builder.css";

// ============================================================================
// LOADER (Parallelized DB + Shopify Admin GraphQL via Promise.all)
// ============================================================================
export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // GraphQL query for shop context, policies, recent products, and collections
  const storeContextQuery = `#graphql
    query GetStoreContext {
      shop {
        name
        myshopifyDomain
        currencyCode
        description
        refundPolicy {
          title
          body
          url
        }
        privacyPolicy {
          title
          body
          url
        }
        termsOfService {
          title
          body
          url
        }
        shippingPolicy {
          title
          body
          url
        }
      }
      products(first: 10, sortKey: UPDATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            description
            featuredImage {
              url
              altText
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
      collections(first: 8) {
        edges {
          node {
            id
            title
            handle
            productsCount {
              count
            }
          }
        }
      }
    }
  `;

  // Run DB query and Shopify Admin API in parallel
  const [shopSettingsResult, shopifyGqlResult] = await Promise.all([
    db.shopSettings.findUnique({
      where: { shop },
    }),
    admin.graphql(storeContextQuery).catch((err) => {
      console.error("GraphQL store context fetch error:", err);
      return null;
    }),
  ]);

  let shopSettings = shopSettingsResult;
  if (!shopSettings) {
    shopSettings = await db.shopSettings.create({
      data: { shop },
    });
  }

  let shopData = null;
  let products = [];
  let collections = [];
  let policies = [];

  if (shopifyGqlResult) {
    try {
      const gqlJson = await shopifyGqlResult.json();
      if (gqlJson?.data?.shop) {
        shopData = gqlJson.data.shop;
        if (shopData.refundPolicy?.body) policies.push({ type: "Refund Policy", key: "refundPolicy", ...shopData.refundPolicy });
        if (shopData.shippingPolicy?.body) policies.push({ type: "Shipping Policy", key: "shippingPolicy", ...shopData.shippingPolicy });
        if (shopData.privacyPolicy?.body) policies.push({ type: "Privacy Policy", key: "privacyPolicy", ...shopData.privacyPolicy });
        if (shopData.termsOfService?.body) policies.push({ type: "Terms of Service", key: "termsOfService", ...shopData.termsOfService });
      }
      if (gqlJson?.data?.products?.edges) {
        products = gqlJson.data.products.edges.map((e) => e.node);
      }
      if (gqlJson?.data?.collections?.edges) {
        collections = gqlJson.data.collections.edges.map((e) => e.node);
      }
    } catch (e) {
      console.error("Error parsing GraphQL store response:", e);
    }
  }

  return data({
    shopSettings,
    shop: shopData,
    products,
    collections,
    policies,
  });
};

// ============================================================================
// ACTION (Triggers OpenRouter Page Generation & Prisma DRAFT Creation)
// ============================================================================
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const pageType = formData.get("pageType") || "LANDING";
  const pageStyle = formData.get("pageStyle") || "minimal";
  const pageTitle = formData.get("pageTitle") || "Untitled Page";
  const promptText = formData.get("promptText") || "";
  const niche = formData.get("niche") || "General E-commerce";
  const selectedProductStr = formData.get("selectedProduct");
  const selectedPoliciesStr = formData.get("selectedPolicies");
  const availablePoliciesStr = formData.get("availablePolicies");

  let selectedProduct = null;
  let selectedPolicies = [];
  let availablePolicies = [];

  try {
    if (selectedProductStr) selectedProduct = JSON.parse(selectedProductStr);
    if (selectedPoliciesStr) selectedPolicies = JSON.parse(selectedPoliciesStr);
    if (availablePoliciesStr) availablePolicies = JSON.parse(availablePoliciesStr);
  } catch (e) {
    console.warn("JSON parse warning in action:", e);
  }

  try {
    const result = await generateAndPersistPage({
      shop: session.shop,
      pageType,
      stylePreset: pageStyle.toLowerCase(),
      pageTitle,
      niche,
      promptText,
      selectedProduct,
      selectedPolicies,
      availablePolicies,
    });

    return data(result);
  } catch (err) {
    console.error("[Action Error] Page generation failed:", err);
    return data(
      {
        success: false,
        error: err.message || "Failed to generate page. Please try again.",
      },
      { status: 400 }
    );
  }
};

// ============================================================================
// PAGE BUILDER ORCHESTRATOR
// ============================================================================
export default function PageBuilder() {
  const { shopSettings, shop, products, collections, policies } = useLoaderData();
  const fetcher = useFetcher();

  // Step state: 1 (Type) -> 2 (Style) -> 3 (Prompt & Ingestion) -> 4 (Generating)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [pageType, setPageType] = useState("LANDING"); // LANDING | HOME | PRODUCT | FAQ
  const [pageStyle, setPageStyle] = useState("MINIMAL"); // MINIMAL | BOLD | PROFESSIONAL
  const [pageTitle, setPageTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [niche, setNiche] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPolicies, setSelectedPolicies] = useState([]);

  // Auto-set suggested page title when type or product changes
  useEffect(() => {
    if (pageType === "PRODUCT" && selectedProduct) {
      setPageTitle(`Product Page – ${selectedProduct.title}`);
    } else if (pageType === "PRODUCT" && !pageTitle) {
      setPageTitle("Product Spotlight Page");
    } else if (pageType === "LANDING" && !pageTitle) {
      setPageTitle("High-Converting Landing Page");
    } else if (pageType === "HOME" && !pageTitle) {
      setPageTitle(`${shop?.name || "Store"} – Homepage`);
    } else if (pageType === "FAQ" && !pageTitle) {
      setPageTitle("Frequently Asked Questions");
    }
  }, [pageType, selectedProduct]);

  const hasSufficientCredits = (shopSettings?.pageCredits || 0) >= 5;

  const handleGenerate = () => {
    const formData = new FormData();
    formData.append("pageType", pageType);
    formData.append("pageStyle", pageStyle);
    formData.append("pageTitle", pageTitle || `${pageType} Page`);
    formData.append("promptText", promptText);
    formData.append("niche", niche || "General E-commerce");
    formData.append("selectedProduct", JSON.stringify(selectedProduct));
    formData.append("selectedPolicies", JSON.stringify(selectedPolicies));
    formData.append("availablePolicies", JSON.stringify(policies));

    setCurrentStep(4);
    fetcher.submit(formData, { method: "POST" });
  };

  return (
    <div className="pm-wizard-page">
      {/* Main Wizard Content Body */}
      <main className="pm-wizard-content">
        {currentStep === 1 && (
          <StepPageType
            pageType={pageType}
            setPageType={setPageType}
            shopSettings={shopSettings}
          />
        )}

        {currentStep === 2 && (
          <StepPageStyle
            pageStyle={pageStyle}
            setPageStyle={setPageStyle}
            shopSettings={shopSettings}
          />
        )}

        {currentStep === 3 && (
          <StepPromptInput
            pageType={pageType}
            pageTitle={pageTitle}
            setPageTitle={setPageTitle}
            promptText={promptText}
            setPromptText={setPromptText}
            niche={niche}
            setNiche={setNiche}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            selectedPolicies={selectedPolicies}
            setSelectedPolicies={setSelectedPolicies}
            products={products}
            policies={policies}
            hasSufficientCredits={hasSufficientCredits}
            shopSettings={shopSettings}
          />
        )}

        {currentStep === 4 && (
          <StepGenerating
            isSubmitting={fetcher.state === "submitting" || fetcher.state === "loading"}
            actionData={fetcher.data}
            pageTitle={pageTitle}
            onRetry={handleGenerate}
            onBack={() => setCurrentStep(3)}
          />
        )}
      </main>

      {/* Sticky Bottom Navigation Footer (Hidden on Step 4 Loading Screen) */}
      {currentStep < 4 && (
        <WizardFooter
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          hasSufficientCredits={hasSufficientCredits}
          onSubmit={handleGenerate}
        />
      )}
    </div>
  );
}
