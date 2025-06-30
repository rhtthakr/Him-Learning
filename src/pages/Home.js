import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../context/AuthContext";
import {
  MagnifyingGlassIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await api.get("/api/blogs");
      setBlogs(response.data);
    } catch (error) {
      setError("Failed to fetch learning materials");
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <AcademicCapIcon className="h-12 w-12 text-primary-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">HIM LEARNING</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your gateway to knowledge and skill development. Explore
            comprehensive learning materials, tutorials, and educational content
            created by experts and educators.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <BookOpenIcon className="h-4 w-4 mr-1" />
              <span>{blogs.length} Learning Materials</span>
            </div>
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              <span>Expert Instructors</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Updated Daily</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search learning materials, topics, or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Learning Materials Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "No learning materials found"
                : "No learning materials yet"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Be the first to create educational content!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog._id}
                className="card hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary-500"
              >
                {/* Learning Material Image */}
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={
                      blog.image.startsWith("http")
                        ? blog.image
                        : `${process.env.REACT_APP_API_URL}${blog.image}`
                    }
                    alt={blog.title}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/600x400?text=Learning+Material";
                    }}
                  />
                </div>

                {/* Learning Material Content */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Learning Material
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {blog.title}
                  </h2>

                  <p className="text-gray-600 line-clamp-3">
                    {blog.description}
                  </p>

                  {/* Instructor and Engagement */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="h-4 w-4" />
                      <span className="font-medium">{blog.authorName}</span>
                      <span className="text-xs">• Instructor</span>
                    </div>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <HeartIcon className="h-4 w-4" />
                        <span>{blog.likesCount || 0} found helpful</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                        <span>{blog.commentsCount || 0} questions</span>
                      </div>
                    </div>

                    <Link
                      to={`/blog/${blog._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                    >
                      Start Learning →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State for No Search Results */}
        {searchTerm && filteredBlogs.length === 0 && blogs.length > 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No learning materials found for "{searchTerm}"
            </h3>
            <p className="text-gray-600 mb-4">
              Try searching with different keywords or browse all materials
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="btn btn-secondary"
            >
              Browse All Materials
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <AcademicCapIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Share Your Knowledge?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join our community of educators and experts. Create learning
              materials, tutorials, and educational content to help others grow
              and learn.
            </p>
            <Link to="/create" className="btn btn-primary text-lg px-8 py-3">
              Create Learning Material
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
