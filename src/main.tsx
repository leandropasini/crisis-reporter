import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import LandingPage from "./pages/LandingPage";

// SW activates with skipWaiting+clientsClaim on deploy, but an already-open
// tab keeps running its old JS until reloaded. Reload once when a new SW
// takes control so users always end up on the latest bundle.
if ("serviceWorker" in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<App mode="demo" />} />
        <Route path="/app" element={<App mode="live" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
