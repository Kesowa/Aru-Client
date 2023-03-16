import React, { useState } from "react";
import { connect } from "react-redux";
import {
  PageHeader,
  Form,
  Input,
  Row,
  Col,
  message,
  Button,
  Checkbox,
} from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import "../Permission.less";
import { loading } from "../../../../actions/loadingAction";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import { Link } from "react-router-dom";

function CreatePermission(props: any) {
  const [form] = Form.useForm();
  const [isFrontendRouteEnabled, setIsFrontendRouteEnabled] = useState(false);

  const onFinish = (data: any) => {
    props.loading(true);
    console.log(data);
    http
      .post(apis.CREATE_PERMISSION, data)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          form.resetFields();
          setIsFrontendRouteEnabled(false);
          message.info("Permission is created sucessfully.");
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

  const onValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.isFrontendRoute === false) {
      setIsFrontendRouteEnabled(false);
    } else if (changedValues.isFrontendRoute === true) {
      setIsFrontendRouteEnabled(true);
    }
  };

  return (
    <div className="permission-add-wrapper full-width-height">
      <PageHeader
        className="site-page-header-responsive"
        title="Add Package"
        subTitle="Register a new package"
        extra={[
          <Link to="/dashboard/admin/permission/list" key="1">
            <Button key="1" type="primary" icon={<UnorderedListOutlined />}>
              Package List
            </Button>
          </Link>,
        ]}
      ></PageHeader>
      <div className="permission-add-form padding-after-page-header">
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          preserve={false}
          scrollToFirstError={true}
          onValuesChange={onValuesChange}
          initialValues={{
            isFrontendRoute: false,
            isVisibleToTenant: false,
            isVisibleToSuperAdmin: false,
          }}
        >
          <Row gutter={16}>
            <Col span="8">
              <Form.Item
                label="Permission Name(must be unique)"
                name="name"
                rules={[
                  { required: true, message: "Please enter the package name!" },
                ]}
              >
                <Input placeholder="Package Name" />
              </Form.Item>
            </Col>
            <Col span="8">
              <Form.Item
                label="visible to Tenant"
                name="isVisibleToTenant"
                valuePropName="checked"
              >
                <Checkbox></Checkbox>
              </Form.Item>
            </Col>
            <Col span="8">
              <Form.Item
                label="visible to Admin"
                name="isVisibleToSuperAdmin"
                valuePropName="checked"
              >
                <Checkbox></Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span="12">
              <Form.Item
                label="Frontend route"
                name="isFrontendRoute"
                valuePropName="checked"
              >
                <Checkbox></Checkbox>
              </Form.Item>
            </Col>
            {isFrontendRouteEnabled ? (
              <Col span="12">
                <Form.Item
                  label="Sidebar option"
                  name="isSideNavOption"
                  valuePropName="checked"
                >
                  <Checkbox></Checkbox>
                </Form.Item>
              </Col>
            ) : null}
          </Row>
          {isFrontendRouteEnabled ? (
            <Row gutter={16}>
              <Col span="8">
                <Form.Item
                  label="Route url"
                  name="frontendRoute"
                  rules={[
                    { required: true, message: "Please enter the route url!" },
                  ]}
                >
                  <Input placeholder="Route link url" />
                </Form.Item>
              </Col>
              <Col span="8">
                <Form.Item
                  label="Route icon"
                  name="sideNavOptionIcon"
                  rules={[
                    { required: true, message: "Please enter the route icon!" },
                  ]}
                >
                  <Input placeholder="Route icon" />
                </Form.Item>
              </Col>
              <Col span="8">
                <Form.Item
                  label="Route label"
                  name="sideNavOptionLabel"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the route label!",
                    },
                  ]}
                >
                  <Input placeholder="Route icon" />
                </Form.Item>
              </Col>
            </Row>
          ) : null}
          <Row justify="end" gutter={16}>
            <Col>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Create Permission
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  Theme: state.Theme,
});

export default connect(mapStateToProps, { loading, logout })(CreatePermission);
