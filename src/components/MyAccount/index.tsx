import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { PageHeader, Tabs } from "antd";
import { loading } from "../../actions/loadingAction";
import { logout } from "../../actions/authAction";
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

const { TabPane } = Tabs;

function Organisation(props: any) {
  const [tenantData, setTenantData] = useState();
  const [errorState, setErrorState] = useState("");
  const history = useHistory();

  const fetchTenantData = () => {
    props.loading(true);
    http
      .get(apis.FETCH_ORGANISATION_BASIC_DETAILS)
      .then((result) => {
        if (result.data.status) {
          console.log(result.data.data);
          setTenantData(result.data.data);
        } else {
          switch (result.data.message) {
            case "You do not have permission to use this API.":
              setErrorState("unauthorized");
              break;
          }
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
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
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
          <Tabs className="padding-after-page-header">
            <TabPane tab="Details" key="1">
              <>
                <TenantInfo
                  setTenantData={setTenantData}
                  tenantData={tenantData}
                />
                {/* <Row gutter={16}>
                                    <Col span="12" className="">
                                        <EmailChanger setTenantData={setTenantData} tenantData={tenantData} />
                                    </Col>
                                    <Col span="12" className="">
                                        <PhoneNumberChanger setTenantData={setTenantData} tenantData={tenantData} />
                                    </Col>
                                </Row> */}
              </>
            </TabPane>
            <TabPane tab="Package" key="2">
              <OrganisationPackageDetails tenantData={tenantData} />
            </TabPane>
          </Tabs>
        </div>
      );
  }
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { loading, logout })(Organisation);
