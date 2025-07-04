import { useEffect, useRef, useState } from "react";
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

  const viewerRef = useRef(null);
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [overlayEl, setOverlayEl] = useState(null);

  // ✅ Fetch the PDF document and its signatures
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

        const safePath = file.path.replace(/\s+/g, "_");
        const signedPath = `signed_${safePath}`;
        const finalizedFilePath = `${url}/uploads/finalized/${signedPath}`;
        const finalizedRes = await axios.head(finalizedFilePath).catch(() => null);

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

  // ✅ Keep track of canvas and inner scroll container
  useEffect(() => {
    const interval = setInterval(() => {
      const canvas = viewerRef.current?.querySelector(".rpv-core__viewer canvas");
      const scrollContainer = viewerRef.current?.querySelector(".rpv-core__inner-pages");

      if (canvas && canvas !== canvasRef.current) {
        canvasRef.current = canvas;
      }

      if (scrollContainer && scrollContainer !== scrollContainerRef.current) {
        scrollContainerRef.current = scrollContainer;
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // ✅ Mount overlay div inside scrollable container
  useEffect(() => {
    if (scrollContainerRef.current && !overlayEl) {
      const el = document.createElement("div");
      el.className = "signature-overlay";
      el.style.position = "absolute";
      el.style.top = "0";
      el.style.left = "0";
      el.style.pointerEvents = "none";
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.zIndex = "10";
      scrollContainerRef.current.appendChild(el);
      setOverlayEl(el);
    }

    return () => {
      if (scrollContainerRef.current?.contains(overlayEl)) {
        scrollContainerRef.current.removeChild(overlayEl);
      }
    };
  }, [scrollContainerRef.current]);

  // ✅ Render signatures inside mounted overlay
  useEffect(() => {
    if (!overlayEl || !canvasRef.current) return;

    overlayEl.innerHTML = ""; // clear old
    const pdfWidth = 595;
    const pdfHeight = 842;

    const canvasWidth = canvasRef.current.offsetWidth;
    const canvasHeight = canvasRef.current.offsetHeight;

    const scaleX = canvasWidth / pdfWidth;
    const scaleY = canvasHeight / pdfHeight;

    signatures.forEach((sig) => {
      const x = sig.x * scaleX;
      const y = (pdfHeight - sig.y) * scaleY;

      const div = document.createElement("div");
      div.textContent = sig.text || "Signed";
      div.style.position = "absolute";
      div.style.top = `${y}px`;
      div.style.left = `${x}px`;
      div.style.fontSize = `${sig.fontSize || 16}px`;
      div.style.fontFamily = sig.fontFamily || "Helvetica";
      div.style.color = sig.fontColor || "#000000";
      div.style.border = `2px dashed ${sig.fontColor || "#000000"}`;
      div.style.borderRadius = "8px";
      div.style.backgroundColor = "transparent";
      div.style.fontWeight = "600";
      div.style.padding = "4px 8px";
      div.style.pointerEvents = "none";
      div.style.zIndex = "10";

      // ✅ Optional: tracking status inside the same box
      if (showTracking && sig.status) {
        const status = document.createElement("div");
        status.style.marginTop = "4px";
        status.style.fontSize = "12px";
        status.style.padding = "2px 6px";
        status.style.borderRadius = "8px";
        status.style.display = "inline-block";

        if (sig.status === "signed") {
          status.textContent = "✅ Signed";
          status.style.background = "#d1fae5";
          status.style.color = "#065f46";
          status.style.border = "1px solid #10b981";
        } else if (sig.status === "pending") {
          status.textContent = "🕒 Pending";
          status.style.background = "#fef3c7";
          status.style.color = "#92400e";
          status.style.border = "1px solid #f59e0b";
        } else if (sig.status === "rejected") {
          status.textContent = "❌ Rejected";
          status.style.background = "#fee2e2";
          status.style.color = "#991b1b";
          status.style.border = "1px solid #ef4444";

          if (sig.rejectedReason) {
            const reason = document.createElement("span");
            reason.style.fontStyle = "italic";
            reason.style.marginLeft = "4px";
            reason.style.color = "#b91c1c";
            reason.textContent = `(${sig.rejectedReason})`;
            status.appendChild(reason);
          }
        }

        div.appendChild(status);
      }

      overlayEl.appendChild(div);
    });
  }, [signatures, canvasRef.current, overlayEl, showTracking]);

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-full text-lg text-gray-500 animate-pulse">
        Loading PDF...
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className="relative w-full h-full overflow-hidden bg-white border border-gray-300 shadow-md rounded-2xl"
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={`${url}/${doc.path}`}
          plugins={[defaultLayoutPluginInstance]}
        />
      </Worker>
    </div>
  );
};

export default PDFPreview;
