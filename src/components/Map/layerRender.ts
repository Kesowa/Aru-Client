import MarkerIcon from "../../static/MarkerIcon.png";
import TankIcon from "../../static/TankIcon.png";
import ValveIcon from "../../static/ValveIcon.png";
import DotIcon from "../../static/DotIcon.png";
import { TerrainLayer } from "@deck.gl/geo-layers/typed";
import {
  BitmapLayer,
  GeoJsonLayer,
  IconLayer,
} from "@deck.gl/layers/typed";
import { MaskExtension } from "@deck.gl/extensions/typed";
import { HeatmapLayer, TileLayer } from "deck.gl";
import { COG_URL, STATIC_URL, TITILER_STATIC } from "src/constants";
import { Feature, GeoJson, Point } from "src/types/geojson";
import { ILayer } from "src/types/layer";
import http from "src/services/httpCall";
import { hexToRGB } from "./colorUtils";
import { MASK_ID } from ".";

export type Layer = ILayer & {
  isChecked?: boolean,
  render3D?: boolean,
  isMasked?: boolean,
}

export type IMissionLayers = {
  alertGeojsonUrl: string,
  vodGeojsonUrl: string,
  isAlertChecked: boolean,
  isVODChecked: boolean,
}

const createSVGIcon = (color: string) => {
  return `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
    width="800px" height="800px" viewBox="0 0 490.939 490.939" xml:space="preserve">
    <g>
      <g>
        <path style="fill:${color};" d="M41.552,490.939c-2.665,0-5.297-1.064-7.237-3.095c-3.185-3.337-3.675-8.419-1.186-12.303L181.221,244.52L33.149,15.43
          c-2.508-3.88-2.031-8.973,1.152-12.32c3.183-3.347,8.245-4.081,12.246-1.768l407.844,235.47c3.094,1.786,5,5.088,5,8.66
          s-1.906,6.874-5,8.66L46.548,489.6C44.986,490.5,43.263,490.939,41.552,490.939z M72.451,39.39l129.061,199.679
          c2.128,3.293,2.136,7.525,0.02,10.825L72.156,451.721l357.236-206.25L72.451,39.39z"/>
      </g>
    </g>
  </svg>`;
};

const svgToDataURL = (svg: string) => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
const getRasterDataUrl = (layer: Layer) => {
  switch (layer.raster.name) {
    case "NDVI":
      return (
        `${COG_URL}/cog/tiles/{z}/{x}/{y}%401x?url=${TITILER_STATIC}${layer.layerpath}`
      );

    case "NDWI":
      return (
        `${COG_URL}/cog/tiles/{z}/{x}/{y}%401x?url=${TITILER_STATIC}${layer.layerpath}&resampling_method=${layer.raster.resamplingMethod}&bidx=${layer.raster.bidx}`
      );

    case "DEM":
      return `${COG_URL}/cog/tiles/{z}/{x}/{y}@1x?url=${TITILER_STATIC}${layer.layerpath}&resampling_method=${layer.raster.resamplingMethod}&bidx=${layer.raster.bidx}&rescale=${layer.minp}%2C${layer.maxp}&colormap_name=${layer.raster.colorMap}`;

    default:
      return (
        `${COG_URL}/cog/tiles/{z}/{x}/{y}.png?url=${TITILER_STATIC}${layer.layerpath}`
      );
  }
}

