import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../context/AuthContext";
import {
  TrashIcon,
  PencilIcon,
  UserIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  EyeIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [error, setError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    role: "user",
  });
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [resetPwUser, setResetPwUser] = useState(null);
  const [resetPwForm, setResetPwForm] = useState({ newPassword: "" });
  const [resetPwLoading, setResetPwLoading] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewUserBlogs, setViewUserBlogs] = useState([]);
  const [viewUserLoading, setViewUserLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
    // eslint-disable-next-line
  }, [user]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const fetchData = async () => {
    try {
      const [blogsRes, usersRes, statsRes] = await Promise.all([
        api.get("/api/admin/blogs"),
        api.get("/api/admin/users"),
        api.get("/api/admin/stats"),
      ]);

      setBlogs(blogsRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      setError("Failed to fetch admin data");
      toast.error("Failed to fetch admin data");
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (
      !window.confirm("Are you sure you want to delete this learning material?")
    )
      return;

    try {
      await api.delete(`/api/admin/blogs/${blogId}`);
      setBlogs(blogs.filter((blog) => blog._id !== blogId));
      toast.success("Learning material deleted!");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete learning material");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This will also delete all their learning materials."
      )
    )
      return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      // Refresh blogs as some might have been deleted
      const blogsRes = await api.get("/api/admin/blogs");
      setBlogs(blogsRes.data);
      toast.success("User deleted!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // User search/filter
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Edit user handlers
  const openEditUser = (user) => {
    setEditUser(user);
    setEditUserForm({ name: user.name, email: user.email, role: user.role });
  };
  const handleEditUserChange = (e) => {
    setEditUserForm({ ...editUserForm, [e.target.name]: e.target.value });
  };
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setEditUserLoading(true);
    try {
      const res = await api.put(
        `/api/admin/users/${editUser._id}`,
        editUserForm
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id === editUser._id ? { ...u, ...res.data.user } : u
        )
      );
      setEditUser(null);
      toast.success("User updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setEditUserLoading(false);
    }
  };

  // Reset password handlers
  const openResetPw = (user) => {
    setResetPwUser(user);
    setResetPwForm({ newPassword: "" });
  };
  const handleResetPwChange = (e) => {
    setResetPwForm({ ...resetPwForm, [e.target.name]: e.target.value });
  };
  const handleResetPwSubmit = async (e) => {
    e.preventDefault();
    setResetPwLoading(true);
    try {
      await api.put(
        `/api/admin/users/${resetPwUser._id}/password`,
        resetPwForm
      );
      setResetPwUser(null);
      toast.success("Password reset!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setResetPwLoading(false);
    }
  };

  // View user blogs
  const openViewUser = async (user) => {
    setViewUser(user);
    setViewUserLoading(true);
    try {
      const res = await api.get(`/api/admin/users/${user._id}/blogs`);
      setViewUserBlogs(res.data);
    } catch (err) {
      toast.error("Failed to fetch user's learning materials");
      setViewUserBlogs([]);
    } finally {
      setViewUserLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <AcademicCapIcon className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Learning Portal Admin
            </h1>
          </div>
          <p className="text-gray-600">
            Manage your educational platform and learning community
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "dashboard", name: "Dashboard", icon: ChartBarIcon },
              {
                id: "materials",
                name: "Learning Materials",
                icon: DocumentTextIcon,
              },
              { id: "users", name: "Users & Instructors", icon: UserIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Learners
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalUsers || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpenIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Learning Materials
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalBlogs || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChatBubbleLeftIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Questions & Discussions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalComments || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Recent Learning Materials
              </h3>
              <div className="space-y-4">
                {blogs.slice(0, 5).map((blog) => (
                  <div
                    key={blog._id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {blog.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        by {blog.authorName} • Instructor
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/blog/${blog._id}`)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-gray-500">
                        {formatDate(blog.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Learning Materials Tab */}
        {activeTab === "materials" && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2" />
              All Learning Materials
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Learning Material
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={
                              blog.image.startsWith("http")
                                ? blog.image
                                : `${process.env.REACT_APP_API_URL}${blog.image}`
                            }
                            alt={blog.title}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/40x40?text=Material";
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {blog.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {blog.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {blog.authorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(blog.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/blog/${blog._id}`)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Material"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/edit/${blog._id}`)}
                            className="text-green-600 hover:text-green-700"
                            title="Edit Material"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog._id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Material"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" /> Users & Instructors
              </h3>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="input w-full md:w-64"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        {user.role === "admin" ? (
                          <button
                            onClick={() => openViewUser(user)}
                            className="btn btn-xs btn-primary"
                          >
                            <EyeIcon className="h-4 w-4 inline" /> View
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditUser(user)}
                              className="btn btn-xs btn-secondary"
                            >
                              <PencilIcon className="h-4 w-4 inline" /> Edit
                            </button>
                            <button
                              onClick={() => openResetPw(user)}
                              className="btn btn-xs btn-secondary"
                            >
                              Reset PW
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn btn-xs btn-danger"
                            >
                              <TrashIcon className="h-4 w-4 inline" /> Delete
                            </button>
                            <button
                              onClick={() => openViewUser(user)}
                              className="btn btn-xs btn-primary"
                            >
                              <EyeIcon className="h-4 w-4 inline" /> View
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit User Modal */}
            <Dialog
              open={!!editUser}
              onClose={() => setEditUser(null)}
              className="fixed z-10 inset-0 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto z-20">
                  <Dialog.Title className="text-lg font-bold mb-4">
                    Edit User
                  </Dialog.Title>
                  <form onSubmit={handleEditUserSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editUserForm.name}
                        onChange={handleEditUserChange}
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editUserForm.email}
                        onChange={handleEditUserChange}
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Role
                      </label>
                      <select
                        name="role"
                        value={editUserForm.role}
                        onChange={handleEditUserChange}
                        className="input w-full"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditUser(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={editUserLoading}
                      >
                        {editUserLoading ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </Dialog>

            {/* Reset Password Modal */}
            <Dialog
              open={!!resetPwUser}
              onClose={() => setResetPwUser(null)}
              className="fixed z-10 inset-0 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto z-20">
                  <Dialog.Title className="text-lg font-bold mb-4">
                    Reset Password
                  </Dialog.Title>
                  <form onSubmit={handleResetPwSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={resetPwForm.newPassword}
                        onChange={handleResetPwChange}
                        className="input w-full"
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setResetPwUser(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={resetPwLoading}
                      >
                        {resetPwLoading ? "Resetting..." : "Reset"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </Dialog>

            {/* View User Blogs Modal */}
            <Dialog
              open={!!viewUser}
              onClose={() => setViewUser(null)}
              className="fixed z-10 inset-0 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-auto z-20">
                  <Dialog.Title className="text-lg font-bold mb-4">
                    {viewUser?.name}'s Learning Materials
                  </Dialog.Title>
                  {viewUserLoading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : viewUserBlogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No learning materials found.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {viewUserBlogs.map((blog) => (
                        <li key={blog._id} className="py-3">
                          <div className="font-medium text-gray-900">
                            {blog.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            Published: {formatDate(blog.createdAt)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex justify-end mt-6">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setViewUser(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
