import { useState, useEffect, useRef, useContext } from "react";
import {
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Tooltip,
  Divider,
  Checkbox,
  Modal,
  Image,
  notification,
  Spin,
  Input,
  Cascader,
  Select,
  Pagination,
} from "antd";
import {
  UserOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  GoogleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { API_URL, STATIC_URL } from "src/constants";
import "../index.less";
import * as htmlToImage from "html-to-image";
import http from "../../../../../services/httpCall";
import apis from "../../../../../services/apis";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";
import Alone from "../../../../../static/Alone-rafiki.svg";
import moment from "moment";
import io from "socket.io-client";
import { components } from "src/handlers/schema";
import { AuthContext } from "src/services/authUtils";
import OutcomeModal from "../../Details/Data/OutcomeModal";
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    ss: "%d seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    w: "a week",
    ww: "%d weeks",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

function Outcomes(props: any) {
  const { missionId, tenantId } = props;
  const [outcomeData, setOutcomeData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAscending, setIsAscending] = useState(true);
  const [sortType, setSortType] = useState("timeStamp");
  const [allOutcomes, setAllOutcomes] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [alertSocketEvent, setAlertSocketEvent] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const socket: any = useRef();

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    if (missionId !== 0) {
      if (tenantId) {
        if (!socket.current) {
          socket.current = io(
            `${API_URL}/stream/notification?tenantID=${tenantId}`
          );
          socket.current.on("ALERT_CREATED", (data) => {
            if (data.missionId === missionId) {
              setAlertSocketEvent("refreshAlerts");
            }
          });
        }
      }
    }
  }, [missionId, tenantId]);
  useEffect(() => {
    if (missionId !== 0) {
      if (alertSocketEvent == "refreshAlerts") {
        setAlertSocketEvent("");
        setLoading(true);
        http
          .get<components["schemas"]["GetByMissionIDResponse"]>(
            `${apis.GET_ALERT_BY_MISSION_ID_PAGINATION}?sortBy=createdAt:asce&page=${page}&limit=10&id=${missionId}&alertType=`
          )
          .then((res) => {
            setOutcomeData(res.data.data);
            setDisplayData(res.data.data);
            setTotal(res.data.total);
            setAllOutcomes(res.data.data);
          })
          .catch((err) => {
            console.log(err);
            AxiosErrorHandler(err, logout);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(true);
        http
          .get<components["schemas"]["GetByMissionIDResponse"]>(
            `${apis.GET_ALERT_BY_MISSION_ID_PAGINATION}?sortBy=createdAt:asce&page=${page}&limit=10&id=${missionId}&alertType=`
          )
          .then((res) => {
            setOutcomeData(res.data.data);
            setDisplayData(res.data.data);
            setTotal(res.data.total);
            setAllOutcomes(res.data.data);
          })
          .catch((err) => {
            console.log(err);
            AxiosErrorHandler(err, logout);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [props, page, alertSocketEvent]);

  useEffect(() => {
    if (!loading) {
      handleSortChange(sortType);
    }
  }, [isAscending]);

  const onSearch = (e) => {
    const value = e.target.value;
    const regEx = new RegExp(value, "i");

    const results = allOutcomes.filter((outcome: any) => {
      return regEx.test(outcome.locationName);
    });

    setOutcomeData(results);
  };

  const setPaginationPage = (p) => {
    setPage(p);
  };

  const handleSortChange = (value) => {
    setSortType(value);
    setLoading(true);
    const data = [...displayData];
    const data1 = [...outcomeData];
    if (value === "timeStamp") {
      data.sort(
        (a: any, b: any) =>
          (isAscending ? 1 : -1) *
          (parseInt((new Date(a.createdAt).getTime() / 1000).toFixed(0)) -
            parseInt((new Date(b.createdAt).getTime() / 1000).toFixed(0)))
      );
      data1.sort(
        (a: any, b: any) =>
          (isAscending ? 1 : -1) *
          (parseInt((new Date(a.createdAt).getTime() / 1000).toFixed(0)) -
            parseInt((new Date(b.createdAt).getTime() / 1000).toFixed(0)))
      );
    } else if (value === "inference") {
      data.sort(
        (a: any, b: any) => (isAscending ? 1 : -1) * (a.pcount - b.pcount)
      );
      data1.sort(
        (a: any, b: any) => (isAscending ? 1 : -1) * (a.pcount - b.pcount)
      );
    }
    setDisplayData(data);
    setOutcomeData(data1);
    setLoading(false);
  };

  const changeSortArrange = (ascending) => {
    if (ascending !== isAscending) {
      setIsAscending(ascending);
    }
  };

  function renderOutcomes(data: any[]) {
    return data.map((dataa) => (
      <div>
        <div className="outcome-live-view-thumb">
          <Row align="middle">
            <Col md={1}>
              <Checkbox></Checkbox>
            </Col>
            <Col
              md={4}
              onClick={() =>
                setSelectedAlert(dataa)
              }
            >
              <img
                style={{ width: "100%", height: "auto" }}
                src={STATIC_URL + dataa.image}
              />
            </Col>
            <Col md={19}>
              <div className="info-part">
                <Row>
                  <Title level={5}>
                    {dataa.locationName
                      ? dataa.locationName
                      : "Default Location"}
                  </Title>
                </Row>
                <Row>
                  <Col md={20}>
                    <Text type="secondary">
                      {dataa.location.lat}, {dataa.location.long}
                    </Text>
                  </Col>
                  <Col md={4}>
                    <Text type="secondary" className="inference">
                      Inference: {dataa.pcount}
                    </Text>
                  </Col>
                </Row>
                <Row>
                  <Col md={20}>
                    <Text type="secondary">
                      <UserOutlined /> {dataa.createdBy.name}
                    </Text>
                  </Col>
                  <Col md={4}>
                    <Text type="secondary" className="relative-time">
                      <em>{moment(dataa.createdAt).fromNow()}</em>
                    </Text>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    ));
  }
  const FilterOptions = [
    {
      value: "type",
      label: "Alert Type",
      children: [
        {
          value: "Manual",
          label: "Manual Alerts",
        },
        {
          value: "Automated",
          label: "Automated Alerts",
        },
      ],
    },
  ];
  return (
    <>
      <OutcomeModal 
        index={0}
        data={[selectedAlert]}
        visible={!!selectedAlert}
        closeModal={() => {
          setSelectedAlert(null);
        }}
      />
      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ToolBar Options+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      <div className="toolbar-alerts">
        <Search
          className="search-bar"
          placeholder="input search text"
          onChange={onSearch}
          style={{ width: 200 }}
        />
        <Cascader
          className="filter-by"
          options={FilterOptions}
          placeholder="Filter by"
          changeOnSelect
        />

        <div className="sort-tool">
          <div className="sort-Direction">
            {!loading ? (
              <div>
                <SortAscendingOutlined
                  onClick={() => changeSortArrange(true)}
                  style={{
                    color: isAscending ? "#1890ff" : "#000",
                    fontSize: "1.2rem",
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem",
                    marginRight: "0.4rem",
                  }}
                />
                <SortDescendingOutlined
                  onClick={() => changeSortArrange(false)}
                  style={{
                    color: !isAscending ? "#1890ff" : "#000",
                    fontSize: "1.2rem",
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                />
              </div>
            ) : null}
          </div>
          <Text className="sort-by">Sort by</Text>
          <Select
            className="sort-select"
            style={{ width: 120 }}
            disabled={loading}
            defaultValue="timeStamp"
            onChange={handleSortChange}
          >
            <Option value="timeStamp">Timestamp</Option>
            <Option value="inference">Inference</Option>
          </Select>
        </div>
        <Divider style={{ marginTop: "16px" }} />
      </div>
      <div style={{ height: "400px", overflow: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Spin size="large" />
          </div>
        ) : outcomeData === undefined ? (
          <>
            <img
              src={Alone}
              style={{
                width: "30%",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
            <p style={{ textAlign: "center" }}>
              There are no alerts to display yet
            </p>
          </>
        ) : (
          renderOutcomes(displayData)
        )}
      </div>
      <br />
      <Pagination current={page} onChange={setPaginationPage} total={total} />
    </>
  );
}

export default Outcomes;
