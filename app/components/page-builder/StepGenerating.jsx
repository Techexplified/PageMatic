import { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";

export default function StepGenerating({
  isSubmitting,
  actionData,
  pageTitle,
  onRetry,
  onBack,
}) {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(1); // 1: Reading, 2: Generating, 3: Optimizing, 4: Finalizing
  const [isDone, setIsDone] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const stages = [
    { id: 1, label: "Reading your input" },
    { id: 2, label: "Generating your page" },
    { id: 3, label: "Optimizing design" },
    { id: 4, label: "Finalizing everything" },
  ];

  // Stage progression timer
  useEffect(() => {
    if (actionData?.error && !isRetrying) return;

    setActiveStage(1);
    setIsDone(false);

    const timer1 = setTimeout(() => setActiveStage(2), 1800);
    const timer2 = setTimeout(() => setActiveStage(3), 7500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [actionData?.error, isRetrying]);

  // When actionData changes, reset retry flag
  useEffect(() => {
    if (actionData) {
      setIsRetrying(false);
    }
  }, [actionData]);

  // Handle Retry click: reset stages and trigger submission
  const handleRetryClick = () => {
    setIsRetrying(true);
    setActiveStage(1);
    setIsDone(false);
    onRetry();
  };

  // When action completes successfully
  useEffect(() => {
    if (actionData?.success && actionData?.page) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pagematic_generated_page", JSON.stringify(actionData.page));
        localStorage.setItem("pagematic_generated_page", JSON.stringify(actionData.page));
        localStorage.setItem("pagematic_live_preview", JSON.stringify(actionData.page));
      }
      setActiveStage(4);
      const doneTimer = setTimeout(() => {
        setIsDone(true);
        // Smoothly redirect to editor
        setTimeout(() => {
          navigate(`/app/editor?pageId=${actionData.pageId || "temp"}`);
        }, 500);
      }, 800);

      return () => clearTimeout(doneTimer);
    }
  }, [actionData, navigate]);

  const hasError = !isRetrying && !isSubmitting && actionData?.error;

  return (
    <div className="pm-generating-container">
      {/* Centered 3D Illustration */}
      <div className="pm-generating-illustration-wrap">
        <img
          src="/loading-screen-img.png"
          alt="Generating Page"
          className="pm-generating-img"
        />
      </div>

      {/* Main Title */}
      <h1 className="pm-generating-title">Building your new page...</h1>

      {/* Error state if generation failed */}
      {hasError ? (
        <div className="pm-generating-error-card">
          <AlertCircle size={20} color="#DC2626" />
          <div style={{ flex: 1 }}>
            <p className="pm-generating-error-title">Generation failed</p>
            <p className="pm-generating-error-msg">{actionData.error}</p>
          </div>
          <div className="pm-generating-error-actions">
            <button type="button" className="pm-btn-secondary" onClick={onBack}>
              Go Back
            </button>
            <button type="button" className="pm-btn-primary" onClick={handleRetryClick}>
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 4-Step Stepper */}
          <div className="pm-stepper-container">
            {stages.map((stage, idx) => {
              const isCompleted = isDone || activeStage > stage.id;
              const isActive = !isDone && activeStage === stage.id;
              const isPending = !isDone && activeStage < stage.id;

              return (
                <div key={stage.id} className="pm-stepper-item-wrap">
                  {/* Step item with node & label */}
                  <div className="pm-stepper-item">
                    <div
                      className={`pm-stepper-node ${
                        isCompleted
                          ? "pm-stepper-node--completed"
                          : isActive
                          ? "pm-stepper-node--active"
                          : "pm-stepper-node--pending"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} strokeWidth={3} color="#FFFFFF" />
                      ) : isActive ? (
                        <div className="pm-stepper-pulse-dot" />
                      ) : null}
                    </div>

                    <span
                      className={`pm-stepper-label ${
                        isCompleted || isActive
                          ? "pm-stepper-label--active"
                          : "pm-stepper-label--pending"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>

                  {/* Connector Line to next step */}
                  {idx < stages.length - 1 && (
                    <div
                      className={`pm-stepper-line ${
                        activeStage > stage.id
                          ? "pm-stepper-line--completed"
                          : "pm-stepper-line--pending"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Subtitle */}
          <p className="pm-generating-subtitle">
            This usually takes under a minute.
          </p>

          {/* Credit Info Box */}
          <div className="pm-generating-credit-card">
            <div className="pm-coin-circle-wrap">
              <span style={{ fontSize: "16px" }}>🪙</span>
            </div>

            <div className="pm-credit-divider" />

            <div className="pm-credit-text-wrap">
              <span className="pm-credit-bold-text">
                Using 5 credits for this page
              </span>
              <span className="pm-credit-subtext">
                Each page you create uses 5 credits.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
