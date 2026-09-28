import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Check,
  UploadCloud,
  Eye,
} from "lucide-react";

export default function EditorHeader({
  pageTitle,
  setPageTitle,
  pageStatus = "DRAFT",
  deviceMode,
  setDeviceMode,
  onSave,
  onPreview,
  onPublish,
  isSaving,
}) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveClick = () => {
    if (onSave) onSave();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <header className="pm-editor-header">
      {/* Left: Back Link & Page Title */}
      <div className="pm-editor-header-left">
        <Link to="/app/dashboard" className="pm-editor-back-btn" title="Back to Dashboard">
          <ArrowLeft size={15} />
          <span>Dashboard</span>
        </Link>

        <div style={{ width: "1px", height: "24px", background: "#E2E8F0" }} />

        <div className="pm-editor-title-wrap">
          <input
            type="text"
            className="pm-editor-title-input"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            title="Click to rename page"
          />
          <span className="pm-editor-draft-badge">{pageStatus}</span>
        </div>
      </div>

      {/* Center: Device Viewport Switcher (Desktop & Mobile) */}
      <div className="pm-editor-header-center">
        <button
          type="button"
          className={`pm-device-btn ${deviceMode === "desktop" ? "pm-device-btn--active" : ""}`}
          onClick={() => setDeviceMode("desktop")}
          title="Desktop View"
        >
          <Monitor size={15} />
          <span>Desktop</span>
        </button>

        <button
          type="button"
          className={`pm-device-btn ${deviceMode === "mobile" ? "pm-device-btn--active" : ""}`}
          onClick={() => setDeviceMode("mobile")}
          title="Mobile View (375px)"
        >
          <Smartphone size={15} />
          <span>Mobile</span>
        </button>
      </div>

      {/* Right: Actions (Save, Preview, Publish) */}
      <div className="pm-editor-header-right">
        <button
          type="button"
          className="pm-btn-secondary"
          onClick={handleSaveClick}
          disabled={isSaving}
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : saveSuccess ? (
            <>
              <Check size={14} color="#16A34A" />
              <span style={{ color: "#16A34A" }}>Saved!</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="pm-btn-secondary"
          onClick={onPreview}
          title="Open sandboxed preview in new tab (zero Shopify pollution)"
        >
          <Eye size={14} />
          <span>Preview</span>
        </button>

        <button
          type="button"
          className="pm-btn-primary"
          onClick={onPublish}
        >
          <UploadCloud size={15} />
          <span>Publish Page</span>
        </button>
      </div>
    </header>
  );
}
