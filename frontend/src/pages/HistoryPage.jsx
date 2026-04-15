import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { getMyHistory, deleteHealthData, updateHealthData } from "../lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recordToDelete, setRecordToDelete] = useState(null);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

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

  const handleDeleteRecord = async () => {
    try {
      await deleteHealthData(recordToDelete);
      setHistory((prev) => prev.filter((item) => item._id !== recordToDelete));
      setRecordToDelete(null);
      document.getElementById("delete_record_modal").close();
      toast.success("Record deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  const handleEditRecord = async () => {
    try {
      if (!editForm.age || !editForm.height || !editForm.weight || !editForm.ap_hi || !editForm.ap_lo || !editForm.cholesterol || !editForm.gluc || editForm.smoke === undefined || editForm.alco === undefined || editForm.active === undefined) {
        toast.error("Please fill in all required fields!");
        return;
      }
      await updateHealthData(recordToEdit._id, editForm);
      document.getElementById("edit_record_modal").close();
      toast.success("Health data updated successfully!");
      fetchHistory();
      setRecordToEdit(null);
      setEditForm({});
    } catch (err) {
      toast.error(`Cannot update: ${err.response?.data?.message || err.message}`);
    }
  };

  const chartData = history.map(item => ({
    date: new Date(item.updatedAt).getTime(),
    risk_score: item.risk_score * 100
  }));

  const formatRiskLevel = (riskLevel) => {
    if (!riskLevel) return "Unknown";
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
      <div className="border border-primary/25 w-full max-w-6xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-2 p-6 border-b border-primary/25">
          <History className="size-9 text-primary" />
          <h1 className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Your Prediction History
          </h1>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={item._id || idx}>
                      <td>{idx + 1}</td>
                      <td>{formatRiskLevel(item.risk_level)}</td>
                      <td>{(item.risk_score * 100).toFixed(2)}%</td>
                      <td>{item.top_factors.map(f => f.feature).join(", ")}</td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>{new Date(item.updatedAt).toLocaleString()}</td>
                      <td className="flex items-center space-x-2">
                        <button
                          className="btn btn-xs btn-warning"
                          onClick={() => {
                            setRecordToEdit(item);
                            setEditForm({
                              age: item.age,
                              gender: item.gender,
                              height: item.height,
                              weight: item.weight,
                              ap_hi: item.ap_hi,
                              ap_lo: item.ap_lo,
                              cholesterol: item.cholesterol,
                              gluc: item.gluc,
                              smoke: item.smoke,
                              alco: item.alco,
                              active: item.active,
                            });
                            document.getElementById("edit_record_modal").showModal();
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-error"
                          onClick={() => {
                            setRecordToDelete(item._id);
                            document.getElementById("delete_record_modal").showModal();
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* CHART */}
        <div className="mt-8 p-6">
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
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })
                  }
                />
                <YAxis
                  label={{ value: "Probability (%)", angle: -90, position: "insideLeft", offset: 10 }}
                />
                <Tooltip
                  labelFormatter={(ts) =>
                    new Date(ts).toLocaleString("en-GB", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                    })
                  }
                />
                <Legend />
                <Line type="monotone" dataKey="risk_score" stroke="#8884d8" activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      <dialog id="delete_record_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Record?</h3>
          <p className="py-4">This record will be deleted from your history. You can submit a Support Request to restore it if needed.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>
            <button className="btn btn-error" onClick={handleDeleteRecord}>
              Delete
            </button>
          </div>
        </div>
      </dialog>

      {/* EDIT MODAL */}
      <dialog id="edit_record_modal" className="modal">
        <div className="modal-box max-w-4xl">
          <h3 className="font-bold text-lg mb-6 border-b pb-2">Edit Health Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Age</span></label>
              <input type="number" className="input input-bordered w-full"
                value={editForm.age ?? ""}
                onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Gender</span></label>
              <select className="select select-bordered w-full"
                value={editForm.gender || "male"}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Height (cm)</span></label>
              <input type="number" className="input input-bordered w-full"
                value={editForm.height ?? ""}
                onChange={(e) => setEditForm({ ...editForm, height: Number(e.target.value) })}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Weight (kg)</span></label>
              <input type="number" className="input input-bordered w-full"
                value={editForm.weight ?? ""}
                onChange={(e) => setEditForm({ ...editForm, weight: Number(e.target.value) })}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Systolic BP (mmHg)</span></label>
              <input type="number" className="input input-bordered w-full"
                value={editForm.ap_hi ?? ""}
                onChange={(e) => setEditForm({ ...editForm, ap_hi: Number(e.target.value) })}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Diastolic BP (mmHg)</span></label>
              <input type="number" className="input input-bordered w-full"
                value={editForm.ap_lo ?? ""}
                onChange={(e) => setEditForm({ ...editForm, ap_lo: Number(e.target.value) })}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Cholesterol</span></label>
              <select className="select select-bordered w-full"
                value={editForm.cholesterol || 1}
                onChange={(e) => setEditForm({ ...editForm, cholesterol: Number(e.target.value) })}
              >
                <option value={1}>Normal</option>
                <option value={2}>Above Normal</option>
                <option value={3}>Well Above Normal</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Glucose</span></label>
              <select className="select select-bordered w-full"
                value={editForm.gluc || 1}
                onChange={(e) => setEditForm({ ...editForm, gluc: Number(e.target.value) })}
              >
                <option value={1}>Normal</option>
                <option value={2}>Above Normal</option>
                <option value={3}>Well Above Normal</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Smoking</span></label>
              <select className="select select-bordered w-full"
                value={String(editForm.smoke)}
                onChange={(e) => setEditForm({ ...editForm, smoke: e.target.value === "true" })}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Alcohol Consumption</span></label>
              <select className="select select-bordered w-full"
                value={String(editForm.alco)}
                onChange={(e) => setEditForm({ ...editForm, alco: e.target.value === "true" })}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Physical Activity</span></label>
              <select className="select select-bordered w-full"
                value={String(editForm.active)}
                onChange={(e) => setEditForm({ ...editForm, active: e.target.value === "true" })}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>

          <div className="modal-action mt-8">
            <button type="button" className="btn btn-ghost"
              onClick={() => document.getElementById("edit_record_modal").close()}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-primary px-10" onClick={handleEditRecord}>
              Save & Predict Again
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default HistoryPage;