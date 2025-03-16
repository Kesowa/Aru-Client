import { useState, useEffect, useContext } from "react";
import { UnorderedListOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Row, Col, message, Transfer, Form, Input, Button } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import RenderSideBar from "../RenderSideBar";
import "../UserGroup.less";
import Unauthorized from "../../../shared/Error/Unauthorized";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";
import FourOhOne from "../../../shared/Error/FourOhOne";
import InternalServerError from "../../../shared/Error/InternalServerError";
import CountLimit from "../../restrictions/restrictions";
import Expired from "../../restrictions/expiry";
import { PERMS } from "src/static/permissions";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

function UserGroupCreatePage(props: any) {
  const [form] = Form.useForm();
  const [allPermissions, setAllPermissions] = useState<PERMS[]>([]);
  // const [selectedPermissionsIds, setSelectedPermissionsIds] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState<PERMS[]>([]);
  const [errorState, setErrorState] = useState("");

  const { logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);

  const fetchAllPermissions = () => {
    setLoading(true);
    http
      .get(apis.FETCH_TENANT_PERMISSION_LIST)
      .then((result) => {
        if (result.data.status) {
          setAllPermissions(result.data.data);
        } else if (result.data.message === "You do not have permission to use this API.") {
          setErrorState("unauthorized");
        }
      })
      .catch((err) => {
        console.log(err);
        switch (err.status.toString()) {
          case "401":
            setErrorState("401");
            break;
          case "503":
            setErrorState("503");
            break;
          case "504":
            setErrorState("504");
            break;
          default:
            setErrorState("500");
        }
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllPermissions();
  }, []);

  const transferchange = (targetKeys: any) => {
    const arr = allPermissions.filter((ele: string) =>
      targetKeys.includes(ele)
    );
    // setSelectedPermissionsIds(targetKeys);
    setSelectedPermissions(arr);
  };

  //subimt form
  const onFinish = (data: any) => {
    if (selectedPermissions.length > 0) {
      createUserGroup(data);
    } else {
      message.error(
        "You must select at least one permission to create the user group"
      );
    }
  };

  const createUserGroup = (data: any) => {
    setLoading(true);
    const body = {
      name: data.name,
      permissions: selectedPermissions,
    };
    http
      .post(apis.CREATE_TENANT_USER_GROUP, body)
      .then((result) => {
        if (result.data.status) {
          message.info(result.data.message);
          form.resetFields();
          setSelectedPermissions([]);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 403) {
          if (
            err.response.data.message === "Package has expired! Please renew!"
          ) {
            setErrorState("403-expiry");
            window.setTimeout(function() {
              AxiosErrorHandler(err, logout);
            }, 5000);
          } else {
            setErrorState("403");
          }
        }
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  switch (errorState) {
    case "unauthorized":
      return <Unauthorized />;
    case "401":
      return <FourOhOne />;
    case "403":
      return (
        <CountLimit content="Oops! You have reached your organisation usergroup limit!" />
      );
    case "403-expiry":
      return <Expired />;
    case "503":
      return <ServiceUnavailable />;
    case "504":
      return <GatewayTimeout />;
    case "500":
      return <InternalServerError />;
    default:
      return (
        <div className="tenant-root-usergroupcreate-wrapper full-width-height">
          <PageHeader
            onBack={() => window.history.back()}
            className="site-page-header-responsive"
            title="User Group"
            subTitle="create new user group"
            extra={[
              <Link to="/dashboard/tenant/user-group/list" key="1">
                <Button key="1" type="primary" icon={<UnorderedListOutlined />}>
                  User Group List
                </Button>
              </Link>,
            ]}
          ></PageHeader>
          <div className="padding-after-page-header tenant-usergroupcreate-inner">
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              scrollToFirstError={true}
              className="user-group-form"
            >
              <Row gutter={16}>
                <Col span="16">
                  <Form.Item
                    label="Group Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the group name!",
                      },
                    ]}
                  >
                    <Input type="text" />
                  </Form.Item>
                  <Transfer
                    dataSource={allPermissions.map(perm => ({ key: perm, title: perm }))}
                    showSearch
                    filterOption={(inputValue, { title }) => title.toLowerCase().includes(inputValue.toLowerCase())}
                    listStyle={{
                      width: "100%",
                      height: 400,
                    }}
                    onChange={transferchange}
                    render={(item) => <span aria-valuetext={item.key} style={{ textTransform: "capitalize" }}>{item.title.replaceAll('_', ' ')}</span>}
                    targetKeys={selectedPermissions}
                    oneWay
                  />
                </Col>
                <Col span="8">
                  <RenderSideBar selectedPermissions={selectedPermissions} />
                </Col>
              </Row>
              <Row justify="end" gutter={16}>
                <Col>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Create Group
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      );
  }
}

export default UserGroupCreatePage;
