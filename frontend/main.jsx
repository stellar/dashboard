import React from "react";
import { createRoot } from "react-dom/client";
import BigNumber from "bignumber.js";
import App from "./components/App.jsx";

// bignumber.js 10+ throws on invalid input; return NaN instead so one bad
// amount does not unmount the whole app.
BigNumber.config({ STRICT: false });

// Add SCSS import
import "./scss/index.scss";

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
