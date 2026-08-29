import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { TimerProvider } from "@/context/TimerContext.tsx";

console.log("🚀 Vigil app starting...");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TimerProvider>
        <App />
      </TimerProvider>
    </ThemeProvider>
  </StrictMode>
);