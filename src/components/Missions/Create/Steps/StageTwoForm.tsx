import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  message,
} from "antd";
import s_m from "../../../../Icons/start_measurement.svg";
import l_a from "../../../../Icons/location_add.svg";
import {
  setFlightDetails,
  addFlight,
  clearMissionCreationStateWithGeoFence,
} from "../../../../actions/missionCreation";
import { showDrawing } from "../../../../actions/gmapActions";
import { connect } from "react-redux";
import moment from "moment";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";

const { Option } = Select;
// const { RangePicker } = DatePicker;

// const dayList = {
//   Sunday: false,
//   Monday: false,
//   Tuesday: false,
//   Wednesday: false,
//   Thursday: false,
//   Friday: false,
//   Saturday: false,
// }; Future Purpose

const StageTwoForm = (props: any) => {
  const [formState, setFormState] = useState<any>({
    locationId: "none",
    date: moment(new Date()).format("YYYY-MM-DD"),
    time: moment(new Date()).format("hh:mm:ss A"),
    flightName: "MyFlight1",
  });
  const [area, setArea] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState<any>(null);

  const [form] = Form.useForm();

  useEffect(() => {
    if (props.geofenceType) {
      if (props.geofenceType === "polygon" && props.polygonData) {
        setSelectedPoints(props.polygonData.points.length);
      }

      if (props.polygonData) {
        setArea(props.polygonData.area);
      } else if (props.circleData) {
        setArea(props.circleData.area);
      }

      setLocation(props.location);
    }
  }, [props]);

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Get All Locations +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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

  useEffect(() => {
    getAllLocations();
  }, []);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      flightName: e.target.value,
    });
  };

  // const enumerateDaysBetweenDates = function (selectedDates: any) {
  //   var dates: string[] = [];
  //   let startDate = selectedDates[0];
  //   let endDate = selectedDates[1];

  //   var currDate = moment(startDate).startOf("day");
  //   var lastDate = moment(endDate).startOf("day");

  //   dates.push(currDate.clone().format("D MMMM YYYY dddd").toString());
  //   while (currDate.add(1, "days").diff(lastDate) <= 0) {
  //     dates.push(currDate.clone().format("D MMMM YYYY dddd").toString());
  //   }

  //   setFormState({
  //     ...formState,
  //     ["startDate"]: startDate.format("D MMMM YYYY dddd").toString(),
  //     ["endDate"]: endDate.format("D MMMM YYYY dddd").toString(),
  //     dates: dates,
  //   });
  // };

  const handleFormSubmit = (values) => {
    if (
      formState.flightName &&
      formState.date &&
      formState.time &&
      formState.duration
    ) {
      props.setFormComplete(true);
      props.setFlightDetails(formState);
      props.addFlight();
      form.resetFields();
      props.setAreaSelected(false);
      message.success("Flight Added");
      props.nextStage();
    }
  };

  return (
    props.geofenceType && (
      <div className="stage-two-form" style={{ marginTop: "5px" }}>
        <Form
          form={form}
          layout="vertical"
          name="create_mission"
          initialValues={{
            flight: "MyFlight1",
            date: moment(new Date()),
            time: moment(new Date()),
          }}
          size="small"
          onFinish={handleFormSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Flight Name"
            name="flight"
            rules={[
              {
                required: true,
                message: "Please add the flight name",
              },
            ]}
            style={{ marginTop: "-5px" }}
          >
            <Input
              className="locationBox"
              maxLength={100}
              onChange={onNameChange}
            />
          </Form.Item>

          {/* <Form.Item
            name="flight_type"
            hasFeedback
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              defaultActiveFirstOption={true}
              className="selectBox"
              placeholder="Flight Type"
              onChange={(value) => {
                setFormState({
                  ...formState,
                  ["flight_type"]: value.toString(),
                });
              }}
            >
              <Option value="scheduled_dates" selected>
                Schedule Dates
              </Option>
              <Option value="single_date">Single Date</Option>
            </Select>
          </Form.Item> */}

          <Form.Item
            name="date"
            hasFeedback
            rules={[
              {
                required: true,
              },
            ]}
          >
            <DatePicker
              format={"YYYY-MM-DD"}
              onChange={(e: moment.Moment | null) => {
                setFormState({
                  ...formState,
                  date: e?.format("YYYY-MM-DD").toString(),
                });

                props.setisoDate(
                  e?.format("YYYY-MM-DD").toString() +
                    "T" +
                    formState.time.split(" ")[0] +
                    "Z"
                );
              }}
              allowClear={false}
            />
          </Form.Item>

          {/* {formState.flight_type === "scheduled_dates" && (
            <div>
              <Form.Item
                name="date"
                hasFeedback
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <RangePicker onChange={enumerateDaysBetweenDates} />
              </Form.Item>
              <div className="scheduled_dates">
                {Object.keys(dayList).map((day, ind) => {
                  return (
                    <label
                      key={ind}
                      htmlFor={day}
                      style={{
                        background: formState.days[day] ? "#eb4527" : "#0A79DF",
                      }}
                    >
                      <span>{day[0].toUpperCase()}</span>
                      <input
                        type="checkbox"
                        value={day}
                        onChange={(e) => {
                          setFormState({
                            ...formState,
                            days: {
                              ...formState.days,
                              [day]: !formState.days[day],
                            },
                          });
                        }}
                      ></input>
                    </label>
                  );
                })}
              </div>
            </div>
          )} */}

          <Form.Item
            name="time"
            hasFeedback
            rules={[
              {
                required: true,
              },
            ]}
          >
            <TimePicker
              use12Hours={true}
              format={"hh:mm:ss A"}
              onChange={(value) => {
                //console.log(value);

                setFormState({
                  ...formState,
                  time: value?.format("hh:mm A").toString(),
                });

                props.setisoDate(
                  formState.date +
                    "T" +
                    value?.format("HH:mm:ss A").split(" ")[0] +
                    "Z"
                );
              }}
            />
          </Form.Item>

          <Form.Item
            name="duration"
            hasFeedback
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              defaultActiveFirstOption={true}
              className="selectBox"
              placeholder="Flight Duration"
              onChange={(value: any) => {
                setFormState({
                  ...formState,
                  duration: value.toString(),
                });
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
                setFormState({
                  ...formState,
                  locationId: value.toString(),
                });
              }}
              //defaultValue={"none"}
            >
              <Option value="none">none</Option>

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
          {props.areaSelected && (
            <div>
              <div className="data_selected">
                <img style={{ height: "20px", marginTop: "-15px" }} src={s_m} />
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
                      <p>
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
                  <img src={l_a} style={{ height: "20px" }} alt="" />
                  <div>
                    <strong>Location Selected</strong>

                    <p>{location}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(props.polygonData !== null || props.circleData !== null) && (
            <Form.Item>
              <div className="mission_creation_buttons">
                <Button
                  type="primary"
                  size="middle"
                  style={{ background: "red" }}
                  onClick={() => {
                    form.resetFields();
                    props.setAreaSelected(false);
                    props.showDrawing(false);
                    props.clearMissionCreationStateWithGeoFence();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" size="middle">
                  Add
                </Button>
              </div>
            </Form.Item>
          )}
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
  };
};

export default connect(mapStateToProps, {
  setFlightDetails,
  addFlight,
  clearMissionCreationStateWithGeoFence,
  showDrawing,
  logout,
})(StageTwoForm);
