import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import PDFPreview from "../components/PDFPreview";
import Draggable from "react-draggable";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { url } from "../utils/api";


const PublicSign = () => {
  const { token } = useParams();
  const nodeRef = useRef(null);

  const [signature, setSignature] = useState(null);
  const [text, setText] = useState("Signed by Guest");
  const [fontSize, setFontSize] = useState(20);
  const [fontColor, setFontColor] = useState("#0066ff");
  const [fontFamily, setFontFamily] = useState("Helvetica");
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [success, setSuccess] = useState(false);
  const [rejectedReason, setRejectedReason] = useState("");

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const res = await axios.get(
          `${url}/api/signatures/public/${token}`
        );
        setSignature(res.data);
        if (res.data.text) setText(res.data.text);
      } catch (err) {
        toast.error("❌ Invalid or expired link");
        console.error(err.message);
      }
    };
    fetchSignature();
  }, [token]);

  const handleSubmit = async () => {
    const viewer = document.querySelector(".rpv-core__viewer");
    const canvas = viewer?.querySelector("canvas");
    if (!canvas) return toast.error("❌ PDF canvas not found");

    const canvasRect = canvas.getBoundingClientRect();
    const pdfWidth = 595;
    const pdfHeight = 842;
    const scaleX = pdfWidth / canvasRect.width;
    const scaleY = pdfHeight / canvasRect.height;
    const scaledX = position.x * scaleX;
    const scaledY = pdfHeight - position.y * scaleY;

    try {
      await axios.post(
        `${url}/api/signatures/public/${token}/sign`,
        {
          text,
          fontSize,
          fontColor,
          fontFamily,
          x: scaledX,
          y: scaledY,
        }
      );
      toast.success("✅ Signature submitted!");
      setSuccess(true);
    } catch (err) {
      toast.error("❌ Failed to submit signature");
      console.error("❌ Submit failed:", err.response?.data || err.message);
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(
        `${url}/api/signatures/public/${token}/reject`,
        { rejectedReason }
      );
      toast.success("❌ Signature rejected");
      setSuccess(true);
    } catch (err) {
      toast.error("❌ Failed to reject signature");
      console.error("❌ Reject failed:", err.response?.data || err.message);
    }
  };

  if (!signature || !signature.documentId) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-600 dark:text-gray-300">
        Loading document...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Toaster position="top-center" />
      <div className="pt-16">
        <div className="flex flex-col min-h-[calc(100vh-4rem)] gap-6 px-4 py-6 bg-gray-100 dark:bg-gray-900 lg:flex-row">
          <div className="relative w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden">
            <PDFPreview id={signature.documentId} refresh={success} publicMode={true} />
            <Draggable
              nodeRef={nodeRef}
              position={position}
              onDrag={(e, data) => setPosition({ x: data.x, y: data.y })}
            >
              <div
                ref={nodeRef}
                className="absolute px-4 py-2 font-semibold border-2 border-dashed rounded-md shadow-md cursor-move"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily,
                  color: fontColor,
                  backgroundColor: "rgba(255,255,255,0.7)",
                  borderColor: fontColor,
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                }}
              >
                {text}
              </div>
            </Draggable>
          </div>

          <div className="w-full lg:w-1/3 max-h-[calc(100vh-8rem)]">
            <div className="h-full p-6 space-y-6 overflow-auto bg-white border shadow dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
                ✍️ Public Signature Panel
              </h2>

              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Signature Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Font Size
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="48"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    Size: {fontSize}px
                  </p>
                </div>

                <div className="flex-1">
                  <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="Helvetica">Helvetica</option>
                    <option value="Courier">Courier</option>
                    <option value="Times">Times</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Font Colour
                </label>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-full h-12 border rounded-md shadow-sm"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  ✅ Submit Signature
                </button>
              </div>

              <hr className="my-4 border-gray-300 dark:border-gray-600" />

              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Reason for Rejection (optional)
                </label>
                <input
                  type="text"
                  value={rejectedReason}
                  onChange={(e) => setRejectedReason(e.target.value)}
                  placeholder="e.g. Not my document"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReject}
                  className="w-full px-4 py-3 font-semibold text-white bg-red-600 rounded hover:bg-red-700"
                >
                  ❌ Reject Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicSign;
