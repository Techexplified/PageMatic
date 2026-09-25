import { useState, useEffect } from "react";
import { useLoaderData, data } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// Modular Page Builder Components
import StepPageType from "../components/page-builder/StepPageType";
import StepPageStyle from "../components/page-builder/StepPageStyle";
import StepPromptInput from "../components/page-builder/StepPromptInput";
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
        if (shopData.refundPolicy?.body) policies.push({ type: "Refund Policy", ...shopData.refundPolicy });
        if (shopData.shippingPolicy?.body) policies.push({ type: "Shipping Policy", ...shopData.shippingPolicy });
        if (shopData.privacyPolicy?.body) policies.push({ type: "Privacy Policy", ...shopData.privacyPolicy });
        if (shopData.termsOfService?.body) policies.push({ type: "Terms of Service", ...shopData.termsOfService });
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
// PAGE BUILDER ORCHESTRATOR
// ============================================================================
export default function PageBuilder() {
  const { shopSettings, shop, products, collections, policies } = useLoaderData();

  // Step state: 1 (Type) -> 2 (Style) -> 3 (Prompt & Ingestion)
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
    const payload = {
      pageType,
      pageStyle,
      pageTitle: pageTitle || `${pageType} Page`,
      promptText,
      niche: niche || "General E-commerce",
      selectedProduct,
      selectedPolicies,
    };
    console.log("Submitting to Generation Engine:", payload);
    alert(`Ready for Milestone 2: Generating "${payload.pageTitle}" using 5 credits!`);
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
            onBack={() => setCurrentStep(1)}
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
            onBack={() => setCurrentStep(2)}
          />
        )}
      </main>

      {/* Sticky Bottom Navigation Footer */}
      <WizardFooter
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        hasSufficientCredits={hasSufficientCredits}
        onSubmit={handleGenerate}
      />
    </div>
  );
}
