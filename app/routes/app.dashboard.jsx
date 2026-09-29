import { useState, useEffect, useRef } from "react";
import { useLoaderData, useFetcher, data, Link } from "react-router";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  Info,
  X,
  Layers,
  ShoppingBag,
  Layout,
  Home,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import "../styles/dashboard.css";

// Format page type label
const formatPageType = (type) => {
  const map = {
    PRODUCT: "Product Page",
    LANDING: "Landing Page",
    HOME: "Home Page",
    FAQ: "FAQ Page",
  };
  return map[type] || "Landing Page";
};

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let shopSettings = await db.shopSettings.findUnique({
    where: { shop },
  });

  if (!shopSettings) {
    shopSettings = await db.shopSettings.create({
      data: { shop },
    });
  }

  const pages = await db.page.findMany({
    where: { shopId: shopSettings.id },
    orderBy: { updatedAt: "desc" },
  });

  return data({ shopSettings, pages });
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
    return data({ error: "Shop not found" }, { status: 404 });
  }

  if (intent === "delete_page") {
    const pageId = formData.get("pageId");
    if (pageId) {
      await db.page.deleteMany({
        where: { id: String(pageId), shopId: shopSettings.id },
      });
    }
    return data({ success: true });
  }

  if (intent === "toggle_status") {
    const pageId = formData.get("pageId");
    const nextStatus = formData.get("status"); // "PUBLISHED" or "DRAFT"
    if (pageId && nextStatus) {
      await db.page.updateMany({
        where: { id: String(pageId), shopId: shopSettings.id },
        data: { status: String(nextStatus) },
      });
    }
    return data({ success: true });
  }

  return data({ error: "Invalid action intent" }, { status: 400 });
};

