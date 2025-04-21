import { useState, useEffect } from "react";
import { Row, Col, Typography, Avatar, Tooltip, Divider, Tag } from "antd";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { STATIC_URL } from "src/constants";

const { Title, Text, Link } = Typography;

function About(props) {
  const [missionData, setMissionData] = useState<any>({});

  useEffect(() => {
    if (props.mission) {
      const data = {
        missionName: props.mission?.name,
        missionStatus: "LIVE",
        pilotName: props.mission?.flight.pilotID.name,
        pilotPhoto: props.mission?.flight.pilotID.avatar,
        missionType: "Drone Surveillance",
        deliverables: props.mission?.deliverables,
        missionID: props.mission?._id,
        flightID: props.mission?.flight ? props.mission?.flight._id : "",
        flightLocation: props.mission?.flight
          ? props.mission?.flight.geoLocation
          : "",
        instructions: props.mission?.flight ? props.mission?.description : "",
        flightDate: props.mission?.flight ? props.mission?.flight.date : "",
        flightDuration: props.mission?.flight
          ? props.mission?.flight.duration
          : "",
        pilotMobileNumber: props.mission?.flight.pilotID.phoneNo,
      };

      setMissionData(data);
    }
  }, [props.mission]);

  function MissionDeliverables(items: any[]) {
    if (items) {
      return items.map((item) => <Tag color="green" key={window.crypto.randomUUID()}>{item}</Tag>);
    }
  }

  return (
    <div>
      <Row>
        <Col md={20}>
          <Title level={4} style={{ float: "left" }}>
            {missionData.missionName}
          </Title>
          <Tag color="geekblue" style={{ marginLeft: "1rem" }}>
            {missionData.missionStatus}
          </Tag>
        </Col>
        <Col md={4}>
          <Text type="secondary">
            <CalendarOutlined /> Live till 10AM
          </Text>
        </Col>
      </Row>
      <Row style={{ marginTop: "12px" }}>
        <Col span={18}>
          <div className="pilot-profile-badge">
            <Avatar
              key="2"
              size="large"
              icon={<UserOutlined />}
              src={STATIC_URL + missionData.pilotPhoto}
            />
            <div className="pilot-name">
              <Title level={5} className="designation">
                {missionData.pilotName}
              </Title>
              <Text type="secondary">Pilot assigned</Text>
            </div>
          </div>
        </Col>
      </Row>

      <Row style={{ marginTop: "12px" }}>
        <Col md={4}>
          <Text strong>Mission type</Text>
        </Col>
        <Col md={20}>{missionData.missionType}</Col>
      </Row>
      <Row style={{ marginTop: "8px" }}>
        <Col md={4}>
          <Text strong>Deliverables</Text>
        </Col>
        <Col md={20}>{MissionDeliverables(missionData.deliverables)}</Col>
      </Row>
      <Row style={{ marginTop: "8px" }}>
        <Col md={4}>
          <Text strong>Mission ID</Text>
        </Col>
        <Col md={20}>
          <Tooltip placement="right" title="go to mission card">
            <Link href="" target="_blank">
              {missionData.missionID}
            </Link>
          </Tooltip>
        </Col>
      </Row>
      <Row style={{ marginTop: "8px" }}>
        <Col md={4}>
          <Text strong>Flight ID</Text>
        </Col>
        <Col md={20}>{missionData.flightID}</Col>
      </Row>
      <Row style={{ marginTop: "8px" }}>
        <Col md={4}>
          <Text strong>Flight location</Text>
        </Col>
        <Col md={20}>{missionData.flightLocation}</Col>
      </Row>
      <Divider />
      <Text type="secondary">Instructions</Text>
      <p>{missionData.instructions}</p>
      <br />
      <br />
      <br />
    </div>
  );
}

export default About;
