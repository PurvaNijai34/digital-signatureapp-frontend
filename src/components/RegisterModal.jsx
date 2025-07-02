

import { url } from "../utils/api";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const RegisterModal = ({ isOpen, onClose, onRegisterSuccess }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${url}/api/auth/register`, form);
      toast.success("✅ Registered successfully!");
      onClose();
      onRegisterSuccess();
    } catch (err) {
      toast.error(err.response?.data?.msg || "❌ Registration failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 transition-all bg-white shadow-2xl dark:bg-gray-800 rounded-2xl">
        <button
          onClick={onClose}
          className="absolute text-2xl text-gray-400 top-2 right-4 hover:text-gray-700 dark:hover:text-white"
        >
          &times;
        </button>

        <h2 className="mb-6 text-2xl font-bold text-center text-blue-700 dark:text-white">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
