import { useState, useEffect, useContext } from "react";
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
  Input,
} from "antd";
import { SearchOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";
import { AxiosErrorHandler } from "../../services/httpErrorHandle";
import http from "../../services/httpCall";
import apis from "../../services/apis";
import moment from "moment";
import { useHistory } from "react-router-dom";
import mp from "../../static/mapping.svg";
import "../shared/MissionList.less";
import { AuthContext } from "src/services/authUtils";

function DataMission(props) {
  const history = useHistory();
  const [completedMissions, setCompletedMissions] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState("createdAt:descend");
  const [searchFilters, setSearchFilters] = useState("");
  const [missionTypes, setMissionTypes] = useState([]);
  const [typesLoader, setTypesLoader] = useState(false);
  const [missionType, setMissionType] = useState("");

  const { Auth, logout } = useContext(AuthContext);

  const setPaginationPage = (p) => {
    setPage(p);
  };

  const setPageLimit = (currPage, limit) => {
    setPage(currPage);
    setLimit(limit);
  };

  const { Title } = Typography;

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
              mission._id.toString() != id.toString() &&
              mission.status === "Completed"
            );
          });
          setCompletedMissions(newTableData);
          message.success(`Mission "${name}" deleted`);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setIsTableLoading(false);
      });
  };

  // ++++++++++++++++++++++++++++++++++++++++++Defining Columns++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const columns: any[] = [
    {
      title: "MISSION",
      dataIndex: "name",
      sorter: () => null,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("name"),
      render: (name: any, record) => {
        return (
            <Button
              onClick={() => {
                history.push(`/dashboard/mission/view/staff-${record._id}`);
              }}
              type="text"
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
            </Button>
        );
      },
    },
    {
      title: "ORDER DATE",
      dataIndex: "createdAt",
      sorter: () => null,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("createdAt"),
      render: (createdAt: string) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {moment(createdAt).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      title: "MISSION ID",
      dataIndex: "_id",
      ...getColumnSearchProps("_id"),
      render: (text, record) => (
          <Button
            type="text"
            onClick={() => {
              history.push(`/dashboard/mission/view/staff-${record._id}`);
            }}
          >
            <p className="mission-id">{record._id}</p>
          </Button>
      ),
    },
    {
      title: "Created By",
      dataIndex: "user",
      sorter: () => null,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("user"),
      render: (user: any) =>
        user ? (user.name || "Auto") : "User deleted",
    },
    {
      title: "STATUS",
      dataIndex: "status",
      sorter: (a: any, b: any) => a.status.length - b.status.length,
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
      //----------- Size column ---------
      title: "Size",
      dataIndex: "size",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (text) => {
        let missionSize;
        if (text < 1) {
          missionSize = (text * 1000).toFixed(1) + "KB";
        } else if (text >= 1 && text <= 999) {
          missionSize = text.toFixed(1) + "MB";
        } else {
          missionSize = (text / 1000).toFixed(1) + "GB";
        }

        return <div>{missionSize}</div>;
      },
    },
    {
      title: "ACTIONS",
      dataIndex: "actions",
      className: "mission-actions",
      fixed: "right",
      render: (text, record) => (
        <>
          <Button
            onClick={() => {
              history.push(`/dashboard/mission/view/staff-${record._id}`);
            }}
          >
            <EyeOutlined />
          </Button>
          <Popconfirm
            title="Are you sure to delete the mission？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              deleteMission(record.name, record._id);
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

  // +++++++++++++++++++++++++++++++++++++++++++++++ Fetch Missions ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  function fetchMissions() {
    const userType = Auth.userdetails.userType;
    const tenantId = Auth.userdetails.tenantId._id || Auth.userdetails.tenantId;
    setIsTableLoading(true);
    if (userType === "tenant-root" || userType === "tenant-staff") {
      const params = {
        id: tenantId,
        page,
        limit,
        filter: "Completed", // Only completed missions are displayed on data page
        sort: sortOrder,
        searchFilters,
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
            setCompletedMissions(result.data.data);
            setTotal(result.data.total);
            const count = {};
            result.data.missionCount.forEach((c) => {
              count[c._id] = c.count;
            });
            props.setMissionCount(count["Completed"]);
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
          setMissionTypes(res.data.data);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        AxiosErrorHandler(err, logout);
      })
      .finally(() => setTypesLoader(false));
  }, []);

  const handleTableChange = (pagination, filter, sorter) => {
    let filterString = "";
    Object.entries(filter).forEach((f: any) => {
      if (f[1]) {
        filterString += `${f[0]}:${f[1][0]},`;
      }
    });

    setSearchFilters(filterString.substring(0, filterString.length - 1));

    if (sorter.field) {
      setSortOrder(`${sorter.field}:${sorter.order}`);
    }
  };

  const onMissionTypeChange = (e) => {
    if (e.target.value !== "all") setMissionType(e.target.value);
    else setMissionType("");
  };
  console.log(missionTypes);
  return (
    <div>
      {
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
      }
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

export default DataMission;
