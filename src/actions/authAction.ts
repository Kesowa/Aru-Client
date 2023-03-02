import http from "../services/httpCall";

export const login = (token: string, userid: string, userdetails: any) => {
  http.defaults.headers.common["Authorization"] = "Bearer " + token;
  http.defaults.headers.common["userid"] = userid;
  return {
    type: "LOGIN",
    token: token,
    userid: userid,
    userdetails: userdetails,
  };
};

export const logout = (isError: boolean = false) => {
  localStorage.removeItem("Token");
  localStorage.removeItem("UserId");
  return {
    type: "LOGOUT",
    isError: isError,
  };
};

export const setUserDetails = (user: any) => {
  return {
    type: "SET_USER_DETAILS",
    payload: user,
  };
};
