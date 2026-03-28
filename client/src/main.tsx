import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initSentry } from "./config/sentry";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./index.css";

import App from "./App";
import GlobalErrorOverlay from "./components/GlobalErrorOverlay";

// Initialize Sentry before rendering
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalErrorOverlay />
    <App />
  </StrictMode>
);