import React, { useEffect, useRef, useState } from "react";
import PasswordChecklist from "react-password-checklist";
import apis from "../../services/apis";
import http from "../../services/httpCall";
import { loading } from "../../actions/loadingAction";
import { connect } from "react-redux";
import OtpInput from "react-otp-input";
import { AxiosErrorHandler } from "../../services/httpErrorHandle";
import {
  Typography,
  Form,
  Input,
  Button,
  message,
  Alert,
  Row,
  Col,
  Card,
  Divider,
  Space,
  Skeleton,
  Steps,
  Result,
} from "antd";
import { LockOutlined, CheckOutlined } from "@ant-design/icons";
import { login, setUserDetails, logout } from "../../actions/authAction";
import "./index.less";
import { Link, useHistory } from "react-router-dom";
import Logo from "../shared/Logo";

const { Meta } = Card;
const { Title, Text } = Typography;

function Registration(props: any) {
  const [otpError, setOtpError] = useState(false);
  const [invalidOtp, setInvalidOtp] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [packages, popPackages] = useState<any>([]);
  const [loading, setLoader] = useState(false);
  const [resendLoad, setResendLoad] = useState(false);
  const [stage, setStage] = useState(props.stage ? props.stage : 0);
  const [form] = Form.useForm();
  const [otp, setOtp] = useState("");
  const Ref: any = useRef(null);
  const [timer, setTimer] = useState("00:00");
  const [email, setEmail] = useState("");
  const [ppassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordIsValid, setPasswordValidity] = useState(false);
  const history = useHistory();

  const [tenantId, setTenantId] = useState(
    props.tenantId ? props.tenantId : ""
  );

  const getTimeRemaining = (e: any) => {
    const total: any = Date.parse(e) - Date.parse(new Date().toString());
    console.log(total);
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return {
      total,
      minutes,
      seconds,
    };
  };
  const startTimer = (e) => {
    const { total, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      setTimer(
        (minutes > 29 ? minutes : "0" + minutes) +
          ":" +
          (seconds > 29 ? seconds : "0" + seconds)
      );
    }
  };

  const clearTimer = (e) => {
    // If you adjust it you should also need to
    // adjust the Endtime formula we are about
    // to code next
    setTimer("00:30");

    // If you try to remove this line the
    // updating of timer Variable will be
    // after 1000ms or 1sec
    if (Ref.current) clearInterval(Ref.current);
    const id: any = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = () => {
    const deadline = new Date();

    // This is where you need to adjust if
    // you entend to add more time
    deadline.setSeconds(deadline.getSeconds() + 30);
    return deadline;
  };

  const onClickReset = () => {
    clearTimer(getDeadTime());
  };

  function resendOTP() {
    setResendLoad(true);
    setInvalidOtp(false);
    console.log("email", email);
    const payload: any = {
      email: email,
    };

    http
      .post(`${apis.RESEND_VERIFICATION_CODE}`, payload)
      .then((res: any) => {
        console.log(res.data);
        if (res.data.status) {
          message.success("OTP has been sent!");
          onClickReset();
        } else {
          message.warning(`Oops! ${res.data.message}`);
        }
      })
      .catch((err: any) => {
        console.error(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => setResendLoad(false));
  }

  function confirmOTP() {
    setLoader(true);
    setOtpError(false);
    setInvalidOtp(false);
    console.log("email", email);
    const payload: any = {
      email: email,
      verificationCode: parseInt(otp),
    };

    http
      .post(`${apis.VERIFY_TENANT}`, payload)
      .then((res: any) => {
        console.log(res.data);
        if (res.data.status) {
          setStage(2);
          form.resetFields();
          setEmail("");
          setTenantId(res.data.data);
        } else {
          if (res.data.message == "Invalid Verification Code") {
            setOtpError(true);
          } else {
            setInvalidOtp(true);
          }

          message.error(res.data.message);
        }
      })
      .catch((err: any) => {
        console.error(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => setLoader(false));
  }

  useEffect(() => {
    setLoader(true);
    http
      .get(`${apis.FETCH_ACTIVE_PUBLIC_PACKAGE}`)
      .then((res: any) => {
        if (res.data.status) {
          popPackages(res.data.data);
        } else {
          message.warning(`Oops! ${res.data.message}`);
        }
      })
      .catch((err: any) => {
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setLoader(false);
      });
  }, []);

  useEffect(() => console.log(packages), [packages]);

  const onFinish = async (data: any) => {
    if (passwordIsValid) {
      setLoader(true);
      setEmail(data.email);
      const payload: any = {
        name: data.name,
        phoneNo: data.phoneNo,
        email: data.email,
        contactPerson: data.name,
        registrationNumber: 666,
        gstNumber: 666,
        billingAddressLine1: data.billingAddressLine1,
        billingAddressLine2: data.billingAddressLine2,
        billingCity: data.billingCity,
        billingDistrict: data.billingDistrict,
        billingState: data.billingState,
        billingPin: data.billingPin,
        avatar: "/",
        password: data.password,
        package: selectedPackage,
        captcha: "test",
      };
      http
        .post(`${apis.REGISTER_TENANT}`, payload)
        .then((res: any) => {
          console.log(res.data);
          if (res.data.status) {
            message.success("OTP sent!");
            setStage(1);
            clearTimer(getDeadTime());
          } else {
            message.warning(res.data.message);
          }
        })
        .catch((err: any) => {
          console.error(err);
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          setLoader(false);
        });
    } else {
      message.warning("Please set your password correctly!");
    }
  };

  function renderSkeleton() {
    return (
      <>
        <Col md={8} style={{ margin: "auto" }}>
          <Card
            //hoverable
            className="plan-card"
          >
            <Meta description={<Skeleton paragraph={{ rows: 1 }} active />} />
            <Row>
              <div className="price">
                <Skeleton avatar={{ size: "large" }} active />
              </div>
            </Row>
            <Row>
              <Skeleton.Button active size="large" />
            </Row>
            <Divider />
            <Row>
              <Skeleton paragraph={{ rows: 3 }} active />
            </Row>
          </Card>
        </Col>
        <Col md={8} style={{ margin: "auto" }}>
          <Card
            //hoverable
            className="plan-card"
          >
            <Meta description={<Skeleton paragraph={{ rows: 1 }} active />} />
            <Row>
              <div className="price">
                <Skeleton avatar={{ size: "large" }} active />
              </div>
            </Row>
            <Row>
              <Skeleton.Button active size="large" />
            </Row>
            <Divider />
            <Row>
              <Skeleton paragraph={{ rows: 3 }} active />
            </Row>
          </Card>
        </Col>
        <Col md={8} style={{ margin: "auto" }}>
          <Card
            //hoverable
            className="plan-card"
          >
            <Meta description={<Skeleton paragraph={{ rows: 1 }} active />} />
            <Row>
              <div className="price">
                <Skeleton avatar={{ size: "large" }} active />
              </div>
            </Row>
            <Row>
              <Skeleton.Button active size="large" />
            </Row>
            <Divider />
            <Row>
              <Skeleton paragraph={{ rows: 3 }} active />
            </Row>
          </Card>
        </Col>
      </>
    );
  }

  const handleOTP = (otpp: any) => {
    setOtp(otpp);
  };

  const pay = async (packageId: string) => {
    const response = await http.post(`${apis.GENERATE_ORDER}`, {
      tenantId: tenantId,
      package: packageId,
    });

    console.log(response);

    const options = {
      key: response.data.data.paymentId,
      amount: response.data.data.order.amount.toString(),
      currency: response.data.data.order.currency,
      name: "Kesowa",
      description: "Subscribe to the given package",
      order_id: response.data.data.order.razorpay_order_id,
      handler: async function (response) {
        const res = await http.post(`${apis.SAVE_ORDER}`, response);
        console.log(response);
        message.info(res.data.message);
        setStage(3);
      },
      prefill: {
        name: "Tenant Name",
        email: "test@kesowa.com",
        contact: "999999999",
      },
      notes: {
        address: "Kesowa, salt lake, West Bengal, India",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new (window as any).Razorpay(options);

    rzp1.open();

    rzp1.on("payment.failed", async function (response) {
      console.log(response);
      await http.post(`${apis.PAYMENT_FAILED}`, response.error.metadata);
    });
  };

  const backToLogin = () => {
    props.logout();
    history.replace({ pathname: "/login" });
  };

  const renderStage1RegisterDetails = () => {
    return (
      <>
        <div className="signup-form">
          <Form
            name="signup"
            autoComplete="off"
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Row gutter={16}>
              <Col span="12">
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the tenant name!",
                    },
                  ]}
                >
                  <Input placeholder="name" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  label="Contact Number"
                  name="phoneNo"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the phone number!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Contact Number"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item
                  label="Email Id (to be used as user ID)"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter the email id!" },
                    { type: "email", message: "Enter a valid email id" },
                  ]}
                >
                  <Input placeholder="Email Id" autoComplete="off" />
                </Form.Item>
              </Col>
              <Col span="12">
                <Form.Item
                  name="password"
                  label="Enter password"
                  hasFeedback={true}
                  rules={[
                    {
                      required: true,
                      message: "Please input your Password!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.currentTarget.value)}
                  />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="confirm password"
                  hasFeedback={true}
                  rules={[
                    {
                      required: true,
                      message: "Please input your Password!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Confirm Password"
                    onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  />
                </Form.Item>
                <PasswordChecklist
                  rules={[
                    "minLength",
                    "specialChar",
                    "number",
                    "capital",
                    "match",
                  ]}
                  minLength={5}
                  className="password-validator"
                  iconSize={10}
                  validColor="#36a556"
                  invalidColor="#ff6565"
                  value={ppassword}
                  valueAgain={confirmPassword}
                  onChange={(isValid) => {
                    console.log(isValid);
                    setPasswordValidity(isValid);
                  }}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span="12">
                <Form.Item
                  label="Address Line 1"
                  name="billingAddressLine1"
                  rules={[
                    { required: true, message: "Please enter the address!" },
                  ]}
                >
                  <Input placeholder="Address Line 1" />
                </Form.Item>
              </Col>
              <Col span="12">
                <Form.Item label="Address Line 2" name="billingAddressLine2">
                  <Input placeholder="Address Line 2" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span="6">
                <Form.Item
                  label="City"
                  name="billingCity"
                  rules={[
                    { required: true, message: "Please enter the city!" },
                  ]}
                >
                  <Input placeholder="City" />
                </Form.Item>
              </Col>
              <Col span="6">
                <Form.Item
                  label="District"
                  name="billingDistrict"
                  rules={[
                    { required: true, message: "Please enter the district!" },
                  ]}
                >
                  <Input placeholder="District" />
                </Form.Item>
              </Col>
              <Col span="6">
                <Form.Item
                  label="State"
                  name="billingState"
                  rules={[
                    { required: true, message: "Please enter the state!" },
                  ]}
                >
                  <Input placeholder="State" />
                </Form.Item>
              </Col>
              <Col span="6">
                <Form.Item
                  label="Pin"
                  name="billingPin"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the pin number!",
                    },
                    { len: 6, message: "Enter a valid pin number!" },
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="Pin"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="end" gutter={16}>
              <Col>
                <Form.Item>
                  {loading ? (
                    <Button type="primary" loading={loading}>
                      loading...
                    </Button>
                  ) : (
                    <Button type="primary" htmlType="submit">
                      Next
                    </Button>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  };

  const renderStage2VerifyEmail = () => {
    return (
      <>
        <div className="otp-wrapper">
          <Row>
            <Title level={3} className="otp-title">
              Enter Verification code
            </Title>
          </Row>
          {otpError ? (
            <Alert
              message="The code you have entered is invalid! Please try again."
              type="error"
              className="otp-alert"
            />
          ) : (
            <Alert
              message="Please check your email for verification code."
              type="info"
              className="otp-alert"
            />
          )}
          {invalidOtp ? (
            <Alert
              message="Your verification code has expired. Please resed code!"
              type="warning"
              className="otp-alert"
            />
          ) : (
            <></>
          )}
          <Row>
            <OtpInput
              value={otp}
              onChange={handleOTP}
              numInputs={6}
              separator={<span>-</span>}
              containerStyle={{
                padding: "8px",
                width: "100%",
                marginLeft: "-14px",
              }}
              inputStyle={{
                padding: "0px",
                borderRadius: "4px",
                border: "1px solid #a5a4bf",
                fontSize: "30px",
                marginLeft: "16px",
                marginRight: "16px",
                width: "50px",
              }}
              hasErrored={otpError}
              isInputNum
              errorStyle={{ border: "1px solid #ff6565" }}
            />
          </Row>
          <Row>
            <Text type="secondary" className="timer">
              Resend OTP in {timer}
            </Text>
          </Row>

          <Row>
            {otp.length == 6 ? (
              <>
                {loading ? (
                  <Button
                    className="otp-button"
                    loading={loading}
                    type="primary"
                    disabled
                    block
                  >
                    loading...
                  </Button>
                ) : (
                  <Button
                    className="otp-button"
                    type="primary"
                    onClick={() => confirmOTP()}
                    block
                  >
                    Confirm OTP
                  </Button>
                )}
              </>
            ) : (
              <Button className="otp-button" type="primary" disabled block>
                Confirm OTP
              </Button>
            )}
          </Row>
          <Row>
            {resendLoad ? (
              <Button
                className="otp-resend"
                type="primary"
                loading={resendLoad}
                block
                disabled
              >
                Resending...
              </Button>
            ) : (
              <>
                {timer == "00:00" ? (
                  <Button
                    className="otp-resend"
                    type="default"
                    onClick={() => resendOTP()}
                    block
                  >
                    Resend
                  </Button>
                ) : (
                  <Button className="otp-resend" type="default" block disabled>
                    Resend
                  </Button>
                )}
              </>
            )}
          </Row>
        </div>
      </>
    );
  };

  const renderStage3ChoosePlan = () => {
    return (
      <>
        <div className="plan-div">
          <Row gutter={8}>
            {loading ? (
              renderSkeleton()
            ) : (
              <>
                {packages.map((p: any) => {
                  return (
                    <Col md={8} style={{ margin: "auto" }}>
                      <Card hoverable title={`${p.name}`} className="plan-card">
                        <Meta description="Start flying, mapping, and ARU will help you visualise!" />
                        <Row>
                          <div className="price">
                            <Title className="title">
                              <sup className="super">&#x20B9;</sup>
                              {p.price}
                            </Title>
                          </div>
                        </Row>
                        <Row>
                          <Text>&#x20B9;15 Per user/month, billed monthly</Text>
                        </Row>
                        <Row>
                          <Button
                            className="button-signup"
                            onClick={() => pay(p._id)}
                            type="primary"
                            block
                          >
                            {" "}
                            Pay
                          </Button>
                        </Row>
                        <Divider />
                        <Row>
                          <div className="plan-details">
                            <Space direction="vertical">
                              <Text>
                                <CheckOutlined style={{ color: "#36a556" }} />
                                &nbsp;&nbsp;{p.missionCount} Missions
                              </Text>
                              <Text>
                                <CheckOutlined style={{ color: "#36a556" }} />
                                &nbsp;&nbsp;{p.storage / 1000}GB Storage
                              </Text>
                              <Text>
                                <CheckOutlined style={{ color: "#36a556" }} />
                                &nbsp;&nbsp;{p.userCount} users
                              </Text>
                              <Text>
                                <CheckOutlined style={{ color: "#36a556" }} />
                                &nbsp;&nbsp;{p.clientCount} Clients
                              </Text>
                            </Space>
                          </div>
                        </Row>
                      </Card>
                    </Col>
                  );
                })}
              </>
            )}
          </Row>
          <Button onClick={backToLogin} key="buy">
            Back to Login
          </Button>
        </div>
      </>
    );
  };

  const renderStage4AccountCreated = () => {
    return (
      <>
        <div className="result-div">
          <Result
            status="success"
            title="Your Account has been created!"
            subTitle="You can now start using ARU!"
            extra={[
              <Button onClick={backToLogin} key="buy">
                Back to Login
              </Button>,
            ]}
          />
        </div>
      </>
    );
  };

  // Suggested Flow of Control of Steps:
  // 1. User enters their details and on form submission; a new "newTenant" document is created and stored in the database
  // 2. User is sent verification email, user enters OTP, on submission a new "tenant" is created and stored in database
  // 3. User selects a package and pays using razorpay
  // 4. On reaching stage 4, user is now capable of logging in
  // TODO: Check whether payment is done and if not done then don't let tenant login (if someone stops at step 2; data stored in db but payment not done)
  // Reasons for this order:
  // -> Payment controllers require a tenantId for the payment process and for storing the receipt of payment in the database.
  //    TenantId is not available until tenant ixists in database. Tenant can't exist in database unless tenant's data is collected and email is verified.
  //    So first getting the tenant's data and verifying; then asking for package selection and payment; and then they can login by their own.
  const steps = [
    {
      title: "Register",
      description: "Fill in your details!",
      content: renderStage1RegisterDetails(),
      stage: 0,
    },
    {
      title: "Verify Email",
      description: "Email OTP Verification",
      content: renderStage2VerifyEmail(),
      stage: 1,
    },
    {
      title: "Choose Plan",
      description: "Choose the plan thats right for you!",
      content: renderStage3ChoosePlan(),
      stage: 2,
    },
    {
      title: "Account Created!",
      description: "You can now use ARU",
      content: renderStage4AccountCreated(),
      stage: 3,
    },
  ];

  return (
    <div className="signup-page-container login-bg">
      <div className="signup-section-wrapper">
        <Row>
          <Col md={2}>
            <Link to="/login">
              <Logo className="brand-logo2" alt="kiv-logo" />
            </Link>
          </Col>
          <Col md={22}>
            <Steps
              current={stage}
              items={steps.map((item) => {
                return {
                  title: item.title,
                };
              })}
            ></Steps>
          </Col>
        </Row>

        <div>{steps[stage].content}</div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, {
  loading,
  login,
  setUserDetails,
  logout,
})(Registration);
