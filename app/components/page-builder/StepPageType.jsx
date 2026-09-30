import TokenBadge from "../TokenBadge";
import {
  LandingPageIllustration,
  HomePageIllustration,
  ProductPageIllustration,
  FaqPageIllustration,
} from "./PageTypeIllustrations";

export default function StepPageType({ pageType, setPageType, shopSettings }) {
  const types = [
    {
      id: "LANDING",
      name: "Landing Page",
      badge: "HERO & CAMPAIGN",
      illustration: <LandingPageIllustration />,
      desc: "Create high-converting landing pages to showcase your products and campaigns.",
    },
    {
      id: "HOME",
      name: "Home Page",
      badge: "STORE SHOWCASE",
      illustration: <HomePageIllustration />,
      desc: "Design a stunning homepage to make a great first impression on your visitors.",
    },
    {
      id: "PRODUCT",
      name: "Product Page",
      badge: "PRODUCT HIGHLIGHT",
      illustration: <ProductPageIllustration />,
      desc: "Highlight your products with professional and persuasive product pages.",
    },
    {
      id: "FAQ",
      name: "FAQ Page",
      badge: "QUESTIONS & TRUST",
      illustration: <FaqPageIllustration />,
      desc: "Answer common questions, reduce support requests, and boost customer confidence.",
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
                {t.illustration}
              </div>

              <div className="pm-credit-tag">
                <div className="pm-token-coin--gold" style={{ width: "16px", height: "16px", fontSize: "9px" }}>G</div>
                <span>5 credits</span>
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
