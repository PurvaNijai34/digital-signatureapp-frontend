
import { useEffect, useState } from "react";
import axios from "axios";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { url } from "../utils/api"; 

const PDFPreview = ({
  id,
  refresh,
  publicMode = false,
  showTracking = false,
}) => {
  const [doc, setDoc] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const token = localStorage.getItem("token");
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchDocAndSignatures = async () => {
      try {
        let file;

        if (publicMode) {
          const res = await axios.get(`${url}/api/docs/${id}/public`);
          file = res.data;
        } else {
          const res = await axios.get(`${url}/api/docs`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          file = res.data.find((d) => d._id === id);
        }

        if (!file) return;

        const signedPath = `signed_${file.path}`;
        const finalizedFilePath = `${url}/uploads/finalized/${signedPath}`;
        const finalizedRes = await axios
          .head(finalizedFilePath)
          .catch(() => null);

        file.path =
          finalizedRes?.status === 200
            ? `uploads/finalized/${signedPath}`
            : `uploads/${file.path}`;

        setDoc(file);

        const sigRes = await axios.get(`${url}/api/signatures/${id}`, {
          headers: publicMode ? {} : { Authorization: `Bearer ${token}` },
        });
        setSignatures(sigRes.data);
      } catch (err) {
        console.error("❌ Error fetching PDF or signatures:", err.message);
      }
    };

    fetchDocAndSignatures();
  }, [id, refresh]);

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-full text-lg text-gray-500 animate-pulse">
        Loading PDF...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-white border border-gray-300 shadow-md rounded-2xl">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={`${url}/${doc.path}`}
          plugins={[defaultLayoutPluginInstance]}
        />
      </Worker>

      {signatures.map((sig, index) => {
        const canvas = document.querySelector(".rpv-core__viewer canvas");
        if (!canvas) return null;

        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvasRect.width / 595;
        const scaleY = canvasRect.height / 842;
        const screenX = sig.x * scaleX;
        const screenY = (842 - sig.y) * scaleY;

        return (
          <div
            key={index}
            className="absolute px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg shadow-lg"
            style={{
              top: `${screenY}px`,
              left: `${screenX}px`,
              fontSize: `${sig.fontSize || 16}px`,
              fontFamily: sig.fontFamily || "Helvetica",
              color: sig.fontColor || "#000000",
              pointerEvents: "none",
              maxWidth: "200px",
            }}
          >
            {sig.text || "Signed"}

            {showTracking && (
              <div className="mt-1">
                {sig.status === "signed" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 border border-green-300 rounded-full">
                    ✅ Signed
                  </span>
                )}
                {sig.status === "pending" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full">
                    🕒 Pending
                  </span>
                )}
                {sig.status === "rejected" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 border border-red-300 rounded-full">
                    ❌ Rejected
                    {sig.rejectedReason && (
                      <span className="ml-1 italic text-red-500">
                        ({sig.rejectedReason})
                      </span>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PDFPreview;
