import { useState } from "react";
import axios from "axios";
import { url } from "../utils/api";

const InviteEmailForm = ({ signatureId }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendInvite = async () => {
    if (!email) {
      alert("❗Please enter a valid email address.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.post(
        `${url}/api/signatures/${signatureId}/public-link`,
        { email },
        {headers: {
          Authorization: `Bearer ${token}`,
        },}
      );
      alert("✅ Email sent successfully!");
      setEmail("");
    } catch (err) {
      console.error("❌ Email send error:", err.response?.data || err.message);
      alert("❌ Failed to send invite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mt-6 space-y-4 bg-white border shadow rounded-xl dark:bg-gray-900 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
        📩 Send for Public Signing
      </h3>

      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Recipient Email
      </label>
      <input
        type="email"
        placeholder="Enter email address"
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={sendInvite}
        disabled={loading}
        className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Invite"}
      </button>
    </div>
  );
};

export default InviteEmailForm;
