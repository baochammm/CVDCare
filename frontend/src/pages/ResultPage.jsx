import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { predictHealth, getLatestPrediction } from "../lib/api";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputData = location.state;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noData, setNoData] = useState(false);
  const [showFactors, setShowFactors] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLatest, setIsLatest] = useState(false);

  useEffect(() => {
    if (!inputData) {
      fetchLatestPrediction();
      return;
    }
    fetchPrediction();
  }, [inputData]);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      const res = await predictHealth(inputData);
      setResult(res.data.predictionResult);
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Unable to fetch prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestPrediction = async () => {
    try {
      setLoading(true);
      const res = await getLatestPrediction();
      if (res.data) {
        setResult(res.data);
        setIsLatest(true);
      } else {
        setNoData(true);
      }
    } catch (err) {
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-red-600 mb-4">{error}</p>
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-primary mb-6">
          Prediction Result
        </h1>

        {/* Badge hiện khi đang xem latest từ DB, không phải fresh result */}
        {isLatest && (
          <div className="badge badge-warning mb-4">
            Showing your latest prediction
          </div>
        )}

        <p className="text-lg mb-6">
          Based on your health data, our system predicts that:
        </p>

        <h2 className={`text-3xl font-semibold mb-3 ${riskColorClass}`}>
          {riskLevelText}
        </h2>

        {riskLevel === "high risk" && (
          <p className="text-gray-600 mb-4">
            You are at high risk of cardiovascular disease. Please consult a
            healthcare professional immediately.
          </p>
        )}
        {riskLevel === "medium risk" && (
          <p className="text-gray-700 mb-4">
            You are at medium risk of cardiovascular disease. Consider lifestyle
            changes and regular check-ups.
          </p>
        )}
        {riskLevel === "low risk" && (
          <p className="text-gray-600 mb-4">
            You are at low risk of cardiovascular disease. Keep maintaining a
            healthy lifestyle and regular check-ups.
          </p>
        )}

        <p className="text-base text-gray-500 mb-6">
          Risk Probability: {(result.risk_score * 100).toFixed(2)}%
        </p>

        <button
          className="btn btn-primary w-full mb-2"
          onClick={() => navigate("/predict")}
        >
          Back to Prediction
        </button>

        <button
          className="btn btn-primary w-full mb-2"
          onClick={() => navigate("/history")}
        >
          Go to History
        </button>

        <button
          className="btn btn-primary w-full mb-2"
          onClick={() => setShowFactors(true)}
        >
          View Key Factors
        </button>

        {showFactors && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full text-center">
              <h3 className="text-4xl font-bold mb-4">Top 3 Factors</h3>
              <div className="flex flex-col gap-4 items-center text-xl font-medium">
                {result.top_factors.map((f, idx) => (
                  <div
                    key={idx}
                    className="tooltip tooltip-bottom w-full"
                    data-tip={f.description}
                  >
                    <span className="badge badge-primary badge-outline text-xl px-6 py-3 w-full">
                      {f.feature}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Hover over each factor to learn more
              </p>
              <button
                className="btn btn-primary mt-6"
                onClick={() => setShowFactors(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <button
          className="btn btn-primary w-full"
          onClick={() => setShowRecommendations(true)}
        >
          View Recommendations
        </button>

        {showRecommendations && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full text-center">
              <h3 className="text-4xl font-bold mb-4">Recommendations</h3>
              <ul className="list-none max-h-64 overflow-y-auto text-left text-lg leading-relaxed space-y-2">
                {result.recommendations?.length ? (
                  result.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))
                ) : (
                  <li>No recommendations available.</li>
                )}
              </ul>
              <button
                className="btn btn-primary mt-4"
                onClick={() => setShowRecommendations(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
