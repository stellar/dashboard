import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App.jsx";

// Self-hosted brand fonts (Stellar Brand Guidelines 2026)
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/lora/500.css";
import "@fontsource/lora/600.css";

// Add SCSS import
import "./scss/index.scss";

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
