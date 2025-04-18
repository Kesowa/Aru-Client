import { useState } from "react";
import { Form, Input, Upload, Row, Col, Button } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { beforeUpload } from "../../../../services/imageupload";
import { STATIC_URL } from "src/constants";
import { RcFile } from "antd/lib/upload";
import { DocModel, uploadFile } from "src/services/fileUpload";

function BasicInfo(props: any) {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState(
    props.tenantData.avatar ? props.tenantData.avatar : ""
  );
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const beforeUploadFunction = (file: RcFile) => {
    beforeUpload(file, ["image/jpeg", "image/png"], 2, async () => {
      setIsAvatarUploading(true);
      const uploadToken = await uploadFile(file, DocModel.DOCUMENTS, (prog) =>
        console.info("PROGRESS: " + prog)
      );
      setAvatar(uploadToken);
    });
    return false;
  };

  const onFinish = (data: any) => {
    const image = avatar ? avatar : undefined;
    props.goToNextFromBasic({ ...data, avatar: image });
  };

  return (
    <div className="basic-info">
      <Form
        layout="vertical"
        form={form}
        initialValues={props.tenantData}
        onFinish={onFinish}
      >
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
                    {isAvatarUploading ? <LoadingOutlined /> : <PlusOutlined />}
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
        <Row justify="end" gutter={16}>
          <Col>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Next
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default BasicInfo;
