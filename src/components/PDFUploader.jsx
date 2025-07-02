import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { url } from "../utils/api";

export default function PDFUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filter, setFilter] = useState("All");

  const formRef = useRef();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const res = await axios.get(`${url}/api/docs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const docs = res.data.map((doc) => ({
        _id: doc._id,
        filename: doc.filename,
        uploadDate: doc.uploadDate,
        url: doc.url,
        status: doc.status || "Pending", // ⬅️ Add status field
      }));
      setUploadedFiles(docs);
    } catch (err) {
      toast.error("❌ Failed to fetch documents");
      console.error("❌ Fetch error:", err.message);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.error("Please choose a PDF file.");

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const res = await axios.post(
        `${url}/api/docs/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("✅ PDF uploaded successfully!");
      const newDocId = res.data._id;
      navigate(`/sign/${newDocId}`);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      toast.error("❌ Upload failed.");
    }

    formRef.current.reset();
    setSelectedFile(null);
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${url}/api/docs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 204) {
        toast.success("🗑️ File deleted successfully!");
        fetchDocs();
      } else {
        toast.error("❌ Failed to delete file.");
      }
    } catch (err) {
      console.error("❌ Delete error:", err.response?.data || err.message);
      toast.error("❌ Delete failed.");
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-950 dark:text-white">
      <Toaster position="top-center" />

      {/* Upload Box */}
      <div className="w-full max-w-xl p-8 text-center bg-white border border-blue-200 shadow-xl dark:bg-gray-800 dark:border-gray-700 rounded-3xl">
        <h2 className="mb-4 text-4xl font-extrabold text-blue-700 dark:text-white">
          📄 Sign Your PDF Online
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Upload and sign PDF documents securely in your browser
        </p>

        <form
          ref={formRef}
          className="flex flex-col items-center space-y-4"
          onSubmit={handleUpload}
        >
          <label
            htmlFor="pdf-upload"
            className="flex items-center justify-center w-full gap-3 px-4 py-3 text-blue-600 transition duration-300 border-2 border-blue-300 border-dashed cursor-pointer dark:text-blue-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 rounded-xl hover:bg-blue-100 hover:dark:bg-gray-600"
          >
            <span className="text-2xl">📎</span>
            <span className="font-medium">
              {selectedFile ? selectedFile.name : "Choose PDF File"}
            </span>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <button
            type="submit"
            className="w-full px-6 py-3 font-semibold text-white transition duration-300 bg-blue-600 shadow-md rounded-xl hover:bg-blue-700"
          >
            🚀 Upload & Continue
          </button>
        </form>
      </div>

      {/* Uploaded PDFs */}
      <div className="w-full max-w-3xl mt-10">
        <h3 className="mb-2 text-2xl font-bold text-blue-800 dark:text-white">
          📚 Uploaded PDFs
        </h3>

        {/* Filter Dropdown */}
        {uploadedFiles.length > 0 && (
          <div className="flex justify-end mb-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 text-sm border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Signed">Signed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        )}

        {uploadedFiles.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No PDFs uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            

            {uploadedFiles
              .filter((file) =>
                filter === "All"
                  ? true
                  : (file.status || "").toLowerCase() === filter.toLowerCase()
              )
              .map((file, index) => (
                <div
                  key={file._id}
                  className="p-4 transition bg-white border shadow dark:bg-gray-800 dark:border-gray-700 rounded-xl hover:shadow-lg"
                >
                  <h4 className="mb-1 text-lg font-semibold text-blue-700 truncate dark:text-blue-300">
                    📎 {file.filename}
                  </h4>
                  <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                    Uploaded: {formatDate(file.uploadDate)}
                  </p>
                  <p className="mb-2 text-sm text-yellow-600 dark:text-yellow-400">
                    Status: {file.status}
                  </p>

                  <div className="mb-3">
                    <iframe
                      src={file.url}
                      className="w-full h-40 border dark:border-gray-600"
                      title={`PDF-${index}`}
                    ></iframe>
                  </div>

                  <div className="flex justify-between space-x-2">
                    <button
                      onClick={() => navigate(`/sign/${file._id}`)}
                      className="flex-1 px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                    >
                      Sign
                    </button>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="flex-1 px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </main>
  );
}
