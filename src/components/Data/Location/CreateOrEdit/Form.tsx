import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Form, Input, Button, Select, message, Result, Modal } from "antd";
import s_m from "../../../../Icons/start_measurement.svg";
import l_a from "../../../../Icons/location_add.svg";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

type CreateOrEditLocationForm = {
  areaSelected: any;
  setAreaSelected: any;
  polygonData: any;
  setPolygonData: any;
  geolocation: any;
  isEditing: any;
  locationToEdit: any;
}

const CreateOrEditLocationForm = (props: any) => {
  const [formState, setFormState] = useState<any>({
    locationName: props.isEditing ? props.locationToEdit.properties.name : ""
  });
  const [area, setArea] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [form] = Form.useForm();
  const history = useHistory();

  const { logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);

  useEffect(() => {
    if (props.polygonData) {
      setSelectedPoints(props.polygonData.points.length);
      setArea(props.polygonData.area);
    }
  }, [props]);

  const createLocation = () => {
    setLoading(true);
    const data =  {
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
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  const editLocation = () => {
    setLoading(true);
    const data = {
      id: props.locationToEdit._id,
      geometry: {
        coordinates: [
          props.polygonData
            ? props.polygonData.points.map((point) => {
                return [point.lng, point.lat];
              })
            : props.locationToEdit.geometry.coordinates[0]
        ],
        type: "Polygon",
      },
      properties: {
        name: formState.locationName,
      },
    };

    data.geometry.coordinates[0].push(data.geometry.coordinates[0][0]);

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
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
        props.setPolygonData(null);
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
      form.resetFields();
      props.setAreaSelected(false);
      if (props.isEditing) editLocation();
      else createLocation();
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
      <div style={{ marginTop: "20px" }}>
          <Form
            form={form}
            layout="vertical"
            name="create_mission"
            initialValues={{
              location: props.isEditing ? props.locationToEdit.properties.name : "",
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
              {
                props.isEditing ?
                <Input
                  className="locationBox"
                  defaultValue={props.locationToEdit.properties.name}
                  onChange={onNameChange}
                  placeholder="Location Name"
                /> :
                <Input
                  className="locationBox"
                  onChange={onNameChange}
                  placeholder="Location Name"
                />
              }
            </Form.Item>

            {props.areaSelected && (
              <div>
                <div className="data_selected" style={{ marginTop: "20px" }}>
                  <img
                    style={{ height: "20px", marginTop: "-20px" }}
                    src={s_m}
                  />
                  <div className="data_selected_inner">
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
                  </div>
                </div>

                <div className="data_selcted_2" style={{ marginTop: "20px" }}>
                  <div className="location_details">
                    <img src={l_a} alt="" style={{ height: "20px" }} />
                    <div>
                      <strong>Location Selected</strong>
                      <p>{props.geolocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {props.polygonData && (
              <Form.Item>
                <div className="mission_creation_buttons">
                  <Button
                    type="primary"
                    style={{ background: "red" }}
                    onClick={() => {
                      form.resetFields();
                      props.setAreaSelected(false);
                      props.setPolygonData(null);
                      history.push("/dashboard/data");
                    }}
                    size="middle"
                  >
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" size="middle">
                    { props.isEditing ? "Submit" : "Add"}
                  </Button>
                </div>
              </Form.Item>
            )}
          </Form>
      </div>
    </>
  );
};

export default CreateOrEditLocationForm;
