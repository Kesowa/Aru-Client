import { combineReducers } from "redux";
import Missions from "./missionReducer";
import Models from "./modelReducer";
import Manufacturers from "./manufacturerReducer";
import Client from "./clientReducer";
import User from "./userReducer";
import Package from "./packageReducer";
import Tenant from "./tenantReducer";
import Thread from "./threadReducer";

export default combineReducers({
  Missions,
  Models,
  Manufacturers,
  Client,
  User,
  Package,
  Tenant,
  Thread,
});
