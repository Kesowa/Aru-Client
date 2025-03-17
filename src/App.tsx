import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import Loader, { LoaderContext, useLoader } from "./components/shared/Loader";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { message, Space, Spin } from "antd";
import "./index.less";
import Login from "./components/Login";
import LoginWrapper from "./components/shared/Wrappers/LoginWrapper";
import Socket from "./components/shared/Socket";
import DashboardWrapper from "./components/shared/Wrappers/DashboardWrapper";
import { AuthContext, useAuth } from "./services/authUtils";
import { useScripts } from "./services/loadScripts";
import { ThreadContext, useThread } from "./services/threadUtils";
import http from "./services/httpCall";
import { Components } from "./handlers/schema";
import apis from "./services/apis";
import { AxiosErrorHandler } from "./services/httpErrorHandle";
import EntryLoader from "./components/shared/Loader/Entry";

const ForgotPassword = lazy(() => import("./components/Login/ForgotPassword"));
const Register = lazy(() => import("./components/SignUp"));
const PrivateRoute = lazy(
  () => import("./components/shared/Wrappers/PrivateWrapper")
);
const PublicMap = lazy(() => import("./components/Map/utils/publicMap"));

const App = () => {
  const { Auth, login, logout, setUserDetails } = useAuth();
  const { loading, setLoading } = useLoader(0);
  const { thread, openThread, closeThread } = useThread();

  const [userDetailsFetched, setUserDetailsFetched] = useState(false);

  const fetchUserDetails = () => {
    setLoading(true);
    http
      .get<Components["schemas"]["UserDetailsAuthResponse"]>(
        apis.GET_USER_DETAILS
      )
      .then((result) => {
        if (result.data.status) {
          login(result.data.data._id, result.data.data);
        } else {
          message.error(result.status.toString());
          console.log(result);
          logout();
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setUserDetailsFetched(true);
        setLoading(false);
      });
  };

  //fetching user details on component load
  useEffect(() => {
    if (Auth.userdetails) {
      setUserDetailsFetched(true);
    } else {
      fetchUserDetails();
    }
  }, []);

  const { mapScriptLoaded, paymentScriptLoaded } = useScripts();

  const memoizedLoaderContextValue = useMemo(() => ({ loading, setLoading }), [loading, setLoading]);
  const memoizedAuthContextValue = useMemo(() => ({ Auth, login, logout, setUserDetails }), [Auth, login, logout, setUserDetails]);
  const memoizedThreadContextValue = useMemo(() => ({ thread, openThread, closeThread }), [thread, openThread, closeThread]);

  return userDetailsFetched ? (
    <React.Fragment>
      <LoaderContext.Provider value={memoizedLoaderContextValue}>
        <AuthContext.Provider value={memoizedAuthContextValue}>
          <ThreadContext.Provider value={memoizedThreadContextValue}>
            <Socket />
            <Loader />
            {mapScriptLoaded && paymentScriptLoaded && (
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
            )}
          </ThreadContext.Provider>
        </AuthContext.Provider>
      </LoaderContext.Provider>
    </React.Fragment>
  ) : (
    <EntryLoader />
  );
};

export default App;
