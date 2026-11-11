import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import "./styles/tailwind.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Application root element was not found.");
}

document.documentElement.classList.add("min-h-full");
document.body.classList.add("m-0", "min-h-full", "bg-black");
root.classList.add("min-h-full");

// Offline use and installing as an app, where the page is served: a saved copy
// of the file and the desktop app need neither.
if (
  "serviceWorker" in navigator &&
  (window.location.protocol === "https:" ||
    window.location.hostname === "localhost")
) {
  // sw.js is copied in beside the built page, not bundled, so the call is
  // written in a way Parcel does not try to resolve.
  const { serviceWorker } = navigator;

  serviceWorker["register"]("sw.js").catch(() => undefined);
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
