import { combineReducers } from "redux";
import Models from "./modelReducer";
import Manufacturers from "./manufacturerReducer";
import Thread from "./threadReducer";

export default combineReducers({
  Models,
  Manufacturers,
  Thread,
});
