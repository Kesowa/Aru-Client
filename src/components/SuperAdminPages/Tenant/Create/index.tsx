import { useState, useEffect, useContext } from "react";
import { Steps, Button, message } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
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
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { Link, useHistory } from "react-router-dom";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

function CreateTenant(props: any) {
  const [formState, setFormState] = useState(0);
  const [tenantData, setTenantData] = useState({});
  const history = useHistory();

  const { logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);

  const goToNextFromBasic = (data: any) => {
    setTenantData({
      ...tenantData,
      ...data,
    });
    setFormState(1);
  };

  const goToNextfromBilling = (data: any) => {
    setTenantData({
      ...tenantData,
      ...data,
    });
    setFormState(2);
  };

  const finalSubmitTenantCreation = (packageId: string) => {
    setLoading(true);
    const body = {
      ...tenantData,
      activePackage: packageId,
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
          history.push(`/dashboard/tenant/details/${result.data.tenantId}`);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
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
        items={[
          { title: "Basic Info", icon: <SolutionOutlined /> },
          { title: "Billing Details", icon: <CreditCardOutlined /> },
          { title: "Package", icon: <ShoppingCartOutlined /> },
        ]}
      ></Steps>
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
        {formState === 2 ? (
          <ChoosePackage
            tenantData={tenantData}
            setFormState={setFormState}
            finalSubmitTenantCreation={finalSubmitTenantCreation}
          />
        ) : null}
      </div>
    </div>
  );
}

export default CreateTenant;
