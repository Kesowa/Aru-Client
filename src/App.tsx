import React from "react";
import Loader from "./components/shared/Loader";
import { connect } from "react-redux";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import LoginWrapper from "./components/shared/Wrappers/LoginWrapper";
import PrivateRoute from "./components/shared/Wrappers/PrivateWrapper";
import Login from "./components/Login";
import Register from "./components/SignUp";
import ForgotPassword from "./components/Login/ForgotPassword";
import DashboardWrapper from "./components/shared/Wrappers/DashboardWrapper";
import Gmap from "./components/shared/Gmap";
import Socket from "./components/shared/Socket";
import { login } from "./actions/authAction";
import PublicMap from "./components/Map/utils/publicMap";

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
              <PublicMap isBaseMap={true} />
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
        </BrowserRouter>
      </Gmap>
    </React.Fragment>
  );
};

const mapStateToProps = (state: any) => ({});
export default connect(mapStateToProps, {
  login,
})(App);
