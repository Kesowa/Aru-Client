import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import EmptyGraphics from "../../../../static/Alone-rafiki.svg";
import { faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";

import {
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
  Badge,
  notification,
  Empty,
  Table,
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import type { MenuProps, TabsProps } from "antd";
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
  DownloadOutlined,
} from "@ant-design/icons";

import Videos from "./Data/Videos";
import Outcomes from "./Data/Outcomes";
import Map from "./Data/map";
import Documents from "./Data/Documents";
import "./../../index.less";
import moment from "moment";
import TextArea from "antd/lib/input/TextArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import io from "socket.io-client";
import ImageDoc from "./Data/ImageDocs";
import ManageClients from "./Data/ManageClient";
import { API_URL, PUBLIC_URL, STATIC_URL } from "src/constants";
import Report_genration from "./Data/report_genration";
import { IPlotReportError } from "src/types/report";
import { PERMS } from "src/static/permissions";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

const { Paragraph } = Typography;
function MissionView() {
  const [MissionDetails, setMissionDetails] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams<any>();
  const history = useHistory();
  const [missionEditFormData, setMissionEditFormData] = useState<any>({});
  const [missionTypes, setMissionTypes] = useState<any>([]);
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
  const [showReportErrors, setShowReportErrors] = useState(false);
  const [reportErrors, setReportErrors] = useState<IPlotReportError | null>(
    null
  );
  const [reportErrorCSVPath, setReportErrorCSVPath] = useState("");

  const { Auth, logout } = useContext(AuthContext);
  const userDetails = Auth.userdetails;
  const userType = userDetails.userType;
  const tenantId = userDetails.tenantId._id || userDetails.tenantId;

  const { setLoading } = useContext(LoaderContext);

  //-----------------Notification Function-------------------------//
  const openNotification = (title, description, type) => {
    notification[type]({
      message: title,
      description: description,
    });
  };

  useEffect(() => {
    setLoading(true);
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

  const fetchPilots = async () => {
    const result = await http.get(`${apis.FETCH_ALL_PILOTS}`);
    if (result.data.data !== undefined) {
      setPilots(result.data.data);
      console.log("PIOLET", result.data.data); //here all are staff members
    }
  };

  const fetchMissionTypes = async () => {
    try {
      const result = await http.get(apis.GET_ALL_MISSION_TYPES);
      if (result.data.status) {
        setMissionTypes(result.data.data);
        console.info("Successfully fetched mission types");
      } else {
        message.error(result.data.message);
        console.log(
          `Error while fetching mission types: ${result.data.message}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getInitialData = async (id) => {
    const [userType, missionId] = id.split("-");
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

      if (!mission) {
        try {
          const result = await http.get(
            userType === "staff"
              ? `${apis.GET_MISSION_BY_ID}${missionId}`
              : `${apis.GET_MISSION_ID_CLIENT}${missionId}`
          );
          mission = result.data.data;
        } catch (err) {
          message.error("Something went wrong");
          AxiosErrorHandler(err, logout);
          setLoading(false);
          return;
        }
      }
      console.log("STAFF ERROR", result);
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
        missionTenantId: tenantId ? tenantId : "",
        userType: userDetails ? userDetails.userType : "",
        currentUser: userDetails ? userDetails.name : "",
        currentUserDetails: userDetails,
        refresh: vodRefresh,
        missionType: mission.missionType ? mission.missionType.name : "",
        isPublic: mission.isPublic,
        clients: [],
        size:
          mission.size < 1
            ? (mission.size * 1000).toFixed(1) + " KB"
            : mission.size >= 1 && mission.size <= 999
            ? mission.size.toFixed(1) + " MB"
            : (mission.size / 1000).toFixed(1) + " GB",
      };

      console.log("MIissss", details);
      console.log("clientsss", mission.clientId);

      // updating mission's client state
      if (mission.clientId?.length > 0) {
        console.log("clients!!", mission.clientId);
        const finalArray: any = [];
        mission.clientId.map((item: any) => {
          const obj = {
            key: item._id,
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

      setMissionDetails(details);

      // if user is able to edit mission, get mission types and pilot list and client list from backend
      if (userDetails.customPermissions.includes(PERMS.MISSION_UPDATE)) {
        await fetchPilots();
        await fetchMissionTypes();
      }

      // Set loading status to false
      setLoading(false);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      AxiosErrorHandler(err, logout);
      setLoading(false);
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
    setLoading(true);
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
      isPublic: missionEditFormData.isPublic,
    };
    console.log("Body : " + JSON.stringify(body));
    http
      .post(`${apis.EDIT_MISSION_BY_ID}`, body)
      .then((result) => {
        if (result.data.status) {
          setEditModalVisible(false);
          setMissionDetails({
            ...MissionDetails,
            missionName: body.name,
            instructions: body.description,
            missionType: missionTypes.find((mT) => mT._id === body.type).name,
            deliverables: body.deliverables,
            isPublic: body.isPublic,
          });
          setMissionEditFormData({});
          message.success("Mission Edited Successfully");
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        message.error("Something went wrong");
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });

    settypeflag(1);
  };

  const EditCancel = () => {
    setEditModalVisible(false);
  };

  const { Title, Text, Link } = Typography;
  const [activeKey, setactiveKey] = useState("1");
  // ++++++++++++++++++++++++++++++++++++++++++++++ E4 Data Card tabs +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const returnTabPaneItem = (id) => {
    const items: TabsProps["items"] = [
      {
        key: "1",
        label: <span>Map</span>,
        children: <Map id={id} mission={MissionDetails} />,
      },
      {
        key: "2",
        label: (
          <span>
            Documents{" "}
            <Badge
              style={{ backgroundColor: "#3D85FC" }}
              count={totalDocs}
            ></Badge>
          </span>
        ),
        children: (
          <Documents
            missionName={MissionDetails.missionName}
            missionId={MissionDetails.missionId}
            missionDetails={MissionDetails}
            refreshDoc={docRefresh}
            setRefreshDoc={setDocRefresh}
            setTotalDocs={setTotalDocs}
          />
        ),
      },
      {
        key: "3",
        label: (
          <span>
            Videos{" "}
            <Badge
              style={{ backgroundColor: "#3D85FC" }}
              count={totalVOD}
            ></Badge>
          </span>
        ),
        children: (
          <Videos
            missionDetails={MissionDetails}
            setCount={setTotalVOD}
            totalVOD={totalVOD}
          />
        ),
      },
      {
        key: "4",
        label: (
          <span>
            Outcomes{" "}
            <Badge
              style={{ backgroundColor: "#3D85FC" }}
              count={totalAlerts}
            ></Badge>
          </span>
        ),
        children: (
          <Outcomes
            id={id}
            setTotalAlerts={setTotalAlerts}
            missionDetails={MissionDetails}
          />
        ),
      },
      {
        key: "5",
        label: (
          <span>
            Images{" "}
            <Badge
              style={{ backgroundColor: "#3D85FC" }}
              count={totalImages}
            ></Badge>
          </span>
        ),
        children: (
          <ImageDoc
            missionName={MissionDetails.missionName}
            missionId={MissionDetails.missionId}
            missionDetails={MissionDetails}
            setTotalImages={setTotalImages}
          />
        ),
      },
    ];
    if (userDetails.customPermissions.includes(PERMS.UPLOAD_DOCUMENT)) {
      items.push({
        key: "6",
        label: <span>Report Generation </span>,
        children: (
          <Report_genration
            missionId={MissionDetails.missionId}
            missionDetails={MissionDetails}
            setShowReportErrors={setShowReportErrors}
            setReportErrors={setReportErrors}
            setReportErrorCSVPath={setReportErrorCSVPath}
          />
        ),
      });
    }
    if (MissionDetails.missionType === "Mapping") {
      return items;
    } else {
      return items.filter((item) => !["1", "2", "6"].includes(item.key));
    }
  };

  const DataTabs = ({ id }) => {
    return (
      <>
        <Tabs
          defaultActiveKey={activeKey}
          onChange={callback}
          items={returnTabPaneItem(id)}
        />
      </>
    );
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
    console.log("LOGIS", missionId);
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
          AxiosErrorHandler(err, logout);
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
          AxiosErrorHandler(err, logout);
        });
    }
  };

  //----------------Render edit mission details Button---------------------

  function renderMissionDetailsBtn() {
    console.log("User Type:", userType);
    console.log("Custom Permissions:", userDetails.customPermissions);
    if (userType === "tenant-staff" || userType === "tenant-client") {
      if (userDetails.customPermissions.includes(PERMS.MISSION_UPDATE)) {
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
              isPublic: MissionDetails.isPublic,
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
    if (userType === "tenant-staff" || userType === "tenant-client") {
      if (userDetails.customPermissions.includes(PERMS.MISSION_UPDATE)) {
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
    if (userType === "tenant-staff" || userType === "tenant-client") {
      if (userDetails.customPermissions.includes(PERMS.MISSION_UPDATE)) {
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
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <a
          rel="noopener noreferrer"
          href={`/dashboard/flight/edit/${MissionDetails.missionId}`}
        >
          Edit Flight
        </a>
      ),
      icon: <EditOutlined />,
    },
    {
      key: "2",
      label: (
        <a
          rel="noopener noreferrer"
          href={`/dashboard/flight/view/${MissionDetails.missionId}`}
        >
          View Flight
        </a>
      ),
      icon: <EyeOutlined />,
    },
  ];
  //----------------Render Edit Flight Button---------------------

  //----------------Render Assign Pilot Button---------------------

  function renderAssignPilotBtn(buttonText: string) {
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

  //--------------Render Generate Report Button-----------
  function generateReport() {
    setLoading(true);
    http
      .post(`${apis.CREATE_REPORT}`, {
        missionId: MissionDetails.missionId,
      })
      .then((result) => {
        console.log(result.data.message);
        if (result.data.status) {
          message.success(result.data.message);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  function renderGenerateReportButton() {
    if (["Completed", "Review"].includes(MissionDetails.missionStatus)) {
      return (
        <Button
          type="primary"
          style={{ marginLeft: "10px" }}
          onClick={generateReport}
        >
          Generate Report
        </Button>
      );
    } else return <></>;
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

  const handleAction: MenuProps["onClick"] = (e) => {
    console.log(e);
    const i = parseInt(e.key) - 1;
    setMissType(missionTypes[i].name);
    setMissionEditFormData({
      ...missionEditFormData,
      missionType: missionTypes[i]._id,
    });
  };
  console.log("HORRAY", id);
  /*--------------------Mission Type--------------------*/
  const menu: MenuProps["items"] = () => {
    const items: MenuProps["items"] = missionTypes.map(
      (mType: any, index: any) => {
        return {
          label: mType.name,
          key: (index + 1).toString(),
          icon: <VideoCameraOutlined />,
        };
      }
    );
    console.log("items", items);
    return items;
  };
  // +++++++++++++++ E9 Rendering Mission Deliverables and Pilot badge ++++++++++++++++++++++++
  function MissionDeliverables(items: any[]) {
    return items.map((item, idx: number) => (
      <Tag color="green" key={(idx + 1).toString()}>
        {item}
      </Tag>
    ));
  }

  function assignPilot() {
    setLoading(true);
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
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
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

  function renderPilotAssignModal() {
    return (
      <Modal
        title="Assign Pilot"
        open={isPilotModalVisible}
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
              {pilots.map((pilot: unknown, idx: number) => (
                <Row
                  key={(idx + 1).toString()}
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
    return (
      <>
        {(initialPilot.name || MissionDetails.pilotAssigned !== "no-pilot") && (
          <>
            <Avatar
              key="2"
              size="large"
              icon={<UserOutlined />}
              src={
                initialPilot.avatar
                  ? initialPilot.avatar
                  : STATIC_URL + MissionDetails.pilotPhoto
              }
            />
            <div className="pilot-name">
              <Title level={5} className="designation">
                {initialPilot.name
                  ? initialPilot.name
                  : MissionDetails.pilotAssigned}
              </Title>
              <Text type="secondary">Pilot assigned</Text>
            </div>
          </>
        )}
        {userDetails.customPermissions.includes(PERMS.MISSION_UPDATE) && (
          <div className="pilot-assign-btn">
            {renderAssignPilotBtn(
              initialPilot.name || MissionDetails.pilotAssigned !== "no-pilot"
                ? "Re-Assign Pilot"
                : "Assign Pilot"
            )}
            {renderPilotAssignModal()}
          </div>
        )}
      </>
    );
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
    if (MissionDetails.missionId && !socket.current) {
      socket.current = io(
        `${API_URL}/stream/mission-specific?missionID=${MissionDetails.missionId}`
      );

      const eventHandlers = {
        PROCESS_VIDEO_STARTED: (data) => {
          console.log("Video processing started: ", data);
          openNotification(
            "Video Processing!",
            `Processing ${data.videoName}`,
            "info"
          );
        },
        PROCESS_VIDEO_FINISHED: (data) => {
          console.log("Video processing finished: ", data);
          openNotification(
            "Finished Processing!",
            `Processing ${data.videoName} has been complete!`,
            "success"
          );
          setVodRefresh(true);
        },
        POINTCLOUD_EXTRACTION_START: (data) => {
          console.log("Extraction started: ", data);
          openNotification(
            "Extracting now...",
            `Extracting point clouds`,
            "info"
          );
        },
        POINTCLOUD_EXTRACTION_COMPLETED: (data) => {
          console.log("Extraction complete!: ", data);
          setDocRefresh(true);
          openNotification(
            "Extraction Complete!",
            `The point cloud has been extracted.`,
            "success"
          );
        },
        REPORT_GENERATION_COMPLETE: (data) => {
          console.log("Report successfully generated!", data);
          openNotification(
            "Report Generated!",
            `Report generated: ${data.name}, for mission ${data.missionId}`,
            "success"
          );
          setDocRefresh(true);
          setTotalDocs((prev) => prev + 1);
        },
        REPORT_GENERATION_FAILED: (data) => {
          console.log("Report generation failed!", data);
          openNotification(
            "Failed to generate Report!",
            "Report generation failed",
            "error"
          );
        },
      };

      Object.keys(eventHandlers).forEach((eventName) => {
        socket.current.on(eventName, eventHandlers[eventName]);
      });

      return () => {
        if (socket.current) {
          Object.keys(eventHandlers).forEach((eventName) => {
            socket.current.off(eventName, eventHandlers[eventName]);
          });
          socket.current.disconnect();
          socket.current = null;
        }
      };
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
                {MissionDetails.missionType}
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
              <Descriptions.Item label="Size">
                {MissionDetails.size}
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
                    </>,
                  ]}
                >
                  <Text type="secondary">Instructions</Text>
                  <p>{MissionDetails.instructions}</p>
                  <Text type="secondary">Deliverables</Text>
                  <p style={{ marginTop: "8px" }}>
                    {MissionDeliverables(MissionDetails.deliverables)}
                  </p>
                  {MissionDetails.isPublic && (
                    <>
                      <Text type="secondary" style={{ marginTop: "8px" }}>
                        Public Map URL:{" "}
                        <a>
                          <Paragraph
                            copyable
                          >{`${PUBLIC_URL}/map/${MissionDetails.missionTenantId}/${MissionDetails.missionId}`}</Paragraph>
                        </a>
                      </Text>
                      <p></p>
                    </>
                  )}
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
                    menu={{
                      items: userDetails.customPermissions.includes(
                        PERMS.FLIGHT_UPDATE
                      )
                        ? items
                        : [items[1]],
                    }}
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
                loading={setLoading}
                missionId={id.split("-")[1]}
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
            open={isModalVisible}
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
            open={EditModalVisible}
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
              <Form.Item label="Public" name="isPublic">
                <Checkbox
                  checked={missionEditFormData.isPublic}
                  onChange={(e) => {
                    setMissionEditFormData({
                      ...missionEditFormData,
                      isPublic: e.target.checked,
                    });
                  }}
                />
              </Form.Item>
              <Form.Item label="Mission Type:" name="missionname">
                <Dropdown
                  menu={{ items: menu(), onClick: handleAction }}
                  placement="bottomLeft"
                >
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

          {/* +++++++++++++++++++++++++++++++++++++++++++++++++++ Report Generation Errors Modal ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
          <Modal
            title={[
              <Title level={4}>
                <ExceptionOutlined style={{ fontSize: "24px" }} />
                &nbsp;&nbsp;&nbsp;Report generation failed!
              </Title>,
            ]}
            open={showReportErrors}
            onCancel={() => {
              setShowReportErrors(false);
            }}
            footer={[
              <Button
                key="back"
                onClick={() => {
                  setShowReportErrors(false);
                }}
              >
                Close
              </Button>,
              <Button
                key="submit"
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => {
                  window.open(`${STATIC_URL}${reportErrorCSVPath}`);
                }}
              >
                Download CSV
              </Button>,
            ]}
            width={"50vw"}
          >
            <Title level={5}>
              The following components were either missing or had invalid value
            </Title>
            {reportErrors && (
              <Table
                bordered
                scroll={{
                  x: "max-content",
                  y: 440,
                }}
                columns={[
                  {
                    title: "Error Location",
                    dataIndex: "location",
                    width: "20%",
                  },
                  {
                    title: "Invalid / Missing Component",
                    dataIndex: "component",
                    width: "20%",
                  },
                  {
                    title: "Feature Indices",
                    dataIndex: "fIdx",
                  },
                ]}
                dataSource={[
                  ...reportErrors.layers.map((layerType) => {
                    return {
                      location: "Mission",
                      component: `Layer of type ${layerType}`,
                      fIdx: "N/A",
                    };
                  }),
                  ...Object.keys(reportErrors.plots).map((key) => {
                    if (reportErrors.plots[key].length > 0) {
                      return {
                        location: "Plot Layer",
                        component: `${key} property`,
                        fIdx: reportErrors.plots[key].join(","),
                      };
                    }
                  }),
                  ...Object.keys(reportErrors.blocks).map((key) => {
                    if (reportErrors.blocks[key].length > 0) {
                      return {
                        location: "Action Area Layer",
                        component: `${key} property`,
                        fIdx: reportErrors.blocks[key].join(","),
                      };
                    }
                  }),
                  ...Object.keys(reportErrors.buildings).map((key) => {
                    if (reportErrors.buildings[key].length > 0) {
                      return {
                        location: "Building Footprint Layer",
                        component: `${key} property`,
                        fIdx: reportErrors.buildings[key].join(","),
                      };
                    }
                  }),
                ].filter((ele) => !!ele)}
                pagination={false}
              />
            )}
          </Modal>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default MissionView;