export const ILayerToDeckLayer = (layers: Layer[]) => {
  return layers
    .filter(layer => layer.isChecked === true)
    .map(layer => {

      const maskProps = layer.isMasked
        ? {
            // enable masking
            extensions: [new MaskExtension()],
            maskId: MASK_ID,
            // bring masked layers above others
            zIndex: 9999,
          }
        : {};

      if (layer.type == "Raster") {
        if (layer.raster.name == "DEM" && layer.render3D == true) {
          const overlayLayer = layer.raster.overlayId
            ? layers.find((l) => l._id === layer.raster.overlayId)
            : layer;
          console.log("OVERLAYY LAYER => ", overlayLayer);
          return new TerrainLayer({
            id: layer._id,
            elevationDecoder: {
              rScaler: 0.299,
              gScaler: 0.587,
              bScaler: 0.114,
              offset: 0,
            },
            minZoom: 13,
            maxZoom: 19,
            elevationData: getRasterDataUrl(layer),
            tileSize: 256,
            texture: overlayLayer
              ? getRasterDataUrl(overlayLayer)
              : getRasterDataUrl(layer),
          });
        }
        console.log("RENDERING RASTER LAYER!!!!");
        return new TileLayer({
          id: layer._id,
          data: getRasterDataUrl(layer),
          minZoom: 0,
          maxZoom: 24,
          tileSize: 256,
          pickable: true,
          renderSubLayers: (props) => {
            const {
              bbox: { west, south, east, north },
            } = props.tile;
            return new BitmapLayer(props, {
              data: null,
              image: props.data,
              bounds: [west, south, east, north],
              ...maskProps,
            });
          },
        });

      }
      else if (layer.type == "Vector") {
        if (layer.vector.type == "Point")
          return new GeoJsonLayer({
            id: layer._id,
            data: fetch(STATIC_URL + layer.layerpath).then(response => response.json()),
            pickable: true,
            pointType: "icon",
            iconSizeMinPixels: 6,
            iconSizeUnits: "meters",
            iconSizeScale: 10,
            getIconSize: 2,
            getIcon: (d) => {
              const iconSelector = (iconType) => {
                let icon = "";
                switch (iconType) {
                  case "MarkerIcon":
                    icon = MarkerIcon;
                    break;
                  case "TankIcon":
                    icon = TankIcon;
                    break;
                  case "DotIcon":
                    icon = DotIcon;
                    break;
                  case "ValveIcon":
                    icon = ValveIcon;
                    break;
                }
                return icon;
              };
              return {
                url: iconSelector(d.properties.icon),
                width: 100,
                height: 129,
                anchorY: 125,
                mask: true,
              };
            },
            getIconColor: (d) =>
              d.properties?.color
                ? hexToRGB(d.properties?.color as string)
                : hexToRGB("#ff0000"),
            ...maskProps,
          });
        else if (layer.vector.type == "air_pollution")
          return new HeatmapLayer({
            id: layer._id,
            data: fetch(STATIC_URL + layer.layerpath).then(response => response.json()).then(data => data.features),
            getPosition: (d: any) => d.geometry.coordinates,
            getWeight: (d: any) => d.properties.aqi,
            aggregation: "SUM",
            pickable: true,
            pickingRadius: 20,
            // Masking Not supported in HeatmapLayer
          });
        else if (layer.vector.type == "wind_direction")
          return new IconLayer({
            id: layer._id,
            data: fetch(STATIC_URL + layer.layerpath).then(response => response.json()).then((data: GeoJson<Feature<Point, { windSpeed: number }>>) => {
              const maxWindSpeed = data.features.map(feature => feature.properties.windSpeed).reduce((maxSpeed, curr) => Math.max(maxSpeed, curr), 0);
              data.features.forEach(feature => feature.properties["maxWindSpeed"] = maxWindSpeed);
              return data;
            }).then(data => data.features),
            getPosition: (d: any) => d.geometry.coordinates,
            getIcon: (d: any, { index }: { index: any }) => {
              const windSpeed = d.properties.windSpeed;
              const maxWindSpeed = d.properties.maxWindSpeed;

              // Check if windSpeed is a valid number
              if (
                !isNaN(windSpeed) &&
                !isNaN(maxWindSpeed) &&
                maxWindSpeed !== 0
              ) {
                const t = windSpeed / maxWindSpeed;
                const color = `rgb(${255 * (1 - t)}, ${255 * t}, 0)`;

                return {
                  url: svgToDataURL(createSVGIcon(color)),
                  width: 1024,
                  height: 1024,
                };
              } else {
                return {
                  url: svgToDataURL(createSVGIcon("rgb(255, 0, 0)")),
                  width: 1024,
                  height: 1024,
                };
              }
            },

            getSize: (d) => d.properties.windSpeed * 4,
            getAngle: (d) => 90 - d.properties.windDirection,

            ...maskProps,
          });
        else
          return new GeoJsonLayer({
            id: layer._id,
            data: STATIC_URL + layer.layerpath,
            pickable: true,
            stroked: ["MultiPolygon", "Polygon"].includes(layer.vector.type),
            filled: ["MultiPolygon", "Polygon"].includes(layer.vector.type),
            extruded: false,
            lineWidthUnits: "pixels",
            lineWidthScale: 4,
            lineWidthMinPixels: 2,
            getLineColor: (d) =>
              d.properties?.color
                ? hexToRGB(d.properties?.color as string)
                : hexToRGB("#000000"),
            getFillColor: (d) =>
              d.properties?.color
                ? hexToRGB(d.properties?.color as string, 50)
                : hexToRGB("#000000"),
            ...maskProps,
          });
      }
    });
};

export const MissionLayerToDeckLayer = (missionLayers: IMissionLayers) => {
  const deckLayers: GeoJsonLayer[] = [];

  const getIcon = (d) => {
    const iconSelector = (iconType) => {
      let icon = "";
      switch (iconType) {
        case "MarkerIcon":
          icon = MarkerIcon;
          break;
        case "TankIcon":
          icon = TankIcon;
          break;
        case "DotIcon":
          icon = DotIcon;
          break;
        case "ValveIcon":
          icon = ValveIcon;
          break;
      }
      return icon;
    };
    return {
      url: iconSelector(d.properties.icon),
      width: 100,
      height: 129,
      anchorY: 125,
      mask: true,
    };
  };

  if (missionLayers.isAlertChecked) {
    deckLayers.push(
      new GeoJsonLayer({
        id: "alert",
        data: http
          .get(STATIC_URL + missionLayers.alertGeojsonUrl)
          .then((result) => result.data),
        pickable: true,
        pointType: "icon",
        iconSizeMinPixels: 6,
        iconSizeUnits: "meters",
        iconSizeScale: 10,
        getIconSize: 2,
        getIcon,
        getIconColor: (d) =>
          d.properties?.color
            ? hexToRGB(d.properties?.color as string)
            : hexToRGB("#ff0000"),
      })
    );
  }
  if (missionLayers.isVODChecked) {
    deckLayers.push(
      new GeoJsonLayer({
        id: "vod",
        data: http
          .get(STATIC_URL + missionLayers.vodGeojsonUrl)
          .then((result) => result.data),
        pickable: true,
        pointType: "icon",
        iconSizeMinPixels: 6,
        iconSizeUnits: "meters",
        iconSizeScale: 10,
        getIconSize: 2,
        getIcon,
        getIconColor: (d) =>
          d.properties?.color
            ? hexToRGB(d.properties?.color as string)
            : hexToRGB("#ff0000"),
      })
    );
  }

  return deckLayers;
};
