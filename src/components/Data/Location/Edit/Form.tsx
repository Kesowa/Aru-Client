import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
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
import { loading } from "../../../../actions/loadingAction";
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
    locationName: "",
  });
  const [area, setArea] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [location, setLocation] = useState("");
  const { id } = useParams();

  const [form] = Form.useForm();
  const history = useHistory();

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

    if (props.locationToEdit.name) {
      setFormState({
        ...formState,
        locationName: props.locationToEdit.name,
      });
    }
  }, [props]);

  const editLocation = () => {
    props.loading(true);
    const data = {
      id: id,
      type: "Polygon",
      coordinates: [
        props.polygonData
          ? props.polygonData.points.map((point) => {
              return [point.lng, point.lat];
            })
          : props.locationToEdit.geofence.map((point) => {
              return [point.long, point.lat];
            }),
      ],
      properties: {
        name: formState.locationName,
      },
    };

    data.coordinates[0].push(data.coordinates[0][0]);
    //console.log(data)

    http
      .patch(`${apis.EDIT_LOCATION}`, data)
      .then((result) => {
        if (result.data.status) {
          message.success(`Location "${formState.locationName}" Edited`);
          history.push("/dashboard/data");
        }
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
        props.clearMissionCreationStateWithGeoFence();
      });
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      locationName: e.target.value,
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
    //console.log("Hello")
    if (formState.locationName) {
      props.setFormComplete(true);
      form.resetFields();
      props.setAreaSelected(false);
      editLocation();
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
            location: props.locationToEdit.name,
          }}
          onFinish={handleFormSubmit}
          requiredMark={false}
          size="small"
        >
          <Form.Item
            label="Location Name"
            name="location"
            rules={[
              {
                required: true,
                message: "Please add the location name",
              },
            ]}
          >
            <Input
              className="locationBox"
              defaultValue={props.locationToEdit.name}
              onChange={onNameChange}
              placeholder="Location Name"
            />
          </Form.Item>

          {props.areaSelected && location && (
            <div>
              <div className="data_selected" style={{ marginTop: "20px" }}>
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

              <div className="data_selcted_2" style={{ marginTop: "20px" }}>
                {/* <h3>Location Selected</h3> */}
                <div className="location_details">
                  <img src={l_a} alt="" style={{ height: "20px" }} />
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
                    history.push("/dashboard/data");
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" size="middle">
                  Submit
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

    location: state.MissionCreation.flightDetails.geoLocation,
    locationToEdit: state.Location.location,
  };
};

export default connect(mapStateToProps, {
  setFlightDetails,
  addFlight,
  clearMissionCreationStateWithGeoFence,
  showDrawing,
  loading,
  logout,
})(StageTwoForm);
