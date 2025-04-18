import { useState, useEffect, useContext } from "react";
import { Tabs } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import http from "../../services/httpCall";
import apis from "../../services/apis";
import TenantInfo from "./utils/TenantInfo";
import OrganisationPackageDetails from "./utils/OrganisationPackageDetails";
import { AxiosErrorHandler } from "../../services/httpErrorHandle";
import "./index.less";
import Unauthorized from "../shared/Error/Unauthorized";
import FourOhOne from "../shared/Error/FourOhOne";
import GatewayTimeout from "../shared/Error/GatewayTimeout";
import InternalServerError from "../shared/Error/InternalServerError";
import ServiceUnavailable from "../shared/Error/ServiceUnavailable";
import type { TabsProps } from "antd";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "../shared/Loader";

function Organisation() {
  const [tenantData, setTenantData] = useState();
  const [errorState, setErrorState] = useState("");
  const { logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Details`,
      children: (
        <TenantInfo setTenantData={setTenantData} tenantData={tenantData} />
      ),
    },
    {
      key: "2",
      label: `Package`,
      children: <OrganisationPackageDetails tenantData={tenantData} />,
    },
  ];
  const fetchTenantData = () => {
    setLoading(true);
    http
      .get(apis.FETCH_ORGANISATION_BASIC_DETAILS)
      .then((result) => {
        if (result.data.status) {
          console.log(result.data.data);
          setTenantData(result.data.data);
        } else if (result.data.message === "You do not have permission to use this API.") {
          setErrorState("unauthorized");
        }
      })
      .catch((err) => {
        //console.log(err.code.toString());

        // switch(err.status.toString()) {
        //     case "401":
        //         setErrorState("401");
        //         break;
        //     case "503":
        //         setErrorState("503");
        //         break;
        //     case "504":
        //         setErrorState("504");
        //         break;
        //     default:
        //         setErrorState("500");
        // }
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  switch (errorState) {
    case "unauthorized":
      return <Unauthorized />;

    case "401":
      return <FourOhOne />;
    case "500":
      return <InternalServerError />;
    case "503":
      return <ServiceUnavailable />;
    case "504":
      return <GatewayTimeout />;

    default:
      return (
        <div className="tenant-root-organisation-wrapper full-width-height">
          <PageHeader
            onBack={() => window.history.back()}
            className="site-page-header-responsive"
            title="My Account"
            subTitle="Details"
            extra={[]}
          ></PageHeader>
          <Tabs className="padding-after-page-header" items={items} />
        </div>
      );
  }
}

export default Organisation;
