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
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const openNotification = (copiedText, placement) => {
  const el = document.createElement("textarea");
  el.value = copiedText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  notification.info({
    message: `Link Copied!`,
    description: "Google map location link has been copied to your clipboard.",
    placement,
  });
};

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
  const [downloadLoading, setDownloadLoading] = useState(false);
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

  function showModal(
    id: any,
    mID: any,
    fID: any,
    crBy: any,
    crByPhoto: any,
    crAt: any,
    thumb: any,
    coor: any,
    geoCode: any,
    pcount: any
  ) {
    Modal.info({
      title: "Outcome ID: " + id,
      content: (
        <div>
          <Row style={{ marginTop: 16 }}>
            <Col span={17}>
              <div id="image" className="outcome-view">
                <Image
                  style={{ width: "100%", height: "auto", cursor: "pointer" }}
                  src={thumb}
                />
                <div className="p-mission">
                  <Row>
                    <Text className="text">mission ID: {mID}</Text>
                  </Row>
                  <Row>
                    <Text className="text">flight ID: {fID}</Text>
                  </Row>
                  <Row>
                    <Text className="text">People Detected: {pcount}</Text>
                  </Row>
                </div>
                <div className="preview-location-name">
                  <Row>
                    <Title className="p-name" level={4}>
                      {geoCode}
                    </Title>
                  </Row>
                  {
                    !(coor.lat === 0 && coor.long === 0) &&
                    <Row>
                      <Text className="p-coord">
                        {coor.lat}, {coor.long}
                      </Text>
                    </Row>
                  }
                </div>
                {
                  !(coor.lat === 0 && coor.long === 0) &&
                  <div className="static-map-div">
                    <a
                      href={`https://www.google.com/maps/?q=${coor.lat},${coor.long}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        className="static-map"
                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${coor.lat},${coor.long}&zoom=16&size=200x130&markers=size:mid|color:red|${coor.lat},${coor.long}&maptype=roadmap&key=AIzaSyCYWROYTFQ3XH4bhhLJnmJSV-0k9a-PHY8`}
                      />
                    </a>
                  </div>
                }
              </div>
            </Col>
            <Col span={7}>
              <Row style={{ marginLeft: "8px" }}>
                <Title level={5}>
                  <ShareAltOutlined style={{ fontSize: "24px" }} />
                  &nbsp;&nbsp;&nbsp;Share
                </Title>
              </Row>
              <Row>
                &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;
                <Tooltip placement="bottom" title="download image">
                  <Button
                    type="primary"
                    onClick={() => {
                      setDownloadLoading(true);
                      htmlToImage
                        .toPng(document.getElementById("image")!)
                        .then(function (dataUrl) {
                          const a = document.createElement("a");
                          a.href = dataUrl;
                          a.download = `${geoCode}_3355.png`;
                          a.click();
                          setDownloadLoading(false);
                        });
                    }}
                    shape="round"
                    icon={
                      downloadLoading ? (
                        <LoadingOutlined />
                      ) : (
                        <DownloadOutlined />
                      )
                    }
                    size="large"
                  />
                </Tooltip>
                &nbsp;&nbsp;
                {
                  !(coor.lat === 0 && coor.long === 0) &&
                  <Tooltip placement="bottom" title="Google map link">
                    <Button
                      type="default"
                      onClick={() =>
                        openNotification(
                          `https://www.google.com/maps/?q=${coor.lat},${coor.long}`,
                          "bottomRight"
                        )
                      }
                      shape="round"
                      icon={<GoogleOutlined />}
                      size="large"
                    >
                      Copy Link
                    </Button>
                  </Tooltip>
                }
              </Row>
              <div className="outcome-specific-view-info">
                <Row>
                  <Text type="secondary">Inference generated</Text>
                </Row>
                <Row>
                  <Text strong>{pcount}</Text>
                </Row>
                <Row>
                  <Text type="secondary">Mission ID</Text>
                </Row>
                <Row>
                  <Text strong>{mID}</Text>
                </Row>
                <Row style={{ marginTop: 8 }}>
                  <Text type="secondary">Location</Text>
                </Row>
                <Row>
                  <Text strong>{geoCode}</Text>
                </Row>
                {
                  !(coor.lat === 0 && coor.long === 0) &&
                  <>
                    <Row style={{ marginTop: 8 }}>
                      <Text type="secondary">Coordinates</Text>
                    </Row>
                    <Row>
                      <Text keyboard copyable>
                        {`${coor.lat}, ${coor.long}`}
                      </Text>
                    </Row>
                  </>
                }
                <div className="outcome-specific-view-created-by">
                  <Row>
                    <Text type="secondary">Snapshot Captured by</Text>
                  </Row>
                  <Row>
                    <div
                      className="pilot-profile-badge"
                      style={{ marginTop: 8 }}
                    >
                      <Avatar
                        key="2"
                        size="large"
                        icon={<UserOutlined />}
                        src={STATIC_URL + crByPhoto}
                      />
                      <div className="pilot-name">
                        <Title level={5} className="designation">
                          {crBy}
                        </Title>
                        <Text type="secondary">
                          {moment(crAt).format("MMMM Do YYYY, h:mm:ss a")}
                        </Text>
                      </div>
                    </div>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      ),
      centered: true,
      width: 1200,
      onOk() {},
    });
  }

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
                showModal(
                  dataa._id,
                  dataa.missionId._id,
                  dataa.flightId._id,
                  dataa.createdBy.name,
                  dataa.createdBy.avatar,
                  dataa.createdAt,
                  STATIC_URL + dataa.image,
                  dataa.location,
                  dataa.locationName ? dataa.locationName : "Default Location",
                  dataa.pcount
                )
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
