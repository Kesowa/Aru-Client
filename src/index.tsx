import "./index.less";
import { createRoot } from "react-dom/client";
import * as serviceWorker from "./serviceWorker";
import { ENV, Mode } from "./constants";
import App from "./App";
if (ENV == Mode.Prod) {
  console.log = () => {};
  console.error = () => {};
}

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
