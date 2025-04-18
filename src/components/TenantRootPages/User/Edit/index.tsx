import { useState, useEffect, useContext } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { PlusOutlined, LoadingOutlined, PlusCircleOutlined } from "@ant-design/icons";
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
import "../User.less";
import Unauthorized from "../../../shared/Error/Unauthorized";
import FourOhOne from "../../../shared/Error/FourOhOne";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import InternalServerError from "../../../shared/Error/InternalServerError";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";
import moment from "moment";
import { STATIC_URL } from "src/constants";
import { RcFile } from "antd/lib/upload";
import { DocModel, uploadFile } from "src/services/fileUpload";
import { Components } from "src/handlers/schema";
import { TENANT_STAFF_PERMS } from "src/static/permissions";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

function UserEditPage() {
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
  const history = useHistory();

  const [user, setUser] = useState<any>(null);

  const { id } = useParams<any>();

  const { Auth, logout } = useContext(AuthContext);
  const userDetails = Auth.userdetails;

  const { setLoading } = useContext(LoaderContext);

  //avatar upload
  const beforeUploadFunction = (file: RcFile) => {
    beforeUpload(file, ["image/jpeg", "image/png"], 2, async () => {
      setIsAvatarUploading(true);

      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      const uploadToken = await uploadFile(
        file,
        DocModel.USER_AVATARS,
        (prog) => console.info("PROGRESS: " + prog)
      );
      setAvatar(uploadToken);

      // const formData = new FormData();
      // formData.append("avatar", file);
      // http
      //   .post(apis.UPLOAD_USER_PROFILE_PICTURE, body, {
      //   })
      //   .then((result) => {
      //     console.log(result);

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

  //change user group
  const onUserGroupChange = (value: any) => {
    const ug = userGroups.find((ele: any) => ele._id === value);
    setSelectedusergroup(ug);
  };

  //fetch user group
  const fetchAllUserGroupList = () => {
    setLoading(true);
    http
      .get(apis.FETCH_TENANT_USER_GROUP)
      .then((result) => {
        console.log(result);

        if (result.data.status) {
          const data: Components["schemas"]["IUserGroupPermissions"][] = result.data.data;
          const groups = data
            .filter(
              (ele) =>
                ele.permissions.every((perm) =>
                  TENANT_STAFF_PERMS.includes(perm)
                ) // only list usergroups assignable to tenant-staff
            )
            .map(({ _id, name, isActive, permissions }) => ({
              _id,
              name,
              isActive,
              permissions,
            }));

          const sug = groups.find((g) => g._id === user.userGroupId);

          console.log("groups", groups);
          console.log("user", user);
          console.log("sug", sug);

          setSelectedusergroup(sug);
          setUserGroups(groups);
        } else if (result.data.message === "You do not have permission to use this API.") {
          setErrorState("unauthorized");
        }
      })
      .catch((err) => {
        console.log(err);
        switch (err.response.status.toString()) {
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
        }
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchUserDetails = () => {
    setLoading(true);
    http
      .get(apis.FETCH_USER_OF_TENANT_BY_ID, { params: { id } })
      .then((result) => {
        if (result.data.status) {
          console.log(result.data.data);
          setUser(result.data.data);
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

  useEffect(() => {
    if (!Auth.isLoggedIn) {
      setErrorState("unauthorized");
    } else if (userDetails.userType !== "tenant-root") {
      // only tenant-root can change tenant-staff details
      setErrorState("401");
    } else {
      // current user is tenant-root, proceed to fetching necessary data for user details editing
      fetchUserDetails();
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (user.userType !== "tenant-root") {
        // when tenant-root is editing their own user details, usergroups need not be fetched
        // as tenant-root won't belong to a user group
        fetchAllUserGroupList();
      }
      setAvatar(user.avatar);
    }
  }, [user]);

  //subimt form
  const onFinish = (data: any) => {
    if (!data.dob) delete data.dob;
    if (!data.aadhaarNo) delete data.aadhaarNo;
    if (!data.pilotLicenceNo) delete data.pilotLicenceNo;
    if (!data.userGroupId) delete data.userGroupId;
    console.log(data);
    EditUserAccount(data);
  };

  const EditUserAccount = (data: any) => {
    setLoading(true);
    const body = {
      id: user._id,
      ...data,
    };
    if ((avatar && avatar !== user.avatar) || "") {
      body["avatar"] = avatar;
    }
    console.log(body);
    http
      .patch(`${apis.EDIT_USER}`, body)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          form.resetFields();
          setAvatar("");
          message.success(result.data.message);
          history.push("/dashboard/tenant/user/list");
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

  switch (errorState) {
    case "unauthorized":
      return <Unauthorized />;
    case "401":
      return <FourOhOne />;
    case "500":
      return <InternalServerError />;
    case "503":
      return <ServiceUnavailable />;
    case "504":
      return <GatewayTimeout />;
    default:
      return (
        <div className="tenant-root-usercreatepage-wrapper full-width-height">
          {user &&
            (user.userType === "tenant-staff" ? selectedUserGroup : true) && (
              <>
                <PageHeader
                  onBack={() => window.history.back()}
                  className="site-page-header-responsive"
                  title="User"
                  subTitle="Edit user"
                  extra={[
                    <Link to="/dashboard/tenant/user/list" key="1">
                      <Button
                        key="1"
                        type="primary"
                        icon={<PlusCircleOutlined />}
                      >
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
                    initialValues={{
                      name: user.name,
                      email: user.email,
                      phoneNo: user.phoneNo,
                      userType: "tenant-client",
                      userGroupId:
                        user.userType === "tenant-staff"
                          ? selectedUserGroup._id
                          : null,
                    }}
                    className="user-form"
                  >
                    <Row gutter={16}>
                      <Col span="12">
                        <Form.Item label="Name" name="name">
                          <Input placeholder="User's name" />
                        </Form.Item>
                        {
                          // tenant-root can change their own details, while doing that usergroup option shouldn't be displayed
                          user.userType === "tenant-staff" && (
                            <>
                              <Form.Item label="User Group" name="userGroupId">
                                <Select
                                  onChange={onUserGroupChange}
                                  showSearch
                                  placeholder="Select a user group"
                                  defaultValue={selectedUserGroup.name}
                                  filterOption={(input, option) =>
                                    option!.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {userGroups.map((ele: any, i: any) => (
                                    <Select.Option
                                      key={ele._id}
                                      value={ele._id}
                                    >
                                      {ele.name}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                              {selectedUserGroup ? (
                                <Collapse>
                                  <Collapse.Panel
                                    header="User Group Details"
                                    key="1"
                                  >
                                    <List
                                      header={
                                        <div>{`User Group : ${selectedUserGroup.name}`}</div>
                                      }
                                      bordered
                                      dataSource={selectedUserGroup.permissions}
                                      renderItem={(item: any) => (
                                        <List.Item>
                                          <Typography.Text>
                                            {item}
                                          </Typography.Text>
                                        </List.Item>
                                      )}
                                    />
                                  </Collapse.Panel>
                                </Collapse>
                              ) : null}
                            </>
                          )
                        }
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
                                src={
                                  avatarPreview
                                    ? avatarPreview
                                    : `${STATIC_URL}${avatar}`
                                }
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
                            {
                              required: true,
                              message: "Please enter the email id!",
                            },
                            {
                              type: "email",
                              message: "Enter a valid email id",
                            },
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
                            defaultValue={moment(user.dob)}
                          />
                        </Form.Item>
                      </Col>
                      <Col span="8">
                        <Form.Item label="Aadhaar Number" name="aadhaarNo">
                          <Input
                            placeholder="Aadhaar Number"
                            defaultValue={user.aadhaarNo}
                          />
                        </Form.Item>
                      </Col>
                      <Col span="8">
                        <Form.Item
                          label="Pilot Licence Number"
                          name="pilotLicenceNo"
                        >
                          <Input
                            placeholder="Pilot Licence Number"
                            defaultValue={user.pilotLicenceNo}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

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
              </>
            )}
        </div>
      );
  }
}

export default UserEditPage;
