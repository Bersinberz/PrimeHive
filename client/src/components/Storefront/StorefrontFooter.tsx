import React from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

const StorefrontFooter: React.FC = () => {
  const navigate = useNavigate();
  const { storeName, supportEmail, supportPhone } = useSettings();

  const col = (title: string, links: { label: string; to?: string; href?: string }[]) => (
    <div style={{ minWidth: 160 }}>
      <div className="fw-bold mb-3" style={{ fontSize: "0.9rem", color: "#fff" }}>{title}</div>
      <ul className="list-unstyled m-0 d-flex flex-column gap-2">
        {links.map(({ label, to, href }) => (
          <li key={label}>
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "0.82rem", color: "#ccc", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#ccc")}>
                {label}
              </a>
            ) : (
              <button onClick={() => to && navigate(to)}
                className="btn p-0 border-0 bg-transparent text-start"
                style={{ fontSize: "0.82rem", color: "#ccc" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#ccc")}>
                {label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer style={{ background: "var(--footer-bg)", color: "#ccc", marginTop: 0 }}>

      {/* Main link columns */}
      <div className="container py-5" style={{ maxWidth: 1200 }}>
        <div className="d-flex flex-wrap gap-5">
          {col("Connect with Us", [
            { label: "Facebook", href: "https://facebook.com" },
            { label: "Twitter", href: "https://twitter.com" },
            { label: "Instagram", href: "https://instagram.com" },
          ])}
          {col("Shop with Us", [
            { label: "Browse Products", to: "/browse" },
            { label: "Your Cart", to: "/cart" },
            { label: "My Orders", to: "/orders" },
          ])}
          {col("Let Us Help You", [
            { label: "Your Account", to: "/account" },
            { label: "Returns Centre", to: "/returns" },
            { label: "Shipping Policy", to: "/shipping-policy" },
            { label: "FAQ", to: "/faq" },
          ])}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #3a4553" }} />

      {/* Copyright row */}
      <div className="container py-4 d-flex align-items-center justify-content-center" style={{ maxWidth: 1200 }}>
        <span style={{ fontSize: "0.78rem", color: "#888" }}>
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #3a4553" }} />

      {/* Bottom sub-links */}
      <div className="container py-3" style={{ maxWidth: 1200 }}>
        <div className="d-flex flex-wrap gap-4 justify-content-center">
          {[
            { label: "Privacy Policy", to: "/privacy-policy" },
            { label: "Terms of Use", to: "/terms-of-use" },
            { label: "Shipping Policy", to: "/shipping-policy" },
            { label: "Returns Policy", to: "/returns" },
            { label: "FAQ", to: "/faq" },
          ].map(({ label, to }) => (
            <button key={label} onClick={() => navigate(to)}
              className="btn p-0 border-0 bg-transparent"
              style={{ fontSize: "0.75rem", color: "#888" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ccc")}
              onMouseLeave={e => (e.currentTarget.style.color = "#888")}>
              {label}
            </button>
          ))}
        </div>
      </div>

    </footer>
  );
};

export default StorefrontFooter;