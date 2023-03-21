import React, { useEffect, useRef, useState } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import EmptyGraphics from "../../../../static/Alone-rafiki.svg";
import { faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";

import {
  PageHeader,
  Tag,
  Button,
  Descriptions,
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Tabs,
  Tooltip,
  Modal,
  message,
  Form,
  Checkbox,
  Input,
  Timeline,
  Dropdown,
  Menu,
  Badge,
  notification,
  Empty,
} from "antd";

import {
  UserOutlined,
  ShareAltOutlined,
  LinkOutlined,
  MailOutlined,
  DownOutlined,
  EditOutlined,
  ExceptionOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  RadiusUpleftOutlined,
  UserAddOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import Videos from "./Data/Videos";
import Outcomes from "./Data/Outcomes";
import Map from "./Data/map";
import Documents from "./Data/Documents";
import "./index.less";
import moment from "moment";
import { loading } from "../../../../actions/loadingAction";
import TextArea from "antd/lib/input/TextArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import { EditMission } from "../../../../actions/missionActions";
import { clearMissionCreationState } from "../../../../actions/missionCreation";
import io from "socket.io-client";
import ImageDoc from "./Data/ImageDocs";
import ManageClients from "./Data/ManageClient";
import { API_URL, STATIC_URL } from "src/constants";

const { Paragraph } = Typography;
function MissionView(props) {
  const [MissionDetails, setMissionDetails] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams<any>();
  const history = useHistory();
  const [missionEditFormData, setMissionEditFormData] = useState<any>({});
  const [missionTypes, setMissionTypes] = useState<any>([]);
  const [tableData, setTableData] = useState<any>({});
  const [isPilotModalVisible, setIsPilotModalVisible] = useState(false);
  const [pilots, setPilots] = useState<any>([]);
  const [pilotToAssign, setPilotToAssign] = useState<any>({});
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [totalVOD, setTotalVOD] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [completeButtonState, setCompleteButtonState] = useState(false);
  const [vodRefresh, setVodRefresh] = useState(false);
  const [docRefresh, setDocRefresh] = useState(false);
  const socket: any = useRef();
  const [missionClient, setMissionClient] = useState<any>([]);
  const [initialPilot, setInitialPilot] = useState<any>({});
  const [missType, setMissType] = useState<any>("");
  const [typeflag, settypeflag] = useState<any>(0);
  const location = useLocation<any>();

  //-----------------Notification Function-------------------------//
  const openNotification = (title, description, type) => {
    notification[type]({
      message: title,
      description: description,
    });
  };

  useEffect(() => {
    props.loading(true);
    props.clearMissionCreationState();
    getInitialData(id);
  }, []);

  const options = [
    { label: "Live Feed", value: "Live Feed" },
    { label: "People Count", value: "People Count" },
    { label: "Crow Density Analysis", value: "Crow Density Analysis" },
    { label: "Thermal", value: "Thermal" },
    { label: "Night Vision", value: "Night Vision" },
    { label: "Orthomosaic", value: "Orthomosaic" },
    { label: "DEM", value: "DEM" },
    { label: "DTM", value: "DTM" },
    { label: "NDVI map", value: "NDVI map" },
    { label: "NDWI map", value: "NDWI map" },
  ];

  // useEffect(() => {
  //   try {
  //     let fetchPilots = async () => {
  //       let result = await http.get(
  //         `${apis.FETCH_ALL_PILOTS}`
  //       );
  //       setPilots(result.data.data);
  //     };

  //     fetchPilots();

  //     http
  //       .get(`${apis.GET_ALERT_VOD_COUNT}`, {
  //         params: {
  //           missionId: id,
  //         },
  //       })
  //       .then((result) => {
  //         if (result.data.status) {
  //           console.log(result.data.data);
  //           setTotalAlerts(result.data.data.alerts);
  //           setTotalVOD(result.data.data.vods);
  //         }
  //       })
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }, []);

  // useEffect(() => {
  //   try {
  //     http
  //       .get(`${apis.GET_ALERT_VOD_COUNT}`, {
  //         params: {
  //           missionId: id,
  //         },
  //       })
  //       .then((result) => {
  //         if (result.data.status) {
  //           console.log(result.data.data);
  //           setTotalAlerts(result.data.data.alerts);
  //           setTotalVOD(result.data.data.vods);
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }, []);

  const fetchPilots = async () => {
    const result = await http.get(`${apis.FETCH_ALL_PILOTS}`);
    if (result.data.data !== undefined) {
      setPilots(result.data.data);
      console.log(result.data.data);
    }
  };

  const fetchMissionTypes = async () => {
    const result = await http.get(
      apis.GET_ALL_MISSION_TYPES
    );
    if (result.data.status) {
      setMissionTypes(result.data.data);
      console.info("Successfully fetched mission types");
      console.log(result.data.data);
    } else {
      message.error(result.data.message);
      console.log(`Error while fetching mission types: ${result.data.message}`);
    }
  };

  const getInitialData = async (id) => {
    const [userType, missionId] = id.split("-");
    // console.log(id, userType, missionId);
    try {
      const result = await http.get(`${apis.GET_MISSION_DOC_COUNT}`, {
        params: {
          missionId: missionId,
        },
      });

      if (result.data.status) {
        console.log(result.data.data);
        setTotalAlerts(result.data.data.alerts);
        setTotalVOD(result.data.data.vods);
        setTotalImages(result.data.data.images);
        setTotalDocs(result.data.data.docs);
      } else {
        message.error(result.data.message);
      }

      let mission: any;
      //let mission = props.missions.filter((mission) => {
      // return mission._id === id;
      //});
      // mission = mission[0];
      //console.log("MIssion details from state", mission);
      if (!mission) {
        try {
          const result = await http.get(
            userType === "staff"
              ? `${apis.GET_MISSION_BY_ID}${missionId}`
              : `${apis.GET_MISSION_ID_CLIENT}${missionId}`
          );
          mission = result.data.data;
          console.log("from api call", mission);
        } catch (err) {
          message.error("Something went wrong");
          AxiosErrorHandler(err, props.logout);
          props.loading(false);
          return;
        }
      }

      const details = {
        missionName: mission.name,
        missionId: mission._id,
        missionStatus: mission.status,
        location: mission.flight
          ? mission.flight.geoLocation
            ? mission.flight.geoLocation
            : "none"
          : "none",
        instructions: mission.description,
        orderDate: moment(mission.createdAt)
          .format("MMMM Do YYYY, h:mm:ss a")
          .toString(),
        flightDate: mission.flight ? mission.flight.date : "none",
        createdBy: mission.user ? mission.user.name : "User deleted",
        createdByPhoto: mission.user
          ? mission.user.avatar
            ? mission.user.avatar
            : "no-image"
          : "no-image",
        deliverables: mission.deliverables,
        missionGeofence: mission.flight.geoFence,
        pilotAssigned:
          mission.flight && mission.flight.pilotID
            ? mission.flight.pilotID.name
            : "no-pilot",
        pilotPhoto:
          mission.flight && mission.flight.pilotID
            ? mission.flight.pilotID.avatar
            : "",
        flightId: mission.flight ? mission.flight._id : "",
        flightName: mission.flight ? mission.flight.name : "",
        fDate: mission.flight ? mission.flight.date : "",
        fDuration: mission.flight ? mission.flight.duration : "",
        locationId: mission.flight ? mission.flight.locationID : null,
        missionTenantId: props.tenantId ? props.tenantId : "",
        userType: props.userDetails ? props.userDetails.userType : "",
        currentUser: props.userDetails ? props.userDetails.name : "",
        currentUserDetails: props.userDetails,
        refresh: vodRefresh,
        missionType: mission.missionType ? mission.missionType.name : "",
        clients: [],
      };

      console.log("MIissss", details);
      console.log("clientsss", mission.clientId);

      // updating mission's client state
      if (mission.clientId?.length > 0) {
        console.log("clients!!", mission.clientId);
        const finalArray: any = [];
        mission.clientId.map((item: any) => {
          const obj = {
            id: item._id,
            name: item.name,
            avatar: item.avatar,
          };
          finalArray.push(obj);
        });
        setMissionClient(finalArray);
      } else {
        setMissionClient([]); // missions client state to remain empty is there are no clients in mission
        console.log("no clients here bitches");
      }

      // if (details.pilotAssigned === "no-pilot") {
      //   await fetchPilots();
      // }
      await fetchPilots();
      setMissionDetails(details);

      // Get all available mission types from backend
      await fetchMissionTypes();

      // Set loading status to false
      props.loading(false);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      AxiosErrorHandler(err, props.logout);
      props.loading(false);
    }
  };

  // ++++++++++++++++++++++++++++++++++++ E2 share Modal states ++++++++++++++++++++++++++++++++++++++++++++
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  function callback(key) {
    setactiveKey(key);
  }

  // ++++++++++++++++++++++++++++++++ E3 Edit Modal states ++++++++++++++++++++++++++++++++++++++++++++++++

  const [EditModalVisible, setEditModalVisible] = useState(false);

  const showEditModal = () => {
    setEditModalVisible(true);
  };

  const EditSubmit = () => {
    props.loading(true);
    if (!missionEditFormData.missionName) {
      return message.error("Please enter the mission name");
    }

    const body = {
      id: missionEditFormData.id,
      name: missionEditFormData.missionName,
      description: missionEditFormData.instructions,
      type: missionEditFormData.missionType,
      deliverables: missionEditFormData.deliverables
        ? missionEditFormData.deliverables
        : [],
    };
    console.log("Body : " + JSON.stringify(body));
    http
      .post(`${apis.EDIT_MISSION_BY_ID}`, body)
      .then((result) => {
        if (result.data.status) {
          props.EditMission(result.data.data);
          setEditModalVisible(false);
          setMissionDetails({
            ...MissionDetails,
            missionName: body.name,
            instructions: body.description,
            type: body.type,
            deliverables: body.deliverables,
          });
          setMissionEditFormData({});
          message.success("Mission Edited Successfully");
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        message.error("Something went wrong");
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
      });

    settypeflag(1);
    // setEditModalVisible(false);
  };

  const EditCancel = () => {
    setEditModalVisible(false);
  };

  const { TabPane } = Tabs;
  const { Title, Text, Link } = Typography;
  const [activeKey, setactiveKey] = useState("1");
  // ++++++++++++++++++++++++++++++++++++++++++++++ E4 Data Card tabs +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const DataTabs = ({ id }) => {
    if (MissionDetails.missionType === "Mapping") {
      return (
        <>
          <Tabs defaultActiveKey={activeKey} onChange={callback}>
            <TabPane tab={<span>Map</span>} key="1">
              <Map id={id} mission={MissionDetails} />
            </TabPane>
            <TabPane
              tab={
                <span>
                  Documents{" "}
                  <Badge
                    style={{ backgroundColor: "#3D85FC" }}
                    count={totalDocs}
                  ></Badge>
                </span>
              }
              key="2"
            >
              <Documents
                missionName={MissionDetails.missionName}
                missionId={MissionDetails.missionId}
                missionDetails={MissionDetails}
                userDetails={props.userDetails}
                userType={props.userType}
                refreshDoc={docRefresh}
                setRefreshDoc={setDocRefresh}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  Videos{" "}
                  <Badge
                    style={{ backgroundColor: "#3D85FC" }}
                    count={totalVOD}
                  ></Badge>
                </span>
              }
              key="3"
            >
              <Videos
                missionDetails={MissionDetails}
                userType={props.userType}
                userDetails={props.userDetails}
                setCount={setTotalVOD}
                totalVOD={totalVOD}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  Outcomes{" "}
                  <Badge
                    style={{ backgroundColor: "#3D85FC" }}
                    count={totalAlerts}
                  ></Badge>
                </span>
              }
              key="4"
            >
              <Outcomes
                id={id}
                count={totalAlerts}
                missionDetails={MissionDetails}
                userType={props.userType}
                userDetails={props.userDetails}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  Images{" "}
                  <Badge
                    style={{ backgroundColor: "#3D85FC" }}
                    count={totalImages}
                  ></Badge>
                </span>
              }
              key="5"
            >
              <ImageDoc
                missionName={MissionDetails.missionName}
                missionId={MissionDetails.missionId}
                missionDetails={MissionDetails}
                userType={props.userType}
                userDetails={props.userDetails}
              />
            </TabPane>
          </Tabs>
        </>
      );
    } else {
      return (
        <Tabs defaultActiveKey={activeKey} onChange={callback}>
          <TabPane
            tab={
              <span>
                Videos{" "}
                <Badge
                  style={{ backgroundColor: "#3D85FC" }}
                  count={totalVOD}
                ></Badge>
              </span>
            }
            key="1"
          >
            <Videos
              missionDetails={MissionDetails}
              userType={props.userType}
              userDetails={props.userDetails}
              setCount={setTotalVOD}
              totalVOD={totalVOD}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                Outcomes{" "}
                <Badge
                  style={{ backgroundColor: "#3D85FC" }}
                  count={totalAlerts}
                ></Badge>
              </span>
            }
            key="2"
          >
            <Outcomes
              id={id}
              count={totalAlerts}
              missionDetails={MissionDetails}
              userType={props.userType}
              userDetails={props.userDetails}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                Documents{" "}
                <Badge
                  style={{ backgroundColor: "#3D85FC" }}
                  count={totalDocs}
                ></Badge>
              </span>
            }
            key="3"
          >
            <Documents
              missionName={MissionDetails.missionName}
              missionId={MissionDetails.missionId}
              missionDetails={MissionDetails}
              userDetails={props.userDetails}
              userType={props.userType}
              refreshDoc={docRefresh}
              setRefreshDoc={setDocRefresh}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                Images{" "}
                <Badge
                  style={{ backgroundColor: "#3D85FC" }}
                  count={totalImages}
                ></Badge>
              </span>
            }
            key="4"
          >
            <ImageDoc
              missionName={MissionDetails.missionName}
              missionId={MissionDetails.missionId}
              missionDetails={MissionDetails}
              userType={props.userType}
              userDetails={props.userDetails}
            />
          </TabPane>
        </Tabs>
      );
    }
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++ E5 Rendering Mission Status tags ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  function MissionStatusTag(status: any) {
    let color;

    switch (status) {
      case "Upcoming":
        color = "orange";
        break;
      case "Live":
        color = "geekblue";
        break;
      case "Completed":
        color = "green";
        break;
      case "Review":
        color = "magenta";
        break;
      default:
        color = "red";
    }
    return (
      <Tag color={color} key={status}>
        {status.toUpperCase()}
      </Tag>
    );
  }

  // ++++++++++++++++++++ E6 Mission Status Card +++++++++++++++++++++++++++++++++++++++++++++++++
  function MissionStatusCard(status: any) {
    switch (status) {
      case "Upcoming":
        return (
          <Card title="Timeline" bordered={false} className="status-card">
            <Timeline>
              <Timeline.Item
                dot={<FontAwesomeIcon icon={faPlaneDeparture} />}
                color="blue"
              >
                <Text type="secondary">
                  Flight scheduled on {MissionDetails.flightDate}
                </Text>
              </Timeline.Item>
              {MissionDetails.pilotAssigned == "no-pilot" ? (
                <Timeline.Item dot={<UserOutlined />} color="blue">
                  Pilot not yet assigned to mission!
                </Timeline.Item>
              ) : (
                <Timeline.Item dot={<UserOutlined />} color="blue">
                  Pilot <b>{MissionDetails.pilotAssigned}</b> has been assigned
                  to mission
                </Timeline.Item>
              )}
            </Timeline>
          </Card>
        );

      case "Live":
        return (
          <Card title="Timeline" bordered={false} className="status-card">
            <Timeline>
              <Timeline.Item
                dot={<FontAwesomeIcon icon={faPlaneDeparture} />}
                color="blue"
              >
                <Text type="secondary">
                  Flight scheduled on {MissionDetails.flightDate}
                </Text>
              </Timeline.Item>
              <Timeline.Item dot={<UserOutlined />} color="blue">
                Pilot <b>{MissionDetails.pilotAssigned}</b> has been assigned to
                mission
              </Timeline.Item>
              <Timeline.Item
                dot={<FontAwesomeIcon icon={faPlaneDeparture} />}
                color="blue"
              >
                <Link href="" target="_blank">
                  Flight is LIVE!
                </Link>
              </Timeline.Item>
            </Timeline>
            <Button
              type="primary"
              onClick={() => {
                history.push(
                  `/dashboard/data/live/${MissionDetails.missionId}`
                );
              }}
            >
              Click to Watch!
            </Button>
          </Card>
        );

      case "Review":
        return (
          <Card title="Timeline" bordered={false} className="status-card">
            <Timeline>
              <Timeline.Item
                dot={<FontAwesomeIcon icon={faPlaneDeparture} />}
                color="blue"
              >
                <Text type="secondary">
                  Flight scheduled on {MissionDetails.flightDate}
                </Text>
              </Timeline.Item>
              <Timeline.Item dot={<UserOutlined />} color="blue">
                Pilot <b>{MissionDetails.pilotAssigned}</b> has been assigned to
                mission
              </Timeline.Item>
              <Timeline.Item
                dot={<FontAwesomeIcon icon={faPlaneDeparture} />}
                color="blue"
              >
                <Text>Flight completed!</Text>
              </Timeline.Item>
              <Timeline.Item dot={<ExceptionOutlined />} color="blue">
                Please review mission data
              </Timeline.Item>
            </Timeline>
          </Card>
        );

      case "Completed":
        return (
          <Card title="Timeline" bordered={false} className="status-card">
            <Timeline>
              <Timeline.Item
                dot={<FontAwesomeIcon icon={faPlaneDeparture} />}
                color="blue"
              >
                <Text type="secondary">
                  Flight scheduled on {MissionDetails.flightDate}
                </Text>
              </Timeline.Item>
              <Timeline.Item dot={<UserOutlined />} color="blue">
                Pilot <b>{MissionDetails.pilotAssigned}</b> has been assigned to
                mission
              </Timeline.Item>
              <Timeline.Item
                dot={<FontAwesomeIcon icon={faPlaneDeparture} />}
                color="blue"
              >
                <Text>Flight completed!</Text>
              </Timeline.Item>
              <Timeline.Item dot={<ExceptionOutlined />} color="blue">
                Data Reviewed!
              </Timeline.Item>
              <Timeline.Item dot={<CheckCircleOutlined />} color="blue">
                Mission Complete!
              </Timeline.Item>
            </Timeline>
          </Card>
        );

      default:
        return (
          <Card bordered={false} className="status-card">
            <h1>Error</h1>
          </Card>
        );
    }
  }

  // ++++++++++++++++++ E7 Data Card Contents +++++++++++++++++++++++++++++++++++

  function renderDataCard(status: any) {
    const [userType, missionId] = id.split("-");
    //console.log(id);
    switch (status) {
      case "Review":
        return <DataTabs id={missionId} />;

      case "Completed":
        return <DataTabs id={missionId} />;

      default:
        return (
          <div className="empty-content">
            <Row>
              <Col span={8}>
                <Row>
                  <div style={{ width: "400px", height: "auto" }}>
                    <img
                      src={EmptyGraphics}
                      style={{ width: "100%", height: "100%", opacity: "80%" }}
                    />
                  </div>
                </Row>
              </Col>
              <Col span={8}>
                <div style={{ marginTop: "4rem" }}>
                  <Row>
                    <Title level={2} style={{ opacity: "85%" }}>
                      Nothing to show here!
                    </Title>
                  </Row>
                  <Row>
                    <Text type="secondary">
                      Data will only get populated, once pilot has completed all
                      the flights.
                    </Text>
                  </Row>
                </div>
              </Col>
            </Row>
          </div>
        );
    }
  }

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ E8 Header Buttons ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const completeMission = () => {
    if (MissionDetails.pilotAssigned === "no-pilot") {
      message.warning(
        "Please assign mission to a pilot before marking it as Complete!"
      );
    } else {
      setCompleteButtonState(true);
      http
        .patch(`${apis.UPDATE_MISSION_STATUS}`, {
          missionID: MissionDetails.missionId,
          status: "Completed",
        })
        .then((result) => {
          if (result.data.status) {
            message.success("Mission Completed!");
            setMissionDetails({
              ...MissionDetails,
              missionStatus: "Completed",
            });
            setCompleteButtonState(false);
          } else {
            message.error(result.data.message);
            setCompleteButtonState(false);
          }
        })
        .catch((err) => {
          console.log(err.response.status);
          setCompleteButtonState(false);
          AxiosErrorHandler(err, props.logout);
        });
    }
  };

  const reviewMission = () => {
    if (MissionDetails.pilotAssigned === "no-pilot") {
      message.warning(
        "Please assign mission to a pilot before marking it as Complete!"
      );
    } else {
      setCompleteButtonState(true);
      http
        .patch(`${apis.UPDATE_MISSION_STATUS}`, {
          missionID: MissionDetails.missionId,
          status: "Review",
        })
        .then((result) => {
          if (result.data.status) {
            message.info("Mission is in Review!");
            setMissionDetails({
              ...MissionDetails,
              missionStatus: "Review",
            });
            setCompleteButtonState(false);
          } else {
            message.error(result.data.message);
            setCompleteButtonState(false);
          }
        })
        .catch((err) => {
          console.log(err.response.status);
          setCompleteButtonState(false);
          AxiosErrorHandler(err, props.logout);
        });
    }
  };

  //----------------Render edit mission details Button---------------------

  function renderMissionDetailsBtn() {
    if (
      props.userType === "tenant-staff" ||
      props.userType === "tenant-client"
    ) {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "mission_update"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Button
            onClick={() => {
              showEditModal();
              setMissionEditFormData({
                id: MissionDetails.missionId,
                missionName: MissionDetails.missionName,
                missionType: missionTypes.find((mType: any) => {
                  return mType.name === MissionDetails.missionType;
                })._id,
                instructions: MissionDetails.instructions,
                deliverables: MissionDetails.deliverables,
              });
            }}
            key="3"
          >
            Edit Details
          </Button>
        );
      }
    } else {
      return (
        <Button
          onClick={() => {
            showEditModal();
            setMissionEditFormData({
              id: MissionDetails.missionId,
              missionName: MissionDetails.missionName,
              missionType: missionTypes.find((mType: any) => {
                return mType.name === MissionDetails.missionType;
              })._id,
              instructions: MissionDetails.instructions,
              deliverables: MissionDetails.deliverables,
            });
          }}
          key="3"
        >
          Edit Details
        </Button>
      );
    }
  }

  //----------------Render review Button---------------------

  function renderReviewBtn() {
    if (
      props.userType === "tenant-staff" ||
      props.userType === "tenant-client"
    ) {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "mission_update"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Button
            onClick={() => {
              reviewMission();
            }}
            key="1"
            type="primary"
            loading={completeButtonState}
          >
            Mark for review
          </Button>
        );
      }
    } else {
      return (
        <Button
          onClick={() => {
            reviewMission();
          }}
          key="1"
          type="primary"
          loading={completeButtonState}
        >
          Mark for review
        </Button>
      );
    }
  }

  //----------------Render completed Button---------------------

  function renderCompleteBtn() {
    if (
      props.userType === "tenant-staff" ||
      props.userType === "tenant-client"
    ) {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "mission_update"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Button
            onClick={() => {
              completeMission();
            }}
            key="1"
            type="primary"
            loading={completeButtonState}
          >
            Mark as completed
          </Button>
        );
      }
    } else {
      return (
        <Button
          onClick={() => {
            completeMission();
          }}
          key="1"
          type="primary"
          loading={completeButtonState}
        >
          Mark as completed
        </Button>
      );
    }
  }

  //----------------Render Edit Flight Button---------------------

  function renderEditFlightBtn() {
    if (
      props.userType === "tenant-staff" ||
      props.userType === "tenant-client"
    ) {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "mission_update"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Menu.Item
            onClick={() => {
              history.push(
                `/dashboard/flight/edit/${MissionDetails.missionId}`
              );
            }}
            key="1"
          >
            <EditOutlined /> Edit Flight
          </Menu.Item>
        );
      }
    } else {
      return (
        <Menu.Item
          onClick={() => {
            history.push(`/dashboard/flight/edit/${MissionDetails.missionId}`);
          }}
          key="1"
        >
          <EditOutlined /> Edit Flight
        </Menu.Item>
      );
    }
  }

  //----------------Render Assign Pilot Button---------------------

  function renderAssignPilotBtn(buttonText: string) {
    if (
      props.userType === "tenant-staff" ||
      props.userType === "tenant-client"
    ) {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "mission_update"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              setIsPilotModalVisible(true);
            }}
            disabled={MissionDetails.missionStatus !== "Upcoming"}
          >
            {buttonText}
          </Button>
        );
      }
    } else {
      return (
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => {
            setIsPilotModalVisible(true);
          }}
          disabled={MissionDetails.missionStatus !== "Upcoming"}
        >
          {buttonText}
        </Button>
      );
    }
  }

  function headerButtons(status: any) {
    switch (status) {
      case "Upcoming":
        return (
          <>
            {renderMissionDetailsBtn()}
            {renderReviewBtn()}
          </>
        );

      case "Live":
        return (
          <>
            {renderMissionDetailsBtn()}
            {renderReviewBtn()}
          </>
        );
      case "Review":
        return (
          <>
            {renderMissionDetailsBtn()}
            {renderCompleteBtn()}
          </>
        );

      default:
        return <>{renderMissionDetailsBtn()}</>;
    }
  }

  /*------------------Handel Actions -------------------------*/
  const handleAction = (e) => {
    console.log(e);
    const i = parseInt(e.key) - 1;
    setMissType(missionTypes[i].name);
    setMissionEditFormData({
      ...missionEditFormData,
      missionType: missionTypes[i]._id,
    });
  };
  /*--------------------Mission Type--------------------*/

  const menu = (
    <Menu
      onClick={(e) => handleAction(e)}
      items={missionTypes.map((mType: any, index: any) => {
        return {
          label: mType.name,
          key: (index + 1).toString(),
          icon: <VideoCameraOutlined />,
        };
      })}
    />
  );
  // +++++++++++++++ E9 Rendering Mission Deliverables and Pilot badge ++++++++++++++++++++++++
  function MissionDeliverables(items: any[]) {
    return items.map((item) => <Tag color="green">{item}</Tag>);
  }

  function assignPilot() {
    props.loading(true);
    http
      .patch(`${apis.ASSIGN_PILOT}`, {
        pilotID: pilotToAssign._id,
        flightID: MissionDetails.flightId,
      })
      .then((result) => {
        if (result.data.status) {
          message.success(result.data.message);
          setIsPilotModalVisible(false);
          setMissionDetails({
            ...MissionDetails,
            pilotAssigned: pilotToAssign.name,
            pilotPhoto: pilotToAssign.avatar,
          });
          setInitialPilot({
            name: pilotToAssign.name,
            avatar: pilotToAssign.avatar,
          });
          setPilotToAssign({});
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
      });
  }

  function cancelAssigningPilot() {
    setIsPilotModalVisible(false);
    setPilotToAssign({});
  }

  function getInitials(string) {
    let names = string.split(" "),
      initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  function renderPilotAssignButton() {
    return (
      <Modal
        title="Assign Pilot"
        open={isPilotModalVisible}
        onOk={() => {}}
        onCancel={cancelAssigningPilot}
        footer={[
          <Button key="back" onClick={cancelAssigningPilot}>
            Cancel
          </Button>,
          <>
            {Object.keys(pilotToAssign).length === 0 ? (
              <Button key="ok" type="primary" onClick={assignPilot} disabled>
                Assign
              </Button>
            ) : (
              <Button key="ok" type="primary" onClick={assignPilot}>
                Assign
              </Button>
            )}
          </>,
        ]}
      >
        <div
          style={{
            width: "100%",
            height: "300px",
            overflow: "auto",
          }}
        >
          {pilots.length > 0 ? (
            <>
              {pilots.map((pilot) => (
                <Row
                  className={`pilot ${
                    pilot.name === pilotToAssign.name ? "pilot-selected" : ""
                  }`}
                  onClick={() => {
                    setPilotToAssign(pilot);
                  }}
                >
                  <Col span={3}>
                    <Avatar src={STATIC_URL + pilot.avatar} size={"large"}>
                      {getInitials(pilot.name)}
                    </Avatar>
                  </Col>
                  <Col span={19}>
                    <h3>{pilot.name}</h3>
                  </Col>
                </Row>
              ))}
            </>
          ) : (
            <>
              <Empty description={<span>No pilot users found!</span>} />
            </>
          )}
        </div>
      </Modal>
    );
  }

  function renderPilotBadge() {
    //TO RENDER PILOT BADGE
    if (initialPilot.name) {
      return (
        <>
          <Avatar
            key="2"
            size="large"
            icon={<UserOutlined />}
            src={initialPilot.avatar}
          />
          <div className="pilot-name">
            <Title level={5} className="designation">
              {initialPilot.name}
            </Title>
            <Text type="secondary">Pilot assigned</Text>
          </div>
          <div className="pilot-assign-btn">
            {renderAssignPilotBtn("Re-Assign Pilot")}
            {renderPilotAssignButton()}
          </div>
        </>
      );
    } else if (
      MissionDetails.pilotAssigned == "no-pilot" &&
      props.userType !== "tenant-client"
    ) {
      return (
        <div>
          {renderAssignPilotBtn("Assign Pilot")}
          {renderPilotAssignButton()}
        </div>
      );
    } else {
      return (
        <>
          <Avatar
            key="2"
            size="large"
            icon={<UserOutlined />}
            src={STATIC_URL + MissionDetails.pilotPhoto}
          />
          <div className="pilot-name">
            <Title level={5} className="designation">
              {MissionDetails.pilotAssigned}
            </Title>
            <Text type="secondary">Pilot assigned</Text>
          </div>
          <div className="pilot-assign-btn">
            {renderAssignPilotBtn("Re-Assign Pilot")}
            {renderPilotAssignButton()}
          </div>
        </>
      );
    }
  }

  // +++++++++++++++ E10 Breadcrumb routes ++++++++++++++++++++++++++++++++
  const routes = [
    {
      path: "missions",
      breadcrumbName: "Missions",
    },
    {
      path: "missionView",
      breadcrumbName: MissionDetails.missionName,
    },
  ];

  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  //socket event listeners here
  useEffect(() => {
    if (MissionDetails.missionId) {
      if (!socket.current) {
        socket.current = io(
          `${API_URL}/stream/mission-specific?missionID=${MissionDetails.missionId}`
        );
        socket.current.on("PROCESS_VIDEO_STARTED", (data) => {
          console.log("Video processing started: ", data);
          openNotification(
            "Video Processing!",
            `Processing ${data.originalName}`,
            "info"
          );
          // if(data.missionID === VideoProps.missionDetails.missionId) {
          //
          // }
        });

        socket.current.on("PROCESS_VIDEO_FINISHED", (data) => {
          console.log("Video processing finished: ", data);
          openNotification(
            "Finished Processing!",
            `Processing ${data.originalName} has been complete!`,
            "success"
          );
          setVodRefresh(true);
          // if(data.missionID === VideoProps.missionDetails.missionId) {
          //   openNotification("Video Processing Complete!", `You can now watch your video uplaoded to missionID: ${VideoProps.missionDetails.missionId}!`, 'success');
          //   setRefresh(true);
          // }
        });

        socket.current.on("POINTCLOUD_EXTRACTION_START", (data) => {
          console.log("Extraction started: ", data);
          openNotification(
            "Extracting now...",
            `Extracing pointclouds`,
            "info"
          );
        });

        socket.current.on("POINTCLOUD_EXTRACTION_COMPLETED", (data) => {
          console.log("Extraction complete!: ", data);
          setDocRefresh(true);
          openNotification(
            "Extraction Complete!.",
            `The point cloud has been extracted.`,
            "success"
          );
        });
      }
    }
  }, [MissionDetails.missionId]);
  console.log(location.state);
  return (
    <div className="mission-view-wrapper">
      {/* +++++++++++++++++++ E11 HEADER++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      {!isLoading ? (
        <>
          <PageHeader
            onBack={() =>
              location?.state?.missionPage
                ? history.push("/dashboard/missions", {
                    missionPage: location.state.missionPage,
                  })
                : history.goBack()
            }
            title={MissionDetails.missionName}
            tags={MissionStatusTag(MissionDetails.missionStatus)}
            extra={headerButtons(MissionDetails.missionStatus)}
          >
            <Descriptions size="small" column={3}>
              <Descriptions.Item label={"Mission ID"}>
                <a>
                  <Paragraph copyable>{MissionDetails.missionId}</Paragraph>
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Mission Type">
                {typeflag == 0 ? MissionDetails.missionType : missType}
              </Descriptions.Item>
              <Descriptions.Item label="Order date">
                {MissionDetails.orderDate}
              </Descriptions.Item>
              <Descriptions.Item label="Created by">
                {MissionDetails.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Flight date">
                {MissionDetails.flightDate}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {MissionDetails.location}
              </Descriptions.Item>
            </Descriptions>
          </PageHeader>

          {/* ++++++++++++++++ E12 PAGE BODY+++++++++++++++++++++++++++++++++++++++ */}

          <Row className="page">
            {/* ++++++++++++++++++ E13 BODY LEFT PART++++++++++++++++++++++++++++++++++++ */}
            <Col span={17} style={{ width: "100%" }}>
              {/* ++++++++++++++++ E14 Mission Details Card ++++++++++++++++++++++++++++++ */}
              <Row>
                <Card
                  title="Mission Details"
                  className="mission-details"
                  bordered={false}
                  extra={[
                    <>
                      <div className="pilot-profile-badge">
                        {renderPilotBadge()}
                      </div>
                      {/* <div className="share-btn">
                        <Tooltip placement="bottom" title="Share this page">
                          <a onClick={showModal}>
                            <ShareAltOutlined style={{ fontSize: "24px" }} />
                          </a>
                        </Tooltip>
                      </div> */}
                    </>,
                  ]}
                >
                  <Text type="secondary">Instructions</Text>
                  <p>{MissionDetails.instructions}</p>
                  <Text type="secondary">Deliverables</Text>
                  <p style={{ marginTop: "8px" }}>
                    {MissionDeliverables(MissionDetails.deliverables)}
                  </p>
                </Card>
              </Row>

              {/* +++++++++++++++ E15 Data ++++++++++++++++++++++++++++++++++++++++ */}
              <Row>
                <Card bordered={false} className="data-card">
                  {renderDataCard(MissionDetails.missionStatus)}
                </Card>
              </Row>
            </Col>

            {/* ++++++++++++++++++ E16 BODY RIGHT PART+++++++++++++++++++++++++++++++++ */}
            <Col span={7} style={{ width: "100%" }}>
              {/* ++++++++++++++++ E17 Mision status Card +++++++++++++++++++++++++++++ */}
              <Row>{MissionStatusCard(MissionDetails.missionStatus)}</Row>
              {/* ++++++++++++++++ E18 Flight List Card ++++++++++++++++++++++++++++++++ */}

              <Row>
                <Card title="Flights" bordered={false} className="flight-card">
                  <Dropdown
                    overlay={
                      <Menu>
                        {renderEditFlightBtn()}
                        <Menu.Item
                          onClick={() => {
                            history.push(
                              `/dashboard/flight/view/${MissionDetails.missionId}`
                            );
                          }}
                          key="1"
                        >
                          <EyeOutlined /> View Flight
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={["contextMenu"]}
                  >
                    <Tooltip
                      placement="bottom"
                      title="Right click to view/edit flight"
                    >
                      <Row className="flight-list-div">
                        <Col span={2} className="flight-list-item">
                          <RadiusUpleftOutlined />
                        </Col>
                        <Col
                          span={8}
                          className="flight-list-item flight-list-item-name"
                        >
                          <Text className="flight-name">
                            {MissionDetails.flightName}
                          </Text>
                        </Col>
                        <Col span={10} className="flight-list-item">
                          <Text
                            className="flight-timestamp"
                            style={{ float: "right" }}
                          >
                            {MissionDetails.fDate}
                          </Text>
                        </Col>
                        <Col span={4} className="flight-list-item">
                          <Text className="flight-duration">
                            {MissionDetails.fDuration}
                          </Text>
                        </Col>
                      </Row>
                    </Tooltip>
                  </Dropdown>
                </Card>
              </Row>

              {/* ++++++++++++++++++++++++++++++++++++++++++++++++++ E19 Customer Details Card++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
              <ManageClients
                missionClient={missionClient} // then i passed the same state in this component
                setClients={setMissionClient} // also the the setState for the same has been passed here
                loading={props.loading}
                missionId={id.split("-")[1]}
                userType={props.userType}
                userDetails={props.userDetails}
              />
            </Col>
          </Row>
          <br />
          <br />

          {/* ++++++++++++++++++++++++++++++++++++++++ E20 SHARE MODAL CODE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
          <Modal
            title={[
              <Title level={5}>
                <ShareAltOutlined style={{ fontSize: "24px" }} />
                &nbsp;&nbsp;&nbsp;Share mission card
              </Title>,
            ]}
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Row justify={"center"}>
              <Col span={8}>
                <Button
                  type="default"
                  shape="round"
                  icon={<LinkOutlined />}
                  size="large"
                >
                  Share link
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  type="default"
                  shape="round"
                  icon={<MailOutlined />}
                  size="large"
                >
                  Share via email
                </Button>
              </Col>
            </Row>
          </Modal>

          {/* +++++++++++++++++++++++++++++++++++++++++++++++++++ E21 Modal Edit++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
          <Modal
            title={[
              <Title level={5}>
                <EditOutlined style={{ fontSize: "24px" }} />
                &nbsp;&nbsp;&nbsp;Edit Mission and flight details
              </Title>,
            ]}
            visible={EditModalVisible}
            onOk={EditSubmit}
            onCancel={EditCancel}
            footer={[
              <Button key="back" onClick={EditCancel}>
                Cancel
              </Button>,
              <Button
                key="submit"
                htmlType="submit"
                type="primary"
                onClick={EditSubmit}
              >
                Submit
              </Button>,
            ]}
            width={800}
          >
            <Form
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              name="basic"
              initialValues={{
                remember: true,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item label="Mission Name" name="missionname">
                <Input
                  defaultValue={missionEditFormData.missionName}
                  onChange={(e) => {
                    setMissionEditFormData({
                      ...missionEditFormData,
                      missionName: e.target.value,
                    });
                  }}
                />
              </Form.Item>

              <Form.Item label="Instructions" name="instructions">
                <TextArea
                  rows={4}
                  defaultValue={missionEditFormData.instructions}
                  onChange={(e) => {
                    setMissionEditFormData({
                      ...missionEditFormData,
                      instructions: e.target.value,
                    });
                  }}
                />
              </Form.Item>
              <Form.Item label="Mission Type:" name="missionname">
                <Dropdown overlay={menu} placement="bottomLeft">
                  <Button type="primary" block>
                    {missType == "" ? MissionDetails.missionType : missType}

                    <DownOutlined />
                  </Button>
                </Dropdown>
              </Form.Item>

              <Checkbox.Group
                options={options}
                defaultValue={missionEditFormData.deliverables}
                onChange={(checkedValues) => {
                  console.log(checkedValues);
                  setMissionEditFormData({
                    ...missionEditFormData,
                    deliverables: checkedValues,
                  });
                }}
              />
            </Form>
          </Modal>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    userType: state.Auth.userdetails.userType,
    missions: state.Missions.missions,
    userDetails: state.Auth.userdetails,
    tenantId:
      state.Auth.userdetails.tenantId._id || state.Auth.userdetails.tenantId,
  };
};

export default connect(mapStateToProps, {
  loading,
  EditMission,
  clearMissionCreationState,
  logout,
})(MissionView);
