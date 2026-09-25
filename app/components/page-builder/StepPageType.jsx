import TokenBadge from "../TokenBadge";

export default function StepPageType({ pageType, setPageType, shopSettings }) {
  const types = [
    {
      id: "LANDING",
      name: "Landing Page",
      badge: "HERO & CAMPAIGN",
      emoji: "🚀",
      desc: "Create high-converting landing pages to showcase your products, collections or special marketing campaigns.",
    },
    {
      id: "HOME",
      name: "Home Page",
      badge: "STORE SHOWCASE",
      emoji: "🏪",
      desc: "Design a stunning homepage to make a memorable first impression and guide visitors to your best products.",
    },
    {
      id: "PRODUCT",
      name: "Product Page",
      badge: "PRODUCT HIGHLIGHT",
      emoji: "👟",
      desc: "Highlight your products with persuasive benefits, social proof, and high-impact purchase triggers.",
    },
    {
      id: "FAQ",
      name: "FAQ Page",
      badge: "QUESTIONS & TRUST",
      emoji: "💬",
      desc: "Answer common questions, reduce customer support tickets, and boost buyer confidence before checkout.",
    },
  ];

  return (
    <div>
      {/* Title Row with Title on Left and Token Badge on Right */}
      <div className="pm-wizard-title-row">
        <h1 className="pm-wizard-title">Build Your New Page</h1>
        <TokenBadge shopSettings={shopSettings} />
      </div>

      <p className="pm-wizard-subtitle">
        Choose the type of page you want to create. Each page uses{" "}
        <span className="pm-highlight-credits">5 credits</span> and is designed to help you engage your
        customers and grow your store.
      </p>

      <div className="pm-page-types-grid">
        {types.map((t) => {
          const isSelected = pageType === t.id;
          return (
            <div
              key={t.id}
              className={`pm-type-card ${isSelected ? "pm-type-card--selected" : ""}`}
              onClick={() => setPageType(t.id)}
            >
              <div className="pm-card-radio">
                {isSelected && <div className="pm-card-radio-dot" />}
              </div>

              <div className="pm-type-illustration-box">
                <div style={{ textAlign: "center", padding: "10px" }}>
                  <div style={{ fontSize: "28px", marginBottom: "4px" }}>{t.emoji}</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#0052FF" }}>{t.badge}</div>
                </div>
              </div>

              <div className="pm-credit-tag">
                <span>🟡</span> 5 credits
              </div>

              <h3 className="pm-type-name">{t.name}</h3>
              <p className="pm-type-desc">{t.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
