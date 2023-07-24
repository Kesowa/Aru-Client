import React, { useState, useEffect, FC } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  message,
} from "antd";
import moment, { Moment } from "moment";
import { connect, ConnectedProps } from "react-redux";
import s_m from "../../../Icons/start_measurement.svg";
import l_a from "../../../Icons/location_add.svg";
import {
  setFlightDetails,
  clearMissionCreationState,
  addFlight,
  enableFlightEditing,
} from "../../../actions/missionCreation";
import { showDrawing } from "../../../actions/gmapActions";

const { Option } = Select;

// Define types for the props
interface FlightEditingProps extends PropsFromRedux {
  geofenceType: string;
  polygonData: any; // Replace with the appropriate type for polygonData
  circleData: any; // Replace with the appropriate type for circleData
  location: string;
}

// Define the FlightEditing component
const FlightEditing: FC<FlightEditingProps> = ({
  geofenceType,
  polygonData,
  circleData,
  location,
  setFlightDetails,
  clearMissionCreationState,
  addFlight,
  enableFlightEditing,
  showDrawing,
  flightDetails,
  nextStage,
}) => {
  const [formState, setFormState] = useState<any>({
    locationId: "none",
  });
  const [area, setArea] = useState<number>(0);
  const [selectedPoints, setSelectedPoints] = useState<number>(0);

  const [form] = Form.useForm();

  // Update form fields when geofence type or data changes
  useEffect(() => {
    if (geofenceType) {
      if (geofenceType === "polygon" && polygonData) {
        setSelectedPoints(polygonData.points.length);
      }

      if (polygonData) {
        setArea(polygonData.area);
      } else if (circleData) {
        setArea(circleData.area);
      }

      setFormState({
        ...flightDetails,
      });
    }
  }, [geofenceType, polygonData, circleData, flightDetails]);

  // Handle flight name change
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      flightName: e.target.value,
    });
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (
      formState.flightName &&
      formState.date &&
      formState.time &&
      formState.duration
    ) {
      props.setFormComplete(true);
      clearMissionCreationState();
      setFlightDetails(formState);
      addFlight();
      form.resetFields();
      props.setAreaSelected(false);
      enableFlightEditing(false);
      message.success("Flight Edited");
      nextStage();
    }
  };

  return (
    geofenceType && (
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
              defaultValue={flightDetails.flightName}
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
              defaultValue={moment(flightDetails.date, "YYYY-MM-DD") as Moment}
              onChange={(e: Moment | null) => {
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
              defaultValue={moment(flightDetails.time, "HH:mm A") as Moment}
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
              defaultValue={flightDetails.duration}
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
              defaultValue={"none"}
            >
              <Option value="none">none</Option>
            </Select>
          </Form.Item>

          {(circleData || polygonData) && (
            <div>
              <div className="data_selected">
                <img
                  style={{ height: "40px", marginTop: "-20px" }}
                  src={s_m}
                  alt=""
                />
                <div className="data_selected_inner">
                  {geofenceType === "polygon" ? (
                    <div>
                      <p>
                        <strong>Geofence Selected</strong>
                      </p>
                      <p>
                        <span>{selectedPoints} Points Selected</span>{" "}
                        <span>
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
                  showDrawing();
                  nextStage();
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

// Map state to props
const mapStateToProps = (state: any) => ({
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
});

// Connect component to Redux store
const connector = connect(mapStateToProps, {
  clearMissionCreationState,
  setFlightDetails,
  addFlight,
  enableFlightEditing,
  showDrawing,
});

// Define type for props received from redux
type PropsFromRedux = ConnectedProps<typeof connector>;

// Export the connected component
export default connector(FlightEditing);
