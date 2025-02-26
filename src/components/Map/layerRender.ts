import MarkerIcon from "../../static/MarkerIcon.png";
import TankIcon from "../../static/TankIcon.png";
import ValveIcon from "../../static/ValveIcon.png";
import DotIcon from "../../static/DotIcon.png";
import { TerrainLayer, Tile3DLayer, TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, GeoJsonLayer, IconLayer } from "@deck.gl/layers";
import { Tiles3DLoader } from "@loaders.gl/3d-tiles";
import {
  _TerrainExtension as TerrainExtension,
  MaskExtension,
} from "@deck.gl/extensions";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { API_URL, COG_URL, STATIC_URL, TITILER_STATIC } from "src/constants";
import { Feature, GeoJson, Point } from "src/types/geojson";
import { ILayer } from "src/types/layer";
import http from "src/services/httpCall";
import { hexToRGB, invertColor } from "./colorUtils";
import { MASK_ID } from ".";
import { featureType, featureTypes } from "src/static/vectorprops";
import { rasterProps } from "src/static/rasterprops";
import { handleHover } from "./utils/elevationTooltip";

export type Layer = ILayer & {
  _isChecked?: boolean;
  _render3D?: boolean;
  _isMasked?: boolean;
  _metadata?: {
    bounds?: [number, number, number, number];
    bidx?: string;
    bandExp?: string;
    colorMap?: string;
    resamplingMethod?: string;
    overlayId?: string;
    highlightIndexes?: number[];
    layerOpacity?:number;
  };
  _isMeshSource?: boolean;
};

export type IMissionLayers = {
  alertGeojsonUrl: string;
  vodGeojsonUrl: string;
  isAlertChecked: boolean;
  isVODChecked: boolean;
};

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

// const handleHover =
//  ({ x, y, layer,bitmap,sourceLayer}) => {
//       try {
//         const layerType = layer.raster;
//         const {device} = sourceLayer.context;
//         if (bitmap && layerType === "DEM") {
//           const pixelColor = device.readPixelsToArrayWebGL(sourceLayer.props.image,{
//             sourceX: bitmap.pixel[0],
//             sourceY: bitmap.pixel[1],
//             sourceWidth: 1,
//             sourceHeight: 1,
//           });
//           const [R, G, B] = pixelColor;
//           const scalarValue = pixelColor[0]/ 255.0;
//           const minp = layer.minp;
//           const maxp = layer.maxp;
//           const elevation = minp + (maxp - minp) * scalarValue;
//           const elevationInfo = {R,G,B, x, y, elevation }
//           valueChangeEmitter.emit('valueChanged', elevationInfo);
//         } else {
//           return null;
//         }
//       } catch (error) {
//         console.error("Try with the dem layer instead", error);
//       }
//     }

const getRasterDataUrl = (layer: Layer) => {
  const settings = {
    bidx: layer._metadata?.bidx || null,
    bandExp: layer._metadata?.bandExp || null,
    colorMap: layer._metadata?.colorMap || null,
    resamplingMethod: layer._metadata?.resamplingMethod || null,
    overlayId: layer._metadata?.overlayId || null,
  };
  switch (layer.raster) {
    case rasterProps.NDVI:
      return `${COG_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}%401x?url=${TITILER_STATIC}${layer.layerpath}`;

    case rasterProps.NDWI:
      return `${COG_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}%401x?url=${TITILER_STATIC}${layer.layerpath}&resampling_method=${settings.resamplingMethod}&bidx=${settings.bidx}`;

    case rasterProps.DEM:
      if (layer._render3D)
        return `${COG_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?url=${TITILER_STATIC}${layer.layerpath}&resampling_method=${settings.resamplingMethod}&algorithm=terrainrgb`;
      return `${COG_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?url=${TITILER_STATIC}${layer.layerpath}&resampling_method=${settings.resamplingMethod}&bidx=${settings.bidx}&rescale=${layer.minp}%2C${layer.maxp}&colormap_name=${settings.colorMap}`;

    case rasterProps.POINT_CLOUD:
      return `${STATIC_URL}${layer.metadata}`;

    case rasterProps.CESIUM_3D:
      return `${STATIC_URL}${layer.metadata}`;

    default:
      return `${COG_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${TITILER_STATIC}${layer.layerpath}`;
  }
};

