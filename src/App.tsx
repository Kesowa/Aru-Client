import React, { Suspense, lazy } from "react";
import Loader from "./components/shared/Loader";
import { connect } from "react-redux";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { Space, Spin } from "antd";
import "./index.less";
import { login } from "./actions/authAction";
import Login from "./components/Login";
import LoginWrapper from "./components/shared/Wrappers/LoginWrapper";
import Gmap from "./components/shared/Gmap";
import Socket from "./components/shared/Socket";
import DashboardWrapper from "./components/shared/Wrappers/DashboardWrapper";

const ForgotPassword = lazy(() => import("./components/Login/ForgotPassword"));
const Register = lazy(() => import("./components/SignUp"));
const PrivateRoute = lazy(
  () => import("./components/shared/Wrappers/PrivateWrapper")
);
const PublicMap = lazy(() => import("./components/Map/utils/publicMap"));

const App = (props: any) => {
  //auth check if token exist

  // document.body.oncontextmenu = () => false;

  const Token = localStorage.getItem("Token");
  const UserId = localStorage.getItem("UserId");
  //console.log(Token, UserId);
  if (
    Token &&
    UserId &&
    Token !== "null" &&
    Token !== "undefined" &&
    UserId !== "null" &&
    UserId !== "undefined"
  ) {
    props.login(Token, UserId);
  }

  return (
    <React.Fragment>
      <Socket />
      <Gmap>
        <Loader />
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <Redirect to={{ pathname: "/dashboard" }} />
            </Route>
            <Route exact path="/map/:id">
              <Suspense
                fallback={
                  <div className="example">
                    <Space size="middle">
                      <Spin size="large" />
                    </Space>
                  </div>
                }
              >
                <PublicMap isBaseMap={true} />
              </Suspense>
            </Route>
            <Route exact path="/map/:tenantId/:missionId">
              <Suspense
                fallback={
                  <div className="example">
                    <Space size="middle">
                      <Spin size="large" />
                    </Space>
                  </div>
                }
              >
                <PublicMap isMissionMap={true} isBaseMap={true} />
              </Suspense>
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
            <Suspense
              fallback={
                <div className="example">
                  <Space size="middle">
                    <Spin size="large" />
                  </Space>
                </div>
              }
            >
              <PrivateRoute path="/dashboard">
                <DashboardWrapper />
              </PrivateRoute>
            </Suspense>
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </BrowserRouter>
      </Gmap>
    </React.Fragment>
  );
};

const mapStateToProps = (state: any) => ({});
export default connect(mapStateToProps, {
  login,
})(App);
