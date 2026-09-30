import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, data } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { generateAndPersistPage } from "../services/page-generator.server";
import { embedRedirect } from "../utils/shopify-embed-nav.server.js";

// Modular Page Builder Components
import StepPageType from "../components/page-builder/StepPageType";
import StepPageStyle from "../components/page-builder/StepPageStyle";
import StepPromptInput from "../components/page-builder/StepPromptInput";
import StepGenerating from "../components/page-builder/StepGenerating";
import WizardFooter from "../components/page-builder/WizardFooter";
import "../styles/page-builder.css";

// Helper to fetch store catalog from Shopify GraphQL
async function fetchStoreCatalog(admin) {
  const mainQuery = `#graphql
    query GetStoreCatalog {
      shop {
        name
        email
        myshopifyDomain
        currencyCode
        primaryDomain {
          url
        }
      }
      products(first: 20, sortKey: TITLE) {
        edges {
          node {
            id
            title
            handle
            description
            vendor
            productType
            featuredImage {
              url
              altText
            }
            images(first: 6) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  price
                }
              }
            }
          }
        }
      }
      collections(first: 10) {
        edges {
          node {
            id
            title
            handle
            image {
              url
              altText
            }
            products(first: 8) {
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
                  images(first: 4) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                  priceRangeV2 {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  variants(first: 5) {
                    edges {
                      node {
                        id
                        title
                        price
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await admin.graphql(mainQuery);
    const json = await response.json();

    if (json.errors) {
      console.error("[StoreCatalog] GraphQL Errors in main query:", JSON.stringify(json.errors, null, 2));
    }

    const shopData = json?.data?.shop || null;
    const rawProducts = (json?.data?.products?.edges || []).map((e) => e.node);
    const products = rawProducts.map((p) => {
      const galleryImages = (p.images?.edges || []).map((img) => img.node.url).filter(Boolean);
      const variants = (p.variants?.edges || []).map((v) => ({
        id: v.node.id,
        title: v.node.title,
        price: v.node.price,
      }));
      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        description: p.description,
        vendor: p.vendor,
        productType: p.productType,
        imageUrl: p.featuredImage?.url || (galleryImages[0] || ""),
        galleryImages: galleryImages.length > 0 ? galleryImages : (p.featuredImage?.url ? [p.featuredImage.url] : []),
        price: `${p.priceRangeV2?.minVariantPrice?.amount || ""} ${p.priceRangeV2?.minVariantPrice?.currencyCode || ""}`.trim(),
        priceAmount: p.priceRangeV2?.minVariantPrice?.amount || "",
        currencyCode: p.priceRangeV2?.minVariantPrice?.currencyCode || "USD",
        variants,
        primaryVariantId: variants[0]?.id || p.id,
      };
    });

    const collections = (json?.data?.collections?.edges || []).map((e) => {
      const colProducts = (e.node.products?.edges || []).map((pe) => {
        const p = pe.node;
        const galleryImages = (p.images?.edges || []).map((img) => img.node.url).filter(Boolean);
        const variants = (p.variants?.edges || []).map((v) => ({
          id: v.node.id,
          title: v.node.title,
          price: v.node.price,
        }));
        return {
          id: p.id,
          title: p.title,
          handle: p.handle,
          description: p.description,
          imageUrl: p.featuredImage?.url || (galleryImages[0] || ""),
          galleryImages: galleryImages.length > 0 ? galleryImages : (p.featuredImage?.url ? [p.featuredImage.url] : []),
          price: `${p.priceRangeV2?.minVariantPrice?.amount || ""} ${p.priceRangeV2?.minVariantPrice?.currencyCode || ""}`.trim(),
          variants,
          primaryVariantId: variants[0]?.id || p.id,
        };
      });

      const coverImage = e.node.image?.url || colProducts[0]?.imageUrl || "";

      return {
        id: e.node.id,
        title: e.node.title,
        handle: e.node.handle,
        imageUrl: coverImage,
        products: colProducts,
      };
    });

    let policies = [];
    try {
      const policyQuery = `#graphql
        query GetPolicies {
          shop {
            shopPolicies {
              id
              title
              type
              body
              url
            }
          }
        }
      `;
      const polRes = await admin.graphql(policyQuery);
      const polJson = await polRes.json();
      if (polJson?.data?.shop?.shopPolicies) {
        policies = polJson.data.shop.shopPolicies;
      }
    } catch {
      // Ignore if scope not granted
    }

    console.log(`[StoreCatalog] Successfully ingested ${products.length} products, ${collections.length} collections, and ${policies.length} policies for ${shopData?.name || "shop"}`);
    return { shop: shopData, products, collections, policies };
  } catch (err) {
    console.error("[StoreCatalog] Error fetching store context:", err);
    return { shop: null, products: [], collections: [], policies: [] };
  }
}

// ============================================================================
// LOADER (Parallelized DB + Shopify Admin GraphQL via Promise.all)
// ============================================================================
export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  const [shopSettingsResult, catalogResult] = await Promise.all([
    db.shopSettings.findUnique({
      where: { shop },
    }),
    fetchStoreCatalog(admin),
  ]);

  let shopSettings = shopSettingsResult;
  if (!shopSettings) {
    shopSettings = await db.shopSettings.create({
      data: { shop },
    });
  }

  // Route Guard: If merchant has not completed onboarding, force redirection to onboarding flow
  if (!shopSettings.isOnboarded) {
    throw embedRedirect("/app/onboarding", request);
  }

  return data({
    shopSettings,
    shop: catalogResult.shop,
    products: catalogResult.products,
    collections: catalogResult.collections,
    policies: catalogResult.policies,
  });
};

// ============================================================================
// ACTION (Triggers OpenRouter Page Generation & Schema Synthesis)
// ============================================================================
export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const pageType = formData.get("pageType") || "LANDING";
  const pageStyle = formData.get("pageStyle") || "minimal";
  const pageTitle = formData.get("pageTitle") || "Untitled Page";
  const promptText = formData.get("promptText") || "";
  const niche = formData.get("niche") || "General E-commerce";
  const selectedProductStr = formData.get("selectedProduct");
  const selectedProductsStr = formData.get("selectedProducts");
  const selectedCollectionStr = formData.get("selectedCollection");
  const selectedPoliciesStr = formData.get("selectedPolicies");
  const storeContextStr = formData.get("storeContext");

  let selectedProduct = null;
  let selectedProducts = [];
  let selectedCollection = null;
  let selectedPolicies = [];
  let storeContext = null;

  try {
    if (selectedProductStr) selectedProduct = JSON.parse(selectedProductStr);
    if (selectedProductsStr) selectedProducts = JSON.parse(selectedProductsStr);
    if (selectedCollectionStr) selectedCollection = JSON.parse(selectedCollectionStr);
    if (selectedPoliciesStr) selectedPolicies = JSON.parse(selectedPoliciesStr);
    if (storeContextStr) storeContext = JSON.parse(storeContextStr);
  } catch (e) {
    console.warn("JSON parse warning in action:", e);
  }

  // If store context was missing or had 0 products, fetch directly on the server
  if (!storeContext || !storeContext.products || storeContext.products.length === 0) {
    console.log("[Action] Fetching live store catalog directly from Shopify...");
    storeContext = await fetchStoreCatalog(admin);
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
      selectedProducts,
      selectedCollection,
      selectedPolicies,
      storeContext,
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
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedPolicies, setSelectedPolicies] = useState([]);

  // Auto-set suggested page title when type or product changes
  useEffect(() => {
    if (pageType === "PRODUCT" && selectedProduct) {
      setPageTitle(`${selectedProduct.title} – Spotlight Page`);
    } else if (pageType === "PRODUCT" && !pageTitle) {
      setPageTitle("Product Spotlight Page");
    } else if (pageType === "LANDING" && selectedProduct) {
      setPageTitle(`${selectedProduct.title} – Special Offer`);
    } else if (pageType === "LANDING" && !pageTitle) {
      setPageTitle("High-Converting Campaign Page");
    } else if (pageType === "HOME" && !pageTitle) {
      setPageTitle(`${shop?.name || "Store"} – Official Storefront`);
    } else if (pageType === "FAQ" && !pageTitle) {
      setPageTitle("Help Center & Frequently Asked Questions");
    }
  }, [pageType, selectedProduct]);

  // Credit gating relaxed during testing/development phase
  const hasSufficientCredits = true;

  const handleGenerate = () => {
    const formData = new FormData();
    formData.append("pageType", pageType);
    formData.append("pageStyle", pageStyle);
    formData.append("pageTitle", pageTitle || `${pageType} Page`);
    formData.append("promptText", promptText);
    formData.append("niche", niche || "General E-commerce");
    formData.append("selectedProduct", JSON.stringify(selectedProduct));
    formData.append("selectedProducts", JSON.stringify(selectedProducts));
    formData.append("selectedCollection", JSON.stringify(selectedCollection));
    formData.append("selectedPolicies", JSON.stringify(selectedPolicies));
    formData.append("storeContext", JSON.stringify({ shop, products, collections, policies }));

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
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            selectedCollection={selectedCollection}
            setSelectedCollection={setSelectedCollection}
            selectedPolicies={selectedPolicies}
            setSelectedPolicies={setSelectedPolicies}
            products={products}
            collections={collections}
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