export default function Dashboard() {
  const { shopSettings, pages } = useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isTokenInfoOpen, setIsTokenInfoOpen] = useState(false);
  const fetcher = useFetcher();
  const tokenPopoverRef = useRef(null);

  // Filter pages by search query
  const filteredPages = pages.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      formatPageType(p.pageType).toLowerCase().includes(q) ||
      p.handle.toLowerCase().includes(q)
    );
  });

  // Pagination logic (5 items per page)
  const perPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredPages.length / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, filteredPages.length);
  const paginatedPages = filteredPages.slice(startIndex, startIndex + perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate visible page numbers for pagination bar
  const getPageNumbers = () => {
    const list = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        list.push(i);
      }
    } else {
      if (currentPage <= 4) {
        list.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        list.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        list.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return list;
  };

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (tokenPopoverRef.current && !tokenPopoverRef.current.contains(event.target)) {
        setIsTokenInfoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get fallback icon for page type
  const getPageIcon = (type) => {
    switch (type) {
      case "PRODUCT":
        return <ShoppingBag size={18} />;
      case "HOME":
        return <Home size={18} />;
      case "FAQ":
        return <HelpCircle size={18} />;
      default:
        return <Layout size={18} />;
    }
  };

  // Extract thumbnail image from page content JSON if available
  const getThumbnail = (page) => {
    try {
      const content =
        typeof page.contentJson === "string"
          ? JSON.parse(page.contentJson)
          : page.contentJson;

      if (!content) return null;

      // Check sections tree for images
      if (content.sections && Array.isArray(content.sections)) {
        for (const sec of content.sections) {
          if (sec?.data?.imageUrl) return sec.data.imageUrl;
          if (sec?.data?.galleryImages?.[0]) return sec.data.galleryImages[0];
          if (sec?.data?.products?.[0]?.imageUrl) return sec.data.products[0].imageUrl;
          if (sec?.data?.rows?.[0]?.imageUrl) return sec.data.rows[0].imageUrl;
          if (sec?.data?.items?.[0]?.imageUrl) return sec.data.items[0].imageUrl;
        }
      }
      return content?.imageUrl || null;
    } catch {
      return null;
    }
  };

  // Format created date
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Handle publish toggle
  const handleTogglePublish = (page) => {
    const newStatus = page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    fetcher.submit(
      { intent: "toggle_status", pageId: page.id, status: newStatus },
      { method: "post" }
    );
  };

  // Handle delete
  const handleDelete = (pageId) => {
    if (confirm("Are you sure you want to delete this page?")) {
      fetcher.submit({ intent: "delete_page", pageId }, { method: "post" });
    }
  };

  // Handle preview in standalone tab
  const handlePreviewPage = (page) => {
    if (typeof window !== "undefined") {
      const payload = {
        ...page,
        contentJson: typeof page.contentJson === "string" ? JSON.parse(page.contentJson) : page.contentJson,
      };
      localStorage.setItem("pagematic_live_preview", JSON.stringify(payload));
      sessionStorage.setItem("pagematic_live_preview", JSON.stringify(payload));

      if ("BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("pagematic_preview_sync");
          bc.postMessage({ type: "PAGEMATIC_PREVIEW_UPDATE", page: payload });
          setTimeout(() => bc.close(), 200);
        } catch (e) {}
      }

      const targetUrl = page?.id ? `/preview?pageId=${page.id}` : "/preview";
      window.open(targetUrl, "_blank");
    }
  };

  return (
    <div className="pm-dash-page">
      <div className="pm-dash-container">
        {/* 1. Header Section */}
        <div className="pm-dash-header">
          <div className="pm-dash-title-group">
            <h1 className="pm-dash-title">Dashboard</h1>
            <p className="pm-dash-subtitle">View and manage all your pages.</p>
          </div>

        {/* Dual Gold & Silver Token Counter Pill on the same line */}
        <div className="pm-token-group-wrapper" ref={tokenPopoverRef}>
          <div className="pm-token-pill">
            {/* Gold Tokens (Page Credits) */}
            <div className="pm-token-item" title="Full-Page Generation Credits">
              <div className="pm-token-coin--gold">G</div>
              <span className="pm-token-count">{shopSettings?.pageCredits ?? 20}</span>
              <span className="pm-token-label">credits</span>
            </div>

            <div className="pm-token-divider" />

            {/* Silver Tokens (Micro-Edits) */}
            <div className="pm-token-item" title="Section Re-rolls & Micro-Edits">
              <div className="pm-token-coin--silver">S</div>
              <span className="pm-token-count">{shopSettings?.iterationTokens ?? 100}</span>
              <span className="pm-token-label">tokens</span>
            </div>

            {/* Info Icon Button */}
            <button
              type="button"
              onClick={() => setIsTokenInfoOpen(!isTokenInfoOpen)}
              className={`pm-token-info-btn ${isTokenInfoOpen ? "pm-token-info-btn--active" : ""}`}
              title="What are Gold and Silver tokens?"
            >
              <Info size={16} />
            </button>
          </div>

          {/* Info Popover Modal */}
          {isTokenInfoOpen && (
            <div className="pm-token-popover">
              <div className="pm-popover-header">
                <h4 className="pm-popover-title">Token Balance & Usage</h4>
                <button
                  type="button"
                  onClick={() => setIsTokenInfoOpen(false)}
                  className="pm-popover-close"
                  title="Close"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="pm-popover-body">
                {/* Gold Token Info */}
                <div className="pm-popover-item">
                  <div className="pm-token-coin--gold" style={{ flexShrink: 0 }}>G</div>
                  <div className="pm-popover-item-content">
                    <h5 className="pm-popover-item-title">Page Credits (Gold)</h5>
                    <p className="pm-popover-item-desc">
                      Used for generating complete, full-page store layouts with high-reasoning AI (5 credits per full page).
                    </p>
                  </div>
                </div>

                {/* Silver Token Info */}
                <div className="pm-popover-item">
                  <div className="pm-token-coin--silver" style={{ flexShrink: 0 }}>S</div>
                  <div className="pm-popover-item-content">
                    <h5 className="pm-popover-item-title">Silver Tokens</h5>
                    <p className="pm-popover-item-desc">
                      Used for sub-second section re-rolls, headline rewrites, and AI micro-edits in the studio editor (2 tokens per edit).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Card ("Your pages") */}
      <div className="pm-table-card">
        {/* Table Top Bar */}
        <div className="pm-table-header-bar">
          <h2 className="pm-table-card-title">Your pages</h2>

          {/* Search Box */}
          <div className="pm-search-box">
            <Search size={16} className="pm-search-icon" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pm-search-input"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="pm-table-wrapper">
          {filteredPages.length > 0 ? (
            <table className="pm-pages-table">
              <thead>
                <tr>
                  <th className="pm-col-idx">#</th>
                  <th>Page name</th>
                  <th>Page type</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right", paddingRight: "28px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPages.map((page, index) => {
                  const thumb = getThumbnail(page);
                  const isPublished = page.status === "PUBLISHED";

                  return (
                    <tr key={page.id}>
                      {/* 1. Index # */}
                      <td className="pm-col-idx">{startIndex + index + 1}</td>

                      {/* 2. Page Name + Thumbnail / Icon */}
                      <td>
                        <Link
                          to={`/app/editor?pageId=${page.id}`}
                          className="pm-page-name-cell"
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={page.title}
                              className="pm-page-thumb"
                            />
                          ) : (
                            <div className="pm-page-thumb-fallback">
                              {getPageIcon(page.pageType)}
                            </div>
                          )}
                          <span className="pm-page-title-text">{page.title}</span>
                        </Link>
                      </td>

                      {/* 3. Page Type */}
                      <td>
                        <span className="pm-page-type-text">
                          {formatPageType(page.pageType)}
                        </span>
                      </td>

                      {/* 4. Updated Date */}
                      <td>
                        <span className="pm-page-date-text">
                          {formatDate(page.updatedAt || page.createdAt)}
                        </span>
                      </td>

                      {/* 5. Status Badge */}
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            background: isPublished ? "#DCFCE7" : "#FEF3C7",
                            color: isPublished ? "#15803D" : "#92400E",
                            border: isPublished ? "1px solid #BBF7D0" : "1px solid #FDE68A",
                          }}
                        >
                          {isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                      </td>

                      {/* 6. Side-by-Side Action Icons */}
                      <td style={{ textAlign: "right", paddingRight: "28px" }}>
                        <div className="pm-row-actions">
                          {/* Preview in Sandbox */}
                          <button
                            type="button"
                            className="pm-action-btn pm-action-btn--preview"
                            onClick={() => handlePreviewPage(page)}
                            title="Preview in Sandbox"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit in Studio */}
                          <Link
                            to={`/app/editor?pageId=${page.id}`}
                            className="pm-action-btn pm-action-btn--edit"
                            title="Edit in Studio"
                          >
                            <Edit3 size={15} />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(page.id)}
                            className="pm-action-btn pm-action-btn--delete"
                            title="Delete page"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Empty State */
            <div className="pm-empty-state">
              <div className="pm-empty-icon-wrap">
                <Layers size={28} />
              </div>
              <h4 className="pm-empty-title">
                {searchQuery ? "No matching pages found" : "No pages created yet"}
              </h4>
              <p className="pm-empty-desc">
                {searchQuery
                  ? "Try searching with a different term."
                  : "Generate your first high-converting storefront landing page now."}
              </p>
              {!searchQuery && (
                <Link
                  to="/app/page-builder"
                  style={{
                    marginTop: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 22px",
                    background: "#0052FF",
                    color: "#FFFFFF",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "14px",
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(0, 82, 255, 0.25)",
                  }}
                >
                  + Build New Page
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 3. Pagination Footer Bar */}
        {filteredPages.length > 0 && (
          <div className="pm-pagination-bar">
            <div className="pm-pagination-info">
              Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{" "}
              <strong>{filteredPages.length}</strong> {filteredPages.length === 1 ? "page" : "pages"}
            </div>

            {totalPages > 1 && (
              <div className="pm-pagination-controls">
                <button
                  type="button"
                  className="pm-pagination-nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="pm-pagination-pages">
                  {getPageNumbers().map((num, idx) => {
                    if (num === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="pm-pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={num}
                        type="button"
                        className={`pm-pagination-page-btn ${
                          currentPage === num ? "pm-pagination-page-btn--active" : ""
                        }`}
                        onClick={() => handlePageChange(num)}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="pm-pagination-nav-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  title="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
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
