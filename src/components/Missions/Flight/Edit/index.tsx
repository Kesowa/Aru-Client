import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import GoogleMap from "../../GoogleMap";
import EditFlightForm from "./Form";
import "../../Views/Details/Data/data.less";
import { message } from "antd";
import Weather from "../../../shared/Weather";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import Codes from "../../../../static/weatherCodes";
import convertDegreeToDirection from "../../../../services/convertDegreeToDirection";
import apis from "../../../../services/apis";

const EditFlight = (props: any) => {
  const [areaSelected, setAreaSelected] = useState(false);
  const [drawingToolBtns, setDrawingToolBtns] = useState(false);
  const [flightEditing, setFlightEditing] = useState(false);
  const [flightDetails, setFlightDetails] = useState<any>(null);
  const { id } = useParams<any>();
  const [location, setlocation] = useState<any>({});
  const [isoDate, setisoDate] = useState(new Date().toISOString());
  const [weatherData, setweatherData] = useState<any>({});

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
    console.log(isoDate);
    console.log(endTime);
    http
      .get(
        `https://api.tomorrow.io/v4/timelines?fields=temperature&fields=humidity&fields=windSpeed&fields=windDirection&fields=windGust&fields=visibility&fields=weatherCode&units=metric&apikey=cwzgSdpHOiiFQt8y8I9d2SUpAPQG7X7U&location=${location.lat},${location.lng}&startTime=${isoDate}&endTime=${endTime}`
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
        console.log(wData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    fetchWeatherData(isoDate);
  }, [isoDate, location]);

  const setMissionByApi = async (id) => {
    try {
      const result = await http.get(`${apis.GET_MISSION_BY_ID}${id}`);
      const mission = result.data.data;
      setFlightDetails(mission.flight);
    } catch (err) {
      message.error("Something went wrong");
      AxiosErrorHandler(err, props.logout);
      return;
    }
  };

  useEffect(() => {
    const mission = props.missions.filter((mission) => {
      return mission._id === id;
    });

    if (mission.length === 0) {
      setMissionByApi(id);
    } else {
      setFlightDetails(mission[0].flight);
    }
  }, []);

  useEffect(() => {
    if (flightDetails) {
      if (
        flightDetails.geoFence.polygon &&
        flightDetails.geoFence.polygon.points.length
      ) {
        setlocation({
          lat: flightDetails.geoFence.polygon.points[0].lat,
          lng: flightDetails.geoFence.polygon.points[0].lng,
        });
      } else {
        setlocation({
          lat: flightDetails.geoFence.circle.center.lat,
          lng: flightDetails.geoFence.circle.center.lng,
        });
      }
    }
  }, [flightDetails]);

  const mapProps: any = {
    areaSelected,
    setAreaSelected,
    drawingToolBtns,
    setDrawingToolBtns,
    setlocation,
    location,
  };

  return (
    props.isMapLoaded && (
      <React.Fragment>
        <div
          className="edit-mission-container"
          style={{ position: "relative" }}
        >
          {flightEditing && <GoogleMap {...mapProps} />}
          <EditFlightForm
            setAreaSelected={setAreaSelected}
            areaSelected={areaSelected}
            flight={flightDetails}
            setFlightEditing={setFlightEditing}
            setisoDate={setisoDate}
          />
        </div>{" "}
        {location && (
          <Weather data={weatherData} isoDate={isoDate} location={location} />
        )}
      </React.Fragment>
    )
  );
};

const mapStateToProps = (state) => {
  return {
    isMapLoaded: state.Gmap.gmapLoaded,
    missions: state.Missions.missions,
  };
};

export default connect(mapStateToProps, { logout })(EditFlight);
