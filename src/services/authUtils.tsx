import { createContext, useState } from "react";
import http from "./httpCall";
import { getSideBar } from "src/static/sideBarOptions";

export interface IAuth {
  isLoggedIn: boolean;
  token: string | null;
  userid: string | null;
  userdetails: any;
  isError: boolean;
}

const AuthInit: IAuth = {
  isLoggedIn: false,
  token: null,
  userid: null,
  userdetails: null,
  isError: false,
};

export const AuthContext = createContext({
  Auth: AuthInit,
  login: (token: string, userid: string, userdetails: any) => {},
  logout: (isError?: boolean) => {},
  setUserDetails: (userDteails: any) => {},
});

export const useAuth = (init: IAuth = AuthInit) => {
  const [Auth, SetAuth] = useState<IAuth>(init);

  const login = (token: string, userid: string, userdetails: any) => {
    console.log("Login Called");
    localStorage.setItem("Token", token);
    http.defaults.headers.common["Authorization"] = "Bearer " + token;
    localStorage.setItem("UserId", userid);
    http.defaults.headers.common["userid"] = userid;
    SetAuth({
      isLoggedIn: true,
      token,
      userid,
      userdetails: userdetails ? {
          ...userdetails,
          sideBar: getSideBar(userdetails),
        }
      : null,
      isError: false,
    });
  }

  const logout = (isError: boolean = false) => {
    console.log("Logout Called", isError);
    localStorage.removeItem("Token");
    localStorage.removeItem("UserId");
    SetAuth({
      isLoggedIn: false,
      token: null,
      userid: null,
      userdetails: null,
      isError
    });
  }

  const setUserDetails = (user: any) => {
    console.log("SetUserDetails Called");
    SetAuth({
      ...Auth,
      userdetails: user ? {
        ...user,
        sideBar: getSideBar(user),
      }
      : null,
    });
  }

  return { Auth, login, logout, setUserDetails };
}