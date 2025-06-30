import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../context/AuthContext";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  UserIcon,
  TrashIcon,
  PencilIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await api.get(`/api/blogs/${id}`);
      setBlog(response.data);
    } catch (error) {
      setError("Learning material not found");
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLiking(true);
    try {
      const response = await api.post(
        `/api/blogs/${id}/like`,
        {},
        { withCredentials: true }
      );
      setBlog((prev) => ({
        ...prev,
        likes: response.data.likes,
        likesCount: response.data.likesCount,
      }));
    } catch (error) {
      console.error("Error liking blog:", error);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post(
        `/api/blogs/${id}/comment`,
        { content: comment },
        { withCredentials: true }
      );
      setBlog((prev) => ({
        ...prev,
        comments: response.data,
      }));
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/api/blogs/${id}/comment/${commentId}`, {
        withCredentials: true,
      });
      setBlog((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== commentId),
      }));
      toast.success("Comment deleted!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleDeleteBlog = async () => {
    if (
      !window.confirm("Are you sure you want to delete this learning material?")
    )
      return;

    try {
      await api.delete(`/api/blogs/${id}`, { withCredentials: true });
      toast.success("Learning material deleted!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete learning material");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLiked = user && blog?.likes?.includes(user.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Learning Material Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Browse Learning Materials
          </button>
        </div>
      </div>
    );
  }

  // Only define these after blog is loaded
  const isAuthor =
    user && (user.id === blog.author || user.id === blog.author?._id);
  const isAdmin = user && user.role === "admin";

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

        {/* Learning Material Content */}
        <div className="card">
          {/* Cover Image */}
          <div className="mb-6">
            <img
              src={
                blog.image.startsWith("http")
                  ? blog.image
                  : `${process.env.REACT_APP_API_URL}${blog.image}`
              }
              alt={blog.title}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x400?text=Learning+Material";
              }}
            />
          </div>

          {/* Learning Material Header */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mr-3">
                <AcademicCapIcon className="h-4 w-4 mr-1" />
                Learning Material
              </span>
              <span className="text-sm text-gray-500">
                Published {formatDate(blog.createdAt)}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <UserIcon className="h-4 w-4" />
                  <span className="font-medium">{blog.authorName}</span>
                  <span className="text-xs">• Instructor</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
              </div>

              {/* Admin Actions */}
              {(isAdmin || isAuthor) && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/edit/${blog._id}`)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteBlog}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Helpful Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  isLiked
                    ? "text-green-600 bg-green-50 hover:bg-green-100"
                    : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
                }`}
              >
                {isLiked ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>{blog.likesCount || 0} found this helpful</span>
              </button>
            </div>
          </div>

          {/* Learning Content */}
          <div className="prose max-w-none mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex items-center">
                <BookOpenIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-blue-900">
                  Learning Content
                </h3>
              </div>
            </div>
            <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
              {blog.description}
            </div>
          </div>
        </div>

        {/* Questions & Discussion Section */}
        <div className="card mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ChatBubbleLeftIcon className="h-6 w-6 mr-2" />
            Questions & Discussion ({blog.comments?.length || 0})
          </h3>

          {/* Add Question/Comment */}
          {user && (
            <form onSubmit={handleComment} className="mb-8">
              <div className="mb-4">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ask a question or share your thoughts
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What questions do you have about this learning material? Share your insights or ask for clarification..."
                  className="input h-24 resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="btn btn-primary"
              >
                {submitting ? "Posting..." : "Post Question/Comment"}
              </button>
            </form>
          )}

          {!user && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">
                Please{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="underline font-medium"
                >
                  login
                </button>{" "}
                to ask questions or join the discussion.
              </p>
            </div>
          )}

          {/* Questions/Comments List */}
          <div className="space-y-4">
            {blog.comments?.length === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No questions yet. Be the first to ask!
                </p>
              </div>
            ) : (
              blog.comments?.map((comment) => (
                <div
                  key={comment._id}
                  className="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.userName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>

                    {/* Delete Comment Button */}
                    {(isAdmin || isAuthor) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 hover:text-red-700 ml-4"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Related Learning Materials */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <AcademicCapIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Continue Your Learning Journey
            </h3>
            <p className="text-gray-600 mb-4">
              Explore more learning materials and expand your knowledge
            </p>
            <Link to="/" className="btn btn-primary">
              Browse All Learning Materials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
