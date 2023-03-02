import React, { useState, useEffect } from "react";
import { Form, Input, Upload, Row, Col, message, Button, Divider } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { connect } from "react-redux";
import { loading } from "../../../actions/loadingAction";
import { logout } from "../../../actions/authAction";

function PhoneNumberChanger(props: any) {
  const [form] = Form.useForm();
  const [isDisabled, setIsDisabled] = useState(true);

  const onFinish = (data: any) => {
    console.log(data);
  };

  return (
    <div className="tenant-root-organisation-phone-changer-col">
      <Form
        layout="vertical"
        form={form}
        initialValues={{}}
        onFinish={onFinish}
        scrollToFirstError={true}
        className="phoneNumber-form"
      >
        <Form.Item
          name="phoneNo"
          rules={[
            { required: true, message: "Please enter the phone number!" },
          ]}
        >
          <Input
            placeholder="Contact Number"
            style={{ width: "100%" }}
            disabled={isDisabled}
          />
        </Form.Item>
      </Form>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { loading, logout })(
  PhoneNumberChanger
);
