import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Spin,
  Image,
  Modal,
  Tooltip,
  Button,
  Avatar,
  notification,
  Cascader,
  Select,
  Input,
  Divider,
  Pagination,
} from "antd";
import {
  ExclamationOutlined,
  CalendarOutlined,
  UserOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  GoogleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import { connect } from "react-redux";
import moment from "moment";
import * as htmlToImage from "html-to-image";
import "./data.less";
import { STATIC_URL } from "src/constants";

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

function Outcomes(outcomeProps) {
  const [outcomeData, setOutcomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAscending, setIsAscending] = useState(true);
  const [sortType, setSortType] = useState("timeStamp");
  const [listView, setListView] = useState(false);
  const [allOutcomes, setAllOutcomes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    http
      .get(
        `${apis.FETCH_ALERTS_BY_LOCATION_ID_PAGINATION}?page=${page}&limit=${limit}&id=${outcomeProps.id}`
      )
      .then((res) => {
        setOutcomeData(res.data.data);
        setAllOutcomes(res.data.data);
        setTotal(res.data.total);
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, outcomeProps.logout);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, limit]);

  useEffect(() => {
    if (!loading) {
      handleSortChange(sortType);
    }
  }, [isAscending]);

  const setPageLimit = (currPage, limit) => {
    setPage(currPage);
    setLimit(limit);
  };

  const setPaginationPage = (p) => {
    setPage(p);
  };

  const openNotification = (copiedText, placement) => {
    const el = document.createElement("textarea");
    el.value = copiedText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    notification.info({
      message: `Link Copied!`,
      description:
        "Google map location link has been copied to your clipboard.",
      placement,
    });
  };

  const handleSortChange = (value) => {
    setSortType(value);
    setLoading(true);
    if (value === "timeStamp") {
      const data = [...outcomeData];
      data.sort(
        (a: any, b: any) =>
          (isAscending ? 1 : -1) *
          (parseInt((new Date(a.createdAt).getTime() / 1000).toFixed(0)) -
            parseInt((new Date(b.createdAt).getTime() / 1000).toFixed(0)))
      );
      setOutcomeData(data);
    } else if (value === "inference") {
      const data = [...outcomeData];
      data.sort(
        (a: any, b: any) => (isAscending ? 1 : -1) * (a.pcount - b.pcount)
      );
      setOutcomeData(data);
    }
    setLoading(false);
  };

  const changeSortArrange = (ascending) => {
    if (ascending !== isAscending) {
      setIsAscending(ascending);
    }
  };

  const onSearch = (e) => {
    const value = e.target.value;
    const regEx = new RegExp(value, "i");

    const results = allOutcomes.filter((outcome: any) => {
      return regEx.test(outcome.locationName);
    });

    setOutcomeData(results);
  };

  const FilterOptions = [
    {
      value: "alertType",
      label: "Alert Type",
      children: [
        {
          value: "manual",
          label: "Manual Alerts",
        },
        {
          value: "automated",
          label: "Automated Alerts",
        },
      ],
    },
  ];

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
    //fID: any
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
                  <Row>
                    <Text className="p-coord">
                      {coor.lat}, {coor.long}
                    </Text>
                  </Row>
                </div>
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
                <Row style={{ marginTop: 8 }}>
                  <Text type="secondary">Coordinates</Text>
                </Row>
                <Row>
                  <Text keyboard copyable>
                    {`${coor.lat}, ${coor.long}`}
                  </Text>
                </Row>
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
                        <Text type="secondary">{crAt}</Text>
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

  function truncateText(str) {
    return str.length > 10 ? str.substring(0, 20) + "..." : str;
  }

  return (
    <React.Fragment>
      <div className="toolbar-alerts" style={{ marginTop: "20px" }}>
        <Search
          className="search-bar"
          placeholder="input search text"
          onChange={onSearch}
          style={{ width: 200 }}
        />
        <span className="switcher">
          <AppstoreOutlined
            onClick={() => {
              setListView(false);
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 1000);
            }}
            style={{
              fontSize: "30px",
              marginRight: "10px",
              color: listView ? "#000000" : "#1B98F5",
            }}
          />
          <BarsOutlined
            onClick={() => {
              setListView(true);
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 1000);
            }}
            style={{
              fontSize: "30px",
              color: !listView ? "#000000" : "#1B98F5",
            }}
          />
        </span>
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
      {outcomeData !== null && !loading ? (
        <div
          style={{ position: "relative", height: "500px", overflow: "auto" }}
        >
          {listView ? (
            <React.Fragment>
              {outcomeData.map((dataa) => (
                <Row
                  className="listview-outcomes"
                  align="middle"
                  style={{ padding: "10px" }}
                >
                  <Col
                    md={4}
                    style={{ padding: "10px" }}
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
                        dataa.locationName
                          ? dataa.locationName
                          : "Default Location",
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
              ))}
            </React.Fragment>
          ) : (
            <Row>
              {outcomeData.map((outcome) => (
                <Col span={6} className="video-thumbnail">
                  <Card
                    className="outcome-card"
                    cover={
                      <img
                        onClick={() =>
                          showModal(
                            outcome._id,
                            outcome.missionId._id,
                            outcome.flightId._id,
                            outcome.createdBy.name,
                            outcome.createdBy.avatar,
                            outcome.createdAt,
                            STATIC_URL + outcome.image,
                            outcome.location,
                            outcome.locationName
                              ? outcome.locationName
                              : "Default Location",
                            outcome.pcount
                          )
                        }
                        src={STATIC_URL + outcome.image}
                      />
                    }
                  >
                    <Row style={{ marginTop: "-12px" }}>
                      <Col span={18}>
                        <Text strong>{truncateText(outcome.locationName)}</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">
                          <ExclamationOutlined /> {outcome.pcount}
                        </Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: "8px" }}>
                      <Text type="secondary">
                        <UserOutlined /> {outcome.createdBy.name}
                      </Text>
                    </Row>
                    <Row>
                      <Text type="secondary">
                        <CalendarOutlined />{" "}
                        {moment(outcome.createdAt).format("hh:mm A MM/DD/YYYY")}
                      </Text>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      ) : (
        <Row>
          {loading ? (
            <div style={{ margin: "auto", marginTop: "5%" }}>
              <Spin size="large" />
            </div>
          ) : null}
        </Row>
      )}
      <Pagination
        onShowSizeChange={setPageLimit}
        current={page}
        onChange={setPaginationPage}
        total={total}
        style={{ marginBottom: "20px", marginTop: "20px" }}
      />
    </React.Fragment>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { logout })(Outcomes);
