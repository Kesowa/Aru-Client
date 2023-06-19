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
import s_m from "../../../Icons/start_measurement.svg";
import l_a from "../../../Icons/location_add.svg";
import {
  setFlightDetails,
  clearMissionCreationState,
  addFlight,
  enableFlightEditing,
} from "../../../actions/missionCreation";
import { showDrawing } from "../../../actions/gmapActions";
import { connect } from "react-redux";
import moment from "moment";

const { Option } = Select;

const FlightEditing = (props: any) => {
  const [formState, setFormState] = useState<any>({
    locationId: "none",
  });
  const [area, setArea] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [location, setLocation] = useState("");

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

      setFormState({
        ...props.flightDetails,
      });
    }
  }, [props]);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      flightName: e.target.value,
    });
  };


  const handleFormSubmit = () => {
    if (
      formState.flightName &&
      formState.date &&
      formState.time &&
      formState.duration
    ) {
      props.setFormComplete(true);
      props.clearMissionCreationState();
      props.setFlightDetails(formState);
      props.addFlight();
      form.resetFields();
      props.setAreaSelected(false);
      props.enableFlightEditing(false);
      message.success("Flight Edited");
      props.nextStage();
    }
  };

  return (
    props.geofenceType && (
      <div style={{ marginTop: "15px" }}>
        <Form
          form={form}
          layout="vertical"
          name="create_mission"
          initialValues={{
            remember: true,
          }}
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
          >
            <Input
              className="locationBox"
              onChange={onNameChange}
              defaultValue={props.flightDetails.flightName}
            />
          </Form.Item>


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
              defaultValue={moment(props.flightDetails.date, "YYYY-MM-DD")}
              onChange={(e: moment.Moment | null) => {
                setFormState({
                  ...formState,
                  date: e?.format("YYYY-MM-DD").toString(),
                });
              }}
            />
          </Form.Item>

          

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
              defaultValue={moment(props.flightDetails.time, "HH:mm A")}
              use12Hours={true}
              onChange={(value) => {
                setFormState({
                  ...formState,
                  time: value?.format("HH:mm A").toString(),
                });
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
              defaultValue={props.flightDetails.duration}
              className="selectBox"
              placeholder="Flight Duration"
              onChange={(value) => {
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
              defaultValue={"none"}
            >
              <Option value="none">none</Option>
            </Select>
          </Form.Item>
          {(props.circleData || props.polygonData) && (
            <div>
              <div className="data_selected">
                <img style={{ height: "40px", marginTop: "-20px" }} src={s_m} />
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
                <h3>Location Selected</h3>
                <div className="location_details">
                  <img src={l_a} alt="" />
                  <div>
                    <p>{location}</p>
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
                onClick={() => {
                  form.resetFields();
                  props.setAreaSelected(false);
                  props.showDrawing();
                  props.nextStage();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => {
                  handleFormSubmit();
                }}
              >
                Add
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
  };
};

export default connect(mapStateToProps, {
  clearMissionCreationState,
  setFlightDetails,
  addFlight,
  enableFlightEditing,
  showDrawing,
})(FlightEditing);
