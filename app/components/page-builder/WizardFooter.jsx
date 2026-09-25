import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export default function WizardFooter({
  currentStep,
  setCurrentStep,
  hasSufficientCredits,
  onSubmit,
}) {
  return (
    <footer className="pm-wizard-footer">
      <div>
        {currentStep === 1 ? (
          <Link to="/app/dashboard" className="pm-btn-secondary">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        ) : (
          <button
            type="button"
            className="pm-btn-secondary"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>

      <div>
        {currentStep < 3 ? (
          <button
            type="button"
            className="pm-btn-primary"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="pm-btn-primary"
            disabled={!hasSufficientCredits}
            onClick={onSubmit}
          >
            <Sparkles size={16} /> Generate Page →
          </button>
        )}
      </div>
    </footer>
  );
}
