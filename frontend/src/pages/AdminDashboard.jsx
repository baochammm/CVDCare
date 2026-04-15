import { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUser,
  getUserHealthData,
  restoreHealthData,
  getAllRequests,
  updateRequestStatus,
  deleteRequest 
} from "../lib/api";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [healthData, setHealthData] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [supportRequests, setSupportRequests] = useState([]);
  const [requestToDelete, setRequestToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchSupportRequests();
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

  const handleDeleteUser = async () => {
    await deleteUser(userToDelete);
    setUserToDelete(null);
    document.getElementById("delete_user_modal").close(); 
    fetchUsers();
    toast.success("User deleted successfully!");
  };

    const confirmDeleteUser = (id) => {
    setUserToDelete(id);
    document.getElementById("delete_user_modal").showModal();
  };

  const handleRestoreRecord = async (id) => {
    try {
      await restoreHealthData(id);
      const res = await getUserHealthData(selectedUser._id);
      const sorted = res.data.healthData.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setHealthData(sorted);
      toast.success("Record restored successfully!");
    } catch (err) {
      toast.error("Failed to restore record");
    }
  };

  const fetchSupportRequests = async () => {
    const res = await getAllRequests();
    setSupportRequests(res.data);
  };

  const handleStatusChange = async (id, status) => {
    await updateRequestStatus(id, status);
    fetchSupportRequests();
    toast.success(`Status updated to ${status}!`);
  };

  const handleDeleteRequest = async () => {
    try {
      await deleteRequest(requestToDelete);
      toast.success("Request deleted successfully!");
      setRequestToDelete(null);
      document.getElementById("delete_request_modal").close();
      fetchSupportRequests();
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold font-mono bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Admin Dashboard
      </h1>

      {/* USERS TABLE */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Users</h2>

          <div className="overflow-x-auto">
            <table className="table text-xl">
              <thead className="bg-gray-200 text-lg font-semibold">
                <tr>
                  <th className="bg-gray-300">User Name</th>
                  <th className="bg-gray-300">Display Name</th>
                  <th className="bg-gray-300">Email</th>
                  <th className="bg-gray-300">Role</th>
                  <th className="bg-gray-300">City</th>
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
                      <td>{u.displayName}</td>
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
                      <td>{u.city}</td>
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
                  <th>Active</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {healthData.map((h, index) => (
                  <tr key={h._id} className={h.isDeleted ? "opacity-50" : ""}>
                    <td>{index + 1}</td>
                    <td>
                      <span className={`badge min-w-max px-3 py-1 ${
                        h.risk_level === "high risk" ? "badge-error" :
                        h.risk_level === "medium risk" ? "badge-warning" : "badge-success"
                      }`}>
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
                    <td>
                      <span className={`badge ${h.isDeleted ? "badge-error" : "badge-success"}`}>
                        {h.isDeleted ? "Deleted" : "Active"}
                      </span>
                    </td>
                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                    <td>{new Date(h.updatedAt).toLocaleString()}</td>
                    <td>
                      {h.isDeleted && (
                        <button
                          className="btn btn-xs btn-success"
                          onClick={() => handleRestoreRecord(h._id)}
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!healthData.length && (
                  <tr>
                    <td colSpan="18" className="text-center opacity-60">
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
          <p className="py-4">This will permanently remove this user and all predictions.</p>

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

      {/* SUPPORT REQUESTS */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Support Requests</h2>
          <div className="overflow-x-auto">
            <table className="table text-xl">
              <thead className="bg-gray-200 text-lg font-semibold">
                <tr>
                  <th className="bg-gray-300">#</th>
                  <th className="bg-gray-300">User</th>
                  <th className="bg-gray-300">Email</th>
                  <th className="bg-gray-300">Message</th>
                  <th className="bg-gray-300">Status</th>
                  <th className="bg-gray-300">Date</th>
                  <th className="bg-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supportRequests.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center opacity-60">No support requests</td>
                  </tr>
                )}
                {supportRequests.map((req, idx) => (
                  <tr key={req._id}>
                    <td>{idx + 1}</td>
                    <td>{req.user?.userName}</td>
                    <td>{req.user?.email}</td>
                    <td className="max-w-xs">{req.message}</td>
                    <td>
                      <select
                        className="select select-bordered select-sm"
                        value={req.status}
                        onChange={(e) => handleStatusChange(req._id, e.target.value)}
                      >
                        <option value="processing">Processing</option>
                        <option value="processed">Processed</option>
                      </select>
                    </td>
                    <td>{new Date(req.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => {
                          setRequestToDelete(req._id);
                          document.getElementById("delete_request_modal").showModal();
                        }}
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
      
      {/* DELETE REQUEST CONFIRM MODAL */}
      <dialog id="delete_request_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Request?</h3>
          <p className="py-4">This will permanently delete this support request.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>
            <button className="btn btn-error" onClick={handleDeleteRequest}>
              Delete
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default AdminDashboard;

