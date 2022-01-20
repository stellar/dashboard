import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.js";

require("./index.html");
require("./scss/index.scss");

ReactDOM.render(<App></App>, document.getElementById("app"));
