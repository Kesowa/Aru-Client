import React, { useState, useEffect } from "react";
import {
  EyeOutlined,
  EditOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import {
  PageHeader,
  Row,
  Col,
  message,
  Button,
  Table,
  Divider,
  List,
  Typography,
  Popconfirm,
} from "antd";
import { loading } from "../../../../actions/loadingAction";
import { logout } from "../../../../actions/authAction";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import "../UserGroup.less";
import Unauthorized from "../../../shared/Error/Unauthorized";
import FourOhOne from "../../../shared/Error/FourOhOne";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import InternalServerError from "../../../shared/Error/InternalServerError";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";

function UserGroupListPage(props: any) {
  const [isTableLoading, setIstableLoading] = useState(false);
  const [userGroupTableData, setUserGroupTableData] = useState([]);
  const [activeUserGroup, setActiveUserGroup]: [any, any] = useState();
  const [errorState, setErrorState] = useState("");
  const history = useHistory();

  const deleteUsergroup = (id) => {
    props.loading(true);
    http
      .delete(`${apis.DELETE_USERGROUP}`, {
        params: {
          id: id,
        },
      })
      .then((res) => {
        if (res.data.status) {
          fetchAllUserGroupList();
          message.success(res.data.message);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        if (err.response.status === 400) {
          message.warning("This use group is currently in use!");
        } else {
          console.log(err);
        }
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Actions",
      dataIndex: "_id",
      key: "_id",
      render: (id: any, row: any) => (
        <>
          <Link to={`/dashboard/tenant/user-group/edit/${id}`}>
            <Button type="primary" icon={<EditOutlined />} />
          </Link>
          <Divider type="vertical" />
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => setActiveUserGroup(row)}
          >
            details
          </Button>
          <Popconfirm
            onConfirm={() => deleteUsergroup(id)}
            title="Are you sure to delete this user group"
          >
            <Button
              style={{ marginLeft: "20px" }}
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </>
      ),
    },
  ];

  const fetchAllUserGroupList = () => {
    setIstableLoading(true);
    http
      .get(apis.FETCH_TENANT_USER_GROUP)
      .then((result) => {
        if (result.data.status) {
          const data = result.data.data.map((ele: any) => {
            return {
              name: ele.name,
              _id: ele._id,
              isActive: ele.isActive,
              permissions: ele.permissions.map((e: any) => e.name),
            };
          });
          console.log(data);
          setUserGroupTableData(data);
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
            AxiosErrorHandler(err, props.logout);
        }
      })
      .finally(() => {
        setIstableLoading(false);
      });
  };

  useEffect(() => {
    fetchAllUserGroupList();
  }, []);

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
        <div className="tenant-root-usergrouplist-wrapper full-width-height">
          <PageHeader
            onBack={() => window.history.back()}
            className="site-page-header-responsive"
            title="User Groups"
            subTitle="All user groups"
            extra={[
              <Link to="/dashboard/tenant/user-group/create" key="1">
                <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
                  Create User Group
                </Button>
              </Link>,
            ]}
          ></PageHeader>
          <div className="padding-after-page-header tenant-usergrouplist-inner">
            <div className="table-wrapper">
              <Row gutter={16}>
                <Col span={activeUserGroup ? 12 : 24}>
                  <Table
                    bordered={true}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                    }}
                    loading={isTableLoading}
                    dataSource={userGroupTableData}
                    columns={columns}
                    rowKey="_id"
                  />
                </Col>
                {activeUserGroup ? (
                  <Col span="12">
                    <div>
                      <List
                        header={
                          <div>{`User Group : ${activeUserGroup.name}`}</div>
                        }
                        bordered
                        dataSource={activeUserGroup.permissions}
                        renderItem={(item: any) => (
                          <List.Item>
                            <Typography.Text>{item}</Typography.Text>
                          </List.Item>
                        )}
                      />
                    </div>
                  </Col>
                ) : null}
              </Row>
            </div>
          </div>
        </div>
      );
  }
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { loading, logout })(UserGroupListPage);
