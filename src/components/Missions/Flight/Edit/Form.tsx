import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  message,
  Typography,
} from "antd";

import s_m from "../../../../Icons/start_measurement.svg";
import l_a from "../../../../Icons/location_add.svg";
import {
  setFlightDetails,
  clearMissionCreationState,
  addFlight,
  enableFlightEditing,
  setCenterPoints,
} from "../../../../actions/missionCreation";
import { setFlightDetaisToEdit } from "../../../../actions/flightAction";
import { showDrawing } from "../../../../actions/gmapActions";
import { connect } from "react-redux";
import moment from "moment";
import { InfoCircleFilled } from "@ant-design/icons";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import { loading } from "../../../../actions/loadingAction";
import { useHistory } from "react-router-dom";
import { updateFlight, assignPilot } from "../../../../actions/flightAction";
const { Option } = Select;
const { Title } = Typography;
const { Text } = Typography;

const EditFlightForm = (props: any) => {
  const [flightName, setflightName] = useState<any>("");
  const [duration, setDuration] = useState<any>("");
  const [date, setDate] = useState<any>("");
  const [time, setTime] = useState<any>();
  const [location, setLocation] = useState<any>("none");
  const [area, setArea] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState<any>(0);
  const [geoLocation, setGeoLocation] = useState<any>("");
  const [initialDataLoaded, setInitialDataLoaded] = useState<any>(false);
  const [locations, setLocations] = useState<any>(null);
  const [id, setId] = useState<any>("");
  const [pilotId, setPilotId] = useState<any>("");
  const [pilots, setPilots] = useState<any>([]);
  const [locationName, setLocationName] = useState("");
  const [centerPonits, setcenterPonits] = useState<any>(null);
  const history = useHistory();

  const [form] = Form.useForm();

  const getAllLocations = () => {
    http
      .get(`${apis.GET_ALL_LOCATIONS}`)
      .then((result) => {
        if (result.data.data) {
          setLocations(result.data.data);
        }
      })
      .catch((err) => {
        message.error("Locations could not be fetched");
        AxiosErrorHandler(err, props.logout);
      });
  };

  const getAllPilots = () => {
    http
      .get(apis.FETCH_ALL_PILOTS)
      .then((result) => {
        if (result.data.data) {
          console.log(result.data.data);
          setPilots(result.data.data);
        }
      })
      .catch((error) => {
        console.log(error);
        AxiosErrorHandler(error, props.logout);
      });
  };

  useEffect(() => {
    getAllLocations();
    getAllPilots();
  }, []);

  useEffect(() => {
    if (!initialDataLoaded) {
      if (props.flight && props.flight.geoFence) {
        console.log(props);

        // Set flight details to draw the geofence
        console.log(props.flight.geoFence);
        props.setFlightDetaisToEdit({
          geoFence: props.flight.geoFence,
          geoLocation: props.flight.geoLocation,
        });

        props.addFlight();
        props.showDrawing(true);
        props.enableFlightEditing(true);
        props.setFlightEditing(true);

        // set initial flight state
        setflightName(props.flight.name);
        setDuration(props.flight.duration);
        setDate(props.flight.date);
        setTime(props.flight.time);
        setId(props.flight._id);
        setLocation(
          props.flight.locationID ? props.flight.locationID._id : "none"
        );
        setLocationName(
          props.flight.locationID
            ? props.flight.locationID.properties.name
            : "none"
        );
        setPilotId(
          props.flight.pilotID ? props.flight.pilotID._id : "no pilot assigned"
        );

        props.setCenterPoints([
          props.flight.centerPoints.lat,
          props.flight.centerPoints.lng,
        ]);
        setcenterPonits({
          lat: props.flight.centerPoints.lat,
          lng: props.flight.centerPoints.lng,
        });

        setInitialDataLoaded(true);
      }
    } else {
      if (props.geofenceType) {
        props.setAreaSelected(true);
        if (props.geofenceType === "polygon" && props.polygonData) {
          setSelectedPoints(props.polygonData.points.length);
        }
        if (props.polygonData && props.polygonData.length > 0) {
          setArea(props.polygonData.area);
        } else if (props.circleData) {
          console.log(props.circleData);
          setArea(props.circleData.area);
        }
        setGeoLocation(props.location);
      }
    }

    setcenterPonits({
      lat: props.center.lat,
      lng: props.center.lng,
    });
  }, [props]);

  // form submit
  const handleFormSubmit = () => {
    if (location && flightName && duration && time && date && centerPonits) {
      // Data to send as body of the request
      const body = {
        _id: id,
        name: flightName,
        locationId: location,
        duration,
        time,
        date,
        geoLocation,
        centerPoints: centerPonits,
      };

      if (props.polygonData && props.polygonData.length > 0) {
        body["geofence"] = {
          polygon: {
            ...props.polygonData,
          },
        };
      } else if (props.circleData) {
        body["geofence"] = {
          circle: {
            ...props.circleData,
          },
        };
      }
      // request
      props.loading(true);
      http
        .patch(apis.ASSIGN_PILOT, {
          pilotID: pilotId,
          flightID: props.flight._id,
        })
        .then((result) => {
          if (result.data.status) {
            console.log("pilot", result);
            props.assignPilot(result.data.data);
            message.success("Pilot Reassigned");
          }
        })
        .catch((err) => {
          message.error("Something went wrong");
          AxiosErrorHandler(err, props.logout);
        });

      http
        .post(`${apis.EDIT_FLIGHT_BY_ID}`, body)
        .then((result) => {
          if (result.data.status) {
            props.updateFlight(result.data.data);
            props.clearMissionCreationState();
            props.enableFlightEditing(false);
            message.success("Flight Edited Successfully");
            history.goBack();
          } else {
            message.error(result.data.message);
          }
        })
        .catch((err) => {
          message.error("Something went wrong");
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          props.loading(false);
        });
    } else {
      message.error("Please Fill All the fields");
    }
  };

  return (
    props.geofenceType &&
    initialDataLoaded && (
      <div className="edit-flight-form">
        <div>
          <Title className="panel-title" level={5}>
            <InfoCircleFilled />
            &nbsp;&nbsp;Edit Flight
          </Title>
          <Text className="flight-id">ID : {id}</Text>
        </div>
        <Form
          form={form}
          layout="vertical"
          name="create_mission"
          initialValues={{
            remember: true,
          }}
          size="small"
          requiredMark={false}
        >
          <Form.Item
            label="Flight Name"
            name="flight"
            style={{ marginTop: "-5px" }}
          >
            <Input
              className="locationBox"
              onChange={(e) => {
                setflightName(e.target.value);
              }}
              defaultValue={flightName}
            />
          </Form.Item>

          <Form.Item name="date" hasFeedback>
            <DatePicker
              defaultValue={moment(date, "YYYY-MM-DD")}
              onChange={(e: moment.Moment | null) => {
                setDate(e?.format("YYYY-MM-DD").toString());

                props.setisoDate(
                  e?.format("YYYY-MM-DD").toString() +
                    "T" +
                    time.split(" ")[0] +
                    "Z"
                );
              }}
            />
          </Form.Item>

          <Form.Item name="time" hasFeedback>
            <TimePicker
              defaultValue={moment(time, "HH:mm A")}
              use12Hours={true}
              onChange={(value) => {
                console.log(value);
                setTime(value?.format("HH:mm:ss A").toString());

                props.setisoDate(
                  date + "T" + value?.format("HH:mm:ss A").split(" ")[0] + "Z"
                );
              }}
            />
          </Form.Item>

          <Form.Item name="duration" hasFeedback>
            <Select
              defaultValue={duration}
              className="selectBox"
              placeholder="Flight Duration"
              onChange={(value) => {
                setDuration(value.toString());
              }}
            >
              <Option value="1hr">1 Hr</Option>
              <Option value="2hr">2 Hrs</Option>
            </Select>
          </Form.Item>

          <Form.Item name="locationId" hasFeedback>
            <Select
              defaultActiveFirstOption={true}
              className="selectBox"
              placeholder="Select Location"
              onChange={(value) => {
                setLocation(value.toString());
              }}
              defaultValue={locationName}
            >
              <Option value={"none"}>none</Option>
              {locations && (
                <React.Fragment>
                  {locations.map((location) => {
                    return (
                      <Option value={location._id} key={location._id}>
                        {location.properties.name}
                      </Option>
                    );
                  })}
                </React.Fragment>
              )}
            </Select>
          </Form.Item>

          <Form.Item name="pilot" hasFeedback>
            <Select
              className="selectBox"
              placeholder="Select Pilot"
              defaultValue={pilotId}
              onChange={(value) => setPilotId(value)}
            >
              {pilots.map((pilot) => (
                <Option value={pilot._id}>{pilot.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {props.areaSelected && (
            <div>
              <div className="data_selected">
                <img style={{ height: "20px", marginTop: "-20px" }} src={s_m} />
                <div className="data_selected_inner">
                  {props.geofenceType === "polygon" ? (
                    <div>
                      <p>
                        <strong>Geofence Selected</strong>
                      </p>
                      <p>
                        <span>{selectedPoints} Points Selected</span>{" "}
                        <span>
                          {" "}
                          {`${(area * 0.000247105).toFixed(2)} acres`}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p>
                        <strong>Radius Selected</strong>
                      </p>
                      <p style={{ marginTop: "-5px" }}>
                        <span
                          style={{
                            fontWeight: "bold",
                          }}
                        >
                          Area :
                        </span>{" "}
                        <span>{`${(area * 0.000247105).toFixed(
                          2
                        )} acres`}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="data_selcted_2">
                {/* <h3>Location Selected</h3> */}
                <div className="location_details">
                  <img src={l_a} alt="" style={{ height: "20px" }} />
                  <div style={{ marginTop: "-5px" }}>
                    <strong>Location Selected</strong>
                    <p>{geoLocation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Form.Item>
            <div className="mission_creation_buttons">
              <Button
                type="primary"
                style={{ background: "red" }}
                size="middle"
                onClick={() => {
                  history.goBack();
                  props.showDrawing();
                  props.clearMissionCreationState();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="middle"
                htmlType="submit"
                onClick={() => {
                  handleFormSubmit();
                }}
              >
                Save
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    )
  );
};

const mapStateToProps = (state) => {
  return {
    geofenceType: state.MissionCreation.geoFence.circle ? "circle" : "polygon",
    polygonData: state.MissionCreation.geoFence.polygon
      ? state.MissionCreation.geoFence.polygon
      : null,

    circleData: state.MissionCreation.geoFence.circle
      ? state.MissionCreation.geoFence.circle
      : null,

    location: state.MissionCreation.flightDetails.geoLocation,
    flightDetails:
      state.MissionCreation.flights.length !== 0
        ? {
            ...state.MissionCreation.flights[0].flightDetails,
          }
        : {},
    center: state.MissionCreation.flightDetails.centerPoints,
  };
};

export default connect(mapStateToProps, {
  clearMissionCreationState,
  setFlightDetails,
  addFlight,
  enableFlightEditing,
  showDrawing,
  setFlightDetaisToEdit,
  loading,
  updateFlight,
  assignPilot,
  setCenterPoints,
  logout,
})(EditFlightForm);
