import { useParams } from "react-router-dom";
import PDFPreview from "../components/PDFPreview";
import Navbar from "../components/Navbar";
import Draggable from "react-draggable";
import { useState, useRef } from "react";
import axios from "axios";
import InviteEmailForm from "../components/InviteEmailForm";
import { toast, Toaster } from "react-hot-toast";
import { url } from "../utils/api"; 

const SignPage = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [refreshPreview, setRefreshPreview] = useState(false);
  const [signText, setSignText] = useState("Signature");
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [fontSize, setFontSize] = useState(20);
  const [fontColor, setFontColor] = useState("#0066ff");
  const [fontFamily, setFontFamily] = useState("Helvetica");
  const [signatureId, setSignatureId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  const nodeRef = useRef(null);

  const handleStop = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  const handleSaveSignature = async () => {
    const viewer = document.querySelector(".rpv-core__viewer");
    const canvas = viewer?.querySelector("canvas");

    if (!canvas) return toast.error("❌ PDF canvas not found");

    const canvasRect = canvas.getBoundingClientRect();
    const pdfWidth = 595;
    const pdfHeight = 842;

    const scaleX = pdfWidth / canvasRect.width;
    const scaleY = pdfHeight / canvasRect.height;

    const relativeX = position.x;
    const relativeY = position.y;

    const scaledX = relativeX * scaleX;
    const scaledY = pdfHeight - relativeY * scaleY;

    try {
      const res = await axios.post(
        `${url}/api/signatures`,
        {
          documentId: id,
          x: scaledX,
          y: scaledY,
          text: signText,
          page: 0,
          fontSize,
          fontColor,
          fontFamily,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Signature saved!");
      setSignatureId(res.data._id);
    } catch (err) {
      toast.error("❌ Failed to save signature.");
    }
  };

  const handleFinalizePDF = async () => {
  try {
    console.log("🚀 Finalizing PDF...");

    const res = await axios.post(
      `${url}/api/signatures/finalize`,
      { documentId: id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // ✅ Important: receive binary file (PDF)
      }
    );

    // ✅ Create blob from response
    const blob = new Blob([res.data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);

    // ✅ Trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `signed-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("✅ PDF finalized and downloaded!");
    setRefreshPreview((prev) => !prev); // Refresh preview if needed
  } catch (err) {
    console.error("❌ Finalize error:", err);
    toast.error("❌ Failed to finalize PDF.");
  }
};

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-white">
      <Toaster position="top-center" />
      <Navbar />

      <div className="pt-16">
        <div className="flex flex-col min-h-[calc(100vh-4rem)] gap-6 px-4 py-6 bg-gray-100 dark:bg-gray-900 lg:flex-row">
          {/* PDF Preview */}
          <div className="relative w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden">
            <PDFPreview
              id={id}
              refresh={refreshPreview}
              showTracking={showTracking}
            />
            <Draggable
              nodeRef={nodeRef}
              position={position}
              onDrag={(e, data) => setPosition({ x: data.x, y: data.y })}
              onStop={handleStop}
            >
              <div
                ref={nodeRef}
                className="absolute px-4 py-2 font-semibold border-2 border-dashed rounded-md shadow-md cursor-move bg-opacity-80"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily,
                  color: fontColor,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderColor: fontColor,
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                }}
              >
                {signText}
              </div>
            </Draggable>
          </div>

          {/* Signature Panel */}
          <div className="w-full lg:w-1/3 max-h-[calc(100vh-8rem)]">
            <div className="h-full p-6 space-y-6 overflow-auto bg-white border shadow dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <h2 className="text-2xl font-bold text-center">
                🖋️ Signature Panel
              </h2>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Signature Text
                </label>
                <input
                  type="text"
                  value={signText}
                  onChange={(e) => setSignText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Font Size</label>
                  <input
                    type="range"
                    min="10"
                    max="48"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-center">Size: {fontSize}px</p>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Helvetica">Helvetica</option>
                    <option value="Courier">Courier</option>
                    <option value="Times">Times</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Font Color</label>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-full h-12 border rounded-md"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleSaveSignature}
                  className="w-full px-4 py-3 font-semibold text-white transition duration-300 bg-green-600 rounded hover:bg-green-700"
                >
                  💾 Save Signature Position
                </button>

                <button
                  onClick={handleFinalizePDF}
                  className="w-full px-4 py-3 font-semibold text-white transition duration-300 bg-purple-600 rounded hover:bg-purple-700"
                >
                  📥 Finalize & Download PDF
                </button>

                <button
                  onClick={() => setShowTracking((prev) => !prev)}
                  className={`w-full px-4 py-3 font-semibold text-white rounded transition duration-300 ${
                    showTracking
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  🛰️{" "}
                  {showTracking
                    ? "Hide Signature Status"
                    : "Track Signature Status"}
                </button>

                {signatureId && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full px-4 py-3 font-semibold text-white transition duration-300 bg-indigo-600 rounded hover:bg-indigo-700"
                  >
                    📧 Send Invite
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute text-xl font-bold text-gray-600 top-2 right-3 dark:text-white hover:text-black"
              >
                &times;
              </button>
              <InviteEmailForm signatureId={signatureId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignPage;
