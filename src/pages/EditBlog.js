import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../context/AuthContext";
import {
  ArrowLeftIcon,
  PhotoIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const EditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/api/blogs/${id}`);
        setFormData({
          title: res.data.title,
          description: res.data.description,
        });
        setImagePreview(
          res.data.image.startsWith("http")
            ? res.data.image
            : `${process.env.REACT_APP_API_URL}${res.data.image}`
        );
      } catch (err) {
        setError("Failed to load blog data");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    // eslint-disable-next-line
  }, [id]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      let updateData;
      if (image) {
        updateData = new FormData();
        updateData.append("title", formData.title);
        updateData.append("description", formData.description);
        updateData.append("image", image);
      } else {
        updateData = {
          title: formData.title,
          description: formData.description,
        };
      }
      const config = image
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
      const response = await api.put(`/api/blogs/${id}`, updateData, config);
      toast.success("Learning material updated!");
      navigate(`/blog/${id}`);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update learning material"
      );
      toast.error(
        error.response?.data?.message || "Failed to update learning material"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <AcademicCapIcon className="h-12 w-12 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Learning Material
            </h1>
          </div>
          <p className="text-gray-600">
            Update your learning material and help others learn
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Learning Material Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Enter the title of your learning material"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="space-y-4">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-center">
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {image ? "Change Cover Image" : "Upload Cover Image"}
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Learning Content *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input h-32 resize-none"
                placeholder="Enter the content of your learning material"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;
