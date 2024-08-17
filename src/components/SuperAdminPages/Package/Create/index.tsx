import { useContext, useState } from "react";
import { connect } from "react-redux";
import { Form, Input, Upload, Row, Col, message, Button } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import {
  UnorderedListOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import "../Package.less";
import { loading } from "../../../../actions/loadingAction";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { beforeUpload } from "../../../../services/imageupload";
import ImgCrop from "antd-img-crop";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { Link } from "react-router-dom";
import { STATIC_URL } from "src/constants";
import { AuthContext } from "src/services/authUtils";

function CreatePackage(props: any) {
  const [form] = Form.useForm();
  const [poster, setPoster] = useState("");
  const [isPosterUploading, setIsPosterUploading] = useState(false);

  const { logout } = useContext(AuthContext);

  const beforeUploadFunction = (file: any) => {
    beforeUpload(file, ["image/jpeg", "image/png"], 2, () => {
      setIsPosterUploading(true);
      const formData = new FormData();
      formData.append("poster", file);
      http
        .post(apis.UPLOAD_PACKAGE_POSTER, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((result) => {
          if (result.data.status) {
            setPoster(result.data.file);
          } else {
            message.error(result.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setIsPosterUploading(false);
        });
    });
    return false;
  };

  const onFinish = (data: any) => {
    if (poster) {
      props.loading(true);
      console.log(poster, data);
      const body = {
        ...data,
        poster: poster,
      };
      http
        .post(apis.CREATE_PACKAGE, body)
        .then((result) => {
          console.log(result.data);
          if (result.data.status) {
            setPoster("");
            form.resetFields();
            message.success("The package is created sucessfully.");
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
        });
    } else {
      message.error("please choose a poster for the package");
    }
  };

  return (
    <div className="package-add-wrapper full-width-height">
      <PageHeader
        className="site-page-header-responsive"
        title="Add Package"
        subTitle="Register a new package"
        extra={[
          <Link to="/dashboard/admin/package/list" key="1">
            <Button key="1" type="primary" icon={<UnorderedListOutlined />}>
              Package List
            </Button>
          </Link>,
        ]}
      ></PageHeader>
      <div className="package-add-form padding-after-page-header">
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Row gutter={16}>
            <Col span="12">
              <Form.Item
                label="Package Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter the package name!" },
                ]}
              >
                <Input placeholder="Package Name" />
              </Form.Item>
              <Form.Item
                label="Bandwidth"
                name="bandwidth"
                rules={[
                  { required: true, message: "Please enter the bandwidth!" },
                ]}
              >
                <Input placeholder="Bandwidth" />
              </Form.Item>
            </Col>
            <Col span="12">
              <ImgCrop grid={true} aspect={1.5}>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="poster-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUploadFunction}
                >
                  {poster ? (
                    <img
                      src={`${STATIC_URL}${poster}`}
                      className="uploaded-poster"
                    />
                  ) : (
                    <div>
                      {isPosterUploading ? (
                        <LoadingOutlined />
                      ) : (
                        <PlusOutlined />
                      )}
                      <div className="ant-upload-text">Upload</div>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span="12">
              <Form.Item
                label="Storage(in GB)"
                name="storage"
                rules={[
                  { required: true, message: "Please enter tthe storage!" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Storage"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span="12">
              <Form.Item
                label="Duration(in days)"
                name="duration"
                rules={[
                  { required: true, message: "Please enter the duration!" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Duration"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span="8">
              <Form.Item
                label="Alert Count"
                name="alertCount"
                rules={[
                  { required: true, message: "Please enter the alert count!" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Alert Count"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span="8">
              <Form.Item
                label="Client Count"
                name="clientCount"
                rules={[
                  { required: true, message: "Please enter the client count!" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Client Count"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span="8">
              <Form.Item
                label="Layer Count"
                name="layerCount"
                rules={[
                  { required: true, message: "Please enter the layer count!" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Layer Count"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span="8">
              <Form.Item
                label="Location Count"
                name="locationCount"
                rules={[
                  {
                    required: true,
                    message: "Please enter the location count!",
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Location Count"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span="8">
              <Form.Item
                label="Mission Count"
                name="missionCount"
                rules={[
                  {
                    required: true,
                    message: "Please enter the mission count!",
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Mission Count"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span="8">
              <Form.Item
                label="User Count"
                name="userCount"
                rules={[
                  { required: true, message: "Please enter the user count!" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="User Count"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span="12">
              <Form.Item
                label="User Group Count"
                name="userGroupCount"
                rules={[
                  {
                    required: true,
                    message: "Please enter the user group count!",
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="User Group Count"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span="12">
              <Form.Item
                label="VOD Count"
                name="vodCount"
                rules={[
                  { required: true, message: "Please enter the VOD count!" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="VOD Count"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end" gutter={16}>
            <Col>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Create Package
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

export default connect(null, { loading })(CreatePackage);
