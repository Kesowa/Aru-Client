import { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Button,
  Upload,
  message,
  Form,
  Input,
  Row,
  Col,
  Typography,
  Select,
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import {
  UnorderedListOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import "../Tenant.less";
import { Link } from "react-router-dom";
import ImgCrop from "antd-img-crop";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { beforeUpload } from "../../../../services/imageupload";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import { STATIC_URL } from "src/constants";
import { RcFile } from "antd/lib/upload";
import { DocModel, uploadFile } from "src/services/fileUpload";

const { Title } = Typography;
const { Option } = Select;

function EditTenant(props: any) {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [packages, setPackages] = useState<any>([]);

  const beforeUploadFunction = (file: RcFile) => {
    beforeUpload(file, ["image/jpeg", "image/png"], 2, async () => {
      setIsAvatarUploading(true);
      const uploadToken = await uploadFile(file, DocModel.DOCUMENTS, (prog) => console.info("PROGRESS: " + prog));

      const body = {
        file: uploadToken,
      };
      // const formData = new FormData();
      // formData.append("avatar", file);
      http
        .post(apis.UPLOAD_TENANT_AVATAR, body, {
        })
        .then((result) => {
          if (result.data.status) {
            setAvatar(result.data.file);
          } else {
            message.error(result.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          setIsAvatarUploading(false);
        });
    });
    return false;
  };

  useEffect(() => {
    if (props.tenant) {
      setAvatar(props.tenant.avatar);
    }
  }, [props.tenant]);

  useEffect(() => {
    http
      .get(apis.FETCH_ALL_PACKAGES)
      .then((res) => {
        if (res.data.status) setPackages(res.data.data);
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      });
  }, []);

  const onFinish = (data: any) => {
    console.log(data);
    const body = {
      ...data,
      tenantId: props.tenant._id,
    };
    http
      .patch(`${apis.EDIT_TENANT_BY_ID}`, body)
      .then((res) => {
        console.log(res);
        if (res.data.status) message.success(res.data.message);
        else message.error(res.data.message);
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      });
  };

  return (
    <div className="edit-tenant">
      <PageHeader
        onBack={() => window.history.back()}
        title="Tenant"
        subTitle="Edit Tenant"
        extra={[
          <Link to="/dashboard/admin/package/list" key="1">
            <Button key="1" type="primary" icon={<UnorderedListOutlined />}>
              Tenant List
            </Button>
          </Link>,
        ]}
      />
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        initialValues={props.tenant}
      >
        <div className="basic-info">
          <Title level={5}>Basic Info:</Title>
          <Row gutter={16}>
            <Col span="12">
              <Form.Item
                label="Tenant Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter the tenant name!" },
                ]}
              >
                <Input placeholder="Tenant name" />
              </Form.Item>
              <Form.Item
                label="Contact Person"
                name="contactPerson"
                rules={[
                  {
                    required: true,
                    message: "Please enter the contact person name!",
                  },
                ]}
              >
                <Input placeholder="Contact Person" />
              </Form.Item>
            </Col>
            <Col span="12">
              <ImgCrop grid={true}>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUploadFunction}
                >
                  {avatar ? (
                    <img
                      src={`${STATIC_URL}${avatar}`}
                      className="uploaded-avatar"
                    />
                  ) : (
                    <div>
                      {isAvatarUploading ? (
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
                label="Contact Number"
                name="phoneNo"
                rules={[
                  { required: true, message: "Please enter the phone number!" },
                ]}
              >
                <Input placeholder="Contact Number" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span="12">
              <Form.Item
                label="Email Id"
                name="email"
                rules={[
                  { required: true, message: "Please enter the email id!" },
                  { type: "email", message: "Enter a valid email id" },
                ]}
              >
                <Input placeholder="Email Id" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span="12">
              <Form.Item label="Registration Number" name="registrationNumber">
                <Input placeholder="Registration Number" />
              </Form.Item>
            </Col>
            <Col span="12">
              <Form.Item label="Official Website" name="officialWebsite">
                <Input placeholder="Official Website" />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <div>
          <Title level={5} style={{ marginTop: "10px" }}>
            Billing Details:
          </Title>
          <Row gutter={16}>
            <Col span="12">
              <Form.Item
                label="GST Number"
                name="gstNumber"
                rules={[
                  { required: true, message: "Please enter the GST number!" },
                ]}
              >
                <Input placeholder="GST Number" />
              </Form.Item>
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
                rules={[{ required: true, message: "Please enter the city!" }]}
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
                rules={[{ required: true, message: "Please enter the state!" }]}
              >
                <Input placeholder="State" />
              </Form.Item>
            </Col>
            <Col span="6">
              <Form.Item
                label="Pin"
                name="billingPin"
                rules={[
                  { required: true, message: "Please enter the pin number!" },
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
        </div>
        <div>
          <Title level={5} style={{ marginTop: "10px" }}>
            Active Package:
          </Title>
          <Row>
            <Col span={8}>
              <Form.Item label="Select Package" name="activePackage">
                <Select>
                  {packages.map((item) => (
                    <Option value={item._id}>{item.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>
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
  );
}

const mapStateToProps = (state: any) => ({
  Theme: state.Theme,
  tenant: state.Tenant.tenantToEdit,
});

export default connect(mapStateToProps, { logout })(EditTenant);
