import React, { useState, useEffect, FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Card, Typography } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import { Collapse } from "antd";
import StageTwoForm from "./StageTwoForm";
import FlightEditing from "../CreateFlight";
import Weather from "../../../shared/Weather";
import Codes from "../../../../static/weatherCodes";
import convertDegreeToDirection from "../../../../services/convertDegreeToDirection";
import http from "../../../../services/httpCall";
import { logout } from "../../../../actions/authAction";
import "../index.less";
import axios from "axios";

const { Panel } = Collapse;
const { Title } = Typography;

interface WeatherData {
  humidity: number;
  temperature: number;
  visibility: number;
  weatherCode: string;
  windDirection: string;
  windGust: number;
  windSpeed: number;
}

interface StageTwoProps extends PropsFromRedux {
  location: {
    lat: number;
    lng: number;
  };
  areaSelected: any; // Replace with the appropriate type for areaSelected
  setAreaSelected: any; // Replace with the appropriate type for setAreaSelected
  setlocation: Function;
  nextStage: () => void;
}

const StageTwo: FC<StageTwoProps> = ({
  location,
  setlocation,
  areaSelected,
  setAreaSelected,
  nextStage,
  isEditing,
  logout,
}) => {
  const [formComplete, setFormComplete] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData>({});
  const [isoDate, setIsoDate] = useState(new Date().toISOString());

  const fetchWeatherData = (isoDate: string) => {
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
    axios
      .get(
        `https://api.tomorrow.io/v4/timelines?fields=temperature&fields=humidity&fields=windSpeed&fields=windDirection&fields=windGust&fields=visibility&fields=weatherCode&units=metric&apikey=cwzgSdpHOiiFQt8y8I9d2SUpAPQG7X7U&location=${location.lat},${location.lng}&startTime=${isoDate}&endTime=${endTime}`
      )
      .then((result) => {
        const data = result.data.data.timelines[0].intervals[0].values;
        const wData: WeatherData = {
          humidity: data.humidity,
          temperature: data.temperature,
          visibility: data.visibility,
          weatherCode: Codes[data.weatherCode],
          windDirection: convertDegreeToDirection(data.windDirection),
          windGust: data.windGust,
          windSpeed: data.windSpeed,
        };
        setWeatherData(wData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    if (location) {
      fetchWeatherData(isoDate);
    }
  }, [isoDate, location]);

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
              {!isEditing ? (
                <StageTwoForm
                  setFormComplete={setFormComplete}
                  nextStage={nextStage}
                  areaSelected={areaSelected}
                  setAreaSelected={setAreaSelected}
                  setIsoDate={setIsoDate}
                  setlocation={setlocation}
                />
              ) : (
                <FlightEditing
                  setFormComplete={setFormComplete}
                  nextStage={nextStage}
                  areaSelected={areaSelected}
                  setAreaSelected={setAreaSelected}
                />
              )}
            </div>
          </Card>
        </Panel>
      </Collapse>
      <div style={{ marginLeft: "10px" }}>
        <Weather data={weatherData} isoDate={isoDate} location={location} />
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  isEditing: state.MissionCreation.isEditing,
});

const connector = connect(mapStateToProps, { logout });

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(StageTwo);
