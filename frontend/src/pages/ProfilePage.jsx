import { useEffect, useState, useRef } from "react";
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

  const [profileForm, setProfileForm] = useState({
    displayName: "",
    city: { formattedAddress: "", lat: null, lng: null },
  });

  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  const debounceRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        const addr = res.data.city?.formattedAddress || "";
        setProfileForm({
          displayName: res.data.displayName || res.data.userName,
          city: res.data.city || { formattedAddress: "", lat: null, lng: null },
        });
        setLocationInput(addr);
        if (addr) setLocationSelected(true);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLocationInput = (value) => {
    setLocationInput(value);
    setLocationSelected(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        // Search only for cities
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&featuretype=city&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 400);
  };

  const handleSelectSuggestion = (item) => {
    // Only keep city + country (e.g. "Ho Chi Minh City, Vietnam")
    const addr = item.address;
    const city = addr?.city || addr?.town || addr?.municipality || addr?.county || item.display_name.split(",")[0].trim();
    const country = addr?.country || "";
    const formattedAddress = country ? `${city}, ${country}` : city;

    setLocationInput(formattedAddress);
    setLocationSelected(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setProfileForm((prev) => ({
      ...prev,
      city: {
        formattedAddress,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      },
    }));
  };

  const handleUpdateProfile = async () => {
    if (locationInput && !locationSelected) {
      toast.error("Please select a city from the suggestions");
      return;
    }
    try {
      await updateProfile({
        displayName: profileForm.displayName,
        city: locationSelected
          ? profileForm.city
          : { formattedAddress: "", lat: null, lng: null },
      });
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
                <label className="label"><span className="label-text font-semibold">Username</span></label>
                <input type="text" className="input input-bordered w-full bg-base-200" value={profile?.userName || ""} disabled />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Email</span></label>
                <input type="text" className="input input-bordered w-full bg-base-200" value={profile?.email || ""} disabled />
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Display Name</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                />
              </div>

              {/* City with Nominatim autocomplete */}
              <div className="form-control relative">
                <label className="label">
                  <span className="label-text font-semibold">City</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${locationInput && !locationSelected ? "input-warning" : ""}`}
                  placeholder="Search your city..."
                  value={locationInput}
                  onChange={(e) => handleLocationInput(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                />

                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                    {suggestions.map((item) => {
                      const addr = item.address;
                      const city = addr?.city || addr?.town || addr?.municipality || addr?.county || item.display_name.split(",")[0].trim();
                      const country = addr?.country || "";
                      const label = country ? `${city}, ${country}` : city;
                      return (
                        <li
                          key={item.place_id}
                          className="px-4 py-2 hover:bg-base-200 cursor-pointer text-sm text-left"
                          onMouseDown={() => handleSelectSuggestion(item)}
                        >
                          {label}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {locationInput && (
                  <button
                    className="absolute right-2 top-10 text-gray-400 hover:text-gray-600 text-xs"
                    onClick={() => {
                      setLocationInput("");
                      setLocationSelected(false);
                      setSuggestions([]);
                      setProfileForm((prev) => ({
                        ...prev,
                        location: { formattedAddress: "", lat: null, lng: null },
                      }));
                    }}
                  >
                    ✕
                  </button>
                )}
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
                <label className="label"><span className="label-text font-semibold">Current Password</span></label>
                <input type="password" className="input input-bordered w-full" value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">New Password</span></label>
                <input type="password" className="input input-bordered w-full" value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Confirm New Password</span></label>
                <input type="password" className="input input-bordered w-full" value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              </div>
            </div>
            <div className="mt-4">
              <button className="btn btn-primary w-full" onClick={handleChangePassword}>Change Password</button>
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
              <label className="label"><span className="label-text font-semibold">Enter your password to confirm</span></label>
              <input type="password" className="input input-bordered w-full" value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)} />
            </div>
            <button className="btn btn-error w-full"
              onClick={() => document.getElementById("delete_account_modal").showModal()}>
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      <dialog id="delete_account_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Delete Account?</h3>
          <p className="py-4">This will permanently delete your account and all prediction history. This action cannot be undone.</p>
          <div className="modal-action">
            <form method="dialog"><button className="btn">Cancel</button></form>
            <button className="btn btn-error" onClick={handleDeleteAccount}>Delete</button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ProfilePage;
