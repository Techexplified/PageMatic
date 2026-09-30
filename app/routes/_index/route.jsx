import { redirect } from "react-router";
import { authenticate } from "../../shopify.server";

const EMBED_QUERY_KEYS = [
  "shop",
  "host",
  "embedded",
  "hmac",
  "id_token",
  "session",
  "timestamp",
  "locale",
];

function hasEmbedContext(url) {
  return EMBED_QUERY_KEYS.some((key) => url.searchParams.has(key));
}

function isLikelyShopifyAdminReferer(request) {
  const referer = request.headers.get("Referer") || "";
  return referer.includes("admin.shopify.com") || referer.includes(".myshopify.com/admin");
}

function appHomeUrl(request) {
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  return qs ? `/app/dashboard?${qs}` : "/app/dashboard";
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // 1. Embedded admin, host query param, or Shopify OAuth return — go straight to app dashboard
  if (hasEmbedContext(url) || isLikelyShopifyAdminReferer(request)) {
    throw redirect(appHomeUrl(request));
  }

  // 2. Existing active session (e.g. reopen from Apps menu without query params)
  try {
    await authenticate.admin(request);
    throw redirect(appHomeUrl(request));
  } catch (error) {
    if (error instanceof Response) throw error;
    throw redirect("/auth/login");
  }
};

export default function Index() {
  return null; // Never render the placeholder page
}
