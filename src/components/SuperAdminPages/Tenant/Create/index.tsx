import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { PageHeader, Steps, Button, message } from "antd";
import {
  UnorderedListOutlined,
  SolutionOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import BasicInfo from "./BasicInfo";
import ChoosePackage from "./ChoosePackage";
import BillingDetails from "./BillingDetails";
import "../Tenant.less";
import { loading } from "../../../../actions/loadingAction";
import { logout } from "../../../../actions/authAction";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { Link } from "react-router-dom";

function CreateTenant(props: any) {
  const [formState, setFormState] = useState(0);
  const [tenantData, setTenantData] = useState({});

  const goToNextFromBasic = (data: any) => {
    setTenantData({
      ...tenantData,
      ...data,
    });
    setFormState(1);
  };

  const goToNextfromBilling = (data: any) => {
    props.loading(true);
    const body = {
      ...tenantData,
      ...data,
    };
    setTenantData(body);
    //call api
    http
      .post(apis.CREATE_TENANT_ACCOUNT, body)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          setTenantData({
            ...tenantData,
            _id: result.data.tenantId,
          });
          setFormState(2);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  useEffect(() => {
    console.log(tenantData);
  }, [tenantData]);

  return (
    <div className="tenant-add-wrapper full-width-height">
      <PageHeader
        className="site-page-header-responsive"
        title="Add Tenant"
        subTitle="Register a new tenant"
        extra={[
          <Link to="/dashboard/admin/tenant/list" key="1">
            <Button key="1" type="primary" icon={<UnorderedListOutlined />}>
              Tenant List
            </Button>
          </Link>,
        ]}
      ></PageHeader>
      <Steps
        type="navigation"
        className="site-navigation-steps"
        current={formState}
      >
        <Steps.Step title="Basic Info" icon={<SolutionOutlined />} />
        <Steps.Step title="Billing Details" icon={<CreditCardOutlined />} />
        <Steps.Step title="Package" icon={<ShoppingCartOutlined />} />
      </Steps>
      <div className="tenant-add-form padding-after-page-header">
        {formState === 0 ? (
          <BasicInfo
            tenantData={tenantData}
            goToNextFromBasic={goToNextFromBasic}
          />
        ) : null}
        {formState === 1 ? (
          <BillingDetails
            tenantData={tenantData}
            setFormState={setFormState}
            goToNextfromBilling={goToNextfromBilling}
          />
        ) : null}
        {formState === 2 ? <ChoosePackage tenantData={tenantData} /> : null}
      </div>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  Theme: state.Theme,
});

export default connect(mapStateToProps, { loading, logout })(CreateTenant);
