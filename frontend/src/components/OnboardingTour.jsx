import { useState, useEffect } from "react";

const TOUR_STEPS = [
  {
    id: "welcome",
    title: "Welcome to CVD Care",
    description:
      "Let us walk you through the key features of the app. It only takes about 30 seconds!",
    highlight: null,
  },
  {
    id: "predict",
    title: "Predict: Assess Your Cardiovascular Risk",
    description:
      "Enter your health information to receive an AI-powered cardiovascular risk assessment.",
    highlight: "sidebar-predict",
  },
  {
    id: "results",
    title: "Results: View Your Analysis",
    description:
      "After a prediction, your detailed results and personalised lifestyle recommendations will be displayed here.",
    highlight: "sidebar-results",
  },
  {
    id: "history",
    title: "History: Track Your Health Over Time",
    description:
      "Review all your previous check-ups. Trend charts help you monitor improvements over time.",
    highlight: "sidebar-history",
  },
  {
    id: "support",
    title: "Support Request: Contact Our Team",
    description:
      "Have a question or running into an issue? Submit a support request directly to our team here.",
    highlight: "sidebar-support",
  },
  {
    id: "profile",
    title: "Profile: Manage Your Account",
    description:
      "Click your account name in the top-right corner to access your Profile, where you can update personal information and security settings.",
    highlight: "topbar-profile",
  },
];

const OnboardingTour = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("cvd_tour_done");
    if (!seen) {
      setTimeout(() => setVisible(true), 600);
    }
  }, []);

  const handleFinish = () => {
    sessionStorage.setItem("cvd_tour_done", "true");
    setVisible(false);
    onFinish?.();
  };

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) setStep((s) => s + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="CVD Care Onboarding Tour"
    >
      <div
        className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md mx-4 relative overflow-hidden"
        style={{ border: "1px solid rgba(74,108,247,0.15)" }}
      >
        {/* Top accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, #4A6CF7 ${
              ((step + 1) / TOUR_STEPS.length) * 100
            }%, rgba(74,108,247,0.15) 0%)`,
            transition: "background 0.4s ease",
          }}
        />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={handleFinish}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Skip tour"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Step badge */}
          <span
            className="inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-4"
            style={{
              background: "rgba(74,108,247,0.1)",
              color: "#4A6CF7",
            }}
          >
            Step {step + 1} of {TOUR_STEPS.length}
          </span>

          {/* Title */}
          <h2 className="text-lg font-semibold text-base-content leading-snug mb-3">
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            {current.description}
          </p>

          {/* Highlight hint */}
          {current.highlight && (
            <div
              className="flex items-center gap-2 text-xs rounded-lg px-3 py-2 mb-6"
              style={{
                background: "rgba(74,108,247,0.06)",
                color: "#4A6CF7",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"
                />
              </svg>
              {current.highlight === "topbar-profile"
                ? "Look at the top-right corner of the screen"
                : "Look at the left sidebar of the screen"}
            </div>
          )}

          {/* Dot indicators */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? "20px" : "6px",
                    height: "6px",
                    background:
                      i === step ? "#4A6CF7" : "rgba(74,108,247,0.25)",
                  }}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={handleBack}
                  className="btn btn-sm btn-ghost text-gray-500"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="btn btn-sm text-white font-medium px-5"
                style={{ background: "#4A6CF7", border: "none" }}
              >
                {isLast ? "Get started" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
