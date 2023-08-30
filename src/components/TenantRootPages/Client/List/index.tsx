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
import { message, Input, Button, Tag, Table, Popconfirm } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { loading } from "../../../../actions/loadingAction";
import { setClientToEdit } from "../../../../actions/cliantActions";
import { logout } from "../../../../actions/authAction";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import "../Client.less";
import Unauthorized from "../../../shared/Error/Unauthorized";
import FourOhOne from "../../../shared/Error/FourOhOne";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import InternalServerError from "../../../shared/Error/InternalServerError";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";
import { Link } from "react-router-dom";
import moment from "moment";
import Highlighter from "react-highlight-words";
function UserListPage(props: any) {
  const [isTableLoading, setIstableLoading] = useState(false);
  const [tenantUserTableData, setTenantUserTableData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [errorState, setErrorState] = useState(""); //used to render the page based on response code and api response
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState("");
  const [searchFilters, setSearchFilters] = useState<any>(null);
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
          (d) => d.name === "delete_client"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Popconfirm
            title="Are you sure to delete the client？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              props.loading(true);
              http
                .delete(`${apis.DELETE_CLIENT}`, {
                  data: {
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
          title="Are you sure to delete the client？"
          okText="Yes"
          cancelText="No"
          onConfirm={() => {
            props.loading(true);
            http
              .delete(`${apis.DELETE_CLIENT}`, {
                data: {
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
          (d) => d.name === "edit_client"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Button
            onClick={() => {
              history.push(`/dashboard/tenant/client/edit/${record._id}`);
              props.setClientToEdit(record);
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
            history.push(`/dashboard/tenant/client/edit/${record._id}`);
            props.setClientToEdit(record);
          }}
        >
          <EditOutlined />
        </Button>
      );
    }
  }

  //-------------render create client button-----------------------------------
  function renderCreateClientButton() {
    if (props.userType === "tenant-staff") {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "create_client"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Link to="/dashboard/tenant/client/create" key="1">
            <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
              Create Client
            </Button>
          </Link>
        );
      }
    } else {
      return (
        <Link to="/dashboard/tenant/client/create" key="1">
          <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
            Create Client
          </Button>
        </Link>
      );
    }
  }

  const columns: any = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
      sorter: (a: any, b: any) => null,
      sortDirections: ["ascend", "descend"],
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
      title: "Missions",
      dataIndex: "count",
      key: "missions",
      render: (count) => {
        return count && count.length ? count[0].count : 0;
      },
      sorter: (a: any, b: any) => null,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      ...getColumnSearchProps("country"),
      render: (country) => {
        return country;
      },
      sorter: (a: any, b: any) => null,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      ...getColumnSearchProps("city"),
      render: (city) => {
        return city;
      },
      sorter: (a: any, b: any) => null,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      ...getColumnSearchProps("createdAt"),
      render: (createdAt: string) => moment(createdAt).format("DD-MM-YYYY"),
      sorter: (a: any, b: any) => null,
      sortDirections: ["ascend", "descend"],
    },

    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      ...getColumnSearchProps("createdBy"),
      render: (createdBy: any) => (createdBy ? createdBy.name : "Auto"),
      sorter: (a: any, b: any) => null,
      sortDirections: ["ascend", "descend"],
    },

    {
      title: "Expiry Date",
      dataIndex: "expiryDatee",
      key: "expiryDatee",
      ...getColumnSearchProps("expiryDate"),
      render: (expiryDatee) => moment(expiryDatee).format("DD-MM-YYYY"),
      sorter: (a: any, b: any) => null,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Status",
      dataIndex: "isBanned",
      key: "isBanned",
      render: (isBanned: boolean, record) => {
        if (isBanned) return <Tag color="volcano">Banned</Tag>;
        else if (moment(record.expiryDatee).isBefore(moment()))
          return <Tag color="red">Expired</Tag>;
        else return <Tag color="green">Active</Tag>;
      },
    },
    {
      title: "ACTIONS",
      dataIndex: "actions",
      fixed: "right",
      key: "actions",
      width: 190,
      render: (text, record) => (
        <>
          {renderEditBtn(record)}
          {renderDeleteBtn(record)}
          <Button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              history.push(
                `/dashboard/tenant/client/change-password/${record._id}`
              );
              props.setClientToEdit(record);
            }}
          >
            <LockOutlined />
          </Button>
        </>
      ),
    },
  ];

  const fetchAllUsers = () => {
    setIstableLoading(true);
    const params = {};
    if (searchFilters) {
      Object.entries(searchFilters).forEach((f: any) => {
        if (f[1]) {
          params[f[0]] = f[1];
        }
      });
    }

    setTenantUserTableData([]);
    http
      .get(apis.GET_CLIENT_LIST, {
        params: {
          page: page,
          limit: limit,
          ...params,
          sort: sortOrder,
        },
      })
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          setTenantUserTableData(result.data.data);
          setTotal(result.data.total);
        } else {
          message.info(result.data.message);
          setTenantUserTableData([]);
        }
      })
      .catch((err) => {
        console.log(err);
        switch (err.response?.status.toString()) {
          case "401":
            setErrorState("401");
            break;
          case "500":
            AxiosErrorHandler(err, props.logout);
            break;
        }
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setIstableLoading(false);
      });
  };

  const setPaginationPage = (p) => {
    setPage(p);
  };

  const setPageLimit = (currPage, limit) => {
    setPage(currPage);
    setLimit(limit);
  };

  useEffect(() => {
    fetchAllUsers();
  }, [page, limit, searchFilters, sortOrder]);

  const handleTableChange = (pagination, filter, sorter) => {
    setSearchFilters(filter);
    if (sorter.order) {
      const order = `${sorter.field}:${
        sorter.order === "ascend" ? "asc" : "desc"
      }`;
      setSortOrder(order);
    } else {
      setSortOrder("");
    }
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
        <div className="tenant-root-userlistpage-wrapper full-width-height">
          <PageHeader
            onBack={() => window.history.back()}
            className="site-page-header-responsive"
            title="All Clients"
            subTitle="Here you will find all clients."
            extra={renderCreateClientButton()}
          ></PageHeader>
          <div className="tenants-user-list padding-after-page-header">
            <Table
              scroll={{ x: 1300 }}
              bordered={true}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                total: total,
                pageSize: limit,
                onShowSizeChange: setPageLimit,
                current: page,
                onChange: setPaginationPage,
              }}
              loading={isTableLoading}
              dataSource={tenantUserTableData}
              columns={columns}
              rowKey="_id"
              onChange={handleTableChange}
            />
          </div>
        </div>
      );
  }
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
  userType: state.Auth.userdetails.userType,
  userDetails: state.Auth.userdetails,
});

export default connect(mapStateToProps, { loading, logout, setClientToEdit })(
  UserListPage
);
