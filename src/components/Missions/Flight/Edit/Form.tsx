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
import moment, { Moment } from "moment";
import { useHistory } from "react-router-dom";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import s_m from "../../../../Icons/start_measurement.svg";
import l_a from "../../../../Icons/location_add.svg";
import { AuthContext } from "src/services/authUtils";

const { Option } = Select;
const { Title } = Typography;
const { Text } = Typography;

const EditFlightForm: FC<any> = ({
  flightDetails,
  setFlightDetails,
  areaSelected,
  setisoDate,
  onSubmit,
  isEditing,
}) => {
  const [locations, setLocations] = useState<any>(null);
  const [pilots, setPilots] = useState<any>(null);
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

  const handleFormSubmit = () => {
    if (
      flightDetails.locationID && 
      flightDetails.name && 
      flightDetails.duration && 
      flightDetails.time && 
      flightDetails.date
    ) {
      onSubmit();
    } else {
      message.error("Please Fill All the fields");
    }
  };

  return (
    locations && pilots && (
      <div className="edit-flight-form">
        <div>
          <Title className="panel-title" level={5}>
            <InfoCircleFilled />
            &nbsp;&nbsp;{ isEditing ? "Edit" : "Create"} Flight
          </Title>
          {
            flightDetails._id && (flightDetails._id !== "") &&
            <Text className="flight-id">ID : {flightDetails._id}</Text>
          }
        </div>
        <Form
          form={form}
          layout="vertical"
          name="create_mission"
          initialValues={
            isEditing ?
            {
              name: flightDetails.name,
              date: moment(flightDetails.date, "YYYY-MM-DD"),
              time: moment(flightDetails.time, "HH:mm A"),
              duration: flightDetails.duration,
              locationId: flightDetails.locationID ? locations.find(location => location._id === flightDetails.locationID)?.properties.name : "none",
              pilot: flightDetails.pilotID ? pilots.find(pilot => pilot._id === flightDetails.pilotID)?.name : "no pilot assigned",
              remember: true,
            } :
            {
              name: flightDetails.name,
              date: moment(flightDetails.date, "YYYY-MM-DD"),
              time: moment(flightDetails.time, "HH:mm A"),
            }
          }
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
                setFlightDetails((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
              }}
            />
          </Form.Item>

          <Form.Item name="date" hasFeedback>
            <DatePicker
              onChange={(date: Moment | null) => {
                setFlightDetails((prev) => ({
                  ...prev,
                  date: date?.format("YYYY-MM-DD") || "",
                }));
                setisoDate(
                  date?.format("YYYY-MM-DD") +
                    "T" +
                    (flightDetails.time.split(" ")[0] || "") +
                    "Z"
                );
              }}
            />
          </Form.Item>

          <Form.Item name="time" hasFeedback>
            <TimePicker
              use12Hours={true}
              onChange={(value) => {
                setFlightDetails((prev) => ({
                  ...prev,
                  time: value?.format("HH:mm:ss A") || "",
                }));
                setisoDate(
                  flightDetails.date +
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
                setFlightDetails((prev) => ({
                  ...prev,
                  duration: value.toString(),
                }));
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
                setFlightDetails((prev) => ({
                  ...prev,
                  locationID: value.toString(),
                }));
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
              onChange={(value) => {
                setFlightDetails((prev) => ({
                  ...prev,
                  pilotID: value.toString(),
                }));
              }}
            >
              {pilots.map((pilot: any) => (
                <Option value={pilot._id} key={pilot._id}>{pilot.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {areaSelected && (
            <div>
              <div className="data_selected">
                <img style={{ height: "20px", marginTop: "-20px" }} src={s_m} />
                <div className="data_selected_inner">
                  {flightDetails.geoFence.polygon ? (
                    <div>
                      <p>
                        <strong>Geofence Selected</strong>
                      </p>
                      <p>
                        <span>{flightDetails.geoFence.polygon.points.length} Points Selected</span>{" "}
                        <span>
                          {" "}
                          {`${(flightDetails.geoFence.polygon.area * 0.000247105).toFixed(2)} acres`}
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
                        <span>{`${(flightDetails.geoFence.circle.area * 0.000247105).toFixed(
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
                    <p>{flightDetails.geolocation}</p>
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

export default EditFlightForm;
