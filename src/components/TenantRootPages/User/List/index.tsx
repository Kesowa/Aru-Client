import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  PlusCircleOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  message,
  Input,
  Button,
  Tag,
  Table,
  Typography,
  Popconfirm,
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { loading } from "../../../../actions/loadingAction";
import { logout } from "../../../../actions/authAction";
import { setUserToEdit } from "../../../../actions/userAction";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import "../User.less";
import Unauthorized from "../../../shared/Error/Unauthorized";
import FourOhOne from "../../../shared/Error/FourOhOne";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import InternalServerError from "../../../shared/Error/InternalServerError";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";
import { Link } from "react-router-dom";
import moment from "moment";
import Highlighter from "react-highlight-words";
const { Title } = Typography;
function UserListPage(props: any) {
  const [isTableLoading, setIstableLoading] = useState(false);
  const [tenantUserTableData, setTenantUserTableData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [errorState, setErrorState] = useState(""); //used to render the page based on response code and api response
  const history = useHistory();

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

  //--------------render delete button based on user perms---------------------
  function renderDeleteBtn(record: any) {
    if (props.userType === "tenant-staff") {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "delete_user"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Popconfirm
            title="Are you sure to delete the user"
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              props.loading(true);
              http
                .delete(`${apis.DELETE_USER}`, {
                  params: {
                    id: record._id,
                  },
                })
                .then((result) => {
                  message.success(result.data.message);
                  fetchAllUsers();
                })
                .catch((err) => {
                  message.error(err.message);
                  AxiosErrorHandler(err, props.logout);
                })
                .finally(() => {
                  props.loading(false);
                });
            }}
          >
            <Button style={{ marginLeft: "8px" }} danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        );
      }
    } else {
      return (
        <Popconfirm
          title="Are you sure to delete the user"
          okText="Yes"
          cancelText="No"
          onConfirm={() => {
            props.loading(true);
            http
              .delete(`${apis.DELETE_USER}`, {
                params: {
                  id: record._id,
                },
              })
              .then((result) => {
                message.success(result.data.message);
                fetchAllUsers();
              })
              .catch((err) => {
                message.error(err.message);
                AxiosErrorHandler(err, props.logout);
              })
              .finally(() => {
                props.loading(false);
              });
          }}
        >
          <Button style={{ marginLeft: "8px" }} danger>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      );
    }
  }

  //--------------render edit button based on user perms---------------------
  function renderEditBtn(record: any) {
    if (props.userType === "tenant-staff") {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "edit_user"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Button
            onClick={() => {
              history.push(`/dashboard/tenant/user/edit/${record._id}`);
              props.setUserToEdit(record);
            }}
          >
            <EditOutlined />
          </Button>
        );
      }
    } else {
      return (
        <Button
          onClick={() => {
            history.push(`/dashboard/tenant/user/edit/${record._id}`);
            props.setUserToEdit(record);
          }}
        >
          <EditOutlined />
        </Button>
      );
    }
  }

  const renderActionButtonsIfRoot = (record) => {
    return (
      <>
        {renderEditBtn(record)}
        {record.userType !== "tenant-root" && renderDeleteBtn(record)}
        <Button
          style={{ marginLeft: "10px" }}
          onClick={() => {
            history.push(
              `/dashboard/tenant/user/change-password/${record._id}`
            );
            props.setUserToEdit(record);
          }}
        >
          <LockOutlined />
        </Button>
      </>
    );
  };

  const renderActionButtonsIfStaff = (record) => {
    return (
      <>
        {record.userType !== "tenant-root" && (
          <>
            {renderEditBtn(record)}
            {record._id !== props.userDetails._id && renderDeleteBtn(record)}
            <Button
              style={{ marginLeft: "10px" }}
              onClick={() => {
                history.push(
                  `/dashboard/tenant/user/change-password/${record._id}`
                );
                props.setUserToEdit(record);
              }}
            >
              <LockOutlined />
            </Button>
          </>
        )}
      </>
    );
  };

  const columns: any = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
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
      render: (createdBy: any) => (createdBy ? createdBy.name : "Auto"),
    },
    {
      title: "Is Banned",
      dataIndex: "isBanned",
      key: "isBanned",
      render: (status: boolean) => (
        <Tag color={status ? "volcano" : "green"}>
          {status ? "Banned" : "Active"}
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
          {props.userDetails.userType === "tenant-root" &&
            renderActionButtonsIfRoot(record)}
          {props.userDetails.userType === "tenant-staff" &&
            renderActionButtonsIfStaff(record)}
        </>
      ),
    },
  ];

  const fetchAllUsers = () => {
    setIstableLoading(true);
    http
      .get(apis.FETCH_ALL_USERS_OF_TENANT)
      .then((result) => {
        if (result.data.status) {
          setTenantUserTableData(result.data.data);
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
          case "500":
            AxiosErrorHandler(err, props.logout);
            break;
        }
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setIstableLoading(false);
      });
  };

  useEffect(() => {
    fetchAllUsers();
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
        <div className="tenant-root-userlistpage-wrapper full-width-height">
          <PageHeader
            onBack={() => window.history.back()}
            className="site-page-header-responsive"
            title="All users"
            subTitle="Here you will find all users under your organization."
            extra={[
              <Link to="/dashboard/tenant/user/create" key="1">
                <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
                  Create User
                </Button>
              </Link>,
            ]}
          ></PageHeader>
          <div className="tenants-user-list padding-after-page-header">
            <Table
              scroll={{ x: 1300 }}
              bordered={true}
              pagination={{ showSizeChanger: true, showQuickJumper: true }}
              loading={isTableLoading}
              dataSource={tenantUserTableData}
              columns={columns}
              rowKey="_id"
            />
          </div>
        </div>
      );
  }
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
  userDetails: state.Auth.userdetails,
});

export default connect(mapStateToProps, { loading, logout, setUserToEdit })(
  UserListPage
);
