import { COG_URL, STATIC_URL, TITILER_STATIC } from "src/constants";
import { Layer } from "../layerRender";
import * as turf from "@turf/turf";
import { BBox } from "src/types/geojson";
import Tileset from "src/types/cesium_tileset";
import WebMercatorViewport from "viewport-mercator-project";

export const fetchLayerBounds = async ({
  type,
  layerpath,
  vector,
  raster,
  metadata,
}: Layer): Promise<[number, number, number, number]> => {
  if (type === "Vector") {
    const response = await fetch(STATIC_URL + layerpath);
    const data = await response.json();
    let features = data.features;
    return turf.bbox(turf.featureCollection(features)) as BBox;
  } else if (["ORTHO", "DEM", "DTM", "NDVI"].includes(raster)) {
    const metaDataURL = `${COG_URL}/cog/info?url=${TITILER_STATIC}${layerpath}`;
    const response = await fetch(metaDataURL, {
      method: "GET",
    });
    const metadata = await response.json();
    return [
      metadata["bounds"][0],
      metadata["bounds"][1],
      metadata["bounds"][2],
      metadata["bounds"][3],
    ] as BBox;
  } else if (raster == "CESIUM_3D") {
    const res = await fetch(STATIC_URL + metadata);
    const tileset = (await res.json()) as Tileset;
    const bounds_rad = [
      tileset.properties.Longitude.minimum,
      tileset.properties.Latitude.minimum,
      tileset.properties.Longitude.maximum,
      tileset.properties.Latitude.maximum,
    ];
    return bounds_rad.map((coord) => (coord * 180) / Math.PI) as [
      number,
      number,
      number,
      number
    ];
  }
  // Implementation for Cesium_3D pending
  return [0, 0, 0, 0];
};

export const calculateViewport = (bbox: BBox) => {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const mapContainer = document.getElementById("view-default-view");
  if (!mapContainer) throw new Error("mapContainer not found!");

  const mapWidth = mapContainer.clientWidth; // Get the actual width of the map container
  const mapHeight = mapContainer.clientHeight;
  // Replace with the actual height of your map container

  // Calculate the new viewport using getViewState
  const viewport = new WebMercatorViewport({
    width: mapWidth,
    height: mapHeight,
  });

  // Get the new zoom and center to fit the layer on the screen
  const { longitude, latitude, zoom } = viewport.fitBounds(
    [
      [minLon, minLat],
      [maxLon, maxLat],
    ],
    {
      padding: 10,
      offset: [0, 0],
    }
  );

  return {
    longitude,
    latitude,
    zoom,
  };
};
