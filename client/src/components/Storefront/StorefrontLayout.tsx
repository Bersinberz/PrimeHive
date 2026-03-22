import React from "react";
import { Outlet } from "react-router-dom";
import StorefrontNavbar from "./StorefrontNavbar";

const StorefrontLayout: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "var(--prime-bg-soft)" }}>
      <StorefrontNavbar />
      <div className="flex-grow-1">
        <Outlet />
      </div>
    </div>
  );
};

export default StorefrontLayout;
