import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, changePassword, deleteAccount } from "../lib/api";
import { User, Lock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile form
  const [profileForm, setProfileForm] = useState({ displayName: "", city: "" });

  // Change password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Delete account
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        setProfileForm({
          displayName: res.data.displayName || res.data.userName,
          city: res.data.city || "",
        });
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(profileForm);
      toast.success("Profile updated successfully!");
            await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      const res = await getProfile();
      setProfile(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount({ password: deletePassword });
      toast.success("Account deleted successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">

        <h1 className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          My Profile
        </h1>

        {/* PROFILE INFO */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-primary" />
              <h2 className="card-title">Account Information</h2>
            </div>

            {/* Read-only fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Username</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-base-200"
                  value={profile?.userName || ""}
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-base-200"
                  value={profile?.email || ""}
                  disabled
                />
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Display Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">City</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4">
              <button className="btn btn-primary w-full" onClick={handleUpdateProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="text-primary" />
              <h2 className="card-title">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Current Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4">
              <button className="btn btn-primary w-full" onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* DELETE ACCOUNT */}
        <div className="card bg-base-100 shadow border border-error/30">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="text-error" />
              <h2 className="card-title text-error">Delete Account</h2>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              This action is permanent and cannot be undone. All your prediction history will be deleted.
            </p>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-semibold">Enter your password to confirm</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>

            <button
              className="btn btn-error w-full"
              onClick={() => document.getElementById("delete_account_modal").showModal()}
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* DELETE ACCOUNT CONFIRM MODAL */}
      <dialog id="delete_account_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Delete Account?</h3>
          <p className="py-4">
            This will permanently delete your account and all prediction history. This action cannot be undone.
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>
            <button className="btn btn-error" onClick={handleDeleteAccount}>
              Delete
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ProfilePage;