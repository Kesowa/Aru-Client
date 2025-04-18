import React, { useState, useEffect, FC } from "react";
import { Button, Card, Typography, Collapse } from "antd";
import s_m from "../../../../Icons/start_measurement.svg";
import l_a from "../../../../Icons/location_add.svg";
import { InfoCircleFilled } from "@ant-design/icons";
import { useHistory } from "react-router-dom";

const { Panel } = Collapse;
const { Title, Text } = Typography;

const FlightDetails: FC<any> = (props) => {
  const [area, setArea] = useState(0);
  const [areaType, setAreaType] = useState("");
  const history = useHistory();

  useEffect(() => {
    if (props.flightDetails) {
      if (props.flightDetails.geoFence.polygon) {
        setArea(props.flightDetails.geoFence.polygon.area);
        setAreaType("Polygon");
      } else {
        setArea(props.flightDetails.geoFence.circle.area);
        setAreaType("Center");
      }
    }
  }, [props.flightDetails]);

  return (
    <React.Fragment>
      {props.flightDetails && (
        <div className="flight_details">
          <Collapse
            accordion
            bordered={false}
            className="mission_creation_accordian"
            ghost
            expandIconPosition={"right"}
            defaultActiveKey={"2"}
          >
            <Panel
              header={[
                <div key={window.crypto.randomUUID()}>
                  <Title className="panel-title" level={5}>
                    <InfoCircleFilled />
                    &nbsp;&nbsp;Flight Details
                  </Title>
                </div>,
              ]}
              key="2"
              className="accordian-panel"
            >
              <Text className="flight-id" style={{ marginLeft: "10px" }}>
                ID : {props.flightDetails._id}
              </Text>
              <Card bordered={false} className="flight_details_card">
                <Text className="heading">{props.flightDetails.name}</Text>
                <Text className="heading">{props.flightDetails.date}</Text>
                <Text className="heading">{props.flightDetails.time}</Text>
                <Text className="heading">{props.flightDetails.duration}</Text>
                <Text className="heading">
                  {props.flightDetails.locationID?.properties?.name || "none"}
                </Text>
                <Text className="heading">
                  {props.flightDetails.pilotID?.name
                    ? props.flightDetails.pilotID.name
                    : "Pilot not assigned"}
                </Text>

                <div>
                  <div className="area_details">
                    <img
                      style={{ height: "20px", marginTop: "-20px" }}
                      src={s_m}
                    />
                    <div className="area_details_inner">
                      {areaType === "Polygon" ? (
                        <div>
                          <p>
                            <strong>Geofence Selected</strong>
                          </p>
                          <p style={{ marginTop: "-12px" }}>
                            <span>
                              {
                                props.flightDetails.geoFence.polygon.points
                                  .length
                              }{" "}
                              Points Selected
                            </span>{" "}
                            <span>
                              {" "}
                              {`${(area * 0.000247105).toFixed(2)} acres`}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p>
                            <strong>Radius Selected</strong>
                          </p>
                          <p style={{ marginTop: "-12px" }}>
                            <span
                              style={{
                                fontWeight: "bold",
                              }}
                            >
                              Area :
                            </span>{" "}
                            <span>{`${(area * 0.000247105).toFixed(
                              2
                            )} acres`}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flight_location">
                    <img
                      src={l_a}
                      alt=""
                      style={{ height: "20px", marginTop: "-20px" }}
                    />
                    <div
                      className="flight_location_inner"
                      style={{ marginTop: "-5px" }}
                    >
                      <strong>Location Selected</strong>
                      <p>{props.flightDetails.geoLocation}</p>
                    </div>
                  </div>
                </div>
              </Card>
              <Button
                type="primary"
                danger
                onClick={() => history.goBack()}
                style={{ marginBottom: "10px" }}
              >
                {" "}
                Back{" "}
              </Button>
            </Panel>
          </Collapse>
        </div>
      )}
    </React.Fragment>
  );
};

export default FlightDetails;
