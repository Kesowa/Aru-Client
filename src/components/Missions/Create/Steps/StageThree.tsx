// @ts-nocheck
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Button,
  Row,
  Col,
  Input,
  Checkbox,
  Table,
  message,
  Tag,
  Select,
  Modal,
  Popconfirm,
  Result,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faPlaneDeparture,
} from "@fortawesome/free-solid-svg-icons";
import {
  getImageForCircle,
  getImageForPolygon,
} from "../../../../services/staticMap";
import { loading } from "../../../../actions/loadingAction";
import { logout } from "../../../../actions/authAction";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import {
  clearMissionCreationState,
  enableFlightEditing,
  setPolygonMeasurements,
  setCircleMeasurements,
  setGeolocation,
} from "../../../../actions/missionCreation";

const { TextArea } = Input;
const { Option } = Select;

function StageThree(props: any) {
  // Form control states
  const [data, setData] = useState<any>([]);
  const [missionName, setMissionName] = useState("");
  const [missionDescription, setMissionDescription] = useState("");
  const [deliverables, setDeliverables] = useState<any>([]);
  const [mapImage, setMapImage] = useState("");
  const [assets, setAssets] = useState<any>([]);
  const [asset, setAsset] = useState<any>("none");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState("");

  const history = useHistory();

  useEffect(() => {
    // fetch the google map static image
    if (!props.missionCreationData.flights[0]) {
      message.error("Please select the geofence");
      props.prevStage();
      return;
    }

    let mapUrl = "";
    if (props.missionCreationData.flights[0].geoFence.circle) {
      const lat =
        props.missionCreationData.flights[0].geoFence.circle.center.lat;
      const lng =
        props.missionCreationData.flights[0].geoFence.circle.center.lng;
      const radius =
        props.missionCreationData.flights[0].geoFence.circle.radius;
      mapUrl = getImageForCircle(lat, lng, radius);
    } else if (props.missionCreationData.flights[0].geoFence.polygon) {
      const points =
        props.missionCreationData.flights[0].geoFence.polygon.points;
      mapUrl = getImageForPolygon(points);
    }
    setMapImage(mapUrl);

    // flight details table data
    const flights = props.missionCreationData.flights;
    let tableData: any = [];

    flights.forEach((flightData, index) => {
      const flightDetails = flightData.flightDetails;

      const flight = {};
      flight["key"] = index;
      Object.keys(flightDetails).forEach((x) => {
        if (x == "flightName") {
          flight["flight"] = flightDetails["flightName"];
          setMissionName(flightDetails["flightName"]);
        } else if (x == "date") {
          flight["date"] = flightDetails["date"];
        } else if (x == "time") {
          flight["time"] = flightDetails["time"];
        } else if (x == "duration") {
          flight["duration"] = flightDetails["duration"];
        }

        if (flightData.geoFence.polygon) {
          flight["area"] = `${(
            flightData.geoFence.polygon["area"] * 0.000247105
          ).toFixed(2)} acres`;
        } else if (flightData.geoFence.circle) {
          flight["area"] = `${(
            flightData.geoFence.circle["area"] * 0.000247105
          ).toFixed(2)} acres`;
        } else {
          flight["area"] = "NA";
        }
      });
      tableData = [...tableData, flight];
    });
    console.log("tavle", tableData, flights);
    setData(tableData);
  }, [props.missionCreationData]);

  useEffect(() => {
    http
      .get(`${apis.GET_ALL_ASSETS}`)
      .then((result) => {
        //console.log(result.data.data.gotDoc);
        setAssets(result.data.data.gotDoc);
      })
      .catch((err) => {
        if (err.response.status === 404) {
        } else {
          console.log(err);
          AxiosErrorHandler(err, props.logout);
        }
      });
  }, []);

  const fetchAllUsers = () => {
    http
      .get(`${apis.GET_CLIENT_LIST}?page=1&limit=100`)
      .then((result) => {
        if (result.data.status) {
          setClients(result.data.data);
        } else {
          message.info("clients could not be fetched");
          setClients([]);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      });
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // create Mission
  const createMission = async () => {
    if (!missionName) {
      message.error("Please Enter The Mission Name");
      return;
    }

    props.loading(true);
    let data;
    console.log("Hiiii");
    console.log(props.missionCreationData.flights);
    if (!client) {
      data = {
        name: missionName,
        deliverables,
        description: missionDescription,
        assetID: asset,
        missionType: props.missionType,
        flights: {
          ...props.missionCreationData.flights,
          assetID: asset,
        },
      };
    } else {
      data = {
        name: missionName,
        deliverables,
        description: missionDescription,
        assetID: asset,
        missionType: props.missionType,
        flights: {
          ...props.missionCreationData.flights,
          assetID: asset,
        },
        clientId: [client],
      };
    }
    try {
      const response = await http.post(apis.CREATE_MISSION, data);
      if (!response.data.status) {
        message.error(response.data.message);
      } else {
        history.push("/dashboard/missions");
        message.success("Mission Created Successfuly");
        props.clearMissionCreationState();
      }
    } catch (err: any) {
      console.log(err);
      if (err.response.status === 403) {
        if (
          err.response.data.message === "Package has expired! Please renew!"
        ) {
          setIsModalVisible2(true);
          window.setTimeout(function () {
            AxiosErrorHandler(err, props.logout);
          }, 5000);
        } else {
          setIsModalVisible(true);
        }
      }
      AxiosErrorHandler(err, props.logout);
    } finally {
      props.loading(false);
    }
  };

  const columns = [
    {
      title: "FLIGHT",
      dataIndex: "flight",
      key: "flight",
    },
    {
      title: "DATE",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "TIME",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "WEATHER",
      key: "weather",
      dataIndex: "weather",
      render: () => {
        return (
          <>
            {props.missionCreationData.weather?.temperature} <sup>o</sup> C,
            &nbsp;
            {props.missionCreationData.weather?.description}
          </>
        );
      },
    },
    {
      title: "AREA",
      key: "area",
      dataIndex: "area",
    },
    {
      title: "DURATION",
      key: "duration",
      dataIndex: "duration",
    },
  ];

  const options = [
    { label: "Live Feed", value: "Live Feed" },
    { label: "People count", value: "People Count" },
    { label: "Crow density analysis", value: "Crow Density Analysis" },
    { label: "Thermal", value: "Thermal" },
    { label: "Night vision", value: "Night Vision" },
    { label: "Orthomosaic", value: "Orthomosaic" },
    { label: "DEM", value: "DEM" },
    { label: "DTM", value: "DTM" },
    { label: "NDVI map", value: "NDVI map" },
    { label: "NDWI map", value: "NDWI map" },
  ];

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleCancel2 = () => {
    setIsModalVisible2(false);
  };

  return (
    <div className="stage_three">
      <Modal
        title="Maximum Limit reached!"
        open={isModalVisible}
        onOk={handleCancel}
        onCancel={handleCancel}
      >
        <Result
          status="500"
          title="Oops! You have reached your organisation mission limit!"
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
      <React.Fragment>
        <Row justify="center" align="middle" className="stage_three_heading">
          <h1>Review and Submit!</h1>
        </Row>

        <Row className="stage_three_main">
          <Col sm={24} md={12}>
            <div className="mission_name_input">
              <span style={{ color: "red", marginRight: "10px" }}>*</span>
              <Input
                onChange={(e) => {
                  setMissionName(e.target.value);
                }}
                maxLength={100}
                value={missionName ? missionName : ""}
                placeholder="Enter mission name here"
              />
            </div>
            <h3>
              <span style={{ fontWeight: "bold" }}>Mission type :</span>{" "}
              <Tag color="green">{props.jobTypeName}</Tag>
            </h3>
            <TextArea
              rows={6}
              style={{ marginTop: "10px", padding: "15px" }}
              placeholder={"Please provide with some instructions"}
              onChange={(e) => {
                setMissionDescription(e.target.value);
              }}
            />

            <Row className="deliverables_heading">
              <FontAwesomeIcon
                icon={faChartBar}
                style={{ width: "20px", height: "20px" }}
              />
              <h2>Choose deliverables</h2>
            </Row>
            <Checkbox.Group
              style={{ marginTop: "10px", marginLeft: "32px" }}
              options={options}
              defaultValue={["Pear"]}
              onChange={(checkedValues) => {
                setDeliverables(checkedValues);
              }}
            />
            <Row className="deliverables_heading" style={{ marginTop: "15px" }}>
              <FontAwesomeIcon
                icon={faChartBar}
                style={{ width: "20px", height: "20px" }}
              />
              <h2>Choose Asset</h2>
            </Row>
            <Select
              defaultActiveFirstOption={true}
              className="selectBox"
              placeholder="Select Asset"
              style={{ width: "100%", marginTop: "15px" }}
              onChange={(value) => {
                if (value === "No asset selected!") {
                  setAsset(null);
                } else {
                  setAsset(value);
                }
              }}
              defaultValue="No asset selected!"
            >
              {assets.map((asset) => {
                return (
                  <Option value={asset._id} key={asset._id}>
                    {asset.assetName}
                  </Option>
                );
              })}
            </Select>
            <Select
              defaultActiveFirstOption={true}
              className="selectBox"
              placeholder="Select Client"
              style={{ width: "100%", marginTop: "15px" }}
              onChange={(value: string) => {
                setClient(value);
              }}
            >
              {clients.map((client: any) => {
                return (
                  <Option value={client._id} key={client._id}>
                    {client.name}
                  </Option>
                );
              })}
            </Select>
          </Col>
          {mapImage && (
            <Col sm={24} md={12}>
              <img
                className="static_map_area_seleted map_box"
                src={mapImage}
                alt="Mapimage is not fetched"
              />
            </Col>
          )}
        </Row>
        <div className="flight-table-content">
          <Row justify="space-between" className="flight_schedule_table">
            <Col md={16} style={{ color: "#A5A4BF" }}>
              <FontAwesomeIcon
                icon={faPlaneDeparture}
                style={{
                  width: "20px",
                  height: "20px",
                  float: "left",
                  marginTop: "8px",
                  marginRight: "12px",
                }}
              />
              <h2 style={{ color: "#A5A4BF" }}>Flight schedule</h2>
            </Col>
            <Col md={8}>
              <Button
                type="primary"
                onClick={createMission}
                style={{
                  float: "right",
                  marginRight: "10px",
                }}
              >
                Submit
              </Button>
              <Popconfirm
                title="Are you sure to cancel the edit?"
                onConfirm={() => history.push("/dashboard/missions")}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  danger
                  style={{
                    float: "right",
                    marginRight: "10px",
                  }}
                >
                  Cancel
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  props.enableFlightEditing(true);
                  props.prevStage();
                }}
                style={{
                  float: "right",
                  marginRight: "10px",
                }}
              >
                Edit
              </Button>
            </Col>
          </Row>
          <Row justify="center">
            <Table
              columns={columns}
              dataSource={data}
              style={{ width: "95%", marginTop: "20px" }}
              pagination={false}
            />
          </Row>
        </div>

        <Row justify="center" className="step_buttons"></Row>
      </React.Fragment>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  missionCreationData: state.MissionCreation,
});

export default connect(mapStateToProps, {
  loading,
  logout,
  clearMissionCreationState,
  enableFlightEditing,
  setPolygonMeasurements,
  setCircleMeasurements,
  setGeolocation,
})(StageThree);
