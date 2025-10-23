import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { dataSyncService } from "./services/dataSyncService.ts";

// Start auto-sync service for Star Store data
dataSyncService.startAutoSync();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);