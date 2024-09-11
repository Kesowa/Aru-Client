import { Form, Input, Row, Col, message, Button } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { UnorderedListOutlined } from "@ant-design/icons";
import "../Permission.less";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

function CreatePermission(props: any) {
  const { logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);
  const [form] = Form.useForm();

  const onFinish = (data: any) => {
    setLoading(true);
    console.log(data);
    http
      .post(apis.CREATE_PERMISSION, data)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          form.resetFields();
          message.info("Permission is created sucessfully.");
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

  return (
    <div className="permission-add-wrapper full-width-height">
      <PageHeader
        className="site-page-header-responsive"
        title="Add Permission"
        subTitle="Register a new permission"
        extra={[
          <Link to="/dashboard/admin/permission/list" key="1">
            <Button key="1" type="primary" icon={<UnorderedListOutlined />}>
              Permission List
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
        >
          <Row gutter={16}>
            <Col span="8">
              <Form.Item
                label="Permission Name(must be unique)"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please enter the permission name!",
                  },
                ]}
              >
                <Input placeholder="Permission Name" />
              </Form.Item>
            </Col>
          </Row>
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

export default CreatePermission;
