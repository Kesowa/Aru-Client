import { useContext, useEffect, useState } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Row, Col, message, Form, Input, Button } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import "../Client.less";
import Unauthorized from "../../../shared/Error/Unauthorized";
import FourOhOne from "../../../shared/Error/FourOhOne";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import InternalServerError from "../../../shared/Error/InternalServerError";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";
import { PERMS } from "src/static/permissions";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

function ChangeClientPassword() {
  const [form] = Form.useForm();
  const [errorState, setErrorState] = useState("");
  const [client, setClient] = useState<any>(null);
  const history = useHistory();

  const { id } = useParams<any>();

  const { Auth, logout } = useContext(AuthContext);
  const userDetails = Auth.userdetails;

  const { setLoading } = useContext(LoaderContext);

  const fetchClientDetails = () => {
    setLoading(true);
    http
      .get(apis.GET_CLIENT_BY_ID, { params: { id } })
      .then((result) => {
        if (result.data.status) {
          console.log(result.data.data);
          setClient(result.data.data);
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
    fetchClientDetails();
  }, []);

  //subimt form
  const onFinish = (data: any) => {
    EditUserAccount(data);
  };

  //auto generate password
  const autoGeneratePassword = () => {
    const password = Array.from(
      crypto.getRandomValues(new Uint8Array(8)),
      (b) => (b % 36).toString(36)
    ).join("");
    form.setFieldsValue({
      password: password,
      ConfirmPassword: password,
    });
  };

  const EditUserAccount = (data: any) => {
    setLoading(true);
    const body = {
      id: client._id,
      ...data,
    };
    http
      .patch(`${apis.EDIT_CLIENT}`, body)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          form.resetFields();
          message.info(result.data.message);
          history.push("/dashboard/tenant/client/list");
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
    if (!Auth.isLoggedIn) {
      setErrorState("unauthorized");
    } else if (
      userDetails.userType === "tenant-client" ||
      (userDetails.userType === "tenant-staff" &&
        !userDetails.customPermissions.includes(PERMS.EDIT_CLIENT))
    ) {
      // clients can't edit other clients' password
      // staff can edit clients' password only if have permission
      setErrorState("401");
    }
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
        <div className="tenant-root-usercreatepage-wrapper full-width-height">
          {client && (
            <>
              <PageHeader
                onBack={() => window.history.back()}
                className="site-page-header-responsive"
                title={`Change Password For Client - ${client.name}`}
                extra={[
                  <Link to="/dashboard/tenant/client/list" key="1">
                    <Button
                      key="1"
                      type="primary"
                      icon={<PlusCircleOutlined />}
                    >
                      List Client
                    </Button>
                  </Link>,
                ]}
              ></PageHeader>
              <div className="padding-after-page-header tenant-organisation-usercreate-inner">
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={onFinish}
                  scrollToFirstError={true}
                  className="user-form"
                >
                  <Row gutter={16} align="bottom">
                    <Col span="8">
                      <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                          {
                            min: 6,
                            message:
                              "Password must be atleast 6 character long!",
                          },
                        ]}
                      >
                        <Input.Password
                          type="password"
                          placeholder="Password"
                        />
                      </Form.Item>
                    </Col>
                    <Col span="8">
                      <Form.Item
                        label="Confirm Password"
                        name="ConfirmPassword"
                        dependencies={["password"]}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(rule, value) {
                              if (
                                !value ||
                                getFieldValue("password") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("The two passwords that you entered do not match!")
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          type="password"
                          placeholder="Password"
                        />
                      </Form.Item>
                    </Col>
                    <Col span="8">
                      <Form.Item>
                        <Button
                          htmlType="button"
                          onClick={autoGeneratePassword}
                        >
                          Auto Generate
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row justify="end" gutter={16}>
                    <Col>
                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          Submit
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
            </>
          )}
        </div>
      );
  }
}

export default ChangeClientPassword;
