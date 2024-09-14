import React, { useState, useEffect, useContext } from "react";
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
import moment from "moment";
import * as htmlToImage from "html-to-image";
import "./data.less";
import "../../../Missions/Views/Live/index.less";
import { STATIC_URL } from "src/constants";
import { AuthContext } from "src/services/authUtils";
import OutcomeModal from "src/components/Missions/Views/Details/Data/OutcomeModal";

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
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const { logout } = useContext(AuthContext);

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
        AxiosErrorHandler(err, logout);
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

  function truncateText(str) {
    return str.length > 10 ? str.substring(0, 20) + "..." : str;
  }

  return (
    <React.Fragment>
      <OutcomeModal 
        index={0}
        data={[selectedAlert]}
        visible={!!selectedAlert}
        closeModal={() => {
          setSelectedAlert(null);
        }}
      />
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
                          setSelectedAlert(outcome)
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

export default Outcomes;
