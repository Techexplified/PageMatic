// libs/embed-check.server.js
const EMBED_QUERY = `#graphql
  query MainThemeSettings {
    themes(first: 1, roles: [MAIN]) {
      nodes {
        files(filenames: ["config/settings_data.json"], first: 1) {
          nodes {
            body {
              ... on OnlineStoreThemeFileBodyText { content }
            }
          }
        }
      }
    }
  }
`;

export async function isAppEmbedEnabled(admin, appHandle = "pagematic-core") {
  try {
    const res = await admin.graphql(EMBED_QUERY);
    const { data, errors } = await res.json();

    if (errors?.length) {
      console.warn(
        `Embed check GraphQL warning: ${errors.map((e) => e.message).join("; ")}`
      );
      return false;
    }

    const theme = data?.themes?.nodes?.[0];
    if (!theme) return false;

    const content = theme.files?.nodes?.[0]?.body?.content;
    if (!content) return false;

    // Shopify prepends a /* ... */ header comment; strip only that.
    const cleanContent = content.replace(/^\s*\/\*[\s\S]*?\*\//, "").trim();
    if (!cleanContent) return false;

    const settings = JSON.parse(cleanContent);

    const current =
      typeof settings.current === "string"
        ? settings.presets?.[settings.current]
        : settings.current;

    const blocks = current?.blocks ?? {};
    return Object.values(blocks).some((b) => {
      if (!b || b.disabled === true) return false;
      const type = String(b.type || "").toLowerCase();
      return (
        (type.includes("pagematic") ||
          type.includes("c3bcafaf-bc6f-cd1f-aec2-2d9f00c0527c0a64d6d5")) &&
        (type.includes("embed") || type.includes("pagematic-core"))
      );
    });
  } catch (err) {
    console.error("Error evaluating isAppEmbedEnabled:", err);
    return false;
  }
}