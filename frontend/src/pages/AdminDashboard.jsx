import { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUser,
  getUserHealthData,
  deleteHealthData,
  updateHealthData,
} from "../lib/api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [healthData, setHealthData] = useState([]);

  const [userToDelete, setUserToDelete] = useState(null);
  const [predictionToDelete, setPredictionToDelete] = useState(null);

  const [healthDataToEdit, setHealthDataToEdit] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await getAllUsers();
    setUsers(res.data.users);
  };

  const handleViewPredictions = async (user) => {
    setSelectedUser(user);
    const res = await getUserHealthData(user._id);

    const sorted = res.data.healthData.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    setHealthData(sorted);
    document.getElementById("health_modal").showModal();
  };

  const confirmDeleteUser = (id) => {
    setUserToDelete(id);
    document.getElementById("delete_user_modal").showModal();
  };

  const handleDeleteUser = async () => {
    await deleteUser(userToDelete);
    setUserToDelete(null);
    document.getElementById("delete_user_modal").close(); 
    fetchUsers();
  };

  const confirmDeletePrediction = (id) => {
    setPredictionToDelete(id);
    document.getElementById("delete_prediction_modal").showModal();
  };

  const handleDeleteHealthData = async () => {
    await deleteHealthData(predictionToDelete);
    setHealthData((prev) => prev.filter((item) => item._id !== predictionToDelete));
    setPredictionToDelete(null);
    document.getElementById("delete_prediction_modal").close(); 
  };

  const handleUpdateHealthData = async () => {
      try {
        // Validate
        if (!editForm.age || !editForm.height || !editForm.weight || !editForm.ap_hi || !editForm.ap_lo || !editForm.cholesterol || !editForm.gluc || editForm.smoke === undefined || editForm.alco === undefined || editForm.active === undefined) {
          alert("Please fill in all required fields!");
          return;
        }
        await updateHealthData(healthDataToEdit._id, editForm);

        // Close modal
        document.getElementById("edit_health_modal").close();

        // Refresh data
        const res = await getUserHealthData(selectedUser._id);
        const sorted = res.data.healthData.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setHealthData(sorted);

        // Reset form
        setHealthDataToEdit(null);
        setEditForm({});
      } catch (error) {
        console.error("Update error:", error);
        alert(
          `Cannot update: ${error.response?.data?.message || error.message}`
        );
      }
    };
    
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>

      {/* USERS TABLE */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Users</h2>

          <div className="overflow-x-auto">
            <table className="table text-xl">
              <thead className="bg-gray-200 text-lg font-semibold">
                <tr>
                  <th className="bg-gray-300">User</th>
                  <th className="bg-gray-300">Email</th>
                  <th className="bg-gray-300">Role</th>
                  <th className="bg-gray-300">Created</th>
                  <th className="bg-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) => u.role !== "admin")
                  .map((u) => (
                    <tr key={u._id}>
                      <td>{u.userName}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === "admin"
                              ? "badge-error"
                              : "badge-ghost"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="space-x-2">
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleViewPredictions(u)}
                        >
                          View
                        </button>

                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => confirmDeleteUser(u._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* HEALTH DATA MODAL */}
      <dialog id="health_modal" className="modal">
        <div className="modal-box max-w-5xl">
          <h3 className="font-bold text-lg mb-4">
            Predictions - {selectedUser?.userName}
          </h3>

          <div className="overflow-x-auto max-h-[70vh]">
            <table className="table">
              <thead>
                <tr>
                  <th>Checks</th>
                  <th>Risk</th>
                  <th>Score</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Height</th>
                  <th>Weight</th>
                  <th>Systolic BP</th>
                  <th>Diastolic BP</th>
                  <th>Cholesterol</th>
                  <th>Glucose</th>
                  <th>Smoke</th>
                  <th>Alcohol</th>
                  <th>Physically Active</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {healthData.map((h, index) => (
                  <tr key={h._id}>
                    <td>{index + 1}</td>
                    <td>
                      <span
                        className={`badge min-w-max px-3 py-1 ${
                          h.risk_level === "high risk"
                            ? "badge-error"
                            : h.risk_level === "medium risk"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {h.risk_level}
                      </span>
                    </td>
                    <td>{(h.risk_score * 100).toFixed(1)}%</td>
                    <td>{h.gender === "female" ? "Female" : "Male"}</td>
                    <td>{h.age}</td>
                    <td>{h.height} cm</td>
                    <td>{h.weight} kg</td>
                    <td>{h.ap_hi} mmHg</td>
                    <td>{h.ap_lo} mmHg</td>
                    <td>{h.cholesterol}</td>
                    <td>{h.gluc}</td>
                    <td>{h.smoke ? "Yes" : "No"}</td>
                    <td>{h.alco ? "Yes" : "No"}</td>
                    <td>{h.active ? "Yes" : "No"}</td>
                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                    <td>{new Date(h.updatedAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-xs btn-warning"
                        onClick={() => {
                          setHealthDataToEdit(h);
                          setEditForm({
                            age: h.age,
                            gender: h.gender,
                            height: h.height,
                            weight: h.weight,
                            ap_hi: h.ap_hi,
                            ap_lo: h.ap_lo,
                            cholesterol: h.cholesterol,
                            gluc: h.gluc,
                            smoke: h.smoke,
                            alco: h.alco,
                            active: h.active,
                          });
                          document
                            .getElementById("edit_health_modal")
                            .showModal();
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => confirmDeletePrediction(h._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {!healthData.length && (
                  <tr>
                    <td colSpan="6" className="text-center opacity-60">
                      No predictions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <form method="dialog" className="modal-action">
            <button className="btn">Close</button>
          </form>
        </div>
      </dialog>

      {/* DELETE USER CONFIRM MODAL */}
      <dialog id="delete_user_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete User?</h3>
          <p className="py-4">This will remove this user and all predictions.</p>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>

            <button className="btn btn-error" onClick={handleDeleteUser}>
              Delete
            </button>
          </div>
        </div>
      </dialog>

      {/* DELETE PREDICTION CONFIRM MODAL */}
      <dialog id="delete_prediction_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Prediction?</h3>
          <p className="py-4">This action cannot be undone.</p>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>

            <button className="btn btn-error" onClick={handleDeleteHealthData}>
              Delete
            </button>
          </div>
        </div>
      </dialog>

      {/* EDIT HEALTH DATA MODAL */}
      <dialog id="edit_health_modal" className="modal">
        <div className="modal-box max-w-4xl">
          <h3 className="font-bold text-lg mb-6 border-b pb-2">
            Edit Health Data:{" "}
            <span className="text-primary">{selectedUser?.userName}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Age */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Age</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={editForm.age ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, age: Number(e.target.value) })
                }
              />
            </div>

            {/* Gender */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Gender</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editForm.gender || "male"}
                onChange={(e) =>
                  setEditForm({ ...editForm, gender: e.target.value })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Height */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Height (cm)</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={editForm.height ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, height: Number(e.target.value) })
                }
              />
            </div>

            {/* Weight */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Weight (kg)</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={editForm.weight ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, weight: Number(e.target.value) })
                }
              />
            </div>

            {/* Systolic BP */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Systolic BP (mmHg)
                </span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={editForm.ap_hi ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, ap_hi: Number(e.target.value) })
                }
              />
            </div>

            {/* Diastolic BP */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Diastolic BP (mmHg)
                </span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={editForm.ap_lo ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, ap_lo: Number(e.target.value) })
                }
              />
            </div>

            {/* Cholesterol */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Cholesterol</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editForm.cholesterol || 1}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    cholesterol: Number(e.target.value),
                  })
                }
              >
                <option value={1}>Normal</option>
                <option value={2}>Above Normal</option>
                <option value={3}>Well Above Normal</option>
              </select>
            </div>

            {/* Glucose */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Glucose</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editForm.gluc || 1}
                onChange={(e) =>
                  setEditForm({ ...editForm, gluc: Number(e.target.value) })
                }
              >
                <option value={1}>Normal</option>
                <option value={2}>Above Normal</option>
                <option value={3}>Well Above Normal</option>
              </select>
            </div>

            {/* Smoking */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Smoking</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={String(editForm.smoke)}
                onChange={(e) =>
                  setEditForm({ ...editForm, smoke: e.target.value === "true" })
                }
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {/* Alcohol */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Alcohol Consumption
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={String(editForm.alco)}
                onChange={(e) =>
                  setEditForm({ ...editForm, alco: e.target.value === "true" })
                }
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {/* Physical Activity */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Physical Activity
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={String(editForm.active)}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    active: e.target.value === "true",
                  })
                }
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="modal-action mt-8">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                document.getElementById("edit_health_modal").close()
              }
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary px-10"
              onClick={handleUpdateHealthData}
            >
              Save & Predict Again
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default AdminDashboard;
