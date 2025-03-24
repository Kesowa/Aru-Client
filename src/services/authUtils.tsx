import { createContext, useState } from "react";
import { getSideBar } from "src/static/sideBarOptions";
import apis from "./apis";
import http from "./httpCall";

export interface IAuth {
  isLoggedIn: boolean;
  userid: string | null;
  userdetails: any;
  isError: boolean;
}

const AuthInit: IAuth = {
  isLoggedIn: false,
  userid: null,
  userdetails: null,
  isError: false,
};

export const AuthContext = createContext({
  Auth: AuthInit,
  login: (userid: string, userdetails: any) => {},
  logout: (isError?: boolean) => {},
  setUserDetails: (userDetails: any) => {},
});

export const useAuth = (init: IAuth = AuthInit) => {
  const [Auth, SetAuth] = useState<IAuth>(init);

  const login = (userid: string, userdetails: any) => {
    console.log("Login Called");
    SetAuth({
      isLoggedIn: true,
      userid,
      userdetails: userdetails
        ? {
            ...userdetails,
            sideBar: getSideBar(userdetails),
          }
        : null,
      isError: false,
    });
  };

  const logout = (isError: boolean = false) => {
    console.log("Logout Called", isError);
    http.post(apis.LOGOUT).then(() => {
      SetAuth({
        isLoggedIn: false,
        userid: null,
        userdetails: null,
        isError,
      });
    });
  };

  const setUserDetails = (user: any) => {
    console.log("SetUserDetails Called");
    SetAuth({
      ...Auth,
      userdetails: user
        ? {
            ...user,
            sideBar: getSideBar(user),
          }
        : null,
    });
  };

  return { Auth, login, logout, setUserDetails };
};
