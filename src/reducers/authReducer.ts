import {
  superAdminOptions,
  tenantRootOptions,
  clientOptions,
} from "../static/sideBarOptions";
const initialState = {
  isLoggedIn: false,
  token: null,
  userid: null,
  userdetails: null,
  isError: false,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isLoggedIn: true,
        token: action.token,
        userid: action.userid,
        isError: false,
        userdetails: action.userdetails
          ? {
              ...action.userdetails,
              sideBar:
                action.userdetails.userType === "tenant-root"
                  ? tenantRootOptions
                  : superAdminOptions,
            }
          : null,
      };
    case "LOGOUT":
      console.log("Action", action);
      return {
        ...state,
        isLoggedIn: false,
        token: null,
        userdetails: null,
        isError: action.isError,
      };
    case "SET_USER_DETAILS":
      return {
        ...state,
        userdetails: {
          ...action.payload,
          sideBar: action.payload.sidebarOptions
            ? action.payload.sidebarOptions
            : action.payload.userType === "tenant-root"
            ? tenantRootOptions
            : superAdminOptions,
        },
      };
    default:
      return state;
  }
};
