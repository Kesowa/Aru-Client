import React, { useState, useEffect, FC, useContext } from "react";
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
import { InfoCircleFilled } from "@ant-design/icons";
import { connect } from "react-redux";
import moment, { Moment } from "moment";
import { useHistory } from "react-router-dom";
import {
  enableFlightEditing,
  setCenterPoints,
  setCircleMeasurements,
  setGeolocation,
  setPolygonMeasurements
} from "../../../../actions/missionCreation";
import { loading } from "../../../../actions/loadingAction";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import s_m from "../../../../Icons/start_measurement.svg";
import l_a from "../../../../Icons/location_add.svg";
import { AuthContext } from "src/services/authUtils";

const { Option } = Select;
const { Title } = Typography;
const { Text } = Typography;

const EditFlightForm: FC<any> = (props) => {
  const [flightName, setFlightName] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [location, setLocation] = useState<string>("none");
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
  const [locations, setLocations] = useState<any>(null);
  const [id, setId] = useState<string>("");
  const [pilotId, setPilotId] = useState<string>("");
  const [pilots, setPilots] = useState<any>([]);
  const history = useHistory();

  const { logout } = useContext(AuthContext);

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
        AxiosErrorHandler(err, logout);
      });
  };

  const getAllPilots = () => {
    http
      .get(apis.FETCH_ALL_PILOTS)
      .then((result) => {
        if (result.data.data) {
          setPilots(result.data.data);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      });
  };

  useEffect(() => {
    getAllLocations();
    getAllPilots();
  }, []);

  useEffect(() => {
    // local states for flight editing form
    setFlightName(props.flightDetails.name);
    setDuration(props.flightDetails.duration);
    setDate(props.flightDetails.date);
    setTime(props.flightDetails.time);
    setId(props.flightDetails._id);
    setLocation(
      props.flightDetails.locationID ? props.flightDetails.locationID._id : "none"
    );
    setPilotId(
      props.flightDetails.pilotID ? props.flightDetails.pilotID._id : "no pilot assigned"
    );

    // signifies that all existing data has been loaded
    setInitialDataLoaded(true);
  }, [props.flightDetails]);

  const handleFormSubmit = () => {
    if (location && flightName && duration && time && date) {
      const body = {
        _id: id,
        name: flightName,
        locationId: location,
        duration,
        time,
        date,
        geoLocation: props.geoLocation,
        centerPoints: props.centerPoints,
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

      props.loading(true);

      http
        .patch(apis.ASSIGN_PILOT, {
          pilotID: pilotId,
          flightID: id,
        })
        .then((result) => {
          if (result.data.status) {
            message.success("Pilot Reassigned");
          }
        })
        .catch((err) => {
          message.error("Something went wrong");
          AxiosErrorHandler(err, logout);
        });

      http
        .post(`${apis.EDIT_FLIGHT_BY_ID}`, body)
        .then((result) => {
          if (result.data.status) {
            message.success("Flight Edited Successfully");
            history.goBack();
          } else {
            message.error(result.data.message);
          }
        })
        .catch((err) => {
          message.error("Something went wrong");
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          props.loading(false);
        });
    } else {
      message.error("Please Fill All the fields");
    }
  };

  return (
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
            name: flightName,
            date: moment(date, "YYYY-MM-DD"),
            time: moment(time, "HH:mm A"),
            duration: duration,
            locationId: props.flightDetails.locationID ? props.flightDetails.locationID.properties.name : "none",
            pilot: pilotId,
            remember: true,
          }}
          size="small"
          requiredMark={false}
        >
          <Form.Item
            label="Flight Name"
            name="name"
            style={{ marginTop: "-5px" }}
          >
            <Input
              className="locationBox"
              onChange={(e) => {
                setFlightName(e.target.value);
              }}
            />
          </Form.Item>

          <Form.Item name="date" hasFeedback>
            <DatePicker
              onChange={(date: Moment | null) => {
                setDate(date?.format("YYYY-MM-DD") || "");
                props.setisoDate(
                  date?.format("YYYY-MM-DD") +
                    "T" +
                    (time.split(" ")[0] || "") +
                    "Z"
                );
              }}
            />
          </Form.Item>

          <Form.Item name="time" hasFeedback>
            <TimePicker
              use12Hours={true}
              onChange={(value) => {
                setTime(value?.format("HH:mm:ss A") || "");

                props.setisoDate(
                  date +
                    "T" +
                    (value?.format("HH:mm:ss A").split(" ")[0] || "") +
                    "Z"
                );
              }}
            />
          </Form.Item>

          <Form.Item name="duration" hasFeedback>
            <Select
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
            >
              <Option value={"none"}>none</Option>
              {locations && (
                <React.Fragment>
                  {locations.map((location: any) => {
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
              onChange={(value) => setPilotId(value)}
            >
              {pilots.map((pilot: any) => (
                <Option value={pilot._id} key={pilot._id}>{pilot.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {props.areaSelected && (
            <div>
              <div className="data_selected">
                <img style={{ height: "20px", marginTop: "-20px" }} src={s_m} />
                <div className="data_selected_inner">
                  {props.polygonData ? (
                    <div>
                      <p>
                        <strong>Geofence Selected</strong>
                      </p>
                      <p>
                        <span>{props.polygonData.points.length} Points Selected</span>{" "}
                        <span>
                          {" "}
                          {`${(props.polygonData.area * 0.000247105).toFixed(2)} acres`}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p>
                        <strong>Radius Selected</strong>
                      </p>
                      <p style={{ marginTop: "-5px" }}>
                        <span style={{ fontWeight: "bold" }}>Area :</span>{" "}
                        <span>{`${(props.circleData.area * 0.000247105).toFixed(
                          2
                        )} acres`}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="data_selcted_2">
                <div className="location_details">
                  <img src={l_a} alt="" style={{ height: "20px" }} />
                  <div style={{ marginTop: "-5px" }}>
                    <strong>Location Selected</strong>
                    <p>{props.geoLocation}</p>
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

const mapStateToProps = (state: any) => ({
  // global states set by GoogleMap component on selection of new flight region
  polygonData: state.MissionCreation.geoFence.polygon || null, // properties of newly selected area
  circleData: state.MissionCreation.geoFence.circle|| null, // properties of newly selected area
  geoLocation: state.MissionCreation.flightDetails.geoLocation, // address of new location
  centerPoints: state.MissionCreation.flightDetails.centerPoints, // center points of new location
});

const connector = connect(mapStateToProps, {
  loading,
  // for initializing the global states, so that GoogleMap gets initialized at the existing flight location
  enableFlightEditing,
  setCircleMeasurements,
  setPolygonMeasurements,
});

export default connector(EditFlightForm);
