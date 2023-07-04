import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { message, Button, Tabs } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import {
  UnorderedListOutlined,
  UserOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import "../Tenant.less";
import { loading } from "../../../../actions/loadingAction";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import BasicInfo from "./BasicInfo";
import RootUser from "./RootUser";
import Stats from "./Stats";

function TenantDetails(props: any) {
  const [tenantDetails, setTenantDetails] = useState(undefined);
  const [loadingTenantDetails, setLoadingTenantDetails] = useState(true);
  const { id } = useParams<any>();

  const fetchTenantDetails = () => {
    setLoadingTenantDetails(true);
    http
      .post(apis.FETCH_TENANT_DETAILS, { tenantId: id })
      .then((result) => {
        if (result.data.status) {
          console.log(result.data.data);
          setTenantDetails(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setLoadingTenantDetails(false);
      });
  };

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  return (
    <div className="tenant-details-wrapper full-width-height">
      <PageHeader
        onBack={() => window.history.back()}
        className="site-page-header-responsive"
        title="Tenant Details"
        subTitle={`Tenant Id : ${id}`}
        extra={[
          <Link to="/dashboard/admin/tenant/list" key="1">
            <Button key="1" type="primary" icon={<UnorderedListOutlined />}>
              Tenant List
            </Button>
          </Link>,
        ]}
      ></PageHeader>
      <div className="tenant-details-inner padding-after-page-header">
        <BasicInfo
          loadingTenantDetails={loadingTenantDetails}
          tenantDetails={tenantDetails}
        />
        <Tabs
          defaultActiveKey="1"
          type="card"
          items={[
            {
              key: "1",
              label: (
                <span>
                  <UserOutlined />
                  Root User Info
                </span>
              ),
              children: (
                <RootUser
                  isLoading={loadingTenantDetails}
                  userData={tenantDetails}
                />
              ),
            },
            {
              key: "2",
              label: (
                <span>
                  <CreditCardOutlined />
                  Organisation Stats
                </span>
              ),
              children: (
                <Stats
                  isLoading={loadingTenantDetails}
                  userData={tenantDetails}
                />
              ),
            },
          ]}
        ></Tabs>
      </div>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  Theme: state.Theme,
});

export default connect(mapStateToProps, { loading, logout })(TenantDetails);
