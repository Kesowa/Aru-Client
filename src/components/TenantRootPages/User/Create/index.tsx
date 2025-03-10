import { useState, useEffect, useContext } from "react";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { PlusCircleOutlined } from "@ant-design/icons";
import {
  List,
  Typography,
  Row,
  Col,
  message,
  Select,
  Form,
  Input,
  Upload,
  Button,
  DatePicker,
  Collapse,
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { beforeUpload } from "../../../../services/imageupload";
import ImgCrop from "antd-img-crop";
import { Link } from "react-router-dom";
import "../User.less";
import Unauthorized from "../../../shared/Error/Unauthorized";
import FourOhOne from "../../../shared/Error/FourOhOne";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import InternalServerError from "../../../shared/Error/InternalServerError";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";
import CountExceeded from "../../restrictions/restrictions";
import Expired from "../../restrictions/expiry";
import { STATIC_URL } from "src/constants";
import type { RcFile } from "antd/lib/upload";
import { DocModel, uploadFile } from "src/services/fileUpload";
import { components } from "src/handlers/schema";
import { PERMS, TENANT_STAFF_PERMS } from "src/static/permissions";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

function UserCreatePage(props: any) {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<
    {
      name: string;
      _id: string;
      isActive: boolean;
      permissions: string[];
    }[]
  >([]);
  const [selectedUserGroup, setSelectedusergroup] = useState<{
    name: string;
    _id: string;
    isActive: boolean;
    permissions: string[];
  }>();
  const [errorState, setErrorState] = useState("");

  const { Auth, logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);

  //avatar upload
  const beforeUploadFunction = (file: RcFile) => {
    beforeUpload(file, ["image/jpeg", "image/png"], 2, async () => {
      setIsAvatarUploading(true);
      const uploadToken = await uploadFile(file, DocModel.USER_AVATARS, (prog) => console.info("PROGRESS: " + prog));
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      setAvatar(uploadToken);
      setIsAvatarUploading(false);
    });
    return false;
  };

  //change user group
  const onUserGroupChange = (value: any) => {
    const ug = userGroups.find((ele: any) => ele._id === value);
    setSelectedusergroup(ug);
  };

  //fetch user group
  const fetchAllUserGroupList = () => {
    setLoading(true);
    console.info("Fetching user groups...");
    http
      .get(apis.FETCH_TENANT_USER_GROUP)
      .then((result) => {
        console.info("Fetched user groups!");
        if (result.data.status) {
          console.info("UserGroup status OK!");
          const data: components["schemas"]["IUserGroupPermissions"][] = result.data.data;
          setUserGroups(
            data
              .filter((ele) =>
                ele.permissions.every(perm => TENANT_STAFF_PERMS.includes(perm)) // only list usergroups assignable to tenant-staff
              )
              .map(({ _id, name, isActive, permissions }) => ({ _id, name, isActive, permissions }))
          );
        } else {
          switch (result.data.message) {
            case "You do not have permission to use this API.":
              setErrorState("unauthorized");
              break;
          }
        }
      })
      .catch((err) => {
        console.error(err);
        switch (err.response?.status?.toString()) {
          case "401":
            setErrorState("401");
            break;
          case "503":
            setErrorState("503");
            break;
          case "504":
            setErrorState("504");
            break;
          default:
            setErrorState("500");
            AxiosErrorHandler(err, logout);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    if (!Auth.isLoggedIn) {
      setErrorState("unauthorized");
    } else if (Auth.userdetails.userType !== "tenant-root") {
      // only tenant-root can create tenant-staff user
      setErrorState("401");
    } else {
      // current user is tenant-root, proceed to fetching necessary data for user creation
      fetchAllUserGroupList();
    }
  }, []);

  //subimt form
  const onFinish = (data: any) => {
    const password = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => (b % 36).toString(36)).join('');
    data = { ...data, password };
    createUserAccount(data);
  };

  const createUserAccount = (data: any) => {
    setLoading(true);
    const body = {
      ...data,
    };
    if (avatar && avatar !== "") {
      body["avatar"] = avatar;
    }
    console.log(body);
    http
      .post(apis.CREATE_TENANT_USER, body)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          form.resetFields();
          setAvatar("");
          message.info(result.data.message);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err.response);
        if (err.response?.status === 403) {
          if (
            err.response.data.message === "Package has expired! Please renew!"
          ) {
            setErrorState("403-expiry");
          } else {
            setErrorState("403");
          }
        }
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  switch (errorState) {
    case "unauthorized":
      return <Unauthorized />;
    case "401":
      return <FourOhOne />;
    case "403":
      return (
        <CountExceeded content="Oops! You have reached your organisation user limit!" />
      );
    case "403-expiry":
      return <Expired />;
    case "500":
      return <InternalServerError />;
    case "503":
      return <ServiceUnavailable />;
    case "504":
      return <GatewayTimeout />;
    default:
      return (
        <div className="tenant-root-usercreatepage-wrapper full-width-height">
          <PageHeader
            onBack={() => window.history.back()}
            className="site-page-header-responsive"
            title="User"
            subTitle="create new user"
            extra={[
              <Link to="/dashboard/tenant/user/list" key="1">
                <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
                  List User
                </Button>
              </Link>,
            ]}
          ></PageHeader>
          <div className="padding-after-page-header tenant-organisation-usercreate-inner">
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              scrollToFirstError={true}
              className="user-form"
            >
              <Row gutter={16}>
                <Col span="12">
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: `Please enter the user's name!`,
                      },
                    ]}
                  >
                    <Input placeholder="User's name" />
                  </Form.Item>
                  <Form.Item
                    label="User Group"
                    name="userGroupId"
                    rules={[
                      { required: true, message: `Please select one option!` },
                    ]}
                  >
                    <Select
                      onChange={onUserGroupChange}
                      showSearch
                      placeholder="Select a user group"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {userGroups.map((ele: any, i: any) => (
                        <Select.Option key={i} value={ele._id}>
                          {ele.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {selectedUserGroup ? (
                    <Collapse>
                      <Collapse.Panel header="User Group Details" key="1">
                        <List
                          header={
                            <div>{`User Group : ${selectedUserGroup.name}`}</div>
                          }
                          bordered
                          dataSource={selectedUserGroup.permissions}
                          renderItem={(item: any) => (
                            <List.Item>
                              <Typography.Text>{item}</Typography.Text>
                            </List.Item>
                          )}
                        />
                      </Collapse.Panel>
                    </Collapse>
                  ) : null}
                </Col>
                <Col span="12">
                  <ImgCrop grid={true} shape="round">
                    <Upload
                      name="avatar"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      beforeUpload={beforeUploadFunction}
                    >
                      {avatar ? (
                        <img
                        src={avatarPreview}
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
                    label="Phone Number"
                    name="phoneNo"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the phone number!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Phone Number"
                      style={{ width: "100%" }}
                    />
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
                <Col span="8">
                  <Form.Item label="Date of Birth" name="dob">
                    <DatePicker
                      style={{ width: "100%" }}
                      allowClear={true}
                      format="DD-MM-YYYY"
                    />
                  </Form.Item>
                </Col>
                <Col span="8">
                  <Form.Item label="Aadhaar Number" name="aadhaarNo">
                    <Input placeholder="Aadhaar Number" />
                  </Form.Item>
                </Col>
                <Col span="8">
                  <Form.Item label="Pilot Licence Number" name="pilotLicenceNo">
                    <Input placeholder="Pilot Licence Number" />
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="end" gutter={16}>
                <Col>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Create
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      );
  }
}

export default UserCreatePage;
