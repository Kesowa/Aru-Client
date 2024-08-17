import { useContext, useState } from "react";
import apis from "../../services/apis";
import http from "../../services/httpCall";
import { loading } from "../../actions/loadingAction";
import { connect } from "react-redux";
import { AxiosErrorHandler } from "../../services/httpErrorHandle";
import { Typography, Form, Input, Button, Alert } from "antd";
import { MailOutlined } from "@ant-design/icons";
import "./index.less";
import AryaLogo from "../../static/kesowa-logo.svg";
import { components } from "src/handlers/schema";
import "../shared/login-bg.less";
import { AuthContext } from "src/services/authUtils";

function ForgotPassword(props: any) {
  const [messageType, setmessageType] = useState<any>("");
  const [msg, setMsg] = useState("");

  const { logout } = useContext(AuthContext);

  const onFinish = (values: any) => {
    props.loading(true);
    http
      .post<components["schemas"]["ForgotPasswordAuthResponse"]>(
        apis.FORGOT_PASSWORD,
        values
      )
      .then((result) => {
        if (result.data.status) {
          //login
          setmessageType("success");
          setMsg(result.data.message);
        } else {
          setmessageType("error");
          setMsg(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  return (
    <div className="login-page login-container login-bg">
      <div className="login-section-wrapper">
        {msg && (
          <Alert
            style={{ marginBottom: "15px" }}
            message={msg}
            type={messageType}
            onClose={() => setTimeout(() => setMsg(""), 500)}
            showIcon
            closable
          />
        )}
        <Typography.Title level={1}>Aru</Typography.Title>
        <img src={AryaLogo} className="brand-logo" alt="brand-logo" />
        <p className="brand-sub-name">By Kesowa</p>
        <p className="brand-sub-name">Enter Your registered email</p>
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
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default connect(null, {
  loading,
})(ForgotPassword);
