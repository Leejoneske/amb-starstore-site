import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

const renderBootFallback = () => {
  if (rootElement.childElementCount > 0) return;

  document.documentElement.classList.add("dark");
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:hsl(224 71% 4%);color:hsl(210 40% 98%);font-family:Inter,system-ui,sans-serif;">
      <div style="max-width:560px;text-align:center;">
        <h1 style="margin:0 0 12px;font-size:32px;line-height:1.1;font-family:'Libre Baskerville', Georgia, serif;">StarStore is loading into safe mode</h1>
        <p style="margin:0 0 16px;color:hsl(217 11% 65%);font-size:16px;line-height:1.6;">The app hit a startup error before React finished mounting. Reload the page once. If it keeps happening, the deployment is missing a required environment variable.</p>
        <button onclick="window.location.reload()" style="border:0;border-radius:999px;padding:12px 18px;background:hsl(263 70% 50%);color:hsl(210 40% 98%);font:inherit;cursor:pointer;">Reload page</button>
      </div>
    </div>
  `;
};

const scheduleBootFallback = () => {
  window.setTimeout(() => {
    renderBootFallback();
  }, 0);
};

window.addEventListener("error", (event) => {
  console.error("Global runtime error:", event.error ?? event.message);
  scheduleBootFallback();
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  scheduleBootFallback();
});

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error("App boot failed:", error);
  renderBootFallback();
}