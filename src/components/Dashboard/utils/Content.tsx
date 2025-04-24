import { useState, useEffect, useRef, useContext } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  Row,
  Col,
  Typography,
  Card,
  Statistic,
  Spin,
  Modal,
  Result,
  Skeleton,
} from "antd";
import { Link } from "react-router-dom";
import goToMap from "../../../assets/go-to-map.svg";
import mapImg from "../../../assets/world.svg";
import "./../index.less";
import { ImportOutlined } from "@ant-design/icons";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import io from "src/services/socketConnect";
import DecideIcon from "../../../services/decideIcon";
import QRCode from "qrcode";
import {
  API_URL,
  COG_URL,
  LIVE_URL,
  PUBLIC_URL,
  RTMP_URL,
  STATIC_URL,
} from "src/constants";
import { getSideBar } from "src/static/sideBarOptions";
import { AuthContext } from "src/services/authUtils";
import { getUserExpirationInfo, ExpiryInfo } from "src/services/expiryUpdate";


const { Title, Text } = Typography;
ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [liveMissions, setLiveMissions] = useState(0);
  const [UpcomingMissions, setUpcomingMissions] = useState(0);
  const [CompletedMissions, setCompletedMissions] = useState(0);
  const [alertSocketEvent, setAlertSocketEvent] = useState("");
  const [visible, setVisible] = useState(false);
  const [qrCode, setqrCode] = useState("");
  const [storage, setStorage] = useState<any>({});
  const socket: any = useRef();
  const [statsRefresh, setStatsRefresh] = useState(true);
  const [expiryInfo, setExpiryInfo] = useState<ExpiryInfo | null>(null);
  const [totalMissionsOfTenant, setTotalMissionsOfTenant] = useState(null);
  const [latestMission,setLatestMission] = useState(null);

  const { Auth, logout } = useContext(AuthContext);

  ChartJS.register(ArcElement, Tooltip, Legend);
  useEffect(() => {
    if (visible) {
      getQrCode();
    }
  }, [visible]);

  const getQrCode = () => {
    const data = {
      BASE_SERVER_URL: PUBLIC_URL,
      BASE_STREAM_URL: LIVE_URL,
      COG_SERVER_URL: COG_URL,
      RTMP_URL: RTMP_URL,
      API_URL: API_URL,
      CDN_URL: STATIC_URL,
    };
    QRCode.toDataURL(JSON.stringify(data), function (err, url) {
      setqrCode(url);
    });
  };

  useEffect(() => {
    const fetchExpiry = async () => {
      const info = await getUserExpirationInfo(Auth.userdetails);
      setExpiryInfo(info);
    };
  
    fetchExpiry();
  }, [Auth.userdetails]);
  

  const connectToAppModal = () => {
    return (
      <Modal
        title="Connect To App"
        centered
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={1000}
      >
        <Row>
          <Col span={16}>
            <Title
              className="card-title"
              style={{ color: "#33324E" }}
              level={2}
            >
              {"To connect the app to the platform"}
            </Title>

            <div style={{ marginLeft: "10px", marginTop: "50px" }}>
              <Title
                className="card-title"
                style={{ color: "#242B2E" }}
                level={4}
              >
                1. &nbsp;&nbsp;Open Aru app on your phone
              </Title>
              <Title
                className="card-title"
                style={{ color: "#242B2E" }}
                level={4}
              >
                2. &nbsp;&nbsp;Tap Menu and select connect to ARU
              </Title>
              <Title
                className="card-title"
                style={{ color: "#242B2E" }}
                level={4}
              >
                3. &nbsp;&nbsp;Point your phone to this screen to capture the
                code
              </Title>
            </div>
          </Col>
          <Col span={8}>
            <img src={qrCode} style={{ width: "100%" }} />
          </Col>
        </Row>
      </Modal>
    );
  };

  //----------storage stats-------------------------------------

  function fetchTenantStats() {
    setStatsRefresh(true);
    http
      .get(`${apis.GET_TENANT_STATS}`)
      .then((res: any) => {
        setStorage(res.data);
      })
      .catch((err: any) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => setStatsRefresh(false));
  }

  function getDataFormat(size: any) {
    if (size >= 1000) {
      return "GB";
    } else {
      return "MB";
    }
  }

  useEffect(() => {
    if (["tenant-staff", "tenant-root"].includes(Auth.userdetails.userType)) {
      fetchTenantStats();
    }
  }, [Auth.userdetails]);

  const renderStorageStats = () => {
    console.log("Fetched stats", storage);
    const storageRes = storage;
    const videos: any = storageRes.data.allVodSize;
    const alerts: any = storageRes.data.allAlertSize;
    const layers: any = storageRes.data.allLayerSize;
    const documents: any = storageRes.data.allDocumentsSize;
    const VideoCount: any = storageRes.data.actualVodCount;
    const AlertCount: any = storageRes.data.actualAlertCount;
    const LabelCount: any = storageRes.data.actualLayerCount;
    // doughnutLabelsLine plugin

    const format = getDataFormat((videos + alerts + layers + documents) / 4);
    const data: any = {
      labels: [
        `Videos (${format}) (${VideoCount})`,
        `Alerts (${format}) (${AlertCount})`,
        `Layers (${format}) (${LabelCount})`,
        `Documents (${format})`,
      ],
      datasets: [
        {
          label: "# of Size",
          data: [
            format == "GB" ? videos / 1000 : videos,
            format == "GB" ? alerts / 1000 : alerts,
            format == "GB" ? layers / 1000 : layers,
            format == "GB" ? documents / 1000 : documents,
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
    return (
      <div style={{ padding: "10px" }}>
        {videos == 0 && alerts == 0 && layers == 0 && documents == 0 ? (
          <>
            <Result
              status="info"
              title="No data!"
              subTitle="Please populate some data in order to storage statistics chart"
            />
          </>
        ) : (
          <div
            style={{
              width: "380px",
              height: "auto",
              margin: "auto",
            }}
          >
            <Doughnut data={data} draggable={true} width={"200px"} />
          </div>
        )}
      </div>
    );
  };

  const dashboardShortcuts = () => {
    if (Auth.userdetails.userType === "tenant-staff") {
      return getSideBar(Auth.userdetails).map((item) => (
        <>
          <Col md={12}>
            <Link to={item.link} key="1">
              <Card className="shortcut-card" bordered={true}>
                <div className="card-icon">{DecideIcon(item.icon)}</div>
                <Title className="card-title" level={3}>
                  {item.text}
                </Title>
              </Card>
            </Link>
          </Col>
        </>
      ));
    } else if (Auth.userdetails.userType === "tenant-client") {
      return (
        <>
          <Col md={6}>
            <Link to={`/dashboard/client/missions`} key="1">
              <Card className="shortcut-card" bordered={true}>
                <div className="card-icon">
                  {DecideIcon("BorderInnerOutlined")}
                </div>
                <Title className="card-title" level={3}>
                  {"Missions"}
                </Title>
              </Card>
            </Link>
          </Col>
        </>
      );
    } else {
      return (
        <>
          <Col md={12}>
            <Link to="/dashboard/missions/create" key="1">
              <Card className="shortcut-card" bordered={true}>
                <div className="card-icon">{DecideIcon("DiffOutlined")}</div>
                <Title className="card-title" level={3}>
                  Create Mission
                </Title>
              </Card>
            </Link>
          </Col>
          <Col md={12}>
            <Link to="/dashboard/missions" key="2">
              <Card className="shortcut-card" bordered={true}>
                <div className="card-icon">
                  {DecideIcon("BorderInnerOutlined")}
                </div>
                <Title className="card-title" level={3}>
                  Missions
                </Title>
              </Card>
            </Link>
          </Col>
          <Col md={12}>
            <Link to="dashboard/tenant/user/list" key="3">
              <Card className="shortcut-card" bordered={true}>
                <div className="card-icon">{DecideIcon("UserOutlined")}</div>
                <Title className="card-title" level={3}>
                  Users
                </Title>
              </Card>
            </Link>
          </Col>
          <Col md={12}>
            <Link to="/dashboard/tenant/user-group/list" key="4">
              <Card className="shortcut-card" bordered={true}>
                <div className="card-icon">
                  {DecideIcon("UnorderedListOutlined")}
                </div>
                <Title className="card-title" level={3}>
                  User groups
                </Title>
              </Card>
            </Link>
          </Col>
          <Col md={12}>
            <Link to="/dashboard/data" key="5">
              <Card className="shortcut-card" bordered={true}>
                <div className="card-icon">
                  {DecideIcon("DatabaseOutlined")}
                </div>
                <Title className="card-title" level={3}>
                  Data
                </Title>
              </Card>
            </Link>
          </Col>
        </>
      );
    }
  };
  function renderSuperAdminDashboard() {
    return <h1>Test</h1>;
  }
  //socket listening to re-render component
  useEffect(() => {
    if (
      Auth.userdetails.userType === "tenant-root" ||
      Auth.userdetails.userType === "tenant-staff"
    ) {
      if (Auth.userdetails.tenantId._id) {
        console.log("tenantID>_id");
        if (!socket.current) {
          socket.current = io(
            `${API_URL}/stream/notification?tenantID=${Auth.userdetails.tenantId._id}`
          );
          //new mission listener
          socket.current.on("MISSION_ADDED", ({ mission, flight }) => {
            setAlertSocketEvent("refresh-dashboard");
          });
          //status change listener
          socket.current.on("MISSION_COMPLETED", ({ missionID }) => {
            setAlertSocketEvent("refresh-dashboard");
          });
          socket.current.on("MISSION_LIVE", ({ missionID }) => {
            setAlertSocketEvent("refresh-dashboard");
          });
        }
      } else if (Auth.userdetails.tenantId) {
        console.log("tenantID");
        if (!socket.current) {
          socket.current = io(
            `${API_URL}/stream/notification?tenantID=${Auth.userdetails.tenantId}`
          );
          //new mission listener
          socket.current.on("MISSION_ADDED", ({ mission, flight }) => {
            setAlertSocketEvent("refresh-dashboard");
          });
          //status change listener
          socket.current.on("MISSION_COMPLETED", ({ missionID }) => {
            setAlertSocketEvent("refresh-dashboard");
          });
          socket.current.on("MISSION_LIVE", ({ missionID }) => {
            setAlertSocketEvent("refresh-dashboard");
          });
        }
      }
    }
  }, [Auth.userdetails]);

  //fetch missions filtered to show as counter
  function fetchFilterMissions(tenantID: any) {
    //here
    if (
      Auth.userdetails.userType == "tenant-root" ||
      Auth.userdetails.userType == "tenant-staff"
    ) {
      setAlertSocketEvent("");
      setIsLoading(true);
      http
        .get(`${apis.GET_ALL_MISSIONS_FOR_TENANT}`, {
          params: {
            id: tenantID,
            page: 1,
            limit: 10,
            filter: "all",
            sort: "name:descend",
          },
        })
        .then((result) => {
          const missions = result.data.data;
          const latestMission = missions.reduce((latest, current) => {
            return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
          });
          setLatestMission(latestMission);
          console.log(result.data.missionCount);
          if (result.data.missionCount.length > 0) {
            let totalCount = 0;
            result.data.missionCount.map((i: any) => {
              switch (i._id) {
                case "Upcoming":
                  setUpcomingMissions(i.count);
                  break;
                case "Live":
                  setLiveMissions(i.count);
                  break;
                case "Completed":
                  setCompletedMissions(i.count);
                  break;
                default:
              }
            });

          //get the mission count 
          totalCount = result.data.missionCount.reduce(
            (acc: number, item: any) => acc + item.count,
            0
          );
          setTotalMissionsOfTenant(totalCount);
          } else {
            setLiveMissions(0);
            setUpcomingMissions(0);
            setCompletedMissions(0);
          }
        })
        .catch((err) => {
          console.log(err);
          if (err?.response?.status == 500) {
            AxiosErrorHandler(err, logout);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      return;
    }
  }

  //fetch filtered missions based on socket events
  useEffect(() => {
    fetchFilterMissions(
      Auth.userdetails?.tenantId?._id || Auth.userdetails?.tenantId
    );
  }, [alertSocketEvent]);

  // Render dashboard content for tenant root and tenant staff
  function renderDashboardContents() {
    //++++++++++++++++++++++++++++++++++++++++++++++++++RenderDashboardContent++++++++++++++++++++++++
    return (
      <div className="dashboard-wrapper">
        <Row gutter={[16, 16]} className="status-cards">
          <Col md={8}>
            <Card className="status-card" style={{ height: "115px" }}>
              {isLoading ? (
                <Skeleton paragraph={{ rows: 1 }} active />
              ) : (
                <Statistic
                  title="Live Missions"
                  value={liveMissions}
                  valueStyle={{ color: "#3b86ff" }}
                />
              )}
            </Card>
          </Col>
          <Col md={8}>
            <Card className="status-card" style={{ height: "115px" }}>
              {isLoading ? (
                <Skeleton paragraph={{ rows: 1 }} active />
              ) : (
                <Statistic
                  title="Upcoming Missions"
                  value={UpcomingMissions}
                  valueStyle={{ color: "#ff6565" }}
                />
              )}
            </Card>
          </Col>
          <Col md={8}>
            <Card className="status-card" style={{ height: "115px" }}>
              {isLoading ? (
                <Skeleton paragraph={{ rows: 1 }} active />
              ) : (
                <Statistic
                  title="Completed Missions"
                  value={CompletedMissions}
                  valueStyle={{ color: "#36a556" }}
                />
              )}
            </Card>
          </Col>
        </Row>

        <Row align="middle" gutter={8} wrap={false}>
          <Col>
            <Title level={3} className="welcome-title" style={{ margin: 0 }}>
              Welcome back {Auth.userdetails.name}!
            </Title>
          </Col>
          {expiryInfo?.isExpiringSoon && (
            <Col>
              <span style={{ color: "#fa8c16", fontWeight: 1000 }}>
                (Your account is expiring in {expiryInfo.daysLeft} days.{" "}
                <a
                  href={`mailto:info@kesowa.com?subject=Renewal Request&body=Hi Team,%0D%0A%0D%0AMy account is expiring in ${expiryInfo.daysLeft} days. Please assist with the renewal process.`}
                  style={{ color: "#fa541c", textDecoration: "underline" }}
                >
                  Click here for renewal
                </a>
                )
              </span>
            </Col>
          )}
        </Row>
        {latestMission && (
          <Row align="middle" style={{ marginTop: 10, marginBottom: 10 }}>
            <Col>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>
                <span role="img" aria-label="mission">
                  ⚡
                </span>{" "}
                <strong>Your Latest Mission :</strong>{" "}
                <Link
                  to={{
                    pathname: `/dashboard/mission/view/staff-${latestMission._id}`,
                    state: { openLocationTab: true },
                  }}
                >
                  {latestMission.name}
                </Link>{" "}
                •{" "}
                <span>
                  {new Date(latestMission.createdAt).toLocaleDateString(
                    "en-IN"
                  )}
                </span>{" "}
                •{" "}
                <span
                  style={{
                    color:
                      latestMission.status === "Completed"
                        ? "#52c41a"
                        : latestMission.status === "Pending"
                        ? "#faad14"
                        : latestMission.status === "Live"
                        ? "#1890ff"
                        : "#ff4d4f",
                    fontWeight: 600,
                  }}
                >
                  {latestMission.status}
                </span>
              </Text>
            </Col>
          </Row>
        )}
        <Row>
          <Col span={12}>
            <Title className="shortcuts-title" level={4}>
              <ImportOutlined /> Shortcuts
            </Title>
            <Row gutter={[16, 16]}>
              {dashboardShortcuts()}
              <Col md={12}>
                <Card
                  className="shortcut-card"
                  style={{ cursor: "pointer" }}
                  bordered={true}
                  onClick={() => setVisible(true)}
                >
                  <div className="card-icon">
                    {DecideIcon("MobileOutlined")}
                  </div>
                  <Title className="card-title" level={3}>
                    Connect to app
                  </Title>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row gutter={[16, 16]}>
              <Title
                className="shortcuts-title"
                level={4}
                style={{ marginLeft: "8px" }}
              >
                <ImportOutlined /> My Storage stats
              </Title>
            </Row>
            <>
              {statsRefresh ? (
                <Spin spinning={statsRefresh} tip="loading stats...">
                  <Row style={{ height: "200px" }}></Row>
                </Spin>
              ) : (
                <>{renderStorageStats()}</>
              )}
            </>
            <Row gutter={[16, 16]} style={{ marginTop: 3 }}>
              <Col span={24}>
                <Title
                  className="shortcuts-title"
                  level={4}
                  style={{ marginLeft: "8px", marginTop: "2px" }}
                >
                  <ImportOutlined /> Quick view Mission Location{" "}
                  <span style={{ fontSize: "0.8em", fontWeight: "normal" }}>
                    (Project Locations : {totalMissionsOfTenant})
                  </span>
                </Title>
                <Link
                  to={{
                    pathname: "/dashboard/data",
                    state: { openLocationTab: true },
                  }}
                >
                  <div
                    className="map-button"
                    style={{
                      position: "relative",
                      marginLeft: "10px",
                      height: "150px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={mapImg}
                      alt="Map preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <div className="map-overlay">
                      <img
                        src={goToMap}
                        alt="Go to Map"
                        style={{ width: "90px", height: "90px" }}
                      />
                      <span
                        style={{
                          marginTop: "8px",
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "25px",
                        }}
                      >
                        Map
                      </span>
                    </div>
                  </div>
                </Link>
              </Col>
            </Row>
          </Col>
        </Row>

        {connectToAppModal()}
      </div>
    );
  }

  function renderClientDashboardContents() {
    //++++++++++++++++++++++++++++++++++++++++++++++++++RenderDashboardContent++++++++++++++++++++++++
    return (
      <div className="dashboard-wrapper">
        <Row align="middle" gutter={8} wrap={false}>
          <Col>
            <Title level={3} className="welcome-title" style={{ margin: 0 }}>
              Welcome back {Auth.userdetails.name}!
            </Title>
          </Col>
          {expiryInfo?.isExpiringSoon && (
            <Col>
              <span style={{ color: "#fa8c16", fontWeight: 1000 }}>
                (Your account is expiring in {expiryInfo.daysLeft} days.{" "}
                <a
                  href={`mailto:info@kesowa.com?subject=Renewal Request& body=Hi Team,%0D%0A%0D%0AMy account is expiring in ${expiryInfo.daysLeft} days. Please assist with the renewal process.`}
                  style={{ color: "#fa541c", textDecoration: "underline" }}
                >
                  Click here for renewal
                </a>
                )
              </span>
            </Col>
          )}
        </Row>
        <Title className="shortcuts-title" level={4}>
          <ImportOutlined /> Shortcuts
        </Title>

        <Row gutter={[16, 16]}>{dashboardShortcuts()}</Row>
      </div>
    );
  }

  if (
    Auth.userdetails.userType === "tenant-staff" ||
    Auth.userdetails.userType === "tenant-root"
  ) {
    console.log("Tenant user");
    return <>{renderDashboardContents()}</>;
  } else if (Auth.userdetails.userType === "tenant-client") {
    console.log("client user");
    return <>{renderClientDashboardContents()}</>;
  } else {
    console.log("super admin");
    return <>{renderSuperAdminDashboard()}</>;
  }
}

export default DashboardContent;
