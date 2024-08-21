import { useState, useEffect, useContext } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { message, Button, Table, Tag, Input, Popconfirm } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import {
  PlusCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "../Tenant.less";
import { setTenantToEdit } from "../../../../actions/tenantAction";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { Link } from "react-router-dom";
import moment from "moment";
import Highlighter from "react-highlight-words";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

function ListAllTanents(props: any) {
  const [isTableLoading, setIstableLoading] = useState(false);
  const [tenantTableData, setTenantTableData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const history = useHistory();
  const { logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);
  let searchInput: any;

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex: any) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput.select());
      }
    },
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  const columns: any = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
      ...getColumnSearchProps("contactPerson"),
    },
    {
      title: "Email Id",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Contact Number",
      dataIndex: "phoneNo",
      key: "phoneNo",
      ...getColumnSearchProps("phoneNo"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => moment(createdAt).format("DD-MM-YYYY"),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (createdBy: any) => createdBy.name,
    },
    {
      title: "Initial Payment",
      dataIndex: "isActivated",
      key: "isActivated",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "Paid" : "Not paid"}
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
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      fixed: "right",
      width: 190,
      render: (text, record) => (
        <>
          <Link to={`/dashboard/admin/tenant/details/${record._id}`}>
            <Button style={{ marginRight: "8px" }}>
              <EyeOutlined />
            </Button>
          </Link>
          <Button
            onClick={() => {
              history.push(`/dashboard/admin/tenant/edit/${record._id}`);
              props.setTenantToEdit(record);
            }}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Are you sure to delete the tenant?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              setLoading(true);
              http
                .delete(`${apis.DELETE_TENANT}`, {
                  data: {
                    tenantId: record._id,
                  },
                })
                .then((result) => {
                  message.success(result.data.message);
                  fetchAllTenants();
                })
                .catch((err) => {
                  message.error(err.message);
                  AxiosErrorHandler(err, logout);
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            <Button style={{ marginLeft: "8px" }} danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const fetchAllTenants = () => {
    setIstableLoading(true);
    http
      .get(apis.FETCH_ALL_TENANTS)
      .then((result) => {
        if (result.data.status) {
          console.log(result.data.data);
          setTenantTableData(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setIstableLoading(false);
      });
  };

  useEffect(() => {
    fetchAllTenants();
  }, []);

  return (
    <div
      className="tenant-list-wrapper full-width-height"
      style={{ padding: "16px" }}
    >
      <PageHeader
        className="site-page-header-responsive"
        title="All Tenants"
        subTitle="Add new Tenant"
        extra={[
          <Link to="/dashboard/admin/tenant/create" key="1">
            <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
              Create Tenant
            </Button>
          </Link>,
        ]}
      ></PageHeader>
      <div className="tenants-list padding-after-page-header">
        <Table
          scroll={{ x: 1300 }}
          bordered={true}
          pagination={{ showSizeChanger: true, showQuickJumper: true }}
          loading={isTableLoading}
          dataSource={tenantTableData}
          columns={columns}
          rowKey="_id"
        />
      </div>
    </div>
  );
}

export default connect(null, { setTenantToEdit })(
  ListAllTanents
);
