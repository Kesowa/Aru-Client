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
  Popover,
  InputNumber,
  UploadProps,
} from "antd";
import {
  UploadOutlined,
  DoubleRightOutlined,
  FileAddOutlined,
  FileImageOutlined,
  DoubleLeftOutlined,
  EnvironmentOutlined,
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
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
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
import { BitmapLayer, IconLayer, PathLayer, SolidPolygonLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { HTMLOverlayItem, HTMLOverlay } from "../shared/HTMLOverlay";
import {
  DrawPolygonMode,
  CompositeMode,
  ModifyMode,
  ViewMode,
  DrawLineStringMode,
  DrawPointMode,
  GeoJsonEditMode,
  EditableGeoJsonLayer,
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
import io from "src/services/socketConnect";
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
import { BBox, Feature } from "src/types/geojson";
import { invertColor } from "./colorUtils";
import { featureType, featureTypes, vectorProps } from "src/static/vectorprops";
import { defaultRasterSettings, rasterProps } from "src/static/rasterprops";
import {
  ILayerTypeDetails,
  getEditLayerTypeOptions,
  options,
} from "./utils/propUtils";
import Tileset from "src/types/cesium_tileset";
import { DocModel, uploadFile } from "src/services/fileUpload";
import { PERMS } from "src/static/permissions";
import FourOhOne from "../shared/Error/FourOhOne";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "../shared/Loader";
import { ThreadContext } from "src/services/threadUtils";
import ElevationBlock, {valueChangeEmitter} from "./utils/elevationTooltip";
import axios from "axios";
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
  const [thumbnail, setThumbnail] = useState("");
  const [threadDetails, setThreadDetails] = useState({});
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
  const [vectorSubtype, setVectorSubtype] = useState<string | null>(null);
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [activeEyeIconLayerId, setActiveEyeIconLayerId] = useState<string | null>(null);
  const [activeEditIconLayerId, setActiveEditIconLayerId] = useState<string | null>(null);
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
      canCreateLayer: Auth.userdetails.customPermissions.includes(
        PERMS.UPLOAD_LAYER
      ),
      canDeleteLayer: Auth.userdetails.customPermissions.includes(
        PERMS.DELETE_LAYER
      ),
      canEditLayer: Auth.userdetails.customPermissions.includes(
        PERMS.EDIT_LAYER
      ),
      canDownloadLayer: true,
      canEditGeojson: Auth.userdetails.customPermissions.includes(
        PERMS.EDIT_FEATURE
      ),
      canDeleteFeature: Auth.userdetails.customPermissions.includes(
        PERMS.DELETE_FEATURE
      ),
      canAddFeature: Auth.userdetails.customPermissions.includes(
        PERMS.ADD_FEATURE
      ),
      canUploadFileToGeojson: Auth.userdetails.customPermissions.includes(
        PERMS.FEATURE_FILE_UPLOAD
      ),
      canDeleteFileFromGeojson: Auth.userdetails.customPermissions.includes(
        PERMS.FEATURE_FILE_DELETE
      ),
      canSetCoverPhoto: Auth.userdetails.customPermissions.includes(
        PERMS.SET_COVER_PHOTO
      ),
      canCreateBaseLayer: Auth.userdetails.customPermissions.includes(
        PERMS.CAN_CREATE_BASE_LAYER
      ),
      canUpdateBaseLayer: Auth.userdetails.customPermissions.includes(
        PERMS.CAN_UPDATE_BASE_LAYER
      ),
      canDeleteBaseLayer: Auth.userdetails.customPermissions.includes(
        PERMS.CAN_DELETE_BASE_LAYER
      ),
      canEditBaseLayer: Auth.userdetails.customPermissions.includes(
        PERMS.CAN_EDIT_BASE_LAYER
      ),
      canUploadToBaseLayer: Auth.userdetails.customPermissions.includes(
        PERMS.CAN_UPLOAD_TO_BASE_LAYER
      ),
    });
  }, []);

  const socket: any = useRef();
  const [ExpiryModal, setExpiryModal] = useState(false);
  const [LimitModal, setLimitModal] = useState(false);
  const [osmState, setOsmState] = useState(false);
  const defaultLocation = {
    lat: 22.571194159512256,
    lng: 88.49175358524279,
  };
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
                  transitionInterpolator: new TransitionInterpolator(),
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
    if (file) {
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
    };
    valueChangeEmitter.on("valueChanged", handleValueChange);
    return () => {
      valueChangeEmitter.off("valueChanged", handleValueChange);
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
      autoHighlight: false,
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
        ];
      },
    }),
  ];
  const [showPopup, togglePopup] = useState(false);
  useEffect(() => console.log("SHOW_POPUP: ", showPopup), [showPopup]);
  const [featureData, setFeatureData] = useState<any>([]);
  const [sysId, setSysId] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [sideBarState, setSideBarState] = useState(true);
  const [sideBarIcon, setSideBarIcon] = useState(<DoubleRightOutlined />);
  const [mapMode, setMapMode] = useState("mapbox://styles/mapbox/streets-v8");
  const [isModalVisible, setIsModalVisible] = useState(false); // upload layer
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false); // upload layer modal
  const [isModalVisible3, setIsModalVisible3] = useState(false); // create layer modal
  const [isModalVisible4, setIsModalVisible4] = useState(false); // create base layer modal
  const [timeFilter, setTimeFilter] = useState(false);
  const [bottomBarHeight, setBottomBarHeight] = useState("240px");
  const [layerColor, setLayerColor] = useState("#ffaa00");
  const [fileList, setFileList] = useState<any>([]);
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
  const [showColorPicker, setshowColorPicker] = useState(true);
  const [layerLoading, setLayerLoading] = useState(false);
  const [threeDState, set3DState] = useState("");
  const [picToMapData, setPicToMapData] = useState([]);
  const [pic2Mapv2Status, setPic2Mapv2Status] = useState(false);
  const [pic2Mapv2Data, setPic2Mapv2Data] = useState<any>({});
  const [isLayerDocs, setIsLayerDocs] = useState(false);
  const [isUpdate, setUpdate] = useState(false);
  const [updateType, setUpdateType] = useState("");
  const [updateId, setUpdateId] = useState("");
  const [pointMarkerSize, setPointMarkerSize] = useState(1);
  const showMarkerSizeTool = false;
  const [iconOptions, setIconOptions] = useState([]);
  const [icon2, setIcon2] = useState<string | undefined>(undefined);
  const [loadIcons, setLoadIcons] = useState(false);

  useEffect(() => {
    if (iconOptions.length > 0 && !icon2) {
      setIcon2(`${iconOptions[0].image}`);
    }
  }, [iconOptions]);
  
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
  const id = rawId.split("-").reverse()[0];

  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
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
  const handleDelete = (iconId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this icon?",
      onOk: async () => {
        try {
          const res = await http.delete(`${API_URL}${apis.DELETE_ICON.replace(":iconID", iconId)}`);
          if (res.status === 200) {
            message.success("Icon deleted successfully");
            setLoadIcons(prev => !prev);
          } else {
            message.error("Failed to delete icon");
          }
        } catch (error) {
          message.error("Error deleting icon");
          console.error("Delete icon error:", error);
        }
      },
    });
  };
  
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const res = await http.get(`${API_URL}${apis.GET_ICONS}`);

        console.log("data : ",res);
        const icons = res.data?.data || [];
  
        const formattedIcons = icons.map((icon: any) => ({
          value: icon._id,
          title: icon.name,
          icon: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <img
                  src={`${STATIC_URL}${icon.image}`}
                  alt={icon.name}
                  style={{ width: "20px", height: "20px", flexShrink: 0 }}
                />
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  {icon.name}
                </span>
              </div>
        
              <DeleteOutlined
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(icon._id);
                }}
                style={{ color: "red", marginLeft: "12px", cursor: "pointer", flexShrink: 0 }}
              />
            </div>
          ),
          image: icon.image,
        }));
  
        setIconOptions(formattedIcons);
      } catch (err) {
        console.error("Failed to fetch icons", err);
        message.error("Unable to load icons");
      }
    };
  
    fetchIcons();
  }, [loadIcons]);

  const handleIconUpload: UploadProps["customRequest"] = async (options: any) => {
    const { file, onSuccess, onError } = options;
  
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      message.error("Only PNG and JPG images are allowed");
      return onError?.(new Error("Invalid file type"));
    }
  
    try {
      const cancelToken = axios.CancelToken.source();
      const uploadToken = await uploadFile(
        file,
        DocModel.DOCUMENTS,
        (prog) => options.onProgress?.({ percent: prog * 100 }),
        cancelToken.token
      );
      const body = {
        name: file.name.replace(/\.(png|jpg)$/i, ""),
        image: uploadToken,
        description: "",
        tags: [],
      };
  
      const res = await http.post(`${API_URL}${apis.CREATE_ICON}`, body, {
        cancelToken: cancelToken.token,
      });
      const newIcon = res.data?.data;
      setIcon2(newIcon.image);
      form.setFieldsValue({ icon: newIcon.name });

      setLoadIcons(prev => !prev);
      message.success("Image uploaded successfully");
      onSuccess?.(res.data, file);
      console.log(res.data);
  
      return {
        abort() {
          cancelToken.cancel("Image upload cancelled");
        },
      };
    } catch (err: any) {
      console.error("Upload error:", err);
      message.error("Failed to upload image");
      onError?.(err);
    }
  };
  // ----------------------------------------- disable default right click event of browser ----------------------------------------------------------
  useEffect(() => {
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }, []);

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

  // Assigning date range based on mission creation date
  useEffect(() => {
    if (!props.isBaseMap) {
      http.get(`${apis.GET_MISSION_BY_ID}${id}`)
        .then((response) => {
          if (response.data.status) {
            setDateRange([
              moment(response.data.data.createdAt, "YYYY-MM-DD HH:mm").format(),
              dateRange[1],
            ]);
          }
        })
        .catch((error) => console.log("Error while fetching mission: ", error));
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
      ...prev.toSorted((a, b) => {
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
  const [selectedFeatures, setSelectedFeatures] = useState<Feature<any, any>[]>(
    []
  );
  const [showSelectedIndexes, setshowSelectedIndexes] = useState([]);
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
      .then(function (res) {
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
          };
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

  useEffect(() => {
    setScaleData();
    console.log("lost");
  }, [
    AllLayers,
    MissionLayers,
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
  }, [terrainmap, colorMap, layerOpacity]);

  useEffect(() => {
    SetAllLayers((prev) =>
      prev.map((layer) => {
        if (layer._id === featureLayer)
          layer._render3D = threeDState === "Enabled";
        return layer;
      })
    );
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

  // Currently, the functionality to focus on selected layers has been discarded
  // Instead, any layer gets focused on clicking on it's name in the tree menu
  // const focusSelectedLayers = async () => {
  //   const boundingBoxes: BBox[] = [];
  //   for (const layer of AllLayers) {
  //     if (layer._isChecked && layer._metadata?.bounds) {
  //       boundingBoxes.push(layer._metadata.bounds);
  //     }
  //   }
  //   if (MissionLayers.isAlertChecked) {
  //     const { data } = await http.get(
  //       STATIC_URL + MissionLayers.alertGeojsonUrl
  //     );
  //     const { features } = data;
  //     if (Array.isArray(features) && features.length > 0) {
  //       const bounds = turf.bbox(turf.featureCollection(features)) as BBox;
  //       boundingBoxes.push(bounds);
  //     }
  //   }
  //   if (MissionLayers.isVODChecked) {
  //     const { data } = await http.get(STATIC_URL + MissionLayers.vodGeojsonUrl);
  //     const { features } = data;
  //     if (Array.isArray(features) && features.length > 0) {
  //       const bounds = turf.bbox(turf.featureCollection(features)) as BBox;
  //       boundingBoxes.push(bounds);
  //     }
  //   }
  //   if (boundingBoxes.length > 0) {
  //     const finalBounds = mergeBoundingBoxes(boundingBoxes);
  //     const { longitude, latitude, zoom } = calculateViewport(finalBounds);
  //     setViewport({
  //       longitude /* : (bounds[0][0] + bounds[1][0]) / 2 */,
  //       latitude /* : (bounds[0][1] + bounds[1][1]) / 2 */,
  //       zoom,
  //       pitch: 0,
  //       minZoom: 0,
  //       maxZoom: 22,
  //       bearing: 0,
  //       transitionDuration: 2000,
  //       transitionInterpolator: new FlyToInterpolator(),
  //     });
  //   }
  // };

  // Linear interpolation function (replace with your logic)
  // const linearInterpolation = (rgbValues) => {
  //   console.log("DeckGL Canvas Class Name:");
  //   // Your linear interpolation logic here
  //   // For example, average of the RGB values
  //   const averageValue = (rgbValues[0] + rgbValues[1] + rgbValues[2]) / 3;
  //   return averageValue;
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

  const onCheck = async (checkedKeysValue: any, e) => {

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

    setIsDrawing(true);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setFeatureState(myFeatureCollection);

    setMode({
      mode: ViewMode,
    });

    togglePopup(false);
    setShowForm(false);
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    setSelectedKeys(selectedKeysValue);
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

  const handleMeshSourceOption = (id: string) => {
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
  };

  const toggleElevation = () => {
    setIsElevationEnabled((prevValue) => !prevValue);
    console.log(
      "Elevation toggled successfully. New state:",
      isElevationEnabled
    );
  };

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
                // window.open(PUBLIC_URL + res.data.link);
                notification.success({
                  message: "Layer downloaded successfully.",
                  description:
                    "Check out in document section.",
                });
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
    let nameTextWidth: string;
    if (layer.type === "Raster") {
      nameTextWidth = layer.layerGroupId ? "139px" : "160px";
    } else {
      nameTextWidth = layer.layerGroupId ? "119px" : "140px";
    }
    const bulkActionsMenu: MenuProps = {
      onClick: treeMenuOnClick,
      items: [
        {
          key: "7",
          label: "Group Selected Layers",
        },
        {
          key: "8",
          label: "Delete Selected Layers",
        },
        {
          key: "9",
          label: "Move Selected Layers",
        },
      ],
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
              style={{ width: nameTextWidth }}
              ellipsis={true}
              onClick={() => {
                if (layer._isChecked && layer._metadata?.bounds) {
                  const { longitude, latitude, zoom } = calculateViewport(
                    layer._metadata.bounds
                  );
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
              // onDoubleClick={() => {
              //   if (!props.isBaseMap || layer.type === "Vector") {
              //     setlayerToAddInAttributeTable({
              //       name: layer.name,
              //       type: layer.type,
              //       id: layer._id,
              //       path: layer.layerpath,
              //       count: layer.featureCount,
              //     });
              //   }
              // }}
            >
              {layer.name}
            </Text>

            <Tooltip>
              <EyeOutlined
                style={{
                  marginLeft: "-10px",
                  opacity: activeEyeIconLayerId === layer._id ? 1 : 0.6,
                  color:
                    activeEyeIconLayerId === layer._id ? "#3b86ff" : "inherit",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!props.isBaseMap || layer.type === "Vector") {
                    setlayerToAddInAttributeTable({
                      name: layer.name,
                      type: layer.type,
                      id: layer._id,
                      path: layer.layerpath,
                      count: layer.featureCount,
                    });
                  }
                  setActiveEyeIconLayerId(layer._id);
                  setTimeout(() => {
                    setActiveEyeIconLayerId(null);
                  }, 7000);
                }}
              />
            </Tooltip>
            <Tooltip title="Edit Layer">
              <EditOutlined
                style={{
                  marginLeft: "5px",
                  opacity: activeEditIconLayerId === layer._id ? 1 : 0.6,
                  color:
                    activeEditIconLayerId === layer._id ? "#3b86ff" : "inherit",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={(e) => {
                  if (props.isBaseMap ? perms.canEditBaseLayer : perms.canEditLayer) {
                      e.stopPropagation();
                      const type = layer.type;

                      showModal1();
                      setSelectedLayerId(layer._id);
                      setCaptureDate(layer.captureDate);
                      setLayerName(layer.name);
                      setDefaultLayerType({
                        layerType: type,
                        layerProp: type === "Vector" ? layer.vector : layer.raster,
                        featureType:
                          type === "Vector" ? featureType[layer.vector] : null,
                      });
                      setSelectedLayerType(type.toLowerCase());

                      setActiveEditIconLayerId(layer._id);
                      setTimeout(() => {
                        setActiveEditIconLayerId(null);
                      }, 7000);
                  }
                }}
              />
            </Tooltip>
            <Dropdown menu={bulkActionsMenu} trigger={["click"]}  placement="topRight" >
            <Tooltip title="Selected">
              <MoreOutlined
                style={{
                  marginLeft: "3px",
                  cursor: "pointer",
                  opacity: 0.7,
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Dropdown>
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
                  return <p key={window.crypto.randomUUID()}>{layer.name}</p>;
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

  useEffect(() => {
    if (!thread.open) {
      setRefreshLayer(!refreshLayer);
    }
  }, [thread.open]);

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
      setTabKeys((prev) => [...prev, id]);
      setPanes((prev) => [
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
      const subtype = featureType[value as keyof typeof featureType];
      setVectorSubtype(subtype); 
    } else if (Object.values(rasterProps).includes(value as rasterProps)) {
      setshowColorPicker(false);
      setLayerType("Raster");
      setLayerProp(value as rasterProps);
      setVectorSubtype(null);
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

      let docModel: DocModel;
      if (layerType === "Vector") docModel = DocModel.VECTOR;
      else if (layerType === "Raster") docModel = DocModel.RASTER;
      else docModel = DocModel.LAYER_FILES;
      
      const uploadToken = await uploadFile(fileList[0], docModel, (prog) => {
        console.info("PROGRESS: " + prog);
        setProgress(prog * 100);
      });

      const body = {
        file: uploadToken,
        missionId: id,
        captureDate: captureDate,
        name: layerName,
        type: layerType,
        color: layerColor,
        inHeritOriginalColorFromFile: inheritColor,
        icon: icon2,
        ...(layerType === "Vector" ? { vector: layerProp, styling: properties } : {}),
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

      const result = await http.post(`${apis.CREATE_LAYER}/${layerType}`, body);
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

        let fLat: any = 0;
        let fLng: any = 0;

        if (mode.mode === DrawPolygonMode) {
          modee = "PolygonView";

          for (const element of updatedData.features[0].geometry.coordinates[0]) {
            fLng += element[0];
          }
          fLng = fLng / updatedData.features[0].geometry.coordinates[0].length;
          for (const element of updatedData.features[0].geometry.coordinates[0]) {
            fLat += element[1];
          }
          fLat = fLat / updatedData.features[0].geometry.coordinates[0].length;
          centerPoint = [fLng, fLat];
        } else if (mode.mode === DrawLineStringMode) {
          modee = "LineView";

          for (const element of updatedData.features[0].geometry.coordinates) {
            fLng += element[0];
          }
          fLng = fLng / updatedData.features[0].geometry.coordinates.length;
          for (const element of updatedData.features[0].geometry.coordinates) {
            fLat += element[1];
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
          setIcon2(iconOptions?.[0]?.value ?? null);
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

  const [toolCoordinates, settoolCoordinates] = useState([0, 0]);
  const drawingMenuRef: any = useRef<HTMLElement>();

  //---------------Handle map modes-------------------------------
  function handleMapMode(value) {
    if (value === "osm") {
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
  const [visibleGroupCreateModal, setVisibleGroupCreateModal] = useState(false);
  const [moveToOtherGroupModal, setMoveToOtherGroupModal] = useState(false);
  const [moveType, setMoveType] = useState(1);
  const [groupForm] = Form.useForm();
  const [toGroupForm] = Form.useForm();
  const [editForm] = Form.useForm();

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
              {groups.map((group) => {
                return (
                  <Option value={group.id} key={window.crypto.randomUUID()}>
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
    );
  };

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

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

  if (
    props.isBaseMap &&
    !["tenant-root", "tenant-staff"].includes(Auth.userdetails.userType)
  ) {
    return <FourOhOne />;
  }

  const memoizedAllLayers = useMemo(
    () => ILayerToDeckLayer(AllLayers),
    [AllLayers]
  );
  const memoizedMissionLayers = useMemo(
    () => MissionLayerToDeckLayer(MissionLayers),
    [MissionLayers]
  );
  const computeLayers = () => {
    const layers: any[] = [];

    // OSMState Layers
    if (osmState) layers.push(osm);


    // Tree Menu Layers
    layers.push(memoizedAllLayers);
    layers.push(memoizedMissionLayers);

    // Drawing State Layers
    if (isDrawing) {
      layers.push(drawPolygonTool);
    } else {
      layers.push(maskLayer);
    }

    if (digitizer) layers.push(digitizerLayer);

    return layers;
  };

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
        onDrag={() => {}}
        onClick={(info, event) => {
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
              settoolCoordinates([
                event.offsetCenter.x,
                event.offsetCenter.y - 50,
              ]);
              drawingMenuRef.current.click();
            }
          } else if (info.layer) {
            const layer = AllLayers.find(
              (layer) => layer.type === "Vector" && info.layer?.id === layer._id
            );
            if (layer) {
              InfoWindow(
                info.index,
                info.coordinate,
                layer.name,
                featureType[layer.vector] === featureTypes.POINT
                  ? "PointView"
                  : "PolygonView",
                info.object,
                false,
                layer._id,
                info.object.properties.sys_id,
                "Vector"
              );
              setSelectedLayerLabel(
                layer.layerLabel ? layer.layerLabel : "No label selected"
              );
              setSelectedLayerPopupLabel(
                layer.layerPopupLabel
                  ? layer.layerPopupLabel
                  : "No label selected"
              );
            }
          }
        }}
        //getTooltip={({object}) => object && (object.properties.Block_Nm)}
      >
        <ElevationBlock
          hoverInfo={hoverInfo}
          isElevationEnabled={isElevationEnabled}
        />

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

        {showPopup && (
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

      {/* DRAWING TOOLS (always shown) */}
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
              <Tooltip title="digitize image to map" placement="bottom">
                <div
                  className="time-filter-tool"
                  onClick={() => setDigitizer((digitizer) => !digitizer)}
                >
                  <Text strong>Digitizer</Text>
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
                {!props.isBaseMap ? (
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
                    key={window.crypto.randomUUID()}
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
                    key={window.crypto.randomUUID()}
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
                    key={window.crypto.randomUUID()}
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
                    className={`create-mission-extended-card ${
                      selectedKey == 1
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
                    className={`create-mission-extended-card ${
                      selectedKey == 2
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
                onValuesChange={(changedValues, allValues) => {
                  const relevantKeys = [
                    "lineStyle",
                    "fill",
                    "texture",
                    "opacity",
                    "borderStyle",
                  ];

                  const updatedProperties: Record<string, any> = {};
                  for (const key of relevantKeys) {
                    const value = allValues[key];
                    if (value !== undefined && value !== "") {
                      updatedProperties[key] = String(value);
                    }
                  }

                  const widthValue = allValues.lineWidthValue;
                  const widthUnit = allValues.lineWidthUnit;
                  if (widthValue !== undefined && widthUnit) {
                    updatedProperties.lineWidth = `${widthValue}${widthUnit}`;
                  }

                  const borderValue = allValues.borderWidthValue;
                  const borderUnit = allValues.borderWidthUnit;
                  if (borderValue !== undefined && borderUnit) {
                    updatedProperties.borderWidth = `${borderValue}${borderUnit}`;
                  }

                  setProperties(updatedProperties);
                }}
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
                    {layerType === "Vector" &&
                      vectorSubtype === featureTypes.MULTI_LINE_STRING && (
                        <>
                          <Form.Item label="Line Style" name="lineStyle">
                            <Select placeholder="Select line style">
                              <Select.Option value="solid">Solid</Select.Option>
                              <Select.Option value="dashed">
                                Dashed
                              </Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item label="Line Width">
                            <Input.Group compact>
                              <Form.Item
                                name="lineWidthValue"
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: "Please input line width!",
                                  },
                                ]}
                              >
                                <InputNumber
                                  min={1}
                                  max={100}
                                  style={{ width: "50%" }}
                                  placeholder="Width"
                                />
                              </Form.Item>
                              <Form.Item
                                name="lineWidthUnit"
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: "Please select unit!",
                                  },
                                ]}
                                initialValue="pixels"
                              >
                                <Select style={{ width: "30%" }}>
                                  <Select.Option value="pixels">
                                    pixels
                                  </Select.Option>
                                  <Select.Option value="meters">
                                    meters
                                  </Select.Option>
                                </Select>
                              </Form.Item>
                            </Input.Group>
                          </Form.Item>
                        </>
                      )}

                    {layerType === "Vector" &&
                      vectorSubtype === featureTypes.MULTI_POLYGON && (
                        <>
                          <Form.Item label="Fill" name="fill">
                            <Input type="color" />
                          </Form.Item>
                          <Form.Item label="Texture" name="texture">
                            <Input placeholder="Enter texture URL or ID" />
                          </Form.Item>
                          <Form.Item label="Opacity" name="opacity">
                            <InputNumber min={0} max={1} step={0.1} />
                          </Form.Item>
                          <Form.Item label="Border Width">
                            <Input.Group compact>
                              <Form.Item
                                name="borderWidthValue"
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: "Enter border width!",
                                  },
                                ]}
                              >
                                <InputNumber
                                  min={0}
                                  max={100}
                                  style={{ width: "50%" }}
                                />
                              </Form.Item>
                              <Form.Item
                                name="borderWidthUnit"
                                noStyle
                                rules={[
                                  { required: true, message: "Select unit!" },
                                ]}
                                initialValue="pixels"
                              >
                                <Select style={{ width: "30%" }}>
                                  <Select.Option value="pixels">pixels</Select.Option>
                                  <Select.Option value="meters">
                                    meters
                                  </Select.Option>
                                </Select>
                              </Form.Item>
                            </Input.Group>
                          </Form.Item>

                          <Form.Item label="Border Style" name="borderStyle">
                            <Select placeholder="Select border style">
                              <Select.Option value="solid">Solid</Select.Option>
                              <Select.Option value="dashed">
                                Dashed
                              </Select.Option>
                              <Select.Option value="dotted">
                                Dotted
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        </>
                      )}
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
                    {layerType === "Vector" &&
                      vectorSubtype === featureTypes.POINT && (
                        <>
                          <Row align="middle" gutter={8}>
                            <Col flex="auto">
                              <Form.Item label="Icon" name="icon">
                                <Select
                                  showSearch
                                  style={{ width: "100%" }}
                                  placeholder="Select Icon"
                                  defaultValue="MarkerIcon"
                                  onChange={(value) => {
                                    const selectedIcon = iconOptions.find(
                                      (icon) => icon.value === value
                                    );
                                    if (selectedIcon) {
                                      setIcon2(`${selectedIcon.image}`);
                                    }
                                  }}
                                  optionLabelProp="label"
                                  filterOption={(input, option) =>
                                    (option?.label as string)
                                      ?.toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                >
                                  {iconOptions.map((icon) => (
                                    <Select.Option
                                      key={icon.value}
                                      value={icon.value}
                                      label={icon.title}
                                    >
                                      {icon.icon}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col style={{ marginTop: "20px" }}>
                              <Tooltip title="Upload custom icons">
                                <Upload
                                  accept=".png,.jpg"
                                  showUploadList={false}
                                  customRequest={handleIconUpload}
                                >
                                  <Button
                                    icon={<UploadOutlined />}
                                    type="default"
                                  >
                                    Upload
                                  </Button>
                                </Upload>
                              </Tooltip>
                            </Col>
                          </Row>
                        </>
                      )}
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
                          <Progress
                            strokeLinecap="square"
                            percent={Math.floor(progress)}
                          />
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
                          defaultValue={[
                            defaultLayerType?.layerType,
                            defaultLayerType?.featureType,
                            defaultLayerType?.layerProp,
                          ]
                            .filter((e) => !!e)
                            .map((e) => e.toUpperCase())}
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
          onOk={() => {}}
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
              key={window.crypto.randomUUID()}
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
