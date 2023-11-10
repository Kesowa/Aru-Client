import DeckGL from "@deck.gl/react/typed";
import { ScatterplotLayer, SolidPolygonLayer } from "@deck.gl/layers/typed";
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoibmVlbGR1dHRhMTkiLCJhIjoiY2tweG9mN3F4MThrNTJ4cDk0enVjcTN4dCJ9.uxa_h0rjqumTxFMI1QELKQ";

import { MVTLayer } from "@deck.gl/geo-layers/typed";
import { MaskExtension } from "@deck.gl/extensions/typed";
import { useState } from "react";

const INITIAL_VIEW_STATE = {
  longitude: 88,
  latitude: 22,
  zoom: 13,
  pitch: 0,
  bearing: 0,
};
const getPolygon = (lat: number, lng: number, size: number) => [
  [lat - size * 0.5, lng - size * 0.5],
  [lat + size * 0.5, lng - size * 0.5],
  [lat + size * 0.5, lng + size * 0.5],
  [lat - size * 0.5, lng + size * 0.5],
];
function App() {
  const myLayer = new ScatterplotLayer({
    id: "myLayer",
    data: [
      { position: [88, 22], size: 100 },
      { position: [22, 88], size: 100 },
    ],
    geoPosition: (d) => d.position,
    getRadius: (d) => d.size,
    getColor: [255, 0, 0],
  });
  const [polygon, setPolygon] = useState(getPolygon(88, 22, 1));
  const maskLayer = new SolidPolygonLayer({
    id: "geofence",
    operation: "mask",
    data: [polygon],
    getPolygon: (d) => d,
    getColor: [255, 0, 0],
  });
  const myLayer2 = new MVTLayer({
    data: `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=${MAPBOX_ACCESS_TOKEN}`,
    minZoom: 0,
    maxZoom: 23,
    getLineColor: [192, 192, 192],
    getFillColor: [140, 170, 180],
    extensions: [new MaskExtension()],
    maskId: maskLayer.id,
  });
  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[maskLayer, myLayer, myLayer2]}
        style={{ position: "absolute", height: "100%", width: "100%" }}
        onHover={(info) => {
          const coords = getPolygon(info.x, info.y, 150);
          const mapCoords = coords.map((coord) =>
            info.viewport?.unproject(coord)
          );
          setPolygon(mapCoords);
        }}
      ></DeckGL>
    </div>
  );
}

export default App;