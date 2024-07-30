import { useState, useEffect } from "react";
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
import { loading } from "../../../../actions/loadingAction";
import { logout } from "../../../../actions/authAction";
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
import moment from "moment";
import { STATIC_URL } from "src/constants";
import { RcFile } from "antd/lib/upload";
import { DocModel, uploadFile } from "src/services/fileUpload";

function UserEditPage(props: any) {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [userGroups, setUserGroups]: [any, any] = useState([]);
  const [selectedUserGroup, setSelectedusergroup]: [any, any] = useState();
  const [errorState, setErrorState] = useState("");
  const history = useHistory();
  //avatar upload
  const beforeUploadFunction = (file: RcFile) => {
    beforeUpload(file, ["image/jpeg", "image/png"], 2, async() => {
      setIsAvatarUploading(true);
      const uploadToken = await uploadFile(file, DocModel.DOCUMENTS, (prog) => console.info("PROGRESS: " + prog));

      const body = {
        file: uploadToken,
      };
      // const formData = new FormData();
      // formData.append("avatar", file);
      http
        .post(apis.UPLOAD_USER_PROFILE_PICTURE, body, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((result) => {
          console.log(result);

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

  //change user group
  const onUserGroupChange = (value: any) => {
    const ug = userGroups.find((ele: any) => ele._id === value);
    setSelectedusergroup(ug);
  };

  //fetch user group
  const fetchAllUserGroupList = () => {
    props.loading(true);
    http
      .get(apis.FETCH_TENANT_USER_GROUP)
      .then((result) => {
        console.log(result);

        if (result.data.status) {
          const data = result.data.data.map((ele: any) => {
            return {
              name: ele.name,
              _id: ele._id,
              isActive: ele.isActive,
              permissions: [...ele.permissions],
            };
          });

          let groups = data.filter((ele) => {
            let f = false;
            ele.permissions.forEach((p) => {
              if (!p.isClient) {
                f = true;
              }
            });
            return f;
          });

          groups = groups.map((group) => ({
            ...group,
            permissions: group.permissions.map((ele) => ele.name),
          }));

          console.log("groups", groups);

          if (!props.user) {
            history.push("/dashboard/tenant/user/list");
            return;
          }

          const sug = groups.find((g) => g._id === props.user.userGroupId);
          console.log("sug", sug);

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
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
      });
  };
  useEffect(() => {
    fetchAllUserGroupList();
  }, []);

  useEffect(() => {
    if (props.user) {
      setAvatar(props.user.avatar);
    }
  }, [props.user]);

  //subimt form
  const onFinish = (data: any) => {
    if (!data.dob) delete data.dob;
    if (!data.aadhaarNo) delete data.aadhaarNo;
    if (!data.pilotLicenceNo) delete data.pilotLicenceNo;
    console.log(data);
    EditUserAccount(data);
  };

  const EditUserAccount = (data: any) => {
    props.loading(true);
    const body = {
      id: props.user._id,
      ...data,
    };
    if (avatar && avatar !== "") {
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
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
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
          {props.user && selectedUserGroup && (
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
                    name: props.user.name,
                    email: props.user.email,
                    phoneNo: props.user.phoneNo,
                    userType: "tenant-client",
                    userGroupId: selectedUserGroup._id,
                  }}
                  className="user-form"
                >
                  <Row gutter={16}>
                    <Col span="12">
                      <Form.Item label="Name" name="name">
                        <Input placeholder="User's name" />
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
                      <Form.Item label="Date of Birth" name="dob">
                        <DatePicker
                          style={{ width: "100%" }}
                          allowClear={true}
                          format="DD-MM-YYYY"
                          defaultValue={moment(props.user.dob)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span="8">
                      <Form.Item label="Aadhaar Number" name="aadhaarNo">
                        <Input
                          placeholder="Aadhaar Number"
                          defaultValue={props.user.aadhaarNo}
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
                          defaultValue={props.user.pilotLicenceNo}
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
  Auth: state.Auth,
  Theme: state.Theme,
  user: state.User.userToEdit,
});

export default connect(mapStateToProps, { loading, logout })(UserEditPage);
