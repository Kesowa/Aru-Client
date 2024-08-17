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
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { Input } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { setMissionsToState } from "../../../actions/missionActions";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import moment from "moment";
import { useHistory } from "react-router-dom";
import mp from "../../../static/mapping.svg";
import "../MissionList.less";
import { AuthContext } from "src/services/authUtils";

function ClientMission(props) {
  const history = useHistory();
  const [completedMissions, setCompletedMissions] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState("createdAt:descend");
  const [searchFilters, setSearchFilters] = useState("");
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
                history.push(`/dashboard/mission/view/client-${record._id}`);
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
              history.push(`/dashboard/mission/view/client-${record._id}`);
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
              history.push(`/dashboard/mission/view/client-${record._id}`);
            }}
          >
            <EyeOutlined />
          </Button>
        </>
      ),
    },
  ];

  // +++++++++++++++++++++++++++++++++++++++++++++++ Fetch Missions ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  function fetchMissions() {
    const userType = Auth.userdetails.userType;
    const clientId = Auth.userdetails._id;
    setIsTableLoading(true);
    if (userType === "tenant-client") {
      http
        .get(`${apis.GET_MISSION_FOR_CLIENT}`, {
          params: {
            clientId,
            page,
            limit,
            status: "All",
          },
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

  return (
    <div className="tenant-root-usercreatepage-wrapper full-width-height">
      <PageHeader
        onBack={() => window.history.back()}
        className="site-page-header-responsive"
        title="Missions"
        subTitle="All Missions create by client"
      ></PageHeader>
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
  missions: state.Missions.missions,
});

export default connect(mapStateToProps, {
  setMissionsToState,
})(ClientMission);
