import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  PlusIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Learning Materials", href: "/" },
    ...(user ? [{ name: "Create Material", href: "/create" }] : []),
    ...(user?.role === "admin"
      ? [{ name: "Admin Panel", href: "/admin" }]
      : []),
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src={logo}
            alt="HIM LEARNING Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-2xl font-bold text-gray-800 tracking-wide">
            HIM LEARNING
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {item.name}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <span>{user.name}</span>
                </Link>
                {user.role === "admin" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary text-sm">
                Join Learning
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-primary-600 p-2"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {user ? (
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <span>{user.name}</span>
                  </Link>
                  {user.role === "admin" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 w-full px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="border-t pt-4 space-y-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary block text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Join Learning
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
