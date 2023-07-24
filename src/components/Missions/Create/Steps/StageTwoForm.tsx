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
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import { connect, ConnectedProps } from "react-redux";
import s_m from "../../../../Icons/start_measurement.svg";
import l_a from "../../../../Icons/location_add.svg";
import {
  setFlightDetails,
  addFlight,
  clearMissionCreationStateWithGeoFence,
} from "../../../../actions/missionCreation";
import { showDrawing } from "../../../../actions/gmapActions";

const { Option } = Select;

interface StageTwoFormProps extends PropsFromRedux {
  geofenceType: string;
  polygonData: any; // Replace with the appropriate type for polygonData
  circleData: any; // Replace with the appropriate type for circleData
  location: string;
  setisoDate: (isoDate: string) => void;
  setFormComplete: (formComplete: boolean) => void;
  setAreaSelected: () => void;
  nextStage: () => void;
}

const StageTwoForm: FC<StageTwoFormProps> = ({
  geofenceType,
  polygonData,
  circleData,
  location,
  setisoDate,
  setFormComplete,
  nextStage,
  setFlightDetails,
  addFlight,
  clearMissionCreationStateWithGeoFence,
  showDrawing,
  setAreaSelected,
  logout,
}) => {
  const [formState, setFormState] = useState<any>({
    locationId: "none",
    date: moment(new Date()).format("YYYY-MM-DD"),
    time: moment(new Date()).format("hh:mm:ss A"),
    flightName: "MyFlight1",
  });
  const [area, setArea] = useState<number>(0);
  const [selectedPoints, setSelectedPoints] = useState<number>(0);
  const [locations, setLocations] = useState<any>(null);

  const [form] = Form.useForm();

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

      setLocation(location);
    }
  }, [geofenceType, polygonData, circleData, location]);

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Get All Locations +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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

  useEffect(() => {
    getAllLocations();
  }, []);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      flightName: e.target.value,
    });
  };

  const handleFormSubmit = (values: any) => {
    if (
      formState.flightName &&
      formState.date &&
      formState.time &&
      formState.duration
    ) {
      setFormComplete(true);
      setFlightDetails(formState);
      addFlight();
      form.resetFields();
      showDrawing(false);
      clearMissionCreationStateWithGeoFence();
      setAreaSelected(false);
      message.success("Flight Added");
      nextStage();
    }
  };

  return (
    geofenceType && (
      <div className="stage-two-form" style={{ marginTop: "5px" }}>
        <Form
          form={form}
          layout="vertical"
          name="create_mission"
          initialValues={{
            flight: "MyFlight1",
            date: moment(new Date()) as Moment,
            time: moment(new Date()) as Moment,
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

                setisoDate(
                  e?.format("YYYY-MM-DD").toString() +
                    "T" +
                    formState.time.split(" ")[0] +
                    "Z"
                );
              }}
              allowClear={false}
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
              use12Hours={true}
              format={"hh:mm:ss A"}
              onChange={(value) => {
                setFormState({
                  ...formState,
                  time: value?.format("hh:mm A").toString(),
                });

                setisoDate(
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
                <img
                  style={{ height: "20px", marginTop: "-15px" }}
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

          {(polygonData !== null || circleData !== null) && (
            <Form.Item>
              <div className="mission_creation_buttons">
                <Button
                  type="primary"
                  size="middle"
                  style={{ background: "red" }}
                  onClick={() => {
                    form.resetFields();
                    setAreaSelected(false);
                    showDrawing(false);
                    clearMissionCreationStateWithGeoFence();
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

const mapStateToProps = (state: any) => ({
  geofenceType: state.MissionCreation.geoFence.circle ? "circle" : "polygon",
  polygonData: state.MissionCreation.geoFence.polygon
    ? state.MissionCreation.geoFence.polygon
    : null,
  circleData: state.MissionCreation.geoFence.circle
    ? state.MissionCreation.geoFence.circle
    : null,
  location: state.MissionCreation.flightDetails.geoLocation,
});

const connector = connect(mapStateToProps, {
  setFlightDetails,
  addFlight,
  clearMissionCreationStateWithGeoFence,
  showDrawing,
  logout,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(StageTwoForm);
