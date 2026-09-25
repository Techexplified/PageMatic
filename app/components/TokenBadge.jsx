import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

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
    <div className="pm-token-pill-container" ref={tokenRef}>
      <div className="pm-token-pill">
        <div className="pm-token-item">
          <span className="pm-token-icon-gold">🟡</span>
          <span>You have {goldCredits} monthly credits</span>
        </div>
        <div className="pm-token-divider" />
        <div className="pm-token-item">
          <span className="pm-token-icon-silver">⚪</span>
          <span>{silverTokens} tokens</span>
        </div>
        <button
          type="button"
          className="pm-token-info-btn"
          onClick={() => setShowTokenInfo(!showTokenInfo)}
          title="Token balance details"
        >
          <Info size={15} />
        </button>
      </div>

      {/* Info Popover */}
      {showTokenInfo && (
        <div className="pm-token-popover">
          <div className="pm-popover-title">Understanding Your Tokens</div>
          <div className="pm-popover-row">
            <span>🟡</span>
            <div>
              <span className="pm-popover-tag">Gold Credits ({goldCredits})</span>
              <br />
              Used for generating complete new high-converting pages. Each full page uses <strong>5 credits</strong>.
            </div>
          </div>
          <div className="pm-popover-row">
            <span>⚪</span>
            <div>
              <span className="pm-popover-tag">Silver Tokens ({silverTokens})</span>
              <br />
              Used for section re-rolls and AI micro-edits in the studio editor. Each re-roll uses <strong>2 tokens</strong>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
