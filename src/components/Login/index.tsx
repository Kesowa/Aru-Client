import { useContext, useState } from "react";
import apis from "../../services/apis";
import http from "../../services/httpCall";
import { useHistory, useLocation } from "react-router-dom";
import { AxiosErrorHandler } from "../../services/httpErrorHandle";
import { Typography, Form, Input, Button, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import "./index.less";
import { clientOptions } from "../../static/sideBarOptions";
import { Link } from "react-router-dom";
import { components } from "src/handlers/schema";
import Logo from "../shared/Logo";
import "../shared/login-bg.less";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "../shared/Loader";

function Login() {
  const [errMessage, setErrMessage] = useState("");
  const location = useLocation();
  const history = useHistory();
  console.log("location", location);
  const { from } = location.state || { from: { pathname: "/" } };
  const { login, logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);

  const onFinish = (values: any) => {
    setLoading(true);
    http
      .post<components["schemas"]["LoginAuthResponse"]>(apis.LOGIN, values)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          //login
          login(
            result.data.token,
            result.data.data._id,
            result.data.data
          );
          history.replace(from);
        } else {
          setErrMessage(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        setErrMessage(err?.response?.data?.message);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="login-container login-page login-bg">
      <div className="login-section-wrapper">
        {errMessage && (
          <Alert
            style={{ marginBottom: "15px" }}
            message={errMessage}
            type="error"
            closeText="Close Now"
            onClose={() => setTimeout(() => setErrMessage(""), 500)}
          />
        )}
        <Typography.Title level={1}>Aru</Typography.Title>
        <Logo className="brand-logo" alt="kiv-logo" />
        <Form name="login-form" className="login-form" onFinish={onFinish}>
          <Form.Item
            name="email"
            hasFeedback={true}
            rules={[
              {
                required: true,
                message: "Please input your E-mail!",
              },
              {
                type: "email",
                message: "The input is not valid E-mail!",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="email id"
            />
          </Form.Item>
          <Form.Item
            name="password"
            hasFeedback={true}
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Log in
            </Button>
          </Form.Item>
          <Form.Item>
            <Link to="/sign-up">
              <Button type="default" className="login-form-button">
                Sign up
              </Button>
            </Link>
          </Form.Item>
        </Form>

        <div className="forgot-pas">
          <Link to="/forgot-password">Forgot Password</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
