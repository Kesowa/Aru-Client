import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import rootReducer from "./reducers/rootReducer";
import { composeWithDevTools } from "redux-devtools-extension";
import { ENV, Mode } from "./constants";

const initialState = {};
let middleware: any = [];

if (ENV == Mode.Dev) {
  middleware = [thunk, logger];
} else {
  middleware = [thunk];
}

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
