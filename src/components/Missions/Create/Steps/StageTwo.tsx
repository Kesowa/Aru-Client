import React, { useState, useEffect, FC } from "react";
import { Card, message, Typography } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import { Collapse } from "antd";
import StageTwoForm from "./StageTwoForm";
import FlightEditing from "../CreateFlight";
import Weather from "../../../shared/Weather";
import Codes from "../../../../static/weatherCodes";
import convertDegreeToDirection from "../../../../services/convertDegreeToDirection";
import "../index.less";
import axios from "axios";
import GoogleMap from "../../GoogleMap";
import EditFlightForm from "../../Flight/Edit/Form";

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

interface StageTwoProps {
  prevStage: () => void;
  nextStage: () => void;
  flightDetails: any;
  setFlightDetails: (f:any) => void;
  isEditing: boolean;
}

const StageTwo: FC<StageTwoProps> = ({ isEditing, flightDetails, setFlightDetails, nextStage }) => {
  const [isoDate, setIsoDate] = useState(new Date().toISOString());

  const [areaSelected, setAreaSelected] = useState<boolean>(false);
  const [drawingToolBtns, setDrawingToolBtns] = useState<boolean>(false);
  const [location, setlocation] = useState<any>(null);

  const addFlight = () => {
    if (
      (flightDetails.name === "") ||
      (flightDetails.date === "") ||
      (flightDetails.time === "") ||
      (flightDetails.duration === "") ||
      !flightDetails.locationID ||
      !flightDetails.pilotID 
    ) {
      message.error("Please fill all fields");
    } else if (
      (!flightDetails.geoFence.circle && !flightDetails.geoFence.polygon) ||
      !flightDetails.geolocation ||
      !flightDetails.centerPoints
    ) {
      message.error("Please select a geoFence");
    } else {
      message.success("Flight Added");
      nextStage();
    }
  };

  return (
    <>
    <div className="container-full">
      <GoogleMap 
        areaSelected={areaSelected}
        setAreaSelected={setAreaSelected}
        drawingToolBtns={drawingToolBtns}
        setDrawingToolBtns={setDrawingToolBtns}
        isEditing={isEditing}
        setlocation={setlocation}
        location={location}
        geoLocation={flightDetails.geolocation}
        setGeolocation={(geolocation: string) => setFlightDetails((prev) => ({ ...prev, geolocation }))}
        centerPoints={flightDetails.centerPoints}
        setCenterPoints={(centerPoints: { lat:number; lng:number; }) => setFlightDetails((prev) => ({ ...prev, centerPoints }))}
        geoFence={flightDetails.geoFence}
        setGeoFence={(geoFence: any) => setFlightDetails((prev) => ({ ...prev, geoFence }))}
      />
    </div>
    <div className="stage_two">
      <div className="mission_creation_accordian">
        <div className="accordian-panel">
          <div className="mission_creation_form">
            <EditFlightForm
              flightDetails={flightDetails}
              setFlightDetails={setFlightDetails}
              areaSelected={areaSelected}
              setisoDate={setIsoDate}
              onSubmit={addFlight}
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>
      {
        location &&
        <Weather isoDate={isoDate} location={location} />
      }
    </div>
    </>
  );
};

export default StageTwo;
