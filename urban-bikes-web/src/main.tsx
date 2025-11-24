import React from "react";
import ReactDOM from "react-dom/client";
import MapPage from "./MapPage";

function getSessionId(): string {
  const url = new URL(window.location.href);
  return url.searchParams.get("session") || "demo-session";
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MapPage sessionId={getSessionId()} />
  </React.StrictMode>
);
