
import { useAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Login from "../components/Login";
import RegisterModal from "../components/RegisterModal";
import { toast, Toaster } from "react-hot-toast";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const openLoginModal = () => setShowLogin(true);
  const openRegisterModal = () => setShowRegister(true);

  return (
    <>
      <Toaster position="top-center" />
      <Navbar onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />

      <main className="flex items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-950 dark:text-white">
        <div className="w-full max-w-xl p-8 text-center bg-white border border-blue-200 shadow-xl dark:bg-gray-800 dark:border-gray-700 rounded-3xl">
          <h2 className="mb-4 text-4xl font-extrabold text-blue-700 dark:text-white">
            📄 Sign Your PDF Online
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Upload and sign PDF documents securely in your browser
          </p>

          <div className="flex flex-col items-center space-y-4">
            <label
              htmlFor="pdf-upload"
              className="flex items-center justify-center w-full gap-3 px-4 py-3 text-blue-600 transition duration-300 border-2 border-blue-300 border-dashed cursor-pointer dark:text-blue-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 rounded-xl hover:bg-blue-100 hover:dark:bg-gray-600"
            >
              <span className="text-2xl">📎</span>
              <span className="font-medium">Choose PDF File</span>
              <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" />
            </label>

            <button
              onClick={() => toast.error("Please login to upload.") || openLoginModal()}
              className="w-full px-6 py-3 font-semibold text-white transition duration-300 bg-blue-600 shadow-md rounded-xl hover:bg-blue-700"
            >
              🚀 Upload & Continue
            </button>
          </div>
        </div>

        <Login
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onRegisterClick={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />

        <RegisterModal
          isOpen={showRegister}
          onClose={() => setShowRegister(false)}
          onRegisterSuccess={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      </main>

      
    </>
  );
}

