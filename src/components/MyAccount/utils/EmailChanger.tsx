import { useState, useEffect, useContext } from "react";
import { Form, Input, Row, Col, message, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { connect } from "react-redux";
import { loading } from "../../../actions/loadingAction";
import { AuthContext } from "src/services/authUtils";

function EmailChanger(props: any) {
  const [form] = Form.useForm();
  const [isEmailFieldDisabled, setIsEmailFieldDisabled] = useState(true);
  const [isOTPGenerated, setIsOTPGenerated] = useState(false);
  const [isOTPResending, setIsOTPResending] = useState(false);

  const { logout } = useContext(AuthContext);

  const makeEmailFieldEditable = (e: any) => {
    e.preventDefault();
    setIsEmailFieldDisabled(false);
  };

  useEffect(() => {
    if (props.tenantData) {
      form.setFieldsValue(props.tenantData);
    }
  }, [props.tenantData]);

  const onFinish = (data: any) => {
    console.log(data);
    if (data.otp) {
      validateOtp(data);
    } else {
      getOTP(data);
    }
  };

  //get otp
  const getOTP = (data: any) => {
    setIsEmailFieldDisabled(true);
    props.loading(true);
    http
      .post(apis.REQUEST_OTP_FOR_TEANT_EMAIL_CHANGE, {
        email: data.email,
      })
      .then((result) => {
        if (result.data.status) {
          setIsOTPGenerated(true);
        } else {
          form.setFieldsValue({
            email: props.tenantData.email,
          });
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        form.setFieldsValue({
          email: props.tenantData.email,
        });
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const resendOTP = () => {
    setIsOTPResending(true);
    http
      .post(apis.RESEND_OTP_FOR_TENANT_EMAIL_CHANGE)
      .then((result) => {
        if (result.data.status) {
          message.info(result.data.message);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setIsOTPResending(false);
      });
  };

  const validateOtp = (data: any) => {
    props.loading(true);
    http
      .post(apis.VALIDATE_OTP_FOR_TENANT_EMAIL_CHANGE, {
        otp: data.otp,
      })
      .then((result) => {
        if (result.data.status) {
          setIsOTPGenerated(false);
          message.info(result.data.message);
          props.setTenantData(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        props.loading(false);
        form.setFieldsValue({ otp: "" });
      });
  };

  return (
    <div className="tenant-root-organisation-email-changer-col">
      <Form
        layout="vertical"
        form={form}
        initialValues={props.tenantData}
        onFinish={onFinish}
        scrollToFirstError={true}
        className="email-form"
      >
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter the email id!" },
                { type: "email", message: "Enter a valid email id" },
              ]}
            >
              <Input placeholder="Email Id" disabled={isEmailFieldDisabled} />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              {isEmailFieldDisabled ? (
                <Button
                  type="primary"
                  disabled={isOTPGenerated}
                  icon={<EditOutlined />}
                  htmlType="button"
                  onClick={makeEmailFieldEditable}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  type="primary"
                  disabled={isOTPGenerated}
                  htmlType="submit"
                >
                  Get OTP
                </Button>
              )}
            </Form.Item>
          </Col>
        </Row>
        {isOTPGenerated ? (
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Form.Item
                name="otp"
                rules={[{ required: true, message: "Please enter the OTP!" }]}
              >
                <Input placeholder="OTP" />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Button
                  type="ghost"
                  htmlType="button"
                  loading={isOTPResending}
                  onClick={resendOTP}
                >
                  Resend OTP
                </Button>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update
                </Button>
              </Form.Item>
            </Col>
          </Row>
        ) : null}
      </Form>
    </div>
  );
}

export default connect(null, { loading })(EmailChanger);
