import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../context/AuthContext";
import {
  ArrowLeftIcon,
  PhotoIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const CreateBlog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
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
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      if (image) {
        formDataToSend.append("image", image);
      }

      const response = await api.post("/api/blogs", formDataToSend);

      toast.success("Learning material created!");
      navigate(`/blog/${response.data._id}`);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to create learning material"
      );
      toast.error(
        error.response?.data?.message || "Failed to create learning material"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Learning Materials</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <AcademicCapIcon className="h-12 w-12 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Create Learning Material
            </h1>
          </div>
          <p className="text-gray-600">
            Share your knowledge and help others learn
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
              <ReactQuill
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                className="bg-white rounded-md border border-gray-300 focus:border-primary-500 min-h-[8rem]"
                theme="snow"
              />
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                💡 Tips for Creating Great Learning Materials
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Start with a clear learning objective</li>
                <li>• Use simple, easy-to-understand language</li>
                <li>• Include practical examples and real-world scenarios</li>
                <li>• Break down complex topics into digestible sections</li>
                <li>• Add visual aids and diagrams when helpful</li>
                <li>• Encourage questions and discussion in the comments</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <AcademicCapIcon className="h-5 w-5" />
                    <span>Publish Learning Material</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
