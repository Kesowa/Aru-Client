import { useEffect, useState } from "react";
import { connect } from "react-redux";
import connectSocket from "../../services/socketConnect";
import DeckGL, { FlyToInterpolator } from "deck.gl";
import { IconLayer, PathLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";
import { MAPBOX_API_KEY } from "src/constants";
import NavIcon from "../../static/nav_icon.png";
function DroneMap(props: any) {
  const [INITIAL_VIEW_STATE, setViewport] = useState<any>(undefined);
  const [dPosition, setDPosition] = useState<any>({
    lat: undefined,
    long: undefined,
  });
  const [course, setCourse] = useState<any>(0);
  const [dronePath, setDronePath] = useState<any>([]);
  const [pathArray, setPathArray] = useState<any>([]);

  let socket: any;

  //---listening for drone telemetry from socket------------
  useEffect(() => {
    socket = connectSocket(props.streamKey);

    if (socket !== null) {
      socket.on("TELEMETRY", (data) => {
        setDPosition({
          lat: data.location.lat,
          long: data.location.long,
        });
        setCourse(data.compass * -1);
        const currPath = pathArray;
        if (currPath.length == 0) {
          currPath.push([
            parseFloat(data.location.long.toFixed(6)),
            parseFloat(data.location.lat.toFixed(6)),
          ]);
        } else if (
          currPath.at(-1)[0] !== parseFloat(data.location.long.toFixed(6)) &&
          currPath.at(-1)[1] !== parseFloat(data.location.lat.toFixed(6))
        ) {
          currPath.push([
            parseFloat(data.location.long.toFixed(6)),
            parseFloat(data.location.lat.toFixed(6)),
          ]);
        }
        setDronePath([
          {
            path: currPath,
            name: "Drone's Flight Path",
            color: [255, 0, 0],
          },
        ]);
      });
    }

    return () => socket.close();
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
      getColor: (d) => [0, 195, 255],
      getWidth: (d) => 3,
    }),
    new IconLayer({
      id: "icon-layer",
      data: markerData,
      pickable: true,
      getIcon: (d) => ({
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
      getSize: (d) => 4,
      getAngle: (d) => course,
    }),
  ];

  return (
    <>
      <div style={{ height: "100%", width: "100%" }}>
        {INITIAL_VIEW_STATE !== undefined && (
          <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={layers}
            getTooltip={({ object }) => object && object.name}
          >
            <StaticMap
              mapboxApiAccessToken={MAPBOX_API_KEY}
              mapStyle={"mapbox://styles/mapbox/streets-v8"}
            />
          </DeckGL>
        )}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    gmapLoaded: state.Gmap.gmapLoaded,
  };
};

export default connect(mapStateToProps)(DroneMap);
