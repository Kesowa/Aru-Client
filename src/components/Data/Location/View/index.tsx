import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Tabs,
  Avatar,
  Button,
  Collapse,
  message,
  Spin,
  Typography,
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import "./index.less";
import { ClockCircleOutlined } from "@ant-design/icons";
import LocationCardMap from "./Map";
import mi from "../../../../assets/missionIcon.svg";
import mib from "../../../../assets/missionIcon_blue.svg";
import il from "../../../../assets/image layers.svg";
import Outcomes from "./Outcomes";
import Videos from "./Videos";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import { useParams } from "react-router";
import getAddressfromLatLong from "../../../../services/reverseGeocoding";
import AloneLogo from "../../../../static/Alone-rafiki.svg";
import moment from "moment";
import { connect } from "react-redux";
import { loading } from "../../../../actions/loadingAction";
import { STATIC_URL } from "src/constants";
const { Panel } = Collapse;
const { Text, Title } = Typography;

function LocationCard(props) {
  const [missions, setMissions] = useState<any>();
  const [selectedMission, setSelectedMission] = useState<any>({});
  const [isMissionsLoading, setisMissionsLoading] = useState(true);
  const [geoLocation, setGeoLocation] = useState("");
  const [locationName, setLocationName] = useState("");
  const [points, setPoints] = useState();
  const [locationCenter, setlocationCenter] = useState<any>();
  const [selectedMissionDetails, setSelectedMissionDetails] =
    useState<any>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [centerPoints, setCenterPoints] = useState(null);
  const [outComesToRender, setoutComesToRender] = useState([]);
  const [shouldRenderOutcomes, setshouldRenderOutcomes] = useState(true);
  const [isChecked, setIsChecked] = useState(true);
  const [once, setonce] = useState(true);

  const { id } = useParams<any>();

  useEffect(() => {
    if (once) {
      fetchData();
      setonce(false);
    } else if (isChecked) {
      fetchAllAlertsForLocation();
    }
  }, [isChecked]);

  const fetchAllAlertsForLocation = async () => {
    props.loading(true);
    const outcomes = await http.get(`${apis.GET_ALL_ALERTS_BY_LOCATION_ID}`, {
      params: {
        id,
      },
    });

    if (outcomes.data.status) {
      setoutComesToRender(outcomes.data.data);
    } else {
      message.error("Outcomes could not be fetched");
    }

    props.loading(false);
  };

  ///-------------------------- fetch missions and location data -----------------------------------------------------
  const fetchData = async () => {
    try {
      props.loading(true);
      const result = await http.get(`${apis.GET_MISSION_BY_LOCATION_MAP_REF}`, {
        params: {
          id,
        },
      });

      if (result.data.status) {
        setMissions(result.data.data);
      } else {
        message.error(result.data.message);
        return;
      }

      const location = await http.get(`${apis.GET_LOCATION_BY_ID}`, {
        params: {
          id: id,
        },
      });

      if (location.data.status) {
        const points = location.data.data.geometry.coordinates[0].map(
          (point) => {
            return {
              lat: point[1],
              lng: point[0],
            };
          }
        );
        setLocationName(location.data.data.properties.name);
        setPoints(points);
        const centerOfLocation = findPolygonCenter(points);
        setlocationCenter(centerOfLocation);
        getAddressfromLatLong(
          centerOfLocation[0],
          centerOfLocation[1],
          (err, address) => {
            if (!err) {
              setGeoLocation(address);
            } else {
              message.error(err.message);
            }
          }
        );
      } else {
        message.error("Location could not be fetched");
        return;
      }

      await fetchAllAlertsForLocation();

      setisMissionsLoading(false);
      props.loading(false);
    } catch (err) {
      message.error(err.message);
      AxiosErrorHandler(err, props.logout);
    }
  };

  const findPolygonCenter = (points) => {
    const bounds = new window.google.maps.LatLngBounds();

    const polygonCoords: google.maps.LatLng[] = [];

    for (const x of points) {
      const llbound = new window.google.maps.LatLng(x.lat, x.lng);
      polygonCoords.push(llbound);
    }
    let i;
    for (i = 0; i < polygonCoords.length; i++) {
      bounds.extend(polygonCoords[i]);
    }

    const centerOfPolygon = bounds.getCenter();

    return [centerOfPolygon.lat(), centerOfPolygon.lng()];
  };

  const getMissionDetails = (missionId) => {
    setSelectedLoading(true);

    http
      .get(`${apis.GET_MISSION_BY_LOCATION_ID}`, {
        params: {
          locationID: id,
          missionID: missionId,
        },
      })
      .then((result) => {
        if (result.data.status) {
          setSelectedMissionDetails(result.data.data[0]);
          setCenterPoints(result.data.data[0].centerPoints);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        message.error("Mission Could not be fetched");
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setSelectedLoading(false);
      });

    props.loading(true);
    http
      .get(`${apis.GET_ALL_ALERTS_FOR_MISSION}`, {
        params: {
          id: missionId,
        },
      })
      .then((result) => {
        if (result.data.status) {
          const locations = result.data.data.map((ele) => {
            return {
              location: {
                lat: ele.coordinated.lat,
                long: ele.coordinated.long,
              },
              alertImage: ele.alertImage,
              id: ele.alertID,
            };
          });

          setoutComesToRender(locations);
        } else {
          message.error("Alerts could not be fetched");
        }
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ To find the time ago +++++++++++++++++++++++++++++++++++++++++++++++++
  const getTimeAgo = (date) => {
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const interval = intervals.find((i) => i.seconds < seconds);

    let count: any = 0;
    let time;
    if (!interval) {
      count = seconds;
      time = `${count} second`;
      if (count > 1) {
        time += "s";
      }
      return time + " ago";
    }

    count = Math.floor(seconds / interval.seconds);

    switch (interval.label) {
      case "year":
        time = `${count} year`;
        if (count > 1) {
          time += "s";
        }
        return time + " ago";
      case "week":
        time = `${count} week`;
        if (count > 1) {
          time += "s";
        }
        return time + " ago";
      case "day":
        time = `${count} day`;
        if (count > 1) {
          time += "s";
        }
        return time + " ago";
      case "hour":
        time = `${count} hour`;
        if (count > 1) {
          time += "s";
        }
        return time + " ago";
      case "minute":
        time = `${count} minute`;
        if (count > 1) {
          time += "s";
        }
        return time + " ago";
      default:
        return `${count}s ago`;
    }
  };

  return (
    <div>
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title={locationName}
        subTitle={geoLocation}
        extra={[
          <Row className="location_card_header_sec_two" align="middle">
            <Col style={{ height: "100%" }}>
              <ClockCircleOutlined style={{ fontSize: "36px" }} />
            </Col>
            <Col style={{ marginLeft: "10px" }}>
              <Text style={{ display: "block" }} type="secondary">
                Last Flown
              </Text>
              <Text>18 June, 2020</Text>
            </Col>
          </Row>,
        ]}
      ></PageHeader>
      <Row className="location_card_data">
        <Col
          span={16}
          style={{
            minHeight: "450px",
            height: "100%",
          }}
        >
          {geoLocation && (
            <LocationCardMap
              center={locationCenter}
              points={points}
              centerPoints={centerPoints}
              outcomes={outComesToRender}
              shouldRenderOutcomes={shouldRenderOutcomes}
              setshouldRenderOutcomes={setshouldRenderOutcomes}
              id={id}
              setoutComesToRender={setoutComesToRender}
              selectedMissionDetails={selectedMissionDetails}
              setSelectedMissionDetails={setSelectedMissionDetails}
              setSelectedMission={setSelectedMission}
              isChecked={isChecked}
              setIsChecked={setIsChecked}
            />
          )}
        </Col>
        <Col
          span={8}
          style={{
            padding: "10px",
          }}
          className="mission-tab"
        >
          <Tabs
            defaultActiveKey="1"
            className="mission_tab"
            items={[
              {
                key: "1",
                label: "Missions",
                children: (
                  <>
                    {isMissionsLoading ? (
                      <div className="mission-loading">
                        <Spin size="large" />
                      </div>
                    ) : (
                      <React.Fragment>
                        {missions.map((mis) => (
                          <div
                            className={`mission_tab_mission_content ${
                              selectedMission.missionID === mis.missionID
                                ? "mission_tab_mission_content-selected"
                                : ""
                            }`}
                            key={mis.missionID}
                            onClick={() => {
                              setSelectedMission(mis);
                              getMissionDetails(mis.missionID);
                              setIsChecked(false);
                            }}
                          >
                            <Row
                              className="mission-tab-card"
                              style={{ padding: "15px 10px" }}
                            >
                              <Col span={4}>
                                {selectedMission.missionID === mis.missionID ? (
                                  <img
                                    src={mib}
                                    alt=""
                                    style={{ margin: "0 auto" }}
                                  />
                                ) : (
                                  <img
                                    src={mi}
                                    alt=""
                                    style={{ margin: "0 auto" }}
                                  />
                                )}
                              </Col>
                              <Col span={20} style={{ paddingLeft: "10px" }}>
                                <Text
                                  className="mission-name"
                                  strong
                                  style={{ display: "block", fontSize: "16px" }}
                                >
                                  {mis.MissionName}
                                </Text>
                                <Text type="secondary">
                                  {getTimeAgo(mis.orderDate)}
                                </Text>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </React.Fragment>
                    )}
                  </>
                ),
              },
            ]}
          ></Tabs>

          {selectedMissionDetails && !selectedLoading ? (
            <div className="mission_details" style={{ padding: "10px" }}>
              <Title level={4}>Mission Details</Title>
              <div className="flight_details">
                <div>
                  <Text type="secondary">Flight Date</Text>
                  <Text strong style={{ display: "block" }}>
                    {moment(selectedMissionDetails.flightDate).format("ll")}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Order Date</Text>
                  <Text strong style={{ display: "block" }}>
                    {moment(selectedMissionDetails.orderDate).format("ll")}
                  </Text>
                </div>
              </div>
              <div className="outcomes_details">
                <div className="il">
                  <img src={il} alt="" />
                  <Text strong>
                    {selectedMissionDetails.totalAlerts} Alerts
                  </Text>
                </div>
                <div className="il">
                  <img src={il} alt="" />
                  <Text strong>
                    {selectedMissionDetails.totalVideos} Videos
                  </Text>
                </div>
              </div>
              <div className="user_details">
                {selectedMissionDetails.pilotName && (
                  <div className="user">
                    <Avatar
                      size="large"
                      src={`${STATIC_URL}${selectedMissionDetails.pilotAvatar}`}
                    />
                    <div>
                      <Title
                        className="name"
                        level={5}
                        style={{ marginBottom: "-2px" }}
                      >
                        {selectedMissionDetails.pilotName}
                      </Title>
                      <Text className="assigned" type="secondary">
                        Pilot Assigned
                      </Text>
                    </div>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Button
                    style={{
                      padding: "20px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    type="primary"
                    className="user-button"
                  >
                    View Data
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="selected_mission_details">
              {selectedLoading ? (
                <Spin size="large" />
              ) : (
                <img
                  src={AloneLogo}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              )}
            </div>
          )}
        </Col>
      </Row>
      <Row style={{ marginTop: "16px", padding: "24px" }}>
        <Collapse style={{ width: "100%" }}>
          <Panel header="Videos" key="2">
            <Videos id={id} />
          </Panel>
          <Panel header="Outcomes" key="3">
            <Outcomes id={id} />
          </Panel>
        </Collapse>
      </Row>
    </div>
  );
}

const mapStateToProps = () => ({});

export default connect(mapStateToProps, {
  loading,
  logout,
})(LocationCard);
