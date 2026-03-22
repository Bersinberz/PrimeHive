import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import axiosInstance from "../../services/axiosInstance";

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }
    axiosInstance
      .get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Verification link is invalid or has expired.");
      });
  }, []);

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#f8f8fa" }}
    >
      <div
        className="bg-white rounded-4 p-5 text-center"
        style={{ maxWidth: 420, width: "100%", margin: "0 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
      >
        {status === "loading" && (
          <>
            <Loader size={48} className="mb-3" style={{ color: "var(--prime-orange)", animation: "spin 1s linear infinite" }} />
            <p className="fw-bold text-muted">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{ width: 80, height: 80, background: "rgba(16,185,129,0.1)" }}
            >
              <CheckCircle size={40} style={{ color: "#10b981" }} />
            </div>
            <h4 className="fw-black mb-2" style={{ letterSpacing: "-0.3px" }}>Email Verified!</h4>
            <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
              {message}
            </p>
            <button
              className="btn fw-bold text-white px-5"
              style={{ background: "var(--prime-gradient)", border: "none", borderRadius: 10 }}
              onClick={() => navigate("/account/profile")}
            >
              Go to Account Info
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{ width: 80, height: 80, background: "rgba(239,68,68,0.1)" }}
            >
              <XCircle size={40} style={{ color: "#ef4444" }} />
            </div>
            <h4 className="fw-black mb-2" style={{ letterSpacing: "-0.3px" }}>Verification Failed</h4>
            <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>{message}</p>
            <button
              className="btn fw-bold text-white px-5"
              style={{ background: "var(--prime-gradient)", border: "none", borderRadius: 10 }}
              onClick={() => navigate("/account/profile")}
            >
              Back to Account
            </button>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VerifyEmail;
