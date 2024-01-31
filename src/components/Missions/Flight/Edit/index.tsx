import React, { useState, useEffect, FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { useParams } from "react-router-dom";
import GoogleMap from "../../GoogleMap";
import EditFlightForm from "./Form";
import "../../Views/Details/Data/data.less";
import Weather from "../../../shared/Weather";
import { logout } from "../../../../actions/authAction";

const EditFlight: FC<EditFlightProps> = (props) => {
  const [areaSelected, setAreaSelected] = useState(false);
  const [drawingToolBtns, setDrawingToolBtns] = useState(false);
  const [flightEditing, setFlightEditing] = useState(false);
  const [flightDetails, setFlightDetails] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useState<any>({});
  const [isoDate, setIsoDate] = useState(new Date().toISOString());
  const [weatherData, setWeatherData] = useState<any>({});

  const fetchWeatherData = (isoDate: string) => {
    // ... (rest of the function remains unchanged)
  };

  useEffect(() => {
    fetchWeatherData(isoDate);
  }, [isoDate, location]);

  const setMissionByApi = async (id: string) => {
    // ... (rest of the function remains unchanged)
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
  }, [id]);

  useEffect(() => {
    if (flightDetails) {
      if (
        flightDetails.geoFence.polygon &&
        flightDetails.geoFence.polygon.points.length
      ) {
        setLocation({
          lat: flightDetails.geoFence.polygon.points[0].lat,
          lng: flightDetails.geoFence.polygon.points[0].lng,
        });
      } else {
        setLocation({
          lat: flightDetails.geoFence.circle.center.lat,
          lng: flightDetails.geoFence.circle.center.lng,
        });
      }
    }
  }, [flightDetails]);

  const mapProps = {
    areaSelected,
    setAreaSelected,
    drawingToolBtns,
    setDrawingToolBtns,
    setlocation: setLocation,
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
            setisoDate={setIsoDate}
          />
        </div>{" "}
        {location && (
          <Weather data={weatherData} isoDate={isoDate} location={location} />
        )}
      </React.Fragment>
    )
  );
};

const mapStateToProps = (state: any) => ({
  isMapLoaded: state.Gmap.gmapLoaded,
  missions: state.Missions.missions,
});

const connector = connect(mapStateToProps, { logout });

type EditFlightProps = ConnectedProps<typeof connector>;

export default connector(EditFlight);
