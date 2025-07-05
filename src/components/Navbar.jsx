import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/auth";

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full transition-all shadow-md bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between max-w-screen-xl px-6 py-4 mx-auto text-white">
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-blue-200"
          onClick={() => navigate("/")}
        >
          SignMate
        </h1>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden focus:outline-none"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="text-2xl">{menuOpen ? "✖" : "☰"}</span>
        </button>

        {/* Desktop Menu */}
        <div className="items-center hidden gap-4 lg:flex">
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="px-3 py-2 transition bg-gray-700 rounded hover:bg-gray-600"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          {!user && isHomePage ? (
            <>
              <button
                onClick={onLoginClick}
                className="px-4 py-2 transition border border-white rounded hover:bg-white hover:text-blue-800"
              >
                Login
              </button>
              <button
                onClick={onRegisterClick}
                className="px-4 py-2 font-semibold text-blue-800 bg-white rounded hover:bg-blue-100"
              >
                Signup
              </button>
            </>
          ) : user ? (
      <>
      <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 font-semibold text-white bg-green-600 rounded hover:bg-green-700"
              >
                 Back
              </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 font-semibold text-white transition bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button></>
          ) : null}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="px-6 pb-4 space-y-3 lg:hidden bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-gray-900 dark:to-gray-800">
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="w-full px-4 py-2 text-left transition bg-gray-700 rounded hover:bg-gray-600"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          {!user && isHomePage ? (
            <>
              <button
                onClick={() => {
                  onLoginClick();
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left transition border border-white rounded hover:bg-white hover:text-blue-800"
              >
                Login
              </button>
              <button
                onClick={() => {
                  onRegisterClick();
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 font-semibold text-left text-blue-800 bg-white rounded hover:bg-blue-100"
              >
                Signup
              </button>
            </>
          ) : user ? (
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 font-semibold text-left text-white transition bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button>
          ) : null}
        </div>
      )}
    </nav>
  );
}

