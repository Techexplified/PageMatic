import { embedRedirect } from "../utils/shopify-embed-nav.server.js";

export const loader = async ({ request }) => {
  throw embedRedirect("/app/dashboard", request);
};

export default function AppIndexRedirect() {
  return null;
}
