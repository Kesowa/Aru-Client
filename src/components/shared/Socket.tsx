import { useContext, useEffect, useRef, useState } from "react";
import io from "src/services/socketConnect";
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
  ShareAltOutlined,
  DownloadOutlined,
  GoogleOutlined,
  UserOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import * as htmlToImage from "html-to-image";
import moment from "moment";
import { API_URL, STATIC_URL } from "src/constants";
import { AuthContext } from "src/services/authUtils";

import "../Missions/Views/Live/index.less";
import OutcomeModal from "../Missions/Views/Details/Data/OutcomeModal";

const { Text, Title } = Typography;

function Socket() {
  const socket: any = useRef();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const { Auth } = useContext(AuthContext);

  //-----------------Notification Function-------------------------//
  const openNotification = (title, description, isAlert, data, type) => {
    notification[type]({
      message: title,
      description: description,
      onClick: () => {
        if (isAlert) {
          setSelectedAlert(data);
        }
      },
    });
  };

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
            openNotification(
              "Mission Completed!",
              `${missionID} mission has been completed!`,
              false,
              null,
              "success"
            );
          });

          socket.current.on("MISSION_LIVE", ({ missionID }) => {
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
            console.log("PILOT ASSIGNED!", mission, name, avatar);
          });

          // pilot assign
          socket.current.on("MISSION_DELETED", ({ id, name }) => {
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

  return (
    <div>
      <OutcomeModal
        index={0}
        data={[selectedAlert]}
        visible={!!selectedAlert}
        closeModal={() => {
          setSelectedAlert(null);
        }}
      />
    </div>
  );
}

export default Socket;
