import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Form, Input, Button, Select, message, Result, Modal } from "antd";
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
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";

const { Option } = Select;

const StageTwoForm = (props: any) => {
  const [formState, setFormState] = useState<any>({});
  const [area, setArea] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [location, setLocation] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
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
  }, [props]);

  const createLocation = () => {
    props.loading(true);
    const data = {
      type: "Polygon",
      coordinates: [
        props.polygonData.points.map((point) => {
          return [point.lng, point.lat];
        }),
      ],
      properties: {
        name: formState.locationName,
      },
    };

    data.coordinates[0].push(data.coordinates[0][0]);

    http
      .post(`${apis.CREATE_LOCATION}`, data)
      .then((result) => {
        if (result.data.status) {
          message.success(`Location "${formState.locationName}" created`);
          history.push("/dashboard/data");
        }
      })
      .catch((err) => {
        if (err.response.status === 403) {
          if (
            err.response.data.message === "Package has expired! Please renew!"
          ) {
            setIsModalVisible2(true);
          } else {
            setIsModalVisible(true);
          }
        } else {
          console.log(err);
        }
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      locationName: e.target.value,
    });
  };

  const handleFormSubmit = (values) => {
    if (formState.locationName) {
      props.setFormComplete(true);
      form.resetFields();
      props.setAreaSelected(false);
      createLocation();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleCancel2 = () => {
    setIsModalVisible2(false);
  };

  return (
    <>
      <Modal
        title="Maximum Limit reached!"
        open={isModalVisible}
        onOk={handleCancel}
        onCancel={handleCancel}
      >
        <Result
          status="500"
          title="Oops! You have reached the limit of creating further locations!"
          subTitle="Please contact your admin."
        />
      </Modal>
      <Modal
        title="Tenant Expired!"
        open={isModalVisible2}
        onOk={handleCancel2}
        onCancel={handleCancel2}
      >
        <Result
          status="403"
          title="Oops! Your tenant has expired!"
          subTitle="Please contact admin@kesowa.com to renew our services!"
        />
      </Modal>
      {props.geofenceType && (
        <div style={{ marginTop: "20px" }}>
          <Form
            form={form}
            layout="vertical"
            name="create_mission"
            initialValues={{
              remember: true,
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
                onChange={onNameChange}
                placeholder="Location Name"
              />
            </Form.Item>

            {props.areaSelected && (
              <div>
                <div className="data_selected" style={{ marginTop: "20px" }}>
                  <img
                    style={{ height: "20px", marginTop: "-20px" }}
                    src={s_m}
                  />
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
                    style={{ background: "red" }}
                    onClick={() => {
                      form.resetFields();
                      props.setAreaSelected(false);
                      props.showDrawing(false);
                      props.clearMissionCreationStateWithGeoFence();
                    }}
                    size="middle"
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
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    geofenceType: state.MissionCreation.geoFence.circle ? "circle" : "polygon",
    polygonData: state.MissionCreation.geoFence.polygon
      ? state.MissionCreation.geoFence.polygon
      : null,

    location: state.MissionCreation.flightDetails.geoLocation,
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
