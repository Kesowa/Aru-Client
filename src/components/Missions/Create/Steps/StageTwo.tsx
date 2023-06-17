import React, { useState, useEffect } from "react";
import { Card, Typography } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import { Collapse } from "antd";
import StageTwoForm from "./StageTwoForm";
import FlightEditing from "../CreateFlight";
import { connect } from "react-redux";
import Weather from "../../../shared/Weather";
import Codes from "../../../../static/weatherCodes";
import convertDegreeToDirection from "../../../../services/convertDegreeToDirection";
import http from "../../../../services/httpCall";
import { logout } from "../../../../actions/authAction";
const { Panel } = Collapse;
const { Title } = Typography;

function StageTwo(props: any) {
  const [formComplete, setFormComplete] = useState(false);
  const [weatherData, setweatherData] = useState<any>({});
  const [isoDate, setisoDate] = useState(new Date().toISOString());

  const fetchWeatherData = (isoDate) => {
    let endTime = JSON.stringify(
      parseInt(isoDate.split("T")[1].split(":")[0]) + 1
    );
    endTime =
      isoDate.split("T")[0] +
      "T" +
      ("0" + endTime).slice(-2) +
      ":" +
      isoDate.split("T")[1].split(":")[1] +
      ":" +
      isoDate.split("T")[1].split(":")[2];
    http
      .get(
        `https://api.tomorrow.io/v4/timelines?fields=temperature&fields=humidity&fields=windSpeed&fields=windDirection&fields=windGust&fields=visibility&fields=weatherCode&units=metric&apikey=cwzgSdpHOiiFQt8y8I9d2SUpAPQG7X7U&location=${props.location.lat},${props.location.lng}&startTime=${isoDate}&endTime=${endTime}`
      )
      .then((result) => {
        const data = result.data.data.timelines[0].intervals[0].values;
        const wData = {
          humidity: data.humidity,
          temperature: data.temperature,
          visibility: data.visibility,
          weatherCode: Codes[data.weatherCode],
          windDirection: convertDegreeToDirection(data.windDirection),
          windGust: data.windGust,
          windSpeed: data.windSpeed,
        };
        setweatherData(wData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    if (props.location) {
      fetchWeatherData(isoDate);
    }
  }, [isoDate, props.location]);

  return (
    <div className="stage_two">
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
            <div>
              <Title className="panel-title" level={5}>
                <InfoCircleFilled />
                &nbsp;&nbsp;Create Flights
              </Title>
            </div>,
          ]}
          key="2"
          className="accordian-panel"
        >
          <Card
            bordered={false}
            className="mission_creation_form"
            id="nested_accordian_content"
          >
            <div>
              {!props.isEditing ? (
                <StageTwoForm
                  setFormComplete={setFormComplete}
                  nextStage={props.nextStage}
                  areaSelected={props.areaSelected}
                  setAreaSelected={props.setAreaSelected}
                  setisoDate={setisoDate}
                />
              ) : (
                <FlightEditing
                  setFormComplete={setFormComplete}
                  nextStage={props.nextStage}
                  areaSelected={props.areaSelected}
                  setAreaSelected={props.setAreaSelected}
                />
              )}
            </div>
          </Card>
        </Panel>
      </Collapse>
      <div style={{ marginLeft: "10px" }}>
        <Weather
          data={weatherData}
          isoDate={isoDate}
          location={props.location}
        />
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isEditing: state.MissionCreation.isEditing,
  };
};

export default connect(mapStateToProps, { logout })(StageTwo);
