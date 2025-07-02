// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { AuthProvider } from "./utils/auth.jsx";
// import PDFPreviewPage from "./pages/PDFPreviewPage.jsx";
import SignPage from "./pages/SignPage.jsx";
import PublicSign from "./pages/PublicSign";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/sign/:id" element={<SignPage />} />
         <Route path="/sign/public/:token" element={<PublicSign />} />
      </Routes>
    </AuthProvider>
  );
}
