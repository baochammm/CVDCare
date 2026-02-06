import { useEffect, useState } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";
import axios from "axios";

const AdminPage = () => {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = "http://localhost:5001/api/admin"; // 🔹 đổi port nếu backend khác

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const url =
          tab === "users" ? `${API_BASE}/users` : `${API_BASE}/predictions`;
        const res = await axios.get(url, { withCredentials: true });
        tab === "users" ? setUsers(res.data) : setPredictions(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tab]);

  // Delete action
  const handleDelete = async (id, type) => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      await axios.delete(`${API_BASE}/${type}/${id}`, { withCredentials: true });
      if (type === "user") setUsers(users.filter((u) => u._id !== id));
      else setPredictions(predictions.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const formatRiskLevel = (riskLevel) => {
    if (!riskLevel) return "Unknown";
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  };

  return (
    <div
      className="h-screen flex flex-col items-center justify-start p-4 sm:p-6 md:p-8"
      data-theme="corporate"
    >
      <div className="border border-primary/25 w-full max-w-6xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-auto">
        {/* HEADER */}
        <div className="flex items-center gap-3 p-6 border-b border-primary/25">
          <ShieldCheck className="size-9 text-primary" />
          <h1 className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Admin Dashboard
          </h1>
        </div>

        {/* TABS */}
        <div className="flex gap-4 px-6 py-4 border-b border-primary/10">
          <button
            className={`btn ${tab === "users" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTab("users")}
          >
            Manage Users
          </button>
          <button
            className={`btn ${
              tab === "predictions" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setTab("predictions")}
          >
            Manage Predictions
          </button>
        </div>

        {/* ERROR */}
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
            {/* USERS TABLE */}
            {tab === "users" && (
              <>
                {users.length === 0 ? (
                  <p className="text-center text-sm opacity-70">
                    No users found.
                  </p>
                ) : (
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, idx) => (
                        <tr key={u._id}>
                          <td>{idx + 1}</td>
                          <td>{u.username}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>
                            <button
                              onClick={() => handleDelete(u._id, "user")}
                              className="btn btn-sm btn-error text-white flex items-center gap-1"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {/* PREDICTIONS TABLE */}
            {tab === "predictions" && (
              <>
                {predictions.length === 0 ? (
                  <p className="text-center text-sm opacity-70">
                    No predictions available.
                  </p>
                ) : (
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Risk Level</th>
                        <th>Probability</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((p, idx) => (
                        <tr key={p._id}>
                          <td>{idx + 1}</td>
                          <td>{p.user?.email || "N/A"}</td>
                          <td>{formatRiskLevel(p.risk_level)}</td>
                          <td>{(p.risk_score * 100).toFixed(2)}%</td>
                          <td>
                            {new Date(p.createdAt).toLocaleString("en-GB")}
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                handleDelete(p._id, "prediction")
                              }
                              className="btn btn-sm btn-error text-white flex items-center gap-1"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
