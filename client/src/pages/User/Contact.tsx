import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const ContactPage: React.FC = () => {
  const { supportEmail, supportPhone, storeLocation } = useSettings();

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ height: "calc(100vh - 80px)", overflow: "hidden" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-100"
        style={{ maxWidth: "1000px" }}
      >
        <div className="text-center mb-5">
          <h1 className="fw-black mb-3" style={{ fontSize: "2.5rem", letterSpacing: "-0.5px" }}>Get in Touch</h1>
          <p className="text-muted" style={{ fontSize: "1.05rem" }}>We're here to help! Reach out to us through any of the channels below.</p>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-lg-4 col-md-6">
            <div className="bg-white p-4 rounded-4 shadow-sm border text-center h-100 d-flex flex-column align-items-center transition-all hover-lift">
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "52px", height: "52px", background: "rgba(255, 140, 66, 0.1)" }}>
                <Mail size={24} style={{ color: "var(--prime-orange)" }} />
              </div>
              <h5 className="fw-bold mb-2">Email</h5>
              <p className="text-muted mb-0 font-monospace" style={{ fontSize: "0.9rem" }}>{supportEmail || "support@primehive.com"}</p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="bg-white p-4 rounded-4 shadow-sm border text-center h-100 d-flex flex-column align-items-center transition-all hover-lift">
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "52px", height: "52px", background: "rgba(255, 140, 66, 0.1)" }}>
                <Phone size={24} style={{ color: "var(--prime-orange)" }} />
              </div>
              <h5 className="fw-bold mb-2">Phone</h5>
              <p className="text-muted mb-0 font-monospace" style={{ fontSize: "0.9rem" }}>{supportPhone || "+91 1800 123 4567"}</p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="bg-white p-4 rounded-4 shadow-sm border text-center h-100 d-flex flex-column align-items-center transition-all hover-lift">
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "52px", height: "52px", background: "rgba(255, 140, 66, 0.1)" }}>
                <MapPin size={24} style={{ color: "var(--prime-orange)" }} />
              </div>
              <h5 className="fw-bold mb-2">Office</h5>
              <p className="text-muted mb-0 lh-base" style={{ fontSize: "0.85rem", maxWidth: "250px" }}>{storeLocation || "123 Tech Park, Bangalore"}</p>
            </div>
          </div>
        </div>
      </motion.div>
      <style>{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
        }
        .tracking-wider {
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
