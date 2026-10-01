import { useState } from "react";
import { Link } from "react-router";
import {
  Search,
  ChevronRight,
  ShoppingBag,
  Home,
  HelpCircle,
  Layout,
  Layers,
} from "lucide-react";
import TokenBadge from "../TokenBadge";
import "../../styles/dashboard.css";
import "../../styles/editor.css";

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
      return <ShoppingBag size={20} />;
    case "HOME":
      return <Home size={20} />;
    case "FAQ":
      return <HelpCircle size={20} />;
    default:
      return <Layout size={20} />;
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

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function PageSelectionScreen({ pages = [], shopSettings }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPages = pages.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      formatPageType(p.pageType).toLowerCase().includes(q) ||
      (p.handle && p.handle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pm-page-select-screen">
      <div className="pm-page-select-container">
        {/* 1. Header Section */}
        <div className="pm-dash-header">
          <div className="pm-dash-title-group">
            <h1 className="pm-dash-title">Studio Editor</h1>
            <p className="pm-dash-subtitle">Select a page to customize.</p>
          </div>

          {/* Dual Gold & Silver Token Counter Pill */}
          <TokenBadge shopSettings={shopSettings} />
        </div>

        {/* 2. Main Selection Card */}
        <div className="pm-table-card">
          {/* Card Top Bar */}
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

          {/* 3. Page List with Right Arrow */}
          <div className="pm-page-select-list">
            {filteredPages.length > 0 ? (
              filteredPages.map((p) => {
                const thumb = getThumbnail(p);
                const isPublished = p.status === "PUBLISHED";

                return (
                  <Link
                    key={p.id}
                    to={`/app/editor?pageId=${p.id}`}
                    className="pm-page-select-row"
                  >
                    {/* Left: Thumbnail image or category icon */}
                    <div className="pm-page-select-thumb-wrap">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={p.title}
                          className="pm-page-select-thumb"
                        />
                      ) : (
                        <div className="pm-page-select-thumb-fallback">
                          {getPageIcon(p.pageType)}
                        </div>
                      )}
                    </div>

                    {/* Middle: Title, Type & Meta */}
                    <div className="pm-page-select-info">
                      <div className="pm-page-select-title-row">
                        <span className="pm-page-select-title">{p.title}</span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 7px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: isPublished ? "#DCFCE7" : "#FEF3C7",
                            color: isPublished ? "#15803D" : "#92400E",
                            border: isPublished ? "1px solid #BBF7D0" : "1px solid #FDE68A",
                          }}
                        >
                          {isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                      </div>

                      <div className="pm-page-select-meta">
                        <span>{formatPageType(p.pageType)}</span>
                        <span>•</span>
                        <span>Updated {formatDate(p.updatedAt || p.createdAt)}</span>
                      </div>
                    </div>

                    {/* Right: Chevron Arrow */}
                    <div className="pm-page-select-arrow-wrap">
                      <ChevronRight size={20} className="pm-page-select-arrow" />
                    </div>
                  </Link>
                );
              })
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
                    ? "Try searching with a different page title."
                    : "Generate your first high-converting storefront page from the Page Builder."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
