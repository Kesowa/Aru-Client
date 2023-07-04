import { useState, useEffect } from "react";
import { UnorderedListOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Row,
  Col,
  message,
  Transfer,
  Form,
  Input,
  Button,
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { loading } from "../../../../actions/loadingAction";
import { logout } from "../../../../actions/authAction";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import RenderSideBar from "../RenderSideBar";
import "../UserGroup.less";
import Unauthorized from "../../../shared/Error/Unauthorized";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";
import FourOhOne from "../../../shared/Error/FourOhOne";
import InternalServerError from "../../../shared/Error/InternalServerError";

function UserGroupEditPage(props: any) {
  const [form] = Form.useForm();
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissionsIds, setSelectedPermissionsIds] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [errorState, setErrorState] = useState("");
  const [groupName, setGroupName] = useState("");
  const history = useHistory();
  const { id } = useParams();

  const fetchAllPermissions = () => {
    props.loading(true);
    http
      .get(apis.FETCH_TENANT_PERMISSION_LIST)
      .then((result) => {
        if (result.data.status) {
          setAllPermissions(result.data.data);
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
        switch (err.status.toString()) {
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
      });
  };

  const fetchAllUserGroupList = () => {
    http
      .get(apis.FETCH_TENANT_USER_GROUP)
      .then((result) => {
        if (result.data.status) {
          const data = result.data.data.filter((ele) => {
            return ele._id === id;
          });

          setGroupName(data[0].name);
          const prIds = data[0].permissions.map((ele) => ele._id);
          const permissions = allPermissions.filter((ele: any) =>
            prIds.includes(ele._id)
          );
          setSelectedPermissionsIds(prIds);
          setSelectedPermissions(permissions);
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
        switch (err.status.toString()) {
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
    fetchAllPermissions();
  }, []);

  useEffect(() => {
    if (allPermissions.length) {
      fetchAllUserGroupList();
    }
  }, [allPermissions]);

  const transferchange = (targetKeys: any) => {
    const arr = allPermissions.filter((ele: any, i) =>
      targetKeys.includes(ele._id)
    );
    setSelectedPermissionsIds(targetKeys);
    setSelectedPermissions(arr);
  };

  useEffect(() => {
    console.log(selectedPermissions);
  }, [selectedPermissions]);

  //subimt form
  const onFinish = (data: any) => {
    console.log(data, selectedPermissionsIds);
    if (selectedPermissionsIds.length > 0) {
      editUserGroup(data);
    } else {
      message.error(
        "You must select at least one permission to create the user group"
      );
    }
  };

  const editUserGroup = (data: any) => {
    props.loading(true);
    const body = {
      id: id,
      name: groupName,
      isActive: true,
      permissions: selectedPermissionsIds,
    };
    console.log(body);
    http
      .patch(apis.EDIT_USERGROUP, body)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          message.info(result.data.message);
          form.resetFields();
          setSelectedPermissionsIds([]);
          setSelectedPermissions([]);
          history.goBack();
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
    case "503":
      return <ServiceUnavailable />;
    case "504":
      return <GatewayTimeout />;
    case "500":
      return <InternalServerError />;
    default:
      return (
        <div className="tenant-root-usergroupcreate-wrapper full-width-height">
          <PageHeader
            onBack={() => window.history.back()}
            className="site-page-header-responsive"
            title="User Group"
            subTitle="Edit user group"
            extra={[
              <Link to="/dashboard/tenant/user-group/list" key="1">
                <Button key="1" type="primary" icon={<UnorderedListOutlined />}>
                  User Group List
                </Button>
              </Link>,
            ]}
          ></PageHeader>
          <div className="padding-after-page-header tenant-usergroupcreate-inner">
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              scrollToFirstError={true}
              className="user-group-form"
            >
              <Row gutter={16}>
                <Col span="16">
                  <Form.Item label="Group Name" name="name">
                    {groupName && (
                      <Input
                        type="text"
                        defaultValue={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    )}
                  </Form.Item>
                  <Transfer
                    dataSource={allPermissions}
                    showSearch
                    listStyle={{
                      width: "100%",
                      height: 400,
                    }}
                    onChange={transferchange}
                    render={(item: any) => `${item.name}`}
                    rowKey={(record) => record._id}
                    targetKeys={selectedPermissionsIds}
                    oneWay
                  />
                </Col>
                <Col span="8">
                  <RenderSideBar selectedPermissions={selectedPermissions} />
                </Col>
              </Row>
              <Row justify="end" gutter={16}>
                <Col>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      submit
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

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { loading, logout })(UserGroupEditPage);
