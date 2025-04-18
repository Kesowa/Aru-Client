import { useEffect, useRef, useState } from "react";
import connectSocket from "../../services/socketConnect";
import DeckGL, { FlyToInterpolator } from "deck.gl";
import { IconLayer, PathLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";
import { MAPBOX_API_KEY } from "src/constants";
import NavIcon from "../../static/nav_icon.png";
import { Socket } from "socket.io-client";
function DroneMap(props: any) {
  const [viewport, setViewport] = useState<any>(undefined);
  const [dPosition, setDPosition] = useState<any>({
    lat: undefined,
    long: undefined,
  });
  const [course, setCourse] = useState<any>(0);
  const [dronePath, setDronePath] = useState<any>([]);

  let socket = useRef<Socket | null>(null);

  //---listening for drone telemetry from socket------------
  useEffect(() => {
    socket.current = connectSocket(props.streamKey);

    if (socket.current !== null) {
      socket.current.on("TELEMETRY", (data) => {
        setDPosition({
          lat: data.location.lat,
          long: data.location.long,
        });
        setCourse(data.compass * -1);
        setDronePath([
          {
            path: [
              parseFloat(data.location.long.toFixed(6)),
              parseFloat(data.location.lat.toFixed(6)),
            ],
            name: "Drone's Flight Path",
            color: [255, 0, 0],
          },
        ]);
      });
    }

    return () => {socket.current?.close()};
  }, [props.streamKey]);

  //---------------Initializing and controlling viewport--------------------
  useEffect(() => {
    if (dPosition.lat !== undefined) {
      setViewport({
        longitude: dPosition.long,
        latitude: dPosition.lat,
        zoom: 17,
        minZoom: 0,
        maxZoom: 17,
        pitch: 0,
        bearing: 0,
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
      });
    } else {
      setViewport({
        longitude: 77.24178648315745,
        latitude: 28.66873123304511,
        zoom: 3,
        minZoom: 0,
        maxZoom: 17,
        pitch: 0,
        bearing: 0,
      });
    }
  }, [dPosition]);

  const markerData = [
    {
      name: "Drone",
      address: "",
      exits: 4214,
      coordinates: [dPosition.long, dPosition.lat],
    },
  ];

  const layers = [
    new PathLayer({
      id: "path-layer",
      data: dronePath,
      pickable: true,
      widthScale: 1,
      widthMinPixels: 1,
      capRounded: true,
      jointRounded: true,
      getPath: (d) => d.path,
      getColor: () => [0, 195, 255],
      getWidth: () => 3,
    }),
    new IconLayer({
      id: "icon-layer",
      data: markerData,
      pickable: true,
      getIcon: () => ({
        url: `${NavIcon}`,
        width: 100,
        height: 129,
        anchorY: 70,
        mask: false,
      }),
      sizeScale: 15,
      getPosition: (d) => {
        return d.coordinates;
      },
      getSize: () => 4,
      getAngle: () => course,
    }),
  ];

  return (
      <div style={{ height: "100%", width: "100%" }}>
        {viewport !== undefined && (
          <DeckGL
            initialViewState={viewport}
            controller={true}
            layers={layers}
            getTooltip={({ object }) => object?.name}
          >
            <StaticMap
              mapboxApiAccessToken={MAPBOX_API_KEY}
              mapStyle={"mapbox://styles/mapbox/streets-v8"}
            />
          </DeckGL>
        )}
      </div>
  );
}

export default DroneMap;
