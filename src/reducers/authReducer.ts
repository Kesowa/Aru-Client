import {
  superAdminOptions,
  tenantRootOptions,
  clientOptions,
  getSideBar,
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
              sideBar: getSideBar(action.userdetails),
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
          sideBar: getSideBar(action.payload),
        },
      };
    default:
      return state;
  }
};
