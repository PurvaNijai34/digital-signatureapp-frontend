import { useAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Login from "../components/Login";
import RegisterModal from "../components/RegisterModal";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

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
      <Navbar
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />

      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-950 dark:text-white">
        <motion.h1
          className="mb-6 text-4xl font-bold sm:text-5xl"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to <span className="text-blue-600 dark:text-blue-400">SignMate</span>
        </motion.h1>

        <motion.p
          className="max-w-2xl mb-8 text-lg text-gray-700 dark:text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <Typewriter
            words={[
              "Digitally sign and share your PDFs.",
              "Fast, secure, and hassle-free.",
              "Sign documents in seconds."
            ]}
            loop={0}
            cursor
            cursorStyle="|"
            typeSpeed={60}
            deleteSpeed={40}
            delaySpeed={2000}
          />
        </motion.p>

        <motion.div
          className="flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <button
            onClick={openLoginModal}
            className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Get Started
          </button>
          
        </motion.div>

    

        <Login
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onRegisterClick={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
          centerLabels={false}
          labelClassName="text-left"
        />

        <RegisterModal
          isOpen={showRegister}
          onClose={() => setShowRegister(false)}
          onRegisterSuccess={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
          centerLabels={false}
          labelClassName="text-left"
        />
      </main>
    </>
  );
}