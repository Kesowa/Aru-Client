import React, { useState, useEffect } from "react";
import { Form, Input, Upload, Row, Col, message, Button, Divider } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { beforeUpload } from "../../../services/imageupload";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { connect } from "react-redux";
import { loading } from "../../../actions/loadingAction";
import { logout } from "../../../actions/authAction";
import { STATIC_URL } from "src/constants";
import type { RcFile } from "antd/lib/upload";
import { DocModel, uploadFile } from "src/services/fileUpload";



function TenantInfo(props: any) {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [path, setPath] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  useEffect(() => {
    if (props.tenantData) {
      form.setFieldsValue(props.tenantData);
      setAvatar(props.tenantData.avatar);
    }
  }, [props.tenantData]);

  const beforeUploadFunction = (file: RcFile) => {
    beforeUpload(file, ["image/jpeg", "image/png"], 2, async() => {
      setIsAvatarUploading(true);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl); 

      const uploadToken = await uploadFile(file, DocModel.DOCUMENTS, (prog) => console.info("PROGRESS: " + prog));
      setAvatar(uploadToken);
      
      // const formData = new FormData();
      // formData.append("avatar", file);
      // http
      //   .post(apis.UPLOAD_TENANT_AVATAR, body, {
      //   })
      //   .then((result) => {
      //     if (result.data.status) {
      //       setAvatar(result.data.file);
      //     } else {
      //       message.error(result.data.message);
      //     }
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     AxiosErrorHandler(err, props.logout);
      //   })
      //   .finally(() => {
      //     setIsAvatarUploading(false);
      //   });
    });
    return false;
  };

  const enableForm = (e: any) => {
    e.preventDefault();
    setIsDisabled(false);
  };

  const onFinish = (data: any) => {
    const body = {
      ...data,
    };
    if (avatar && avatar !== props.tenantData.avatar || "") {
      body["avatar"] = avatar;
    }
    console.log(body);
    updateOrganisationBasicInfo(body);
  };

  const updateOrganisationBasicInfo = (body: any) => {
    props.loading(true);
    http
      .post(apis.UPDATE_ORGANISATION_BASIC_DETAILS, body)
      .then((result) => {
        if (result.data.status) {
          console.log(result.data.data);
          message.info("Organisation details updated sucessfully.");
          props.setTenantData(result.data.data);
          setIsDisabled(true);
        } else {
          console.log(result.data);
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

  return (
    <div className="tenant-root-organisation-tenantinfo">
      <Form
        layout="vertical"
        form={form}
        initialValues={props.tenantData}
        onFinish={onFinish}
        scrollToFirstError={true}
        className="basic-info-form"
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
              <Input placeholder="Tenant name" disabled={isDisabled} />
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
              <Input placeholder="Contact Person" disabled={isDisabled} />
            </Form.Item>
          </Col>
          <Col span="12">
            <Form.Item label="Official Website" name="officialWebsite">
              <Input placeholder="Official Website" disabled={isDisabled} />
            </Form.Item>
          </Col>
          <Col span="12" style={{ display: "flex" }}>
            <ImgCrop grid={true}>
              <Upload
                disabled={isDisabled}
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUploadFunction}
                style={{}}
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
            <Form.Item label="Official Website" name="officialWebsite">
              <Input placeholder="Official Website" disabled={isDisabled} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span="12">
            <Form.Item label="GST Number" name="gstNumber">
              <Input placeholder="GST Number" disabled={isDisabled} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span="12">
            <Form.Item label="Registration Number" name="registrationNumber">
              <Input placeholder="Registration Number" disabled={isDisabled} />
            </Form.Item>
          </Col>
        </Row>
        <Divider orientation="left" plain>
          Billing details
        </Divider>
        <Row gutter={16}></Row>
        <Row gutter={16}>
          <Col span="12">
            <Form.Item
              label="Address Line 1"
              name="billingAddressLine1"
              rules={[{ required: true, message: "Please enter the address!" }]}
            >
              <Input placeholder="Address Line 1" disabled={isDisabled} />
            </Form.Item>
          </Col>
          <Col span="12">
            <Form.Item label="Address Line 2" name="billingAddressLine2">
              <Input placeholder="Address Line 2" disabled={isDisabled} />
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
              <Input placeholder="City" disabled={isDisabled} />
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
              <Input placeholder="District" disabled={isDisabled} />
            </Form.Item>
          </Col>
          <Col span="6">
            <Form.Item
              label="State"
              name="billingState"
              rules={[{ required: true, message: "Please enter the state!" }]}
            >
              <Input placeholder="State" disabled={isDisabled} />
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
                disabled={isDisabled}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end" gutter={16}>
          <Col>
            <Form.Item>
              {isDisabled ? (
                <Button type="primary" htmlType="button" onClick={enableForm}>
                  Edit Info
                </Button>
              ) : (
                <Button type="primary" htmlType="submit">
                  Update
                </Button>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { loading, logout })(TenantInfo);
