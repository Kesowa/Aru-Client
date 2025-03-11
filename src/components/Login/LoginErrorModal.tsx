import { useContext, useState } from "react";
import apis from "../../services/apis";
import http from "../../services/httpCall";
import { AxiosErrorHandler } from "../../services/httpErrorHandle";
import { Typography, Form, Input, Button, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import "./index.less";
import KesowaLogo from "../../static/kiv_logo_new.png";
import { clientOptions } from "../../static/sideBarOptions";
import { Link } from "react-router-dom";
import { INSTANCE, Instance } from "src/constants";
import ReactDom from "react-dom";
import "../shared/login-bg.less";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "../shared/Loader";

const OVERLAY_STYLES = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#18447A",
  opacity: 0.9,
  zIndex: 1000,
};
function LoginErrorModal(props: any) {
  const [errMessage, setErrMessage] = useState("");
  const { login, logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);

  setLoading(false);

  const onFinish = (values: any) => {
    http
      .post(apis.LOGIN, values)
      .then((result) => {
        if (result.data.status) {
          //login
          login(result.data.data._id, result.data.data);
        } else {
          setErrMessage(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        setErrMessage(err?.response?.data?.message);
        AxiosErrorHandler(err, logout);
      });
  };

  return ReactDom.createPortal(
    <>
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
          <img src={KesowaLogo} className="brand-logo" alt="kiv-logo" />
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
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
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
            {INSTANCE == Instance.ARU && (
              <Form.Item>
                <Link to="/sign-up">
                  <Button type="default" className="login-form-button">
                    Sign up
                  </Button>
                </Link>
              </Form.Item>
            )}
          </Form>

          <div className="forgot-pas">
            <Link to="/forgot-password">Forgot Password</Link>
          </div>
        </div>
      </div>
    </>,
    document.getElementById("portal-root") as Element
  );
}

export default LoginErrorModal;
