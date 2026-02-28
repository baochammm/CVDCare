import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { getMyHistory } from "../lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getMyHistory();
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const chartData = history.map(item => ({
    date: new Date(item.updatedAt).getTime(),  
    risk_score: item.risk_score * 100
  }));

  const formatRiskLevel = (riskLevel) => {
    if (!riskLevel) return "Unknown";
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1); // "High risk"
  };

  return (
    <div className="h-screen flex flex-col items-center justify-start p-4 sm:p-6 md:p-8" data-theme="corporate">
      <div className="border border-primary/25 w-full max-w-6xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-auto">
        {/* HEADER */}
        <div className="flex items-center gap-2 p-6 border-b border-primary/25">
          <History className="size-9 text-primary" />
          <h1 className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Your Prediction History
          </h1>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="alert alert-error m-6">
            <span>{error}</span>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="p-6 overflow-x-auto">
            {history.length === 0 ? (
              <p className="text-center text-sm opacity-70">No history available.</p>
            ) : (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Checks</th>
                    <th>Prediction</th>
                    <th>Probability</th>
                    <th>Top Factors</th>
                    <th>Date Created</th>
                    <th>Date Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={item._id || idx}>
                      <td>{idx + 1}</td>
                      <td>{formatRiskLevel(item.risk_level)}</td>
                      <td>{(item.risk_score * 100).toFixed(2)}%</td>
                      {/* Top 3 factors (only names) */}
                      <td>{item.top_factors.map(f => f.feature).join(", ")}</td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>{new Date(item.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* CHART */}
        <div className="mt-8 p-6 overflow-y-auto">
          <div className="rounded-xl overflow-auto border border-primary/20 p-4 bg-base-100">
            <h2 className="text-2xl font-semibold mb-4 text-primary">
              CVD Risk Probability Over Time
            </h2>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  label={{ value: "Time", position: "insideBottom", offset: -5 }}
                  tickFormatter={(ts) =>
                    new Date(ts).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                />
                <YAxis
                  label={{
                    value: "Probability (%)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                  }}
                />
                <Tooltip
                  labelFormatter={(ts) =>
                    new Date(ts).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="risk_score"
                  stroke="#8884d8"
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
