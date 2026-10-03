import db from "../db.server";
import { compilePageToHtml } from "./html-compiler.server";

/**
 * Publishes a PageMatic page directly to Shopify OnlineStorePages and Metafields
 *
 * @param {Object} params
 * @param {Object} params.admin - Authenticated Shopify Admin GraphQL client (from authenticate.admin(request))
 * @param {string} params.shop - Shop domain string (e.g. mystore.myshopify.com)
 * @param {Object} params.page - Prisma Page record
 * @returns {Promise<{success: boolean, shopifyPageId: string, handle: string, storefrontUrl: string, error?: string}>}
 */
export async function publishPageToShopify({ admin, shop, page }) {
  try {
    if (!page || !page.contentJson) {
      throw new Error("Invalid page data or missing contentJson");
    }

    const compiledHtml = compilePageToHtml(page.contentJson);
    let shopifyPageId = page.shopifyPageId;
    let finalHandle = page.handle;

    // 1. UPDATE EXISTING SHOPIFY PAGE
    if (shopifyPageId) {
      const updateMutation = `#graphql
        mutation pageUpdate($id: ID!, $page: PageUpdateInput!) {
          pageUpdate(id: $id, page: $page) {
            page {
              id
              handle
              title
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const res = await admin.graphql(updateMutation, {
        variables: {
          id: shopifyPageId,
          page: {
            title: page.title,
            handle: page.handle,
            body: compiledHtml,
            isPublished: true,
          },
        },
      });

      const resJson = await res.json();
      const userErrors = resJson?.data?.pageUpdate?.userErrors || [];
      if (userErrors.length > 0) {
        console.warn("[Publisher] pageUpdate userErrors:", userErrors);
        // If page was deleted from Shopify admin, fallback to creating a new one
        if (userErrors.some((e) => e.message.toLowerCase().includes("not found"))) {
          shopifyPageId = null;
        } else if (userErrors.some((e) => e.message.toLowerCase().includes("handle has already been taken"))) {
          console.warn("[Publisher] Handle collision on pageUpdate. Retrying without handle mutation to preserve live URL...");
          const retryUpdate = await admin.graphql(updateMutation, {
            variables: {
              id: shopifyPageId,
              page: {
                title: page.title,
                body: compiledHtml,
                isPublished: true,
              },
            },
          });
          const retryJson = await retryUpdate.json();
          const retryErrors = retryJson?.data?.pageUpdate?.userErrors || [];
          if (retryErrors.length > 0) {
            throw new Error(retryErrors.map((e) => e.message).join(", "));
          }
          finalHandle = retryJson?.data?.pageUpdate?.page?.handle || finalHandle;
        } else {
          throw new Error(userErrors.map((e) => e.message).join(", "));
        }
      } else if (resJson?.data?.pageUpdate?.page) {
        finalHandle = resJson.data.pageUpdate.page.handle || finalHandle;
      }
    }

    // 2. CREATE NEW SHOPIFY PAGE (If no ID or previously deleted)
    if (!shopifyPageId) {
      const createMutation = `#graphql
        mutation pageCreate($page: PageCreateInput!) {
          pageCreate(page: $page) {
            page {
              id
              handle
              title
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      let res = await admin.graphql(createMutation, {
        variables: {
          page: {
            title: page.title,
            handle: finalHandle,
            body: compiledHtml,
            isPublished: true,
          },
        },
      });

      let resJson = await res.json();
      let userErrors = resJson?.data?.pageCreate?.userErrors || [];

      // Auto-resolve handle collision if the requested handle already exists in the merchant's Shopify store
      if (userErrors.some((e) => e.message?.toLowerCase().includes("handle has already been taken"))) {
        console.warn(`[Publisher] Handle '${finalHandle}' is already taken on Shopify. Auto-resolving unique handle fallback...`);
        let retryCounter = 1;
        let retrySuccess = false;

        while (retryCounter <= 5 && !retrySuccess) {
          const fallbackHandle = `${finalHandle.replace(/-\d+$/, "")}-${retryCounter}`;
          const retryRes = await admin.graphql(createMutation, {
            variables: {
              page: {
                title: page.title,
                handle: fallbackHandle,
                body: compiledHtml,
                isPublished: true,
              },
            },
          });
          const retryData = await retryRes.json();
          const retryErrors = retryData?.data?.pageCreate?.userErrors || [];
          if (retryErrors.length === 0 && retryData?.data?.pageCreate?.page?.id) {
            resJson = retryData;
            userErrors = [];
            finalHandle = retryData.data.pageCreate.page.handle || fallbackHandle;
            retrySuccess = true;
            break;
          }
          retryCounter++;
        }
      }

      if (userErrors.length > 0) {
        throw new Error(userErrors.map((e) => e.message).join(", "));
      }

      const createdPage = resJson?.data?.pageCreate?.page;
      if (!createdPage?.id) {
        throw new Error("Failed to create Shopify OnlineStorePage");
      }

      shopifyPageId = createdPage.id;
      finalHandle = createdPage.handle || finalHandle;
    }

    // 3. SET PRIVATE/APP METAFIELD WITH COMPLETE JSON AST
    try {
      const metafieldMutation = `#graphql
        mutation setPageMetafield($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              namespace
              key
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      await admin.graphql(metafieldMutation, {
        variables: {
          metafields: [
            {
              ownerId: shopifyPageId,
              namespace: "pagematic",
              key: "content",
              type: "json",
              value: JSON.stringify(page.contentJson),
            },
          ],
        },
      });
    } catch (metaErr) {
      console.warn("[Publisher] Metafield set notice:", metaErr.message);
    }

    // 4. UPDATE PRISMA DATABASE STATUS
    const updatedPage = await db.page.update({
      where: { id: page.id },
      data: {
        shopifyPageId,
        status: "PUBLISHED",
        handle: finalHandle,
        updatedAt: new Date(),
      },
    });

    const cleanShop = shop.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    const storefrontUrl = `https://${cleanShop}/pages/${finalHandle}`;

    console.log(`[Publisher] Successfully published page "${updatedPage.title}" to ${storefrontUrl}`);

    return {
      success: true,
      shopifyPageId,
      handle: finalHandle,
      storefrontUrl,
      page: updatedPage,
    };
  } catch (err) {
    console.error("[Publisher] Failed to publish page:", err);
    return {
      success: false,
      error: err.message || "Failed to publish page to Shopify storefront.",
    };
  }
}

/**
 * Unpublishes a PageMatic page from Shopify Online Store (reverts to Draft/hidden)
 *
 * @param {Object} params
 * @param {Object} params.admin - Authenticated Shopify Admin GraphQL client
 * @param {string} params.shop - Shop domain string
 * @param {Object} params.page - Prisma Page record
 * @returns {Promise<{success: boolean, page?: Object, error?: string}>}
 */
export async function unpublishPageFromShopify({ admin, shop, page }) {
  try {
    if (!page) {
      throw new Error("Invalid page data");
    }

    // 1. If page exists on Shopify, set isPublished: false
    if (page.shopifyPageId) {
      const updateMutation = `#graphql
        mutation pageUnpublish($id: ID!, $page: PageUpdateInput!) {
          pageUpdate(id: $id, page: $page) {
            page {
              id
              isPublished
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      try {
        const res = await admin.graphql(updateMutation, {
          variables: {
            id: page.shopifyPageId,
            page: {
              isPublished: false,
            },
          },
        });
        const resJson = await res.json();
        const userErrors = resJson?.data?.pageUpdate?.userErrors || [];
        if (userErrors.length > 0) {
          console.warn("[Publisher] unpublish userErrors:", userErrors);
        }
      } catch (graphErr) {
        console.warn("[Publisher] GraphQL unpublish warning:", graphErr.message);
      }
    }

    // 2. Update Prisma database status to DRAFT
    const updatedPage = await db.page.update({
      where: { id: page.id },
      data: {
        status: "DRAFT",
        updatedAt: new Date(),
      },
    });

    console.log(`[Publisher] Successfully unpublished page "${updatedPage.title}" (Status: DRAFT)`);

    return {
      success: true,
      page: updatedPage,
      message: "Page unpublished successfully and reverted to Draft.",
    };
  } catch (err) {
    console.error("[Publisher] Failed to unpublish page:", err);
    return {
      success: false,
      error: err.message || "Failed to unpublish page from Shopify storefront.",
    };
  }
}

