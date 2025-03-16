import React, { useEffect, useState, FC, useContext } from "react";
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
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

const { TextArea } = Input;
const { Option } = Select;

interface FlightData {
  flightName: string;
  date: string;
  time: string;
  duration: string;
}

interface GeoFenceCircle {
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
  area: number;
}

interface GeoFencePolygon {
  points: Array<any>;
  area: number;
}

interface Flight {
  geoFence: {
    circle?: GeoFenceCircle;
    polygon?: GeoFencePolygon;
  };
  flightDetails: FlightData;
}

interface Asset {
  _id: string;
  assetName: string;
}

interface Client {
  _id: string;
  name: string;
}

interface StageThreeProps {
  jobTypeName: string; // Replace with the appropriate type for jobTypeName
  missionType: string; // Replace with the appropriate type for missionType
  missionCreationData: {
    flights: Flight[];
    weather?: {
      temperature: number;
      description: string;
    };
  };
  prevStage: Function;
  flightDetails: any;
  setIsEditing: any;
}

const StageThree: FC<StageThreeProps> = ({
  missionType,
  jobTypeName,
  prevStage,
  flightDetails,
  setIsEditing,
}) => {
  // Form control states
  const [data, setData] = useState<any>([]);
  const [missionName, setMissionName] = useState(flightDetails.name);
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

  const { logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);

  useEffect(() => {
    // fetch the google map static image
    if (!(flightDetails.geoFence.circle || flightDetails.geoFence.polygon)) {
      message.error("Please select the geofence");
      prevStage();
      return;
    }

    let mapUrl = "";
    if (flightDetails.geoFence.circle) {
      const lat = flightDetails.geoFence.circle.center.lat;
      const lng = flightDetails.geoFence.circle.center.lng;
      const radius = flightDetails.geoFence.circle.radius;
      mapUrl = getImageForCircle(lat, lng, radius);
    } else if (flightDetails.geoFence.polygon) {
      const points = flightDetails.geoFence.polygon.points;
      mapUrl = getImageForPolygon(points);
    }
    setMapImage(mapUrl);

    // flight details table data

    const flight = {
      key: 0, // only one flight per mission
      flight: flightDetails.name,
      date: flightDetails.date,
      time: flightDetails.time,
      duration: flightDetails.duration,
    };
    if (flightDetails.geoFence.polygon) {
      flight["area"] = `${(
        flightDetails.geoFence.polygon.area * 0.000247105
      ).toFixed(2)} acres`;
    } else if (flightDetails.geoFence.circle) {
      flight["area"] = `${(
        flightDetails.geoFence.circle.area * 0.000247105
      ).toFixed(2)} acres`;
    } else {
      flight["area"] = "NA";
    }
    setData([flight]);
  }, [flightDetails]);

  useEffect(() => {
    http
      .get(`${apis.GET_ALL_ASSETS}`)
      .then((result) => {
        //console.log(result.data.data.gotDoc);
        setAssets(result.data.data.gotDoc);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setAssets([]);
        } else {
          console.log(err);
          AxiosErrorHandler(err, logout);
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
        AxiosErrorHandler(err, logout);
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

    setLoading(true);
    let data = {
      name: missionName,
      deliverables,
      description: missionDescription,
      assetID: asset,
      missionType,
      flights: [
        {
          flightDetails: {
            locationId: flightDetails.locationID || "none",
            flightName: flightDetails.name,
            date: flightDetails.date,
            time: flightDetails.time,
            duration: flightDetails.duration,
            geoLocation: flightDetails.geolocation,
            centerPoints: flightDetails.centerPoints,
          },
          geoFence: flightDetails.geoFence,
        },
      ],
    };
    if (client) {
      data["clientId"] = [client];
    }
    try {
      const response = await http.post(apis.CREATE_MISSION, data);
      if (!response.data.status) {
        message.error(response.data.message);
      } else {
        history.push("/dashboard/missions");
        message.success("Mission Created Successfuly");
      }
    } catch (err: any) {
      console.log(err);
      if (err.response.status === 403) {
        if (
          err.response.data.message === "Package has expired! Please renew!"
        ) {
          setIsModalVisible2(true);
          window.setTimeout(function () {
            AxiosErrorHandler(err, logout);
          }, 5000);
        } else {
          setIsModalVisible(true);
        }
      }
      AxiosErrorHandler(err, logout);
    } finally {
      setLoading(false);
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
        return <></>;
        // no weather field in missionCreationData anyways
        // return (
        //   <>
        //     {missionCreationData.weather?.temperature} <sup>o</sup> C, &nbsp;
        //     {missionCreationData.weather?.description}
        //   </>
        // );
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
              <Tag color="green">{jobTypeName}</Tag>
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
                  setIsEditing(true);
                  prevStage();
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
};

export default StageThree;
