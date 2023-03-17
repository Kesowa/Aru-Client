import React, { Component } from "react";
import { connect } from "react-redux";
import MarkerClusterer from "@googlemaps/markerclustererplus";
import { CheckCircleOutlined } from "@ant-design/icons";
import { subDays, subMonths } from "date-fns";
import moment from "moment";
import {
  Select,
  message,
  Spin,
  Modal,
  Row,
  Col,
  Image,
  Typography,
  Tooltip,
  Button,
  notification,
  Avatar,
} from "antd";
import { loading } from "../../../../actions/loadingAction";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { logout } from "../../../../actions/authAction";
import "./index.less";
import {
  UserOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import * as htmlToImage from "html-to-image";
import { STATIC_URL } from "src/constants";
const { Option } = Select;
const { Text, Title } = Typography;

type mapProps = {
  gmapLoaded: any;
  center: any;
  points: any;
  centerPoints: any;
  outcomes: any;
  shouldRenderOutcomes: any;
  setshouldRenderOutcomes: any;
  loading: any;
  id: any;
  setoutComesToRender: any;
  selectedMissionDetails: any;
  setSelectedMissionDetails: any;
  setSelectedMission: any;
  isChecked: any;
  setIsChecked: any;
};

type mapState = {
  position: any;
  orientation: any;
  dateSelected: any;
  startDate: any;
  endDate: any;
  alertLoading: any;
};

class LocationCardMap extends Component<mapProps, mapState> {
  constructor(props) {
    super(props);
    this.state = {
      position: { lat: 43.642567, lng: -79.387054 },
      orientation: 0,
      dateSelected: false,
      startDate: "",
      endDate: "",
      alertLoading: false,
    };
  }

  googleMapRef: any = React.createRef<HTMLDivElement>();
  googleMap: any = null;
  socket: any = null;
  outcomes: any = null;
  missionMarker: any = null;

  componentDidMount() {
    const loc = { lat: this.props.center[0], lng: this.props.center[1] };
    this.googleMap = this.createGoogleMap(loc);
    this.drawMeasurements(this.props.points);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.isChecked && this.missionMarker) {
      this.missionMarker.setMap(null);
    }

    if (this.props.centerPoints !== prevProps.centerPoints) {
      if (this.missionMarker) {
        this.missionMarker.setMap(null);
        this.missionMarker = this.createMarker(this.props.centerPoints);
      } else {
        this.missionMarker = this.createMarker(this.props.centerPoints);
      }
    }

    if (this.props.shouldRenderOutcomes) {
      this.drawMarkers(this.props.outcomes);
    }

    if (!this.props.shouldRenderOutcomes) {
      this.clearMarkers();
    }
  }

  createMarker = (location) => {
    if (this.missionMarker) {
      this.missionMarker.setMap(null);
    }

    return new window.google.maps.Marker({
      position: location,
      map: this.googleMap,
      icon: {
        url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=M|FA8027|FFF",
        scaledSize: new google.maps.Size(48, 48),
      },
    });
  };

  drawMarkers = (newOutcomes) => {
    if (this.outcomes) this.outcomes.clearMarkers();
    if (this.props.shouldRenderOutcomes) {
      const newDrawnMarkers: any = [];
      this.props.outcomes.forEach((ele) => {
        let obj: any = new window.google.maps.Marker({
          position: {
            lat: ele.location.lat,
            lng: ele.location.long,
          },
          title: ele.name,
          // icon: {
          //   url: `http://maps.google.com/mapfiles/ms/icons/${
          //     ele.color ? ele.color : "red"
          //   }-dot.png`,
          // },
          icon: {
            url: `${STATIC_URL}${ele.alertImage}`,
            scaledSize: new google.maps.Size(80, 50),
          },
        });
        obj.id = ele.id;

        obj = this.setMarkerEvent(obj);

        newDrawnMarkers.push(obj);
      });

      const markerCluster = new MarkerClusterer(
        this.googleMap,
        newDrawnMarkers,
        {
          imagePath:
            "https://raw.githubusercontent.com/googlemaps/v3-utility-library/master/markerclustererplus/images/m",
          maxZoom: 20,
        }
      );
      this.outcomes = markerCluster;
    }
  };

  getAlertData = (id) => {
    http
      .get(`${apis.FETCH_ALERT_BY_ID}`, {
        params: {
          id: id,
        },
      })
      .then((result) => {
        if (result.data.status) {
          //console.log(result.data.data[0])
          this.showModal(
            result.data.data[0]._id,
            result.data.data[0].missionId,
            result.data.data[0].flightId,
            result.data.data[0].createdBy.name,
            result.data.data[0].createdBy.avatar,
            result.data.data[0].createdAt,
            STATIC_URL + result.data.data[0].image,
            result.data.data[0].location,
            result.data.data[0].locationName
              ? result.data.data[0].locationName
              : "Default Location",
            result.data.data[0].pcount
          );
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        // AxiosErrorHandler(err, this.props.logout);
      })
      .finally(() => {
        this.setState({
          alertLoading: false,
        });
      });
  };

  setMarkerEvent = (marker) => {
    google.maps.event.addListener(marker, "click", () => {
      this.setState({
        alertLoading: true,
      });
      this.getAlertData(marker.id);
    });

    return marker;
  };

  clearMarkers = () => {
    if (this.outcomes) this.outcomes.clearMarkers();
  };

  // Intialize Google Map
  createGoogleMap = ({ lat, lng }) => {
    if (this.props.gmapLoaded) {
      return new window.google.maps.Map(this.googleMapRef.current, {
        zoom: 16,
        center: {
          lat,
          lng,
        },
        disableDefaultUI: true,
        zoomControl: false,
        scaleControl: false,
        disableDoubleClickZoom: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          mapTypeIds: ["roadmap", "satellite"],
        },
      });
    }
    return null;
  };

  createGoogleMapMarker = (location, map) => {
    if (this.props.gmapLoaded) {
      return new window.google.maps.Marker({
        position: location,
        map,
        title: "Drone Location",
      });
    }
  };

  drawMeasurements = (points) => {
    const obj = new window.google.maps.Polygon({
      paths: points,
      strokeOpacity: 0.8,
      strokeColor: "#42A8FC",
      strokeWeight: 4,
      fillOpacity: 0.2,
      fillColor: "#42A8FC",
    });

    obj.setMap(this.googleMap);
  };

  setDates(value) {
    if (value === "show all") {
      this.setState({
        dateSelected: false,
      });

      this.fetchAllAlerts();
      return;
    }

    const time = Number(value.split(" ")[0]);
    const timeType = String(value.split(" ")[1]).toLowerCase();
    const endTime = new Date();
    let startTime: any;

    switch (timeType) {
      case "days":
      case "day":
        startTime = subDays(endTime, time);
        break;

      case "months":
      case "month":
        startTime = subMonths(endTime, time);
        break;
    }

    this.setState({
      dateSelected: true,
      endDate: new Date(),
      startDate: startTime,
    });

    this.fetchAlertsForTime(value);
  }

  async fetchAllAlerts() {
    this.props.loading(true);
    try {
      const outcomes = await http.get(`${apis.GET_ALL_ALERTS_BY_LOCATION_ID}`, {
        params: {
          id: this.props.id,
        },
      });
      if (outcomes.data.status) {
        this.props.setoutComesToRender(outcomes.data.data);
      } else {
        message.error("Outcomes could not be fetched");
      }
    } catch (error) {
      message.error(error.message);
      // AxiosErrorHandler(error, this.props.logout);
    }

    this.props.loading(false);
  }

  async fetchAlertsForTime(value) {
    this.props.loading(true);
    try {
      const outcomes = await http.get(`${apis.FETCH_ALERTS_BY_TIME}`, {
        params: {
          time: value.toString(),
          locationID: this.props.id,
        },
      });

      if (outcomes.data.status) {
        const locations = outcomes.data.data.map((ele) => {
          return {
            location: {
              lat: ele.coordinates.lat,
              long: ele.coordinates.long,
            },
            id: ele.alertID,
            alertImage: ele.alertImage,
          };
        });

        this.props.setoutComesToRender(locations);
      } else {
        this.props.setoutComesToRender([]);
        message.error(outcomes.data.message);
      }
    } catch (error) {
      message.error(error.message);
      // AxiosErrorHandler(error, this.props.logout);
      console.log(error);
    }

    this.props.loading(false);
  }

  openNotification = (copiedText, placement) => {
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

  showModal(
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
    const self = this;
    Modal.info({
      title: "Outcome ID: " + id,
      content: (
        <div>
          <Row style={{ marginTop: 16 }}>
            <Col span={17}>
              {/* <img src={thumb} style={{ width: "100%", height: "auto" }} /> */}
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
                &nbsp;&nbsp;&nbsp;&nbsp;
                {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++TO BE MADE++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
                {/* <Tooltip placement="bottom" title="share via email">
                  <Button
                    type="primary"
                    shape="round"
                    icon={<MailOutlined />}
                    size="large"
                  />
                </Tooltip> */}
                &nbsp;&nbsp;
                <Tooltip placement="bottom" title="download image">
                  <Button
                    type="primary"
                    onClick={() => {
                      htmlToImage
                        .toPng(document.getElementById("image")!)
                        .then(function (dataUrl) {
                          const a = document.createElement("a");
                          a.href = dataUrl;
                          a.download = `${geoCode}_3355.png`;
                          a.click();
                        });
                    }}
                    shape="round"
                    icon={<DownloadOutlined />}
                    size="large"
                  />
                </Tooltip>
                &nbsp;&nbsp;
                <Tooltip placement="bottom" title="Google map link">
                  <Button
                    type="default"
                    onClick={() =>
                      this.openNotification(
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
      // closable: true,
      onOk() {},
    });
  }

  render() {
    return (
      <React.Fragment>
        <div
          id="gmap_container"
          style={{ borderRadius: "8px", position: "relative" }}
        >
          <div
            id="google-map"
            ref={this.googleMapRef}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
          <div className="checkbox_container" style={{ marginLeft: "20px" }}>
            <div className="checkbox_inner">
              <span>Outcomes</span>
              <CheckCircleOutlined
                style={{ color: this.props.isChecked ? "#3462CC" : "" }}
              />
            </div>
            <input
              type="checkbox"
              checked={this.props.isChecked}
              className="check"
              onChange={(e) => {
                this.props.setshouldRenderOutcomes(e.target.checked);
                this.props.setIsChecked(e.target.checked);
                this.props.setSelectedMissionDetails(null);
                this.props.setSelectedMission({});
              }}
            />
          </div>

          {!this.props.selectedMissionDetails && (
            <div className="select_dates">
              {this.state.dateSelected && (
                <div className="dates">
                  {moment(this.state.startDate).format("ll").split(",")[0]} -{" "}
                  {moment(this.state.endDate).format("ll").split(",")[0]}
                </div>
              )}

              <Select
                placeholder="Select Interval"
                style={{ width: "200px", marginLeft: "20px" }}
                onChange={(value: any) => {
                  this.setDates(value.toString());
                }}
                defaultValue={"Show All"}
              >
                <Option value="show all">Show All</Option>
                <Option value="7 days">Last 7 days</Option>
                <Option value="1 month">Last 1 month</Option>
              </Select>
            </div>
          )}

          {this.state.alertLoading && (
            <div className="alert_loading">
              <div className="loader">
                <Spin size={"large"} />
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    gmapLoaded: state.Gmap.gmapLoaded,
  };
};

export default connect(mapStateToProps, {
  loading,
  logout,
})(LocationCardMap);
