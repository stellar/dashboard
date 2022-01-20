import ReactDOM from "react-dom";
import { App } from "./App";
import * as serviceWorker from "./serviceWorker";

// Import global CSS from Stellar Design System
import "@stellar/design-system/build/styles.min.css";

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
