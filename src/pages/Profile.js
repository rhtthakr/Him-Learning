import React, { useEffect, useState } from "react";
import { api } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/auth/me");
        setForm({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          bio: res.data.user.bio || "",
          avatar: res.data.user.avatar || "",
        });
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    // Avatar validation: must be image URL and <= 20 KB
    if (form.avatar) {
      try {
        const res = await fetch(form.avatar, { method: "HEAD" });
        const contentType = res.headers.get("content-type");
        const contentLength = res.headers.get("content-length");
        if (!contentType || !contentType.startsWith("image/")) {
          setError("Avatar URL must point to an image file.");
          return;
        }
        if (contentLength && parseInt(contentLength, 10) > 20 * 1024) {
          setError("Avatar image size must be 20 KB or less.");
          return;
        }
      } catch (err) {
        setError("Could not verify avatar image. Please check the URL.");
        return;
      }
    }
    try {
      setLoading(true);
      const res = await api.put("/api/auth/me", form);
      setSuccess("Profile updated successfully");
      setUser((prev) => ({ ...prev, ...res.data.user }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    try {
      setPwLoading(true);
      await api.put("/api/auth/me/password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess("Password updated successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Please log in to view your profile.
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="input w-full resize-none"
              rows={3}
              placeholder="Tell us about yourself"
              maxLength={500}
            />
          </div>
          {success && <div className="text-green-600 text-sm">{success}</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <hr className="my-8" />

        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={pwForm.newPassword}
              onChange={handlePwChange}
              className="input w-full"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={pwForm.confirmPassword}
              onChange={handlePwChange}
              className="input w-full"
              required
              minLength={6}
            />
          </div>
          {pwSuccess && (
            <div className="text-green-600 text-sm">{pwSuccess}</div>
          )}
          {pwError && <div className="text-red-600 text-sm">{pwError}</div>}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={pwLoading}
          >
            {pwLoading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
