import { useContext, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import io from "socket.io-client";
import {
  Button,
  notification,
  Modal,
  Row,
  Col,
  Image,
  Typography,
  Avatar,
  Tooltip,
} from "antd";
import {
  addMission,
  changeMissionStatus,
  refreshMissions,
} from "../../actions/missionActions";
import {
  ShareAltOutlined,
  DownloadOutlined,
  GoogleOutlined,
  UserOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import * as htmlToImage from "html-to-image";
import moment from "moment";
import { assignPilot } from "../../actions/flightAction";
import { deleteMission } from "../../actions/missionActions";
import { API_URL, STATIC_URL } from "src/constants";
import { AuthContext } from "src/services/authUtils";

const { Text, Title } = Typography;

function Socket(props: any) {
  const socket: any = useRef();
  const [refresh, setrefresh] = useState(false);
  const [reload, setReload] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const { Auth } = useContext(AuthContext);

  //-----------------Notification Function-------------------------//
  const openNotification = (title, description, isAlert, data, type) => {
    notification[type]({
      message: title,
      description: description,
      onClick: () => {
        if (isAlert) {
          showModal(
            data._id,
            data.missionId,
            data.flightId,
            data.createdBy.name,
            data.createdBy.avatar,
            data.createdAt,
            STATIC_URL + data.image,
            data.location,
            data.locationName ? data.locationName : "Default Location",
            data.pcount
          );
        }
      },
    });
  };

  useEffect(() => {
    if (reload) {
      setrefresh(!refresh);
      setTimeout(() => {
        props.refreshMissions(!refresh);
        setReload(null);
      }, 50);
    }
  }, [reload]);

  //-----------------GMAP link Copy notification-------------------------//
  const showNotification = (copiedText, placement) => {
    const el = document.createElement("textarea");
    el.value = copiedText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    notification.info({
      message: `Link Copied!`,
      description:
        "Google map location link has been copied to your clipboard.",
      placement,
    });
  };

  //---------Outcome Card Modal---------------------------------------------//
  function showModal(
    id: any,
    mID: any,
    fID: any,
    crBy: any,
    crByPhoto: any,
    crAt: any,
    thumb: any,
    coor: any,
    geoCode: any,
    pcount: any
  ) {
    console.log(id, mID, crBy, crAt, thumb);
    Modal.info({
      title: "Outcome ID: " + id,
      content: (
        <div>
          <Row style={{ marginTop: 16 }}>
            <Col span={17}>
              <div id="image" className="outcome-view">
                <Image
                  style={{ width: "100%", height: "auto", cursor: "pointer" }}
                  src={thumb}
                />
                <div className="p-mission">
                  <Row>
                    <Text className="text">mission ID: {mID}</Text>
                  </Row>
                  <Row>
                    <Text className="text">flight ID: {fID}</Text>
                  </Row>
                  <Row>
                    <Text className="text">People Detected: {pcount}</Text>
                  </Row>
                </div>
                <div className="preview-location-name">
                  <Row>
                    <Title className="p-name" level={4}>
                      {geoCode}
                    </Title>
                  </Row>
                  {coor.lat === 0 ? (
                    <></>
                  ) : (
                    <Row>
                      <Text className="p-coord">
                        {coor.lat}, {coor.long}
                      </Text>
                    </Row>
                  )}
                </div>
                {coor.lat === 0 ? (
                  <></>
                ) : (
                  <div className="static-map-div">
                    <a
                      href={`https://www.google.com/maps/?q=${coor.lat},${coor.long}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        className="static-map"
                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${coor.lat},${coor.long}&zoom=16&size=200x130&markers=size:mid|color:red|${coor.lat},${coor.long}&maptype=roadmap&key=AIzaSyCYWROYTFQ3XH4bhhLJnmJSV-0k9a-PHY8`}
                      />
                    </a>
                  </div>
                )}
              </div>
            </Col>
            <Col span={7}>
              <Row style={{ marginLeft: "8px" }}>
                <Title level={5}>
                  <ShareAltOutlined style={{ fontSize: "24px" }} />
                  &nbsp;&nbsp;&nbsp;Share
                </Title>
              </Row>
              <Row>
                &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;
                <Tooltip placement="bottom" title="download image">
                  <Button
                    type="primary"
                    onClick={() => {
                      setDownloadLoading(true);
                      htmlToImage
                        .toPng(document.getElementById("image")!)
                        .then(function (dataUrl) {
                          const a = document.createElement("a");
                          a.href = dataUrl;
                          a.download = `${geoCode}_3355.png`;
                          a.click();
                          setDownloadLoading(false);
                        });
                    }}
                    shape="round"
                    icon={
                      downloadLoading ? (
                        <LoadingOutlined />
                      ) : (
                        <DownloadOutlined />
                      )
                    }
                    size="large"
                  />
                </Tooltip>
                &nbsp;&nbsp;
                {coor.lat === 0 ? (
                  <></>
                ) : (
                  <Tooltip placement="bottom" title="Google map link">
                    <Button
                      type="default"
                      onClick={() =>
                        showNotification(
                          `https://www.google.com/maps/?q=${coor.lat},${coor.long}`,
                          "bottomRight"
                        )
                      }
                      shape="round"
                      icon={<GoogleOutlined />}
                      size="large"
                    >
                      Copy Link
                    </Button>
                  </Tooltip>
                )}
              </Row>
              <div className="outcome-specific-view-info">
                <Row>
                  <Text type="secondary">Inference generated</Text>
                </Row>
                <Row>
                  <Text strong>{pcount}</Text>
                </Row>
                <Row>
                  <Text type="secondary">Mission ID</Text>
                </Row>
                <Row>
                  <Text strong>{mID}</Text>
                </Row>
                <Row style={{ marginTop: 8 }}>
                  <Text type="secondary">Location</Text>
                </Row>
                <Row>
                  <Text strong>{geoCode}</Text>
                </Row>
                {coor.lat === 0 ? (
                  <></>
                ) : (
                  <>
                    <Row style={{ marginTop: 8 }}>
                      <Text type="secondary">Coordinates</Text>
                    </Row>
                    <Row>
                      <Text keyboard copyable>
                        {`${coor.lat}, ${coor.long}`}
                      </Text>
                    </Row>
                  </>
                )}
                <div className="outcome-specific-view-created-by">
                  <Row>
                    <Text type="secondary">Snapshot Captured by</Text>
                  </Row>
                  <Row>
                    <div
                      className="pilot-profile-badge"
                      style={{ marginTop: 8 }}
                    >
                      <Avatar
                        key="2"
                        size="large"
                        icon={<UserOutlined />}
                        src={STATIC_URL + crByPhoto}
                      />
                      <div className="pilot-name">
                        <Title level={5} className="designation">
                          {crBy}
                        </Title>
                        <Text type="secondary">
                          {moment(crAt).format("MMMM Do YYYY, h:mm:ss a")}
                        </Text>
                      </div>
                    </div>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      ),
      centered: true,
      width: 1200,
      onOk() {},
    });
  }

  //-------------------socket connection for notifications---------------------------------///
  useEffect(() => {
    if (Auth.userdetails) {
      if (
        Auth.userdetails.userType === "tenant-root" ||
        Auth.userdetails.userType === "tenant-staff"
      ) {
        if (!socket.current) {
          socket.current = io(
            `${API_URL}/stream/notification?tenantID=${
              Auth.userdetails.tenantId._id
                ? Auth.userdetails.tenantId._id
                : Auth.userdetails.tenantId
            }`
          );
          // New mission added
          socket.current.on("MISSION_ADDED", ({ mission, flight }) => {
            setReload(mission);
            openNotification(
              "New Mission Added!",
              `Mission with name "${mission.name}" has been added.`,
              false,
              null,
              "info"
            );
          });

          // Status changed
          socket.current.on("MISSION_COMPLETED", ({ missionID }) => {
            props.changeMissionStatus({
              status: "Completed",
              id: missionID,
            });
            openNotification(
              "Mission Completed!",
              `${missionID} mission has been completed!`,
              false,
              null,
              "success"
            );
          });

          socket.current.on("MISSION_LIVE", ({ missionID }) => {
            props.changeMissionStatus({
              status: "Live",
              id: missionID,
            });
            openNotification(
              "Mission is Live!",
              `MissionID: ${missionID} went live!`,
              false,
              null,
              "info"
            );
          });

          socket.current.on("ALERT_CREATED", (data) => {
            openNotification(
              "Alert Created!",
              `New alert has been captured at ${data.locationName}. Click to view now!`,
              true,
              data,
              "success"
            );
          });

          // pilot assign
          socket.current.on("PILOT_ASSIGNED", ({ mission, name, avatar }) => {
            console.log(mission, name, avatar);
            props.assignPilot({
              mission,
              name,
              avatar,
            });
          });

          // pilot assign
          socket.current.on("MISSION_DELETED", ({ id, name }) => {
            setReload(id);
            openNotification(
              "Mission Deleted",
              `Mission: ${name} is deleted!`,
              false,
              null,
              "success"
            );
          });
        }
      }
    } else {
      if (socket.current) {
        socket.current.off("MISSION_ADDED");
        socket.current.off("MISSION_COMPLETED");
        socket.current.off("MISSION_LIVE");
        socket.current.off("PILOT_ASSIGNED");
        socket.current.off("MISSION_DELETED");
        socket.current.off("ALERT_CREATED");
        socket.current = null;
      }
    }
  }, [Auth]);

  return <div></div>;
}

export default connect(null, {
  addMission,
  changeMissionStatus,
  assignPilot,
  deleteMission,
  refreshMissions,
})(Socket);
