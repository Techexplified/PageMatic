import { useState, useRef, useEffect } from "react";
import { Info, X } from "lucide-react";

export default function TokenBadge({ shopSettings }) {
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const tokenRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (tokenRef.current && !tokenRef.current.contains(event.target)) {
        setShowTokenInfo(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goldCredits = shopSettings?.pageCredits ?? 20;
  const silverTokens = shopSettings?.iterationTokens ?? 100;

  return (
    <div className="pm-token-group-wrapper" ref={tokenRef}>
      <div className="pm-token-pill">
        {/* Gold Tokens */}
        <div className="pm-token-item" title="Full-Page Generation Credits">
          <div className="pm-token-coin--gold">G</div>
          <span className="pm-token-count">{goldCredits}</span>
          <span className="pm-token-label">credits</span>
        </div>

        <div className="pm-token-divider" />

        {/* Silver Tokens */}
        <div className="pm-token-item" title="Section Re-rolls & Micro-Edits">
          <div className="pm-token-coin--silver">S</div>
          <span className="pm-token-count">{silverTokens}</span>
          <span className="pm-token-label">tokens</span>
        </div>

        {/* Info Icon Button */}
        <button
          type="button"
          onClick={() => setShowTokenInfo(!showTokenInfo)}
          className={`pm-token-info-btn ${showTokenInfo ? "pm-token-info-btn--active" : ""}`}
          title="What are Gold and Silver tokens?"
        >
          <Info size={16} />
        </button>
      </div>

      {/* Info Popover Modal matching Dashboard */}
      {showTokenInfo && (
        <div className="pm-token-popover">
          <div className="pm-popover-header">
            <h4 className="pm-popover-title">Token Balance & Usage</h4>
            <button
              type="button"
              onClick={() => setShowTokenInfo(false)}
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
                  Used for generating complete, full-page store layouts with high-reasoning AI (<strong>5 credits</strong> per full page).
                </p>
              </div>
            </div>

            {/* Silver Token Info */}
            <div className="pm-popover-item">
              <div className="pm-token-coin--silver" style={{ flexShrink: 0 }}>S</div>
              <div className="pm-popover-item-content">
                <h5 className="pm-popover-item-title">Silver Tokens</h5>
                <p className="pm-popover-item-desc">
                  Used for sub-second section re-rolls, headline rewrites, and AI micro-edits in the studio editor (<strong>2 tokens</strong> per edit).
                </p>
              </div>
            </div>

            {/* Weekly Refresh Notice */}
            <div
              style={{
                marginTop: "4px",
                padding: "8px 12px",
                background: "#F8FAFC",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                fontSize: "12px",
                color: "#475569",
                lineHeight: "1.4",
              }}
            >
              🔄 Both Gold credits and Silver tokens automatically refresh <strong>weekly</strong>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
