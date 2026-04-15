import { useState, useEffect } from "react";
import { Headphones } from "lucide-react";
import { createRequest, getMyRequests, deleteRequest } from "../lib/api";
import toast from "react-hot-toast";

const SupportRequestPage = () => {
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestToDelete, setRequestToDelete] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

    const fetchRequests = async () => {
    try {
        setLoading(true);
        const { data } = await getMyRequests();
        setRequests(data);
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch support requests");
    } finally {
        setLoading(false);
    }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
        await createRequest(message);
        toast.success("Support request sent successfully!");
        setMessage("");
        fetchRequests();
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to send request");
        toast.error("Failed to send support request. Please try again.");
    }
    };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusClass = (status) => {
    if (status === "done") return "badge badge-success";
    if (status === "processing") return "badge badge-warning";
    if (status === "closed") return "badge badge-ghost";
    return "badge badge-info";
  };

  const handleDeleteRequest = async () => {
    try {
      await deleteRequest(requestToDelete);
      toast.success("Request deleted successfully!");
      setRequestToDelete(null);
      document.getElementById("delete_request_modal").close();
      fetchRequests();
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-start p-4 sm:p-6 md:p-8" data-theme="corporate">
      <div className="border border-primary/25 w-full max-w-6xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-auto">

        {/* HEADER */}
        <div className="flex items-center gap-2 p-6 border-b border-primary/25">
          <Headphones className="size-9 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Support Request
            </h1>
            <p className="text-sm opacity-50 mt-0.5">If you have any request, send message here</p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-error m-6">
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <div className="p-6 border-b border-primary/25">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              className="textarea textarea-bordered w-full h-28 resize-none text-sm"
              placeholder="Enter your support request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!message.trim()}
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="p-6 overflow-x-auto">
            {requests.length === 0 ? (
              <p className="text-center text-sm opacity-70">No support requests yet.</p>
            ) : (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, idx) => (
                    <tr key={req._id || idx}>
                      <td>{idx + 1}</td>
                      <td className="max-w-md">{req.message}</td>
                      <td>
                        <span className={getStatusClass(req.status)}>
                          {formatStatus(req.status)}
                        </span>
                      </td>
                      <td>{new Date(req.createdAt).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-error"
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
            )}
          </div>
        )}

      </div>
        {/* DELETE CONFIRMATION MODAL */}
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

export default SupportRequestPage;