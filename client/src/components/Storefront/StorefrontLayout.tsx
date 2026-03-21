import React from "react";
import { Outlet } from "react-router-dom";
import StorefrontNavbar from "./StorefrontNavbar";

const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-vh-100" style={{ backgroundColor: "var(--prime-bg-soft)" }}>
      <StorefrontNavbar />
      <Outlet />
    </div>
  );
};

export default StorefrontLayout;
