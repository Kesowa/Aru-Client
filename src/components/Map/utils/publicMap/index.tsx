// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import KesowaNewLogo from "../../../../static/kesowa-black.png";
import InfoWindowContent from "../infoWindow";
import { DataFilterExtension } from "@deck.gl/extensions";
import * as turf from "@turf/turf";
import {
  Row,
  Col,
  Card,
  Tabs,
  Typography,
  Button,
  Tooltip,
  Spin,
  message,
  Tree,
  Menu,
  Dropdown,
  Modal,
  Upload,
  Input,
  Select,
  Space,
  Popover,
} from "antd";
import {
  DoubleRightOutlined,
  FileImageOutlined,
  DoubleLeftOutlined,
  BranchesOutlined,
  EnvironmentOutlined,
  GatewayOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExclamationCircleOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import "../../index.less";
import DeckGL from "@deck.gl/react";
import { FlyToInterpolator } from "deck.gl";
import {
  BitmapLayer,
  GeoJsonLayer,
  IconLayer,
  PathLayer,
} from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { HtmlOverlayItem, HtmlOverlay } from "@nebula.gl/overlays";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import {
  DrawPolygonMode,
  CompositeMode,
  ModifyMode,
  ViewMode,
  DrawLineStringMode,
  DrawPointMode,
  GeoJsonEditMode,
} from "nebula.gl";
import { StaticMap } from "react-map-gl";
//import MapAttributes from "./mapAttributes";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { connect } from "react-redux";
import { loading } from "../../../../actions/loadingAction";
import { logout } from "../../../../actions/authAction";
import moment from "moment";
import { useHistory, useParams } from "react-router-dom";
//import Images from "./Images";
//import LayerDocs from "./layerDocs";
//import CreateLayer from "./createLayer";
//import CreateBaseLayer from "./createBaseLayer";
import {
  COG_URL,
  MAPBOX_API_KEY,
  STATIC_URL,
  TITILER_STATIC,
} from "src/constants";
import FourOhOne from "src/components/shared/Error/FourOhOne";
import InternalServerError from "src/components/shared/Error/InternalServerError";
import ServiceUnvailable from "src/components/shared/Error/ServiceUnavailable";
import GatewayTimeout from "src/components/shared/Error/GatewayTimeout";
import FourOFour from "src/components/shared/Error/FourOFour";

interface Config {
  mode: typeof GeoJsonEditMode;
}

const DRAW_EDIT_POLYGON = new CompositeMode([
  new DrawPolygonMode(),
  new ModifyMode(),
]);
const DRAW_EDIT_LINE = new CompositeMode([
  new DrawLineStringMode(),
  new ModifyMode(),
]);
const DRAW_EDIT_POINT = new CompositeMode([
  new DrawPointMode(),
  new ModifyMode(),
]);

const { Title, Text, Link } = Typography;
const { Dragger } = Upload;
const { Option } = Select;
const { TabPane } = Tabs;
const { SubMenu } = Menu;
const { Meta } = Card;
const { Search } = Input;

function PublicMap(props) {
  const selectedLayer = decodeURI(window.location.hash).slice(1); // Get selected layer from url hashed part
  const socket: any = useRef();
  const [showBorder, setShowBorder] = useState(false);
  const [osmState, setOsmState] = useState(false);
  const [errorState, setErrorState] = useState("");
  const [defaultLocation, setDefaultLocation] = useState({
    lat: 22.571194159512256,
    lng: 88.49175358524279,
  });
  // Viewport settings
  const [INITIAL_VIEW_STATE, setViewport] = useState<any>({
    longitude: defaultLocation.lng,
    latitude: defaultLocation.lat,
    zoom: 13,
    pitch: 0,
    minZoom: 0,
    maxZoom: 22,
    bearing: 0,
    // transitionDuration: 8000,
    // transitionInterpolator: new FlyToInterpolator(),
  });

  // ---- setting map location -----------------
  useEffect(() => {
    if (navigator.geolocation) {
      if (navigator.permissions !== undefined) {
        navigator.permissions
          .query({ name: "geolocation" })
          .then(function (result: any) {
            if (result.state === "granted") {
              navigator.geolocation.getCurrentPosition(function (pos: any) {
                const crd = pos.coords;
                // console.log("Your current position is:");
                // console.log(`Latitude : ${crd.latitude}`);
                // console.log(`Longitude: ${crd.longitude}`);
                // console.log(`More or less ${crd.accuracy} meters.`);
                setViewport({
                  longitude: crd.longitude,
                  latitude: crd.latitude,
                  zoom: 13,
                  pitch: 0,
                  minZoom: 0,
                  maxZoom: 22,
                  bearing: 0,
                  transitionDuration: 1000,
                  transitionInterpolator: new FlyToInterpolator(),
                });
              });
            } else if (result.state === "prompt") {
              navigator.geolocation.getCurrentPosition(
                function (pos: any) {
                  const crd = pos.coords;
                  // console.log("Your current position is:");
                  // console.log(`Latitude : ${crd.latitude}`);
                  // console.log(`Longitude: ${crd.longitude}`);
                  // console.log(`More or less ${crd.accuracy} meters.`);
                  setViewport({
                    longitude: crd.longitude,
                    latitude: crd.latitude,
                    zoom: 13,
                    pitch: 0,
                    minZoom: 0,
                    maxZoom: 22,
                    bearing: 0,
                    transitionDuration: 1000,
                    transitionInterpolator: new FlyToInterpolator(),
                  });
                },
                function (err) {
                  console.log(`Location fetch error: \n ${err}`);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 5000,
                  maximumAge: 0,
                }
              );
            } else if (result.state === "denied") {
              message.warning(
                "Please allow location access from your browser for best experience of ARU!"
              );
            }
            result.onChange = function () {
              console.log(result.state);
            };
          });
      } else {
        console.log("sample");
      }
    } else {
      console.log("Sorry navigator not available!");
    }
  }, []);

  const COPYRIGHT_LICENSE_STYLE: any = {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "hsla(0,0%,100%,.5)",
    padding: "0 5px",
    font: "12px/20px Helvetica Neue,Arial,Helvetica,sans-serif",
  };
  const LINK_STYLE = {
    textDecoration: "none",
    color: "rgba(0,0,0,.75)",
    cursor: "grab",
  };
  const devicePixelRatio =
    (typeof window !== "undefined" && window.devicePixelRatio) || 1;

  const [selectedKey, setSelectedKey] = useState<any>();

  //---------------------Open Stree Maps Layer ----------------------------------------------------
  const osm = [
    new TileLayer({
      // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
      data: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      maxRequests: 20,
      pickable: true,
      onViewportLoad: null,
      autoHighlight: showBorder,
      highlightColor: [60, 60, 60, 40],
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: devicePixelRatio === 1 ? -1 : 0,

      renderSubLayers: (props) => {
        const {
          bbox: { west, south, east, north },
        } = props.tile;

        return [
          new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north],
          }),
          showBorder &&
            new PathLayer({
              id: `${props.id}-border`,
              visible: props.visible,
              data: [
                [
                  [west, north],
                  [west, south],
                  [east, south],
                  [east, north],
                  [west, north],
                ],
              ],
              getPath: (d) => d,
              getColor: [255, 0, 0],
              widthMinPixels: 4,
            }),
        ];
      },
    }),
  ];

  const [showPopup, togglePopup] = useState(false);
  const [searching, SetSearching] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [featureData, setFeatureData] = useState<any>([]);
  const [sysId, setSysId] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [sideBarState, setSideBarState] = useState(true);
  const [sideBarIcon, setSideBarIcon] = useState(<DoubleRightOutlined />);
  const [loader, setLoader] = useState(false);
  const [attributeTable, SetAttributeTable] = useState([]);
  const [mapMode, setMapMode] = useState("mapbox://styles/mapbox/streets-v8");
  const [isModalVisible, setIsModalVisible] = useState(false); // upload layer
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false); // upload layer modal
  const [isModalVisible3, setIsModalVisible3] = useState(false); // create layer modal
  const [isModalVisible4, setIsModalVisible4] = useState(false); // create base layer modal
  const [timeFilter, setTimeFilter] = useState(false);
  const [bottomBarHeight, setBottomBarHeight] = useState("240px");
  const [layerColor, setLayerColor] = useState("#ffaa00");
  const [icon, setIcon] = useState("");
  const [fileList, setFileList] = useState<any>([]);
  const [rasterProps, setRasterProps] = useState<any>([]);
  const [vectorProps, setVectorProps] = useState<any>([]);
  const [data, setData] = useState();
  const [editingKey, setEditingKey] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [mission, setMission] = useState("");
  const [layerType, setLayerType] = useState("");
  const [layerTypeId, setLayerTypeId] = useState("");
  const [captureDate, setCaptureDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [layerName, setLayerName] = useState("");
  const [infoWindowMode, setInfoWindowMode] = useState("");
  const [activeKey, setActiveKey] = useState<any>();
  const [panes, setPanes] = useState<any>([]);
  const [tabKeys, setTabKeys] = useState<any>([]);
  const [drawMode, setdrawMode] = useState("");
  const [formDrawerVisible, setformDrawerVisible] = useState(false);
  const [viewImages, setViewImages] = useState(false);
  const [selectedLayerInfo, setSelectedLayerInfo] = useState({});
  const [viewDocs, setViewDocs] = useState(false);
  const [vectorLayers, setvectorLayers] = useState<any>([]);
  const [saveButtonShow, setSaveButtonShow] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toolSelected, setToolSelected] = useState("");
  const [defaultLayerType, setDefaultLayerType] = useState<any>([]);
  const [activeType, setActiveType] = useState(false);
  const [totalLayers, setTotalLayers] = useState(0);
  const [time, setTime] = useState("100 days");
  const [timeEnabled, setTimeEnabled] = useState<any>();
  const [sortType, setSortType] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [showEditModel, setshowEditModel] = useState(false);
  const [selectedRasterProps, setSelectedRasterProps] = useState<any>([]);
  const [selectedVectorProps, setSelectedVectorProps] = useState<any>([]);
  const [selectedVectorPropsType, setSelectedVectorPropsType] = useState<any>(
    []
  );
  const [inheritColor, setInheritColor] = useState(false);
  const [chipsLoading, setChipsLoading] = useState(false);
  const [lastAdded, setLastAdded] = useState("");
  const [valid, setValid] = useState(true);
  const [showColorPicker, setshowColorPicker] = useState(true);
  const [layerLoading, setLayerLoading] = useState(false);
  const [threeDState, set3DState] = useState("");
  const [T3DTranspose, set3DTranspose] = useState(false);
  const [picToMapData, setPicToMapData] = useState([]);
  const [pic2Mapv2Status, setPic2Mapv2Status] = useState(false);
  const [pic2Mapv2Data, setPic2Mapv2Data] = useState<any>({});
  const [layerz, setlayerz] = useState<any>([]);
  const [activeGroupButton, setActiveGroupButton] = useState(true);
  const [isLayerDocs, setIsLayerDocs] = useState(false);
  const [isUpdate, setUpdate] = useState(false);
  const [updateType, setUpdateType] = useState("");
  const [updateId, setUpdateId] = useState("");
  //----------------auto detect browser height---------------------
  // let initHeight = window.screen.height;
  // if(initHeight === 1080){
  //   setBottomBarHeight("500px");

  // }

  const history = useHistory();

  useEffect(() => {
    setTimeout(() => {
      if (layerLoading) {
        setLayerLoading(false);
      }
    }, 1000);
  }, [layerLoading]);

  useEffect(() => {
    const initHeight = window.screen.height;
    if (initHeight >= 1080) {
      setBottomBarHeight("480px");
    }
  }, []);

  const [modeState, setModeState] = useState({
    editMode: null,
    isCompleted: false,
  });

  const [mode, setMode] = useState<Config>({
    mode: ViewMode,
  });

  const myFeatureCollection: any = {
    type: "FeatureCollection",
    features: [],
  };

  const [selectedFeatureIndexes, setselectedFeatureIndexes] = useState([]);
  const [featureState, setFeatureState] = useState({
    data: myFeatureCollection,
  });

  const [selectedLayerId, setSelectedLayerId] = useState<any>();

  const [layerToAddInAttributeTable, setlayerToAddInAttributeTable] =
    useState<any>(null);

  const [scaleVisible, setScaleVisible] = useState(false);

  const { id, tenantId, missionId } = useParams<any>(); // fetch id from url

  // ----------------------------------------- disable default right click event of browser ----------------------------------------------------------
  useEffect(() => {
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }, []);

  useEffect(() => {
    if (sortType == "createdAt") {
      const data: any = [...treeDataa];
      if (isAscending) {
        data[0].children.sort((a, b) =>
          moment(a.captureDate).diff(moment(b.captureDate))
        );
        data[1].children.sort((a, b) =>
          moment(a.captureDate).diff(moment(b.captureDate))
        );
      } else {
        data[0].children.sort((a, b) =>
          moment(b.captureDate).diff(moment(a.captureDate))
        );
        data[1].children.sort((a, b) =>
          moment(b.captureDate).diff(moment(a.captureDate))
        );
      }
      setTreeDataa(data);
    }
    if (sortType == "name") {
      const data: any = [...treeDataa];
      if (isAscending) {
        data[0].children.sort((a, b) => a.name.localeCompare(b.name));
        data[1].children.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        data[0].children.sort((a, b) => b.name.localeCompare(a.name));
        data[1].children.sort((a, b) => b.name.localeCompare(a.name));
      }
      setTreeDataa(data);
    }
  }, [sortType, isAscending]);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [colorMap, SetColorMap] = useState("plasma");
  const [featureLayer, setFeatureLayer] = useState("");
  const [featureLayerPath, setFeatureLayerPath] = useState("");
  const [windowTitle, setWindowTitle] = useState("");
  const [selectedLayerLabel, setSelectedLayerLabel] = useState("");
  const [activeID, setActiveID] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState<React.Key[]>([]);
  const [showSelectedIndexes, setshowSelectedIndexes] = useState([]);
  const [key, setKey] = useState("");
  const [defaultKeys, setDefaultKeys] = useState<React.Key[]>([]);
  const onExpand = (expandedKeysValue: React.Key[]) => {
    //console.log("onExpand", expandedKeysValue);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const [allLayers, setAllLayers] = useState({});
  const [visibleLayers, setVisibleLayers] = useState([]);
  const [colorChangeFeatureData, setColorChangeFeatureData] =
    useState<any>(null);
  const [showColorChangeForm, setShowColorChangeForm] = useState(false);
  const [color, setColor] = useState("");
  const [scales, setScales] = useState([]);

  useEffect(() => console.log("All layers: ", allLayers), [allLayers]); //---printing all layers in state

  //--------Generate Fill Color----------------------------------------------
  function hexToRGB(hex, o) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const opacity = o ? 150 : 50;
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
          opacity,
        ]
      : null;
  }

  function hexToRGB2(hex, o) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const opacity = o ? 150 : 50;
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : null;
  }

  //----------------------------INFO WINDOW handeller------------------------
  function InfoWindow(
    coordinate: any,
    layername: any,
    mode: any,
    feature: any,
    show: any,
    id: any,
    sysId: any
  ) {
    //console.log(data);
    //console.log(coordinate);
    console.log("sysid:", sysId);
    setCoordinates(coordinate);
    setSysId(sysId);
    setFeatureData(feature);
    setLayerName(layername);
    setInfoWindowMode(mode);
    setFeatureLayer(id);
    togglePopup(true);
    setSaveButtonShow(show);
    //console.log("onclick", index);
  }

  //-----------------------Fetch Raster URL----------------------------------
  const getRasterURL = (rasterType, path, settings) => {
    //SetColorMap(settings.color);
    switch (rasterType) {
      case "NDVI":
        return (
          `${COG_URL}` +
          `/cog/tiles` +
          `/{z}/{x}/{y}%401x?url=${TITILER_STATIC}` +
          path
        );

      case "NDWI":
        return (
          `${COG_URL}` +
          `/cog/tiles` +
          `/{z}/{x}/{y}%401x?url=${TITILER_STATIC}` +
          path +
          `&resampling_method=${settings.resamplingMethod}&bidx=${settings.bidx}`
        );

      case "DEM":
        return (
          `${COG_URL}` +
          `/cog/tiles` +
          `/{z}/{x}/{y}@1x?url=${TITILER_STATIC}` +
          path +
          `&resampling_method=${settings.resamplingMethod}&bidx=${settings.bidx}&rescale=${settings.minp}%2C${settings.maxp}&colormap_name=${colorMap}`
        );

      default:
        return (
          `${COG_URL}` +
          `/cog/tiles` +
          `/{z}/{x}/{y}.png?url=${TITILER_STATIC}` +
          path
        );
    }
  };

  function handleClose(status: boolean) {
    togglePopup(status);
  }

  //geojson to json
  async function parseGeoJson(file: any) {
    const GeoJson: any = await fetch(file);
    const data = await GeoJson.json();
    const features = data.features;
    return features;
  }

  //-------------on layer check-------------------------------

  useEffect(() => {
    setScaleData(checkedKeys);
    drawLayers(checkedKeys);
    console.log(checkedKeys, allLayers);
  }, [checkedKeys, allLayers]);

  useEffect(() => {
    forceUpdateAllLayers();
  }, [colorMap, selectedIndexes, showSelectedIndexes]);

  useEffect(() => {
    //console.log("current 3d", threeDState);
    if (threeDState === "Enabled") {
      // set3DTranspose(true);
      const al = { ...allLayers };
      al[`1-${featureLayer}`].T3DTranspose = true;
      setAllLayers(al);
      forceUpdateLayers(featureLayer);
    } else if (threeDState === "Disabled") {
      // set3DTranspose(false);
      const al = { ...allLayers };
      al[`1-${featureLayer}`].T3DTranspose = false;
      setAllLayers(al);
      forceUpdateLayers(featureLayer);
    }
  }, [threeDState]);

  // ++++++++++++++++++++++++++++++++++++ force updation of layers after creating or adding features +++++++++++++++++++++++++++++++++++++++++++
  const forceUpdateLayers = (id: any) => {
    const cv = [...checkedKeys];

    if (cv.length == 0) {
      cv.push("1" + "-" + id);
    } else {
      setCheckedKeys([]);
      const idx = cv.findIndex((key) => key === "1" + "-" + id);

      if (idx === -1) cv.push("1" + "-" + id);
    }

    setTimeout(() => {
      setCheckedKeys(cv);
    }, 0);
  };

  const forceUpdateAllLayers = () => {
    const cv = [...checkedKeys];
    setCheckedKeys([]);

    setTimeout(() => {
      setCheckedKeys(cv);
    });
  };

  const setScaleData = (checkedKeys) => {
    const demKeys = checkedKeys.filter((key) => allLayers[key]?.type === "DEM");
    const demLayers: any = [];
    demKeys.forEach((element) => {
      let obj;
      if (allLayers[element]) {
        obj = {
          ...allLayers[element],
        };
      }
      demLayers.push(obj);
    });
    setScales(demLayers);
    //console.log(demLayers);
    if (demLayers.length) {
      setScaleVisible(true);
    } else {
      setScaleVisible(false);
    }
  };

  const drawLayers = (checkedKeysValue: any) => {
    console.log(checkedKeysValue);
    const vlayers: any = [];
    checkedKeysValue.forEach((element) => {
      if (element.split("-")[0] === "2" && element !== "2") {
        if (props.isBaseMap) {
          //console.log("all the layers being drawn",allLayers[element]);
          const layer: any = allLayers[element];
          layer?.layerPath.map((layerr: any) => {
            const settings: any = {
              minp: layerr[0].minp,
              maxp: layerr[0].maxp,
              resamplingMethod: layer.settings.resamplingMethod,
              bidx: layer.settings.bidx,
            };
            // ---pushing tiler layers
            vlayers.push(
              new TileLayer({
                id: `${element}-${uuid()}`,
                // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
                data: getRasterURL(layer?.type, layerr[0].path, settings),

                minZoom: 0,
                maxZoom: 24,
                tileSize: 256,
                onDataLoad: () => {
                  setLayerLoading(false);
                },
                renderSubLayers: (props) => {
                  const {
                    bbox: { west, south, east, north },
                  } = props.tile;

                  return new BitmapLayer(props, {
                    data: null,
                    image: props.data,
                    bounds: [west, south, east, north],
                  });
                },
              })
            );
          });
        } else {
          vlayers.push(
            new TileLayer({
              id: element,
              // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
              data: getRasterURL(
                allLayers[element]?.type,
                allLayers[element]?.layerPath,
                allLayers[element]?.settings
              ),

              minZoom: 0,
              maxZoom: 24,
              tileSize: 256,
              onDataLoad: () => {
                setLayerLoading(false);
              },
              renderSubLayers: (props) => {
                const {
                  bbox: { west, south, east, north },
                } = props.tile;

                return new BitmapLayer(props, {
                  data: null,
                  image: props.data,
                  bounds: [west, south, east, north],
                });
              },
            })
          );
        }
      } else if (element.split("-")[0] === "1" && element !== "1") {
        console.log("vector");
        switch (allLayers[element]?.type) {
          case "MultiLineString":
            vlayers.push(
              new GeoJsonLayer({
                id: element,
                data: STATIC_URL + allLayers[element]?.layerPath,
                pickable: true,
                // stroked: true,
                // filled: true,
                extruded: false,
                lineWidthUnits: "pixels",
                lineWidthScale: 4,
                lineWidthMinPixels: 2,
                lineJoinRounded: true,
                onDataLoad: () => {
                  setLayerLoading(false);
                },
                getLineColor: (d, i) => {
                  if (activeID === element.split("-")[1]) {
                    if (selectedIndexes.includes(i.index)) {
                      return hexToRGB2("#ffaa00", true);
                    }
                  }
                  return hexToRGB2(d.properties.color, false);
                },
                // getRadius: 100,
                // getLineWidth: 1,
                // getElevation: 30 ,
                onClick: (data, e) => {
                  if (e.leftButton) {
                    InfoWindow(
                      data.coordinate,
                      allLayers[element]?.name,
                      "LineView",
                      data.object,
                      false,
                      allLayers[element]?.id,
                      data.object.properties.sys_id
                    );
                    setSelectedLayerLabel(
                      allLayers[element]?.layerLabel
                        ? allLayers[element]?.layerLabel
                        : "No label selected"
                    );
                  } else {
                    setSelectedLayerId(element.split("-")[1]);
                    setColorChangeFeatureData(data);
                    setShowColorChangeForm(true);
                  }
                },
              })
            );
            break;
          case "MultiPolygon":
            vlayers.push(
              new GeoJsonLayer({
                id: element,
                data: STATIC_URL + allLayers[element]?.layerPath,
                pickable: true,
                stroked: true,
                filled: true,
                extruded: allLayers[element]?.T3DTranspose,
                lineWidthUnits: "pixels",
                lineWidthScale: 4,
                lineWidthMinPixels: 2,
                lineJoinRounded: true,
                onDataLoad: () => {
                  setLayerLoading(false);
                },
                getFillColor: (d, i) => {
                  if (allLayers[element]?.T3DTranspose) {
                    if (activeID === element.split("-")[1]) {
                      if (selectedIndexes.includes(i.index)) {
                        return hexToRGB2("#ffaa00", true);
                      }
                    }
                    return hexToRGB2(d.properties.color, false);
                  } else {
                    if (activeID === element.split("-")[1]) {
                      if (selectedIndexes.includes(i.index)) {
                        return hexToRGB("#ffaa00", true);
                      }
                    }
                    return hexToRGB(d.properties.color, false);
                  }
                },
                getLineColor: (d, i) => {
                  if (allLayers[element]?.T3DTranspose) {
                    if (activeID === element.split("-")[1]) {
                      if (selectedIndexes.includes(i.index)) {
                        return hexToRGB2("#ffaa00", true);
                      }
                    }
                    return hexToRGB2(d.properties.color, false);
                  } else {
                    if (activeID === element.split("-")[1]) {
                      if (selectedIndexes.includes(i.index)) {
                        return hexToRGB2("#ffaa00", true);
                      }
                    }
                    return hexToRGB2(d.properties.color, true);
                  }
                },
                //getRadius: 100,
                //getLineWidth: 1,
                getElevation: (d) => {
                  if (d.properties?.height) {
                    return d.properties.height;
                  }
                },
                onClick: (data, e) => {
                  //console.log("data",allLayers[element]?);
                  if (e.leftButton) {
                    InfoWindow(
                      data.coordinate,
                      allLayers[element]?.name,
                      "PolygonView",
                      data.object,
                      false,
                      allLayers[element]?.id,
                      data.object.properties.sys_id
                    );
                    setSelectedLayerLabel(
                      allLayers[element]?.layerLabel
                        ? allLayers[element]?.layerLabel
                        : "No label selected"
                    );
                  } else {
                    setSelectedLayerId(element.split("-")[1]);
                    setColorChangeFeatureData(data);
                    setShowColorChangeForm(true);
                  }
                },
                extensions: [new DataFilterExtension({ filterSize: 1 })],
                getFilterValue: (f, i) => {
                  return showSelectedIndexes.length
                    ? Number(f.properties[key])
                    : null;
                },
                filterRange: showSelectedIndexes,
              })
            );
            break;
          case "Point":
            vlayers.push(
              new IconLayer({
                id: element,
                data: parseGeoJson(STATIC_URL + allLayers[element]?.layerPath),
                pickable: true,
                // iconAtlas: TankIcon,
                //iconMapping: ICON_MAPPING,
                getIcon: (d) => ({
                  url: `${STATIC_URL}/icons/${d.properties.icon}.png`,
                  width: 100,
                  height: 129,
                  anchorY: 125,
                  mask: true,
                }),
                onDataLoad: () => {
                  setLayerLoading(false);
                },
                // getFillColor: (d, i) => {
                //   if (activeID === element.split("-")[1]) {
                //     if (selectedIndexes.includes(i.index)) {
                //       return hexToRGB2("#ffaa00", true);
                //     }
                //   }
                //   return hexToRGB2(d.properties.color, false);
                // },
                sizeScale: 12,
                getPosition: (d) => d.geometry.coordinates,
                getSize: (d) => 5,
                getColor: (d, i) => {
                  if (activeID === element.split("-")[1]) {
                    if (selectedIndexes.includes(i.index)) {
                      return hexToRGB2("#ffaa00", true);
                    }
                  }
                  return hexToRGB2(d.properties.color, false);
                },
                onClick: (data, e) => {
                  if (e.leftButton) {
                    InfoWindow(
                      data.coordinate,
                      allLayers[element]?.name,
                      "PointView",
                      data.object,
                      false,
                      allLayers[element]?.id,
                      data.object.properties.sys_id
                    );
                    setSelectedLayerLabel(
                      allLayers[element]?.layerLabel
                        ? allLayers[element]?.layerLabel
                        : "No label selected"
                    );
                  } else {
                    setSelectedLayerId(element.split("-")[1]);
                    setColorChangeFeatureData(data);
                    setShowColorChangeForm(true);
                  }
                },
              })
            );
            break;
        }
      }
    });
    // vlayers.push(
    //   new TileLayer({
    //     id: "BASE_LAYER-123123123",
    //     // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
    //     data: `${COG_URL}` +
    //     `/cog/tiles` +
    //     `/{z}/{x}/{y}@1x?url=${import.meta.env.VITE_BASE_URL}` +
    //     `/raster/1642486263367_20_DEM_10cm.tif` +
    //     `&resampling_method=nearest&bidx=1&rescale=17.799230575561523%2C93.64027404785156&colormap_name=plasma`,

    //     minZoom: 0,
    //     maxZoom: 24,
    //     tileSize: 256,
    //     // onDataLoad: () => {
    //     //   setLayerLoading(false);
    //     // },
    //     renderSubLayers: (props) => {
    //       const {
    //         bbox: { west, south, east, north },
    //       } = props.tile;

    //       return new BitmapLayer(props, {
    //         data: null,
    //         image: props.data,
    //         bounds: [west, south, east, north],
    //       });
    //     },
    //   })
    // )
    setVisibleLayers(vlayers);
  };

  const [lastCount, setLastCount] = useState(0);

  const sortLayersBySidebarOrdering = (checkedKeys, type) => {
    if (!checkedKeys.length) return [];
    const layerType = type === "raster" ? 1 : 0;
    const ordering: any = [];

    treeDataa[layerType].children.forEach((layer: any) => {
      checkedKeys.forEach((key) => {
        if (!layer.group) {
          if (key === layer.key) {
            ordering.push(key);
            return;
          }
        } else {
          layer.children.forEach((l) => {
            if (key === l.key) {
              ordering.push(key);
              return;
            }
          });
        }
      });
    });

    return ordering.reverse();
  };

  const onCheck = (checkedKeysValue: any, e) => {
    if (
      checkedKeysValue.length > lastCount &&
      checkedKeysValue[checkedKeysValue.length - 1].split("-")[0] === "1"
    ) {
      setLayerLoading(true);
    }

    //console.log(checkedKeysValue);
    if (checkedKeysValue.length) {
      setActiveGroupButton(false);
    } else {
      setActiveGroupButton(true);
    }

    const rasters = checkedKeysValue.filter((key) => key.split("-")[0] === "2");
    const vectors = checkedKeysValue.filter((key) => key.split("-")[0] === "1");

    const rasterOrdering: any = sortLayersBySidebarOrdering(rasters, "raster");
    const vectorOrdering: any = sortLayersBySidebarOrdering(vectors, "vector");

    setLastCount(checkedKeysValue.length);
    //console.log(rasterOrdering);
    setCheckedKeys([...rasterOrdering, ...vectorOrdering]);
  };

  // ++++++++++++++++++++++++++++++++++++++++++++++++ Start Drawing +++++++++++++++++++++++++++++++++++++++++++++++++++++

  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (mode, tool) => {
    setShowDrawingTools(false);
    setToolSelected(tool);

    const modes = {
      DrawPolygon: DrawPolygonMode,
      DrawLine: DrawLineStringMode,
      DrawPoint: DrawPointMode,
    };

    const drawModes = {
      DrawPolygon: "PolygonView",
      DrawLine: "LineView",
      DrawPoint: "PointView",
    };

    setFeatureState({
      data: myFeatureCollection,
    });

    setdrawMode(drawModes[mode]);

    setMode({
      mode: modes[mode],
    });

    setModeState({
      editMode: null,
      isCompleted: false,
    });

    setIsDrawing(true);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setFeatureState({
      data: myFeatureCollection,
    });

    setMode({
      mode: ViewMode,
    });

    setModeState({
      editMode: null,
      isCompleted: false,
    });
    togglePopup(false);
    setShowForm(false);
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    setSelectedKeys(selectedKeysValue);
  };

  const VectorLayerIcons = {
    Point: <EnvironmentOutlined />,
    MultiLineString: <BranchesOutlined />,
    MultiPolygon: <GatewayOutlined />,
  };

  const generateIcon = (type: any, color: any) => {
    switch (type) {
      case "Point":
        return <EnvironmentOutlined style={{ color: color }} />;
      case "MultiLineString":
        return <BranchesOutlined style={{ color: color }} />;
      case "MultiPolygon":
        return <GatewayOutlined style={{ color: color }} />;
    }
  };

  useEffect(() => {
    props.loading(true);
    getAllLayers();
  }, []);

  //---------------Fetch all layers in mission----------------------------------------

  const getAllLayers = async () => {
    try {
      let result: any;
      if (props.isMissionMap) {
        result = await http.get(
          `${apis.GET_PUBLIC_LAYER_BY_MISSION_ID}/${tenantId}/${missionId}`
        );
        setMission(result.data.mission);
      } else {
        result = await http.get(`${apis.FETCH_PUBLIC_LAYERS}`, {
          params: {
            mapRef: id,
          },
        });
      }
      console.log("I am inside getAllLayers", result);
      if (result.data.status) {
        const selectedLayerObject = result.data.data.find(
          (layer) => layer.name == selectedLayer
        );
        if (selectedLayerObject) {
          const key =
            selectedLayerObject.type == "Vector"
              ? `1-${selectedLayerObject._id}`
              : `2-${selectedLayerObject._id}`;
          console.log("Selecte layer is", key);
          setCheckedKeys([key]);
        }
        console.log("Base map result", result.data);
        setTenantName(result.data.data[0].tenantId.name);
        setTotalLayers(0);
        setlayerz(result.data.data);
        segrigateLayers(result.data.data);
      } else {
        message.error(result.data.message);
      }
    } catch (error) {
      console.log(error);
      setErrorState(error.response.status);
      props.loading(false);
      AxiosErrorHandler(error, props.logout);
    } finally {
      props.loading(false);
    }
  };

  const getTreeData = (layer, type, keyPrefix) => {
    //console.log("layer info from gettree data", layer);
    switch (type) {
      case "raster":
        return {
          title: (
            <>
              <Tooltip
                mouseLeaveDelay={0.0}
                mouseEnterDelay={0.0}
                placement="bottom"
                title={
                  <span>
                    {layer.name} &#8226;{" "}
                    {moment(layer.captureDate).format("DD/MM/YYYY")}
                  </span>
                }
              >
                <Text
                  style={
                    layer.layerGroupId ? { width: "139px" } : { width: "160px" }
                  }
                  ellipsis={true}
                  onClick={() => {
                    if (!props.isBaseMap) {
                      setlayerToAddInAttributeTable({
                        name: layer.name,
                        type: layer.type,
                        id: layer._id,
                        path: layer.layerpath,
                        count: layer.featureCount,
                      });
                    }
                  }}
                >
                  {layer.name}
                </Text>
              </Tooltip>
            </>
          ),
          key: keyPrefix + "-" + layer._id,
          icon: <FileImageOutlined />,
          captureDate: layer.captureDate,
          name: layer.name,
          groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
          layer: layer,
        };

        break;
      case "vector":
        return {
          title: (
            <>
              <Tooltip
                mouseLeaveDelay={0.0}
                mouseEnterDelay={0.0}
                placement="bottom"
                title={
                  <span>
                    {layer.name} &#8226;{" "}
                    {moment(layer.captureDate).format("DD/MM/YYYY")}
                  </span>
                }
              >
                <Text
                  style={
                    layer.layerGroupId ? { width: "139px" } : { width: "160px" }
                  }
                  ellipsis={true}
                  onClick={() => {
                    setlayerToAddInAttributeTable({
                      name: layer.name,
                      type: layer.type,
                      id: layer._id,
                      path: layer.layerpath,
                      count: layer.featureCount,
                    });
                  }}
                >
                  {layer.name}
                </Text>
              </Tooltip>
            </>
          ),
          key: keyPrefix + "-" + layer._id,
          icon: generateIcon(
            layer.vector.type,
            layer.color === "multiColor" ? "#00000" : layer.color
          ),
          captureDate: layer.captureDate,
          name: layer.name,
          groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
          layer: layer,
        };
    }
  };

  const [groupToEdit, setgroupToEdit] = useState<any>(null);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [groupName, setgroupName] = useState("");

  const getGroupTitle = (value, id) => {
    return {
      title: (
        <>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="1"
                  onClick={() => {
                    setgroupName(value.name);
                    setgroupToEdit({
                      id: id,
                      name: value.name,
                    });
                    setVisibleEditModal(true);
                  }}
                >
                  Rename
                </Menu.Item>
                <Menu.Item
                  key="2"
                  onClick={() => {
                    Modal.confirm({
                      title: "Delete Group?",
                      icon: <ExclamationCircleOutlined />,
                      content: (
                        <>
                          <p>Are You Sure To Want To Delete This Group</p>
                          <b>
                            These Layers Will be deleted along with this group
                          </b>
                          <>
                            {value.children.map((layer) => {
                              return <p>{layer.name}</p>;
                            })}
                          </>
                        </>
                      ),
                      okText: "Yes",
                      cancelText: "No",
                      onOk: () => {
                        deleteGroup(id);
                      },
                    });
                  }}
                >
                  <span> Delete</span>
                </Menu.Item>
              </Menu>
            }
            trigger={["contextMenu"]}
          >
            <Text style={{ width: "160px" }} ellipsis={true}>
              {value.name}
            </Text>
          </Dropdown>
        </>
      ),
      children: [...value.children],
      key: "group-" + id,
      group: true,
      icon: <FolderOutlined />,
      groupId: id,
    };
  };

  // ++++++++++++++++++++++++++++++++

  const treeData = [
    {
      title: "Vector",
      key: "1",
      children: [],
    },
    {
      title: "Raster",
      key: "2",
      children: [],
    },
  ];

  const [treeDataa, setTreeDataa] = useState<any>(treeData);
  const [treeStructure, setTreeStructure] = useState(treeData);
  const [allLayerGroups, setAllLayerGroups] = useState({});
  //----------------------Segrigate layers-------------------------------------------------------

  useEffect(() => {
    refreshLayers();
  }, [treeStructure, checkedKeys, panes]);

  const refreshLayers = () => {
    const td: any = [...treeStructure];
    let newTreeDataVector: any = [];
    const newTreeDataRaster: any = [];

    //console.log(td);
    const data: any = [
      {
        title: `${props.isMissionMap ? "Mission" : "City"} Data`,
        key: "1",
        children: [],
      },
    ];

    newTreeDataVector = td[0].children.map((layer) => {
      if (layer.group) {
        let groupLayers = [];
        const value = {
          ...layer.value,
        };
        groupLayers = layer.value.children.map((l) => {
          return getTreeData(l, "vector", td[0]["key"]);
        });

        value.children = [...groupLayers];
        return getGroupTitle(value, layer.id);
      } else {
        return getTreeData(layer, "vector", td[0]["key"]);
      }
    });
    data[0].children = [...newTreeDataVector];

    // newTreeDataRaster = td[1].children.map((layer) => {
    //   if (layer.group) {
    //     let groupLayers = [];
    //     let value = {
    //       ...layer.value,
    //     };
    //     groupLayers = layer.value.children.map((l) => {
    //       return getTreeData(l, "raster", td[1]["key"]);
    //     });
    //     value.children = [...groupLayers];
    //     return getGroupTitle(value, layer.id);
    //   } else {
    //     return getTreeData(layer, "raster", td[1]["key"]);
    //   }
    // });
    // data[1].children = [...newTreeDataRaster];

    setTreeDataa(data);
  };

  const segrigateLayers = (layers) => {
    //console.log("segrate layer");
    let data: any = [...treeDataa];
    let allLayers: any = {};
    if (
      sortType ||
      timeEnabled ||
      selectedRasterProps ||
      selectedVectorProps ||
      selectedVectorPropsType
    ) {
      data = [
        {
          title: "City Data",
          key: "1",
          children: [],
        },
      ];
    }
    if (!sortType) {
      layers.sort((a, b) => {
        return moment(b.captureDate).diff(moment(a.captureDate));
      });
    }

    const rasters = layers.filter((layer) => layer.type === "Raster");
    const vectors = layers.filter((layer) => layer.type === "Vector");

    setvectorLayers(vectors);

    const rasterGroups = {};
    const allGroups = {};

    rasters.forEach((layer, i) => {
      if (!layer.layerGroupId) {
        data[1].children.push({
          key: `2-${layer._id}`,
          ...layer,
        });
      } else {
        if (!rasterGroups[layer.layerGroupId._id]) {
          rasterGroups[layer.layerGroupId._id] = {
            name: layer.layerGroupId.name,
            children: [],
          };
          allGroups[layer.layerGroupId._id] = {
            name: layer.layerGroupId.name,
            id: layer.layerGroupId._id,
            groupType: 2,
          };
        }
        rasterGroups[layer.layerGroupId._id].children.push({
          key: `2-${layer._id}`,
          ...layer,
        });
      }

      const l = {};
      if (props.isBaseMap) {
        // -----to merge all rasters paths------------------
        l[data[1]["key"] + "-" + layer._id] = {
          layerPath: layer.layerdataArr,
          type: layer.raster.name,
          settings: {
            ...layer.raster,
            // minp: layer.minp,
            // maxp: layer.maxp,
          },
          name: layer.name,
          groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
        };
      } else {
        l[data[1]["key"] + "-" + layer._id] = {
          layerPath: layer.layerpath,
          type: layer.raster.name,
          settings: {
            ...layer.raster,
            minp: layer.minp,
            maxp: layer.maxp,
          },
          name: layer.name,
          groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
        };
      }

      allLayers = {
        ...allLayers,
        ...l,
      };
    });

    const vectorGroups = {};

    vectors.forEach((layer, i) => {
      if (!layer.layerGroupId) {
        data[0].children.push({
          key: `1-${layer._id}`,
          ...layer,
        });
      } else {
        if (!vectorGroups[layer.layerGroupId._id]) {
          vectorGroups[layer.layerGroupId._id] = {
            name: layer.layerGroupId.name,
            children: [],
          };
          allGroups[layer.layerGroupId._id] = {
            name: layer.layerGroupId.name,
            id: layer.layerGroupId._id,
            groupType: 1,
          };
        }
        vectorGroups[layer.layerGroupId._id].children.push({
          key: `1-${layer._id}`,
          ...layer,
        });
      }

      const l = {};
      l[data[0]["key"] + "-" + layer._id] = {
        layerPath: layer.layerpath,
        type: layer.vector.type,
        name: layer.name,
        id: layer._id,
        T3DTranspose: false,
        groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
        layerLabel: layer.layerLabel,
      };

      allLayers = {
        ...allLayers,
        ...l,
      };
    });

    for (const [key, value] of Object.entries(vectorGroups) as any) {
      data[0].children.push({
        group: true,
        value: value,
        id: key,
        key: "group-" + key,
        groupType: 1,
      });
    }

    for (const [key, value] of Object.entries(rasterGroups) as any) {
      data[1].children.push({
        group: true,
        value: value,
        id: key,
        key: "group-" + key,
        groupType: 2,
      });
    }

    setAllLayerGroups(allGroups);
    setAllLayers(allLayers);
    setTreeStructure(data);
    //--------check last ortho-----
    rasters.forEach((element) => {
      //console.log(element)
      if (element.raster.name === "ORTHO") {
        //console.log(element);
        const cl: any = [];
        cl.push(`2-${element._id}`);
        //console.log(cl);
        setCheckedKeys(cl);
        return;
      }
    });
  };

  const options: any = [
    {
      value: "raster",
      title: "RASTER",
      children: [],
      selectable: false,
    },
    {
      value: "vector",
      title: "VECTOR",
      selectable: false,
      children: [
        {
          value: "MultiLineString",
          title: "Line",
          selectable: false,
          children: [],
        },
        {
          value: "MultiPolygon",
          title: "Area",
          children: [],
          selectable: false,
        },
        {
          value: "Point",
          title: "Point",
          children: [],
          selectable: false,
        },
      ],
    },
  ];

  if (rasterProps) {
    options.map((option) => {
      if (option.value == "raster") {
        rasterProps.map((rasterProp) => {
          option.children.push({
            value: "0-" + rasterProp._id + "-" + rasterProp.name,
            title: rasterProp.name,
          });
        });
      }
    });
  }

  if (vectorProps) {
    vectorProps.map((vectorProp) => {
      if (vectorProp.type == "MultiLineString") {
        options[1].children[0].children.push({
          title: vectorProp.name,
          value: "1-0-" + vectorProp._id + "-" + vectorProp.name,
        });
      }
      if (vectorProp.type == "MultiPolygon") {
        options[1].children[1].children.push({
          title: vectorProp.name,
          value: "1-1-" + vectorProp._id + "-" + vectorProp.name,
        });
      }
      if (vectorProp.type == "Point") {
        options[1].children[2].children.push({
          title: vectorProp.name,
          value: "1-2-" + vectorProp._id + "-" + vectorProp.name,
        });
      }
    });
    options[1].children[0].children.sort(sortAlphabetically);
    options[1].children[1].children.sort(sortAlphabetically);
    options[1].children[2].children.sort(sortAlphabetically);
  }

  function sortAlphabetically(a, b) {
    const x = a.title.toLowerCase();
    const y = b.title.toLowerCase();
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  }

  // TabPanes

  const add = (name, type, id, path, count) => {
    if (!tabKeys.find((key) => key == id)) {
      tabKeys.push(id);
      setTabKeys(tabKeys);
      panes.push({
        title: name,
        type: type == "Raster" ? "raster" : "vector",
        key: id,
        id: id,
        path: path,
        count: count,
      });
      setPanes(panes);
      setActiveKey(id);
    } else setActiveKey(id);

    // const newPanes = [...panes];
    // newPanes.push({ title: name, content: 'Content of new Tab', key: id,id:id, type: type == "Raster" ? "raster" : "vector", });
    // setPanes(newPanes);
    // setActiveKey(id)
    //setNewTabIndex(newTabIndex + 1);
    //const activeKey = `newTab${newTabIndex}`;
    //const newPanes = [...panes];
  };

  useEffect(() => {
    if (layerToAddInAttributeTable) {
      const { name, type, id, path, count } = layerToAddInAttributeTable;
      add(name, type, id, path, count);
    }
  }, [layerToAddInAttributeTable]);

  // ++++++++++++++++++++++++++++++++++++++++++++++ Add Layer to list after createing new one +++++++++++++++++++++++++++++++++++++++++++++++
  const addLayer = (layer) => {
    try {
      setIsDrawing(false);
      setFeatureState(myFeatureCollection);
      const data: any = [...treeStructure];
      let layers = {
        ...allLayers,
      };

      if (layer.type === "Vector") {
        layer.key = `1-${layer._id}`;
        data[0].children.push(layer);
        const l = {};
        l[data[0]["key"] + "-" + layer._id] = {
          layerPath: layer.layerpath,
          type: layer.vector.type,
          name: layer.name,
          id: layer._id,
        };

        layers = {
          ...layers,
          ...l,
        };

        data[0].children.sort((a, b) =>
          moment(b.captureDate).diff(moment(a.captureDate))
        );

        setvectorLayers([...vectorLayers, layer]);
      } else {
        layer.key = `2-${layer._id}`;
        data[1].children.push(layer);

        const l = {};

        if (props.isBaseMap) {
          // -----to merge all rasters paths------------------

          l[data[1]["key"] + "-" + layer._id] = {
            layerPath: layer.layerdataArr,
            type: layer.raster.name,
            settings: {
              ...layer.raster,
              // minp: layer.minp,
              // maxp: layer.maxp,
            },
            name: layer.name,
            id: layer._id,
          };
        } else {
          l[data[1]["key"] + "-" + layer._id] = {
            layerPath: layer.layerpath,
            type: layer.raster.name,
            settings: {
              ...layer.raster,
              minp: layer.minp,
              maxp: layer.maxp,
            },
            name: layer.name,
            id: layer._id,
          };
        }

        layers = {
          ...layers,
          ...l,
        };

        data[1].children.sort((a, b) =>
          moment(b.captureDate).diff(moment(a.captureDate))
        );
      }

      while (data[0].children.length && data[0].children[0].group) {
        data[0].children.push(data[0].children.shift());
      }

      while (data[1].children.length && data[1].children[0].group) {
        data[1].children.push(data[1].children.shift());
      }

      setAllLayers(layers);
      setTreeStructure(data);

      if (layer.type === "Vector") {
        const cl = [...checkedKeys];
        cl.push(data[0]["key"] + "-" + layer._id);
        setCheckedKeys(cl);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // DRAW POLYGON FUNCTION
  const drawPolygonTool = new (EditableGeoJsonLayer as any)({
    id: "geojson",
    data: featureState.data,
    mode: mode.mode,
    selectedFeatureIndexes,
    onEdit: ({ updatedData, editType, editContext }): any => {
      let updatedSelectedFeatureIndexes: any = selectedFeatureIndexes;
      setFeatureState({
        ...featureState,
        data: updatedData,
      });
      if (editType === "addFeature") {
        //event to fire up infowindow for registering new vector layer/shape
        //console.log("New Shape Created!", updatedData);
        const { featureIndexes } = editContext;
        updatedSelectedFeatureIndexes = [
          ...selectedFeatureIndexes,
          ...featureIndexes,
        ];
        let modee;
        let centerPoint;

        if (mode.mode === DrawPolygonMode) {
          modee = "PolygonView";

          var fLat: any = 0;
          var fLng: any = 0;
          for (
            var i = 0;
            i < updatedData.features[0].geometry.coordinates[0].length;
            i++
          ) {
            fLng += updatedData.features[0].geometry.coordinates[0][i][0];
          }
          fLng = fLng / updatedData.features[0].geometry.coordinates[0].length;
          for (
            var i = 0;
            i < updatedData.features[0].geometry.coordinates[0].length;
            i++
          ) {
            fLat += updatedData.features[0].geometry.coordinates[0][i][1];
          }
          fLat = fLat / updatedData.features[0].geometry.coordinates[0].length;
          centerPoint = [fLng, fLat];
        } else if (mode.mode === DrawLineStringMode) {
          modee = "LineView";

          var fLat: any = 0;
          var fLng: any = 0;
          for (
            var i = 0;
            i < updatedData.features[0].geometry.coordinates.length;
            i++
          ) {
            fLng += updatedData.features[0].geometry.coordinates[i][0];
          }
          fLng = fLng / updatedData.features[0].geometry.coordinates.length;
          for (
            var i = 0;
            i < updatedData.features[0].geometry.coordinates.length;
            i++
          ) {
            fLat += updatedData.features[0].geometry.coordinates[i][1];
          }
          fLat = fLat / updatedData.features[0].geometry.coordinates.length;
          centerPoint = [fLng, fLat];
        } else {
          modee = "PointView";
          centerPoint = [
            ...updatedData.features[updatedData.features.length - 1].geometry
              .coordinates,
          ];
        }
        setMode({
          mode: ModifyMode,
        });
        setModeState({
          editMode: null,
          isCompleted: true,
        });
        setToolSelected("");

        InfoWindow(
          centerPoint,
          "New Shape",
          modee,
          updatedData.features[0],
          true,
          "new",
          "0"
        );
      }
      setselectedFeatureIndexes(updatedSelectedFeatureIndexes);
    },
    pickable: true,
    pickingRadius: 15,
    onClick: (data, e) => {
      if (!e.rightButton) {
        if (modeState.isCompleted) {
          InfoWindow(
            data.coordinate,
            "New Shape",
            drawMode,
            data.object,
            true,
            "new",
            "0"
          );
        }
      }
    },
    pointRadiusUnits: "pixels",
    pointRadiusScale: 1,
    pointRadiusMinPixels: 8,
  });

  //----------sorting menu
  const menu1 = (
    <Menu>
      <Menu.Item key="0" onClick={() => setSortType("name")}>
        Name
      </Menu.Item>
      <Menu.Item key="1" onClick={() => setSortType("createdAt")}>
        Time
      </Menu.Item>
    </Menu>
  );

  // Set Active Layer Type
  useEffect(() => {
    panes.map((pane) => {
      if (pane.id === activeKey && pane.type === "vector") {
        setActiveID(pane.id);
      }
      if (pane.id === activeKey) setActiveType(pane.type === "vector");
      //console.log(pane.type);
    });
  }, [activeKey]);

  //-----------------Date Formatting for Time Filter--------------------------
  const dateFormat = () => {
    const t = Number(time.split(" ")[0]);
    const dt = new Date();
    dt.setDate(dt.getDate() - t);
    return moment(dt).format("DD MMM");
  };

  //----------------SideBar state handeller function-----------------------------
  function sideBarHandeller() {
    if (sideBarState) {
      setSideBarIcon(<DoubleLeftOutlined />);
      setSideBarState(false);
    } else {
      setSideBarIcon(<DoubleRightOutlined />);
      setSideBarState(true);
    }
  }

  // ANTD TREE DROP FUNCTION
  const onDrop = async (info) => {
    //console.log(info);
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split("-");
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    try {
      if (
        info.dragNode.key.split("-")[0] !== "group" &&
        !info.dragNode.groupId &&
        info.node.key.split("-")[0] === "group" &&
        !info.node.expanded
      ) {
      } else if (
        info.dragNode.key.split("-")[0] !== "group" &&
        info.dragNode.groupId &&
        info.node.key.split("-")[0] === "group" &&
        !info.node.expanded &&
        info.node.groupId !== info.dragNode.groupId
      ) {
        const key = info.dragNode.key;
        await removeLayerFromGroup(
          info.dragNode.groupId,
          info.dragNode.layer._id,
          key
        );
      } else if (
        info.dragNode.key.split("-")[0] === "group" &&
        info.node.key.split("-")[0] === "group" &&
        !info.node.expanded
      ) {
      } else if (
        info.dragNode.key.split("-")[0] === "group" &&
        info.node.key.split("-")[0] === "group" &&
        info.node.expanded
      ) {
        return message.info("Please Collapse The Group Before Dropping");
      } else if (info.dragNode.groupId === info.node.groupId) {
        if (info.node.group) {
          return;
        }
      } else if (
        (info.dragNode.key.split("-")[0] === "group" && info.node.groupId) ||
        (info.dragNode.key.split("-")[0] !== "group" &&
          info.node.key.split("-")[0] === "group")
      ) {
        return;
      } else if (
        info.dragNode.key.split("-")[0] === "group" &&
        !info.node.groupId &&
        info.node.pos === "0-0-0"
      ) {
        return;
      } else {
        const groupid = info.node.groupId;
        if (!groupid && !info.dragNode.group) {
          if (info.node.pos === "0-0") return;
          const key = info.dragNode.key;
          await removeLayerFromGroup(
            info.dragNode.groupId,
            info.dragNode.layer._id,
            key
          );
        } else if (info.dragNode.layer) {
          const layerid = info.dragNode.layer._id;
          const key = info.dragNode.key;
          //console.log(layerid, groupid);
          await changeGroupOfLayer(groupid, [layerid], [key]);
        }
      }

      const loop = (data, key, callback) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].key === key) {
            return callback(data[i], i, data);
          }
          if (data[i].children) {
            loop(data[i].children, key, callback);
          }
          if (data[i].group) {
            loop(data[i].value.children, key, callback);
          }
        }
      };

      const data = [...treeStructure];

      // Find dragObject
      let dragObj;
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });

      if (!info.dropToGap) {
        // Drop on the content
        loop(data, dropKey, (item) => {
          item.children = item.children || [];
          // where to insert
          item.children.unshift(dragObj);
        });
      } else if (
        (info.node.props.children || []).length > 0 && // Has children
        info.node.props.expanded && // Is expanded
        dropPosition === 1 // On the bottom gap
      ) {
        loop(data, dropKey, (item) => {
          item.children = item.children || [];
          item.children.unshift(dragObj);
        });
      } else {
        let ar;
        let i;
        loop(data, dropKey, (item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj);
        } else {
          ar.splice(i + 1, 0, dragObj);
        }
      }

      const dropc = info.dragNode.checked;

      if (dropc) {
        const cv = [...checkedKeys];

        const rasters: any = [];

        data[1].children.forEach((node: any) => {
          if (node.group) {
            node.value.children.forEach((n) => {
              if (cv.includes(n.key)) {
                rasters.push(n.key);
              }
            });
          } else {
            if (cv.includes(node.key)) {
              rasters.push(node.key);
            }
          }
        });

        const vectors: any = [];

        data[0].children.forEach((node: any) => {
          if (node.group) {
            node.value.children.forEach((n) => {
              if (cv.includes(n.key)) {
                rasters.push(n.key);
              }
            });
          } else {
            if (cv.includes(node.key)) {
              rasters.push(node.key);
            }
          }
        });

        vectors.reverse();
        rasters.reverse();
        setCheckedKeys([]);
        setTimeout(() => {
          setCheckedKeys([...rasters, ...vectors]);
        }, 0);
      }

      setTreeStructure(data);
    } catch (error) {
      console.log(error);
    }
  };

  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [toolCoordinates, settoolCoordinates] = useState([0, 0]);
  const drawingMenuRef: any = useRef<HTMLElement>();

  //---------------Handle map modes-------------------------------
  function handleMapMode(value) {
    if (value === "osm") {
      const currenViewPort: any = INITIAL_VIEW_STATE;
      setViewport({
        longitude: INITIAL_VIEW_STATE.longitude,
        latitude: INITIAL_VIEW_STATE.latitude,
        zoom: INITIAL_VIEW_STATE.zoom,
        pitch: INITIAL_VIEW_STATE.pitch,
        minZoom: 0,
        maxZoom: 19,
      });
      setOsmState(true);
    } else {
      // let currenViewPort:any = INITIAL_VIEW_STATE;
      // setViewport({
      //   longitude: INITIAL_VIEW_STATE.longitude,
      //   latitude: INITIAL_VIEW_STATE.latitude,
      //   zoom: INITIAL_VIEW_STATE.zoom,
      //   pitch: INITIAL_VIEW_STATE.pitch,
      //   minZoom: 0,
      //   maxZoom: 22,
      // });
      setOsmState(false);
      setMapMode(`mapbox://styles/mapbox/${value}-v8`);
    }
  }

  // Handle Current Layer

  function currentLayer(value) {
    console.log(value);
  }

  // Public map search
  useEffect(() => {
    if (searchValue) {
      SetSearching(true);
      http
        .get<components["schemas"]["SearchPublicLayerResponse"]>(
          `${apis.PUBLIC_SEARCH}`,
          {
            params: {
              mapRef: id,
              key: "PremisesNo",
              value: searchValue,
            },
          }
        )
        .then((res: any) => {
          if (res.data.status) {
            console.log("search successful", res.data);
            setSelectedIndexes([res.data.data[0].index]);
            setActiveID(res.data.layerId);
            //console.log(turf.centroid(res.data.data[0]));
            // fit to bounds
            // console.log(INITIAL_VIEW_STATE);
            // const feature:any = res.data.data[0];
            // const [minLng, minLat, maxLng, maxLat] = turf.bbox(feature);
            // const viewportWebMercator = new WebMercatorViewport(INITIAL_VIEW_STATE);
            // console.log(viewportWebMercator);
            // const {longitude, latitude, zoom} = viewportWebMercator.fitBounds([[minLng, minLat], [maxLng, maxLat]]);
            // console.log(longitude, latitude, zoom)
            // viewportWebMercator = {
            //   ...INITIAL_VIEW_STATE,
            //   longitude,
            //   latitude,
            //   zoom,
            //   transitionInterpolator: new FlyToInterpolator(),
            //   transitionDuration: 1500,
            // };
            // setViewport(viewportWebMercator);

            const centerPoint = turf.centroid(res.data.data[0]);
            setViewport({
              longitude: centerPoint.geometry.coordinates[0],
              latitude: centerPoint.geometry.coordinates[1],
              zoom: 15,
              pitch: 0,
              minZoom: 0,
              maxZoom: 22,
              bearing: 0,
              transitionDuration: 1000,
              transitionInterpolator: new FlyToInterpolator(),
            });
          } else {
            console.log("search failed", res.data);
            message.warning("No match found!");
          }
        })
        .catch((err: any) => {
          console.log(err);
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => SetSearching(false));
    } else {
      setSelectedIndexes([]);
      setActiveID("");
    }
  }, [searchValue]);

  // MAP RENDER
  const renderMap = () => {
    switch (errorState) {
      case 401:
        return <FourOhOne />;
      case 404:
        return <FourOFour />;
      case 500:
        return <InternalServerError />;
      case 503:
        return <ServiceUnvailable />;
      case 504:
        return <GatewayTimeout />;
      default:
        return (
          <div className="map_wrapper">
            {layerLoading && (
              <div className="overlay">
                <Spin
                  size="large"
                  tip="Loading..."
                  style={{ color: "#ffffff" }}
                />
              </div>
            )}
            <DeckGL
              initialViewState={INITIAL_VIEW_STATE}
              controller={true}
              layers={
                isDrawing
                  ? osmState
                    ? [osm, visibleLayers, drawPolygonTool]
                    : [visibleLayers, drawPolygonTool]
                  : osmState
                  ? [osm, visibleLayers]
                  : [visibleLayers]
              }
              style={{ height: "100vh", width: "100%" }}
              onClick={(info, event) => {
                setShowDrawingTools(false);
                if (event.rightButton) {
                  if (!info.layer) {
                    setMode({
                      mode: ViewMode,
                    });
                    setToolSelected("");
                    setShowDrawingTools(false);
                    settoolCoordinates([
                      event.offsetCenter.x,
                      event.offsetCenter.y - 50,
                    ]);
                    setShowDrawingTools(true);
                    drawingMenuRef.current.click();
                  }
                } else {
                  setShowDrawingTools(false);
                }
              }}
              //getTooltip={({object}) => object && (object.properties.Block_Nm)}
            >
              {osmState ? (
                <>
                  <div style={COPYRIGHT_LICENSE_STYLE}>
                    {"© "}
                    <a
                      style={LINK_STYLE}
                      href="http://www.openstreetmap.org/copyright"
                      target="blank"
                    >
                      OpenStreetMap contributors
                    </a>
                  </div>
                </>
              ) : (
                <StaticMap
                  mapboxApiAccessToken={MAPBOX_API_KEY}
                  mapStyle={mapMode}
                />
              )}

              {showPopup && (
                <HtmlOverlay>
                  <HtmlOverlayItem coordinates={coordinates}>
                    <Popover
                      content={
                        <>
                          <InfoWindowContent
                            mode={infoWindowMode}
                            coordinates={coordinates}
                            token={MAPBOX_API_KEY}
                            feature={featureData}
                            featureIndex={sysId}
                            setformDrawerVisible={setformDrawerVisible}
                            setImagesDrawer={setViewImages}
                            show={saveButtonShow}
                            setShowForm={setShowForm}
                            cancelDrawing={cancelDrawing}
                            togglePopup={togglePopup}
                            layerId={featureLayer}
                            canDraw={null}
                            isPublic={true}
                            isBaseMap={props.isBaseMaps}
                          />
                        </>
                      }
                      title={
                        <>
                          <Title level={5} style={{ float: "left" }}>
                            {layerName}
                          </Title>
                          <a
                            style={{
                              float: "right",
                            }}
                            onClick={() => handleClose(false)}
                          >
                            X
                          </a>
                        </>
                      }
                      trigger="click"
                      visible={showPopup}
                      style={{ position: "relative" }}
                      onVisibleChange={() => handleClose(false)}
                    />
                  </HtmlOverlayItem>
                </HtmlOverlay>
              )}
            </DeckGL>

            {/* {showDrawingTools && ( */}
            {/* <div
      className='drawing-tools'
      style={{
        top: toolCoordinates[1] + "px",
        left: toolCoordinates[0] + "px",
      }}
    >
      <Dropdown
        overlay={() => (
          <Menu>
            <Menu.Item
              key='0'
              onClick={() => startDrawing("DrawLine", "Line")}
            >
              Line Tool
            </Menu.Item>
            <Menu.Item
              key='1'
              onClick={() => startDrawing("DrawPolygon", "Polygon")}
            >
              Polygon Tool
            </Menu.Item>
            <Menu.Item
              key='2'
              onClick={() => startDrawing("DrawPoint", "Marker")}
            >
              Marker Tool
            </Menu.Item>
          </Menu>
        )}
        // ref={drawingMenuRef}
        placement='bottomCenter'
        trigger={["click"]}
      >
        <Button
          style={{ visibility: "hidden" }}
          ref={drawingMenuRef}
        ></Button>
      </Dropdown>
    </div> */}
            {/* )} */}

            <div className="map-header-toolbar">
              <Row>
                <Col md={12} xs={9}>
                  <div className="map-selector">
                    <Select
                      defaultValue="streets"
                      style={{ width: "auto" }}
                      onChange={handleMapMode}
                    >
                      <Option value="streets">Street Maps</Option>
                      <Option value="osm">Open Street Maps</Option>
                      <Option value="satellite">Satellite</Option>
                      <Option value="light">Light mode</Option>
                      <Option value="dark">Dark mode</Option>
                    </Select>
                  </div>
                </Col>
                <Col md={12} xs={15}>
                  <Search
                    addonBefore="Premises ID"
                    placeholder="search"
                    allowClear
                    style={{
                      position: "absolute",
                      width: "auto",
                      right: "8px",
                      top: "8px",
                    }}
                    loading={searching}
                    onSearch={(e) => {
                      console.log(e);
                      setSearchValue(e);
                    }}
                  />
                </Col>
              </Row>
            </div>
            <div
              className="collapser-button"
              onClick={() => sideBarHandeller()}
              style={{ right: sideBarState === false ? "10px" : "354px" }}
            >
              <span className="icon">{sideBarIcon}</span>
            </div>
            {sideBarState && (
              <div className="map-sidebar">
                <div className="header-content">
                  <Row>
                    <Col md={20}>
                      <Space direction="vertical">
                        <Title level={4} style={{ marginBottom: "0px" }}>
                          Map
                        </Title>
                        <Text type="secondary">
                          {tenantName ? tenantName : ""}
                        </Text>
                        {props.isMissionMap && (
                          <div
                            style={{
                              border: "1px black solid",
                              padding: "2px 4px",
                              borderRadius: "5px",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Title
                              level={5}
                              style={{
                                marginBottom: "0px",
                                textDecoration: "underline",
                              }}
                            >
                              Mission
                            </Title>
                            <Text type="primary">
                              Name:{" "}
                              <Text type="secondary">
                                {mission && mission.name ? mission.name : ""}
                              </Text>
                            </Text>
                            <Text type="primary">
                              ID:{" "}
                              <Text type="secondary" copyable>
                                {mission && mission._id ? mission._id : ""}
                              </Text>
                            </Text>
                          </div>
                        )}
                      </Space>
                    </Col>
                    <Col md={4}>
                      <div
                        style={{
                          display: "inline-block",
                          width: "100%",
                          marginTop: "10px",
                        }}
                      >
                        {sortType && (
                          <div style={{ float: "right" }}>
                            <SortAscendingOutlined
                              onClick={() => changeSortArrange(true)}
                              style={{
                                color: isAscending ? "#1890ff" : "#000",
                                fontSize: "1.2rem",
                                marginTop: "0.5rem",
                                marginBottom: "0.5rem",
                                //marginRight: "0.4rem",
                              }}
                            />
                            <SortDescendingOutlined
                              onClick={() => changeSortArrange(false)}
                              style={{
                                color: !isAscending ? "#1890ff" : "#000",
                                fontSize: "1.2rem",
                                marginTop: "0.5rem",
                                marginBottom: "0.5rem",
                              }}
                            />
                          </div>
                        )}
                        <Dropdown overlay={menu1} trigger={["click"]}>
                          <Button style={{ float: "right" }} type="link">
                            Sort
                          </Button>
                        </Dropdown>
                      </div>
                    </Col>
                  </Row>
                </div>
                <div className="body-content">
                  <Tree
                    virtual={false}
                    //height={250}
                    showIcon
                    checkable
                    onExpand={onExpand}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    onCheck={onCheck}
                    checkedKeys={checkedKeys}
                    onSelect={onSelect}
                    selectedKeys={selectedKeys}
                    treeData={treeDataa}
                    onDrop={onDrop}
                    draggable={(node: any) => {
                      if (node.key === "1" || node.key === "2") return false;
                      return true;
                    }}
                    blockNode
                  />
                </div>

                {/* <Button onClick={() => setIsModalVisible4(true)}>new</Button> */}
              </div>
            )}
            <img
              src={KesowaNewLogo}
              style={{
                position: "absolute",
                bottom: "8px",
                left: "0",
                right: "0",
                width: "80px",
                height: "auto",
                margin: "auto",
                cursor: "pointer",
              }}
              alt="Kesowa Infinite Ventures Pvt Ltd"
            />
          </div>
        );
    }
  };
  return <>{renderMap()}</>;
}

const mapStateToProps = (state) => {
  // return {
  //   userType: state.Auth.userdetails.userType,
  //   userDetails: state.Auth.userdetails,
  // };
};

export default connect(mapStateToProps, {
  loading,
  logout,
})(PublicMap);
