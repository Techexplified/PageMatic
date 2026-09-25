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
} from "lucide-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import "../styles/dashboard.css";

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
    orderBy: { createdAt: "desc" },
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
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isTokenInfoOpen, setIsTokenInfoOpen] = useState(false);
  const fetcher = useFetcher();
  const menuRef = useRef(null);
  const tokenPopoverRef = useRef(null);

  // Close dropdowns and popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
      if (tokenPopoverRef.current && !tokenPopoverRef.current.contains(event.target)) {
        setIsTokenInfoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

      // Check hero section or direct section image
      if (content.sections && Array.isArray(content.sections)) {
        for (const sec of content.sections) {
          if (sec?.content?.imageUrl) return sec.content.imageUrl;
        }
      }
      return content?.hero?.imageUrl || null;
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
      setActiveMenuId(null);
    }
  };

  // Filter pages by search query
  const filteredPages = pages.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      formatPageType(p.pageType).toLowerCase().includes(q) ||
      p.handle.toLowerCase().includes(q)
    );
  });

  return (
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
        <div className="pm-table-wrapper" ref={menuRef}>
          {filteredPages.length > 0 ? (
            <table className="pm-pages-table">
              <thead>
                <tr>
                  <th className="pm-col-idx">#</th>
                  <th>Page name</th>
                  <th>Page type</th>
                  <th>Created on</th>
                  <th>Publish</th>
                  <th style={{ textAlign: "right", paddingRight: "36px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page, index) => {
                  const thumb = getThumbnail(page);
                  const isMenuOpen = activeMenuId === page.id;
                  const isPublished = page.status === "PUBLISHED";

                  return (
                    <tr key={page.id}>
                      {/* 1. Index # */}
                      <td className="pm-col-idx">{index + 1}</td>

                      {/* 2. Page Name + Thumbnail / Icon */}
                      <td>
                        <div className="pm-page-name-cell">
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
                        </div>
                      </td>

                      {/* 3. Page Type */}
                      <td>
                        <span className="pm-page-type-text">
                          {formatPageType(page.pageType)}
                        </span>
                      </td>

                      {/* 4. Created Date */}
                      <td>
                        <span className="pm-page-date-text">
                          {formatDate(page.createdAt)}
                        </span>
                      </td>

                      {/* 5. Publish Toggle Switch */}
                      <td>
                        <label className="pm-toggle-switch">
                          <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={() => handleTogglePublish(page)}
                          />
                          <span className="pm-toggle-slider" />
                        </label>
                      </td>

                      {/* 6. 3-Dot Actions Menu */}
                      <td style={{ textAlign: "right", paddingRight: "36px" }}>
                        <div className="pm-actions-wrapper">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(isMenuOpen ? null : page.id)
                            }
                            className={`pm-btn-dots ${isMenuOpen ? "pm-btn-dots--active" : ""}`}
                            title="Actions"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {/* Dropdown Menu (Preview, Edit, Delete) */}
                          {isMenuOpen && (
                            <div className="pm-dropdown-menu">
                              <button
                                type="button"
                                className="pm-dropdown-item"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  // UI placeholder for preview
                                }}
                              >
                                <Eye size={14} />
                                Preview
                              </button>

                              <Link
                                to={`/app/editor/${page.id}`}
                                className="pm-dropdown-item"
                                onClick={() => setActiveMenuId(null)}
                              >
                                <Edit3 size={14} />
                                Edit
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleDelete(page.id)}
                                className="pm-dropdown-item pm-dropdown-item--delete"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
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
                  : "Your created storefront pages will appear here once generated."}
              </p>
              {/* {!searchQuery && (
                <Link
                  to="/app"
                  style={{
                    marginTop: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 22px",
                    background: "var(--pm-primary)",
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
              )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
