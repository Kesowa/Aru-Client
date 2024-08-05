import React, { useState, useEffect, FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { useParams } from "react-router-dom";
import GoogleMap from "../../GoogleMap";
import EditFlightForm from "./Form";
import "../../Views/Details/Data/data.less";
import "../../Create/index.less";
import Weather from "../../../shared/Weather";
import { logout } from "../../../../actions/authAction";
import apis from "src/services/apis";
import http from "src/services/httpCall";
import { message } from "antd";
import { AxiosErrorHandler } from "src/services/httpErrorHandle";
import axios from "axios";
import convertDegreeToDirection from "src/services/convertDegreeToDirection";
import Codes from "../../../../static/weatherCodes";
import { enableFlightEditing, setCenterPoints, setCircleMeasurements, setGeolocation, setPolygonMeasurements } from "src/actions/missionCreation";

interface WeatherData {
  humidity: number;
  temperature: number;
  visibility: number;
  weatherCode: string;
  windDirection: string;
  windGust: number;
  windSpeed: number;
}

const EditFlight: FC<any> = (props) => {
  const { id: missionId } = useParams<{ id: string }>();
  const [flightDetails, setFlightDetails] = useState<any>(null);

  const [areaSelected, setAreaSelected] = useState(false);
  const [drawingToolBtns, setDrawingToolBtns] = useState(false);
  const [location, setlocation] = useState<any>(null);

  const [isoDate, setIsoDate] = useState(new Date().toISOString());
  const [weatherData, setWeatherData] = useState<any>({});

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

  const getFlightDetails = async (missionId: string) => {
    try {
      const result = await http.get(`${apis.GET_MISSION_BY_ID}${missionId}`);
      const flight = result.data.data.flight;
      if (
        flight.geoFence.polygon &&
        flight.geoFence.polygon.points.length
      ) {
        setlocation({
          lat: flight.geoFence.polygon.points[0].lat,
          lng: flight.geoFence.polygon.points[0].lng,
        });
      } else {
        setlocation({
          lat: flight.geoFence.circle.center.lat,
          lng: flight.geoFence.circle.center.lng,
        });
      }
      setFlightDetails(flight);
    } catch (err) {
      message.error("Something went wrong");
      AxiosErrorHandler(err, props.logout);
      return;
    }
  };

  useEffect(() => {
    getFlightDetails(missionId);
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeatherData(isoDate);
    }
  }, [isoDate,location]);

  useEffect(() => {
    if (flightDetails) {
      // global states (for communicating with GoogleMap)
      if (flightDetails.geoFence.polygon) {
        props.setPolygonMeasurements({
          ...flightDetails.geoFence.polygon,
          pathPoints: flightDetails.geoFence.polygon.points,
        });
      } else {
        props.setCircleMeasurements(flightDetails.geoFence.circle);
      }
      props.setGeolocation(flightDetails.geoLocation);
      props.setCenterPoints({
        lat: flightDetails.centerPoints.lat,
        lng: flightDetails.centerPoints.lng,
      });
      props.enableFlightEditing(true);
    }
  }, [flightDetails]);

  const mapProps = {
    areaSelected,
    setAreaSelected,
    drawingToolBtns,
    setDrawingToolBtns,
    setlocation,
    location,
  };

  return (
    flightDetails && props.isEditing && (props.polygonData || props.circleData) &&
    <React.Fragment>
      <div
        className="edit-mission-container"
        style={{ position: "relative" }}
      >
        <GoogleMap {...mapProps} />
        <EditFlightForm
          flightDetails={flightDetails}
          setFlightDetails={setFlightDetails}
          areaSelected={areaSelected}
          setisoDate={setIsoDate}
        />
      </div>{" "}
      {location && (
        <Weather data={weatherData} isoDate={isoDate} location={location} />
      )}
    </React.Fragment>
  );
};

const mapStateToProps = (state: any) => ({
  // global states set by GoogleMap component on selection of new flight region
  isEditing: state.MissionCreation.isEditing,
  polygonData: state.MissionCreation.geoFence.polygon || null, // properties of newly selected area
  circleData: state.MissionCreation.geoFence.circle|| null, // properties of newly selected area
  geoLocation: state.MissionCreation.flightDetails.geoLocation, // address of new location
  centerPoints: state.MissionCreation.flightDetails.centerPoints, // center points of new location
});

const connector = connect(mapStateToProps, { 
  logout,
  // for initializing the global states, so that GoogleMap gets initialized at the existing flight location
  enableFlightEditing,
  setCircleMeasurements,
  setPolygonMeasurements,
  setGeolocation,
  setCenterPoints,
});

export default connector(EditFlight);
