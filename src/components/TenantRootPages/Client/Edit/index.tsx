import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
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
import "../Client.less";
import Unauthorized from "../../../shared/Error/Unauthorized";
import FourOhOne from "../../../shared/Error/FourOhOne";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import InternalServerError from "../../../shared/Error/InternalServerError";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";
import moment from "moment";
import { STATIC_URL } from "src/constants";
import { components } from "src/handlers/schema";
import { PERMS, TENANT_CLIENT_PERMS } from "src/static/permissions";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

function ClientEditPage(props: any) {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
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

  const { Auth, logout } = useContext(AuthContext);
  const userDetails = Auth.userdetails;
  
  const { setLoading } = useContext(LoaderContext);
  
  //avatar upload
  const beforeUploadFunction = (file: any) => {
    beforeUpload(file, ["image/jpeg", "image/png"], 2, () => {
      setIsAvatarUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);
      http
        .post(apis.UPLOAD_USER_PROFILE_PICTURE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
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
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setIsAvatarUploading(false);
        });
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
        if (result.data.status) {
          const data: components["schemas"]["IUserGroupPermissions"][] = result.data.data;
          const groups = data
            .filter((ele) =>
              ele.permissions.every(perm => TENANT_CLIENT_PERMS.includes(perm)) // only list usergroups assignable to tenant-client
            )
            .map(({ _id, name, isActive, permissions }) => ({ _id, name, isActive, permissions }));

          if (!props.client) {
            history.push("/dashboard/tenant/client/list");
            return;
          }

          const sug = groups.find((g) => g._id === props.client.userGroupId);
          setSelectedusergroup(sug);
          setUserGroups(groups);
        } else {
          switch (result.data.message) {
            case "You do not have permission to use this API.":
              setErrorState("unauthorized");
              break;
          }
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
  useEffect(() => {
    if (!Auth.isLoggedIn) {
      setErrorState("unauthorized");
    } else if (
      (userDetails.userType === "tenant-client") ||
      (userDetails.userType === "tenant-staff" && !userDetails.customPermissions.includes(PERMS.EDIT_CLIENT))
    ) {
      // clients can't edit other clients
      // staff can edit clients only if have permission
      setErrorState("401");
    } else {
      // tenant-root can edit clients
      fetchAllUserGroupList();
    }
  }, []);

  useEffect(() => {
    if (props.client) {
      setAvatar(props.client.avatar);
    }
  }, [props.client]);

  //subimt form
  const onFinish = (data: any) => {
    EditUserAccount(data);
  };

  const EditUserAccount = (data: any) => {
    setLoading(true);
    const body = {
      id: props.client._id,
      ...data,
      avatar,
    };
    console.log(body);
    http
      .patch(`${apis.EDIT_CLIENT}`, body)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          form.resetFields();
          setAvatar("");
          message.info(result.data.message);
          history.push("/dashboard/tenant/client/list");
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
          {props.client && selectedUserGroup && (
            <>
              <PageHeader
                onBack={() => window.history.back()}
                className="site-page-header-responsive"
                title="Client"
                subTitle="Edit client"
                extra={[
                  <Link to="/dashboard/tenant/client/list" key="1">
                    <Button
                      key="1"
                      type="primary"
                      icon={<PlusCircleOutlined />}
                    >
                      List Client
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
                    name: props.client.name,
                    email: props.client.email,
                    phoneNo: props.client.phoneNo,
                    userType: "tenant-client",
                    userGroupId: selectedUserGroup._id,
                  }}
                  className="user-form"
                >
                  <Row gutter={16}>
                    <Col span="12">
                      <Form.Item label="Name" name="name">
                        <Input placeholder="Client's name" />
                      </Form.Item>
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
                            <Select.Option key={ele._id} value={ele._id}>
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
                          { type: "email", message: "Enter a valid email id" },
                        ]}
                      >
                        <Input placeholder="Email Id" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span="8">
                      <Form.Item label="Expiry date" name="expiryDate">
                        <DatePicker
                          style={{ width: "100%" }}
                          allowClear={true}
                          format="DD-MM-YYYY"
                          defaultValue={moment(props.client.expiryDate)}
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

const mapStateToProps = (state: any) => ({
  client: state.Client.clientToEdit,
});

export default connect(mapStateToProps, null)(ClientEditPage);
