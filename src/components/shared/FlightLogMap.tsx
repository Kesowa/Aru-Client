import React, { useEffect, useState } from "react";
import DeckGL, { FlyToInterpolator } from "deck.gl";
import { IconLayer, PathLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";
import * as turf from "@turf/turf";
import { MAPBOX_API_KEY } from "src/constants";
import NavIcon from "../../static/nav_icon.png";

const ICON_MAPPING = {
  marker: {
    x: 0,
    y: 0,
    width: 128,
    height: 128,
    mask: true,
    anchorX: 64,
    anchorY: 120,
  },
};

function FlightLogMap(props) {
  const [marker, setMarker] = useState([]);
  const [bearing, setBearing] = useState(0);
  const [dronePath, setDronePath] = useState<any>([]);
  const [INITIAL_VIEW_STATE, setViewport] = useState<any>(undefined);

  function getBearing(
    startLat: any,
    startLong: any,
    endLat: any,
    endLong: any
  ) {
    const p1 = turf.point([startLong, startLat]);
    const p2 = turf.point([endLong, endLat]);
    const bearing = turf.bearing(p1, p2);
    if (bearing > 0) {
      return bearing * -1;
    } else if (bearing < 0) {
      return bearing * -1;
    } else {
      return 0;
    }
  }

  //---------viewport alignment---------
  useEffect(() => {
    if (marker !== undefined && marker.length > 0) {
      setViewport({
        longitude: marker[0],
        latitude: marker[1],
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
        // transitionDuration: 1000,
        // transitionInterpolator: new FlyToInterpolator(),
      });
    }
  }, [marker]);

  //-----creating drone path-----
  useEffect(() => {
    if (props.flight) {
      const filterArray: any = props.flight.filter(
        (i: any) => i[0] !== null && i[1] !== null
      );
      setDronePath([
        {
          path: filterArray,
          name: "Drone's Flight Path",
          color: [255, 0, 0],
        },
      ]);
    }
  }, [props.flight]);

  ///--------------rendering navigator location------------------------------------
  useEffect(() => {
    if (props.flight && dronePath && props.played) {
      if (props.flight.length > 0) {
        const x = Math.floor(props.played * props.flight.length);
        if (
          props.flight[x] !== undefined &&
          props.flight[x][0] !== null &&
          props.flight[x][1] !== null
        ) {
          setMarker(props.flight[x]);
          const startPoint: any = props.flight[x];
          const endPoint: any = props.flight[x + 1];
          console.log("start", startPoint, "end", endPoint);
          if (
            startPoint !== undefined &&
            endPoint !== undefined &&
            startPoint[0] !== null &&
            endPoint[0] !== null &&
            startPoint[1] !== null &&
            endPoint[1] !== null
          ) {
            setBearing(
              getBearing(startPoint[1], startPoint[0], endPoint[1], endPoint[0])
            );
          }
        }
      }
    }
  }, [props.played, dronePath, props.flight]);

  const markerData = [
    {
      name: "Drone",
      address: "",
      exits: 4214,
      coordinates: marker,
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
      //billboard: true,
      getPath: (d) => d.path,
      getColor: (d) => [0, 195, 255],
      getWidth: (d) => 3,
    }),
    // new PathLayer({
    //   id: "path-layer-completed",
    //   data: compPath,
    //   pickable: true,
    //   widthScale: 1,
    //   widthMinPixels: 1,
    //   capRounded: true,
    //   jointRounded: true,
    //   getPath: (d) => d.path,
    //   getColor: (d) => [10, 204, 72],
    //   getWidth: (d) => 5,
    // }),
    // new IconLayer({
    //   id: "icon-layer2",
    //   data: markerData,
    //   pickable: true,
    //   // iconAtlas and iconMapping are required
    //   // getIcon: return a string
    //   iconAtlas:
    //     "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
    //   iconMapping: ICON_MAPPING,
    //   getIcon: (d) => "marker",
    //   // getIcon: (d) => ({
    //   //   url: `${API_URL}/icons/nav_icon.png`,
    //   //   width: 100,
    //   //   height: 129,
    //   //   anchorY: 115,
    //   //   mask: false,
    //   // }),
    //   sizeScale: 15,
    //   getPosition: (d) => {
    //     // console.log(d, "getpos");
    //     return d.coordinates;
    //   },
    //   getSize: (d) => 5,
    //   getColor: (d) => [Math.sqrt(d.exits), 140, 0],
    // }),
    new IconLayer({
      id: "icon-layer",
      data: markerData,
      pickable: true,
      // iconAtlas and iconMapping are required
      // getIcon: return a string
      // iconAtlas:
      //   "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      // iconMapping: ICON_MAPPING,
      // getIcon: (d) => "marker",
      getIcon: (d) => ({
        url: `${NavIcon}`,
        width: 100,
        height: 129,
        anchorY: 70,
        mask: false,
      }),
      sizeScale: 15,
      getPosition: (d) => {
        // console.log(d, "getpos");
        return d.coordinates;
      },
      getSize: (d) => 4,
      getAngle: (d) => bearing,
      //getColor: (d) => [Math.sqrt(d.exits), 140, 0],
    }),
  ];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {INITIAL_VIEW_STATE !== undefined && (
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
          // getTooltip={({ object }) =>
          //   object && `${object.name}\n${object.address}`
          // }
          getTooltip={({ object }) => object && object.name}
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

export default FlightLogMap;
