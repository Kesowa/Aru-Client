import { useState, useEffect, useContext } from "react";
import { Row, Col, Avatar, message } from "antd";
import "./threeStreamsView.less";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faBatteryThreeQuarters,
} from "@fortawesome/free-solid-svg-icons";
import { UserOutlined } from "@ant-design/icons";
import moment from "moment";
import connectSocket from "../../../../services/socketConnect";
import { AxiosErrorHandler } from "src/services/httpErrorHandle";
import apis from "src/services/apis";
import http from "src/services/httpCall";
import { STATIC_URL } from "src/constants";
import { AuthContext } from "src/services/authUtils";

let socket;

function ThreeStreamViewDetails(props) {
  const [uptime, setUptime] = useState("00 : 00 : 00");
  const [battery, setbattery] = useState(0);
  const [missionData, setMissionData] = useState<any>(null);

  const { logout } = useContext(AuthContext);

  const printDate = () => {
    const startTime = props.feed.createdAt.split(".")[0];
    const flightStarted = moment(startTime);

    const now = moment(new Date());

    const duration = moment.duration(now.diff(flightStarted));

    // duration in hours
    const hours = ("0" + duration.hours().toString()).slice(-2);

    // duration in minutes
    const minutes = ("0" + duration.minutes().toString()).slice(-2);

    // duration in seconds
    const seconds = ("0" + duration.seconds().toString()).slice(-2);

    const time = `${hours} : ${minutes} : ${seconds}`;

    setUptime(time);
  };
  const getDetails = async (id: any) => {
    try {
      const mission = await http.get(`${apis.GET_MISSION_BY_ID}${id}`);
      setMissionData(mission.data.data);
    } catch (err) {
      message.error("Something went wrong");
      AxiosErrorHandler(err, logout);
      return;
    }
  };
  useEffect(() => {
    socket = connectSocket(props.feed.streamKey);

    socket.on("TELEMETRY", (data) => {
      setbattery(data.battery);
    });

    setInterval(printDate, 1000);
  }, []);
  useEffect(() => {
    if (props.feed.type === "feed") {
      getDetails(props.feed.missionID);
    }
  }, [props.feed.missionID]);
  useEffect(() => {
    console.log("MissionData", missionData);
  }, [missionData]);
  return (
    <div className="details">
      <Row>
        <Col span={12}>
          <Row>
            <Col span={9}>
              <h4 className={"field-name"}>MISSION</h4>
            </Col>
            <Col span={15}>
              {" "}
              <h4 className={"field-value"}>
                {missionData && missionData.name}
              </h4>
            </Col>
          </Row>
          <Row>
            <Col span={9}>
              {" "}
              <h4 className={"field-name"}>MISSION ID</h4>
            </Col>
            <Col span={15}>
              {" "}
              <h4 className={"field-value"}>
                {missionData && missionData._id}
              </h4>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row>
            <Col span={5}>
              <Avatar
                size={40}
                icon={<UserOutlined />}
                src={`${STATIC_URL}${missionData?.flight?.pilotID?.avatar}`}
              />
            </Col>
            <Col span={19}>
              {" "}
              <h4 className={"pilot-name"}>
                {missionData && missionData.flight.pilotID.name}
              </h4>
              <h4 className={"pilot-phone"}>
                {missionData && missionData.flight.pilotID.phoneNo}
              </h4>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ marginTop: "20px" }} gutter={20}>
        <Col span={12}>
          <Row className="uptime f" gutter={10}>
            <Col span={5} className="detail-icon">
              <FontAwesomeIcon
                icon={faClock}
                style={{ width: "50px", height: "50px" }}
              />
            </Col>
            <Col
              span={19}
              className="flying-details"
              style={{ paddingLeft: "20px" }}
            >
              <span>
                <h5 className="small-text small-text-first">Uptime</h5>
                <h2 className="large-text">{uptime}</h2>

                {uptime[0] !== "0" || uptime[1] !== "0" ? (
                  <h5
                    className="small-text small-text-second"
                    style={{ fontSize: "9px" }}
                  >{`Started ${uptime[0]}${uptime[1]} hours and ${uptime[5]}${uptime[6]} minutes ago`}</h5>
                ) : (
                  <h5 className="small-text small-text-second">{`Started ${uptime[5]}${uptime[6]} minutes ago`}</h5>
                )}
              </span>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row className="battery f">
            <Col span={5} className="detail-icon">
              <FontAwesomeIcon
                icon={faBatteryThreeQuarters}
                style={{ width: "50px", height: "50px" }}
              />
            </Col>
            <Col
              span={19}
              className="flying-details"
              style={{ paddingLeft: "20px" }}
            >
              <span>
                <h5 className="small-text small-text-first">Battery</h5>
                <h2 className="large-text">{battery}%</h2>
              </span>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default ThreeStreamViewDetails;
