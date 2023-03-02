import React, { useState, useEffect } from "react";
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
  Radio,
  Spin,
  PageHeader,
} from "antd";
import { Input } from "antd";
import { Link } from "react-router-dom";
import {
  AudioOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import {
  setMissionsToState,
  deleteMission,
} from "../../../../actions/missionActions";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import moment from "moment";
import { useHistory } from "react-router-dom";
import mp from "../../../../static/mapping.svg";
import "../../../shared/MissionList.less";

interface TabOptions {
  filter: any;
  deleteMission: any;
}
function DataMission(props) {
  const history = useHistory();
  const [completedMissions, setCompletedMissions] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  // const [usedFilter, setUsedFilter] = useState("Completed");
  const [missionCount, setMissionCount] = useState({});
  const [totalMissions, settotalMissions] = useState(0);
  const [sortOrder, setSortOrder] = useState("createdAt:descend");
  const [searchFilters, setSearchFilters] = useState("");
  const [missionTypes, populateMissionTypes] = useState([]);
  const [typesLoader, setTypesLoader] = useState(false);
  const [missionType, setMissionType] = useState("");

  const setPaginationPage = (p) => {
    setPage(p);
  };

  const setPageLimit = (currPage, limit) => {
    setPage(currPage);
    setLimit(limit);
  };

  const { Search } = Input;
  const { Title } = Typography;
  const suffix = (
    <AudioOutlined
      style={{
        fontSize: 16,
        color: "#1890ff",
      }}
    />
  );
  // ++++++++++++++++++++++++++++++++++++++++++Searchable columns+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
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
    onFilter: (value: any, record: any) => {
      console.log(
        record[dataIndex].name
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      return record[dataIndex].name
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
    onFilterDropdownVisibleChange: (visible: any) => {
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

  // ++++++++++++++++++++++++++++++++++++++++++++++ Delete mission handler +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const deleteMission = (name, id) => {
    setIsTableLoading(true);
    http
      .post(`${apis.DELETE_MISSION_BY_ID}`, {
        _id: id,
      })
      .then((result) => {
        if (result.data.status) {
          const newTableData = completedMissions.filter((mission: any) => {
            return (
              mission._id.toString() !== id.toString() &&
              mission.status === "Completed"
            );
          });
          setCompletedMissions(newTableData);
          props.deleteMission(id);
          message.success(`Mission "${name}" deleted`);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setIsTableLoading(false);
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
      title: "MISSION",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name.length - b.name.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("name"),
      render: (name: any, record) => {
        return (
          <>
            <span
              onClick={() => {
                history.push(`/dashboard/mission/view/staff-${record._id}`);
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
                  {name}
                </Title>
              </Tooltip>
            </span>
          </>
        );
      },
    },
    {
      title: "Client",
      dataIndex: "clientId",
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("clientId"),
      render: (client) => client?.name,
    },
    {
      title: "ORDER DATE",
      dataIndex: "createdAt",
      sorter: (a: any, b: any) =>
        moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("createdAt"),
      render: (createdAt: string) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {moment(createdAt).format("DD-MM-YYYY")}
        </span>
      ),
    },
    {
      title: "MISSION ID",
      dataIndex: "_id",
      ...getColumnSearchProps("_id"),
      render: (text, record) => (
        <>
          <span
            onClick={() => {
              history.push(`/dashboard/mission/view/staff-${record._id}`);
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
      render: (user: any) => (user.name ? user.name : "Auto"),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      sorter: (a: any, b: any) => a.status.length - b.status.length,
      sortDirections: ["ascend", "descend"],
      render: (tags: any) => {
        console.log("This is tags", tags);
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
      title: "ACTIONS",
      dataIndex: "actions",
      className: "mission-actions",
      render: (text, record) => (
        <>
          <Button
            onClick={() => {
              history.push(`/dashboard/mission/view/staff-${record._id}`);
            }}
          >
            <EyeOutlined />
          </Button>
          {renderDeleteBtn(record)}
        </>
      ),
    },
  ];

  // +++++++++++++++++++++++++++++++++++++++++++++++ Fetch Missions ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  function fetchMissions() {
    const { userType } = props;
    const { tenantId } = props;
    setIsTableLoading(true);
    if (userType === "tenant-root" || userType === "tenant-staff") {
      const params = {
        id: tenantId,
        page,
        limit,
        filter: "all",
        sort: sortOrder,
        searchFilters,
        client: "true",
      };
      if (missionType !== "") {
        params["missionType"] = missionType;
      }
      http
        .get(`${apis.GET_ALL_MISSIONS_FOR_TENANT}`, {
          params: params,
        })
        .then((result) => {
          if (result.data.status) {
            props.setMissionsToState(result.data.data);
            setCompletedMissions(result.data.data);
            setTotal(result.data.total);
          } else {
            message.error(result.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          setIsTableLoading(false);
        });
    } else {
      return;
    }
  }

  useEffect(() => {
    fetchMissions();
  }, [page, limit, sortOrder, searchFilters, missionType]);

  //fetch mission types
  useEffect(() => {
    setTypesLoader(true);
    http
      .get(`${apis.GET_ALL_MISSION_TYPES}`)
      .then((res) => {
        if (res.data.status) {
          console.log("MIssion types", res.data.data);
          populateMissionTypes(res.data.data);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => setTypesLoader(false));
  }, []);

  function onChange(pagination, filters, sorter, extra) {
    console.log("params", pagination, filters, sorter, extra);
  }

  const onSearch = (value) => {
    setIsTableLoading(true);
    if (!value) {
      if (props.missions) {
        console.log(props.mission);
        setCompletedMissions(props.missions);
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

        setCompletedMissions(searchedMissions);
      }
    }

    setIsTableLoading(false);
  };

  const handleTableChange = (pagination, filter, sorter) => {
    let filterString = "";
    Object.entries(filter).forEach((f: any) => {
      if (f[1]) {
        filterString += `${f[0]}:${f[1][0]},`;
      }
    });
    setSearchFilters(filterString.substring(0, filterString.length - 1));

    setSortOrder(`${sorter.field}:${sorter.order}`);
  };

  const onMissionTypeChange = (e) => {
    if (e.target.value !== "all") setMissionType(e.target.value);
    else setMissionType("");
  };

  //-------------render create client button-----------------------------------
  function renderCreateListButton() {
    if (props.userType === "tenant-staff") {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "client_list"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Link to="/dashboard/tenant/client/list" key="1">
            <Button key="1" type="primary" icon={<SolutionOutlined />}>
              List Client
            </Button>
          </Link>
        );
      }
    } else {
      return (
        <Link to="/dashboard/tenant/client/list" key="1">
          <Button key="1" type="primary" icon={<SolutionOutlined />}>
            List Client
          </Button>
        </Link>
      );
    }
  }

  return (
    <div className="tenant-root-usercreatepage-wrapper full-width-height">
      <PageHeader
        onBack={() => window.history.back()}
        className="site-page-header-responsive"
        title="Client Data"
        subTitle="Here you will find all missions conducted for clients"
        extra={renderCreateListButton()}
      ></PageHeader>
      <Row>
        <Spin spinning={typesLoader}>
          <Radio.Group
            defaultValue="all"
            buttonStyle="solid"
            onChange={onMissionTypeChange}
          >
            <Radio.Button value="all" key="1">
              All
            </Radio.Button>
            {missionTypes.map((item: any) => {
              return (
                <Radio.Button value={item._id} key={item._id}>
                  {item.name}
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </Spin>
      </Row>
      {/* +++++++++++++++++++++++++++++++++MISION LISTING+++++++++++++++++++++++++++++++++++++++++ */}
      <Row style={{ marginTop: "1rem" }}>
        <Col span={24}>
          <Table
            className="mission-table"
            columns={columns}
            dataSource={completedMissions}
            pagination={{
              total: total,
              pageSize: limit,
              onShowSizeChange: setPageLimit,
              current: page,
              onChange: setPaginationPage,
            }}
            onChange={handleTableChange}
            loading={isTableLoading}
          />
        </Col>
      </Row>
    </div>
  );
}

const mapStateToProps = (state) => ({
  tenantId:
    state.Auth.userdetails.tenantId._id || state.Auth.userdetails.tenantId,
  userType: state.Auth.userdetails.userType,
  userDetails: state.Auth.userdetails,
  missions: state.Missions.missions,
});

export default connect(mapStateToProps, {
  setMissionsToState,
  deleteMission,
  logout,
})(DataMission);
