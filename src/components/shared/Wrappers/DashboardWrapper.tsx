import React, { lazy, useContext, useEffect, useState } from "react";
import EntryLoader from "../Loader/Entry";
import Dashboard from "../../Dashboard";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { message } from "antd";
import { components } from "src/handlers/schema";
import { AuthContext } from "src/services/authUtils";
const Register = lazy(() => import("../../../components/SignUp"));

const themeMap = {
  dark: `/dark-theme.css`,
  light: `/light-theme.css`,
};

function DashboardWrapper() {
  const [isFetched, setIsFetched] = useState(false);
  const { Auth, logout, setUserDetails } = useContext(AuthContext);

  const fetchUserDetails = () => {
    http
      .get<components["schemas"]["UserDetailsAuthResponse"]>(
        apis.GET_USER_DETAILS
      )
      .then((result) => {
        if (result.data.status) {
          setUserDetails(result.data.data);
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
      .finally(() => setIsFetched(true));
  };

  //fetching user details on component load
  useEffect(() => {
    if (!Auth.userdetails || !isFetched) {
      fetchUserDetails();
    }
  }, [Auth.isLoggedIn]);

  return (
    <ThemeSwitcherProvider themeMap={themeMap} defaultTheme="light">
      <div>
        {Auth.userdetails && isFetched ? (
          <Dashboard />
        ) : (
          <EntryLoader />
        )}
      </div>
    </ThemeSwitcherProvider>
  );
}

export default DashboardWrapper;
