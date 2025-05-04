<<<<<<< Updated upstream
=======
import { useState, useEffect } from "react";
>>>>>>> Stashed changes
import DeckGL from "@deck.gl/react";
import { IconLayer, ScatterplotLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";
<<<<<<< Updated upstream
import { useState, useEffect, } from "react";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { MAPBOX_API_KEY } from "src/constants";
=======
import apis from "src/services/apis";
import http from "src/services/httpCall";
import { MAPBOX_API_KEY } from "src/constants";

const MAPBOX_TOKEN = MAPBOX_API_KEY;
>>>>>>> Stashed changes

const initialViewState = {
  longitude: 88.4512,
  latitude: 22.5735,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};

const getColor = (status) => {
  switch (status) {
    case "Completed":
      return [0, 255, 0, 200]; // Green with alpha
    case "Review":
      return [255, 165, 0, 200]; // Orange with alpha
    case "Cancelled":
      return [255, 0, 0, 200]; // Red with alpha
    case "Live":
      return [0, 120, 255, 200]; // Blue with alpha
    default:
      return [100, 100, 100, 200]; // Gray with alpha
  }
};

const MapDisplay = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewState, setViewState] = useState(initialViewState);
  const [locations, setLocations] = useState([]);
  const [hoveredLocationId, setHoveredLocationId] = useState(null);

  useEffect(() => {
    const fetchAllMissions = async () => {
      try {
        const params = {
          filter: "all",
          sort: "createdAt:descend",
          page: 1,
          limit: 999999,
        };

        const response = await http.get(apis.GET_ALL_MISSIONS_FOR_TENANT, {
          params,
        });
        
        if (response.data.data) {
          const formattedData = response.data.data.map((mission) => ({
            id: mission._id,
            address: mission.flight?.geoLocation,
            coordinates: mission.flight?.geoFence?.circle?.center
              ? [
                  parseFloat(mission.flight.geoFence.circle.center.lng.toFixed(4)),
                  parseFloat(mission.flight.geoFence.circle.center.lat.toFixed(4)),
                ]
              : null,
            status: mission.status,
          })).filter(mission => mission.coordinates); // Filter out null coordinates

          setLocations(formattedData);
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
      zoom: 17,
      transitionDuration: 1000,
    });
  };

  const layers = [
    // Highlight layer for selected marker
    new ScatterplotLayer({
      id: 'selected-highlight',
      data: selectedLocation ? [selectedLocation] : [],
      getPosition: d => d.coordinates,
      getRadius: 25,
      getFillColor: [255, 255, 255, 200],
      getLineColor: d => getColor(d.status),
      getLineWidth: 3,
      radiusUnits: 'pixels',
      lineWidthUnits: 'pixels',
      pickable: false
    }),

    // Main icon layer
    new IconLayer({
      id: "icon-layer",
      data: locations,
      pickable: true,
      iconAtlas: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: (d) => "marker",
      sizeScale: 15,
      getPosition: (d) => d.coordinates,
      getSize: (d) => d.id === selectedLocation?.id ? 8 : 5,
      getColor: (d) => {
        const baseColor = getColor(d.status);
        return d.id === selectedLocation?.id 
          ? [baseColor[0], baseColor[1], baseColor[2], 255]
          : baseColor;
      },
      onClick: ({ object }) => handleLocationClick(object),
      onHover: ({ object }) => setSelectedLocation(object),
    })
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
            mapboxApiAccessToken={MAPBOX_API_KEY}
            mapStyle="mapbox://styles/mapbox/streets-v11"
          />
          {selectedLocation && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                zIndex: 999,
                backdropFilter: "blur(8px)",
                maxWidth: "300px",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
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
                  fontSize: "25px",
                  fontWeight: "bold",
                  color: "#666",
                }}
                onClick={() => setSelectedLocation(null)}
              >
                ×
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
          backgroundColor: "#f8f9fa",
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
              backgroundColor: selectedLocation?.id === location.id ? "#e6f7ff" : "white",
              border: `2px solid ${
                hoveredLocationId === location.id || selectedLocation?.id === location.id
                  ? `rgb(${getColor(location.status).slice(0, 3).join(",")})`
                  : "transparent"
              }`,
              transition: "all 0.2s",
              transform: selectedLocation?.id === location.id ? "translateX(4px)" : "none",
              boxShadow: selectedLocation?.id === location.id ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              fontWeight: selectedLocation?.id === location.id ? "600" : "400",
            }}
            onClick={() => handleLocationClick(location)}
            onMouseEnter={() => setHoveredLocationId(location.id)}
            onMouseLeave={() => setHoveredLocationId(null)}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: `rgb(${getColor(location.status).slice(0, 3).join(",")})`,
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
