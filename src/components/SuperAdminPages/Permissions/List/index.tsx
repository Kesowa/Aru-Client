import { useState, useEffect, useContext } from "react";
import { message, Button, Table } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { PlusCircleOutlined } from "@ant-design/icons";
import "../Permission.less";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { Link } from "react-router-dom";
import { AuthContext } from "src/services/authUtils";

function ListAllPermissions() {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [permissiontableData, setPermissiontableData] = useState([]);

  const { logout } = useContext(AuthContext);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
  ];

  const fetchAllPermissionList = () => {
    setIsTableLoading(true);
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
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setIsTableLoading(false);
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

export default ListAllPermissions;
