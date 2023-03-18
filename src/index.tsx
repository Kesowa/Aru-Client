import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import "./index.less";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import store from "./store";
import { ENV, Mode } from "./constants";
import { Space, Spin } from "antd";
const App = lazy(() => import("./App"));
if (ENV == Mode.Prod) {
  console.log = () => {};
  console.error = () => {};
}

ReactDOM.render(
  <React.Fragment>
    <Provider store={store}>
      <Suspense
        fallback={
          <div className="example">
            <Space size="middle">
              <Spin size="large" />
            </Space>
          </div>
        }
      >
        <App />
      </Suspense>
    </Provider>
  </React.Fragment>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
