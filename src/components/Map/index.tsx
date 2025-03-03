import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  lazy,
  Suspense,
  useContext,
} from "react";
import InfoWindowContent from "./utils/infoWindow";
import Colorscale from "./utils/ColorScale";
import download from "downloadjs";
import { WebMercatorViewport } from "viewport-mercator-project";
import { MaskExtension } from "@deck.gl/extensions";
import {
  Row,
  Col,
  Card,
  Tabs,
  Typography,
  Avatar,
  Badge,
  Button,
  Tooltip,
  Slider,
  Tag,
  Switch,
  Spin,
  message,
  Tree,
  Menu,
  Dropdown,
  Modal,
  Upload,
  Form,
  Input,
  Cascader,
  TreeSelect,
  DatePicker,
  Select,
  Checkbox,
  Progress,
  Alert,
  Result,
  notification,
  MenuProps,
  Space,
  Popover
} from "antd";
import {
  UploadOutlined,
  DoubleRightOutlined,
  FileAddOutlined,
  FileImageOutlined,
  DoubleLeftOutlined,
  BranchesOutlined,
  EnvironmentOutlined,
  GatewayOutlined,
  LeftOutlined,
  RightOutlined,
  ExportOutlined,
  FlagOutlined,
  FilterOutlined,
  NodeIndexOutlined,
  SwitcherOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
  UpOutlined,
  SyncOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { TbFlag, TbFlagOff } from "react-icons/tb";
import MarkerIcon from "../../static/MarkerIcon.png";
import TankIcon from "../../static/TankIcon.png";
import ValveIcon from "../../static/ValveIcon.png";
import DotIcon from "../../static/DotIcon.png";
import { SketchPicker } from "react-color";
import "./index.less";
import LineIcon from "../../static/line.svg";
import PolygonIcon from "../../static/polygon.svg";
import DeckGL from "@deck.gl/react";
import { FlyToInterpolator } from "deck.gl";
import { BitmapLayer, IconLayer, PathLayer } from "@deck.gl/layers";
import { SolidPolygonLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { HTMLOverlayItem, HTMLOverlay } from "../shared/HTMLOverlay";
import { EditableGeoJsonLayer } from "@deck.gl-community/editable-layers";
import {
  DrawPolygonMode,
  CompositeMode,
  ModifyMode,
  ViewMode,
  DrawLineStringMode,
  DrawPointMode,
  GeoJsonEditMode,
} from "@deck.gl-community/editable-layers";
import { StaticMap } from "react-map-gl";
import MapAttributes from "./utils/mapAttributes";
import apis from "../../services/apis";
import http from "../../services/httpCall";
import { AxiosErrorHandler } from "../../services/httpErrorHandle";
import moment from "moment";
import { useHistory, useParams } from "react-router-dom";
import VectorForm from "./utils/VectorForm";
import Media from "./utils/Media";
import LayerDocs from "./utils/layer/layerDocs";
import CreateLayer from "./utils/layer/createLayer";
import CreateBaseLayer from "./utils/layer/createBaseLayer";
import io from "socket.io-client";
import Thread from "../shared/Thread";
import {
  COG_URL,
  MAPBOX_API_KEY,
  PUBLIC_URL,
  STATIC_URL,
  TITILER_STATIC,
  API_URL,
} from "src/constants";
import * as turf from "@turf/turf";
import NavIcon from "../../static/nav_icon.png";
import { ILayer } from "src/types/layer";
import {
  ILayerToDeckLayer,
  Layer,
  IMissionLayers,
  MissionLayerToDeckLayer,
} from "./layerRender";
import { ILayersToTree } from "./treeRender";
import { BBox, Feature, mergeBoundingBoxes } from "src/types/geojson";
import { invertColor } from "./colorUtils";
import { featureType, featureTypes, vectorProps } from "src/static/vectorprops";
import { defaultRasterSettings, rasterProps } from "src/static/rasterprops";
import {
  ILayerTypeDetails,
  getEditLayerTypeOptions,
  options,
} from "./utils/propUtils";
import {valueChangeEmitter} from "./utils/elevationTooltip"
import Tileset from "src/types/cesium_tileset";
import { DocModel, uploadFile } from "src/services/fileUpload";
import { PERMS } from "src/static/permissions";
import FourOhOne from "../shared/Error/FourOhOne";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "../shared/Loader";
import { ThreadContext } from "src/services/threadUtils";
import ElevationBlock from "./utils/elevationTooltip";
const SvgToGeojson = lazy(() => import("../Digitizer/svgToGeojson"));

export const getPolygon = (lat: number, lng: number, size: number) => [
  [lat - size * 0.5, lng - size * 0.5],
  [lat + size * 0.5, lng - size * 0.5],
  [lat + size * 0.5, lng + size * 0.5],
  [lat - size * 0.5, lng + size * 0.5],
];

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
const { SubMenu } = Menu;
const { Meta } = Card;

export const MASK_ID = "MaskLayerGeofence";

function BaseMap(props) {
  const [refreshLayer, setRefreshLayer] = useState(false);
  const [isMinimise, setMinimise] = useState(false);
  const [pointMarkerColour, setPointMarkerColour] = useState("#000");
  const [missionData, setMissionData] = useState({});
  const [loader, setLoader] = useState(props.isBaseMap ? false : true);
  const [thumbnail, setThumbnail] = useState("");
  const [threadDetails, setThreadDetails] = useState({});
  const [geoJsonVOD, setGeoJsonVOD] = useState({});
  const [geoJsonAlert, setGeoJsonAlert] = useState({});
  const [srtVideoPath, setSrtVideoPath] = useState("");
  const [showFlightPath, setShowFlightPath] = useState(false);
  const [marker, setMarker] = useState([]);
  const [bearing, setBearing] = useState(0);
  const [isMaskLayerVisible, setisMaskLayerVisible] = useState(false);
  const [flightPath, setFlightPath] = useState<any>([]);
  const [missionLayer, setMissionLayer] = useState("");
  const [videoDetails, setVideoDetails] = useState<any>({});
  const [showCarousel, setShowCarousel] = useState(false);
  const [terrainmap, setTerrainMap] = useState(false);
  // const [overlayId, setOverlayID] = useState<string>();
  const [isElevationEnabled, setIsElevationEnabled] = useState(false);
  const isElevationEnabledRef = useRef(isElevationEnabled);
  const [dateRange, setDateRange] = useState([
    moment(
      moment().subtract(7, "d").format("YYYY-MM-DD") + " " + "00:00",
      "YYYY-MM-DD HH:mm"
    ).format(),
    moment(
      moment().format("YYYY-MM-DD") + " " + "23:59",
      "YYYY-MM-DD HH:mm"
    ).format(),
  ]);
  const [featureIdx, setFeatureIdx] = useState(null);
  const [flaggedFilter, setFlaggedFilter] = useState(false);
  const [unflaggedFilter, setUnflaggedFilter] = useState(false);
  const [perms, setPerms] = useState({
    canCreateLayer: false,
    canDeleteLayer: true,
    canEditLayer: true,
    canDownloadLayer: true,
    canEditGeojson: false,
    canDeleteFeature: false,
    canAddFeature: false,
    canUploadFileToGeojson: false,
    canDeleteFileFromGeojson: false,
    canSetCoverPhoto: false,
    canCreateBaseLayer: false,
    canUpdateBaseLayer: false,
    canEditBaseLayer: false,
    canDeleteBaseLayer: false,
    canUploadToBaseLayer: false,
  });

  const { Auth, logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);
  const { thread, openThread } = useContext(ThreadContext);

  const treeMenu = (layer: Layer): MenuProps["items"] => {
    const items: MenuProps["items"] = [];
    if (props.isBaseMap ? perms.canEditBaseLayer : perms.canEditLayer) {
      items.push({
        key: "1",
        label: "Edit",
      });
    }
    if (layer.type === "Raster" || layer.type === "Vector") {
      items.push({
        key: "2",
        label: "Open Thread",
      });
    }
    items.push({
      key: "3",
      label: "Download",
    });
    if (layer.type === "Vector") {
      items.push({
        key: "10",
        label: "Download KML",
      });
      if (props.isBaseMap ? perms.canEditBaseLayer : perms.canEditLayer) {
        items.push({
          key: "flagSubMenu",
          label: "Toggle Flag",
          children: [
            {
              key: "11",
              label: "Flag Layer",
            },
            {
              key: "12",
              label: "Unflag Layer",
            },
          ],
        });
      }
    }

    if (props.isBaseMap && perms.canUpdateBaseLayer) {
      items.push({
        key: "4",
        label: "Update Layer",
      });
    }
    if (props.isBaseMap ? perms.canDeleteBaseLayer : perms.canDeleteLayer) {
      items.push({
        key: "5",
        label: "Delete",
      });
    }
    if (
      layer.layerGroupId &&
      (props.isBaseMap ? perms.canCreateBaseLayer : perms.canCreateLayer)
    ) {
      items.push({
        key: "6",
        label: "Unassign Form Group",
      });
    }
    if (layer._isChecked) {
      const submenuChildren: MenuProps["items"] = [];
      if (props.isBaseMap ? perms.canCreateBaseLayer : perms.canCreateLayer) {
        submenuChildren.push({
          key: "7",
          label: "Group Selected Layers",
        });
      }
      if (props.isBaseMap ? perms.canDeleteBaseLayer : perms.canDeleteLayer) {
        submenuChildren.push({
          key: "8",
          label: "Delete Selected Layers",
        });
      }
      if (props.isBaseMap ? perms.canEditBaseLayer : perms.canEditLayer) {
        submenuChildren.push({
          key: "9",
          label: "Move Selected Layers",
        });
      }
      items.push({
        key: "submenu",
        label: "Selected",
        children: submenuChildren,
      });
    }
    if (layer.type === "Vector") {
      items.push({
        key: "13",
        label: "More",
      });
    }

    items.push({
      key: "14",
      label: layer._isMasked ? "Remove Mask" : "Add Mask",
    });
    items.push({
      key: "15",
      label: "Elevation",
    });

    // if (layer.type == "Raster" && layer.raster == "CESIUM_3D")
    //   items.push({
    //     key: "16",
    //     label: layer._isMeshSource ? "Remove Mesh" : "Add Mesh",
    //   });

    return items;
  };
  useEffect(() => {
    console.log("isMaskLayerVisible updated:", isMaskLayerVisible);
  }, [isMaskLayerVisible]);

  useEffect(() => {
    isElevationEnabledRef.current = isElevationEnabled;
  }, [isElevationEnabled]);

  //---------Notifications--------------------------------------
  const openNotification = (layerName) => {
    notification.success({
      message: `Photos assigned in layer: ${layerName}!`,
      description:
        "Please check the layer's review section to finalise the images.",
    });
  };
  //----------UseEffectBlock to assign permissions--------------
  useEffect(() => {
    setPerms({
      canCreateLayer: Auth.userdetails.customPermissions.includes(PERMS.UPLOAD_LAYER),
      canDeleteLayer: Auth.userdetails.customPermissions.includes(PERMS.DELETE_LAYER),
      canEditLayer: Auth.userdetails.customPermissions.includes(PERMS.EDIT_LAYER),
      canDownloadLayer: true,
      canEditGeojson: Auth.userdetails.customPermissions.includes(PERMS.EDIT_FEATURE),
      canDeleteFeature: Auth.userdetails.customPermissions.includes(PERMS.DELETE_FEATURE),
      canAddFeature: Auth.userdetails.customPermissions.includes(PERMS.ADD_FEATURE),
      canUploadFileToGeojson: Auth.userdetails.customPermissions.includes(PERMS.FEATURE_FILE_UPLOAD),
      canDeleteFileFromGeojson: Auth.userdetails.customPermissions.includes(PERMS.FEATURE_FILE_DELETE),
      canSetCoverPhoto: Auth.userdetails.customPermissions.includes(PERMS.SET_COVER_PHOTO),
      canCreateBaseLayer: Auth.userdetails.customPermissions.includes(PERMS.CAN_CREATE_BASE_LAYER),
      canUpdateBaseLayer: Auth.userdetails.customPermissions.includes(PERMS.CAN_UPDATE_BASE_LAYER),
      canDeleteBaseLayer: Auth.userdetails.customPermissions.includes(PERMS.CAN_DELETE_BASE_LAYER),
      canEditBaseLayer: Auth.userdetails.customPermissions.includes(PERMS.CAN_EDIT_BASE_LAYER),
      canUploadToBaseLayer: Auth.userdetails.customPermissions.includes(PERMS.CAN_UPLOAD_TO_BASE_LAYER),
    });
  }, []);

  const socket: any = useRef();
  const [ExpiryModal, setExpiryModal] = useState(false);
  const [LimitModal, setLimitModal] = useState(false);
  const [showBorder, setShowBorder] = useState(false);
  const [osmState, setOsmState] = useState(false);
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
  const mapRef = useRef(null);

  // ---- setting map location -----------------
  useEffect(() => {
    if (props.isBaseMap) {
      if (navigator.geolocation) {
        navigator.permissions
          .query({ name: "geolocation" })
          .then(function(result: any) {
            if (result.state === "granted") {
              navigator.geolocation.getCurrentPosition(function(pos: any) {
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
                  transitionInterpolator: new TransitionInterpolator(),
                });
              });
            } else if (result.state === "prompt") {
              navigator.geolocation.getCurrentPosition(
                function(pos: any) {
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
                function(err) {
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
            result.onChange = function() {
              console.log(result.state);
            };
          });
      } else {
        console.log("Sorry navigator not available!");
      }
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
  interface HoverInfo {
    R: number;
    G: number;
    B: number;
    x: number;
    y: number;
    elevation: number;
  }
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const deckRef = useRef(null);
  const [polygonSize, setPolygonSize] = useState(150);
  const [layerOpacity, setLayerOpacity] = useState(1);
  const [polygon, setPolygon] = useState(getPolygon(88, 22, 1));
  const [digitizer, setDigitizer] = useState(false);
  const [digitizerLayer, setDigitizerLayer] = useState(null);

  const handleFileUpload = (file) => {
    setIsModalVisible(true);
    if(file){
       setFileList([file]);
    }
  };

  const handleChildValueChange = (newValue) => {
    console.log(newValue);
    setDigitizerLayer(newValue);
  };

  const changePolygonSize = (value) => {
    setPolygonSize(value);
  };
  const changeOpacity = (value) => {
    setLayerOpacity(value);
  };

  const maskLayer = useMemo(() => {
    return new SolidPolygonLayer({
      id: MASK_ID,
      operation: "mask",
      data: [polygon],
      getPolygon: (d) => d,
      getColor: [255, 0, 0],
      visible: isMaskLayerVisible,
      zIndex: 9999,
      opacity: layerOpacity,
    });
  }, [polygon, isMaskLayerVisible]);

  useEffect(() => {
    const handleValueChange = (newValue: HoverInfo) => {
        setHoverInfo(newValue);
    }
    valueChangeEmitter.on('valueChanged', handleValueChange);
    return () => {
      valueChangeEmitter.off('valueChanged', handleValueChange);
    };
  }, []);

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
        console.log("props.data:", props.data);

        return [
          new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north],
            extensions: [new MaskExtension()],
            maskId: MASK_ID,
            opacity: layerOpacity,
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
  const [showPopup, togglePopup] = useState(false);
  useEffect(() => console.log("SHOW_POPUP: ", showPopup), [showPopup]);
  const [featureData, setFeatureData] = useState<any>([]);
  const [sysId, setSysId] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [sideBarState, setSideBarState] = useState(true);
  const [sideBarIcon, setSideBarIcon] = useState(<DoubleRightOutlined />);
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
  // const [rasterProps, setRasterProps] = useState<any>([]);
  // const [vectorProps, setVectorProps] = useState<any>([]);
  const [data, setData] = useState();
  const [editingKey, setEditingKey] = useState("");
  const [missioName, setMissioName] = useState("");
  const [layerType, setLayerType] = useState("");
  const [layerProp, setLayerProp] = useState<vectorProps | rasterProps | null>(
    null
  );
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
  const [viewMedia, setViewMedia] = useState(false);
  const [selectedLayerInfo, setSelectedLayerInfo] = useState({});
  const [viewDocs, setViewDocs] = useState(false);
  const [vectorLayers, setvectorLayers] = useState<any>([]);
  const [saveButtonShow, setSaveButtonShow] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toolSelected, setToolSelected] = useState("");
  const [defaultLayerType, setDefaultLayerType] =
    useState<ILayerTypeDetails | null>(null);
  const [activeType, setActiveType] = useState(false);
  const [sortType, setSortType] = useState("createdAt");
  const [isAscending, setIsAscending] = useState(false);
  const [showEditModel, setshowEditModel] = useState(false);
  const [filterState, setFilterState] = useState<{
    vectorProps: Set<string>;
    rasterProps: Set<string>;
    vectorPropsType: Set<string>;
    time: string | null;
  }>({
    vectorProps: new Set([]),
    rasterProps: new Set([]),
    vectorPropsType: new Set([]),
    time: null,
  });
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
  const [pointMarkerSize, setPointMarkerSize] = useState(1);
  const [showMarkerSizeTool, setShowMarkerSizeTool] = useState(false);

  const iconOptions = [
    {
      value: "MarkerIcon",
      title: "Marker Icon",
      icon: <img src={MarkerIcon} style={{ width: "10px" }} />,
    },
    {
      value: "TankIcon",
      title: "Tank Icon",
      icon: <img src={TankIcon} style={{ width: "10px" }} />,
    },
    {
      value: "ValveIcon",
      title: "Valve Icon",
      icon: <img src={ValveIcon} style={{ width: "10px" }} />,
    },
    {
      value: "DotIcon",
      title: "Dot Icon",
      icon: <img src={DotIcon} style={{ width: "10px" }} />,
    },
  ];
  const [icon2, setIcon2] = useState(iconOptions[0].value);
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

  // const [geoJson, setGeoJson] = useState({
  //     type: 'FeatureCollection',
  //     features: []
  // });
  const onChangeSizeSlider = (value: number) => {
    if (isNaN(value)) {
      return;
    }
    setPointMarkerSize(value);
  };
  const myFeatureCollection: {
    type: string;
    features: Feature<any, any>[];
  } = {
    type: "FeatureCollection",
    features: [],
  };

  const [selectedFeatureIndexes, setselectedFeatureIndexes] = useState([]);
  const [featureState, setFeatureState] = useState(myFeatureCollection);

  const [selectedLayerId, setSelectedLayerId] = useState<string>();
  const [selectedLayerType, setSelectedLayerType] = useState("");

  const [layerToAddInAttributeTable, setlayerToAddInAttributeTable] =
    useState<any>(null);
  const [shouldAttributeTableReload, setShouldAttributeTableReload] =
    useState(false);

  const [scaleVisible, setScaleVisible] = useState(false);

  let { id: rawId } = useParams<{ id: string }>();
  if (!rawId) {
    rawId = "thisIsBase-Layer";
  }
  const [id, userType] = rawId.split("-").reverse();

  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const showModal1 = () => {
    setshowEditModel(true);
    setIsModalVisible1(true);
    console.log(selectedLayerId);
  };

  const handleOk1 = () => {
    setLayerName("");
    setDefaultLayerType(null);
    setCaptureDate("");
    setIsModalVisible1(false);
  };

  const handleCancel1 = () => {
    setTimeout(() => {
      setshowEditModel(false);
    }, 500);
    setLayerName("");
    setDefaultLayerType(null);
    setCaptureDate("");
    setIsModalVisible1(false);
  };

  const handleCancel2 = () => {
    setIsModalVisible2(false);
    setSelectedKey();
  };

  // ----------------------------------------- disable default right click event of browser ----------------------------------------------------------
  useEffect(() => {
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }, []);

  //----------------------Fetching Raster Props and Vector Props------------
  // useEffect(() => {
  //   http
  //     .get(`${apis.GET_RASTER_PROPS}`)
  //     .then((result) => {
  //       if (result.data.status) {
  //         setRasterProps(result.data.data);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       AxiosErrorHandler(err, logout);
  //     });
  //   http
  //     .get(`${apis.GET_VECTOR_PROPS}`)
  //     .then((result) => {
  //       if (result.data.status) {
  //         setVectorProps(result.data.data);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       AxiosErrorHandler(err, logout);
  //     });
  // }, []);

  // Filter
  const filterLayers = () => {
    let body: any = {};
    if (!props.isBaseMap) {
      body = {
        missionId: id,
      };
    }

    if (filterState.rasterProps.size)
      body["rasterProps"] = Array.from(filterState.rasterProps);
    if (filterState.vectorProps.size)
      body["vectorProps"] = Array.from(filterState.vectorProps);
    if (filterState.vectorPropsType.size)
      body["vectorPropsType"] = Array.from(filterState.vectorPropsType);
    if (filterState.time) body["time"] = filterState.time;

    if (
      filterState.rasterProps.size ||
      filterState.vectorProps.size ||
      filterState.vectorPropsType.size ||
      !!filterState.time
    ) {
      setChipsLoading(true);
      http
        .post(`${apis.FILTER_LAYER}`, body)
        .then((res) => {
          console.log("Filter API response", res);
          if (res.data.status) {
            SetAllLayers(res.data.data);
            // removeChips(res.data.data);
          } else {
            message.info("No result for selected filter!");
          }
        })
        .catch((err) => {
          console.log(err);
          message.error("Layers couldn't be filtered");
          AxiosErrorHandler(err, logout);
        })
        .finally(() => setChipsLoading(false));
    } else {
      getAllLayers(id);
    }
  };

  useEffect(() => {
    const missionData = async () => {
      const mission = await http.get(`${apis.GET_MISSION_BY_ID}${id}`);
      console.log(
        "basemap",
        props.isBaseMap,
        mission.data,
        moment(mission.data.data.createdAt)
      );
      if (mission.data.status) {
        setMissionData(mission.data.data);
        setDateRange([
          moment(mission.data.data.createdAt, "YYYY-MM-DD HH:mm").format(),
          dateRange[1],
        ]);
      }
      setLoader(false);
    };
    if (!props.isBaseMap) {
      setLoader(true);
      missionData();
    }
  }, []);

  useEffect(() => {
    filterLayers();
  }, [filterState]);

  // ++++++++++++++++++++++++++++++ Sort All Layers +++++++++++++++++++++++++++++++++++++
  const changeSortArrange = (ascending) => {
    if (ascending !== isAscending) {
      setIsAscending(ascending);
    }
  };

  useEffect(() => {
    // if (sortType == "createdAt") {
    //   const data: any = [...treeDataa];
    //   if (isAscending) {
    //     data[0].children.sort((a, b) =>
    //       moment(a.captureDate).diff(moment(b.captureDate))
    //     );
    //     data[1].children.sort((a, b) =>
    //       moment(a.captureDate).diff(moment(b.captureDate))
    //     );

    //     data[0].children.map((item) =>
    //       item?.group
    //         ? item.children.sort((a, b) =>
    //           moment(a.captureDate).diff(moment(b.captureDate))
    //         )
    //         : null
    //     );
    //     data[1].children.map((item) =>
    //       item?.group
    //         ? item.children.sort((a, b) =>
    //           moment(a.captureDate).diff(moment(b.captureDate))
    //         )
    //         : null
    //     );
    //   } else {
    //     data[0].children.sort((a, b) =>
    //       moment(b.captureDate).diff(moment(a.captureDate))
    //     );
    //     data[1].children.sort((a, b) =>
    //       moment(b.captureDate).diff(moment(a.captureDate))
    //     );

    //     data[0].children.map((item) =>
    //       item?.group
    //         ? item.children.sort((a, b) =>
    //           moment(b.captureDate).diff(moment(a.captureDate))
    //         )
    //         : null
    //     );
    //     data[1].children.map((item) =>
    //       item?.group
    //         ? item.children.sort((a, b) =>
    //           moment(b.captureDate).diff(moment(a.captureDate))
    //         )
    //         : null
    //     );
    //   }
    //   setTreeDataa(data);
    // }
    // if (sortType == "name") {
    //   const data: any = [...treeDataa];
    //   if (isAscending) {
    //     data[0].children.sort((a, b) => a.name?.localeCompare(b.name));
    //     data[1].children.sort((a, b) => a.name?.localeCompare(b.name));
    //     data[0].children.map((item) =>
    //       item?.group
    //         ? item.children.sort((a, b) => a.name?.localeCompare(b.name))
    //         : null
    //     );
    //     data[1].children.map((item) =>
    //       item?.group
    //         ? item.children.sort((a, b) => a.name?.localeCompare(b.name))
    //         : null
    //     );
    //   } else {
    //     data[0].children.sort((a, b) => b.name?.localeCompare(a.name));
    //     data[1].children.sort((a, b) => b.name?.localeCompare(a.name));
    //     data[0].children.map((item) =>
    //       item?.group
    //         ? item.children.sort((a, b) => b.name?.localeCompare(a.name))
    //         : null
    //     );
    //     data[1].children.map((item) =>
    //       item?.group
    //         ? item.children.sort((a, b) => b.name?.localeCompare(a.name))
    //         : null
    //     );
    //   }
    //   setTreeDataa(data);
    // }
    SetAllLayers((prev) => [
      ...prev.sort((a, b) => {
        if (sortType === "createdAt") {
          if (isAscending) return moment(a.createdAt).diff(moment(b.createdAt));
          else return moment(b.createdAt).diff(moment(a.createdAt));
        } else {
          // sortType is "name"
          if (isAscending) return a.name.localeCompare(b.name);
          else return b.name.localeCompare(a.name);
        }
      }),
    ]);
  }, [sortType, isAscending]);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  // const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [colorMap, SetColorMap] = useState("plasma");
  const [featureLayer, setFeatureLayer] = useState("");
  const [featureLayerPath, setFeatureLayerPath] = useState("");
  const [windowTitle, setWindowTitle] = useState("");
  const [selectedLayerLabel, setSelectedLayerLabel] = useState("");
  const [selectedLayerPopupLabel, setSelectedLayerPopupLabel] = useState("");
  const [activeID, setActiveID] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState<React.Key[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature<any,any>[]>([]);
  const [showSelectedIndexes, setshowSelectedIndexes] = useState([]);
  const [key, setKey] = useState("");
  const [defaultKeys, setDefaultKeys] = useState<React.Key[]>([]);
  const [videoToShow, setVideoToShow] = useState<any>([]);
  const onExpand = (expandedKeysValue: React.Key[]) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  // const [allLayers, setAllLayers] = useState<Layer[]>([]);
  const [AllLayers, SetAllLayers] = useState<Layer[]>([]);
  const [MissionLayers, SetMissionLayers] = useState<IMissionLayers>({
    alertGeojsonUrl: "",
    vodGeojsonUrl: "",
    isAlertChecked: false,
    isVODChecked: false,
  });
  const [visibleLayers, setVisibleLayers] = useState([]);
  const [colorChangeFeatureData, setColorChangeFeatureData] =
    useState<any>(null);
  const [showColorChangeForm, setShowColorChangeForm] = useState(false);
  const [color, setColor] = useState("");
  const [scales, setScales] = useState<Layer[]>([]);
  const onRangeChange = (date, dateString) => {
    const startDate = moment(
      dateString[0] + " " + "00:00",
      "DD-MM-YYYY HH:mm"
    ).format();
    const endDate = moment(
      dateString[1] + " " + "23:59",
      "DD-MM-YYYY HH:mm"
    ).format();
    setDateRange([startDate, endDate]);
  };
  const missionGeojsonURL = (
    type: "alert" | "vod",
    isBaseMap: boolean,
    startDate: string,
    endDate: string
  ) => {
    const params = new URLSearchParams({ startDate, endDate }).toString();
    let url = "";
    if (isBaseMap) {
      if (type === "alert")
        url = `${apis.GET_ALERT_LOCATION_GEOJSON}?${params}`;
      if (type === "vod") url = `${apis.GET_VOD_LOCATION_GEOJSON}?${params}`;
    } else {
      if (type === "alert")
        url = `${apis.GET_MISSION_GEOJSON}/${id}/alerts?${params}`;
      if (type === "vod")
        url = `${apis.GET_MISSION_GEOJSON}/${id}/vods?${params}`;
    }
    return url;
  };
  // Should no longer be required
  // const fetchMissionGeoJSON = () => {
  //   checkedKeys.map((key) => {
  //     if (key.split("-")[0] === "3") {
  //       if (key.split("-")[1] === "2") {
  //         if (props.isBaseMap) {
  //           http
  //             .get(`${apis.GET_ALERT_LOCATION_GEOJSON}`, {
  //               params: {
  //                 startDate: dateRange[0],
  //                 endDate: dateRange[1],
  //               },
  //             })
  //             .then((result) => {
  //               console.log("geoJsonAlert", result);
  //               setGeoJsonAlert(result.data);
  //             })
  //             .catch((err) => {
  //               console.log(err);
  //               AxiosErrorHandler(err, logout);
  //             });
  //         } else {
  //           http
  //             .get(`${apis.GET_MISSION_GEOJSON}/${id}/alerts`, {
  //               params: {
  //                 startDate: dateRange[0],
  //                 endDate: dateRange[1],
  //               },
  //             })
  //             .then((result) => {
  //               setGeoJsonAlert(result.data);
  //             })
  //             .catch((err) => {
  //               console.log(err);
  //               AxiosErrorHandler(err, logout);
  //             });
  //         }
  //       } else if (key.split("-")[1] === "3") {
  //         if (props.isBaseMap) {
  //           http
  //             .get(`${apis.GET_VOD_LOCATION_GEOJSON}`, {
  //               params: {
  //                 startDate: dateRange[0],
  //                 endDate: dateRange[1],
  //               },
  //             })
  //             .then((result) => {
  //               console.log("geoJsonVOD", result);
  //               setGeoJsonVOD(result.data);
  //             })
  //             .catch((err) => {
  //               console.log(err);
  //               AxiosErrorHandler(err, logout);
  //             });
  //         } else {
  //           http
  //             .get(`${apis.GET_MISSION_GEOJSON}/${id}/vods`, {
  //               params: {
  //                 startDate: dateRange[0],
  //                 endDate: dateRange[1],
  //               },
  //             })
  //             .then((result) => {
  //               console.log("geoJsonVOD", result);
  //               setGeoJsonVOD(result.data);
  //             })
  //             .catch((err) => {
  //               console.log(err);
  //               AxiosErrorHandler(err, logout);
  //             });
  //         }
  //       }
  //     }
  //   });
  // };
  const markerData = [
    {
      name: "Drone",
      address: "",
      exits: 4214,
      coordinates: marker,
    },
  ];
  const fpLayer = [
    new PathLayer({
      id: "flight-path-layer",
      data: flightPath,
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
    new IconLayer({
      id: "flight-icon-layer",
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
        // console.log(d, "getpos");
        return d.coordinates;
      },
      getSize: (d) => 4,
      getAngle: (d) => bearing,
      //getColor: (d) => [Math.sqrt(d.exits), 140, 0],
    }),
  ];
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
  const removeFlightPath = () => {
    const vlayers = [...visibleLayers];
    const layers = vlayers.filter((l) => {
      if (
        String(l.id) !== "flight-path-layer" &&
        String(l.id) !== "flight-icon-layer"
      ) {
        return l;
      }
    });
    setVisibleLayers(layers);
    setShowFlightPath(false);
    setViewport({
      longitude: coordinates[0],
      latitude: coordinates[1],
      zoom: 13,
      minZoom: 0,
      maxZoom: 22,
      pitch: 0,
      bearing: 0,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator(),
    });
    setViewMedia(true);
  };

  useEffect(() => {
    if (srtVideoPath && showFlightPath) {
      fetchJSON(STATIC_URL + srtVideoPath.replace(/.\w{0,10}$/, ".geojson"))
        .then((data) => {
          const flightTelemetry: any = data.features;
          const pathObject: any = flightTelemetry.pop();
          //console.log("the obejct", pathObject)
          const points: any = [];
          pathObject.geometry.coordinates.map((i: any) => {
            const values: any = [];
            values.push(i[0]);
            values.push(i[1]);
            //console.log(values);
            points.push(values);
          });
          // //flightpath.push(flightTelemetry.at(-1));
          // console.log("FLight features", flightTelemetry, "FLightpath", flightpath.features[0]);
          const filterArray: any = points.filter(
            (i: any) => i[0] !== null && i[1] !== null
          );
          setFlightPath([
            {
              path: filterArray,
              name: "Drone's Flight Path",
              color: [255, 0, 0],
            },
          ]);
          if (points.length > 0) {
            const x = Math.floor(0 * points.length);
            if (
              points[x] !== undefined &&
              points[x][0] !== null &&
              points[x][1] !== null
            ) {
              setMarker(points[x]);
              const startPoint: any = points[x];
              const endPoint: any = points[x + 1];
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
                  getBearing(
                    startPoint[1],
                    startPoint[0],
                    endPoint[1],
                    endPoint[0]
                  )
                );
              }
            }
          }
        })
        .catch((err) => {
          setShowFlightPath(false);
          console.log("could not fetch geojson");
        });
    }
  }, [showFlightPath, srtVideoPath]);

  //---------viewport alignment---------
  useEffect(() => {
    if (marker.length > 0 && showFlightPath) {
      setVisibleLayers((vlayers) => [...vlayers, ...fpLayer]);
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
    }
  }, [marker]);

  function fetchJSON(file: any) {
    return fetch(file)
      .then(function(res) {
        return res.json();
      })
      .catch((err) => console.log(err));
  }
  //-----creating drone path-----

  useEffect(() => {
    SetMissionLayers((prev) => ({
      alertGeojsonUrl: missionGeojsonURL(
        "alert",
        props.isBaseMap,
        dateRange[0],
        dateRange[1]
      ),
      vodGeojsonUrl: missionGeojsonURL(
        "vod",
        props.isBaseMap,
        dateRange[0],
        dateRange[1]
      ),
      isAlertChecked: prev.isAlertChecked,
      isVODChecked: prev.isVODChecked,
    }));
  }, [dateRange]);

  const updateVOD = (data, idx) => {
    const body = {
      Id: videoToShow.map((v) => v._id),
    };
    http
      .post(`${apis.FETCH_VIDEOS_BY_ID}`, body)
      .then((res) => {
        setVideoDetails({
          link: res.data.data[idx].videoPath,
          missionDetails: res.data.data[idx],
          isSRT: res.data.data[idx].isSRT,
        });
        setShowCarousel(true);
      })
      .catch((err) => {
        console.log(err.response.status);
        if (err.response.status == 404) {
          setVideoDetails({
            link: data.videoPath,
            missionDetails: data,
            isSRT: data.isSRT,
          });
          setShowCarousel(true);
        } else if (err.response.status == 500) {
          AxiosErrorHandler(err, logout);
        } else {
          message.error("API Call failed! " + err);
        }
      });
  };
  const updateVODs = () => {
    const body = {
      Id: videoToShow.map((v) => v._id),
    };
    http
      .post(`${apis.FETCH_VIDEOS_BY_ID}`, body)
      .then((res) => {
        setVideoToShow(res.data.data);
      })
      .catch((err) => {
        console.log(err.response.status);
        if (err.response.status == 500) {
          AxiosErrorHandler(err, logout);
        } else {
          message.error("API Call failed! " + err);
        }
      });
  };

  useEffect(() => {
    if (viewMedia && videoToShow.length > 0) {
      updateVODs();
    }
  }, [viewMedia]);

  useEffect(() => {
    console.log("missionLayer2", missionLayer, coordinates);
  }, [missionLayer, coordinates]);
  // useEffect(() => console.log("All layers: ", AllLayers), [AllLayers]);
  const handleChangeComplete = (color) => {
    setColor(color.hex);
  };

  const handleChange = (color, event) => {
    setColor(color.hex);
  };

  useEffect(() => {
    SetAllLayers((prev) =>
      prev.map((layer) => {
        if (layer._id === activeID) {
          layer._isChecked = true;
          layer._metadata = {
            ...layer._metadata,
            highlightIndexes: selectedIndexes as number[],
          }
        }
        return layer;
      })
    );
    if (selectedFeatures.length > 0) {
      const bounds = turf.bbox(turf.featureCollection(selectedFeatures));
      const { longitude, latitude, zoom } = calculateViewport(bounds);
      setViewport({
        longitude,
        latitude,
        zoom,
        pitch: 0,
        minZoom: 0,
        maxZoom: 22,
        bearing: 0,
        transitionDuration: 2000,
        transitionInterpolator: new FlyToInterpolator(),
      });
    }
  }, [selectedIndexes, activeID]);

  const actionMenuOnClick = ({ key }) => {
    console.log("key", key);
    switch (key) {
      case "1":
        return exportAll();
      case "2":
        return exportSelected();
      case "3":
        return toggleFlagSelected(true);
      case "4":
        return toggleFlagSelected(false);
      default:
        console.log("Incorrect Action Menu Key");
        return;
    }
  };
  const filterItems = [
    {
      key: "1",
      label: "Flagged",
      className: `flag-filter ${flaggedFilter ? "selected" : ""}`,
      icon: <TbFlag />,
    },
    {
      key: "2",
      label: "Un-flagged",
      className: `flag-filter ${unflaggedFilter ? "selected" : ""}`,
      icon: <TbFlagOff />,
    },
  ];

  const filterOnClick = ({ key }) => {
    switch (key) {
      case "1":
        setFlaggedFilter(!flaggedFilter);
        setSelectedIndexes([]);
        if (unflaggedFilter) {
          setUnflaggedFilter(false);
        }
        return;
      case "2":
        setUnflaggedFilter(!unflaggedFilter);
        setSelectedIndexes([]);
        if (flaggedFilter) {
          setFlaggedFilter(false);
        }
        return;
      default:
        console.log("Incorrect Filter");
        return;
    }
  };
  const actionMenuItems = [
    {
      key: "export",
      label: "Export CSV",
      icon: <ExportOutlined />,
      children: [
        {
          key: "1",
          label: "Export All",
        },
        {
          key: "2",
          label: "Export Selected",
        },
      ],
    },
  ];
  if (perms.canEditGeojson) {
    actionMenuItems.push({
      key: "flag",
      label: "Toggle Flag",
      icon: <FlagOutlined />,
      children: [
        {
          key: "3",
          label: "Flag Selected",
        },
        {
          key: "4",
          label: "Un-flag Selected",
        },
      ],
    });
  }
  const toggleLayerFlag = (layerId: string, flag: boolean) => {
    const payload: any = {
      flag: flag,
    };
    http
      .patch(`${apis.FLAG_LAYER}/${layerId}`, payload)
      .then((res) => {
        if (res.data.status) {
          message.success(
            flag ? "Layer Flagged Successfully" : "Layer Unflagged Successfully"
          );
          SetAllLayers((prev) =>
            prev.map((layer) => {
              if (layer._id === layerId) {
                layer.isFlagged = flag;
              }
              return layer;
            })
          );
          setRefreshLayer(!refreshLayer);
          setShouldAttributeTableReload(!shouldAttributeTableReload);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, logout);
      });
  };
  function toggleFlagSelected(flag: boolean) {
    const payload: any = {
      featureIndex: selectedIndexes,
      flag: flag,
    };
    http
      .patch(`${apis.FLAG_FEATURE}/${activeID}`, payload)
      .then((res) => {
        if (res.data.status) {
          message.success(
            flag
              ? "Flagged Selected Successfully"
              : "Unflagged Selected Successfully"
          );
          SetAllLayers((prev) =>
            prev.map((layer) => {
              if (activeID === layer._id) {
                const indexes = selectedIndexes.map((i) => Number(i));
                return {
                  ...layer,
                  flaggedFeatures: flag
                    ? [...layer.flaggedFeatures, ...indexes]
                    : layer.flaggedFeatures.filter((f) => !indexes.includes(f)),
                };
              } else return layer;
            })
          );
          setShouldAttributeTableReload(!shouldAttributeTableReload);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, logout);
      });
  }

  function exportAll() {
    const payload: any = {
      id: activeID,
    };
    http
      .patch(`${apis.EXPORT_FEATURES}`, payload)
      .then((res) => {
        if (res.data.status) {
          message.success("Export Successful");
          //console.log(res.data);
          window.open(`${STATIC_URL}${res.data.pathh}`);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, logout);
      });
  }

  function exportSelected() {
    const payload: any = {
      id: activeID,
      featureIndex: selectedIndexes,
    };
    http
      .patch(`${apis.EXPORT_FEATURES}`, payload)
      .then((res) => {
        if (res.data.status) {
          message.success("Export Successful");
          window.open(`${STATIC_URL}${res.data.pathh}`);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, logout);
      });
  }

  //--------Generate Fill Color----------------------------------------------
  // No longer required
  // function hexToRGB(hex, o) {
  //   const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  //   hex = hex.replace(shorthandRegex, function(m, r, g, b) {
  //     return r + r + g + g + b + b;
  //   });
  //   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  //   const opacity = o ? 150 : 50;
  //   return result
  //     ? [
  //       parseInt(result[1], 16),
  //       parseInt(result[2], 16),
  //       parseInt(result[3], 16),
  //       opacity,
  //     ]
  //     : null;
  // }
  // function hexToRGB2(hex, o) {
  //   const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  //   hex = hex.replace(shorthandRegex, function(m, r, g, b) {
  //     return r + r + g + g + b + b;
  //   });
  //   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  //   const opacity = o ? 150 : 50;
  //   return result
  //     ? [
  //       parseInt(result[1], 16),
  //       parseInt(result[2], 16),
  //       parseInt(result[3], 16),
  //     ]
  //     : null;
  // }
  // function invertColor(hex) {
  //   if (hex.indexOf("#") === 0) {
  //     hex = hex.slice(1);
  //   }
  //   // convert 3-digit hex to 6-digits.
  //   if (hex.length === 3) {
  //     hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  //   }
  //   if (hex.length !== 6) {
  //     throw new Error("Invalid HEX color.");
  //   }
  //   // invert color components
  //   const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
  //     g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
  //     b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  //   // pad each with zeros and return
  //   return "#" + padZero(r) + padZero(g) + padZero(b);
  // }
  // function padZero(str, len) {
  //   len = len || 2;
  //   const zeros = new Array(len).join("0");
  //   return (zeros + str).slice(-len);
  // }
  // function ThreeDeeFillColor(hex: any) {
  //   const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  //   hex = hex.replace(shorthandRegex, function(m, r, g, b) {
  //     return r + r + g + g + b + b;
  //   });
  //   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  //   return result
  //     ? [
  //       parseInt(result[1], 16),
  //       parseInt(result[2], 16),
  //       parseInt(result[3], 16),
  //     ]
  //     : null;
  // }
  // function hexToRGBSolid(hex) {
  //   const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  //   hex = hex.replace(shorthandRegex, function(m, r, g, b) {
  //     return r + r + g + g + b + b;
  //   });

  //   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  //   return result
  //     ? [
  //       parseInt(result[1], 16),
  //       parseInt(result[2], 16),
  //       parseInt(result[3], 16),
  //     ]
  //     : null;
  // }

  //----------------------------INFO WINDOW handeller------------------------
  function InfoWindow(
    idx: any,
    coordinate: any,
    layername: any,
    mode: any,
    feature: any,
    show: any,
    id: any,
    sysId: any,
    type: any = ""
  ) {
    //console.log(data);
    setFeatureIdx(idx);
    setMissionLayer(type);
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
  // const getRasterURL = (rasterType, path, settings, x?, y?, z?) => {
  //   //SetColorMap(settings.color);
  //   const scale = "@1x";
  //   const format = ".png";
  //   const baseURL = `${COG_URL}/cog/tiles/${z ? z : "{z}"}/${x ? x : "{x}"}/${
  //     y ? y : "{y}"
  //   }${scale}${format}`;
  //   const { resamplingMethod, bidx, minp, maxp } = settings;
  //   const queries: any = {
  //     url: `${TITILER_STATIC}${path}`,
  //     [resamplingMethod && "resampling_method"]: resamplingMethod,
  //     [bidx && "bidx"]: bidx,
  //     [minp && maxp && "rescale"]: `${minp},${maxp}`,
  //   };
  //   if (["DEM"].includes(rasterType)) {
  //     // kept as an array because more raster types may need colormap in future
  //     queries["colormap_name"] = colorMap;
  //   }
  //   delete queries["undefined"];
  //   delete queries["null"];
  //   const queryString = new URLSearchParams(queries).toString();
  //   console.log(`${baseURL}?${queryString}`);
  //   return `${baseURL}?${queryString}`;
  // };

  function handleClose(status: boolean) {
    console.log("im in the handlecloe function ");
    togglePopup(status);
  }

  // Should no longer be required, both implemented within focusSelectedLayers
  // const filterFeatures = (layerId, data) => {
  //   if (flaggedFilter || unflaggedFilter) {
  //     return data.filter((feature, idx) => {
  //       if (flaggedFilter) {
  //         return allLayers[layerId]?.flaggedFeatures.includes(idx);
  //       } else if (unflaggedFilter) {
  //         return !allLayers[layerId]?.flaggedFeatures.includes(idx);
  //       }
  //     });
  //   } else {
  //     return data;
  //   }
  // };
  // async function parseGeoJson(layerId, file) {
  //   return new Promise((resolve, reject) => {
  //     fetch(file)
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error("Failed to fetch GeoJSON data");
  //         }
  //         return response.json();
  //       })
  //       .then((data) => {
  //         const features = data.features;
  //         const filteredFeatures = filterFeatures(layerId, features);
  //         resolve(filteredFeatures);
  //       })
  //       .catch((error) => {
  //         reject(error);
  //       });
  //   });
  // }

  //-------------on layer check-------------------------------

  useEffect(() => {
    // console.log("it may be by traiin map",checkedKeys);
    setScaleData();
    // drawLayers(checkedKeys);
    // focusSelectedLayers();
    console.log("lost");
  }, [
    // checkedKeys,
    // allLayers,
    AllLayers,
    MissionLayers,
    geoJsonVOD,
    geoJsonAlert,
    flaggedFilter,
    unflaggedFilter,
    pointMarkerSize,
    layerOpacity,
  ]);

  useEffect(() => {
    forceUpdateAllLayers();
  }, [selectedIndexes, showSelectedIndexes]);

  function setOverlayID(id: string, overlayId: string) {
    SetAllLayers((prev) =>
      prev.map((layer) => {
        if (layer._id === id)
          layer._metadata = { ...layer._metadata, overlayId };
        return layer;
      })
    );
  }

  useEffect(() => {
    SetAllLayers((prev) =>
      prev.map((layer) => {
        if (layer.type === "Raster" && layer.raster === rasterProps.DEM) {
          layer._render3D = terrainmap;
          layer._metadata = { ...layer._metadata, colorMap };
        }
        if (layerOpacity) {
          layer._metadata = { ...layer._metadata, layerOpacity };
        }
        return layer;
      })
    );
  }, [terrainmap, colorMap,layerOpacity]);

  useEffect(() => {
    //console.log("current 3d", threeDState);
    SetAllLayers((prev) =>
      prev.map((layer) => {
        if (layer._id === featureLayer)
          layer._render3D = threeDState === "Enabled";
        return layer;
      })
    );
    // if (threeDState === "Enabled") {
    //   set3DTranspose(true);
    //   const al = { ...allLayers };
    //   al[`1-${featureLayer}`].T3DTranspose = true;
    //   setAllLayers(al);
    //   forceUpdateLayers(featureLayer);
    // } else if (threeDState === "Disabled") {
    //   set3DTranspose(false);
    //   const al = { ...allLayers };
    //   al[`1-${featureLayer}`].T3DTranspose = false;
    //   setAllLayers(al);
    //   forceUpdateLayers(featureLayer);
    // }
  }, [threeDState]);
  // ++++++++++++++++++++++++++++++++++++ force updation of layers after creating or adding features +++++++++++++++++++++++++++++++++++++++++++
  const forceUpdateLayers = (id: any) => {
    // const cv = [...checkedKeys];

    // if (cv.length == 0) {
    //   cv.push("1" + "-" + id);
    // } else {
    //   setCheckedKeys([]);
    //   const idx = cv.findIndex((key) => key === "1" + "-" + id);

    //   if (idx === -1) cv.push("1" + "-" + id);
    // }

    // setTimeout(() => {
    //   setCheckedKeys(cv);
    // }, 0);
    SetAllLayers((prev) => [...prev]);
  };

  const forceUpdateAllLayers = () => {
    // console.log("it my br by terrainmap");
    // const cv = [...checkedKeys];
    // setCheckedKeys([]);

    // setTimeout(() => {
    //   setCheckedKeys(cv);
    // });
    SetAllLayers((prev) => [...prev]);
  };

  const setScaleData = () => {
    const demLayers = AllLayers.filter(
      (layer) =>
        layer._isChecked &&
        layer.type === "Raster" &&
        layer.raster === rasterProps.DEM
    );
    setScales(demLayers);
    if (demLayers.length) {
      setScaleVisible(true);
    } else {
      setScaleVisible(false);
    }
  };

  const calculateViewport = (bbox) => {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    const mapContainer = document.getElementById("view-default-view");

    if (mapContainer) {
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
    }
  };

  const focusSelectedLayers = async () => {
    const boundingBoxes: BBox[] = [];
    for (const layer of AllLayers) {
      if (layer._isChecked && layer._metadata?.bounds) {
        boundingBoxes.push(layer._metadata.bounds);
      }
    }
    if (MissionLayers.isAlertChecked) {
      const { data } = await http.get(
        STATIC_URL + MissionLayers.alertGeojsonUrl
      );
      const { features } = data;
      if (Array.isArray(features) && features.length > 0) {
        const bounds = turf.bbox(turf.featureCollection(features)) as BBox;
        boundingBoxes.push(bounds);
      }
    }
    if (MissionLayers.isVODChecked) {
      const { data } = await http.get(STATIC_URL + MissionLayers.vodGeojsonUrl);
      const { features } = data;
      if (Array.isArray(features) && features.length > 0) {
        const bounds = turf.bbox(turf.featureCollection(features)) as BBox;
        boundingBoxes.push(bounds);
      }
    }
    if (boundingBoxes.length > 0) {
      const finalBounds = mergeBoundingBoxes(boundingBoxes);
      const { longitude, latitude, zoom } = calculateViewport(finalBounds);
      setViewport({
        longitude /* : (bounds[0][0] + bounds[1][0]) / 2 */,
        latitude /* : (bounds[0][1] + bounds[1][1]) / 2 */,
        zoom,
        pitch: 0,
        minZoom: 0,
        maxZoom: 22,
        bearing: 0,
        transitionDuration: 2000,
        transitionInterpolator: new FlyToInterpolator(),
      });
    }
  };

  // No longer required
  // const drawLayers = async (checkedKeysValue: any) => {
  //   const vlayers: Array<any> = [];
  //   setShowMarkerSizeTool(false);

  //   const createSVGIcon = (idx: any, color: string) => {
  //     return `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  //       width="800px" height="800px" viewBox="0 0 490.939 490.939" xml:space="preserve">
  //       <g>
  //         <g>
  //           <path style="fill:${color};" d="M41.552,490.939c-2.665,0-5.297-1.064-7.237-3.095c-3.185-3.337-3.675-8.419-1.186-12.303L181.221,244.52L33.149,15.43
  //             c-2.508-3.88-2.031-8.973,1.152-12.32c3.183-3.347,8.245-4.081,12.246-1.768l407.844,235.47c3.094,1.786,5,5.088,5,8.66
  //             s-1.906,6.874-5,8.66L46.548,489.6C44.986,490.5,43.263,490.939,41.552,490.939z M72.451,39.39l129.061,199.679
  //             c2.128,3.293,2.136,7.525,0.02,10.825L72.156,451.721l357.236-206.25L72.451,39.39z"/>
  //         </g>
  //       </g>
  //     </svg>`;
  //   };

  //   const svgToDataURL = (svg: any) => {
  //     return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  //   };

  //   let windData: any;

  //   await checkedKeysValue.forEach(async (element) => {
  //     // console.log("element ----------",element)
  //     if (element.split("-")[0] === "2" && element !== "2") {
  //       if (props.isBaseMap) {
  //         const layer: any = allLayers[element];
  //         await layer?.layerPath.map(async (layerr: any) => {
  //           const settings: any = {
  //             minp: layerr[0].minP,
  //             maxp: layerr[0].maxP,
  //             resamplingMethod: layer.settings.resamplingMethod,
  //             bidx: layer.settings.bidx,
  //           };
  //           const rasterpath = `${TITILER_STATIC}` + layerr[0].path;
  //           const metaDataURL = `${COG_URL}/cog/info?url=${rasterpath}`;
  //           const response = await fetch(metaDataURL, {
  //             method: "GET",
  //           });
  //           const metadata = await response.json();
  //           const bounds = [
  //             metadata["bounds"][0],
  //             metadata["bounds"][1],
  //             metadata["bounds"][2],
  //             metadata["bounds"][3],
  //           ];
  //           const { longitude, latitude, zoom } = calculateViewport(bounds);
  //           setViewport({
  //             longitude /* : (bounds[0][0] + bounds[1][0]) / 2 */,
  //             latitude /* : (bounds[0][1] + bounds[1][1]) / 2 */,
  //             zoom,
  //             pitch: 0,
  //             minZoom: 0,
  //             maxZoom: 22,
  //             bearing: 0,
  //             transitionDuration: 2000,
  //             transitionInterpolator: new FlyToInterpolator(),
  //           });

  //           // ---pushing tiler layers

  //           vlayers.push(
  //             new TileLayer({
  //               id: element,
  //               // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
  //               // data: getRasterURL(layer?.type, layerr[0].path, settings),
  //               getTileData: (tile) => {
  //                 const { index } = tile;
  //                 const rasterUrl = getRasterURL(
  //                   layer?.type,
  //                   layerr[0].path,
  //                   settings,
  //                   index.x,
  //                   index.y,
  //                   index.z
  //                 );

  //                 const mapBounds = mapRef.current.getMap().getBounds();
  //                 // console.log("Map Bounds: ", mapBounds);
  //                 // console.log("Raster Bounds: ", bounds);
  //                 const [minLong, minLat, maxLong, maxLat] = bounds;
  //                 const minLongMap = mapBounds._sw.lng;
  //                 const minLatMap = mapBounds._sw.lat;
  //                 const maxLongMap = mapBounds._ne.lng;
  //                 const maxLatMap = mapBounds._ne.lat;
  //                 if (
  //                   minLongMap > maxLong ||
  //                   maxLongMap < minLong ||
  //                   minLatMap > maxLat ||
  //                   maxLatMap < minLat
  //                 ) {
  //                   console.log("Not loading new data");
  //                   return tile;
  //                 } else {
  //                   console.log("Loading new data");
  //                   return load(rasterUrl);
  //                 }
  //               },
  //               minZoom: 0,
  //               maxZoom: 24,
  //               tileSize: 256,
  //               onDataLoad: () => {
  //                 setLayerLoading(false);
  //               },

  //               pickable: true,
  //               onHover: (event) =>
  //                 handleHover({ ...event, allLayers, element, settings }),

  //               renderSubLayers: (props) => {
  //                 const {
  //                   bbox: { west, south, east, north },
  //                 } = props.tile;
  //                 console.log("props.data 2:", props.data);
  //                 console.log("layer type: ", allLayers[element]?.type);
  //                 return new BitmapLayer(props, {
  //                   data: null,
  //                   image: props.data,
  //                   bounds: [west, south, east, north],
  //                   extensions: [new MaskExtension()],
  //                   maskId: maskLayer.id,
  //                   opacity: opcity,
  //                 });
  //               },
  //             })
  //           );
  //         });
  //       } else {
  //         console.log("Raster");
  //         const rasterpath =
  //           `${TITILER_STATIC}` + allLayers[element]?.layerPath;
  //         const metaDataURL = `${COG_URL}/cog/info?url=${rasterpath}`;
  //         const response = await fetch(metaDataURL, {
  //           method: "GET",
  //         });
  //         const metadata = await response.json();
  //         const bounds = [
  //           metadata["bounds"][0],
  //           metadata["bounds"][1],
  //           metadata["bounds"][2],
  //           metadata["bounds"][3],
  //         ];
  //         console.log("props.data 3:", bounds);

  //         const { longitude, latitude, zoom } = calculateViewport(bounds);
  //         setViewport({
  //           longitude /* : (bounds[0][0] + bounds[1][0]) / 2 */,
  //           latitude /* : (bounds[0][1] + bounds[1][1]) / 2 */,
  //           zoom,
  //           pitch: 0,
  //           minZoom: 0,
  //           maxZoom: 22,
  //           bearing: 0,
  //           transitionDuration: 2000,
  //           transitionInterpolator: new FlyToInterpolator(),
  //         });
  //         vlayers.push(
  //           new TileLayer({
  //             id: element,
  //             // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
  //             // data: getRasterURL(
  //             //   allLayers[element]?.type,
  //             //   allLayers[element]?.layerPath,
  //             //   allLayers[element]?.settings
  //             // ),
  //             pickable: true,

  //             getTileData: async (tile) => {
  //               const { index } = tile;
  //               const rasterUrl = getRasterURL(
  //                 allLayers[element]?.type,
  //                 allLayers[element]?.layerPath,
  //                 allLayers[element]?.settings,
  //                 index.x,
  //                 index.y,
  //                 index.z
  //               );

  //               const mapBounds = mapRef.current.getMap().getBounds();
  //               // console.log("Map Bounds: ", mapBounds);
  //               // console.log("Raster Bounds: ", bounds);
  //               const [minLong, minLat, maxLong, maxLat] = bounds;
  //               const minLongMap = mapBounds._sw.lng;
  //               const minLatMap = mapBounds._sw.lat;
  //               const maxLongMap = mapBounds._ne.lng;
  //               const maxLatMap = mapBounds._ne.lat;
  //               if (
  //                 minLongMap > maxLong ||
  //                 maxLongMap < minLong ||
  //                 minLatMap > maxLat ||
  //                 maxLatMap < minLat
  //               ) {
  //                 // console.log("Not loading new data");
  //                 return tile;
  //               } else {
  //                 // console.log("Loading new data");
  //                 return load(rasterUrl);
  //               }
  //             },

  //             onHover: (event) => handleHover({ ...event, allLayers, element }),

  //             minZoom: 0,
  //             maxZoom: 24,
  //             tileSize: 256,
  //             onDataLoad: () => {
  //               setLayerLoading(false);
  //             },
  //             renderSubLayers: (props) => {
  //               const {
  //                 bbox: { west, south, east, north },
  //               } = props.tile;
  //               console.log("props.data 4:", props.data, maskLayer.id);
  //               console.log("layer type: ", allLayers[element]?.type);
  //               return new BitmapLayer(props, {
  //                 data: null,
  //                 image: props.data,
  //                 bounds: [west, south, east, north],
  //                 extensions: [new MaskExtension()],
  //                 maskId: maskLayer.id,
  //                 opacity: opcity, // Set the desired opacity value (0 to 1)
  //               });
  //             },
  //           })
  //         );
  //         if (terrainmap) {
  //           vlayers.splice(
  //             vlayers.findIndex((layer) => layer.id == element),
  //             1
  //           );
  //           vlayers.push(
  //             new TerrainLayer({
  //               id: element,
  //               elevationDecoder: {
  //                 rScaler: 0.299,
  //                 gScaler: 0.587,
  //                 bScaler: 0.114,
  //                 offset: 0,
  //               },
  //               minZoom: 13,
  //               maxZoom: 19,
  //               elevationData: getRasterURL(
  //                 allLayers[element]?.type,
  //                 allLayers[element]?.layerPath,
  //                 allLayers[element]?.settings,
  //                 "x",
  //                 "y",
  //                 "z"
  //               ),
  //               tileSize: 256,
  //               // texture: "https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.webp?sku=101Y90ZfwGPtj&access_token=pk.eyJ1IjoibmVlbGR1dHRhMTkiLCJhIjoiY2tweG9mN3F4MThrNTJ4cDk0enVjcTN4dCJ9.uxa_h0rjqumTxFMI1QELKQ"
  //               texture: getRasterURL(
  //                 "OVERLAY",
  //                 allLayers[element]?.layerPath,
  //                 allLayers[element]?.settings,
  //                 "x",
  //                 "y",
  //                 "z"
  //               ),
  //             })
  //           );
  //         }
  //       }
  //     } else if (element.split("-")[0] === "1" && element !== "1") {
  //       switch (allLayers[element]?.type) {
  //         case "MultiLineString":
  //           vlayers.push(
  //             new GeoJsonLayer({
  //               id: element,
  //               data: STATIC_URL + allLayers[element]?.layerPath,
  //               pickable: true,
  //               // stroked: true,
  //               // filled: true,
  //               extruded: false,
  //               lineWidthUnits: "pixels",
  //               lineWidthScale: 4,
  //               lineWidthMinPixels: 2,
  //               lineJoinRounded: true,
  //               onDataLoad: () => {
  //                 setLayerLoading(false);
  //               },
  //               getLineColor: (d, i) => {
  //                 if (activeID === element.split("-")[1]) {
  //                   if (selectedIndexes.includes(i.index)) {
  //                     return hexToRGB("#ffaa00");
  //                   }
  //                 }
  //                 return hexToRGB(d.properties.color);
  //               },
  //               // getRadius: 100,
  //               // getLineWidth: 1,
  //               // getElevation: 30 ,
  //               onClick: (data, e) => {
  //                 if (e.leftButton) {
  //                   InfoWindow(
  //                     data.index,
  //                     data.coordinate,
  //                     allLayers[element]?.name,
  //                     "LineView",
  //                     data.object,
  //                     false,
  //                     allLayers[element]?.id,
  //                     data.object.properties.sys_id,
  //                     "Vector"
  //                   );
  //                   setSelectedLayerLabel(
  //                     allLayers[element]?.layerLabel
  //                       ? allLayers[element]?.layerLabel
  //                       : "No label selected"
  //                   );
  //                   setSelectedLayerPopupLabel(
  //                     allLayers[element]?.layerPopupLabel
  //                       ? allLayers[element]?.layerPopupLabel
  //                       : "No label selected"
  //                   );
  //                 } else {
  //                   setSelectedLayerId(element.split("-")[1]);
  //                   setColorChangeFeatureData(data);
  //                   setShowColorChangeForm(true);
  //                 }
  //               },
  //               onHover: (data, e) => {
  //                 setLayerName(allLayers[element]?.name);
  //                 setSelectedLayerPopupLabel(
  //                   allLayers[element]?.layerPopupLabel
  //                 );
  //               },
  //             })
  //           );
  //           break;
  //         case "MultiPolygon":
  //           vlayers.push(
  //             new GeoJsonLayer({
  //               id: element,
  //               data: STATIC_URL + allLayers[element]?.layerPath,
  //               pickable: true,
  //               stroked: true,
  //               filled: true,
  //               extruded: allLayers[element]?.T3DTranspose,
  //               lineWidthUnits: "pixels",
  //               lineWidthScale: 4,
  //               lineWidthMinPixels: 2,
  //               lineJoinRounded: true,
  //               onDataLoad: () => {
  //                 setLayerLoading(false);
  //               },
  //               getFillColor: (d, i) => {
  //                 if (allLayers[element]?.T3DTranspose) {
  //                   if (activeID === element.split("-")[1]) {
  //                     if (selectedIndexes.includes(i.index)) {
  //                       console.log(i);
  //                       return hexToRGB("#ffaa00");
  //                     }
  //                   }
  //                   return hexToRGB(d.properties.color);
  //                 } else {
  //                   if (activeID === element.split("-")[1]) {
  //                     console.log(i);
  //                     if (selectedIndexes.includes(i.index)) {
  //                       return hexToRGB("#ffaa00", 150);
  //                     }
  //                   }
  //                   return hexToRGB(d.properties.color, 50);
  //                 }
  //               },
  //               getLineColor: (d, i) => {
  //                 if (allLayers[element]?.T3DTranspose) {
  //                   if (activeID === element.split("-")[1]) {
  //                     if (selectedIndexes.includes(i.index)) {
  //                       return hexToRGB("#ffaa00");
  //                     }
  //                   }
  //                   return hexToRGB(d.properties.color);
  //                 } else {
  //                   if (activeID === element.split("-")[1]) {
  //                     if (selectedIndexes.includes(i.index)) {
  //                       return hexToRGB("#ffaa00");
  //                     }
  //                   }
  //                   return hexToRGB(d.properties.color);
  //                 }
  //               },
  //               //getRadius: 100,
  //               //getLineWidth: 1,
  //               getElevation: (d) => {
  //                 if (d.properties?.height) {
  //                   return d.properties.height;
  //                 }
  //               },
  //               onClick: (data, e) => {
  //                 //console.log("data",allLayers[element]?);
  //                 if (e.leftButton) {
  //                   InfoWindow(
  //                     data.index,
  //                     data.coordinate,
  //                     allLayers[element]?.name,
  //                     "PolygonView",
  //                     data.object,
  //                     false,
  //                     allLayers[element]?.id,
  //                     data.object.properties.sys_id,
  //                     "Vector"
  //                   );
  //                   setSelectedLayerLabel(
  //                     allLayers[element]?.layerLabel
  //                       ? allLayers[element]?.layerLabel
  //                       : "No label selected"
  //                   );
  //                   setSelectedLayerPopupLabel(
  //                     allLayers[element]?.layerPopupLabel
  //                       ? allLayers[element]?.layerPopupLabel
  //                       : "No label selected"
  //                   );
  //                 } else {
  //                   setSelectedLayerId(element.split("-")[1]);
  //                   setColorChangeFeatureData(data);
  //                   setShowColorChangeForm(true);
  //                 }
  //               },
  //               onHover: (data, e) => {
  //                 setLayerName(allLayers[element]?.name);
  //                 setSelectedLayerPopupLabel(
  //                   allLayers[element]?.layerPopupLabel
  //                 );
  //               },
  //               extensions: [new DataFilterExtension({ filterSize: 1 })],
  //               getFilterValue: (f, i) => {
  //                 return showSelectedIndexes.length
  //                   ? Number(f.properties[key])
  //                   : null;
  //               },
  //               filterRange: showSelectedIndexes,
  //             })
  //           );
  //           break;
  //         case "Point":
  //           setShowMarkerSizeTool(true);
  //           vlayers.push(
  //             new IconLayer({
  //               id: element,
  //               data: parseGeoJson(
  //                 element,
  //                 STATIC_URL + allLayers[element]?.layerPath
  //               ),
  //               pickable: true,
  //               // iconAtlas: TankIcon,
  //               //iconMapping: ICON_MAPPING,
  //               getIcon: (d) => {
  //                 const iconSelector = (iconType) => {
  //                   let icon = "";
  //                   switch (iconType) {
  //                     case "MarkerIcon":
  //                       icon = MarkerIcon;
  //                       break;
  //                     case "TankIcon":
  //                       icon = TankIcon;
  //                       break;
  //                     case "DotIcon":
  //                       icon = DotIcon;
  //                       break;
  //                     case "ValveIcon":
  //                       icon = ValveIcon;
  //                       break;
  //                   }
  //                   return icon;
  //                 };
  //                 return {
  //                   url: `${iconSelector(d.properties.icon)}`,
  //                   width: 100,
  //                   height: 129,
  //                   anchorY: 125,
  //                   mask: true,
  //                 };
  //               },
  //               onDataLoad: () => {
  //                 setLayerLoading(false);
  //               },
  //               // getFillColor: (d, i) => {
  //               //   if (activeID === element.split("-")[1]) {
  //               //     if (selectedIndexes.includes(i.index)) {
  //               //       return hexToRGB("#ffaa00");
  //               //     }
  //               //   }
  //               //   return hexToRGB(d.properties.color);
  //               // },
  //               sizeScale: 12 * pointMarkerSize,
  //               getPosition: (d) => d.geometry.coordinates,
  //               getSize: (d) => 5,
  //               getColor: (d, i) => {
  //                 if (activeID === element.split("-")[1]) {
  //                   if (selectedIndexes.includes(i.index)) {
  //                     return hexToRGB("#ffaa00");
  //                   }
  //                 }
  //                 if (unflaggedFilter) {
  //                   return hexToRGB(d.properties.color);
  //                 }
  //                 if (
  //                   flaggedFilter ||
  //                   allLayers[element]?.flaggedFeatures.includes(i.index)
  //                 ) {
  //                   return hexToRGB(invertColor(d.properties.color));
  //                 }
  //                 return hexToRGB(d.properties.color);
  //               },
  //               onClick: (data, e) => {
  //                 if (e.leftButton) {
  //                   InfoWindow(
  //                     data.index,
  //                     data.coordinate,
  //                     allLayers[element]?.name,
  //                     "PointView",
  //                     data.object,
  //                     false,
  //                     allLayers[element]?.id,
  //                     data.object.properties.sys_id,
  //                     "Vector"
  //                   );
  //                   setSelectedLayerLabel(
  //                     allLayers[element]?.layerLabel
  //                       ? allLayers[element]?.layerLabel
  //                       : "No label selected"
  //                   );
  //                   setSelectedLayerPopupLabel(
  //                     allLayers[element]?.layerPopupLabel
  //                       ? allLayers[element]?.layerPopupLabel
  //                       : "No label selected"
  //                   );
  //                 } else {
  //                   setSelectedLayerId(element.split("-")[1]);
  //                   setColorChangeFeatureData(data);
  //                   setShowColorChangeForm(true);
  //                 }
  //               },
  //               onHover: (data, e) => {
  //                 setLayerName(allLayers[element]?.name);
  //                 setSelectedLayerPopupLabel(
  //                   allLayers[element]?.layerPopupLabel
  //                 );
  //               },
  //             })
  //           );
  //           break;
  //         case "air_pollution":
  //           vlayers.push(
  //             new HeatmapLayer({
  //               id: element,
  //               data: parseGeoJson(
  //                 element,
  //                 STATIC_URL + allLayers[element]?.layerPath
  //               ),
  //               getPosition: (d: any) => d.geometry.coordinates,
  //               getWeight: (d: any) => d.properties.aqi,
  //               aggregation: "SUM",
  //               pickable: true,
  //               pickingRadius: 20,
  //             })
  //           );
  //           vlayers.push(
  //             new TextLayer({
  //               id: element + "-1",
  //               data: parseGeoJson(
  //                 element,
  //                 STATIC_URL + allLayers[element]?.layerPath
  //               ),
  //               getPosition: (d: any) => d.geometry.coordinates,
  //               getText: (d: any) => {
  //                 return `${d.properties.aqi}`;
  //               },
  //               getSize: 32,
  //               getColor: [59, 43, 82],
  //               pickable: true,
  //               sizeable: 2,
  //               sizeMinPixels: 6,
  //               sizeMaxPixels: 25,
  //               getBorderColor: [255, 255, 255, 255],
  //               getTextOutlineWidth: 2,
  //               getTextOutlineColor: [255, 255, 255, 255],
  //             })
  //           );
  //           break;
  //         case "wind_direction":
  //           windData = await parseGeoJson(
  //             element,
  //             STATIC_URL + allLayers[element]?.layerPath
  //           );
  //           console.log(windData);

  //           vlayers.push(
  //             new IconLayer({
  //               id: element,
  //               data: windData,
  //               getPosition: (d: any) => d.geometry.coordinates,
  //               getIcon: (d: any, { index }: { index: any }) => {
  //                 const windSpeed = d.properties.windSpeed;
  //                 const maxWindSpeed = Math.max(
  //                   ...windData.map((d) => d.properties.windSpeed)
  //                 );

  //                 // Check if windSpeed is a valid number
  //                 if (
  //                   !isNaN(windSpeed) &&
  //                   !isNaN(maxWindSpeed) &&
  //                   maxWindSpeed !== 0
  //                 ) {
  //                   const t = windSpeed / maxWindSpeed;
  //                   const color = `rgb(${255 * (1 - t)}, ${255 * t}, 0)`;

  //                   return {
  //                     url: svgToDataURL(createSVGIcon(index, color)),
  //                     width: 1024,
  //                     height: 1024,
  //                   };
  //                 } else {
  //                   // Handle invalid windSpeed or maxWindSpeed
  //                   console.error(
  //                     "Invalid windSpeed or maxWindSpeed:",
  //                     windSpeed,
  //                     maxWindSpeed
  //                   );
  //                   // You can provide a default color or take other appropriate actions here
  //                   return {
  //                     url: svgToDataURL(createSVGIcon(index, "rgb(255, 0, 0)")),
  //                     width: 1024,
  //                     height: 1024,
  //                   };
  //                 }
  //               },

  //               getSize: (d) => d.properties.windSpeed * 4,
  //               getAngle: (d) => 90 - d.properties.windDirection,
  //             })
  //           );
  //           break;
  //       }

  //       (async () => {
  //         try {
  //           const filteredFeatures = await parseGeoJson(
  //             element,
  //             STATIC_URL + allLayers[element]?.layerPath
  //           );

  //           console.log("filteredFeatures", filteredFeatures);

  //           if (Array.isArray(filteredFeatures)) {
  //             const bound = turf.bbox(turf.featureCollection(filteredFeatures));
  //             console.log("Bbox", bound);
  //             const { longitude, latitude, zoom } = calculateViewport(bound);
  //             console.log(
  //               "longitude, latitude, zoom",
  //               longitude,
  //               latitude,
  //               zoom
  //             );

  //             setViewport({
  //               longitude /* : (bounds[0][0] + bounds[1][0]) / 2 */,
  //               latitude /* : (bounds[0][1] + bounds[1][1]) / 2 */,
  //               zoom,
  //               pitch: 0,
  //               minZoom: 0,
  //               maxZoom: 22,
  //               bearing: 0,
  //               transitionDuration: 2000,
  //               transitionInterpolator: new FlyToInterpolator(),
  //             });
  //           } else {
  //             console.log("Filtered features is not an array.");
  //           }
  //         } catch (error) {
  //           console.error("Error:", error);
  //         }
  //       })();
  //     } else if (element.split("-")[0] === "3" && element !== "3") {
  //       setShowMarkerSizeTool(true);
  //       if (element.split("-")[1] === "2") {
  //         vlayers.push(
  //           new IconLayer({
  //             id: element,
  //             data: geoJsonAlert?.features,
  //             pickable: true,
  //             // iconAtlas: TankIcon,
  //             //iconMapping: ICON_MAPPING,
  //             getIcon: (d) => {
  //               return {
  //                 url: AlertIcon,
  //                 width: 200,
  //                 height: 220,
  //                 anchorY: 125,
  //                 mask: true,
  //               };
  //             },
  //             onDataLoad: () => {
  //               setLayerLoading(false);
  //             },
  //             // getFillColor: (d, i) => {
  //             //   if (activeID === element.split("-")[1]) {
  //             //     if (selectedIndexes.includes(i.index)) {
  //             //       return hexToRGB("#ffaa00");
  //             //     }
  //             //   }
  //             //   return hexToRGB(d.properties.color);
  //             // },
  //             sizeScale: 15 * pointMarkerSize,
  //             getPosition: (d) => d.geometry.coordinates,
  //             getSize: (d) => 5,
  //             getColor: (d, i) => {
  //               return hexToRGB("#d0021b");
  //             },
  //             onClick: (data, e) => {
  //               if (e.leftButton) {
  //                 InfoWindow(
  //                   data.index,
  //                   data.coordinate,
  //                   data.object.properties.Name.split(",")
  //                     .slice(0, 2)
  //                     .join(","),
  //                   "PointView",
  //                   data.object,
  //                   false,
  //                   element.split("-")[1],
  //                   data.object._id,
  //                   "Alert"
  //                 );
  //               } else {
  //                 setSelectedLayerId(element.split("-")[1]);
  //                 setColorChangeFeatureData(data);
  //                 setShowColorChangeForm(true);
  //               }
  //             },
  //           })
  //         );
  //       }
  //       if (element.split("-")[1] === "3") {
  //         vlayers.push(
  //           new IconLayer({
  //             id: element,
  //             data: geoJsonVOD?.features,
  //             pickable: true,
  //             // iconAtlas: TankIcon,
  //             //iconMapping: ICON_MAPPING,
  //             getIcon: (d) => {
  //               return {
  //                 url: VODIcon,
  //                 width: 200,
  //                 height: 220,
  //                 anchorY: 125,
  //                 mask: true,
  //               };
  //             },
  //             onDataLoad: () => {
  //               setLayerLoading(false);
  //             },
  //             // getFillColor: (d, i) => {
  //             //   if (activeID === element.split("-")[1]) {
  //             //     if (selectedIndexes.includes(i.index)) {
  //             //       return hexToRGB("#ffaa00");
  //             //     }
  //             //   }
  //             //   return hexToRGB(d.properties.color);
  //             // },
  //             sizeScale: 15 * pointMarkerSize,
  //             getPosition: (d) => d.geometry.coordinates,
  //             getSize: (d) => 5,
  //             getColor: (d, i) => {
  //               return hexToRGB("#d0021b");
  //             },
  //             onClick: (data, e) => {
  //               if (e.leftButton) {
  //                 InfoWindow(
  //                   data.index,
  //                   data.coordinate,
  //                   data.object.properties.name
  //                     .split(",")
  //                     .slice(0, 2)
  //                     .join(","),
  //                   "PointView",
  //                   data.object,
  //                   false,
  //                   element.split("-")[1],
  //                   data.object._id,
  //                   "VOD"
  //                 );
  //               } else {
  //                 setSelectedLayerId(element.split("-")[1]);
  //                 setColorChangeFeatureData(data);
  //                 setShowColorChangeForm(true);
  //               }
  //             },
  //           })
  //         );
  //       }
  //     }
  //     console.log("Missions", vlayers);
  //   });
  //   /* vlayers.push(
  //      new TileLayer({
  //        id: "BASE_LAYER-123123123",
  //        // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
  //        data: `${COG_URL}` +
  //        `/cog/tiles` +
  //        `/{z}/{x}/{y}@1x?url=${import.meta.env.VITE_BASE_URL}` +
  //        `/raster/1642486263367_20_DEM_10cm.tif` +
  //        `&resampling_method=nearest&bidx=1&rescale=17.799230575561523%2C93.64027404785156&colormap_name=plasma`,

  //        minZoom: 0,
  //        maxZoom: 24,
  //        tileSize: 256,
  //         onDataLoad: () => {
  //           setLayerLoading(false);
  //         },
  //        renderSubLayers: (props) => {
  //          const {
  //            bbox: { west, south, east, north },
  //          } = props.tile;

  //          return new BitmapLayer(props, {
  //            data: null,
  //            image: props.data,
  //            bounds: [west, south, east, north],
  //          });
  //        },
  //      })
  //    )*/
  //   setVisibleLayers(vlayers);
  // };

  // useEffect(() => {
  //   // Log the class name of the DeckGL canvas
  //   const canvasClassName = deckRef.current.deck.gl.canvas.className;
  //   console.log('DeckGL Canvas Class Name:', canvasClassName);
  // }, []);

  // Linear interpolation function (replace with your logic)
  const linearInterpolation = (rgbValues) => {
    console.log("DeckGL Canvas Class Name:");
    // Your linear interpolation logic here
    // For example, average of the RGB values
    const averageValue = (rgbValues[0] + rgbValues[1] + rgbValues[2]) / 3;
    return averageValue;
  };

  const [lastCount, setLastCount] = useState(0);

  // Should no longer be required
  // const sortLayersBySidebarOrdering = (checkedKeys, type) => {
  //   if (!checkedKeys.length) return [];
  //   const layerType = type === "mission" ? 2 : type === "raster" ? 1 : 0;
  //   const ordering: any = [];
  //   treeDataa[layerType].children.forEach((layer: any) => {
  //     checkedKeys.forEach((key) => {
  //       if (!layer.group) {
  //         if (key === layer.key) {
  //           ordering.push(key);
  //           return;
  //         }
  //       } else {
  //         layer.children.forEach((l) => {
  //           if (key === l.key) {
  //             ordering.push(key);
  //             return;
  //           }
  //         });
  //       }
  //     });
  //   });

  //   return ordering.reverse();
  // };

  const fetchLayerBounds = async ({
    type,
    layerpath,
    flaggedFeatures,
    vector,
    raster,
    metadata,
  }: Layer): Promise<[number, number, number, number]> => {
    if (type === "Vector") {
      const response = await fetch(STATIC_URL + layerpath);
      const data = await response.json();
      let features = data.features;
      if (flaggedFilter || unflaggedFilter) {
        features = features.filter((feature, idx) => {
          if (flaggedFilter) {
            return flaggedFeatures?.includes(idx);
          } else if (unflaggedFilter) {
            return !flaggedFeatures?.includes(idx);
          }
        });
      }
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
      const tileset = await res.json() as Tileset;
      const bounds_rad = [
        tileset.properties.Longitude.minimum,
        tileset.properties.Latitude.minimum,
        tileset.properties.Longitude.maximum,
        tileset.properties.Latitude.maximum
      ];
      return bounds_rad.map(coord => coord * 180 / Math.PI) as [number, number, number, number];
    }
    // Implementation for Cesium_3D pending
    return [0, 0, 0, 0];
  };

  const onCheck = async (checkedKeysValue: any, e) => {
    // why setLayerLoading(true) only for vectors?
    // if (
    //   checkedKeysValue.length > lastCount &&
    //   checkedKeysValue[checkedKeysValue.length - 1].split("-")[0] === "1"
    // ) {
    //   setLayerLoading(true);
    // }

    if (checkedKeysValue.length) {
      setActiveGroupButton(false);
    } else {
      setActiveGroupButton(true);
    }

    // Should no longer be required
    // const rasters = checkedKeysValue.filter((key) => key.split("-")[0] === "2");
    // const vectors = checkedKeysValue.filter((key) => key.split("-")[0] === "1");
    // const missions = checkedKeysValue.filter(
    //   (key) => key.split("-")[0] === "3"
    // );
    // const rasterOrdering: any = sortLayersBySidebarOrdering(rasters, "raster");
    // const vectorOrdering: any = sortLayersBySidebarOrdering(vectors, "vector");
    // const missionOrdering: any = sortLayersBySidebarOrdering(
    //   missions,
    //   "mission"
    // );
    // setCheckedKeys([...rasterOrdering, ...vectorOrdering, ...missionOrdering]);

    setLastCount(checkedKeysValue.length);
    // console.log("CHECKED: ", checkedKeysValue);

    // first update checked status
    const updatedLayers = AllLayers.map((layer) => ({
      ...layer,
      _isChecked: checkedKeysValue.includes(layer._id),
    }));

    // next update metadata for checked layers
    for (const layer of updatedLayers) {
      if (layer._isChecked) {
        // fetch bounds is they havent already been fetched
        if (!layer._metadata?.bounds) {
          const bounds = await fetchLayerBounds(layer);
          layer._metadata = { ...layer._metadata, bounds };
        }

        // add raster settings
        if (layer.type === "Raster") {
          layer._metadata = {
            ...defaultRasterSettings[layer.raster],
            ...layer._metadata,
          };
        }
      }
    }

    SetAllLayers(updatedLayers);
    SetMissionLayers({
      alertGeojsonUrl: missionGeojsonURL(
        "alert",
        props.isBaseMap,
        dateRange[0],
        dateRange[1]
      ),
      vodGeojsonUrl: missionGeojsonURL(
        "vod",
        props.isBaseMap,
        dateRange[0],
        dateRange[1]
      ),
      isAlertChecked: checkedKeysValue.includes("alert"),
      isVODChecked: checkedKeysValue.includes("vod"),
    });
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

    setFeatureState(myFeatureCollection);

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
    setFeatureState(myFeatureCollection);

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

  const AirPollutionIcon = ({ color }: { color: string }) => {
    return (
      <svg
        fill={color}
        version="1.1"
        id="Smoke"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="68"
        height="68"
        viewBox="64 64 896 896"
        enable-background="new 0 0 256 256"
        xmlSpace="preserve"
        style={{ padding: "0.5px" }}
      >
        <path
          d="M220.37,102.96c1.66-4.58,2.5-9.39,2.5-14.34c0-23.29-18.95-42.24-42.24-42.24c-2.36,0-4.71,0.19-7.01,0.58
	c-5.67-13.22-16.76-23.52-30.54-28.11C116.59,10.02,87.85,24.39,79,50.9c-0.06,0.16-0.11,0.33-0.17,0.49
	c-7.15,2.98-12.97,8.1-16.84,14.46C46.56,63,30.46,68.32,19.83,80.13c-8.14,9.04-12.28,20.71-11.64,32.85
	c0.63,12.14,5.96,23.31,14.99,31.45c2.91,2.62,6.09,4.83,9.5,6.6c-2.21,8.11-1.14,16.84,3.16,24.28
	c4.26,7.37,11.13,12.65,19.35,14.85c2.75,0.74,5.54,1.1,8.31,1.1c5.52,0,10.97-1.45,15.88-4.28c3.85-2.23,7.22-5.3,9.88-8.98H137
	c3.31,0,6-2.69,6-6s-2.69-6-6-6H86c-2.16,0-4.15,1.16-5.21,3.03c-1.8,3.15-4.43,5.83-7.41,7.56c-4.6,2.65-9.95,3.35-15.08,1.98
	s-9.41-4.66-12.07-9.26c-3.34-5.79-3.545-12.817-0.56-18.81c0.872-1.75,0.927-3.81,0.247-5.25c-0.68-1.45-2.097-2.55-3.597-3.09
	c-4.1-1.46-7.83-3.69-11.1-6.64c-6.66-6-10.58-14.22-11.05-23.17c-0.47-8.94,2.58-17.53,8.58-24.19c7.3-8.1,18.1-12.04,28.73-10.83
	c-0.48,2.36-0.75,4.8-0.75,7.29c0,17.5,12.31,32.05,28.93,35.33C86.54,136.94,99.99,150,117,150h45c12.17,0,22.06,9.89,22.06,22.04
	V178h12v-5.96c0-18.77-15.28-34.04-34.06-34.04h-45c-10.87,0-19.39-8.71-19.39-19.83v-3.55c0-3.23-2.55-5.88-5.77-6
	c-12.96-0.48-23.11-11.02-23.11-24c0-10.55,6.76-19.76,16.82-22.91c1.99-0.63,3.51-2.24,4.02-4.26c0.22-0.88,0.5-1.82,0.82-2.77
	c6.75-20.22,28.68-31.18,48.9-24.44c11.89,3.96,21.16,13.49,24.78,25.51c0.46,1.54,1.52,2.82,2.93,3.57
	c1.42,0.75,3.08,0.91,4.61,0.42c2.89-0.9,5.93-1.36,9.02-1.36c16.68,0,30.24,13.56,30.24,30.24c0,2.78-0.37,5.5-1.1,8.12
	c-4.54-1.79-9.49-2.77-14.7-2.77h-5.67c-5.54-14.74-21.4-23.38-37.09-19.53c-6.82,1.69-12.73,5.47-17.09,10.94
	c-2.06,2.59-1.63,6.37,0.96,8.43c2.59,2.07,6.37,1.64,8.43-0.95c2.69-3.38,6.35-5.72,10.58-6.77
	c10.48-2.57,21.132,3.852,23.67,14.35c0.921,3.81,3.328,5.53,6.2,5.53h10.01c16.22,0,28.93,13.63,28.93,31.03v41h12v-41
	C236,123,229.94,110.77,220.37,102.96z M172.044,188.062L248,188v26h-12v24h-52v-24h-12L172.044,188.062z"
        />
      </svg>
    );
  };

  const WindDirectionIcon = ({ color }: { color: string }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="28"
        width="28"
        viewBox="64 64 896 896"
        style={{ padding: "1.5px" }}
      >
        <path
          fill={color}
          d="M288 32c0 17.7 14.3 32 32 32h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H352c53 0 96-43 96-96s-43-96-96-96H320c-17.7 0-32 14.3-32 32zm64 352c0 17.7 14.3 32 32 32h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H384c-17.7 0-32 14.3-32 32zM128 512h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H160c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32 14.3-32 32s14.3 32 32 32z"
        />
      </svg>
    );
  };

  const generateIcon = (type: any, color: any) => {
    switch (type) {
      case "Point":
        return <EnvironmentOutlined style={{ color: color }} />;
      case "MultiLineString":
        return <BranchesOutlined style={{ color: color }} />;
      case "MultiPolygon":
        return <GatewayOutlined style={{ color: color }} />;
      case "air_pollution":
        return <AirPollutionIcon color={color} />;
      case "wind_direction":
        return <WindDirectionIcon color={color} />;
    }
  };

  useEffect(() => {
    setLoading(true);
  }, []);

  useEffect(() => {
    if (props.isBaseMap) {
      setLoading(true);
      getAllLayers(null);
    }
  }, [props.isBaseMap, refreshLayer]);

  //---------------Fetch all layers in mission----------------------------------------

  const getAllLayers = async (id) => {
    console.log("I am inside getAllLayers");
    if (!props.isBaseMap) {
      try {
        const result = await http.get<{
          status: boolean;
          message: string;
          data: {
            mission: string;
            centerPoints: {
              lat: number;
              lng: number;
            };
            layers: ILayer[];
          };
        }>(`${apis.GET_ALL_LAYERS_FOR_MISSION}`, {
          params: {
            missionId: id,
          },
        });

        if (result.data.status) {
          SetAllLayers(result.data.data.layers);
          SetMissionLayers({
            alertGeojsonUrl: missionGeojsonURL(
              "alert",
              props.isBaseMap,
              dateRange[0],
              dateRange[1]
            ),
            vodGeojsonUrl: missionGeojsonURL(
              "vod",
              props.isBaseMap,
              dateRange[0],
              dateRange[1]
            ),
            isAlertChecked: false,
            isVODChecked: false,
          });
          // setAllLayers(result.data.data.layers);
          setMissioName(result.data.data.mission);
          setViewport({
            latitude: result.data.data.centerPoints.lat,
            longitude: result.data.data.centerPoints.lng,
            zoom: 13,
            pitch: 0,
            minZoom: 0,
            maxZoom: 22,
            bearing: 0,
            // transitionDuration: 8000,
            // transitionInterpolator: new FlyToInterpolator(),
          });
        } else {
          message.error(`${result.data.message}`);
        }
      } catch (error) {
        console.log(error);
        message.error("Layers Could Not Be Loaded");
        AxiosErrorHandler(error);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const result = await http.get<{
          success: boolean;
          message: string;
          data: ILayer[];
        }>(apis.GET_ALL_BASELAYERS);
        if (result.data.success) {
          setMissioName("none");
          // setAllLayers(result.data.data);
          SetAllLayers(result.data.data);
        } else {
          message.error(result.data.message);
        }
        //message.info("ola amigo")
      } catch (error) {
        console.log(error);
        //message.error("errrorrrrr");
        AxiosErrorHandler(error);
      } finally {
        setLoading(false);
        //message.info("land")
      }
    }
  };

  // ++++++++++++++++++++++++++++++++++++++++++++++ Delete Layer +++++++++++++++++++++++++++++++++++++++++++++++
  // Should no longer be required
  // const removeLayerFromTree = (layers) => {
  //   const td: any = [...treeStructure];

  //   try {
  //     const newTreeDataVectors = td[0].children.filter((layer) => {
  //       if (layer.group) {
  //         let groupLayers = [];
  //         groupLayers = layer.value.children.filter((l) => {
  //           const k = l.key.split("-")[1];
  //           return !layers.includes(k);
  //         });
  //         layer.value.children = [...groupLayers];

  //         return true;
  //       } else {
  //         const k = layer.key.split("-")[1];
  //         return !layers.includes(k);
  //       }
  //     });
  //     td[0].children = [...newTreeDataVectors];

  //     const newTreeDataRasters = td[1].children.filter((layer) => {
  //       if (layer.group) {
  //         let groupLayers = [];
  //         groupLayers = layer.value.children.filter((l) => {
  //           const k = l.key.split("-")[1];
  //           return !layers.includes(k);
  //         });
  //         layer.value.children = [...groupLayers];
  //         return true;
  //       } else {
  //         const k = layer.key.split("-")[1];
  //         return !layers.includes(k);
  //       }
  //     });
  //     td[1].children = [...newTreeDataRasters];

  //     setTreeStructure(td);

  //     // Should no longer be required
  //     // setTimeout(() => {
  //     //   const cl = checkedKeys.filter(
  //     //     (key: any) => !layers.includes(key.split("-")[1])
  //     //   );
  //     //   setCheckedKeys(cl);
  //     // });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const deleteLayer = (layerId) => {
    setLoading(true);

    if (props.isBaseMap) {
      http
        .delete(`${apis.DELETE_BASE_LAYER}`, {
          data: {
            layers: [layerId],
          },
        })
        .then((res) => {
          if (res.data.status) {
            // removeLayerFromTree([layerId]);

            // remove layer from vector create form
            const vectors = vectorLayers.filter((layer) => layer._id !== id);
            setvectorLayers(vectors);

            const newTabkeys = tabKeys.filter((key) => key !== id);
            setTabKeys(newTabkeys);
            const newPanes = panes.filter((pane) => pane.id !== id);

            if (newPanes.length) {
              setActiveKey(newPanes[newPanes.length - 1].id);
            } else {
              setActiveKey("");
            }

            setPanes(newPanes);

            SetAllLayers((prev) =>
              prev.filter((layer) => layer._id !== layerId)
            );

            message.success(res.data.message);
            //console.log(res.data);
          } else {
            message.error(res.data.message);
            console.log(res.data);
          }
        })
        .catch((err) => {
          AxiosErrorHandler(err, logout);
          if (err.response?.status === 401) {
            message.warning(
              "Sorry! You are not authorised to delete layer. Please contact admin"
            );
          } else console.log(err);
        })
        .finally(() => {
          setLoading(false);
          handleCancel1();
        });
    } else {
      http
        .delete(`${apis.DELETE_LAYER}`, {
          params: {
            id: layerId,
          },
        })
        .then((res) => {
          if (res.data.status) {
            // removeLayerFromTree([layerId]);

            // remove layer from vector create form
            const vectors = vectorLayers.filter((layer) => layer._id !== id);
            setvectorLayers(vectors);

            const newTabkeys = tabKeys.filter((key) => key !== id);
            setTabKeys(newTabkeys);
            const newPanes = panes.filter((pane) => pane.id !== id);

            if (newPanes.length) {
              setActiveKey(newPanes[newPanes.length - 1].id);
            } else {
              setActiveKey("");
            }

            setPanes(newPanes);

            SetAllLayers((prev) =>
              prev.filter((layer) => layer._id !== layerId)
            );

            message.success(res.data.message);
            //console.log(res.data);
          } else {
            message.error(res.data.message);
            console.log(res.data);
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            message.warning(
              "Sorry! You are not authorised to delete layer. Please contact admin"
            );
          } else console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setLoading(false);
          handleCancel1();
        });
    }
  };

  const deleteMultipleLayers = (type) => {
    setLoading(true);

    const layers = AllLayers.filter(
      (layer) => layer._isChecked && layer.type === type
    ).map((layer) => layer._id);

    if (props.isBaseMap) {
      http
        .delete(`${apis.DELETE_BASE_LAYER}`, {
          data: {
            layers,
          },
        })
        .then((res) => {
          if (res.data.status) {
            // removeLayerFromTree(layers);

            // remove layer from vector create form
            const vectors = vectorLayers.filter(
              (layer) => !layers.includes(layer._id)
            );
            setvectorLayers(vectors);

            const newTabkeys = tabKeys.filter((key) => !layers.includes(key));
            setTabKeys(newTabkeys);
            const newPanes = panes.filter((pane) => !layers.includes(pane.id));

            if (newPanes.length) {
              setActiveKey(newPanes[newPanes.length - 1].id);
            } else {
              setActiveKey("");
            }

            setPanes(newPanes);

            SetAllLayers((prev) =>
              prev.filter((layer) => !layers.includes(layer._id))
            );

            message.success(res.data.message);
            //console.log(res.data);
          } else {
            message.error(res.data.message);
            console.log(res.data);
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            message.warning(
              "Sorry! You are not authorised to delete layer. Please contact admin"
            );
          } else console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setLoading(false);
          handleCancel1();
        });
    } else {
      http
        .post(`${apis.DELETE_MULTIPLE_LAYERS}`, {
          layers,
        })
        .then((res) => {
          if (res.data.status) {
            // removeLayerFromTree(layers);

            // remove layer from vector create form
            const vectors = vectorLayers.filter(
              (layer) => !layers.includes(layer._id)
            );
            setvectorLayers(vectors);

            const newTabkeys = tabKeys.filter((key) => !layers.includes(key));
            setTabKeys(newTabkeys);
            const newPanes = panes.filter((pane) => !layers.includes(pane.id));

            if (newPanes.length) {
              setActiveKey(newPanes[newPanes.length - 1].id);
            } else {
              setActiveKey("");
            }

            setPanes(newPanes);

            SetAllLayers((prev) =>
              prev.filter((layer) => !layers.includes(layer._id))
            );

            message.success(res.data.message);
            //console.log(res.data);
          } else {
            message.error(res.data.message);
            console.log(res.data);
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            message.warning(
              "Sorry! You are not authorised to delete layer. Please contact admin"
            );
          } else console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setLoading(false);
          handleCancel1();
        });
    }
  };

  const handleMaskLayerOption = (id: string) => {
    SetAllLayers((prev) =>
      prev.map((layer) => {
        if (layer._id === id) layer._isMasked = !layer._isMasked;
        setLayerOpacity(1);
        return layer;
      })
    );
  };

  const handleMeshSourceOption = (id:string) => {
    SetAllLayers((prev) =>
      prev.map((layer) => {
        if (layer.type == "Raster" && layer.raster == "CESIUM_3D") {
          if (layer._id == id) {
            layer._isMeshSource = !layer._isMeshSource;
          } else {
            layer._isMeshSource = false;
          }
        }
        return layer;
      })
    );
  };

  const refreshVectorLayer = () => {
    filterLayers();
    message.success("Checkout the vector section for Inference Layer");  
  }

  const toggleElevation = () => {
    setIsElevationEnabled((prevValue) => !prevValue);
    console.log(
      "Elevation toggled successfully. New state:",
      isElevationEnabled
    );
  };

  // Should no longer be required
  // const getTreeData = (layer: ILayer, type, keyPrefix) => {
  //   const treeMenuOnClick: MenuProps["onClick"] = async (e) => {
  //     const type = layer.type;
  //     switch (e.key) {
  //       case "1":
  //         showModal1();
  //         setSelectedLayerId(layer._id);
  //         setCaptureDate(layer.captureDate);
  //         setLayerName(layer.name);
  //         type === "Raster"
  //           ? setDefaultLayerType([
  //             type.toUpperCase(),
  //             layer.raster.name.toUpperCase(),
  //           ])
  //           : setDefaultLayerType([
  //             type.toUpperCase(),
  //             layer.vector.type.toUpperCase(),
  //             layer.vector.name.toUpperCase(),
  //           ]);
  //         setSelectedLayerType(type.toLowerCase());
  //         break;
  //       case "2":
  //         openThread("layer", layer._id, {});
  //         break;
  //       case "3":
  //         download(STATIC_URL + layer.layerpath);
  //         break;
  //       case "4":
  //         setUpdate(true);
  //         setUpdateType(type);
  //         setUpdateId(layer._id);
  //         setIsModalVisible4(true);
  //         break;
  //       case "5":
  //         Modal.confirm({
  //           title: "Delete Layer?",
  //           icon: <ExclamationCircleOutlined />,
  //           content: "Are you sure you want to delete this layer?",
  //           okText: "Yes",
  //           cancelText: "No",
  //           onOk: () => {
  //             deleteLayer(layer._id);
  //           },
  //         });
  //         break;
  //       case "6":
  //         const idOfLayerGroup =
  //           typeof layer.layerGroupId === "object"
  //             ? layer.layerGroupId._id
  //             : layer.layerGroupId;
  //         await removeLayerFromGroup(
  //           idOfLayerGroup,
  //           layer._id
  //         );
  //         updateTreeDataAfterSingleLayerRemovalFromGroup(layer._id);
  //         break;
  //       case "7":
  //         setVisibleGroupCreateModal(!visibleGroupCreateModal);
  //         type === "Raster" ? setMoveType(2) : setMoveType(1);
  //         break;
  //       case "8":
  //         Modal.confirm({
  //           title: "Delete Selected Layers?",
  //           icon: <ExclamationCircleOutlined />,
  //           content: "Are you sure you want to delete selected layers?",
  //           okText: "Yes",
  //           cancelText: "No",
  //           onOk: () => {
  //             deleteMultipleLayers(type);
  //           },
  //         });
  //         break;
  //       case "9":
  //         setMoveToOtherGroupModal(true);
  //         type === "Raster" ? setMoveType(2) : setMoveType(1);
  //         break;
  //       case "10":
  //         http
  //           .get(`${apis.DOWNLOAD_KML}?id=${layer._id}`)
  //           .then((res: any) => {
  //             if (res.data.status) {
  //               //download(API_URL + res.data.link);
  //               window.open(PUBLIC_URL + res.data.link);
  //             } else {
  //               console.log(res.data.message);
  //             }
  //           })
  //           .catch((err: any) => {
  //             console.log(err);
  //             AxiosErrorHandler(err, logout);
  //           });
  //         break;
  //       case "11":
  //         Modal.confirm({
  //           title: "Flag Layer?",
  //           icon: <ExclamationCircleOutlined />,
  //           content: "Are you sure you want to flag the entire layer?",
  //           okText: "Yes",
  //           cancelText: "No",
  //           onOk: () => {
  //             toggleLayerFlag(layer._id, true);
  //           },
  //         });
  //         break;
  //       case "12":
  //         Modal.confirm({
  //           title: "Un-flag Layer?",
  //           icon: <ExclamationCircleOutlined />,
  //           content:
  //             "Are you sure you want to un-flag the entire layer? This will un-flag all flagged features as well.",
  //           okText: "Yes",
  //           cancelText: "No",
  //           onOk: () => {
  //             toggleLayerFlag(layer._id, false);
  //           },
  //         });
  //         break;
  //       case "13":
  //         setViewDocs(true);
  //         setSelectedLayerInfo(layer);
  //         setFeatureLayer(layer._id);
  //         setFeatureLayerPath(layer.layerpath);
  //         setWindowTitle(layer.name);
  //         setSelectedLayerLabel(
  //           layer.layerLabel ? layer.layerLabel : "No label selected"
  //         );
  //         setSelectedLayerPopupLabel(
  //           layer.layerPopupLabel ? layer.layerPopupLabel : "No label selected"
  //         );
  //         setIsLayerDocs(true);
  //         break;
  //       case "14":
  //         handleMaskLayerOption();
  //         break;
  //       case "15":
  //         toggleElevation();
  //         break;
  //       default:
  //         break;
  //     }
  //   };
  //   switch (type) {
  //     case "raster":
  //       return {
  //         title: (
  //           <>
  //             <Dropdown
  //               menu={{ items: treeMenu(layer), onClick: treeMenuOnClick }}
  //               trigger={["contextMenu"]}
  //             >
  //               <Tooltip
  //                 mouseLeaveDelay={0.0}
  //                 mouseEnterDelay={0.0}
  //                 placement="bottom"
  //                 title={
  //                   <span>
  //                     {layer.name} &#8226;{" "}
  //                     {moment(layer.captureDate).format("DD/MM/YYYY")}
  //                   </span>
  //                 }
  //               >
  //                 <Badge
  //                   style={{
  //                     backgroundColor: "#3b86ff",
  //                     boxShadow: "0 0 3px 1px black",
  //                     zIndex: 10,
  //                   }}
  //                   offset={[25, 6]}
  //                   count={layer.isThreadExist ? layer.commentCount : 0}
  //                   overflowCount={9}
  //                 >
  //                   <Text
  //                     style={
  //                       layer.layerGroupId
  //                         ? { width: "139px" }
  //                         : { width: "160px" }
  //                     }
  //                     ellipsis={true}
  //                     onClick={() => {
  //                       if (!props.isBaseMap) {
  //                         setlayerToAddInAttributeTable({
  //                           name: layer.name,
  //                           type: layer.type,
  //                           id: layer._id,
  //                           path: layer.layerpath,
  //                           count: layer.featureCount,
  //                         });
  //                       }
  //                     }}
  //                   >
  //                     {layer.name}
  //                   </Text>
  //                 </Badge>
  //               </Tooltip>
  //             </Dropdown>
  //           </>
  //         ),
  //         key: keyPrefix + "-" + layer._id,
  //         icon: <FileImageOutlined />,
  //         captureDate: layer.captureDate,
  //         name: layer.name,
  //         groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
  //         layer: layer,
  //       };
  //     case "vector":
  //       return {
  //         title: (
  //           <>
  //             <Dropdown
  //               menu={{ items: treeMenu(layer), onClick: treeMenuOnClick }}
  //               trigger={["contextMenu"]}
  //             >
  //               <Tooltip
  //                 mouseLeaveDelay={0.0}
  //                 mouseEnterDelay={0.0}
  //                 placement="bottom"
  //                 title={
  //                   <span>
  //                     {layer.name} &#8226;{" "}
  //                     {moment(layer.captureDate).format("DD/MM/YYYY")}
  //                   </span>
  //                 }
  //               >
  //                 <Badge
  //                   style={{
  //                     backgroundColor: "#3b86ff",
  //                     boxShadow: "0 0 3px 1px black",
  //                     zIndex: 10,
  //                   }}
  //                   offset={[25, 6]}
  //                   count={layer.isThreadExist ? layer.commentCount : 0}
  //                   overflowCount={9}
  //                 >
  //                   <Text
  //                     style={
  //                       layer.layerGroupId
  //                         ? { width: "119px" }
  //                         : { width: "140px" }
  //                     }
  //                     ellipsis={true}
  //                     onClick={() => {
  //                       setlayerToAddInAttributeTable({
  //                         name: layer.name,
  //                         type: layer.type,
  //                         id: layer._id,
  //                         path: layer.layerpath,
  //                         count: layer.featureCount,
  //                       });
  //                     }}
  //                   >
  //                     {layer.name}
  //                   </Text>
  //                   {layer.isFlagged && (
  //                     <FlagOutlined style={{ color: "#da1c5c" }} />
  //                   )}
  //                   {layer.isPublic && (
  //                     <EyeOutlined style={{ color: "#3b86ff" }} />
  //                   )}
  //                 </Badge>
  //               </Tooltip>
  //             </Dropdown>
  //           </>
  //         ),
  //         key: keyPrefix + "-" + layer._id,
  //         icon: generateIcon(
  //           layer.vector.type,
  //           layer.color === "multiColor" ? "#00000" : layer.color
  //         ),
  //         captureDate: layer.captureDate,
  //         name: layer.name,
  //         groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
  //         layer: layer,
  //       };
  //   }
  // };

  const getTitleElement = (layer: Layer) => {
    const treeMenuOnClick: MenuProps["onClick"] = async (e) => {
      const type = layer.type;
      switch (e.key) {
        case "1":
          showModal1();
          setSelectedLayerId(layer._id);
          setCaptureDate(layer.captureDate);
          setLayerName(layer.name);
          setDefaultLayerType({
            layerType: type,
            layerProp: type === "Vector" ? layer.vector : layer.raster,
            featureType: type === "Vector" ? featureType[layer.vector] : null,
          });
          setSelectedLayerType(type.toLowerCase());
          break;
        case "2":
          openThread("layer", layer._id, {});
          break;
        case "3":
          download(STATIC_URL + layer.layerpath);
          break;
        case "4":
          setUpdate(true);
          setUpdateType(type);
          setUpdateId(layer._id);
          setIsModalVisible4(true);
          break;
        case "5":
          Modal.confirm({
            title: "Delete Layer?",
            icon: <ExclamationCircleOutlined />,
            content: "Are you sure you want to delete this layer?",
            okText: "Yes",
            cancelText: "No",
            onOk: () => {
              deleteLayer(layer._id);
            },
          });
          break;
        case "6":
          const idOfLayerGroup =
            typeof layer.layerGroupId === "object"
              ? layer.layerGroupId._id
              : layer.layerGroupId;
          await removeLayerFromGroup(idOfLayerGroup, layer._id);
          // updateTreeDataAfterSingleLayerRemovalFromGroup(layer._id);
          break;
        case "7":
          setVisibleGroupCreateModal(!visibleGroupCreateModal);
          type === "Raster" ? setMoveType(2) : setMoveType(1);
          break;
        case "8":
          Modal.confirm({
            title: "Delete Selected Layers?",
            icon: <ExclamationCircleOutlined />,
            content: "Are you sure you want to delete selected layers?",
            okText: "Yes",
            cancelText: "No",
            onOk: () => {
              deleteMultipleLayers(type);
            },
          });
          break;
        case "9":
          setMoveToOtherGroupModal(true);
          type === "Raster" ? setMoveType(2) : setMoveType(1);
          break;
        case "10":
          http
            .get(`${apis.DOWNLOAD_KML}?id=${layer._id}`)
            .then((res: any) => {
              if (res.data.status) {
                //download(API_URL + res.data.link);
                window.open(PUBLIC_URL + res.data.link);
              } else {
                console.log(res.data.message);
              }
            })
            .catch((err: any) => {
              console.log(err);
              AxiosErrorHandler(err, logout);
            });
          break;
        case "11":
          Modal.confirm({
            title: "Flag Layer?",
            icon: <ExclamationCircleOutlined />,
            content: "Are you sure you want to flag the entire layer?",
            okText: "Yes",
            cancelText: "No",
            onOk: () => {
              toggleLayerFlag(layer._id, true);
            },
          });
          break;
        case "12":
          Modal.confirm({
            title: "Un-flag Layer?",
            icon: <ExclamationCircleOutlined />,
            content:
              "Are you sure you want to un-flag the entire layer? This will un-flag all flagged features as well.",
            okText: "Yes",
            cancelText: "No",
            onOk: () => {
              toggleLayerFlag(layer._id, false);
            },
          });
          break;
        case "13":
          setViewDocs(true);
          setSelectedLayerInfo(layer);
          setFeatureLayer(layer._id);
          setFeatureLayerPath(layer.layerpath);
          setWindowTitle(layer.name);
          setSelectedLayerLabel(
            layer.layerLabel ? layer.layerLabel : "No label selected"
          );
          setSelectedLayerPopupLabel(
            layer.layerPopupLabel ? layer.layerPopupLabel : "No label selected"
          );
          setIsLayerDocs(true);
          break;
        case "14":
          handleMaskLayerOption(layer._id);
          break;
        case "15":
          toggleElevation();
          break;
        // case "16":
        //   handleMeshSourceOption(layer._id);
        //   break;
        default:
          break;
      }
    };
    return (
      <Dropdown
        menu={{ items: treeMenu(layer), onClick: treeMenuOnClick }}
        trigger={["contextMenu"]}
      >
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
          <Badge
            style={{
              backgroundColor: "#3b86ff",
              boxShadow: "0 0 3px 1px black",
              zIndex: 10,
            }}
            offset={[25, 6]}
            count={<>{layer.isThreadExist ? layer.commentCount : ""}</>}
            overflowCount={9}
          >
            <Text
              style={{
                width:
                  layer.type === "Raster"
                    ? layer.layerGroupId
                      ? "139px"
                      : "160px"
                    : layer.layerGroupId
                      ? "119px"
                      : "140px",
              }}
              ellipsis={true}
              onClick={() => {
                if (layer._isChecked && layer._metadata?.bounds) {
                  const { longitude, latitude, zoom } = calculateViewport(layer._metadata.bounds);
                  setViewport({
                    longitude /* : (bounds[0][0] + bounds[1][0]) / 2 */,
                    latitude /* : (bounds[0][1] + bounds[1][1]) / 2 */,
                    zoom,
                    pitch: 0,
                    minZoom: 0,
                    maxZoom: 22,
                    bearing: 0,
                    transitionDuration: 2000,
                    transitionInterpolator: new FlyToInterpolator(),
                  });
                }
              }}
              onDoubleClick={() => {
                if (!props.isBaseMap || layer.type === "Vector") {
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
            {layer.type === "Vector" && layer.isFlagged && (
              <FlagOutlined style={{ color: "#da1c5c" }} />
            )}
            {layer.type === "Vector" && layer.isPublic && (
              <EyeOutlined style={{ color: "#3b86ff" }} />
            )}
          </Badge>
        </Tooltip>
      </Dropdown>
    );
  };

  const getGroupTitleElement = (layerGroup: Layer["layerGroupId"]) => {
    const items: MenuProps["items"] = [
      {
        key: "1",
        label: "Rename",
      },
      {
        key: "2",
        label: "Delete",
      },
    ];
    const onClick: MenuProps["onClick"] = (e) => {
      if (e.key === "1") {
        setgroupName(layerGroup.name);
        setgroupToEdit({
          id: layerGroup._id,
          name: layerGroup.name,
        });
        setVisibleEditModal(true);
      }
      if (e.key === "2") {
        Modal.confirm({
          title: "Delete Group?",
          icon: <ExclamationCircleOutlined />,
          content: (
            <>
              <p>Are You Sure To Want To Delete This Group</p>
              <b>These Layers Will be deleted along with this group</b>
              <>
                {AllLayers.filter(
                  (layer) => layer.layerGroupId?._id === layerGroup._id
                ).map((layer) => {
                  return <p>{layer.name}</p>;
                })}
              </>
            </>
          ),
          okText: "Yes",
          cancelText: "No",
          onOk: () => {
            deleteGroup(layerGroup._id);
          },
        });
      }
    };
    return (
      <Dropdown menu={{ items, onClick }} trigger={["contextMenu"]}>
        <Text style={{ width: "160px" }} ellipsis={true}>
          {layerGroup.name}
        </Text>
      </Dropdown>
    );
  };

  const [groupToEdit, setgroupToEdit] = useState<any>(null);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [groupName, setgroupName] = useState("");

  // Should no longer be required
  // const getGroupTitle = (value, id) => {
  //   const items: MenuProps["items"] = [
  //     {
  //       key: "1",
  //       label: "Rename",
  //     },
  //     {
  //       key: "2",
  //       label: "Delete",
  //     },
  //   ];
  //   const onClick: MenuProps["onClick"] = (e) => {
  //     if (e.key === "1") {
  //       setgroupName(value.name);
  //       setgroupToEdit({
  //         id: id,
  //         name: value.name,
  //       });
  //       setVisibleEditModal(true);
  //     }
  //     if (e.key === "2") {
  //       Modal.confirm({
  //         title: "Delete Group?",
  //         icon: <ExclamationCircleOutlined />,
  //         content: (
  //           <>
  //             <p>Are You Sure To Want To Delete This Group</p>
  //             <b>These Layers Will be deleted along with this group</b>
  //             <>
  //               {value.children.map((layer) => {
  //                 return <p>{layer.name}</p>;
  //               })}
  //             </>
  //           </>
  //         ),
  //         okText: "Yes",
  //         cancelText: "No",
  //         onOk: () => {
  //           deleteGroup(id);
  //         },
  //       });
  //     }
  //   };
  //   return {
  //     title: (
  //       <>
  //         <Dropdown menu={{ items, onClick }} trigger={["contextMenu"]}>
  //           <Text style={{ width: "160px" }} ellipsis={true}>
  //             {value.name}
  //           </Text>
  //         </Dropdown>
  //       </>
  //     ),
  //     children: [...value.children],
  //     key: "group-" + id,
  //     group: true,
  //     icon: <FolderOutlined />,
  //     groupId: id,
  //   };
  // };

  // const updateTreeDataAfterGroupDelete = (id) => {
  //   const td: any = [...treeStructure];
  //   const al = { ...allLayers };

  //   const newVectorLayers = td[0].children.filter((layer) => {
  //     if (!layer.group) {
  //       return true;
  //     } else {
  //       if (layer.id === id) {
  //         layer.value.children.forEach((l) => {
  //           delete al[l.key];
  //         });
  //         return false;
  //       } else {
  //         return true;
  //       }
  //     }
  //   });

  //   td[0].children = [...newVectorLayers];

  //   const newRasterLayers = td[1].children.filter((layer) => {
  //     if (!layer.group) {
  //       return true;
  //     } else {
  //       if (layer.id === id) {
  //         layer.value.children.forEach((l) => {
  //           delete al[l.key];
  //         });
  //         return false;
  //       } else {
  //         return true;
  //       }
  //     }
  //   });

  //   td[1].children = [...newRasterLayers];

  //   const ag = { ...allLayerGroups };
  //   delete ag[id];

  //   setTimeout(() => {
  //     setAllLayers(al);
  //     setAllLayerGroups(ag);
  //     setTreeStructure(td);
  //     forceUpdateAllLayers();
  //   }, 100);
  // };

  // No longer required
  // const updateTreeDataAfterMovingLayers = async (groupid, layerids) => {
  //   // const al = { ...allLayers };
  //   setLoading(true);

  //   const res = await http.patch(`${apis.EDIT_LAYER_GROUP}`, {
  //     _id: groupid,
  //     layers: layerids,
  //   });

  //   if (!res.data.status) {
  //     return message.error(res.data.message);
  //   }

  //   // keys.forEach((key) => {
  //   //   al[key].groupId = groupid;
  //   // });

  //   const td: any = [...treeStructure];
  //   const ltmv: any = [];

  //   td[0].children = td[0].children.filter((layer) => {
  //     if (!layer.group) {
  //       if (layerids.includes(layer._id)) {
  //         layer.layerGroupId
  //           ? (layer.layerGroupId["_id"] = groupid)
  //           : (layer.layerGroupId = { _id: groupid });
  //         ltmv.push(layer);
  //         return false;
  //       } else {
  //         return true;
  //       }
  //     } else {
  //       layer.value.children = layer.value.children.filter((l) => {
  //         if (layerids.includes(l._id)) {
  //           l.layerGroupId
  //             ? (l.layerGroupId["_id"] = groupid)
  //             : (l.layerGroupId = { _id: groupid });
  //           ltmv.push(l);
  //           return false;
  //         } else {
  //           return true;
  //         }
  //       });
  //       return true;
  //     }
  //   });

  //   td[1].children = td[1].children.filter((layer) => {
  //     if (!layer.group) {
  //       if (layerids.includes(layer._id)) {
  //         layer.layerGroupId
  //           ? (layer.layerGroupId["_id"] = groupid)
  //           : (layer.layerGroupId = { _id: groupid });
  //         ltmv.push(layer);
  //         return false;
  //       } else {
  //         return true;
  //       }
  //     } else {
  //       layer.value.children = layer.value.children.filter((l) => {
  //         if (layerids.includes(l._id)) {
  //           l.layerGroupId
  //             ? (l.layerGroupId["_id"] = groupid)
  //             : (l.layerGroupId = { _id: groupid });
  //           ltmv.push(l);
  //           return false;
  //         } else {
  //           return true;
  //         }
  //       });
  //       return true;
  //     }
  //   });

  //   td[0].children = td[0].children.map((layer) => {
  //     if (layer.group) {
  //       if (layer.id === groupid) {
  //         layer.value.children = [...layer.value.children, ...ltmv];
  //       }
  //     }
  //     return layer;
  //   });

  //   td[1].children = td[1].children.map((layer) => {
  //     if (layer.group) {
  //       if (layer.id === groupid) {
  //         layer.value.children = [...layer.value.children, ...ltmv];
  //       }
  //     }
  //     return layer;
  //   });

  //   setTreeStructure(td);
  //   // setAllLayers(al);
  //   SetAllLayers((prev) => (prev.map((layer) => {
  //     if(layer.isChecked) layer.layerGroupId = groupid;
  //     return layer;
  //   })));
  // };

  // const updateTreeDataAfterGroupEdit = (group, id) => {
  //   const td: any = [...treeStructure];

  //   const newVectorLayers = td[0].children.map((layer) => {
  //     if (!layer.group) {
  //       return layer;
  //     } else {
  //       if (layer.id === group._id) {
  //         layer.value.name = group.name;
  //         return layer;
  //       } else {
  //         return layer;
  //       }
  //     }
  //   });

  //   td[0].children = [...newVectorLayers];

  //   const newRasterLayers = td[1].children.filter((layer) => {
  //     if (!layer.group) {
  //       return layer;
  //     } else {
  //       if (layer.id === group._id) {
  //         group.children = [...layer.value.children];
  //         return {
  //           group: true,
  //           value: group,
  //           id: layer.id,
  //         };
  //       } else {
  //         return layer;
  //       }
  //     }
  //   });

  //   td[1].children = [...newRasterLayers];

  //   setTimeout(() => {
  //     setTreeStructure(td);
  //     forceUpdateAllLayers();
  //   });
  // };

  // const updateTreeDataAfterSingleLayerRemovalFromGroup = (id) => {
  //   const td: any = [...treeStructure];
  //   let layerToRemove: any = null;
  //   const newVectorLayers = td[0].children.filter((layer) => {
  //     if (!layer.group) {
  //       if (layer._id === id) {
  //         layerToRemove = layer;
  //       }
  //       return true;
  //     } else {
  //       const groupLayers = layer.value.children.filter((l) => {
  //         if (l._id === id) {
  //           layerToRemove = l;
  //           return false;
  //         }
  //         return true;
  //       });
  //       layer.value.children = [...groupLayers];
  //       return true;
  //     }
  //   });

  //   td[0].children = [...newVectorLayers];

  //   if (layerToRemove) {
  //     layerToRemove.layerGroupId = null;
  //     td[0].children.unshift(layerToRemove);
  //     layerToRemove = null;
  //   }

  //   const newRasterLayers = td[1].children.filter((layer) => {
  //     if (!layer.group) {
  //       if (layer._id === id) {
  //         layerToRemove = layer;
  //       }
  //       return true;
  //     } else {
  //       const groupLayers = layer.value.children.filter((l) => {
  //         if (l._id === id) {
  //           layerToRemove = l;
  //           return false;
  //         }
  //         return true;
  //       });
  //       layer.value.children = [...groupLayers];
  //       return true;
  //     }
  //   });

  //   td[1].children = [...newRasterLayers];

  //   if (layerToRemove) {
  //     layerToRemove.layerGroupId = null;
  //     td[1].children.unshift(layerToRemove);
  //   }

  //   setTimeout(() => {
  //     setTreeStructure(td);
  //   });
  // };

  const deleteGroup = (id: any) => {
    setLoading(true);

    http
      .delete(`${apis.DELETE_LAYER_GROUP}`, {
        params: {
          _id: id,
        },
      })
      .then((res) => {
        if (res.data.status) {
          message.success(res.data.message);
          const deletedLayerGroupId = res.data.data._id;
          SetAllLayers((prev) =>
            prev.filter(
              (layer) => layer.layerGroupId?._id !== deletedLayerGroupId
            )
          );
          // updateTreeDataAfterGroupDelete(id);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const editGroup = (group) => {
    setLoading(true);

    http
      .patch(`${apis.EDIT_LAYER_GROUP}`, {
        name: group.name,
        _id: group.id,
        layers: [],
      })
      .then((res) => {
        if (res.data.status) {
          message.success(res.data.message);
          // updateTreeDataAfterGroupEdit(res.data.data, group.id);
          const updatedLayerGroup: Layer["layerGroupId"] = {
            _id: res.data.data._id,
            name: res.data.data.name,
            layers: res.data.data.layers,
            createdBy: res.data.data.createdBy,
            tenantId: res.data.data.tenantId,
            createdAt: res.data.data.createdAt,
            updatedAt: res.data.data.updatedAt,
          };
          SetAllLayers((prev) =>
            prev.map((layer) => {
              if (updatedLayerGroup.layers.includes(layer._id)) {
                layer.layerGroupId = updatedLayerGroup;
              }
              return layer;
            })
          );
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        editForm.resetFields();
        setVisibleEditModal(false);
        setgroupName("");
        setgroupToEdit(null);
        setLoading(false);
      });
  };

  // ++++++++++++++++++++++++++++++++
  const renderRangePicker = () => {
    const disabledDate = (current) => {
      return current && current > moment();
    };
    return (
      <DatePicker.RangePicker
        defaultValue={[moment(dateRange[0]), moment(dateRange[1])]}
        disabledDate={disabledDate}
        disabled={[props.isBaseMap ? false : true, false]}
        format="DD-MM-YYYY"
        onChange={onRangeChange}
      />
    );
  };
  // const treeData = [
  //   {
  //     title: "Vector",
  //     key: "1",
  //     children: [],
  //   },
  //   {
  //     title: "Raster",
  //     key: "2",
  //     children: [],
  //   },
  //   {
  //     title: "Mission",
  //     key: "3",
  //     children: [
  //       {
  //         title: renderRangePicker(),
  //         key: "3-1",
  //         checkable: false,
  //       },
  //       {
  //         title: "Alerts",
  //         key: "3-2",
  //       },
  //       {
  //         title: "VODs",
  //         key: "3-3",
  //       },
  //     ],
  //   },
  // ];
  // const [treeDataa, setTreeDataa] = useState<any>(treeData);
  // const [treeStructure, setTreeStructure] = useState(treeData);
  // const [allLayerGroups, setAllLayerGroups] = useState({});
  //----------------------Segrigate layers-------------------------------------------------------

  // Should no longer be required
  // useEffect(() => {
  //   refreshLayers();
  // }, [treeStructure, AllLayers, panes, dateRange]);
  useEffect(() => {
    if (!thread.open) {
      setRefreshLayer(!refreshLayer);
    }
  }, [thread.open]);

  // Should no longer be required
  // const refreshLayers = () => {
  //   const td: any = [...treeStructure];
  //   let newTreeDataVector: any = [];
  //   let newTreeDataRaster: any = [];

  //   //console.log(td);
  //   const data: any = treeData;

  //   newTreeDataVector = td[0].children.map((layer) => {
  //     if (layer.group) {
  //       let groupLayers = [];
  //       const value = {
  //         ...layer.value,
  //       };
  //       groupLayers = layer.value.children.map((l) => {
  //         return getTreeData(l, "vector", td[0]["key"]);
  //       });

  //       value.children = [...groupLayers];
  //       return getGroupTitle(value, layer.id);
  //     } else {
  //       return getTreeData(layer, "vector", td[0]["key"]);
  //     }
  //   });
  //   data[0].children = [...newTreeDataVector];

  //   newTreeDataRaster = td[1].children.map((layer) => {
  //     if (layer.group) {
  //       let groupLayers = [];
  //       const value = {
  //         ...layer.value,
  //       };
  //       groupLayers = layer.value.children.map((l) => {
  //         return getTreeData(l, "raster", td[1]["key"]);
  //       });
  //       value.children = [...groupLayers];
  //       return getGroupTitle(value, layer.id);
  //     } else {
  //       return getTreeData(layer, "raster", td[1]["key"]);
  //     }
  //   });
  //   data[1].children = [...newTreeDataRaster];

  //   setTreeDataa(data);
  // };

  // No longer required
  // const segrigateLayers = (layers) => {
  //   //console.log("segrate layer");
  //   let data: any = [...treeDataa];
  //   let allLayers: any = {};
  //   if (
  //     sortType ||
  //     timeEnabled ||
  //     selectedRasterProps ||
  //     selectedVectorProps ||
  //     selectedVectorPropsType
  //   ) {
  //     data = [
  //       {
  //         title: "Vector",
  //         key: "1",
  //         children: [],
  //       },
  //       {
  //         title: "Raster",
  //         key: "2",
  //         children: [],
  //       },
  //     ];
  //   }
  //   if (!sortType) {
  //     layers.sort((a, b) => {
  //       return moment(b.captureDate).diff(moment(a.captureDate));
  //     });
  //   }

  //   const rasters = layers.filter((layer) => layer.type === "Raster");
  //   const vectors = layers.filter((layer) => layer.type === "Vector");

  //   setvectorLayers(vectors);

  //   const rasterGroups = {};
  //   const allGroups = {};

  //   rasters.forEach((layer, i) => {
  //     if (!layer.layerGroupId) {
  //       data[1].children.push({
  //         key: `2-${layer._id}`,
  //         ...layer,
  //       });
  //     } else {
  //       if (!rasterGroups[layer.layerGroupId._id]) {
  //         rasterGroups[layer.layerGroupId._id] = {
  //           name: layer.layerGroupId.name,
  //           children: [],
  //         };
  //         allGroups[layer.layerGroupId._id] = {
  //           name: layer.layerGroupId.name,
  //           id: layer.layerGroupId._id,
  //           groupType: 2,
  //         };
  //       }
  //       rasterGroups[layer.layerGroupId._id].children.push({
  //         key: `2-${layer._id}`,
  //         ...layer,
  //       });
  //     }

  //     const l = {};
  //     if (props.isBaseMap) {
  //       // -----to merge all rasters paths------------------
  //       l[data[1]["key"] + "-" + layer._id] = {
  //         layerPath: layer.layerdataArr,
  //         type: layer.raster.name,
  //         settings: {
  //           ...layer.raster,
  //           // minp: layer.minp,
  //           // maxp: layer.maxp,
  //         },
  //         name: layer.name,
  //         groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
  //       };
  //     } else {
  //       l[data[1]["key"] + "-" + layer._id] = {
  //         layerPath: layer.layerpath,
  //         type: layer.raster.name,
  //         settings: {
  //           ...layer.raster,
  //           minp: layer.minp,
  //           maxp: layer.maxp,
  //         },
  //         name: layer.name,
  //         groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
  //       };
  //     }

  //     allLayers = {
  //       ...allLayers,
  //       ...l,
  //     };
  //   });

  //   const vectorGroups = {};

  //   vectors.forEach((layer, i) => {
  //     if (!layer.layerGroupId) {
  //       data[0].children.push({
  //         key: `1-${layer._id}`,
  //         ...layer,
  //       });
  //     } else {
  //       if (!vectorGroups[layer.layerGroupId._id]) {
  //         vectorGroups[layer.layerGroupId._id] = {
  //           name: layer.layerGroupId.name,
  //           children: [],
  //         };
  //         allGroups[layer.layerGroupId._id] = {
  //           name: layer.layerGroupId.name,
  //           id: layer.layerGroupId._id,
  //           groupType: 1,
  //         };
  //       }
  //       vectorGroups[layer.layerGroupId._id].children.push({
  //         key: `1-${layer._id}`,
  //         ...layer,
  //       });
  //     }

  //     const l = {};
  //     l[data[0]["key"] + "-" + layer._id] = {
  //       layerPath: layer.layerpath,
  //       type: layer.vector.type,
  //       name: layer.name,
  //       id: layer._id,
  //       T3DTranspose: false,
  //       groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
  //       layerLabel: layer.layerLabel,
  //       layerPopupLabel: layer.layerPopupLabel,
  //       isPublic: layer.isPublic,
  //       flaggedFeatures: layer.flaggedFeatures,
  //     };

  //     allLayers = {
  //       ...allLayers,
  //       ...l,
  //     };
  //   });

  //   for (const [key, value] of Object.entries(vectorGroups) as any) {
  //     data[0].children.push({
  //       group: true,
  //       value: value,
  //       id: key,
  //       key: "group-" + key,
  //       groupType: 1,
  //     });
  //   }

  //   for (const [key, value] of Object.entries(rasterGroups) as any) {
  //     data[1].children.push({
  //       group: true,
  //       value: value,
  //       id: key,
  //       key: "group-" + key,
  //       groupType: 2,
  //     });
  //   }

  //   setAllLayerGroups(allGroups);
  //   setAllLayers(allLayers);
  //   setTreeStructure(data);
  //   //--------check last ortho-----
  //   rasters.forEach((element) => {
  //     //console.log(element)
  //     if (element.raster.name === "ORTHO") {
  //       element.isChecked = true;
  //       //console.log(element);
  //       // const cl: any = [];
  //       // cl.push(`2-${element._id}`);
  //       //console.log(cl);
  //       // setCheckedKeys(cl);
  //       return;
  //     }
  //   });
  // };

  const onFinish = (values: any) => {
    //console.log("Success:", values);
  };

  const onFinish1 = (values: any) => {
    //console.log("Success:", values);
  };

  // if (rasterProps) {
  //   options.map((option) => {
  //     if (option.value == "raster") {
  //       rasterProps.map((rasterProp) => {
  //         option.children.push({
  //           value: "0-" + rasterProp._id + "-" + rasterProp.name,
  //           title: rasterProp.name,
  //         });
  //       });
  //     }
  //   });
  // }

  // if (vectorProps) {
  //   vectorProps.map((vectorProp) => {
  //     if (vectorProp.type == "MultiLineString") {
  //       options[1].children[0].children.push({
  //         title: vectorProp.name,
  //         value: "1-0-" + vectorProp._id + "-" + vectorProp.name,
  //       });
  //     } else if (vectorProp.type == "MultiPolygon") {
  //       options[1].children[1].children.push({
  //         title: vectorProp.name,
  //         value: "1-1-" + vectorProp._id + "-" + vectorProp.name,
  //       });
  //     } else if (vectorProp.type == "Point") {
  //       options[1].children[2].children.push({
  //         title: vectorProp.name,
  //         value: "1-2-" + vectorProp._id + "-" + vectorProp.name,
  //       });
  //     } else if (vectorProp.type) {
  //       options[1].children[3].children.push({
  //         title: vectorProp.name,
  //         value: "1-3-" + vectorProp._id + "-" + vectorProp.name,
  //       });
  //     }
  //   });
  //   options[1].children[0].children.sort(sortAlphabetically);
  //   options[1].children[1].children.sort(sortAlphabetically);
  //   options[1].children[2].children.sort(sortAlphabetically);
  //   options[1].children[3].children.sort(sortAlphabetically);
  // }

  // function sortAlphabetically(a, b) {
  //   const x = a.title.toLowerCase();
  //   const y = b.title.toLowerCase();
  //   if (x < y) return -1;
  //   if (x > y) return 1;
  //   return 0;
  // }

  const uploadProps = {
    name: "file",
    multiple: false,
    fileList,
    onRemove: (file) => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // console.log("digi files:",file);
      setFileList([file]);
      return false;
    },
  };
  useEffect(() => {
    console.log("panes", panes);
  }, [panes]);
  const updateFeatureCountInLayers = (count, id) => {
    const newPanes = panes.map((pane) => {
      if (pane.id === id) {
        return {
          ...pane,
          count,
        };
      }
    });

    setPanes(newPanes);
  };

  // TabPanes

  const add = (name, type, id, path, count) => {
    if (!tabKeys.find((key) => key == id)) {
      setTabKeys(prev => [...prev, id]);
      setPanes(prev => [
        ...prev,
        {
          title: name,
          type: type == "Raster" ? "raster" : "vector",
          key: id,
          id: id,
          path: path,
          count: count,
        },
      ]);
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

  const remove = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex;
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = panes.filter((pane) => pane.key !== targetKey);

    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    const newTabKeys = tabKeys.filter((tabKey) => tabKey !== targetKey);
    setTabKeys(newTabKeys);
    setPanes(newPanes);
    setActiveKey(newActiveKey);
  };

  const changeLayerType = (value: string) => {
    if (Object.values(vectorProps).includes(value as vectorProps)) {
      setshowColorPicker(true);
      setLayerType("Vector");
      setLayerProp(value as vectorProps);
    } else if (Object.values(rasterProps).includes(value as rasterProps)) {
      setshowColorPicker(false);
      setLayerType("Raster");
      setLayerProp(value as rasterProps);
    }
  };

  // ++++++++++++++++++++++++++++++++++++++ Create Layer ++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const fileTypes = ["geojson", "tif", "kml", "shp", "zip", "laz"];

  const createLayer = async () => {
    if (!fileList.length) {
      message.error("Please select file to upload");
      return;
    }

    const file = fileList[0];
    const ext = file.name.split(".").pop();

    if (!fileTypes.includes(ext)) {
      message.error("Please select the geojson or tif file or laz file");
      return;
    }

    if (!layerType || !layerProp || !captureDate || !layerName) {
      message.error("Please fill all the required field");
      return;
    }

    try {
      setUploading(true);
      // Determine the correct DocModel based on layerType
      // const config:AxiosRequestConfig = {
      //   onUploadProgress: (event) => {
      //     const percent = Math.floor((event.loaded / event.total) * 100);
      //     setProgress(percent);
      //     if (percent === 100) {
      //       setTimeout(() => setProgress(0), 1000);
      //     }
      //   },
      // };

      const docModel = layerType === "Vector" ? DocModel.VECTOR : layerType === "Raster" ? DocModel.RASTER : DocModel.LAYER_FILES;
      const uploadToken = await uploadFile(fileList[0], docModel, (prog) => {
        console.info("PROGRESS: " + prog);
        setProgress(prog * 100);
      });

      const body = {
        file: uploadToken,
        missionId : id,
        captureDate: captureDate,
        name: layerName,
        type: layerType,
        color: layerColor,
        inHeritOriginalColorFromFile: inheritColor,
        icon: icon2,
        ...(layerType === "Vector" ? { vector: layerProp } : {}),
        ...(layerType === "Raster" ? { raster: layerProp } : {}),
      };

      // const fmData = new FormData();
      // fmData.append("file", fileList[0]);
      // fmData.append("captureDate", captureDate);
      // fmData.append("name", layerName);
      // fmData.append("type", layerType);
      // fmData.append("color", layerColor);
      // fmData.append("missionId", id);
      // fmData.append("inHeritOriginalColorFromFile", inheritColor.toString());

      // if (layerType === "Vector") fmData.append("vector", layerProp);

      // if (layerType === "Raster") fmData.append("raster", layerProp);

      // fmData.append("icon", icon2);

      const result = await http.post(
        `${apis.CREATE_LAYER}/${layerType}`,
        body
      );
      console.log("vector layer is uploaded", result);


      if (result.data.status) {
        console.log("metadata for me:", result.data.data);
        addLayer(result.data.data);
        message.success("Layer created!");
      } else {
        message.error(result.data.message);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        if (
          err.response?.data.message === "Package has expired! Please renew!"
        ) {
          setExpiryModal(true);
          // window.setTimeout(function () {
          //   AxiosErrorHandler(err, logout);
          // }, 5000);
        } else {
          setLimitModal(true);
          console.log(err.response);
        }
      } else {
        console.log(err);
        AxiosErrorHandler(err, logout);
      }
    } finally {
      setUploading(false);
      setFileList([]);
      setCaptureDate("");
      setLayerName("");
      setLayerType("");
      setLayerProp(null);
      setIcon("");
      form.resetFields();
    }
  };

  // ++++++++++++++++++++++++++++++++++++++++++++++ Add Layer to list after createing new one +++++++++++++++++++++++++++++++++++++++++++++++
  const addLayer = (layer: Layer) => {
    try {
      setIsDrawing(false);
      setFeatureState(myFeatureCollection);
      if (layer.type === "Vector") {
        setvectorLayers([...vectorLayers, layer]);
      }
      const rasterSettings =
        layer.type === "Raster" ? defaultRasterSettings[layer.raster] : {};
      fetchLayerBounds(layer)
        .then((bounds) => {
          SetAllLayers((prev) => [
            ...prev,
            {
              ...layer,
              _isChecked: true,
              _render3D: false,
              _metadata: {
                bounds,
                ...rasterSettings,
              },
            },
          ]);
        })
        .catch((error) => message.error(error.message));

      // Should no longer be required
      // const data: any = [...treeStructure];
      // let layers = {
      //   ...allLayers,
      // };
      // if (layer.type === "Vector") {
      //   layer.key = `1-${layer._id}`;
      //   data[0].children.push(layer);

      //   const l = {};
      //   l[data[0]["key"] + "-" + layer._id] = {
      //     layerPath: layer.layerpath,
      //     type: layer.vector.type,
      //     name: layer.name,
      //     id: layer._id,
      //     T3DTranspose: false,
      //     groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
      //     layerLabel: layer.layerLabel,
      //     layerPopupLabel: layer.layerPopupLabel,
      //     isPublic: layer.isPublic,
      //     flaggedFeatures: layer.flaggedFeatures,
      //     isChecked: true,
      //   };

      //   layers = {
      //     ...layers,
      //     ...l,
      //   };

      //   data[0].children.sort((a, b) =>
      //     moment(b.captureDate).diff(moment(a.captureDate))
      //   );
      // } else {
      //   layer.key = `2-${layer._id}`;
      //   data[1].children.push(layer);

      //   const l = {};

      //   if (props.isBaseMap) {
      //     // -----to merge all rasters paths------------------

      //     l[data[1]["key"] + "-" + layer._id] = {
      //       layerPath: layer.layerdataArr,
      //       type: layer.raster.name,
      //       settings: {
      //         ...layer.raster,
      //         // minp: layer.minp,
      //         // maxp: layer.maxp,
      //       },
      //       name: layer.name,
      //       id: layer._id,
      //       isChecked: true,
      //     };
      //   } else {
      //     l[data[1]["key"] + "-" + layer._id] = {
      //       layerPath: layer.layerpath,
      //       type: layer.raster.name,
      //       settings: {
      //         ...layer.raster,
      //         minp: layer.minp,
      //         maxp: layer.maxp,
      //       },
      //       name: layer.name,
      //       id: layer._id,
      //       isChecked: true,
      //     };
      //   }

      //   layers = {
      //     ...layers,
      //     ...l,
      //   };

      //   data[1].children.sort((a, b) =>
      //     moment(b.captureDate).diff(moment(a.captureDate))
      //   );
      // }
      // while (data[0].children.length && data[0].children[0].group) {
      //   data[0].children.push(data[0].children.shift());
      // }
      // while (data[1].children.length && data[1].children[0].group) {
      //   data[1].children.push(data[1].children.shift());
      // }
      // setAllLayers(layers);
      // setTreeStructure(data);
      // if (layer.type === "Vector") {
      //   const cl = [...checkedKeys];
      //   cl.push(data[0]["key"] + "-" + layer._id);
      //   setCheckedKeys(cl);
      // } else {
      //   const cl = [...checkedKeys];
      //   cl.push(data[1]["key"] + "-" + layer._id);
      //   setCheckedKeys(cl);
      // }
    } catch (error) {
      message.error(error.message);
    }
  };

  const drawPolygonTool = new (EditableGeoJsonLayer as any)({
    id: "geojson",
    data: featureState,
    mode: mode.mode,
    selectedFeatureIndexes,
    onEdit: ({ updatedData, editType, editContext }): any => {
      let updatedSelectedFeatureIndexes: any = selectedFeatureIndexes;
      setFeatureState(updatedData);
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
          "new",
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
    pointRadiusUnits: "pixels",
    pointRadiusScale: 1,
    pointRadiusMinPixels: 8,
  });
  // ++++++++++++++++++++++++++++++++++++++++++++++ Edit Layer +++++++++++++++++++++++++++++++++++++++++++++++
  // const editLayer = () => {
  //   let data = {
  //     name: layerName,
  //     captureDate: captureDate,
  //   };

  //   // change color
  //   if(selectedLayerType=='vector'){
  //     http
  //     .patch(API_URL + apis.CHANGE_COLOR_BY_ID, {
  //       id: selectedLayerId,
  //       color: layerColor,
  //     })
  //     .then((res) => {
  //       console.log(res);
  //       if (res.data.status) {
  //         console.log(res.data.status);
  //         updateLayerDataAfterEditing(res.data.data[0]);
  //         message.success(res.data.message);
  //       } else {
  //         message.error('Color not updated: '+res.data.message);
  //       }
  //     })
  //     .catch((err) => message.error('Error updating color: '+err.message))
  //     .finally(() => {
  //       setLayerColor("");
  //     });
  //   }
  // }

  const editLayer = () => {
    setLoading(true);
    const data: any = {
      name: layerName,
      captureDate: captureDate,
    };
    if (layerProp) {
      data.layerType = layerProp;
    }

    // change color
    if (selectedLayerType === "vector") {
      http
        .patch(apis.CHANGE_COLOR_BY_ID, {
          id: selectedLayerId,
          color: layerColor,
          icon: icon2,
        })
        .then((res) => {
          if (res.data.status) {
            updateLayerDataAfterEditing(
              res.data.data,
              "color changed",
              selectedLayerId
            );
            setShouldAttributeTableReload(!shouldAttributeTableReload);
          } else {
            message.error("Color not updated: " + res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          if (err.response?.status === 401) {
            message.warning(
              "Sorry! You are not authorised to change color. Please contact admin"
            );
          } else console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setLayerColor("#ffaa00"); // default value that was previously also used in first declaration
          setLayerName("");
          setCaptureDate("");
          setIcon2(iconOptions[0].value); // default value that was previously also used in first declaration
          setLoading(false);
        });

      // refreshLayers();
    }

    setLoading(true);

    http
      .patch(`${apis.EDIT_LAYER}`, data, {
        params: {
          id: selectedLayerId,
        },
      })
      .then((res) => {
        if (res.data.data) {
          message.success(res.data.message);
          //console.log(res.data.data);
          // --update layer
          updateLayerDataAfterEditing(res.data.data[0], null, null);
          setLoading(false);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          message.warning(
            "Sorry! You are not authorised to edit layer. Please contact admin"
          );
        } else console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        handleCancel1();
        form.resetFields();
        setLayerName("");
        setCaptureDate("");
        setLayerColor("#ffaa00");
        setLayerProp(null);
        props.loading(false);
        setLoading(false);
      });

    // refreshLayers();
  };

  const editFeature = (data, color, index) => {
    data.properties["color"] = color;
    setLoading(true);

    http
      .patch(`${apis.EDIT_FEATURE}`, {
        id: selectedLayerId,
        featureIndex: index,
        feature: data,
      })
      .then((result) => {
        updateLayerDataAfterEditing(result.data.data, null, selectedLayerId);
        forceUpdateLayers(selectedLayerId);
        message.success(result.data.message);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          message.warning(
            "Sorry! You are not authorised to edit feature. Please contact admin"
          );
        } else console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setSelectedLayerId("");
        setColorChangeFeatureData(null);
        setShowColorChangeForm(false);
        setLoading(false);
      });
  };

  const updateLayerDataAfterEditing = (data: Layer, color, id) => {
    if (data) {
      // Should no longer be required
      // const td: any = [...treeStructure];
      // const id = data._id;
      // const type = data.type;
      // let newTreeData: any = [];
      // const al = { ...allLayers };
      // const l = {};
      // switch (type) {
      //   case "Vector":
      //     al[`1-${data._id}`].layerLabel = data.layerLabel;
      //     newTreeData = td[0].children.map((layer: any) => {
      //       if (!layer.group) {
      //         if (layer.key === `1-${id}`) {
      //           data.key = `1-${id}`;
      //           return data;
      //         } else return layer;
      //       } else {
      //         let groupLayers = [];

      //         groupLayers = layer.value.children.map((l) => {
      //           if (l.key === `1-${id}`) {
      //             data.key = `1-${id}`;
      //             return data;
      //           } else return l;
      //         });

      //         layer.value.children = [...groupLayers];
      //         return layer;
      //       }
      //     });

      //     td[0].children = [...newTreeData];

      //     l[td[0]["key"] + "-" + data._id] = {
      //       layerPath: data.layerpath,
      //       type: data.vector.type,
      //       name: data.name,
      //       id: data._id,
      //       layerLabel: data.layerLabel,
      //       layerPopupLabel: data.layerPopupLabel,
      //       isPublic: data.isPublic,
      //       flaggedFeatures: data.flaggedFeatures,
      //     };

      //     break;
      //   case "Raster":
      //     if (props.isBaseMap) {
      //       // -----to merge all rasters paths------------------
      //       l[td[1]["key"] + "-" + data._id] = {
      //         layerPath: data.layerdataArr,
      //         type: data.raster.name,
      //         settings: {
      //           ...data.raster,
      //           // minp: layer.minp,
      //           // maxp: layer.maxp,
      //         },
      //         name: data.name,
      //         id: data._id,
      //       };

      //       newTreeData = td[1].children.map((layer: any) => {
      //         if (!layer.group) {
      //           if (layer.key === `2-${id}`) {
      //             data.key = `2-${id}`;
      //             return data;
      //           } else return layer;
      //         } else {
      //           let groupLayers = [];

      //           groupLayers = layer.value.children.map((l) => {
      //             if (l.key === `2-${id}`) {
      //               data.key = `2-${id}`;
      //               return data;
      //             } else return l;
      //           });

      //           layer.value.children = [...groupLayers];
      //           return layer;
      //         }
      //       });

      //       td[1].children = [...newTreeData];
      //     } else {
      //       newTreeData = td[1].children.map((layer: any) => {
      //         if (!layer.group) {
      //           if (layer.key === `2-${id}`) {
      //             data.key = `2-${id}`;
      //             return data;
      //           } else return layer;
      //         } else {
      //           let groupLayers = [];

      //           groupLayers = layer.value.children.map((l) => {
      //             if (l.key === `2-${id}`) {
      //               data.key = `2-${id}`;
      //               return data;
      //             } else return l;
      //           });

      //           layer.value.children = [...groupLayers];
      //           return layer;
      //         }
      //       });

      //       td[1].children = [...newTreeData];
      //       break;
      //     }
      // }

      // setTreeStructure(td);
      // setAllLayers({
      //   ...al,
      //   ...l,
      // });
      // setTimeout(() => {
      //   forceUpdateLayers(id);
      // });
      SetAllLayers((prev) =>
        prev.map((layer) => {
          if (layer._id === data._id)
            return {
              ...data,
              _isChecked: layer._isChecked,
              _render3D: layer._render3D,
            };
          else return layer;
        })
      );
    }
  };
  //==============socket listen========================
  useEffect(() => {
    if (id) {
      if (!socket.current) {
        socket.current = io(
          `${API_URL}/stream/mission-specific?missionID=${id}`
        );

        socket.current.on("IMAGE_UPLOADED", (data) => {
          //console.log("Image upload successful!!", data);
          forceUpdateLayers(data.layerId);
        });

        socket.current.on("ASSIGNED SUCESSFULLY", (dataa) => {
          openNotification(dataa.layerName);
          setPicToMapData(dataa.data);
          console.log(dataa);
        });

        // ----- listen to pic2map v2 event -----------------
        socket.current.on("pic-to-map", (data) => {
          console.log("socket testing!  ", data);
          if (data.result) {
            message.success("Layer Created Successfully!");
            console.log(data.result);
            //addLayer(data.result);
            setPic2Mapv2Data(data);
            setPic2Mapv2Status(true);
          }
        });
      }
    }
  }, [id]);
  // const rowSelection = {
  //   onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
  //     console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  //   },
  //   getCheckboxProps: (record: DataType) => ({
  //     disabled: record.name === 'Disabled User', // Column configuration not to be checked
  //     name: record.name,
  //   }),
  // };

  const toolMenu = () => {
    const items: MenuProps["items"] = [
      {
        key: "0",
        label: "Line Tool",
      },
      {
        key: "1",
        label: "Polygon Tool",
      },
      {
        key: "2",
        label: "Marker Tool",
      },
    ];
    if (showMarkerSizeTool) {
      items.push({
        key: "3",
        label: (
          <Tooltip placement="bottom" title="Marker Size">
            <Slider
              min={0.3}
              max={1}
              onChange={onChangeSizeSlider}
              step={0.1}
              defaultValue={1}
              value={pointMarkerSize}
              tooltip={{ placement: "right" }}
              style={{ margin: 0, padding: "5px 4px" }}
            />
          </Tooltip>
        ),
      });
    }
    if (isMaskLayerVisible) {
      items.push({
        key: "3",
        label: (
          <Tooltip placement="bottom" title="Mask Layer Size">
            <Slider
              min={150}
              max={400}
              onChange={changePolygonSize}
              step={0.1}
              defaultValue={1}
              value={polygonSize}
              tooltip={{ placement: "right" }}
              style={{ margin: 0, padding: "5px 4px" }}
            />
          </Tooltip>
        ),
      });
    }
    return items;
  };
  const toolMenuOnClick = (e) => {
    if (e.key === "0") {
      startDrawing("DrawLine", "Line");
    }
    if (e.key === "1") {
      startDrawing("DrawPolygon", "Polygon");
    }
    if (e.key === "2") {
      startDrawing("DrawPoint", "Marker");
    }
  };
  const filterMenu: MenuProps["items"] = [
    {
      key: "vector",
      label: "Vector",
      children: [
        ...Object.values(featureTypes).map((type) => {
          return {
            key: type,
            label: type,
            onTitleClick: () => {
              setFilterState((prev) => {
                prev.vectorPropsType.add(type);
                return { ...prev };
              });
            },
            children: [
              ...Object.keys(featureType)
                .filter((prop) => featureType[prop] === type)
                .map((propName: string) => {
                  return {
                    key: `${propName}${type}`,
                    label: (
                      <div
                        onClick={() =>
                          setFilterState((prev) => {
                            // prev.vectorPropsType.add(type);
                            prev.vectorProps.add(propName);
                            return { ...prev };
                          })
                        }
                      >
                        {propName}
                      </div>
                    ),
                  };
                }),
            ],
          };
        }),
        {
          key: "Other",
          label: "Other",
          children: [
            ...Object.keys(featureType)
              .filter(
                (p) =>
                  ![
                    featureTypes.POINT,
                    featureTypes.MULTI_LINE_STRING,
                    featureTypes.MULTI_POLYGON,
                  ].includes(featureType[p])
              )
              .map((p) => {
                return {
                  key: `${p}${featureType[p]}`,
                  label: (
                    <div
                      onClick={() =>
                        setFilterState((prev) => {
                          // prev.vectorPropsType.add(featureType[p]);
                          prev.vectorProps.add(p);
                          return { ...prev };
                        })
                      }
                    >
                      {p}
                    </div>
                  ),
                };
              }),
          ],
        },
      ],
    },
    {
      key: "raster",
      label: "Raster",
      children: Object.values(rasterProps).map((propName) => {
        return {
          key: propName,
          label: (
            <div
              onClick={() =>
                setFilterState((prev) => {
                  prev.rasterProps.add(propName);
                  return { ...prev };
                })
              }
            >
              {propName}
            </div>
          ),
        };
      }),
    },
  ];

  //----------sorting menu
  const sortMenu = [
    {
      key: "1",
      label: "Name",
    },
    {
      key: "2",
      label: "Time",
    },
  ];
  const sortMenuOnClick = (e) => {
    if (e.key === "1") {
      setSortType("name");
    }
    if (e.key === "2") {
      setSortType("createdAt");
    }
  };

  // Set Active Layer Type
  useEffect(() => {
    console.log(activeKey);
    panes.map((pane) => {
      console.log(pane);
      if (pane.id === activeKey && pane.type === "vector") {
        setActiveID(pane.id);
      }
      if (pane.id === activeKey) setActiveType(pane.type === "vector");
      //console.log(pane.type);
    });
  }, [activeKey]);

  //-----------------Date Formatting for Time Filter--------------------------
  const dateFormat = () => {
    const t = Number(filterState.time?.split(" ")[0]);
    const dt = new Date();
    dt.setDate(dt.getDate() - t);
    return moment(dt).format("DD MMM");
  };

  //----------------------Badge Feature Count-------------------------------
  const overflowCount = (count) => {
    if (count <= 1000) return 1000;
    else if (count >= 5000) return 5000;
    else if (count % 500 === 0) return count - 500;
    else {
      const a = Math.floor(count / 1000);
      const b = count % 1000;
      const c = Math.floor(b / 500);
      let res = a * 1000;
      if (c > 0) res += 500;
      return res;
    }
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

  //---------------Handle Icon-----------------------------------
  function handleIcon(value) {
    setIcon(value);
  }

  const changeGroupOfLayer = async (groupid, layerids, keys) => {
    // const al = { ...allLayers };
    setLoading(true);
    //console.log(groupid);
    try {
      const res = await http.patch(`${apis.EDIT_LAYER_GROUP}`, {
        _id: groupid,
        layers: layerids,
      });

      if (!res.data.status) {
        return message.error(res.data.message);
      }

      const updatedLayerGroup: Layer["layerGroupId"] = {
        _id: res.data.data._id,
        name: res.data.data.name,
        layers: res.data.data.layers,
        createdBy: res.data.data.createdBy,
        tenantId: res.data.data.tenantId,
        createdAt: res.data.data.createdAt,
        updatedAt: res.data.data.updatedAt,
      };
      SetAllLayers((prev) =>
        prev.map((layer) => {
          if (updatedLayerGroup.layers.includes(layer._id)) {
            layer.layerGroupId = updatedLayerGroup;
          }
          return layer;
        })
      );

      // No longer required
      // keys.forEach((key) => {
      //   al[key].groupId = groupid;
      // });
      // const td: any = [...treeStructure];
      // td[0].children = td[0].children.map((layer) => {
      //   if (!layer.group) {
      //     if (layerids.includes(layer._id)) {
      //       layer.layerGroupId
      //         ? (layer.layerGroupId["_id"] = groupid)
      //         : (layer.layerGroupId = { _id: groupid });
      //       return layer;
      //     } else {
      //       return layer;
      //     }
      //   } else {
      //     layer.value.children = layer.value.children.map((l) => {
      //       if (layerids.includes(l._id)) {
      //         l.layerGroupId
      //           ? (l.layerGroupId["_id"] = groupid)
      //           : (l.layerGroupId = { _id: groupid });
      //         return l;
      //       } else {
      //         return l;
      //       }
      //     });
      //     return layer;
      //   }
      // });
      // td[1].children = td[1].children.map((layer) => {
      //   if (!layer.group) {
      //     if (layerids.includes(layer._id)) {
      //       layer.layerGroupId
      //         ? (layer.layerGroupId["_id"] = groupid)
      //         : (layer.layerGroupId = { _id: groupid });
      //       return layer;
      //     } else {
      //       return layer;
      //     }
      //   } else {
      //     layer.value.children = layer.value.children.map((l) => {
      //       if (layerids.includes(l._id)) {
      //         l.layerGroupId
      //           ? (l.layerGroupId["_id"] = groupid)
      //           : (l.layerGroupId = { _id: groupid });
      //         return l;
      //       } else {
      //         return l;
      //       }
      //     });
      //     return layer;
      //   }
      // });
      // setTreeStructure(td);
      // setAllLayers(al);
    } catch (err) {
      console.log(err);
      message.error(err.message);
      AxiosErrorHandler(err, logout);
    } finally {
      setLoading(false);
    }
  };

  const removeLayerFromGroup = async (groupId, layerId) => {
    // const al = { ...allLayers };
    setLoading(true);
    try {
      const res = await http.post(`${apis.DELETE_LAYER_ID_FROM_GROUP}`, {
        _id: groupId,
        layers: [layerId],
      });
      if (!res.data.status) {
        return message.error(res.data.message);
      }

      SetAllLayers((prev) =>
        prev.map((layer) => {
          if (layer._id === layerId) {
            layer.layerGroupId = null;
          }
          return layer;
        })
      );

      // No longer required
      // al[key].groupId = null;
      // const td: any = [...treeStructure];
      // td[0].children = td[0].children.map((layer) => {
      //   if (!layer.group) {
      //     if (layer._id === layerId) {
      //       layer.layerGroupId = null;
      //       return layer;
      //     } else {
      //       return layer;
      //     }
      //   } else {
      //     layer.value.children = layer.value.children.map((l) => {
      //       if (l._id === layerId) {
      //         l.layerGroupId = null;
      //         return l;
      //       } else {
      //         return l;
      //       }
      //     });
      //     return layer;
      //   }
      // });
      // td[1].children = td[1].children.map((layer) => {
      //   if (!layer.group) {
      //     if (layer._id === layerId) {
      //       layer.layerGroupId = null;
      //       return layer;
      //     } else {
      //       return layer;
      //     }
      //   } else {
      //     layer.value.children = layer.value.children.map((l) => {
      //       if (l._id === layerId) {
      //         l.layerGroupId = null;
      //         return l;
      //       } else {
      //         return l;
      //       }
      //     });
      //     return layer;
      //   }
      // });
      // setTreeStructure(td);
      // setAllLayers(al);
    } catch (err) {
      console.log(err);
      message.error(err.message);
      AxiosErrorHandler(err, logout);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (info) => {
    // console.log("OnDrop Event => ", info);
    // const dropKey = info.node.key;
    // const dragKey = info.dragNode.key;
    // const dropPos = info.node.pos.split("-");
    // const dropPosition =
    //   info.dropPosition - Number(dropPos[dropPos.length - 1]);

    try {
      // if (
      //   info.dragNode.key.split("-")[0] !== "group" &&
      //   !info.dragNode.groupId &&
      //   info.node.key.split("-")[0] === "group" &&
      //   !info.node.expanded
      // ) {
      // } else if (
      //   info.dragNode.key.split("-")[0] !== "group" &&
      //   info.dragNode.groupId &&
      //   info.node.key.split("-")[0] === "group" &&
      //   !info.node.expanded &&
      //   info.node.groupId !== info.dragNode.groupId
      // ) {
      //   const key = info.dragNode.key;
      //   await removeLayerFromGroup(
      //     info.dragNode.groupId,
      //     info.dragNode.layer._id
      //   );
      // } else if (
      //   info.dragNode.key.split("-")[0] === "group" &&
      //   info.node.key.split("-")[0] === "group" &&
      //   !info.node.expanded
      // ) {
      // } else if (
      //   info.dragNode.key.split("-")[0] === "group" &&
      //   info.node.key.split("-")[0] === "group" &&
      //   info.node.expanded
      // ) {
      //   return message.info("Please Collapse The Group Before Dropping");
      // } else if (info.dragNode.groupId === info.node.groupId) {
      //   if (info.node.group) {
      //     return;
      //   }
      // } else if (
      //   (info.dragNode.key.split("-")[0] === "group" && info.node.groupId) ||
      //   (info.dragNode.key.split("-")[0] !== "group" &&
      //     info.node.key.split("-")[0] === "group")
      // ) {
      //   return;
      // } else if (
      //   info.dragNode.key.split("-")[0] === "group" &&
      //   !info.node.groupId &&
      //   info.node.pos === "0-0-0"
      // ) {
      //   return;
      // } else {
      //   const groupid = info.node.groupId;
      //   if (!groupid && !info.dragNode.group) {
      //     if (info.node.pos === "0-0") return;
      //     const key = info.dragNode.key;
      //     await removeLayerFromGroup(
      //       info.dragNode.groupId,
      //       info.dragNode.layer._id
      //     );
      //   } else if (info.dragNode.layer) {
      //     const layerid = info.dragNode.layer._id;
      //     const key = info.dragNode.key;
      //     //console.log(layerid, groupid);
      //     await changeGroupOfLayer(groupid, [layerid], [key]);
      //   }
      // }

      if (info.dragNode && !info.dragNode.group) {
        // allow only individual layers to be dragged and dropped, not entire layer groups
        const key = info.dragNode.key;
        const layerId = info.dragNode._id;
        const oldGroupId = info.dragNode.groupId;
        const newGroupId = info.node.groupId;

        if (!newGroupId) {
          if (info.node.pos === "0-0") return;
          // the node under which it was dragged is not a layer group, so it must have been dragged under "Vector" or "Raster"
          // this means it was actually ungrouped
          await removeLayerFromGroup(oldGroupId, layerId);
        } else {
          // layer was moved under a new group
          //console.log(layerid, newGroupId);
          await changeGroupOfLayer(newGroupId, [layerId], [key]);
        }
      }

      // const loop = (data, key, callback) => {
      //   for (let i = 0; i < data.length; i++) {
      //     if (data[i].key === key) {
      //       return callback(data[i], i, data);
      //     }
      //     if (data[i].children) {
      //       loop(data[i].children, key, callback);
      //     }
      //     if (data[i].group) {
      //       loop(data[i].value.children, key, callback);
      //     }
      //   }
      // };

      // const data = [...treeStructure];

      // Find dragObject
      // let dragObj;
      // loop(data, dragKey, (item, index, arr) => {
      //   arr.splice(index, 1);
      //   dragObj = item;
      // });

      // if (!info.dropToGap) {
      //   // Drop on the content
      //   loop(data, dropKey, (item) => {
      //     item.children = item.children || [];
      //     // where to insert
      //     item.children.unshift(dragObj);
      //   });
      // } else if (
      //   (info.node.props.children || []).length > 0 && // Has children
      //   info.node.props.expanded && // Is expanded
      //   dropPosition === 1 // On the bottom gap
      // ) {
      //   loop(data, dropKey, (item) => {
      //     item.children = item.children || [];
      //     item.children.unshift(dragObj);
      //   });
      // } else {
      //   let ar;
      //   let i;
      //   loop(data, dropKey, (item, index, arr) => {
      //     ar = arr;
      //     i = index;
      //   });
      //   if (dropPosition === -1) {
      //     ar.splice(i, 0, dragObj);
      //   } else {
      //     ar.splice(i + 1, 0, dragObj);
      //   }
      // }

      // const dropc = info.dragNode.checked;

      // Should no longer be required
      // if (dropc) {
      //   const cv = [...checkedKeys];

      //   const rasters: any = [];

      //   data[1].children.forEach((node: any) => {
      //     if (node.group) {
      //       node.value.children.forEach((n) => {
      //         if (cv.includes(n.key)) {
      //           rasters.push(n.key);
      //         }
      //       });
      //     } else {
      //       if (cv.includes(node.key)) {
      //         rasters.push(node.key);
      //       }
      //     }
      //   });

      //   const vectors: any = [];

      //   data[0].children.forEach((node: any) => {
      //     if (node.group) {
      //       node.value.children.forEach((n) => {
      //         if (cv.includes(n.key)) {
      //           rasters.push(n.key);
      //         }
      //       });
      //     } else {
      //       if (cv.includes(node.key)) {
      //         rasters.push(node.key);
      //       }
      //     }
      //   });

      //   vectors.reverse();
      //   rasters.reverse();
      //   setCheckedKeys([]);
      //   setTimeout(() => {
      //     setCheckedKeys([...rasters, ...vectors]);
      //   }, 0);
      // }

      // setTreeStructure(data);
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
  function onChangeInherit(checked) {
    //console.log(`switch to ${checked}`);
    if (checked) {
      setInheritColor(true);
      setshowColorPicker(false);
    } else {
      setInheritColor(false);
      setshowColorPicker(true);
    }
  }

  const Cancel1 = () => {
    setLimitModal(false);
  };
  const Cancel2 = () => {
    setExpiryModal(false);
  };

  // **** Group Layer Options ****
  const [groupType, setgroupType] = useState("vector");
  const [visibleGroupCreateModal, setVisibleGroupCreateModal] = useState(false);
  const [moveToOtherGroupModal, setMoveToOtherGroupModal] = useState(false);
  const [moveType, setMoveType] = useState(1);
  const [groupForm] = Form.useForm();
  const [toGroupForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // No longer required
  // const updateTreeDataAfterGroupCreation = (data, type) => {
  //   const td: any = [...treeStructure];
  //   let newTreeData = [];
  //   const al = { ...allLayers };
  //   const layers = data.layers.map((layer) => {
  //     return layer._id;
  //   });

  //   switch (type) {
  //     case "vector":
  //       newTreeData = td[0].children.filter((layer: any) => {
  //         if (!layer.group) {
  //           if (!layers.includes(layer._id)) {
  //             return true;
  //           } else return false;
  //         } else {
  //           let groupLayers = [];

  //           groupLayers = layer.value.children.filter((l) => {
  //             if (!layers.includes(l._id)) {
  //               return true;
  //             } else return false;
  //           });

  //           layer.value.children = [...groupLayers];
  //           return true;
  //         }
  //       });

  //       td[0].children = [...newTreeData];

  //       break;
  //     case "raster":
  //       newTreeData = td[1].children.filter((layer: any) => {
  //         if (!layer.group) {
  //           if (!layers.includes(layer._id)) return true;
  //           else return false;
  //         } else {
  //           let groupLayers = [];

  //           groupLayers = layer.value.children.filter((l) => {
  //             if (!layers.includes(l._id)) {
  //               return true;
  //             } else return false;
  //           });

  //           layer.value.children = [...groupLayers];
  //           return true;
  //         }
  //       });

  //       td[1].children = [...newTreeData];
  //       break;
  //   }

  //   switch (type) {
  //     case "vector":
  //       const vectors = data.layers.map((layer) => {
  //         al[`1-${layer._id}`].groupId = data._id;
  //         return {
  //           key: `1-${layer._id}`,
  //           ...layer,
  //         };
  //       });

  //       data.children = [...vectors];

  //       td[0].children.push({
  //         group: true,
  //         value: data,
  //         id: data._id,
  //         key: "group-" + data._id,
  //         groupType: 1,
  //       });

  //       break;
  //     case "raster":
  //       const rasters = data.layers.map((layer) => {
  //         al[`2-${layer._id}`].groupId = data._id;
  //         return {
  //           key: `2-${layer._id}`,
  //           ...layer,
  //         };
  //       });

  //       data.children = [...rasters];

  //       td[1].children.push({
  //         group: true,
  //         value: data,
  //         id: data._id,
  //         key: "group-" + data._id,
  //         groupType: 2,
  //       });
  //   }

  //   const ag = { ...allLayerGroups };

  //   ag[data._id] = {
  //     id: data._id,
  //     name: data.name,
  //     groupType: type === "vector" ? 1 : 2,
  //   };

  //   setAllLayerGroups(ag);
  //   setAllLayers(al);

  //   setTimeout(() => {
  //     setTreeStructure(td);
  //     forceUpdateAllLayers();
  //     setVisibleGroupCreateModal(false);
  //     resetGroupFormFields();
  //   });
  // };

  const createLayerGroup = (data) => {
    setLoading(true);
    const layersToGroup = AllLayers.filter(
      (layer) =>
        layer._isChecked && layer.type === ["", "Vector", "Raster"][moveType]
    ).map((layer) => layer._id);

    http
      .post(`${apis.CREATE_GROUP_LAYER}`, {
        name: data.name,
        layers: layersToGroup,
      })
      .then((result) => {
        if (result.data.status) {
          message.success("Group Created");
          const layerGroup: Layer["layerGroupId"] = {
            _id: result.data.data[0]._id,
            name: result.data.data[0].name,
            layers: result.data.data[0].layers.map((layer) => layer._id),
            createdBy: result.data.data[0].createdBy,
            tenantId: result.data.data[0].tenantId,
            createdAt: result.data.data[0].createdAt,
            updatedAt: result.data.data[0].updatedAt,
          };
          SetAllLayers((prev) =>
            prev.map((layer) => {
              if (layerGroup.layers.includes(layer._id)) {
                layer.layerGroupId = layerGroup;
              }
              return layer;
            })
          );
          // setAllLayerGroups(prev => ({
          //   ...prev,
          //   [layerGroup._id]: {
          //     id: layerGroup._id,
          //     name: layerGroup.name,
          //     groupType: moveType
          //   }
          // }));
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setVisibleGroupCreateModal(false);
        resetGroupFormFields();
        setLoading(false);
      });
  };

  const moveLayers = async (data) => {
    setLoading(true);
    const layersToMove = AllLayers.filter(
      (layer) =>
        layer._isChecked && layer.type === ["", "Vector", "Raster"][moveType]
    ).map((layer) => layer._id);

    http
      .patch(`${apis.EDIT_LAYER_GROUP}`, {
        _id: data.group,
        layers: layersToMove,
      })
      .then((result) => {
        if (result.data.status) {
          message.success("Layers Moved");
          const updatedLayerGroup: Layer["layerGroupId"] = {
            _id: result.data.data._id,
            name: result.data.data.name,
            layers: result.data.data.layers,
            createdBy: result.data.data.createdBy,
            tenantId: result.data.data.tenantId,
            createdAt: result.data.data.createdAt,
            updatedAt: result.data.data.updatedAt,
          };
          SetAllLayers((prev) =>
            prev.map((layer) => {
              if (updatedLayerGroup.layers.includes(layer._id)) {
                layer.layerGroupId = updatedLayerGroup;
              }
              return layer;
            })
          );
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setMoveToOtherGroupModal(false);
        toGroupForm.resetFields();
        setLoading(false);
      });
  };

  const creteNewGroupCard = () => {
    return (
      <>
        <Form
          name="basic"
          onFinish={createLayerGroup}
          initialValues={{ remember: true }}
          autoComplete="off"
          form={groupForm}
        >
          <Form.Item
            label="Group Name"
            name="name"
            rules={[{ required: true, message: "Please input groupname" }]}
          >
            <Input style={{ width: "350px" }} placeholder="Enter Group Name" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </>
    );
  };

  const moveToGroupForm = () => {
    const groups: { id: string; name: string }[] = [];
    AllLayers.forEach((layer) => {
      if (
        layer.layerGroupId &&
        !groups.find((group) => group.id === layer.layerGroupId._id)
      ) {
        groups.push({
          id: layer.layerGroupId._id,
          name: layer.layerGroupId.name,
        });
      }
    });
    return (
      <>
        <Form
          name="basic"
          onFinish={moveLayers}
          initialValues={{ remember: true }}
          autoComplete="off"
          form={toGroupForm}
        >
          <Form.Item
            label="Select Group"
            name="group"
            hasFeedback
            rules={[{ required: true, message: "Please select grouptype" }]}
          >
            <Select
              style={{ width: "350px", marginLeft: "8px" }}
              placeholder="Select Group To Move Layers"
              onChange={(type: any) => {
                setgroupType(type);
              }}
            >
              {/* {Object.entries(allLayerGroups).map(
                ([key, value]: any, idx: any) => {
                  return (
                    <>
                      {value.groupType === moveType && (
                        <Option value={key} key={idx}>
                          {value.name}
                        </Option>
                      )}
                    </>
                  );
                }
              )} */}
              {groups.map((group, idx) => {
                return (
                  <Option value={group.id} key={idx}>
                    {group.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </>
    );
  };

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleShowMaskLayer = () => {
    setisMaskLayerVisible(false);
    setLayerOpacity(1);
  };

  const resetGroupFormFields = () => {
    groupForm.resetFields();
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      cancelDrawing();
    }
  };

  const handleMouseMove = (e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  if (props.isBaseMap && !["tenant-root","tenant-staff"].includes(Auth.userdetails.userType)) {
    return <FourOhOne />;
  }

  const memoizedAllLayers = useMemo(() => ILayerToDeckLayer(AllLayers), [AllLayers]);
  const memoizedMissionLayers = useMemo(() => MissionLayerToDeckLayer(MissionLayers), [MissionLayers]);
  const computeLayers = () => {
    const layers: any[] = [];

    // OSMState Layers
    if (osmState) layers.push(osm);

    // Drawing State Layers
    if (isDrawing) {
      layers.push(drawPolygonTool);
    } else {
      layers.push(maskLayer);
    }

    // Tree Menu Layers
    layers.push(memoizedAllLayers);
    layers.push(memoizedMissionLayers);

    if (digitizer) layers.push(digitizerLayer);

    return layers;
  }

  return (
    <div
      className="map_wrapper"
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
    >
      <Thread
        thumbnail={thumbnail}
        setThumbnail={setThumbnail}
        data={threadDetails}
      />
      <Modal
        title="Maximum Limit reached!"
        open={LimitModal}
        onOk={Cancel1}
        onCancel={Cancel1}
      >
        <Result
          status="500"
          title="Oops! You have reached your limit of creating layers!"
          subTitle="Please contact your admin."
        //extra={<Button type="primary" onClick={() => window.history.back()}>Back</Button>}
        />
      </Modal>
      <Modal
        title="Tenant Expired!"
        open={ExpiryModal}
        onOk={Cancel2}
        onCancel={Cancel2}
      >
        <Result
          status="403"
          title="Oops! Your tenant has expired!"
          subTitle="Please contact admin@kesowa.com to renew our services!"
        />
      </Modal>
      {layerLoading && (
        <div className="overlay">
          <Spin size="large" tip="Loading..." style={{ color: "#ffffff" }} />
        </div>
      )}
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        ref={deckRef}
        // onHover={(info) => {
        //   const coords = getPolygon(info.x, info.y, 150);
        //   const mapCoords = coords.map((coord) =>DeckGL
        //     info.viewport?.unproject(coord)
        //   );
        //   setPolygon(mapCoords);
        // }}
        onHover={(info) => {
          if (isMaskLayerVisible) {
            const coords = getPolygon(info.x, info.y, polygonSize);
            const mapCoords = coords.map((coord) =>
              info.viewport?.unproject(coord)
            );
            setPolygon(mapCoords);
          }
        }}
        controller={true}
        layers={computeLayers()}
        style={{ height: "100vh", width: "100%" }}
        // onHover={(info) => {
        //   const coords = getPolygon(info.x, info.y, 150);
        //   const mapCoords = coords.map((coord) =>
        //     info.viewport?.unproject(coord)
        //   );
        //   setPolygon(mapCoords);
        // }}
        getCursor={() => {
          return isDrawing ? "crosshair" : "pointer";
        }}
        getTooltip={({ object }) => {
          return (
            object &&
            object?.properties?.[selectedLayerPopupLabel] && {
              html: `<div style="font-size: 1rem; color: #000">${layerName}</div><hr style="color: ${object.properties.color}"/>${selectedLayerPopupLabel} : ${object?.properties?.[selectedLayerPopupLabel]}`,
              style: {
                backgroundColor: "#fff",
                margin: "0px",
                borderRadius: "5px",
              },
            }
          );
        }}
        onDrag={() => { }}
        onClick={(info, event) => {
          setShowDrawingTools(false);
          if (event.rightButton) {
            const layerIndex = AllLayers.findIndex(
              (layer) => info.layer?.id === layer._id
            );
            if (layerIndex !== -1) {
              setSelectedLayerId(AllLayers[layerIndex]._id);
              setColorChangeFeatureData(info);
              setShowColorChangeForm(true);
            }
            if (!info.layer) {
              setToolSelected("");
              setShowDrawingTools(false);
              settoolCoordinates([
                event.offsetCenter.x,
                event.offsetCenter.y - 50,
              ]);
              setShowDrawingTools(true);
              drawingMenuRef.current.click();
            }
          } else if (info.layer) {
            const layer = AllLayers.find((layer) => layer.type === 'Vector' && info.layer?.id === layer._id);
            if (layer) {
              InfoWindow(
                info.index,
                info.coordinate,
                layer.name,
                (featureType[layer.vector] === featureTypes.POINT) ? "PointView" : "PolygonView",
                info.object,
                false,
                layer._id,
                info.object.properties.sys_id,
                "Vector"
              );
              setSelectedLayerLabel(layer.layerLabel ? layer.layerLabel : "No label selected");
              setSelectedLayerPopupLabel(layer.layerPopupLabel ? layer.layerPopupLabel : "No label selected");
          } else {
            setShowDrawingTools(false);
          }
        }
      }}
        //getTooltip={({object}) => object && (object.properties.Block_Nm)}
      >
        <ElevationBlock hoverInfo={hoverInfo} isElevationEnabled={isElevationEnabled} />

        {osmState ? (
          <>
            <div style={COPYRIGHT_LICENSE_STYLE}>
              {"© "}
              <a
                style={LINK_STYLE}
                href="https://www.openstreetmap.org/copyright"
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
            ref={mapRef}
          />
        )}

        {
           showPopup && (
          <HTMLOverlay>
            <HTMLOverlayItem coordinates={coordinates}>
              <Popover
                content={
                    <InfoWindowContent
                      mode={infoWindowMode}
                      coordinates={coordinates}
                      token={MAPBOX_API_KEY}
                      feature={featureData}
                      sysId={sysId}
                      featureIdx={featureIdx}
                      setformDrawerVisible={setformDrawerVisible}
                      drawerVisibility={viewMedia}
                      setImagesDrawer={setViewMedia}
                      videoToShow={videoToShow}
                      setVideoToShow={setVideoToShow}
                      show={saveButtonShow}
                      setShowForm={setShowForm}
                      cancelDrawing={cancelDrawing}
                      togglePopup={togglePopup}
                      layerId={featureLayer}
                      missionLayer={missionLayer}
                      setMissionLayer={setMissionLayer}
                      AllLayers={AllLayers}
                      SetAllLayers={SetAllLayers}
                      setShouldAttributeTableReload={
                        setShouldAttributeTableReload
                      }
                      shouldAttributeTableReload={shouldAttributeTableReload}
                      canDraw={perms.canCreateLayer}
                      isBaseMap={props.isBaseMaps}
                      isPublic={false}
                      setThumbnail={setThumbnail}
                    />
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
                open={showPopup}
                style={{ position: "relative" }}
                onOpenChange={() => handleClose(false)}
              />
            </HTMLOverlayItem>
          </HTMLOverlay>
        )}
      </DeckGL>

      {/* {showDrawingTools && ( */}
      <div
        className="drawing-tools"
        style={{
          top: toolCoordinates[1] + "px",
          left: toolCoordinates[0] + "px",
        }}
      >
        <Dropdown
          menu={{ items: toolMenu(), onClick: toolMenuOnClick }}
          // ref={drawingMenuRef}
          placement="bottom"
          trigger={["click"]}
        >
          <Button
            style={{ visibility: "hidden" }}
            ref={drawingMenuRef}
          ></Button>
        </Dropdown>
      </div>
      {/* )} */}

      <div className="map-header-toolbar">
        <Row>
          <Col md={12}>
            <div className="map-selector">
              <Select
                defaultValue="streets"
                style={{ width: 120 }}
                onChange={handleMapMode}
              >
                <Option value="streets">Street Maps</Option>
                <Option value="osm">Open Street Maps</Option>
                <Option value="satellite">Satellite</Option>
                <Option value="light">Light mode</Option>
                <Option value="dark">Dark mode</Option>
              </Select>
            </div>
            {/* <div className='streelabel-toggle'>
              <Text className='text-1'>Street labels</Text>
              <Switch className='switch-1' defaultChecked />
            </div> */}
          </Col>
          <Col md={12}>
            <div className="toolbar">
              {showFlightPath && (
                <Tooltip placement="bottom" title="Remove Flight Path">
                  <Button
                    className="remove-flight-tool"
                    type="primary"
                    icon={<NodeIndexOutlined />}
                    size="large"
                    danger
                    onClick={removeFlightPath}
                  />
                </Tooltip>
              )}
              {isMaskLayerVisible && (
                <div
                  style={{
                    position: "fixed",
                    left: cursorPosition.x - polygonSize / 2,
                    top: cursorPosition.y - polygonSize / 2,
                    width: `${polygonSize}px`,
                    height: `${polygonSize}px`,
                    border: "2.6px solid rgba(0, 255, 255, 0.5)",
                    borderRadius: "4px",
                    pointerEvents: "none",
                    zIndex: 9999,
                  }}
                ></div>
              )}
              {isMaskLayerVisible && (
                <Tooltip placement="bottom" title="Polygon Size">
                  <div
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      padding: "12px",
                      marginRight: "20px",
                      marginBottom: "10px",
                    }}
                  >
                    <Tooltip placement="bottom" title="Polygon Size">
                      <Slider
                        min={150}
                        max={350}
                        onChange={changePolygonSize}
                        step={0.1}
                        defaultValue={1}
                        value={polygonSize}
                        tooltip={{ placement: "right" }}
                        style={{
                          width: "100px",
                          margin: "5px 0",
                          padding: "1px 1px",
                        }}
                      />
                    </Tooltip>
                  </div>
                </Tooltip>
              )}
              {isMaskLayerVisible && (
                // HERE: Polygon Opacity Slider
                <Tooltip placement="bottom" title="Opacity">
                  <div
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      padding: "12px",
                      marginRight: "20px",
                      marginBottom: "10px",
                    }}
                  >
                    <Tooltip placement="bottom" title="Opacity">
                      <Slider
                        min={0.1}
                        max={1}
                        onChange={changeOpacity}
                        step={0.1}
                        defaultValue={1}
                        value={layerOpacity}
                        tooltip={{ placement: "right" }}
                        style={{
                          width: "100px",
                          margin: "5px 0",
                          padding: "1px 1px",
                        }}
                      />
                    </Tooltip>
                  </div>
                </Tooltip>
              )}
              <Tooltip
                title="digitize image to map"
                placement="bottom"
              >
                 <div
                  className="time-filter-tool"
                  onClick={() => setDigitizer((digitizer) => !digitizer)}
                >
                  <Text strong>
                      Digitizer
                  </Text>
                </div>
              </Tooltip>
              <Tooltip title="Time" placement="bottom">
                <div
                  className="time-filter-tool"
                  style={{ width: "max-content" }}
                >
                  <div
                    style={{
                      //backgroundColor: "gold",
                      marginTop: "-4px",
                    }}
                  >
                    <span
                      onClick={() => {
                        setTimeFilter(!timeFilter);
                      }}
                    >
                      {timeFilter ? (
                        <RightOutlined style={{ fontSize: "10px" }} />
                      ) : (
                        <LeftOutlined style={{ fontSize: "10px" }} />
                      )}
                    </span>{" "}
                    <Checkbox
                      style={{
                        marginTop: "2px",
                        marginRight: "6px",
                        marginLeft: "6px",
                      }}
                      onChange={(e) =>
                        setFilterState((prev) => {
                          prev.time = e.target.checked ? "100 days" : null;
                          return { ...prev };
                        })
                      }
                    />{" "}
                    <Text strong>Time Filter</Text>
                    <div
                      style={{
                        display: timeFilter ? "inline" : "none",
                        transition: "0.2s",
                      }}
                    >
                      {!!filterState.time && (
                        <span style={{ margin: "0 5px" }}>
                          {dateFormat()} - {moment().format("DD MMM")}{" "}
                        </span>
                      )}

                      <Select
                        defaultValue="100 days"
                        size="small"
                        onChange={(value) => {
                          setFilterState((prev) => {
                            prev.time = value;
                            return { ...prev };
                          });
                        }}
                        disabled={!filterState.time}
                      >
                        <Option value="7 days">Last 1 Week</Option>
                        <Option value="30 days">Last 1 Month</Option>
                        <Option value="100 days">Last 100 Days</Option>
                      </Select>
                    </div>
                  </div>
                </div>
              </Tooltip>

              {isDrawing && (
                <Tooltip placement="bottom" title="Clear Selection">
                  <div className="cancel-tool" onClick={() => cancelDrawing()}>
                    <span className="cancel-icon">Cancel</span>
                  </div>
                </Tooltip>
              )}
              <Tooltip
                placement="bottom"
                title={
                  isMaskLayerVisible ? "Disable Masking" : "Enable Masking"
                }
              >
                <div
                  className="time-filter-tool"
                  onClick={() => {
                    setisMaskLayerVisible((prev) => !prev);
                  }}
                >
                  <Text strong>
                    {isMaskLayerVisible ? "Disable Masking" : "Enable Masking"}
                  </Text>
                </div>
              </Tooltip>
              {isElevationEnabled && (
                <Tooltip placement="bottom" title="Disable Elevation">
                  <div
                    className="cancel-tool"
                    onClick={() => toggleElevation()}
                  >
                    <span className="cancel-icon">Disable</span>
                  </div>
                </Tooltip>
              )}
              <Tooltip placement="bottom" title="Line tool">
                <div
                  className="line-tool"
                  style={{
                    background: toolSelected === "Line" ? "#35BDD0" : "#ffffff",
                  }}
                  onClick={() => startDrawing("DrawLine", "Line")}
                >
                  <div className="line-icon">
                    <img src={LineIcon} alt="" />
                  </div>
                </div>
              </Tooltip>
              <Tooltip placement="bottom" title="Polygon tool">
                <div
                  className="polygon-tool"
                  style={{
                    background:
                      toolSelected === "Polygon" ? "#35BDD0" : "#ffffff",
                  }}
                  onClick={() => startDrawing("DrawPolygon", "Polygon")}
                >
                  <div className="polygon-icon">
                    <img src={PolygonIcon} alt="" />
                  </div>
                </div>
              </Tooltip>
              <Tooltip placement="bottomRight" title="Marker tool">
                <div
                  className="marker-tool"
                  style={{
                    background:
                      toolSelected === "Marker" ? "#35BDD0" : "#ffffff",
                  }}
                  onClick={() => startDrawing("DrawPoint", "Marker")}
                >
                  <EnvironmentOutlined className="marker-icon" />
                </div>
              </Tooltip>
            </div>
          </Col>
        </Row>
      </div>
      <div
        className="collapser-button"
        onClick={() => sideBarHandeller()}
        style={{
          right: sideBarState === false ? "10px" : "354px",
          zIndex: 9999,
        }}
      >
        <span className="icon">{sideBarIcon}</span>
      </div>
      {sideBarState && (
        <div className="map-sidebar">
          <div className="header-content">
            <Row style={{ justifyContent: "space-between" }}>
              <Title level={4}>
                {props.isBaseMap == false ? (
                  <ArrowLeftOutlined
                    onClick={() => history.goBack()}
                    style={{ fontSize: "20px" }}
                  />
                ) : (
                  <></>
                )}{" "}
                <Text style={{ width: 225 }} ellipsis={{ tooltip: missioName }}>
                  {missioName === "none" ? "Map" : missioName}
                </Text>
              </Title>
              {AllLayers.length !== 0 && (
                <Text type="secondary">Results: {AllLayers.length}</Text>
              )}
            </Row>
            <div
              style={{
                display: "inline-block",
                width: "100%",
                marginTop: "10px",
              }}
            >
              {props.isBaseMap ? (
                <>
                  {perms.canCreateBaseLayer ? (
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setUpdate(false);
                        setIsModalVisible4(true);
                      }}
                      style={{ float: "left" }}
                    >
                      Create Layer
                    </Button>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <>
                  {perms.canCreateLayer ? (
                    <Button
                      icon={<UploadOutlined />}
                      onClick={() => {
                        setIsModalVisible2(true);
                      }}
                      style={{ float: "left" }}
                    >
                      Upload
                    </Button>
                  ) : (
                    <></>
                  )}
                </>
              )}

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
              <Dropdown
                menu={{ items: sortMenu, onClick: sortMenuOnClick }}
                trigger={["click"]}
              >
                <Button style={{ float: "right" }} type="link">
                  Sort
                </Button>
              </Dropdown>
              <Dropdown
                menu={{ items: filterMenu }}
                //overlay={filterMenu}
                disabled={chipsLoading}
              //overlayStyle={{}}
              >
                <Button style={{ float: "right" }} type="link">
                  Filter <DownOutlined />
                </Button>
              </Dropdown>
            </div>
            {/* FILTER TAGS */}
            <div
              style={{
                display: "flex",
                flexFlow: "row",
                marginTop: "5px",
                marginBottom: "5px",
                overflow: "auto",
              }}
            >
              {/* TIME FILTER TAG */}
              <Tag
                style={{ display: filterState.time ? "inline" : "none" }}
                // color='#108ee9'
                icon={
                  chipsLoading ? <SyncOutlined spin /> : <CheckCircleOutlined />
                }
                color="blue"
                closable
                onClose={() =>
                  setFilterState((prev) => {
                    prev.time = null;
                    return { ...prev };
                  })
                }
              >
                Last {filterState.time}
              </Tag>
              {/* RASTER PROP FILTER TAGS */}
              {...Array.from(filterState.rasterProps).map((tag) => {
                return (
                  <Tag
                    icon={
                      chipsLoading ? (
                        <SyncOutlined spin />
                      ) : (
                        <CheckCircleOutlined />
                      )
                    }
                    color="blue"
                    closable
                    onClose={() =>
                      setFilterState((prev) => {
                        prev.rasterProps.delete(tag);
                        return { ...prev };
                      })
                    }
                  >
                    {tag}
                  </Tag>
                );
              })}
              {/* VECTOR PROP TYPE FILTER TAGS */}
              {...Array.from(filterState.vectorPropsType).map((tag) => {
                return (
                  <Tag
                    icon={
                      chipsLoading ? (
                        <SyncOutlined spin />
                      ) : (
                        <CheckCircleOutlined />
                      )
                    }
                    color="blue"
                    closable
                    onClose={() =>
                      setFilterState((prev) => {
                        prev.vectorPropsType.delete(tag);
                        return { ...prev };
                      })
                    }
                  >
                    {tag}
                  </Tag>
                );
              })}
              {/* VECTOR PROP FILTER TAGS */}
              {...Array.from(filterState.vectorProps).map((tag) => {
                return (
                  <Tag
                    style={{ display: "inline" }}
                    icon={
                      chipsLoading ? (
                        <SyncOutlined spin />
                      ) : (
                        <CheckCircleOutlined />
                      )
                    }
                    color="blue"
                    closable
                    onClose={() =>
                      setFilterState((prev) => {
                        prev.vectorProps.delete(tag);
                        return { ...prev };
                      })
                    }
                  >
                    {tag}
                  </Tag>
                );
              })}
            </div>

            <Modal
              title="Upload Layer"
              open={isModalVisible2}
              onCancel={handleCancel2}
              footer={null}
            >
              <Row align="middle" justify="center">
                <Col>
                  <Card
                    key="1"
                    onClick={() => setSelectedKey(1)}
                    className={`create-mission-extended-card ${selectedKey == 1
                      ? "create-mission-extended-card-selected"
                      : ""
                      }`}
                    // loading={isLoading}
                    hoverable
                  >
                    <Meta
                      avatar={
                        <Avatar
                          size={50}
                          icon={<FileAddOutlined />}
                          style={{
                            backgroundColor: "transparent",
                            color: "black",
                          }}
                        />
                      }
                      title={"Upload File"}
                      description="Create a new layer by uploading a vector file (.geojson, .shp, .kml) or raster file (.tif, .laz)"
                    />
                  </Card>
                  <Card
                    key="2"
                    onClick={() => setSelectedKey(2)}
                    className={`create-mission-extended-card ${selectedKey == 2
                      ? "create-mission-extended-card-selected"
                      : ""
                      }`}
                    // loading={isLoading}
                    hoverable
                  >
                    <Meta
                      avatar={
                        <Avatar
                          size={50}
                          icon={<FileImageOutlined />}
                          style={{
                            backgroundColor: "transparent",
                            color: "black",
                          }}
                        />
                      }
                      title={"Upload Images"}
                      description="Create a vector layer from geolocated images."
                    />
                  </Card>

                  <Button
                    className="create-mission-proceed-button"
                    type="primary"
                    // onClick={() => nextStage()}
                    onClick={() => {
                      handleCancel2();
                      if (selectedKey == 1) showModal();
                      else if (selectedKey == 2) setIsModalVisible3(true);
                    }}
                    disabled={!selectedKey}
                  >
                    Next
                  </Button>
                </Col>
              </Row>
            </Modal>

            <Modal
              title="Upload Layer"
              open={isModalVisible}
              onCancel={handleCancel}
              footer={null}
              width={700}
            >
              <Form
                name="upload2"
                onFinish={onFinish}
                layout="vertical"
                form={form}
              >
                <Row style={{ paddingLeft: "10px", paddingRight: "5px" }}>
                  <Alert
                    style={{ width: "100%" }}
                    message="Please note!"
                    description={`Make sure that your geojson file has the "color" attribute in each feature, in order to inherit colors`}
                    type="info"
                    banner
                    showIcon
                  />
                </Row>
                <Row>
                  <Col span={14} style={{ padding: "10px" }}>
                    <Form.Item label="Name" name="name">
                      <Input
                        placeholder="Layer's Name"
                        onChange={(e) => {
                          setLayerName(e.target.value);
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="Layer Type" name="type">
                      <TreeSelect
                        showSearch
                        style={{ width: "100%" }}
                        dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                        placeholder="Select Layer Type"
                        allowClear
                        treeData={options}
                        onChange={changeLayerType}
                      />
                    </Form.Item>
                    <Row>
                      <Form.Item label="Capture Date" name="date">
                        <DatePicker
                          format={"YYYY/MM/DD HH:mm"}
                          onChange={(value: any) => {
                            setCaptureDate(value.toISOString(true));
                          }}
                        />
                      </Form.Item>
                    </Row>
                    <Row>
                      <Form.Item label="Icon" name="icon">
                        <TreeSelect
                          showSearch
                          style={{ width: "150%" }}
                          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                          placeholder="Select Icon"
                          placement="bottomLeft"
                          defaultValue={"MarkerIcon"}
                          treeData={iconOptions}
                          onChange={(value) => setIcon2(value)}
                          treeIcon={true}
                        />
                      </Form.Item>
                    </Row>
                    <Row>
                      <Alert
                        style={{ width: "100%" }}
                        message={`Only .geojson and .kml files support for type "Vector" and .tif or .laz for type "Raster"`}
                        type="info"
                        showIcon
                      />
                      <Form.Item label="Upload File" name="file">
                        <Upload {...uploadProps}>
                          <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>

                        {uploading ? (
                          <Progress strokeLinecap="square" percent={Math.floor(progress)} />
                        ) : null}
                      </Form.Item>
                    </Row>
                  </Col>
                  <Col span={10} style={{ padding: "5px" }}>
                    {showColorPicker && (
                      <Row>
                        <SketchPicker
                          color={layerColor}
                          onChangeComplete={(color) => setLayerColor(color.hex)}
                        />
                      </Row>
                    )}
                    <Row style={{ paddingLeft: "2rem" }}>
                      <p>
                        Inherit color&nbsp;&nbsp;&nbsp;
                        <Switch onChange={onChangeInherit} />
                      </p>
                    </Row>
                  </Col>
                </Row>
              </Form>
              <Row>
                <Col span={24} className="modal-footer">
                  <Button
                    style={{ marginRight: "10px" }}
                    onClick={() => handleCancel()}
                  >
                    Cancel
                  </Button>
                  {!uploading ? (
                    <Button type={"primary"} onClick={() => createLayer()}>
                      Save
                    </Button>
                  ) : (
                    <Button type={"primary"} loading>
                      Loading
                    </Button>
                  )}
                </Col>
              </Row>
            </Modal>
            <CreateLayer
              isModalVisible={isModalVisible3}
              setVisbible={setIsModalVisible3}
              missionId={id}
              addLayer={addLayer}
              status={pic2Mapv2Status}
              setStatus={setPic2Mapv2Status}
              data={pic2Mapv2Data}
              isBaseMap={props.isBaseMap}
            />
            <CreateBaseLayer
              isModalVisible={isModalVisible4}
              // handleCancel={() => setIsModalVisible4(false)}
              isUpdate={isUpdate}
              updateType={updateType}
              BaseLayerId={updateId}
              setShow={setIsModalVisible4}
              addLayer={addLayer}
              updateLayer={updateLayerDataAfterEditing}
              openPic2Mapv2={setIsModalVisible3}
            />

            {showEditModel && (
              <Modal
                title="Edit Layer"
                open={isModalVisible1}
                onOk={handleOk1}
                onCancel={handleCancel1}
                footer={null}
                okText="Save"
                width={600}
              >
                {layerName && captureDate && (
                  <Form
                    name="edit"
                    form={form}
                    onFinish={onFinish1}
                    layout="vertical"
                  >
                    <Row>
                      <Col span={selectedLayerType == "vector" ? 12 : 24}>
                        <Form.Item label="Name" name="name">
                          <Input
                            placeholder="Layer's Name"
                            defaultValue={layerName}
                            onChange={(e) => {
                              setLayerName(e.target.value);
                            }}
                          />
                        </Form.Item>

                        {/* <Form.Item label="Layer Type" name="type"> */}
                        <Cascader
                          style={{ width: "100%" }}
                          defaultValue={
                            defaultLayerType
                              ? defaultLayerType.featureType
                                ? [
                                    defaultLayerType.layerType.toUpperCase(),
                                    defaultLayerType.featureType.toUpperCase(),
                                    defaultLayerType.layerProp.toUpperCase(),
                                  ]
                                : [
                                    defaultLayerType.layerType.toUpperCase(),
                                    defaultLayerType.layerProp.toUpperCase(),
                                  ]
                              : []
                          }
                          options={getEditLayerTypeOptions(defaultLayerType)}
                          placeholder="Select Layer Type"
                          onChange={(value) => {
                            // cascader returns a selection path from the top-most menu item to the bottom-most submenu item
                            // in form of a string array
                            // Here, we have "Vector" or "Raster" as the topmost menu, then for vector we have featureType submenu
                            // and finally at the bottom-most level we have the vectorprops and rasterprops

                            // So, value is a string array, of one of the following formats:
                            // either [ "Vector", (geometry type), <vector prop name> ]
                            // or [ "Raster", <raster prop name> ]
                            const updatedTypeId = [...value].reverse()[0];
                            setLayerProp(
                              updatedTypeId as vectorProps | rasterProps
                            );
                          }}
                        />
                        {/* </Form.Item> */}

                        <Form.Item label="Capture Date" name="date">
                          <DatePicker
                            defaultValue={moment(captureDate, "YYYY-MM-DD")}
                            onChange={(value: any) => {
                              setCaptureDate(
                                moment(value).format(
                                  "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
                                )
                              );
                            }}
                          />
                        </Form.Item>

                        <Form.Item label="Icon" name="icon">
                          <TreeSelect
                            showSearch
                            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                            placeholder="Select Icon"
                            placement="bottomLeft"
                            defaultValue={icon2}
                            treeData={iconOptions}
                            onChange={(value) => setIcon2(value)}
                            treeIcon={true}
                          />
                        </Form.Item>
                      </Col>
                      {selectedLayerType == "vector" ? (
                        <Col span={selectedLayerType == "vector" ? 12 : 0}>
                          <SketchPicker
                            color={layerColor}
                            onChangeComplete={(color) =>
                              setLayerColor(color.hex)
                            }
                          />
                          {/* <Button
                          style={{
                            marginTop: "10px",
                            float: "right",
                            marginRight: "10px",
                          }}
                          type="primary"
                          size="small"
                          onClick={changeColor}>
                          Change Color
                        </Button> */}
                        </Col>
                      ) : null}
                    </Row>

                    <Button type="primary" onClick={editLayer}>
                      Save
                    </Button>
                  </Form>
                )}
              </Modal>
            )}
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
              checkedKeys={(() => {
                const checked = AllLayers.filter(
                  (layer) => layer._isChecked
                ).map((layer) => layer._id);
                if (MissionLayers.isAlertChecked) checked.push("alert");
                if (MissionLayers.isVODChecked) checked.push("vod");
                return checked;
              })()}
              onSelect={onSelect}
              selectedKeys={selectedKeys}
              treeData={ILayersToTree(
                AllLayers,
                getTitleElement,
                getGroupTitleElement,
                renderRangePicker,
                sortType,
                isAscending
              )}
              onDrop={onDrop}
              draggable={(node: any) => {
                if (
                  node.key === "1" ||
                  node.key === "2" ||
                  node.key === "3" ||
                  node.key === "3-1"
                )
                  return false;
                return true;
              }}
              blockNode
            />
          </div>
          {/* <Button onClick={() => setIsModalVisible4(true)}>new</Button> */}
        </div>
      )}
      <Suspense
        fallback={
          <div className="example">
            <Space size="middle">
              <Spin size="large" />
            </Space>
          </div>
        }
      >
        {digitizer && (
          <SvgToGeojson
            deckRef={deckRef}
            onValueChange={handleChildValueChange}
            fileUpload={handleFileUpload}
          />
        )}
      </Suspense>
      <div
        className="bottom-bar"
        style={{
          height: bottomBarHeight,
          display: panes.length ? "initial" : "none",
        }}
      >
        <Tabs
          style={{ height: "100%" }}
          type="editable-card"
          onChange={(activeKey) => {
            setActiveKey(activeKey);
          }}
          activeKey={activeKey}
          onEdit={(targetKey, action) => {
            if (action == "remove") remove(targetKey);
          }}
          onTabClick={() => {
            setSelectedIndexes([]);
            setDefaultKeys([]);
          }}
          items={
            panes.length > 0 &&
            panes.map((pane) => {
              return {
                key: pane.key,
                label: (
                  <span>
                    {pane?.title}{" "}
                    <Badge
                      size="small"
                      count={pane.count}
                      overflowCount={overflowCount(pane.count)}
                      style={{
                        backgroundColor: "#52c41a",
                        marginLeft: "2px",
                        display: pane.type == "vector" ? "inherit" : "none",
                      }}
                    />
                  </span>
                ),
                children: (
                  <MapAttributes
                    type={pane.type}
                    id={pane.id}
                    path={pane.path}
                    bottomBarHeight={bottomBarHeight}
                    featureCount={pane.count}
                    setViewport={setViewport}
                    setColorMap={SetColorMap}
                    setOverlayID={setOverlayID}
                    setTerrainMap={setTerrainMap}
                    setSelectedIndexes={setSelectedIndexes}
                    setSelectedFeatures={setSelectedFeatures}
                    setshowSelectedIndexes={setshowSelectedIndexes}
                    selectedIndexes={selectedIndexes}
                    setKey={setKey}
                    defaultKeys={defaultKeys}
                    setShouldAttributeTableReload={
                      setShouldAttributeTableReload
                    }
                    shouldAttributeTableReload={shouldAttributeTableReload}
                    canEditGeojson={perms.canEditGeojson}
                    canDeleteFeature={perms.canDeleteFeature}
                    updateFeatureCountInLayers={updateFeatureCountInLayers}
                    flaggedFilter={flaggedFilter}
                    unflaggedFilter={unflaggedFilter}
                    AllLayers={AllLayers}
                    refreshLayer={refreshLayer}
                    setRefreshLayer={setRefreshLayer}
                    invertColor={invertColor}
                    handleMeshSourceOption={handleMeshSourceOption}
                    refreshVectorLayers={refreshVectorLayer}
                  />
                ),
                closeable: true,
              };
            })
          }
          //onEdit={(targetKey) => remove(targetKey)}
          //onClick={() => console.log(activeKey)}
          hideAdd
          tabBarExtraContent={
            <div>
              {/* -------------Export Option---------------------------- */}
              <Dropdown
                menu={{
                  items: actionMenuItems,
                  onClick: actionMenuOnClick,
                }}
                placement="bottom"
              >
                <Button
                  style={{ display: activeType ? "inline" : "none" }}
                  type="link"
                >
                  Actions <DownOutlined />
                </Button>
              </Dropdown>
              <Dropdown
                menu={{
                  items: filterItems,
                  selectable: true,
                  className: "filter-item",
                  onClick: filterOnClick,
                }}
                placement="bottom"
              >
                <Button
                  type="text"
                  className={
                    flaggedFilter || unflaggedFilter
                      ? "filter-btn-selected"
                      : ""
                  }
                  icon={<FilterOutlined />}
                ></Button>
              </Dropdown>
              {/* -------------------Maximise Button------------------- */}
              <Button
                type="text"
                onClick={() => {
                  const pr = window.devicePixelRatio;
                  const height = window.screen.height;
                  console.log(height);
                  if (height >= 1080) {
                    setBottomBarHeight("900px");
                  } else if (height >= 768) {
                    setBottomBarHeight("700px");
                  } else if (height >= 720) {
                    if (pr === 1.5) {
                      setBottomBarHeight("540px"); ///-----------adjust height
                    } else {
                      setBottomBarHeight("700px"); ///-----------adjust height
                    }
                  }
                }}
                icon={<SwitcherOutlined />}
              />
              {/* ---------- Arrow minimise button------------------ */}
              <Button
                type="text"
                onClick={() => {
                  if (isMinimise) {
                    const pr = window.devicePixelRatio;
                    const height = window.screen.height;
                    if (height >= 1080) {
                      setBottomBarHeight("480px");
                    } else if (height >= 768) {
                      setBottomBarHeight("240px");
                    } else if (height >= 720) {
                      setBottomBarHeight("240px");
                    }
                    setMinimise(false);
                  } else {
                    setBottomBarHeight("70px");
                    setMinimise(true);
                  }
                }}
                icon={
                  bottomBarHeight === "70px" ? <UpOutlined /> : <DownOutlined />
                }
              />
            </div>
          }
        ></Tabs>
      </div>
      {showForm && (
        <VectorForm
          visible={formDrawerVisible}
          setVisible={setformDrawerVisible}
          mode={drawMode ? drawMode : "PolygonView"}
          vectorLayers={vectorLayers}
          features={featureState}
          missionId={id}
          loading={setLoading}
          isBaseMap={props.isBaseMap}
          setIsDrawing={setIsDrawing}
          forceUpdateLayers={forceUpdateLayers}
          setShowForm={setShowForm}
          addLayer={addLayer}
          updateLayerDataAfterEditing={updateLayerDataAfterEditing}
          setShouldAttributeTableReload={setShouldAttributeTableReload}
          shouldAttributeTableReload={shouldAttributeTableReload}
        />
      )}
      <Media
        setVisibility={setViewMedia}
        visible={viewMedia}
        layerId={featureLayer}
        featureIndex={sysId}
        feature={featureData}
        videoToShow={videoToShow}
        coordinates={coordinates}
        canUpload={perms.canUploadFileToGeojson}
        canDelete={perms.canDeleteFileFromGeojson}
        canSetCoverPhoto={perms.canSetCoverPhoto}
        layerLabel={selectedLayerLabel}
        canUploadToBaseLayer={perms.canUploadToBaseLayer}
        isBaseMap={props.isBaseMap}
        dateRange={dateRange}
        videoDetails={videoDetails}
        showCarousel={showCarousel}
        setShowCarousel={setShowCarousel}
        updateVOD={updateVOD}
        updateVODs={updateVODs}
        setShowFlightPath={setShowFlightPath}
        setSrtVideoPath={setSrtVideoPath}
        setThumbnail={setThumbnail}
        setThreadDetails={setThreadDetails}
      />
      <LayerDocs
        setVisibility={setViewDocs}
        visible={viewDocs}
        layerId={featureLayer}
        title={windowTitle}
        set3Dstate={set3DState}
        layerData={selectedLayerInfo}
        canUpload={perms.canUploadFileToGeojson}
        canDelete={perms.canDeleteFileFromGeojson}
        isBaseMap={props.isBaseMap}
        canUploadToBaseLayer={perms.canUploadToBaseLayer}
        canUpdateBaseLayer={perms.canUpdateBaseLayer}
        canEditLayer={perms.canEditLayer}
        canUploadFileToGeojson={perms.canUploadFileToGeojson}
        setViewport={setViewport}
        layer={AllLayers.find((layer) => layer._id === featureLayer)}
        layerPath={featureLayerPath}
        layerLabel={selectedLayerLabel}
        updateLayerDataAfterEditing={updateLayerDataAfterEditing}
        renderLayerDocs={setIsLayerDocs}
        isRenderContent={isLayerDocs}
        setSelectedLayerLabel={setSelectedLayerLabel}
        layerPopupLabel={selectedLayerPopupLabel}
        setSelectedLayerPopupLabel={setSelectedLayerPopupLabel}
        missionId={id}
        picToMapData={picToMapData}
        setPicToMapData={setPicToMapData}
      />

      <Modal
        title="Change Color"
        open={showColorChangeForm}
        width={"300px"}
        bodyStyle={{ paddingLeft: 10 }}
        onOk={() => {
          editFeature(
            colorChangeFeatureData.object,
            color,
            colorChangeFeatureData.index
          );
        }}
        onCancel={() => setShowColorChangeForm(false)}
      >
        <div style={{ width: "250px" }}>
          <SketchPicker
            color={color}
            onChangeComplete={handleChangeComplete}
            onChange={handleChange}
          />
        </div>
      </Modal>

      <Modal
        title="Group Layers"
        open={visibleGroupCreateModal}
        onCancel={() => {
          setVisibleGroupCreateModal(false);
        }}
        footer={null}
      >
        <div style={{ marginTop: "20px" }}>{creteNewGroupCard()}</div>
      </Modal>

      <Modal
        title="Select Group"
        open={moveToOtherGroupModal}
        onCancel={() => {
          setMoveToOtherGroupModal(false);
        }}
        footer={null}
      >
        <div style={{ marginTop: "20px" }}>{moveToGroupForm()}</div>
      </Modal>

      {visibleEditModal && groupName && (
        <Modal
          title="Edit Group"
          open={visibleEditModal}
          onOk={() => { }}
          onCancel={() => {
            setVisibleEditModal(false);
          }}
          footer={null}
        >
          <Form name="basic" autoComplete="off" form={editForm}>
            <Form.Item
              label="Group Name"
              name="name"
              rules={[{ required: true, message: "Please input groupname" }]}
            >
              <Input
                defaultValue={groupName}
                onChange={(e) => setgroupName(e.target.value)}
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
              <Button
                onClick={() => {
                  editGroup({
                    name: groupName,
                    id: groupToEdit.id,
                    layers: [],
                  });
                }}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}

      {scaleVisible && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "120px",
            width: "200px",
          }}
        >
          {scales.map((scale) => (
            <div
              style={{
                position: "relative",
                width: "200px",
                height: "100px",
                marginBottom: "20px",
              }}
            >
              {!props.isBaseMap ? (
                <Colorscale
                  settings={{
                    minp: scale.minp,
                    maxp: scale.maxp,
                  }}
                  name={scale.name}
                  colorMap={colorMap}
                />
              ) : (
                <></>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BaseMap;
