import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { PageHeader, message, Button, Table, Tag } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import "../Permission.less";
import { loading } from "../../../../actions/loadingAction";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import { Link } from "react-router-dom";

function ListAllPermissions(props: any) {
  const [isTableLoading, setIstableLoading] = useState(false);
  const [permissiontableData, setPermissiontableData] = useState([]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "frontend route",
      dataIndex: "isFrontendRoute",
      key: "isFrontendRoute",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>{status ? "yes" : "no"}</Tag>
      ),
    },
    {
      title: "Sidebar Route",
      dataIndex: "frontendRoute",
      key: "frontendRoute",
    },
    {
      title: "Sidebar Label",
      dataIndex: "sideNavOptionLabel",
      key: "sideNavOptionLabel",
    },
    {
      title: "show in side navigation",
      dataIndex: "isSideNavOption",
      key: "isSideNavOption",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>{status ? "yes" : "no"}</Tag>
      ),
    },
    {
      title: "visible to super admin",
      dataIndex: "isVisibleToSuperAdmin",
      key: "isVisibleToSuperAdmin",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "visible" : "not visible"}
        </Tag>
      ),
    },
    {
      title: "visible to tenant",
      dataIndex: "isVisibleToTenant",
      key: "isVisibleToTenant",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "visible" : "not visible"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "Working" : "Deleted"}
        </Tag>
      ),
    },
  ];

  const fetchAllPermissionList = () => {
    setIstableLoading(true);
    http
      .get(apis.FETCH_ALL_PERMISSIONS)
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          setPermissiontableData(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setIstableLoading(false);
      });
  };

  useEffect(() => {
    fetchAllPermissionList();
  }, []);

  return (
    <div className="permission-list-wrapper full-width-height">
      <PageHeader
        className="site-page-header-responsive"
        title="All Packages"
        subTitle="Register a new package"
        extra={[
          <Link to="/dashboard/admin/permission/create" key="1">
            <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
              Create Permission
            </Button>
          </Link>,
        ]}
      ></PageHeader>
      <div className="permission-list padding-after-page-header">
        <Table
          bordered={true}
          pagination={{ showSizeChanger: true, showQuickJumper: true }}
          loading={isTableLoading}
          dataSource={permissiontableData}
          columns={columns}
          rowKey="_id"
        />
      </div>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  Theme: state.Theme,
});

export default connect(mapStateToProps, { loading, logout })(
  ListAllPermissions
);
