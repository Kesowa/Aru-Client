import { useState, useEffect } from "react";
import {
  Tag,
  Row,
  Col,
  Typography,
  Tooltip,
  Table,
  Button,
  message,
  Popconfirm,
} from "antd";
import { Input } from "antd";
import { logout } from "../../../../../actions/authAction";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import http from "../../../../../services/httpCall";
import apis from "../../../../../services/apis";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";
import moment from "moment";
import {
  setMissionsToState,
  deleteMission,
} from "../../../../../actions/missionActions";
import { useHistory } from "react-router-dom";
import mp from "../../../../../static/mapping.svg";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import "./index.less";

interface TableProps {
  filter: any;
  userType: any;
  tenantId: any;
  userId: any;
  logout: any;
  setMissionsToState: any;
  deleteMission: any;
  missions: any;
  setMissionTableData: any;
  setIsTableLoading: any;
  isTableLoading: any;
  missionTableData: any;
  setPage: any;
  page: any;
  limit: any;
  setLimit: any;
  setPaginationPage: any;
  setPageLimit: any;
  total: any;
  setTotal: any;
  usedFilter: any;
  setSortOrder: any;
  setFilters: any;
  userDetails: any;
}

function MissionTable(props: TableProps) {
  const history = useHistory();
  const { Title } = Typography;

  // ++++++++++++++++++++++++++++++++++++++++++Searchable columns+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  function dataIndexPlaceholder(dataIndex: any) {
    if (dataIndex == "createdAt") return "Order Date";
    if (dataIndex == "_id") return "Mission Id";
    return dataIndex;
  }

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
          placeholder={`Search by ${dataIndexPlaceholder(dataIndex)}`}
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
    onFilter: (value: any, record: any) => true,
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

  // setting tab status filters

  useEffect(() => {
    if (props.filter === props.usedFilter) {
      if (props.missions.length) {
        if (props.filter === "all") {
          props.setMissionTableData(props.missions);
        } else {
          const data = props.missions.filter((row) => {
            return row.status === props.filter;
          });
          props.setMissionTableData(data);
        }
      }
    }
  }, [props.missions]);

  // ++++++++++++++++++++++++++++++++++++++++++++++ Delete mission handler +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const deleteMission = (name, id) => {
    props.setIsTableLoading(true);
    http
      .post(`${apis.DELETE_MISSION_BY_ID}`, {
        _id: id,
      })
      .then((result) => {
        if (result.data.status) {
          const newTableData = props.missionTableData.filter((mission: any) => {
            return mission._id.toString() != id.toString();
          });
          props.setMissionTableData(newTableData);
          props.deleteMission(id);
          message.success(`Mission "${name}" deleted`);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 400) {
            message.warning(
              "You are not allowed to delete a mission create by someone else!"
            );
          }
        } else {
          message.error(
            "Unable to connect to server, please check your internet connection!"
          );
        }
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.setIsTableLoading(false);
      });
  };

  //----------------RenderDeleteButton---------------------

  function renderDeleteBtn(record: any) {
    if (props.userType === "tenant-staff") {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "mission_delete"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Popconfirm
            title="Are you sure to delete the mission？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              deleteMission(record.name, record._id);
            }}
          >
            <Button style={{ marginLeft: "8px" }} danger>
              <DeleteOutlined className="missionViewDelBtn" />
            </Button>
          </Popconfirm>
        );
      }
    } else {
      return (
        <Popconfirm
          title="Are you sure to delete the mission？"
          okText="Yes"
          cancelText="No"
          onConfirm={() => {
            deleteMission(record.name, record._id);
          }}
        >
          <Button style={{ marginLeft: "8px" }} danger>
            <DeleteOutlined className="missionViewDelBtn" />
          </Button>
        </Popconfirm>
      );
    }
  }

  // ++++++++++++++++++++++++++++++++++++++++++Defining Columns++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const columns: any[] = [
    {
      title: "Mission Name",
      dataIndex: "name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("name"),
      render: (name: any, record) => {
        record.missionType = {
          name: "undefined",
          _id: "undefined",
          ...record.missionType,
        };
        return (
          <>
            <span
              onClick={() => {
                history.push({
                  pathname: `/dashboard/mission/view/staff-${record._id}`,
                  state: {
                    missionPage: {
                      usedFilter: props.usedFilter,
                      page: props.page,
                      limit: props.limit,
                    },
                  },
                });
              }}
            >
              <Tooltip placement="bottom" title={name}>
                <Title level={5} className="tableMissionName">
                  {record.missionType.name === "Surveillance" && (
                    <FontAwesomeIcon
                      icon={faPlaneDeparture}
                      style={{ marginRight: "1rem", color: "#a5a4bf" }}
                    />
                  )}

                  {record.missionType.name === "Market Survey" && (
                    <FontAwesomeIcon
                      icon={faPlaneDeparture}
                      style={{ marginRight: "1rem", color: "#a5a4bf" }}
                    />
                  )}

                  {record.missionType.name === "Canal Survey" && (
                    <FontAwesomeIcon
                      icon={faPlaneDeparture}
                      style={{ marginRight: "1rem", color: "#a5a4bf" }}
                    />
                  )}

                  {record.missionType.name === "Mapping" && (
                    <img
                      src={mp}
                      style={{
                        marginRight: "1rem",
                        color: "#a5a4bf",
                        height: "20px",
                        width: "20px",
                      }}
                      alt=""
                    />
                  )}

                  {name}
                </Title>
              </Tooltip>
            </span>
          </>
        );
      },
    },
    {
      title: "Order Date",
      dataIndex: "createdAt",
      sorter: true,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("createdAt"),
      defaultSortOrder: "descend",
      render: (createdAt: string) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {moment(createdAt).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      title: "Flight Date",
      dataIndex: "flight",
      sorter: (a: any, b: any) => true,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("flight"),
      render: (flight: any) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {moment(flight?.date).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      title: "Mission ID",
      dataIndex: "_id",
      ...getColumnSearchProps("_id"),
      render: (text, record) => (
        <>
          <span
            onClick={() => {
              history.push({
                pathname: `/dashboard/mission/view/staff-${record._id}`,
                state: {
                  missionPage: {
                    usedFilter: props.usedFilter,
                    page: props.page,
                    limit: props.limit,
                  },
                },
              });
            }}
          >
            <p className="mission-id">{record._id}</p>
          </span>
        </>
      ),
    },
    {
      title: "Created By",
      dataIndex: "user",
      sorter: (a: any, b: any) => a.user.length - b.user.length,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("user"),
      render: (user: any) =>
        user ? (user.name ? user.name : "Auto") : "User Deleted",
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (tags: any) => {
        let color;

        switch (tags) {
          case "Upcoming":
            color = "orange";
            break;
          case "Live":
            color = "geekblue";
            break;

          case "Completed":
            color = "green";
            break;

          case "Review":
            color = "magenta";
            break;

          default:
            color = "red";
        }
        return (
          <Tag color={color} key={tags}>
            {tags.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      className: "mission-actions",
      render: (text, record) => (
        <>
          <Button
            onClick={() => {
              history.push({
                pathname: `/dashboard/mission/view/staff-${record._id}`,
                state: {
                  missionPage: {
                    usedFilter: props.usedFilter,
                    page: props.page,
                    limit: props.limit,
                  },
                },
              });
            }}
          >
            <EyeOutlined className="missionViewBtn" />
          </Button>

          {renderDeleteBtn(record)}
        </>
      ),
    },
  ];

  const onSearch = (value) => {
    props.setIsTableLoading(true);
    if (!value) {
      if (props.missions) {
        props.setMissionTableData(props.missions);
      }
    } else {
      value = value.toLowerCase();

      if (props.missions) {
        const searchedMissions = props.missions.filter((mission: any) => {
          return (
            mission.status.toLowerCase().startsWith(value) ||
            mission.name.toLowerCase().startsWith(value) ||
            mission._id.toLowerCase().startsWith(value) ||
            mission.user.name.toLowerCase().startsWith(value)
          );
        });

        props.setMissionTableData(searchedMissions);
      }
    }

    props.setIsTableLoading(false);
  };

  const handleTableChange = (pagination, filter, sorter) => {
    let filterString = "";
    Object.entries(filter).forEach((f: any) => {
      if (f[1]) {
        filterString += `${f[0]}:${f[1][0]},`;
      }
    });

    props.setFilters(filterString.substring(0, filterString.length - 1));

    props.setSortOrder(`${sorter.field}:${sorter.order}`);
  };

  return (
    <div>
      {/* +++++++++++++++++++++++++++++++++MISION LISTING+++++++++++++++++++++++++++++++++++++++++ */}
      <Row style={{ marginTop: "1rem" }}>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={props.missionTableData}
            loading={props.isTableLoading}
            rowKey="_id"
            className="mission-table"
            pagination={{
              total: props.total,
              pageSize: props.limit,
              onShowSizeChange: props.setPageLimit,
              current: props.page,
              onChange: props.setPaginationPage,
            }}
            onChange={handleTableChange}
          />
        </Col>
      </Row>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    userType: state.Auth.userdetails.userType,
    tenantId:
      state.Auth.userdetails.tenantId._id || state.Auth.userdetails.tenantId,
    userId: state.Auth.userdetails._id,
    missions: state.Missions.missions,
    userDetails: state.Auth.userdetails,
  };
};

export default connect(mapStateToProps, {
  logout,
  setMissionsToState,
  deleteMission,
})(MissionTable);
