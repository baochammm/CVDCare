import { useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { predictHealth, getLatestPrediction, getProfile, getNearbyHospitals } from "../lib/api";
import { getErrorMessage } from "../lib/getErrorMessage";
import { useState } from "react";
import toast from "react-hot-toast";

const FEATURE_DESCRIPTIONS = {
  "Age": "Your age in years. The risk of cardiovascular diseases generally increases as you get older.",
  "Body Mass Index (BMI)": "A measure of body fat based on your height and weight. Higher BMI may indicate overweight or obesity, which can increase the risk of heart disease and other health problems.",
  "Mean Arterial Pressure": "The average pressure in your arteries during one heartbeat cycle. It reflects how well blood is being delivered to your organs. Higher values may indicate increased strain on your blood vessels.",
  "Pulse Pressure": "The difference between your systolic and diastolic blood pressure. Abnormal values may indicate issues with arterial stiffness or heart function.",
  "Lifestyle Risk Score": "A combined score based on smoking, alcohol consumption, and physical inactivity. A higher score indicates a less healthy lifestyle and a greater risk of cardiovascular disease.",
  "Hypertension Stage": "A classification of your blood pressure level (from normal to hypertensive crisis) based on your systolic and diastolic readings. Higher stages indicate more severe high blood pressure and greater health risks.",
  "Cholesterol & Glucose Interaction": "A combined indicator of your cholesterol and blood sugar levels. High values in both can significantly increase the risk of heart disease and metabolic disorders.",
  "Gender": "Your biological sex. Certain cardiovascular risks may vary between males and females due to hormonal and physiological differences.",
  "Cholesterol Level": "Your cholesterol level (normal, above normal, or well above normal). High cholesterol can lead to plaque buildup in arteries and increase the risk of heart disease.",
  "Blood Glucose Level": "Your blood sugar level. Elevated glucose may indicate diabetes or insulin resistance, which are major risk factors for cardiovascular disease.",
  "Smoking": "Indicates whether you smoke. Smoking damages blood vessels and significantly increases the risk of heart disease and stroke.",
  "Alcohol Consumption": "Indicates whether you consume alcohol. Excessive alcohol intake can raise blood pressure and contribute to heart and liver diseases.",
  "Physical Activity": "Indicates whether you engage in regular physical activity. Staying active helps maintain heart health, while inactivity increases the risk of cardiovascular problems.",
};

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputData = location.state;

  const [activeModal, setActiveModal] = useState(null); // null | "factors" | "recommendations" | "hospitals"
  const [activeTooltip, setActiveTooltip] = useState(null);

  const [hospitals, setHospitals] = useState([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [hospitalError, setHospitalError] = useState(null);
  const [userCity, setUserCity] = useState("");

  const {
    data: newResult,
    isLoading: predictLoading,
    isError: predictIsError,
    error: predictError,
  } = useQuery({
    queryKey: ["prediction", inputData],
    queryFn: async () => {
      const res = await predictHealth(inputData);
      return res.data.predictionResult;
    },
    enabled: !!inputData,
  });

  const {
    data: latestResult,
    isLoading: latestLoading,
    isError: latestIsError,
    error: latestError,
  } = useQuery({
    queryKey: ["latestPrediction"],
    queryFn: async () => {
      const res = await getLatestPrediction();
      return res.data ?? null;
    },
    enabled: !inputData,
  });

  const result = inputData ? newResult : latestResult;
  const loading = inputData ? predictLoading : latestLoading;
  const isError = inputData ? predictIsError : latestIsError;
  const error = inputData ? predictError : latestError;
  const noData = !inputData && !latestLoading && !latestResult;
  const isLatest = !inputData && !!latestResult;

  const fetchNearbyHospitals = async () => {
    setActiveModal("hospitals");
    setHospitalLoading(true);
    setHospitalError(null);
    setHospitals([]);

    try {
      const profileRes = await getProfile();
      const loc = profileRes.data?.city;

      if (!loc?.lat || !loc?.lng) {
        setHospitalError("no_location");
        setHospitalLoading(false);
        return;
      }

      setUserCity(loc.formattedAddress || "your city");
      const res = await getNearbyHospitals(loc.lat, loc.lng);
      const results = res.data?.hospitals || [];
      setHospitals(results);
      if (results.length === 0) setHospitalError("no_results");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setHospitalError("fetch_failed");
    } finally {
      setHospitalLoading(false);
    }
  };

  const handlePrint = () => {
    if (!result) return;

    const riskLevelTextPrint = result.risk_level
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const printContent = `
      <div style="font-family: sans-serif; padding: 40px; max-width: 680px; margin: 0 auto; color: #333;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">CVD Risk Prediction Result</h1>
        <p style="font-size: 12px; color: #888; margin-bottom: 24px;">
          Generated on ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; margin-top: 0;">Prediction Result</h2>
          <p style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">${riskLevelTextPrint}</p>
          <p style="font-size: 14px; color: #555;">Risk Probability: ${(result.risk_score * 100).toFixed(2)}%</p>
        </div>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; margin-top: 0;">Top 3 Key Factors</h2>
          ${result.top_factors?.map((f, idx) => `
            <div style="margin-bottom: 10px;">
              <p style="font-weight: bold; margin-bottom: 2px;">${idx + 1}. ${f.feature}</p>
              <p style="font-size: 13px; color: #555;">${f.description || ""}</p>
            </div>
          `).join("")}
        </div>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; margin-top: 0;">Recommendations</h2>
          <ul style="padding-left: 16px; font-size: 13px; color: #444; line-height: 1.8;">
            ${result.recommendations?.length
              ? result.recommendations.map((rec) => `<li>${rec}</li>`).join("")
              : "<li>No recommendations available.</li>"
            }
          </ul>
        </div>
        <div style="background: #f9fafb; border-radius: 8px; padding: 12px;">
          <p style="font-size: 11px; color: #888; line-height: 1.6; margin: 0;">
            Disclaimer: These results are estimates generated by an AI-based prediction model
            and should be interpreted as one factor in assessing your cardiovascular risk.
            They are not a substitute for professional medical diagnosis. Please consult a
            qualified healthcare provider for medical advice.
          </p>
        </div>
      </div>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>CVD Risk Prediction Result</title></head><body>${printContent}</body></html>`);
    doc.close();
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 1000);
    }, 300);
  };

  // --- Render states ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  if (noData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <p className="text-red-600 mb-4 text-lg">
          No data entered. Please fill in your information to receive a prediction.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/predict")}>
          Back to Prediction
        </button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-red-600 mb-4">{getErrorMessage(error)}</p>
        <button className="btn btn-primary" onClick={() => navigate("/predict")}>
          Try Again
        </button>
      </div>
    );
  }

  const riskLevel = result.risk_level;
  const riskLevelText = riskLevel
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const riskColors = {
    "low risk": "text-green-500",
    "medium risk": "text-yellow-500",
    "high risk": "text-red-500",
  };
  const riskColorClass = riskColors[riskLevel] || "text-gray-500";

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
          <h1 className="text-4xl font-bold text-primary mb-6">Prediction Result</h1>

          {isLatest && (
            <p className="text-sm text-gray-400 mb-4">Showing your latest prediction</p>
          )}

          <p className="text-lg mb-6">Based on your health data, our system predicts that:</p>

          <h2 className={`text-3xl font-semibold mb-3 ${riskColorClass}`}>{riskLevelText}</h2>

          {riskLevel === "high risk" && (
            <p className="text-gray-600 mb-4">
              You are at high risk of cardiovascular disease. Please consult a healthcare professional immediately.
            </p>
          )}
          {riskLevel === "medium risk" && (
            <p className="text-gray-700 mb-4">
              You are at medium risk of cardiovascular disease. Consider lifestyle changes and regular check-ups.
            </p>
          )}
          {riskLevel === "low risk" && (
            <p className="text-gray-600 mb-4">
              You are at low risk of cardiovascular disease. Keep maintaining a healthy lifestyle and regular check-ups.
            </p>
          )}

          <p className="text-base text-gray-500 mb-6">
            Risk Probability: {(result.risk_score * 100).toFixed(2)}%
          </p>

          <button className="btn btn-primary w-full mb-2" onClick={() => navigate("/predict")}>Back to Prediction</button>
          <button className="btn btn-primary w-full mb-2" onClick={() => navigate("/history")}>Go to History</button>
          <button className="btn btn-primary w-full mb-2" onClick={() => setActiveModal("factors")}>View Key Factors</button>
          <button className="btn btn-primary w-full mb-2" onClick={() => setActiveModal("recommendations")}>View Recommendations</button>
          <button className="btn btn-primary w-full mb-2" onClick={fetchNearbyHospitals}>Find Local Hospitals</button>
          <button className="btn btn-primary w-full" onClick={handlePrint}>Print Results</button>
        </div>
      </div>

      {/* KEY FACTORS MODAL */}
      {activeModal === "factors" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full text-center">
            <h3 className="text-4xl font-bold mb-4">Top 3 Factors</h3>
            <div className="flex flex-col gap-3 items-center font-medium">
              {result.top_factors.map((f, idx) => (
                <div key={idx} className="w-full">
                  <div
                    className="border border-primary text-primary rounded-full text-base px-6 py-2 w-full cursor-pointer hover:bg-primary hover:text-white transition-colors duration-150 flex items-center justify-between gap-2"
                    onClick={() => setActiveTooltip(activeTooltip === idx ? null : idx)}
                  >
                    <span>{f.feature}</span>
                    <span className="text-xs opacity-60 shrink-0">
                      {activeTooltip === idx ? "▲" : "▼"}
                    </span>
                  </div>
                  {activeTooltip === idx && (
                    <div className="mt-1 bg-gray-100 text-gray-700 text-sm rounded-lg px-4 py-3 text-left leading-relaxed border border-gray-200">
                      {FEATURE_DESCRIPTIONS[f.feature] || f.description || "No description available."}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-4">Click on each factor to learn more</p>
            <button
              className="btn btn-primary mt-6"
              onClick={() => { setActiveModal(null); setActiveTooltip(null); }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS MODAL */}
      {activeModal === "recommendations" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full text-center">
            <h3 className="text-4xl font-bold mb-4">Recommendations</h3>
            <ul className="list-none max-h-64 overflow-y-auto text-left text-lg leading-relaxed space-y-2">
              {result.recommendations?.length ? (
                result.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)
              ) : (
                <li>No recommendations available.</li>
              )}
            </ul>
            <button className="btn btn-primary mt-4" onClick={() => setActiveModal(null)}>Close</button>
          </div>
        </div>
      )}

      {/* HOSPITALS MODAL */}
      {activeModal === "hospitals" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full text-center">
            <h3 className="text-2xl font-bold mb-4">Recommended Hospitals</h3>

            {hospitalLoading && (
              <div className="flex justify-center py-6">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            )}

            {!hospitalLoading && hospitalError === "no_location" && (
              <div className="py-4">
                <p className="text-gray-600 mb-4">
                  Please update your city in Profile to see list of hospitals in your area.
                </p>
                <button className="btn btn-primary"
                  onClick={() => { setActiveModal(null); navigate("/profile"); }}>
                  Go to Profile
                </button>
              </div>
            )}

            {!hospitalLoading && hospitalError === "fetch_failed" && (
              <p className="text-red-500 py-4">Failed to load hospitals. Please try again later.</p>
            )}

            {!hospitalLoading && hospitalError === "no_results" && (
              <p className="text-gray-500 py-4">No hospitals found within 50km of your city.</p>
            )}

            {!hospitalLoading && !hospitalError && hospitals.length > 0 && (
              <>
                <p className="text-sm text-gray-400 mb-4 text-left">
                  Search area: <span className="font-medium text-gray-600">{userCity}</span>
                </p>
                <ul className="space-y-3 max-h-80 overflow-y-auto text-left">
                  {hospitals.map((h, idx) => (
                    <li key={idx} className="border border-gray-100 rounded-lg p-3">
                      <p className="font-semibold text-gray-800">{h.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{h.address}</p>

                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${h.lat},${h.lng},17z`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        🔗 View on map
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <button className="btn btn-primary mt-6 w-full" onClick={() => setActiveModal(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultPage;