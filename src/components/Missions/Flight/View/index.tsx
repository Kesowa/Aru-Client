import React, { useRef, useState, useEffect, FC, useContext } from "react";
import { message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import FlightDetails from "./Details";
import "./index.less";
import { useParams } from "react-router-dom";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { AuthContext } from "src/services/authUtils";

const ViewFlight: FC<any> = () => {
  const [flightDetails, setFlightDetails] = useState<any>(null);

  const googleMapRef: React.RefObject<HTMLDivElement> =
    useRef<HTMLDivElement>(null);
  const googleSearchRef: React.RefObject<HTMLInputElement> =
    useRef<HTMLInputElement>(null);
  const googleMap: React.MutableRefObject<any> = useRef();
  const drawingManager: React.MutableRefObject<any> = useRef();
  const searchAutoComplete: React.MutableRefObject<any> = useRef();

  const { id } = useParams<{ id: string }>();

  const { logout } = useContext(AuthContext);

  const getMissionDetails = async (id: string) => {
    try {
      const result = await http.get(`${apis.GET_MISSION_BY_ID}${id}`);
      const mission = result.data.data;
      setFlightDetails(mission.flight);
      const geoFence: any = {};

      if (mission.flight.geoFence.polygon) {
        geoFence.shape = "Polygon";
        geoFence.points = [...mission.flight.geoFence.polygon.points];
      } else {
        geoFence.shape = "Circle";
        geoFence.center = { ...mission.flight.geoFence.circle.center };
        geoFence.radius = mission.flight.geoFence.circle.radius;
      }
      setTimeout(() => {
        createMeasurements(geoFence);
      }, 0);
    } catch (err) {
      message.error("Something went wrong");
      AxiosErrorHandler(err, logout);
      return;
    }
  };

  useEffect(() => {
    getMissionDetails(id);
    const loc = { lat: 43.642567, lng: -79.387054 };
    googleMap.current = createGoogleMap(loc);
    drawingManager.current = createDrawingManager();
    searchAutoComplete.current = createSearchBar();
    drawingManager.current.setMap(googleMap.current);
    setSearchBarEvent();
  }, []);

  // Intialize Google Map
  const createGoogleMap = ({ lat, lng }: { lat: number; lng: number }) => {
    return new window.google.maps.Map(googleMapRef.current!, {
      zoom: 16,
      center: {
        lat,
        lng,
      },
      disableDefaultUI: true,
      zoomControl: true,
      scaleControl: true,
      disableDoubleClickZoom: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        mapTypeIds: ["roadmap", "satellite"],
      },
    });
  };

  // Initialize Drawing Manager
  const createDrawingManager = () =>
    new window.google.maps.drawing.DrawingManager({
      drawingControl: false,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_RIGHT,
        drawingModes: [
          window.google.maps.drawing.OverlayType.POLYGON,
          window.google.maps.drawing.OverlayType.CIRCLE,
        ],
      },
    });

  // Create Marker
  const createMarker = (lat: number, lng: number) => {
    return new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMap.current,
    });
  };

  //initialize search bar
  const createSearchBar = () =>
    new window.google.maps.places.Autocomplete(googleSearchRef.current!, {
      types: ["establishment"],
      fields: ["place_id", "name", "geometry"],
      componentRestrictions: { country: ["IN"] },
    });

  const setSearchBarEvent = () => {
    searchAutoComplete.current.addListener("place_changed", () => {
      const place = searchAutoComplete.current.getPlace();
      if (!place.geometry) {
        return;
      } else {
        googleMap.current.panTo({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });

        googleMap.current.setZoom(19);
        createMarker(
          place.geometry.location.lat(),
          place.geometry.location.lng()
        );
      }
    });
  };

  const findPolygonCenter = (points: { lat: number; lng: number }[]) => {
    const bounds = new window.google.maps.LatLngBounds();

    const polygonCoords = [];

    for (const x of points) {
      const llbound = new window.google.maps.LatLng(x.lat, x.lng);
      polygonCoords.push(llbound);
    }
    let i;
    for (i = 0; i < polygonCoords.length; i++) {
      bounds.extend(polygonCoords[i]);
    }

    const centerOfPolygon = bounds.getCenter();

    return [centerOfPolygon.lat(), centerOfPolygon.lng()];
  };

  const createMeasurements = (geofence: any) => {
    let obj;
    switch (geofence.shape) {
      case "Polygon": {
        const geoPoints = geofence.points.map((point: any) => {
          return {
            lat: point.lat,
            lng: point.lng,
          };
        });

        obj = new window.google.maps.Polygon({
          paths: geoPoints,
        });

        const center = findPolygonCenter(geoPoints);
        googleMap.current.setCenter({ lat: center[0], lng: center[1] });
        break;
      }
      case "Circle":
        obj = new window.google.maps.Circle({
          center: geofence.center,
          radius: geofence.radius,
        });
        googleMap.current.setCenter({
          lat: geofence.center.lat,
          lng: geofence.center.lng,
        });
    }
    obj.setMap(googleMap.current);
    return obj;
  };

  return (
    <React.Fragment>
      <div id="map_container">
        <div
          id="view_flight_map"
          ref={googleMapRef}
          style={{
            width: "calc(100vw - 200px)",
            height: "100vh",
          }}
        />
        <FlightDetails flightDetails={flightDetails} />
      </div>

      <div className="location_search_container">
        <input
          placeholder="Search Your Location"
          type="text"
          className="location_search"
          ref={googleSearchRef}
        />
        <FontAwesomeIcon
          icon={faMapMarkerAlt}
          className="search_marker"
          style={{ width: "25px", height: "25px" }}
          color={"#1890ff"}
        />
      </div>
    </React.Fragment>
  );
};

export default ViewFlight;
