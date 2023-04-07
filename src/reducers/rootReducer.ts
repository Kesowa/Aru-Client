import { combineReducers } from "redux";
import Loader from "./loaderReducer";
import Auth from "./authReducer";
import Theme from "./themeReducer";
import MissionCreation from "./MissionCreationReducer";
import Gmap from "./gMapReducer";
import Missions from "./missionReducer";
import Location from "./locationReducer";
import Assets from "./assetReducer";
import Models from "./modelReducer";
import Manufacturers from "./manufacturerReducer";
import Client from "./clientReducer";
import User from "./userReducer";
import Package from "./packageReducer";
import Tenant from "./tenantReducer";
import Thread from "./threadReducer";

export default combineReducers({
  Loader,
  Auth,
  Theme,
  MissionCreation,
  Gmap,
  Missions,
  Location,
  Assets,
  Models,
  Manufacturers,
  Client,
  User,
  Package,
  Tenant,
  Thread,
});