export const ILayerToDeckLayer = (layers: Layer[]) => {
  const meshOverlayActive = layers.some((layer) => layer._isMeshSource);
  return layers
    .filter((layer) => layer._isChecked === true)
    .map((layer) => {
      let maskProps: Record<string, any> = layer._isMasked
        ? {
          // enable masking
          extensions: [new MaskExtension()],
          maskId: MASK_ID,
          // bring masked layers above others
          zIndex: 9999,
        }
        : {};

      const opacity = layer._metadata?.layerOpacity ?? 1;

      // Overrides previous mask settings
      if (meshOverlayActive && layer.type == "Vector") {
        maskProps = {
          extensions: [new TerrainExtension()],
        };
      }

      if (layer.type == "Raster") {
        if (
          layer.raster === rasterProps.POINT_CLOUD ||
          layer.raster === rasterProps.CESIUM_3D
        ) {
          return new Tile3DLayer({
            id: `${layer._id}-${layer._isMeshSource}`,
            data: getRasterDataUrl(layer),
            loader: Tiles3DLoader,
            _subLayerProps: {
              scenegraph: { _lighting: "flat" },
            },
            operation: layer._isMeshSource ? "terrain+draw" : "draw",
          });
        }
        if (layer.raster === rasterProps.DEM && layer._render3D === true) {
          const overlayLayer = layer._metadata?.overlayId
            ? layers.find((l) => l._id === layer._metadata?.overlayId)
            : layer;
          return new TerrainLayer({
            id: layer._id,
            elevationDecoder: {
              rScaler: 6553.6,
              gScaler: 25.6,
              bScaler: 0.1,
              offset: -10000,
            },
            minZoom: 13,
            opacity:opacity,
            maxZoom: 19,
            elevationData: getRasterDataUrl(layer),
            tileSize: 256,
            pickable: true,
            texture: overlayLayer
              ? getRasterDataUrl(overlayLayer)
              : getRasterDataUrl(layer),
          });
        }
        return new TileLayer({
          id: maskProps.extensions ? layer._id +".ext" : layer._id,
          data: getRasterDataUrl(layer),
          minZoom: 0,
          maxZoom: 24,
          tileSize: 256,
          pickable: true,
          onHover:(event) =>{
           handleHover({ ...event, layer })
          },
          extent: layer._metadata?.bounds,
          renderSubLayers: (props) => {
            const {
              bbox: { west, south, east, north },
            } = props.tile;
            return new BitmapLayer(props, {
              data: null,
              image: props.data,
              bounds: [west, south, east, north],
              opacity:opacity,
              ...maskProps,
            });
          },
          updateTriggers: {
            renderSubLayers: [opacity],
          },
        });
      } else if (layer.type === "Vector") {
        if (featureType[layer.vector] === featureTypes.POINT)
          return new GeoJsonLayer({
            id: maskProps.extensions ? layer._id +".ext" : layer._id,
            data: STATIC_URL + layer.layerpath,
            pickable: true,
            opacity:opacity,
            pointType: "icon",
            iconSizeMinPixels: 4,
            iconSizeUnits: "pixels",
            iconSizeScale: 10,
            getIconSize: 4,
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
        else if (featureType[layer.vector] === featureTypes.AIR_POLLUTION)
          return new HeatmapLayer({
            id: layer._id,
            data: fetch(STATIC_URL + layer.layerpath)
              .then((response) => response.json())
              .then((data) => data.features),
            getPosition: (d: any) => d.geometry.coordinates,
            getWeight: (d: any) => d.properties.aqi,
            aggregation: "SUM",
            pickable: true,
            pickingRadius: 20,
            // Masking Not supported in HeatmapLayer
          });
        else if (featureType[layer.vector] === featureTypes.WIND_DIRECTION)
          return new IconLayer({
            id: maskProps.extensions ? layer._id +".ext" : layer._id,
            data: fetch(STATIC_URL + layer.layerpath)
              .then((response) => response.json())
              .then((data: GeoJson<Feature<Point, { windSpeed: number }>>) => {
                const maxWindSpeed = data.features
                  .map((feature) => feature.properties.windSpeed)
                  .reduce((maxSpeed, curr) => Math.max(maxSpeed, curr), 0);
                data.features.forEach(
                  (feature) =>
                    (feature.properties["maxWindSpeed"] = maxWindSpeed)
                );
                return data;
              })
              .then((data) => data.features),
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
            id: maskProps.extensions ? layer._id + ".ext" : layer._id,
            data: fetch(STATIC_URL + layer.layerpath)
            .then((response) => response.json())
            .then((data) => {
              if (layer._metadata?.highlightIndexes) {
                for (const idx of layer._metadata?.highlightIndexes) {
                  if (idx) {
                    const oldColor = data.features[idx].properties?.color;
                    if (oldColor)
                      data.features[idx].properties.color = invertColor(oldColor);
                    else
                      data.features[idx].properties.color = "808080"; // light grey
                    // if property has no color, it would get assigned black ("000000") as default
                    // so to highlight property, light grey used
                  }
                }
              }
              return data.features;
            }),
            pickable: true,
            opacity:opacity,
            stroked: [
              featureTypes.MULTI_POLYGON,
              featureTypes.POLYGON,
            ].includes(featureType[layer.vector]),
            filled: [featureTypes.MULTI_POLYGON, featureTypes.POLYGON].includes(
              featureType[layer.vector]
            ),
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
          .get(API_URL + missionLayers.alertGeojsonUrl)
          .then((result) => result.data),
        pickable: true,
        pointType: "icon",
        iconSizeMinPixels: 4,
        iconSizeUnits: "pixels",
        iconSizeScale: 10,
        getIconSize: 4,
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
          .get(API_URL + missionLayers.vodGeojsonUrl)
          .then((result) => result.data),
        pickable: true,
        pointType: "icon",
        iconSizeMinPixels: 4,
        iconSizeUnits: "pixels",
        iconSizeScale: 10,
        getIconSize: 4,
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
