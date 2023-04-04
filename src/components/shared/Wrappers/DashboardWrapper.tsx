import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { logout, setUserDetails } from "../../../actions/authAction";
import EntryLoader from "../Loader/Entry";
import Dashboard from "../../Dashboard";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { message } from "antd";
import { clientOptions } from "../../../static/sideBarOptions";
import { components } from "src/handlers/schema";
import Register from "../../SignUp";

const themeMap = {
  dark: `/dark-theme.css`,
  light: `/light-theme.css`,
};

function DashboardWrapper(props: any) {
  const [hasPaid, setHasPaid] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const fetchPaymentDetails = () => {
    http
      .get(apis.GET_TENANT_STATS)
      .then((result) => {
        if (result.data.status) {
          if (String(result.data.packageData.name) !== "Trial") {
            setHasPaid(true);
          }
          setIsFetched(true);
        } else {
          message.error(result.status.toString());
          console.log(result);
          props.logout();
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      });
  };
  const fetchUserDetails = () => {
    http
      .get<components["schemas"]["UserDetailsAuthResponse"]>(
        apis.GET_USER_DETAILS
      )
      .then((result) => {
        if (result.data.status) {
          let sidebarOptions: any = null;
          if (result.data.data.userType === "tenant-staff") {
            let permissions: any = [];
            result.data.data.customPermissions.forEach((p) => {
              const filteredPermissions = p.permissions.filter(
                (d) => d.isFrontendRoute === true
              );
              const k = filteredPermissions.map((e) => {
                return {
                  type: "menu",
                  link: e.frontendRoute.trim(),
                  icon: e.sideNavOptionIcon.trim(),
                  text: e.sideNavOptionLabel,
                };
              });
              permissions = [...k, ...permissions];
            });
            sidebarOptions = permissions;
          } else if (result.data.data.userType === "tenant-client") {
            sidebarOptions = [...clientOptions];
          }
          result.data.data.sidebarOptions = sidebarOptions;
          //console.log(result.data.data);
          props.setUserDetails(result.data.data);
        } else {
          message.error(result.status.toString());
          console.log(result);
          props.logout();
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      });
  };

  //fetching user details on component load
  useEffect(() => {
    if (!props.Auth.userdetails || !isFetched) {
      //console.log(props.Auth.userdetails);
      fetchUserDetails();
      fetchPaymentDetails();
    }
  }, [props.Auth.isLoggedIn, isFetched]);

  return (
    <ThemeSwitcherProvider themeMap={themeMap} defaultTheme="light">
      <div>
        {props.Auth.userdetails && isFetched ? (
          hasPaid ? (
            <Dashboard />
          ) : (
            <Register stage={2} tenantId={props.Auth.userdetails.tenantId} />
          )
        ) : (
          <EntryLoader />
        )}
      </div>
    </ThemeSwitcherProvider>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { setUserDetails, logout })(
  DashboardWrapper
);
