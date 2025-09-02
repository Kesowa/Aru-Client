import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";
import apis from "src/services/apis";
import http from "src/services/httpCall";
import { MAPBOX_API_KEY } from "src/constants";

const MAPBOX_TOKEN = MAPBOX_API_KEY;


const initialViewState = {
  longitude: 88.4512,
  latitude: 22.5735,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

// Mapbox default marker icon
const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};

// more to add acording to aru mission status
const getColor = (status) => {
  switch (status) {
    case "Completed":
      return [0, 255, 0]; // Green
    case "Pending":
      return [255, 165, 0]; // Orange
    case "Cancelled":
      return [255, 0, 0]; // Red
    default:
      return [100, 100, 100]; // Gray
  }
};

const MapDisplay = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewState, setViewState] = useState(initialViewState);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchAllMissions = async () => {
      try {
        const params = {
          filter: "all",
          sort: "createdAt:descend",
          page: 1,
          limit: 999999, //to get all mission
        };

        const response = await http.get(apis.GET_ALL_MISSIONS_FOR_TENANT, {
          params,
        });
        console.log("get details:  ", response.data.data);
        if (response.data.data) {
          const formattedData = response.data.data.map((mission: any) => ({
            id: mission._id,
            address: mission.flight?.geoLocation,
            coordinates: mission.flight?.geoFence?.circle?.center
              ? [
                  parseFloat(
                    mission.flight.geoFence.circle.center.lng.toFixed(4)
                  ),
                  parseFloat(
                    mission.flight.geoFence.circle.center.lat.toFixed(4)
                  ),
                ]
              : null,
            status: mission.status,
          }));

          console.log("Formatted Data:", formattedData);
          setLocations(formattedData);
          console.log(locations);
        }
      } catch (error) {
        console.error("Error fetching all missions:", error);
      }
    };

    fetchAllMissions();
  }, []);

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setViewState({
      ...viewState,
      longitude: location.coordinates[0],
      latitude: location.coordinates[1],
      zoom: 14,
    });
  };

  // const locations = [
  //   {
  //     id: 1,
  //     coordinates: [88.4512, 22.5735],
  //     address: 'JF66+P46, Action Area II, Newtown, New Town, West Bengal 700157, India',
  //     status: 'completed'
  //   },
  //   {
  //     id: 2,
  //     coordinates: [88.4528, 22.5751],
  //     address: 'JF67+P32, Action Area II, Newtown, New Town, West Bengal 700135, India',
  //     status: 'pending'
  //   },
  // ];

  const layers = [
    new IconLayer({
      id: "icon-layer",
      data: locations,
      pickable: true,
      iconAtlas:
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: (d) => "marker",
      sizeScale: 15,
      getPosition: (d) => d.coordinates,
      getSize: (d) => 5,
      getColor: (d) => getColor(d.status),
      onClick: ({ object }) => handleLocationClick(object),
      onHover: ({ object }) => setSelectedLocation(object),
    }),
  ];

  return (
    <div style={{ display: "flex", height: "83vh" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <DeckGL
          viewState={viewState}
          onViewStateChange={(v) => setViewState(v.viewState)}
          controller={true}
          layers={layers}
        >
          <StaticMap
            mapboxApiAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/streets-v11"
          />
          {selectedLocation && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                zIndex: 999,
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", font: "bold" }}>
                Mission Details
              </h3>
              <p>
                <strong>Coordinates:</strong>
                <br />
                {selectedLocation.coordinates[1].toFixed(4)},{" "}
                {selectedLocation.coordinates[0].toFixed(4)}
              </p>
              <p>
                <strong>Address:</strong>
                <br />
                {selectedLocation.address}
              </p>
              <div
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  cursor: "pointer",
                  padding: "2px 5px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#666",
                }}
                onClick={() => setSelectedLocation(null)}
              >
                X
              </div>
            </div>
          )}
        </DeckGL>
      </div>

      {/* Locations Sidebar */}
      <div
        style={{
          width: "400px",
          padding: "20px",
          overflowY: "auto",
          boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Mission Locations</h2>
        {locations.map((location) => (
          <div
            key={location.id}
            style={{
              padding: "12px",
              margin: "8px 0",
              cursor: "pointer",
              borderRadius: "4px",
              backgroundColor:
                selectedLocation?.id === location.id ? "#e6f7ff" : "white",
              border: `2px solid ${getColor(location.status)
                .slice(0, 3)
                .join(",")}`,
              transition: "all 0.2s",
            }}
            onClick={() => handleLocationClick(location)}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: `rgb(${getColor(location.status).join(",")})`,
                borderRadius: "50%",
                display: "inline-block",
                marginRight: "8px",
              }}
            />
            {location.address}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapDisplay;
