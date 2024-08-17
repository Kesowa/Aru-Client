import React, { lazy, Suspense, useEffect } from "react";
import Loader from "./components/shared/Loader";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { Space, Spin } from "antd";
import "./index.less";
import Login from "./components/Login";
import LoginWrapper from "./components/shared/Wrappers/LoginWrapper";
import Gmap from "./components/shared/Gmap";
import Socket from "./components/shared/Socket";
import DashboardWrapper from "./components/shared/Wrappers/DashboardWrapper";
import { AuthContext, useAuth } from "./services/authUtils";

const ForgotPassword = lazy(() => import("./components/Login/ForgotPassword"));
const Register = lazy(() => import("./components/SignUp"));
const PrivateRoute = lazy(
  () => import("./components/shared/Wrappers/PrivateWrapper")
);
const PublicMap = lazy(() => import("./components/Map/utils/publicMap"));

const App = () => {
  const Token = localStorage.getItem("Token");
  const UserId = localStorage.getItem("UserId");

  const { Auth, login, logout, setUserDetails } = useAuth();

  useEffect(() => {
    if (
      Token &&
      UserId &&
      Token !== "null" &&
      Token !== "undefined" &&
      UserId !== "null" &&
      UserId !== "undefined" &&
      Auth.token === null &&
      Auth.userid === null
    ) {
      login(Token, UserId, null);
    }
  }, []);

  return (
    <React.Fragment>
      <AuthContext.Provider value={{ Auth, login, logout, setUserDetails }} >
      <Socket />
      <Loader />
      <Gmap>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="example">
                <Space size="middle">
                  <Spin size="large" />
                </Space>
              </div>
            }
          >
            <Switch>
              
                <Route exact path="/">
                  <Redirect to={{ pathname: "/dashboard" }} />
                </Route>
                <Route exact path="/map/:id">
                  <PublicMap isBaseMap={true} />
                </Route>
                <Route exact path="/map/:tenantId/:missionId">
                  <PublicMap isMissionMap={true} isBaseMap={true} />
                </Route>
                <Route exact path="/forgot-password">
                  <ForgotPassword />
                </Route>
                <LoginWrapper exact={true} path="/login">
                  <Login />
                </LoginWrapper>
                <LoginWrapper exact={true} path="/sign-up">
                  <Register />
                </LoginWrapper>
                <PrivateRoute path="/dashboard">
                  <DashboardWrapper />
                </PrivateRoute>
                <Route>
                  <Redirect to="/" />
                </Route>
            </Switch>
          </Suspense>
        </BrowserRouter>
      </Gmap>
      </AuthContext.Provider>
    </React.Fragment>
  );
};

export default App;
