import React, { useState, useEffect, FC, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import GoogleMap from "../../GoogleMap";
import EditFlightForm from "./Form";
import "../../Views/Details/Data/data.less";
import "../../Create/index.less";
import Weather from "../../../shared/Weather";
import apis from "src/services/apis";
import http from "src/services/httpCall";
import { message } from "antd";
import { AxiosErrorHandler } from "src/services/httpErrorHandle";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

const EditFlight: FC<any> = (props) => {
  const { id: missionId } = useParams<{ id: string }>();
  const [flightDetails, setFlightDetails] = useState<any>(null);

  const [areaSelected, setAreaSelected] = useState(false);
  const [drawingToolBtns, setDrawingToolBtns] = useState(false);
  const [location, setlocation] = useState<any>(null);

  const [isoDate, setIsoDate] = useState(new Date().toISOString());

  const history = useHistory();

  const { logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);

  const getFlightDetails = async (missionId: string) => {
    try {
      const result = await http.get(`${apis.GET_MISSION_BY_ID}${missionId}`);
      const flight = result.data.data.flight;
      if (flight.geoFence.polygon) {
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
      setFlightDetails({
        ...flight,
        locationID: flight.locationID ? flight.locationID._id : null,
        pilotID: flight.pilotID ? flight.pilotID._id : null,
      });
    } catch (err) {
      message.error("Something went wrong");
      AxiosErrorHandler(err, logout);
      return;
    }
  };

  const editFlight = async () => {
    const body = {
      _id: flightDetails?._id,
      name: flightDetails?.name,
      locationId: flightDetails?.locationID,
      duration: flightDetails?.duration,
      time: flightDetails?.time,
      date: flightDetails?.date,
      geoLocation: flightDetails?.geolocation,
      centerPoints: flightDetails?.centerPoints,
      geofence: flightDetails?.geoFence,
    };

    setLoading(true);

    http
      .patch(apis.ASSIGN_PILOT, {
        pilotID: flightDetails?.pilotID,
        flightID: flightDetails?._id,
      })
      .then((result) => {
        if (result.data.status) {
          message.success("Pilot Reassigned");
        }
      })
      .catch((err) => {
        message.error("Something went wrong");
        AxiosErrorHandler(err, logout);
      });

    http
      .post(`${apis.EDIT_FLIGHT_BY_ID}`, body)
      .then((result) => {
        if (result.data.status) {
          message.success("Flight Edited Successfully");
          history.goBack();
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        message.error("Something went wrong");
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getFlightDetails(missionId);
  }, []);

  return (
    flightDetails && (
      <React.Fragment>
        <div
          className="edit-mission-container"
          style={{ position: "relative" }}
        >
          <GoogleMap
            areaSelected={areaSelected}
            setAreaSelected={setAreaSelected}
            drawingToolBtns={drawingToolBtns}
            setDrawingToolBtns={setDrawingToolBtns}
            isEditing={true}
            setlocation={setlocation}
            location={location}
            geoLocation={flightDetails.geolocation}
            setGeolocation={(geolocation: string) =>
              setFlightDetails((prev) => ({ ...prev, geolocation }))
            }
            centerPoints={flightDetails.centerPoints}
            setCenterPoints={(centerPoints: { lat: number; lng: number }) =>
              setFlightDetails((prev) => ({ ...prev, centerPoints }))
            }
            geoFence={flightDetails.geoFence}
            setGeoFence={(geoFence: any) =>
              setFlightDetails((prev) => ({ ...prev, geoFence }))
            }
          />
          <EditFlightForm
            flightDetails={flightDetails}
            setFlightDetails={setFlightDetails}
            areaSelected={areaSelected}
            setisoDate={setIsoDate}
            onSubmit={editFlight}
            isEditing={true}
          />
        </div>{" "}
        {location && <Weather isoDate={isoDate} location={location} />}
      </React.Fragment>
    )
  );
};

export default EditFlight;
