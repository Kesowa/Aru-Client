import React, { Component } from "react";
import MarkerClusterer from "@googlemaps/markerclustererplus";
import { CheckCircleOutlined } from "@ant-design/icons";
import { subDays, subMonths } from "date-fns";
import moment from "moment";
import {
  Select,
  message,
  Spin,
} from "antd";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import "./index.less";
import "../../../Missions/Views/Live/index.less";
import { STATIC_URL } from "src/constants";
import { LoaderContext } from "src/components/shared/Loader";
import OutcomeModal from "src/components/Missions/Views/Details/Data/OutcomeModal";
const { Option } = Select;

type mapProps = {
  center: any;
  points: any;
  centerPoints: any;
  outcomes: any;
  shouldRenderOutcomes: any;
  setshouldRenderOutcomes: any;
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
  selectedAlert: any;
};

class LocationCardMap extends Component<mapProps, mapState> {
  static readonly contextType = LoaderContext;
  declare context: React.ContextType<typeof LoaderContext>;

  constructor(props) {
    super(props);
    this.state = {
      position: { lat: 43.642567, lng: -79.387054 },
      orientation: 0,
      dateSelected: false,
      startDate: "",
      endDate: "",
      alertLoading: false,
      selectedAlert: null,
    };
  }

  googleMapRef: any = React.createRef<HTMLDivElement>();
  googleMap: any = null;
  outcomes: any = null;
  missionMarker: any = null;

  componentDidMount() {
    const loc = { lat: this.props.center[0], lng: this.props.center[1] };
    this.googleMap = this.createGoogleMap(loc);
    if (this.props.points.length > 1) {
      this.drawMeasurements(this.props.points);
    } else {
      this.createGoogleMapMarker(this.props.points[0]);
    }
  }

  componentDidUpdate(prevProps) {
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
      this.drawMarkers();
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
        url: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=M|FA8027|FFF",
        scaledSize: new window.google.maps.Size(48, 48),
      },
    });
  };

  drawMarkers = () => {
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
          icon: {
            url: `${STATIC_URL}${ele.alertImage}`,
            scaledSize: new window.google.maps.Size(80, 50),
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
          this.setState((prev) => ({
            ...prev,
            selectedAlert: result.data.data[0],
          }));
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        this.setState({
          alertLoading: false,
        });
      });
  };

  setMarkerEvent = (marker) => {
    window.google.maps.event.addListener(marker, "click", () => {
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
  };

  createGoogleMapMarker = (point: { lat: number; lng: number }) => {
    const obj = new window.google.maps.Marker({
      position: point,
      map: this.googleMap,
      title: "Drone Location",
    });
    obj.setMap(this.googleMap);
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
    this.context.setLoading(true);
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
    }

    this.context.setLoading(false);
  }

  async fetchAlertsForTime(value) {
    this.context.setLoading(true);
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
      console.log(error);
    }

    this.context.setLoading(false);
  }

  render() {
    return (
      <React.Fragment>
        <OutcomeModal
          index={0}
          data={[this.state.selectedAlert]}
          visible={!!this.state.selectedAlert}
          closeModal={() => {
            this.setState((prev) => ({
              ...prev,
              selectedAlert: null,
            }));
          }}
        />
        <div
          id="data_gmap_container"
          style={{ borderRadius: "8px", position: "relative" }}
        >
          <div
            id="google-map"
            ref={this.googleMapRef}
            style={{
              width: "100%",
              height: "74vh",
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

export default LocationCardMap;
