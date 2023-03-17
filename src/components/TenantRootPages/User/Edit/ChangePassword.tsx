import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { PlusCircleOutlined } from "@ant-design/icons";
import { PageHeader, Row, Col, message, Form, Input, Button } from "antd";
import { loading } from "../../../../actions/loadingAction";
import { logout } from "../../../../actions/authAction";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { Link } from "react-router-dom";
import "../User.less";
import Unauthorized from "../../../shared/Error/Unauthorized";
import FourOhOne from "../../../shared/Error/FourOhOne";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import InternalServerError from "../../../shared/Error/InternalServerError";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";

function UserChangePassword(props: any) {
  const [form] = Form.useForm();
  const [errorState, setErrorState] = useState("");
  const history = useHistory();

  //subimt form
  const onFinish = (data: any) => {
    console.log(data);
    EditUserAccount(data);
  };

  //auto generate password
  const autoGeneratePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    form.setFieldsValue({
      password: password,
      ConfirmPassword: password,
    });
  };

  const EditUserAccount = (data: any) => {
    props.loading(true);
    const body = {
      id: props.user._id,
      ...data,
    };
    http
      .patch(`${apis.EDIT_USER}`, body)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          form.resetFields();
          message.success("User Password Successfully Changed");
          history.push("/dashboard/tenant/user/list");
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
          {props.user && (
            <>
              <PageHeader
                onBack={() => window.history.back()}
                className="site-page-header-responsive"
                title={`Change Password For User - ${props.user.name}`}
                // subTitle={`Change password for user ${props.user.name}`}
                extra={[
                  <Link to="/dashboard/tenant/user/list" key="1">
                    <Button
                      key="1"
                      type="primary"
                      icon={<PlusCircleOutlined />}
                    >
                      List User
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
                                "The two passwords that you entered do not match!"
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

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
  user: state.User.userToEdit,
});

export default connect(mapStateToProps, { loading, logout })(
  UserChangePassword
);
