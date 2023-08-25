import React, { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import InfoWindowContent from "./utils/infoWindow";
import Colorscale from "./utils/ColorScale";
import { DataFilterExtension } from "@deck.gl/extensions";
import download from "downloadjs";
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
  Popover,
  Alert,
  Result,
  notification,
  MenuProps,
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
  FolderOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { TbFlag, TbFlagOff } from "react-icons/tb";
import MarkerIcon from "../../static/MarkerIcon.png";
import TankIcon from "../../static/TankIcon.png";
import ValveIcon from "../../static/ValveIcon.png";
import DotIcon from "../../static/DotIcon.png";
import VODIcon from "../../static/VODIcon.svg";
import AlertIcon from "../../static/AlertIcon.svg";
import { SketchPicker } from "react-color";
import "./index.less";
import LineIcon from "../../static/line.svg";
import PolygonIcon from "../../static/polygon.svg";
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
import MapAttributes from "./utils/mapAttributes";
import apis from "../../services/apis";
import http from "../../services/httpCall";
import { AxiosErrorHandler } from "../../services/httpErrorHandle";
import { connect } from "react-redux";
import { logout } from "../../actions/authAction";
import { loading } from "../../actions/loadingAction";
import moment from "moment";
import { useHistory, useParams } from "react-router-dom";
import VectorForm from "./utils/VectorForm";
import Media from "./utils/Media";
import LayerDocs from "./utils/layer/layerDocs";
import CreateLayer from "./utils/layer/createLayer";
import CreateBaseLayer from "./utils/layer/createBaseLayer";
import io from "socket.io-client";
import Thread from "../shared/Thread";
import { thread } from "../../actions/threadAction";
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
// import { JSONLoader } from "@loaders.gl/json";
// import { LASLoader } from "@loaders.gl/las";
// import { load } from "@loaders.gl/core";

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
  const [flightPath, setFlightPath] = useState<any>([]);
  const [missionLayer, setMissionLayer] = useState("");
  const [videoDetails, setVideoDetails] = useState<any>({});
  const [showCarousel, setShowCarousel] = useState(false);
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
  const [flag, setFlag] = useState(false);
  const [perms, setPerms] = useState({
    canCreateLayer: false,
    canDeleteLayer: true,
    canEditLayer: true,
    canCreateVectorLayer: false,
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
  const treeMenu: MenuProps["items"] = (layer) => {
    const items: MenuProps["items"] = [];
    if ((props.isBaseMap && perms.canEditBaseLayer) || !props.isBaseMap) {
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

    if (props.isBaseMap && perms.canUpdateBaseLayer) {
      items.push({
        key: "4",
        label: "Update Layer",
      });
    }
    if (props.isBaseMap && perms.canDeleteBaseLayer) {
      items.push({
        key: "5",
        label: "Delete",
      });
    }

    if (!props.isBaseMap && perms.canDeleteLayer) {
      items.push({
        key: "5",
        label: "Delete",
      });
    }
    if (
      layer.layerGroupId &&
      ((props.isBaseMap && perms.canCreateBaseLayer) || !props.isBaseMap)
    ) {
      items.push({
        key: "6",
        label: "Unassign Form Group",
      });
    }
    if (checkedKeys.includes(layer.key)) {
      const submenuChildren: MenuProps["items"] = [];
      if ((props.isBaseMap && perms.canCreateBaseLayer) || !props.isBaseMap) {
        submenuChildren.push({
          key: "7",
          label: "Group Selected Layers",
        });
      }
      if (
        (props.isBaseMap && perms.canDeleteBaseLayer) ||
        (!props.isBaseMap && perms.canDeleteLayer)
      ) {
        submenuChildren.push({
          key: "8",
          label: "Delete Selected Layers",
        });
      }
      if ((props.isBaseMap && perms.canCreateBaseLayer) || !props.isBaseMap) {
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
    return items;
  };

  const treeMenuOnClick: MenuProps["onClick"] = async (e) => {
    const type = selectedLayer.type;
    switch (e.key) {
      case "1":
        showModal1();
        setSelectedLayerId(selectedLayer._id);
        setCaptureDate(selectedLayer.captureDate);
        setLayerName(selectedLayer.name);
        type === "Raster"
          ? setDefaultLayerType([
              type.toUpperCase(),
              selectedLayer.raster.name.toUpperCase(),
            ])
          : setDefaultLayerType([
              type.toUpperCase(),
              selectedLayer.vector.type.toUpperCase(),
              selectedLayer.vector.name.toUpperCase(),
            ]);
        setSelectedLayerType(type.toLowerCase());
        break;
      case "2":
        props.thread(true, {
          docType: "layer",
          docId: selectedLayer._id,
        });
        break;
      case "3":
        download(STATIC_URL + selectedLayer.layerpath);
        break;
      case "4":
        setUpdate(true);
        setUpdateType(type);
        setUpdateId(selectedLayer._id);
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
            deleteLayer(selectedLayer._id, selectedLayer.type);
          },
        });
        break;
      case "6":
        const idOfLayerGroup =
          typeof selectedLayer.layerGroupId === "object"
            ? selectedLayer.layerGroupId._id
            : selectedLayer.layerGroupId;
        await removeLayerFromGroup(
          idOfLayerGroup,
          selectedLayer._id,
          `1-${selectedLayer._id}`
        );
        updateTreeDataAfterSingleLayerRemovalFromGroup(selectedLayer._id);
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
            deleteMultipleLayers(checkedKeys, type === "Raster" ? "2" : "1");
          },
        });
        break;
      case "9":
        setMoveToOtherGroupModal(true);
        type === "Raster" ? setMoveType(2) : setMoveType(1);
        break;
      case "10":
        http
          .get(`${apis.DOWNLOAD_KML}?id=${selectedLayer._id}`)
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
            AxiosErrorHandler(err, props.logout);
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
            toggleLayerFlag(selectedLayer._id, true);
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
            toggleLayerFlag(selectedLayer._id, false);
          },
        });
        break;
      case "13":
        console.log("selectedLayer", selectedLayer);
        setViewDocs(true);
        setSelectedLayerInfo(selectedLayer);
        setFeatureLayer(selectedLayer._id);
        setFeatureLayerPath(selectedLayer.layerpath);
        setWindowTitle(selectedLayer.name);
        setSelectedLayerLabel(
          selectedLayer.layerLabel
            ? selectedLayer.layerLabel
            : "No label selected"
        );
        setSelectedLayerPopupLabel(
          selectedLayer.layerPopupLabel
            ? selectedLayer.layerPopupLabel
            : "No label selected"
        );
        setIsLayerDocs(true);
        break;
      default:
        break;
    }
  };
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
    if (
      props.userType === "tenant-staff" ||
      props.userType === "tenant-client"
    ) {
      console.log("logged in user is tenant-staff");
      //console.log(props.userDetails);
      //--------set create layer---------------
      let createLayer: any = [];
      let createLayerAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "upload_layer"
        );
        createLayer = [...filteredPermissions, ...createLayer];
      });
      if (createLayer.length > 0) {
        createLayerAccess = true;
      }

      // ------------- can delete layer -----------------
      let deleteLayer: any = [];
      let deleteLayerAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "delete_layer"
        );
        deleteLayer = [...filteredPermissions, ...deleteLayer];
      });
      if (deleteLayer.length > 0) {
        deleteLayerAccess = true;
      }

      // -------- Can Edit Layer -------------------------
      let editLayer: any = [];
      let editLayerAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "edit_layer"
        );
        editLayer = [...filteredPermissions, ...editLayer];
      });
      if (editLayer.length > 0) {
        editLayerAccess = true;
      }

      //---------set upload file to geojson---------------
      let uploadFileToGeojson: any = [];
      let uploadFileToGeojsonAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "Feature_File_upload"
        );
        uploadFileToGeojson = [...filteredPermissions, ...uploadFileToGeojson];
      });
      if (uploadFileToGeojson.length > 0) {
        uploadFileToGeojsonAccess = true;
      }

      //-----------set delete file from geojson-----------
      let deleteFileToGeojson: any = [];
      let deleteFileToGeojsonAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "Feature_File_Delete"
        );
        deleteFileToGeojson = [...filteredPermissions, ...deleteFileToGeojson];
      });
      if (deleteFileToGeojson.length > 0) {
        deleteFileToGeojsonAccess = true;
      }

      //----------set cover photo------------------------
      let coverPhoto: any = [];
      let coverPhotoAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "set_cover_photo"
        );
        coverPhoto = [...filteredPermissions, ...coverPhoto];
      });
      if (coverPhoto.length > 0) {
        coverPhotoAccess = true;
      }

      //----------add feature------------------------
      let addFeature: any = [];
      let addFeatureAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "add_feature"
        );
        addFeature = [...filteredPermissions, ...addFeature];
      });
      if (addFeature.length > 0) {
        addFeatureAccess = true;
      }

      //----------edit feature------------------------
      let editFeature: any = [];
      let editFeatureAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "edit_feature"
        );
        editFeature = [...filteredPermissions, ...editFeature];
      });
      if (editFeature.length > 0) {
        editFeatureAccess = true;
      }

      //----------delete feature------------------------
      let deleteFeature: any = [];
      let deleteFeatureAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "delete_feature"
        );
        deleteFeature = [...filteredPermissions, ...deleteFeature];
      });
      if (deleteFeature.length > 0) {
        deleteFeatureAccess = true;
      }

      //----------save feature/create vector layer------------------------
      let saveFeature: any = [];
      let saveFeatureAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "save_drawings"
        );
        saveFeature = [...filteredPermissions, ...saveFeature];
      });
      if (saveFeature.length > 0) {
        saveFeatureAccess = true;
      }

      // -----------BASE MAP PERMISSIONS---------------------------------
      //----------save feature/create vector layer------------------------
      let canCreateBaseLayer: any = [];
      let canCreateBaseLayerAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "canCreateBaseLayer"
        );
        canCreateBaseLayer = [...filteredPermissions, ...canCreateBaseLayer];
      });
      if (canCreateBaseLayer.length > 0) {
        canCreateBaseLayerAccess = true;
      }

      let canUpdateBaseLayer: any = [];
      let canUpdateBaseLayerAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "canUpdateBaseLayer"
        );
        canUpdateBaseLayer = [...filteredPermissions, ...canUpdateBaseLayer];
      });
      if (canUpdateBaseLayer.length > 0) {
        canUpdateBaseLayerAccess = true;
      }

      let canDeleteBaseLayer: any = [];
      let canDeleteBaseLayerAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "canDeleteBaseLayer"
        );
        canDeleteBaseLayer = [...filteredPermissions, ...canDeleteBaseLayer];
      });
      if (canDeleteBaseLayer.length > 0) {
        canDeleteBaseLayerAccess = true;
      }

      let canEditBaseLayer: any = [];
      let canEditBaseLayerAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "canEditBaseLayer"
        );
        canEditBaseLayer = [...filteredPermissions, ...canEditBaseLayer];
      });
      if (canEditBaseLayer.length > 0) {
        canEditBaseLayerAccess = true;
      }

      let canUploadToBaseLayer: any = [];
      let canUploadToBaseLayerAccess = false;
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "canUploadToBaseLayer"
        );
        canUploadToBaseLayer = [
          ...filteredPermissions,
          ...canUploadToBaseLayer,
        ];
      });
      if (canUploadToBaseLayer.length > 0) {
        canUploadToBaseLayerAccess = true;
      }

      setPerms({
        canCreateLayer: createLayerAccess,
        canDeleteLayer: deleteLayerAccess,
        canEditLayer: editLayerAccess,
        canCreateVectorLayer: saveFeatureAccess,
        canDownloadLayer: true,
        canEditGeojson: editFeatureAccess,
        canDeleteFeature: deleteFeatureAccess,
        canAddFeature: addFeatureAccess,
        canUploadFileToGeojson: uploadFileToGeojsonAccess,
        canDeleteFileFromGeojson: deleteFileToGeojsonAccess,
        canSetCoverPhoto: coverPhotoAccess,
        canCreateBaseLayer: canCreateBaseLayerAccess,
        canUpdateBaseLayer: canUpdateBaseLayerAccess,
        canDeleteBaseLayer: canDeleteBaseLayerAccess,
        canEditBaseLayer: canEditBaseLayerAccess,
        canUploadToBaseLayer: canUploadToBaseLayerAccess,
      });
    } else if (props.userType === "tenant-root") {
      //console.log(props.userDetails);
      //console.log("logged in user is tenant-root");
      setPerms({
        canCreateLayer: true,
        canDeleteLayer: true,
        canEditLayer: true,
        canCreateVectorLayer: true,
        canDownloadLayer: true,
        canEditGeojson: true,
        canDeleteFeature: true,
        canAddFeature: true,
        canUploadFileToGeojson: true,
        canDeleteFileFromGeojson: true,
        canSetCoverPhoto: true,
        canCreateBaseLayer: true,
        canDeleteBaseLayer: true,
        canEditBaseLayer: true,
        canUpdateBaseLayer: true,
        canUploadToBaseLayer: true,
      });
    }
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
  const [rasterProps, setRasterProps] = useState<any>([]);
  const [vectorProps, setVectorProps] = useState<any>([]);
  const [data, setData] = useState();
  const [editingKey, setEditingKey] = useState("");
  const [missioName, setMissioName] = useState("");
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
  const [viewMedia, setViewMedia] = useState(false);
  const [selectedLayerInfo, setSelectedLayerInfo] = useState({});
  const [selectedLayer, setSelectedLayer] = useState({});
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
  const myFeatureCollection: any = {
    type: "FeatureCollection",
    features: [],
  };

  const [selectedFeatureIndexes, setselectedFeatureIndexes] = useState([]);
  const [featureState, setFeatureState] = useState({
    data: myFeatureCollection,
  });

  const [selectedLayerId, setSelectedLayerId] = useState<any>();
  const [selectedLayerType, setSelectedLayerType] = useState("");

  const [layerToAddInAttributeTable, setlayerToAddInAttributeTable] =
    useState<any>(null);
  const [shouldAttributeTableReload, setShouldAttributeTableReload] =
    useState<any>(false);

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
    setDefaultLayerType([]);
    setCaptureDate("");
    setIsModalVisible1(false);
  };

  const handleCancel1 = () => {
    setTimeout(() => {
      setshowEditModel(false);
    }, 500);
    setLayerName("");
    setDefaultLayerType([]);
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
  useEffect(() => {
    http
      .get(`${apis.GET_RASTER_PROPS}`)
      .then((result) => {
        if (result.data.status) {
          setRasterProps(result.data.data);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      });
    http
      .get(`${apis.GET_VECTOR_PROPS}`)
      .then((result) => {
        if (result.data.status) {
          setVectorProps(result.data.data);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      });
  }, []);

  // Filter
  const filterLayers = (time) => {
    if (rasterProps && vectorProps) {
      let body: any = {};
      if (!props.isBaseMap) {
        body = {
          missionId: id,
        };
      }

      if (selectedRasterProps.length) body["rasterProps"] = selectedRasterProps;
      if (selectedVectorPropsType.length)
        body["vectorPropsType"] = selectedVectorPropsType;
      if (selectedVectorProps.length) body["vectorProps"] = selectedVectorProps;
      if (timeEnabled) body["time"] = time;

      //console.log(JSON.stringify(body));

      if (
        selectedVectorPropsType.length ||
        selectedRasterProps.length ||
        selectedVectorProps.length ||
        timeEnabled
      ) {
        if (valid) {
          setChipsLoading(true);
          console.log("Request Body", body);

          http
            .post(`${apis.FILTER_LAYER}`, body)
            .then((res) => {
              console.log("Filter API response", res);
              if (res.data.status) {
                //console.log(res.data.data);
                setTotalLayers(res.data.data.length);
                segrigateLayers(res.data.data);
                //message.success(res.data.message);
                removeChips(res.data.data);
              } else {
                if (res.data.message === " data not match!") {
                  //---data for filter found
                  removeLastAdded(lastAdded);
                  message.info("No result for selected filter!");
                } else {
                  message.error(res.data.message);
                }
              }
            })
            .catch((err) => {
              console.log(err);
              message.error("Layers couldn't be filtered");
              AxiosErrorHandler(err, props.logout);
            })
            .finally(() => setChipsLoading(false));
        }
      } else {
        getAllLayers(id);
      }
    }
  };

  const removeLastAdded = (item) => {
    if (selectedRasterProps && selectedRasterProps.find((i) => i === item)) {
      const arr = [...selectedRasterProps];
      setSelectedRasterProps(arr.filter((i) => i !== item));
    } else if (
      selectedVectorPropsType &&
      selectedVectorPropsType.find((i) => i === item)
    ) {
      const arr = [...selectedVectorPropsType];
      setSelectedVectorPropsType(arr.filter((i) => i !== item));
    } else if (
      selectedVectorProps &&
      selectedVectorProps.find((i) => i === item)
    ) {
      const arr = [...selectedVectorProps];
      setSelectedVectorProps(arr.filter((i) => i !== item));
    }
    setLastAdded("");
  };

  const removeChips = (layers) => {
    let arr = [...selectedRasterProps];
    let arr1 = [...selectedVectorPropsType];
    let arr2 = [...selectedVectorProps];

    // matching the chips with the response to filter
    if (arr.length) {
      arr.map((i) => {
        let find = "false";
        layers.map((layer) => {
          if (layer.type == "Raster" && layer.raster.name == i) {
            find = "true";
          }
        });
        if (find === "false") arr = arr.filter((ele) => i !== ele);
      });
    }
    if (arr1.length) {
      arr1.map((i) => {
        let find = "false";
        layers.map((layer) => {
          if (layer.type == "Vector" && layer.vector.type == i) {
            find = "true";
          }
        });
        if (find === "false") arr1 = arr1.filter((ele) => i !== ele);
      });
    }
    if (arr2.length) {
      arr2.map((i) => {
        let find = "false";
        layers.map((layer) => {
          if (layer.type == "Vector" && layer.vector.name == i) {
            find = "true";
          }
        });
        if (find === "false") arr2 = arr2.filter((ele) => i !== ele);
      });
    }

    if (
      arr.length !== selectedRasterProps.length ||
      arr1.length !== selectedVectorPropsType.length ||
      arr2.length !== selectedVectorProps.length
    )
      setValid(false);

    // if any array is modified then state will be changed
    if (arr.length !== selectedRasterProps.length) setSelectedRasterProps(arr);
    if (arr1.length !== selectedVectorPropsType.length)
      setSelectedVectorPropsType(arr1);
    if (arr2.length !== selectedVectorProps.length)
      setSelectedVectorProps(arr2);
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
    filterLayers(time);
    //console.log("filterLayercalled");
  }, [
    selectedRasterProps,
    selectedVectorPropsType,
    selectedVectorProps,
    timeEnabled,
    time,
  ]);

  // ++++++++++++++++++++++++++++++ Sort All Layers +++++++++++++++++++++++++++++++++++++
  const changeSortArrange = (ascending) => {
    if (ascending !== isAscending) {
      setIsAscending(ascending);
    }
  };

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

        data[0].children.map((item) =>
          item?.group
            ? item.children.sort((a, b) =>
                moment(a.captureDate).diff(moment(b.captureDate))
              )
            : null
        );
        data[1].children.map((item) =>
          item?.group
            ? item.children.sort((a, b) =>
                moment(a.captureDate).diff(moment(b.captureDate))
              )
            : null
        );
      } else {
        data[0].children.sort((a, b) =>
          moment(b.captureDate).diff(moment(a.captureDate))
        );
        data[1].children.sort((a, b) =>
          moment(b.captureDate).diff(moment(a.captureDate))
        );

        data[0].children.map((item) =>
          item?.group
            ? item.children.sort((a, b) =>
                moment(b.captureDate).diff(moment(a.captureDate))
              )
            : null
        );
        data[1].children.map((item) =>
          item?.group
            ? item.children.sort((a, b) =>
                moment(b.captureDate).diff(moment(a.captureDate))
              )
            : null
        );
      }
      setTreeDataa(data);
    }
    if (sortType == "name") {
      const data: any = [...treeDataa];
      if (isAscending) {
        data[0].children.sort((a, b) => a.name?.localeCompare(b.name));
        data[1].children.sort((a, b) => a.name?.localeCompare(b.name));
        data[0].children.map((item) =>
          item?.group
            ? item.children.sort((a, b) => a.name?.localeCompare(b.name))
            : null
        );
        data[1].children.map((item) =>
          item?.group
            ? item.children.sort((a, b) => a.name?.localeCompare(b.name))
            : null
        );
      } else {
        data[0].children.sort((a, b) => b.name?.localeCompare(a.name));
        data[1].children.sort((a, b) => b.name?.localeCompare(a.name));
        data[0].children.map((item) =>
          item?.group
            ? item.children.sort((a, b) => b.name?.localeCompare(a.name))
            : null
        );
        data[1].children.map((item) =>
          item?.group
            ? item.children.sort((a, b) => b.name?.localeCompare(a.name))
            : null
        );
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
  const [selectedLayerPopupLabel, setSelectedLayerPopupLabel] = useState("");
  const [activeID, setActiveID] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState<React.Key[]>([]);
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

  const [allLayers, setAllLayers] = useState({});
  const [visibleLayers, setVisibleLayers] = useState([]);
  const [colorChangeFeatureData, setColorChangeFeatureData] =
    useState<any>(null);
  const [showColorChangeForm, setShowColorChangeForm] = useState(false);
  const [color, setColor] = useState("");
  const [scales, setScales] = useState([]);
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
  const fetchMissionGeoJSON = () => {
    checkedKeys.map((key) => {
      if (key.split("-")[0] === "3") {
        if (key.split("-")[1] === "2") {
          if (props.isBaseMap) {
            http
              .get(`${apis.GET_ALERT_LOCATION_GEOJSON}`, {
                params: {
                  startDate: dateRange[0],
                  endDate: dateRange[1],
                },
              })
              .then((result) => {
                console.log("geoJsonAlert", result);
                setGeoJsonAlert(result.data);
              })
              .catch((err) => {
                console.log(err);
                AxiosErrorHandler(err, props.logout);
              });
          } else {
            http
              .get(`${apis.GET_MISSION_GEOJSON}/${id}/alerts`, {
                params: {
                  startDate: dateRange[0],
                  endDate: dateRange[1],
                },
              })
              .then((result) => {
                setGeoJsonAlert(result.data);
              })
              .catch((err) => {
                console.log(err);
                AxiosErrorHandler(err, props.logout);
              });
          }
        } else if (key.split("-")[1] === "3") {
          if (props.isBaseMap) {
            http
              .get(`${apis.GET_VOD_LOCATION_GEOJSON}`, {
                params: {
                  startDate: dateRange[0],
                  endDate: dateRange[1],
                },
              })
              .then((result) => {
                console.log("geoJsonVOD", result);
                setGeoJsonVOD(result.data);
              })
              .catch((err) => {
                console.log(err);
                AxiosErrorHandler(err, props.logout);
              });
          } else {
            http
              .get(`${apis.GET_MISSION_GEOJSON}/${id}/vods`, {
                params: {
                  startDate: dateRange[0],
                  endDate: dateRange[1],
                },
              })
              .then((result) => {
                console.log("geoJsonVOD", result);
                setGeoJsonVOD(result.data);
              })
              .catch((err) => {
                console.log(err);
                AxiosErrorHandler(err, props.logout);
              });
          }
        }
      }
    });
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
      fetchJSON(STATIC_URL + srtVideoPath.replace(/.\w+$/, ".geojson"))
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
    fetchMissionGeoJSON();
  }, [dateRange, checkedKeys]);

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
  // useEffect(() => console.log("All layers: ", allLayers), [allLayers]);
  const handleChangeComplete = (color) => {
    setColor(color.hex);
  };

  const handleChange = (color, event) => {
    setColor(color.hex);
  };

  // //-------------export Function------------------------------------
  // useEffect(() => {
  //   console.log(
  //     "Selected indexes: ",
  //     selectedIndexes,
  //     "Active layerID: ",
  //     activeID,
  //   );
  // }, [selectedIndexes, activeID]);
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
    {
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
    },
  ];
  const toggleLayerFlag = (layerId, flag) => {
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
          setRefreshLayer(!refreshLayer);
          setShouldAttributeTableReload(!shouldAttributeTableReload);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, props.logout);
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
          setRefreshLayer(!refreshLayer);
          setShouldAttributeTableReload(!shouldAttributeTableReload);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, props.logout);
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
          window.open(`${PUBLIC_URL}${res.data.pathh}`);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, props.logout);
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
          window.open(`${PUBLIC_URL}${res.data.pathh}`);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, props.logout);
      });
  }

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
  function invertColor(hex) {
    if (hex.indexOf("#") === 0) {
      hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
      throw new Error("Invalid HEX color.");
    }
    // invert color components
    const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
      g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
      b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
  }

  function padZero(str, len) {
    len = len || 2;
    const zeros = new Array(len).join("0");
    return (zeros + str).slice(-len);
  }

  function ThreeDeeFillColor(hex: any) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : null;
  }

  //---------------Generate stroke color and marker Color--------------------
  function hexToRGBSolid(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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

  const filterFeatures = (layerId, data) => {
    if (flaggedFilter || unflaggedFilter) {
      return data.filter((feature, idx) => {
        if (flaggedFilter) {
          return allLayers[layerId]?.flaggedFeatures.includes(idx);
        } else if (unflaggedFilter) {
          return !allLayers[layerId]?.flaggedFeatures.includes(idx);
        }
      });
    } else {
      return data;
    }
  };
  //geojson to json
  async function parseGeoJson(layerId: any, file: any) {
    const GeoJson: any = await fetch(file);
    const data = await GeoJson.json();
    const features = data.features;
    const filterdFeatures = filterFeatures(layerId, features);
    return filterdFeatures;
  }

  //-------------on layer check-------------------------------

  useEffect(() => {
    setScaleData(checkedKeys);
    drawLayers(checkedKeys);
  }, [
    checkedKeys,
    allLayers,
    geoJsonVOD,
    geoJsonAlert,
    flaggedFilter,
    unflaggedFilter,
    flag,
    pointMarkerSize,
  ]);

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
    const vlayers: any = [];
    setShowMarkerSizeTool(false);
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
                      data.index,
                      data.coordinate,
                      allLayers[element]?.name,
                      "LineView",
                      data.object,
                      false,
                      allLayers[element]?.id,
                      data.object.properties.sys_id,
                      "Vector"
                    );
                    setSelectedLayerLabel(
                      allLayers[element]?.layerLabel
                        ? allLayers[element]?.layerLabel
                        : "No label selected"
                    );
                    setSelectedLayerPopupLabel(
                      allLayers[element]?.layerPopupLabel
                        ? allLayers[element]?.layerPopupLabel
                        : "No label selected"
                    );
                  } else {
                    setSelectedLayerId(element.split("-")[1]);
                    setColorChangeFeatureData(data);
                    setShowColorChangeForm(true);
                  }
                },
                onHover: (data, e) => {
                  setLayerName(allLayers[element]?.name);
                  setSelectedLayerPopupLabel(
                    allLayers[element]?.layerPopupLabel
                  );
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
                        console.log(i);
                        return hexToRGB2("#ffaa00", true);
                      }
                    }
                    return hexToRGB2(d.properties.color, false);
                  } else {
                    if (activeID === element.split("-")[1]) {
                      console.log(i);
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
                      data.index,
                      data.coordinate,
                      allLayers[element]?.name,
                      "PolygonView",
                      data.object,
                      false,
                      allLayers[element]?.id,
                      data.object.properties.sys_id,
                      "Vector"
                    );
                    setSelectedLayerLabel(
                      allLayers[element]?.layerLabel
                        ? allLayers[element]?.layerLabel
                        : "No label selected"
                    );
                    setSelectedLayerPopupLabel(
                      allLayers[element]?.layerPopupLabel
                        ? allLayers[element]?.layerPopupLabel
                        : "No label selected"
                    );
                  } else {
                    setSelectedLayerId(element.split("-")[1]);
                    setColorChangeFeatureData(data);
                    setShowColorChangeForm(true);
                  }
                },
                onHover: (data, e) => {
                  setLayerName(allLayers[element]?.name);
                  setSelectedLayerPopupLabel(
                    allLayers[element]?.layerPopupLabel
                  );
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
            setShowMarkerSizeTool(true);
            vlayers.push(
              new IconLayer({
                id: element,
                data: parseGeoJson(
                  element,
                  STATIC_URL + allLayers[element]?.layerPath
                ),
                pickable: true,
                // iconAtlas: TankIcon,
                //iconMapping: ICON_MAPPING,
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
                    url: `${iconSelector(d.properties.icon)}`,
                    width: 100,
                    height: 129,
                    anchorY: 125,
                    mask: true,
                  };
                },
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
                sizeScale: 12 * pointMarkerSize,
                getPosition: (d) => d.geometry.coordinates,
                getSize: (d) => 5,
                getColor: (d, i) => {
                  if (activeID === element.split("-")[1]) {
                    if (selectedIndexes.includes(i.index)) {
                      return hexToRGB2("#ffaa00", true);
                    }
                  }
                  if (unflaggedFilter) {
                    return hexToRGB2(d.properties.color, false);
                  }
                  if (
                    flaggedFilter ||
                    allLayers[element]?.flaggedFeatures.includes(i.index)
                  ) {
                    return hexToRGB2(invertColor(d.properties.color), true);
                  }
                  return hexToRGB2(d.properties.color, false);
                },
                onClick: (data, e) => {
                  if (e.leftButton) {
                    InfoWindow(
                      data.index,
                      data.coordinate,
                      allLayers[element]?.name,
                      "PointView",
                      data.object,
                      false,
                      allLayers[element]?.id,
                      data.object.properties.sys_id,
                      "Vector"
                    );
                    setSelectedLayerLabel(
                      allLayers[element]?.layerLabel
                        ? allLayers[element]?.layerLabel
                        : "No label selected"
                    );
                    setSelectedLayerPopupLabel(
                      allLayers[element]?.layerPopupLabel
                        ? allLayers[element]?.layerPopupLabel
                        : "No label selected"
                    );
                  } else {
                    setSelectedLayerId(element.split("-")[1]);
                    setColorChangeFeatureData(data);
                    setShowColorChangeForm(true);
                  }
                },
                onHover: (data, e) => {
                  setLayerName(allLayers[element]?.name);
                  setSelectedLayerPopupLabel(
                    allLayers[element]?.layerPopupLabel
                  );
                },
              })
            );
            break;
        }
      } else if (element.split("-")[0] === "3" && element !== "3") {
        setShowMarkerSizeTool(true);
        if (element.split("-")[1] === "2") {
          vlayers.push(
            new IconLayer({
              id: element,
              data: geoJsonAlert?.features,
              pickable: true,
              // iconAtlas: TankIcon,
              //iconMapping: ICON_MAPPING,
              getIcon: (d) => {
                return {
                  url: AlertIcon,
                  width: 200,
                  height: 220,
                  anchorY: 125,
                  mask: true,
                };
              },
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
              sizeScale: 15 * pointMarkerSize,
              getPosition: (d) => d.geometry.coordinates,
              getSize: (d) => 5,
              getColor: (d, i) => {
                return hexToRGB2("#d0021b", false);
              },
              onClick: (data, e) => {
                if (e.leftButton) {
                  InfoWindow(
                    data.index,
                    data.coordinate,
                    data.object.properties.Name.split(",")
                      .slice(0, 2)
                      .join(","),
                    "PointView",
                    data.object,
                    false,
                    element.split("-")[1],
                    data.object._id,
                    "Alert"
                  );
                } else {
                  setSelectedLayerId(element.split("-")[1]);
                  setColorChangeFeatureData(data);
                  setShowColorChangeForm(true);
                }
              },
            })
          );
        }
        if (element.split("-")[1] === "3") {
          vlayers.push(
            new IconLayer({
              id: element,
              data: geoJsonVOD?.features,
              pickable: true,
              // iconAtlas: TankIcon,
              //iconMapping: ICON_MAPPING,
              getIcon: (d) => {
                return {
                  url: VODIcon,
                  width: 200,
                  height: 220,
                  anchorY: 125,
                  mask: true,
                };
              },
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
              sizeScale: 15 * pointMarkerSize,
              getPosition: (d) => d.geometry.coordinates,
              getSize: (d) => 5,
              getColor: (d, i) => {
                return hexToRGB2("#d0021b", false);
              },
              onClick: (data, e) => {
                if (e.leftButton) {
                  InfoWindow(
                    data.index,
                    data.coordinate,
                    data.object.properties.name
                      .split(",")
                      .slice(0, 2)
                      .join(","),
                    "PointView",
                    data.object,
                    false,
                    element.split("-")[1],
                    data.object._id,
                    "VOD"
                  );
                } else {
                  setSelectedLayerId(element.split("-")[1]);
                  setColorChangeFeatureData(data);
                  setShowColorChangeForm(true);
                }
              },
            })
          );
        }
      }
      console.log("Missions", vlayers, allLayers, geoJsonVOD.features);
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
    const layerType = type === "mission" ? 2 : type === "raster" ? 1 : 0;
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
    const missions = checkedKeysValue.filter(
      (key) => key.split("-")[0] === "3"
    );
    const rasterOrdering: any = sortLayersBySidebarOrdering(rasters, "raster");
    const vectorOrdering: any = sortLayersBySidebarOrdering(vectors, "vector");
    const missionOrdering: any = sortLayersBySidebarOrdering(
      missions,
      "mission"
    );
    setLastCount(checkedKeysValue.length);
    //console.log(rasterOrdering);
    setCheckedKeys([...rasterOrdering, ...vectorOrdering, ...missionOrdering]);
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
  }, []);

  useEffect(() => {
    if (props.isBaseMap) {
      props.loading(true);
      getAllLayers(null);
    }
  }, [props.isBaseMap, refreshLayer, flag]);

  //---------------Fetch all layers in mission----------------------------------------

  const getAllLayers = async (id) => {
    console.log("I am inside getAllLayers");
    if (!props.isBaseMap) {
      try {
        const result: any = await http.get(
          `${apis.GET_ALL_LAYERS_FOR_MISSION}`,
          {
            params: {
              missionId: id,
            },
          }
        );

        if (result.data.status) {
          if (result.data.message === "No layer exists for mission") {
            setMissioName(result.data.missionName);
            setViewport({
              latitude: result.data.centerPoints.lat,
              longitude: result.data.centerPoints.lng,
              zoom: 13,
              pitch: 0,
              minZoom: 0,
              maxZoom: 22,
              bearing: 0,
              // transitionDuration: 8000,
              // transitionInterpolator: new FlyToInterpolator(),
            });
          } else {
            //console.log("layers fetched: ", result.data.data);
            setMissioName(result.data.data.mission);
            setTotalLayers(0);
            console.log("api result", result.data.data.layers);
            setlayerz(result.data.data.layers);
            segrigateLayers(result.data.data.layers);
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
          }
        } else {
          message.error(`${result.data.message}`);
        }
      } catch (error) {
        console.log(error);
        message.error("Layers Could Not Be Loaded");
        AxiosErrorHandler(error, props.logout);
      } finally {
        props.loading(false);
      }
    } else {
      try {
        const result: any = await http.get(`${apis.GET_ALL_BASELAYERS}`);
        if (result.data.success) {
          console.log("Base map result", result.data);
          setMissioName("none");
          setTotalLayers(0);
          setlayerz(result.data.data);
          segrigateLayers(result.data.data);
        } else {
          message.error(result.data.message);
        }
        //message.info("ola amigo")
      } catch (error) {
        console.log(error);
        //message.error("errrorrrrr");
        AxiosErrorHandler(error, props.logout);
      } finally {
        props.loading(false);
        //message.info("land")
      }
    }
  };

  // ++++++++++++++++++++++++++++++++++++++++++++++ Delete Layer +++++++++++++++++++++++++++++++++++++++++++++++
  const removeLayerFromTree = (layers) => {
    const td: any = [...treeStructure];

    try {
      const newTreeDataVectors = td[0].children.filter((layer) => {
        if (layer.group) {
          let groupLayers = [];
          groupLayers = layer.value.children.filter((l) => {
            const k = l.key.split("-")[1];
            return !layers.includes(k);
          });
          layer.value.children = [...groupLayers];

          return true;
        } else {
          const k = layer.key.split("-")[1];
          return !layers.includes(k);
        }
      });
      td[0].children = [...newTreeDataVectors];

      const newTreeDataRasters = td[1].children.filter((layer) => {
        if (layer.group) {
          let groupLayers = [];
          groupLayers = layer.value.children.filter((l) => {
            const k = l.key.split("-")[1];
            return !layers.includes(k);
          });
          layer.value.children = [...groupLayers];
          return true;
        } else {
          const k = layer.key.split("-")[1];
          return !layers.includes(k);
        }
      });
      td[1].children = [...newTreeDataRasters];

      setTreeStructure(td);

      setTimeout(() => {
        const cl = checkedKeys.filter(
          (key: any) => !layers.includes(key.split("-")[1])
        );
        setCheckedKeys(cl);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const deleteLayer = (id, type) => {
    props.loading(true);
    if (props.isBaseMap) {
      const payload: any = {
        layer: id,
      };

      console.log("payload", payload);
      http
        .delete(`${apis.DELETE_BASE_LAYER}`, {
          data: {
            layers: [id],
          },
        })
        .then((res) => {
          if (res.data.status) {
            removeLayerFromTree([id]);

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

            message.success(res.data.message);
            //console.log(res.data);
          } else {
            message.error(res.data.message);
            console.log(res.data);
          }
        })
        .catch((err) => {
          AxiosErrorHandler(err, props.logout);
          if (err.response?.status === 401) {
            message.warning(
              "Sorry! You are not authorised to delete layer. Please contact admin"
            );
          } else console.log(err);
        })
        .finally(() => {
          props.loading(false);
          handleCancel1();
        });
    } else {
      http
        .delete(`${apis.DELETE_LAYER}`, {
          params: {
            id: id,
          },
        })
        .then((res) => {
          if (res.data.status) {
            removeLayerFromTree([id]);

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
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          props.loading(false);
          handleCancel1();
        });
    }
  };

  const deleteMultipleLayers = (keys, type) => {
    props.loading(true);
    console.log(keys);

    const layers = keys
      .filter((key) => key.split("-")[0] == type)
      .map((key) => key.split("-")[1]);

    if (props.isBaseMap) {
      http
        .delete(`${apis.DELETE_BASE_LAYER}`, {
          data: {
            layers,
          },
        })
        .then((res) => {
          if (res.data.status) {
            removeLayerFromTree(layers);

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
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          props.loading(false);
          handleCancel1();
        });
    } else {
      http
        .post(`${apis.DELETE_MULTIPLE_LAYERS}`, {
          layers,
        })
        .then((res) => {
          if (res.data.status) {
            removeLayerFromTree(layers);

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
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          props.loading(false);
          handleCancel1();
        });
    }
  };

  const getTreeData = (layer, type, keyPrefix) => {
    switch (type) {
      case "raster":
        return {
          title: (
            <>
              <Dropdown
                onOpenChange={() => setSelectedLayer(layer)}
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
                    count={layer.isThreadExist ? layer.commentCount : 0}
                    overflowCount={9}
                  >
                    <Text
                      style={
                        layer.layerGroupId
                          ? { width: "139px" }
                          : { width: "160px" }
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
                  </Badge>
                </Tooltip>
              </Dropdown>
            </>
          ),
          key: keyPrefix + "-" + layer._id,
          icon: <FileImageOutlined />,
          captureDate: layer.captureDate,
          name: layer.name,
          groupId: layer.layerGroupId ? layer.layerGroupId._id : null,
          layer: layer,
        };
      case "vector":
        return {
          title: (
            <>
              <Dropdown
                onOpenChange={() => setSelectedLayer(layer)}
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
                    count={layer.isThreadExist ? layer.commentCount : 0}
                    overflowCount={9}
                  >
                    <Text
                      style={
                        layer.layerGroupId
                          ? { width: "119px" }
                          : { width: "140px" }
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
                    {layer.isFlagged && (
                      <FlagOutlined style={{ color: "#da1c5c" }} />
                    )}
                    {layer.isPublic && (
                      <EyeOutlined style={{ color: "#3b86ff" }} />
                    )}
                  </Badge>
                </Tooltip>
              </Dropdown>
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
        setgroupName(value.name);
        setgroupToEdit({
          id: id,
          name: value.name,
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
      }
    };
    return {
      title: (
        <>
          <Dropdown menu={{ items, onClick }} trigger={["contextMenu"]}>
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

  const updateTreeDataAfterGroupDelete = (id) => {
    const td: any = [...treeStructure];
    const al = { ...allLayers };

    const newVectorLayers = td[0].children.filter((layer) => {
      if (!layer.group) {
        return true;
      } else {
        if (layer.id === id) {
          layer.value.children.forEach((l) => {
            delete al[l.key];
          });
          return false;
        } else {
          return true;
        }
      }
    });

    td[0].children = [...newVectorLayers];

    const newRasterLayers = td[1].children.filter((layer) => {
      if (!layer.group) {
        return true;
      } else {
        if (layer.id === id) {
          layer.value.children.forEach((l) => {
            delete al[l.key];
          });
          return false;
        } else {
          return true;
        }
      }
    });

    td[1].children = [...newRasterLayers];

    const ag = { ...allLayerGroups };
    delete ag[id];

    setTimeout(() => {
      setAllLayers(al);
      setAllLayerGroups(ag);
      setTreeStructure(td);
      forceUpdateAllLayers();
    }, 100);
  };

  const updateTreeDataAfterMovingLayers = async (groupid, layerids, keys) => {
    const al = { ...allLayers };
    props.loading(true);

    const res = await http.patch(`${apis.EDIT_LAYER_GROUP}`, {
      _id: groupid,
      layers: layerids,
    });

    if (!res.data.status) {
      return message.error(res.data.message);
    }

    keys.forEach((key) => {
      al[key].groupId = groupid;
    });

    const td: any = [...treeStructure];
    const ltmv: any = [];

    td[0].children = td[0].children.filter((layer) => {
      if (!layer.group) {
        if (layerids.includes(layer._id)) {
          layer.layerGroupId
            ? (layer.layerGroupId["_id"] = groupid)
            : (layer.layerGroupId = { _id: groupid });
          ltmv.push(layer);
          return false;
        } else {
          return true;
        }
      } else {
        layer.value.children = layer.value.children.filter((l) => {
          if (layerids.includes(l._id)) {
            l.layerGroupId
              ? (l.layerGroupId["_id"] = groupid)
              : (l.layerGroupId = { _id: groupid });
            ltmv.push(l);
            return false;
          } else {
            return true;
          }
        });
        return true;
      }
    });

    td[1].children = td[1].children.filter((layer) => {
      if (!layer.group) {
        if (layerids.includes(layer._id)) {
          layer.layerGroupId
            ? (layer.layerGroupId["_id"] = groupid)
            : (layer.layerGroupId = { _id: groupid });
          ltmv.push(layer);
          return false;
        } else {
          return true;
        }
      } else {
        layer.value.children = layer.value.children.filter((l) => {
          if (layerids.includes(l._id)) {
            l.layerGroupId
              ? (l.layerGroupId["_id"] = groupid)
              : (l.layerGroupId = { _id: groupid });
            ltmv.push(l);
            return false;
          } else {
            return true;
          }
        });
        return true;
      }
    });

    td[0].children = td[0].children.map((layer) => {
      if (layer.group) {
        if (layer.id === groupid) {
          layer.value.children = [...layer.value.children, ...ltmv];
        }
      }
      return layer;
    });

    td[1].children = td[1].children.map((layer) => {
      if (layer.group) {
        if (layer.id === groupid) {
          layer.value.children = [...layer.value.children, ...ltmv];
        }
      }
      return layer;
    });

    setTreeStructure(td);
    setAllLayers(al);
  };

  const updateTreeDataAfterGroupEdit = (group, id) => {
    const td: any = [...treeStructure];

    const newVectorLayers = td[0].children.map((layer) => {
      if (!layer.group) {
        return layer;
      } else {
        if (layer.id === group._id) {
          layer.value.name = group.name;
          return layer;
        } else {
          return layer;
        }
      }
    });

    td[0].children = [...newVectorLayers];

    const newRasterLayers = td[1].children.filter((layer) => {
      if (!layer.group) {
        return layer;
      } else {
        if (layer.id === group._id) {
          group.children = [...layer.value.children];
          return {
            group: true,
            value: group,
            id: layer.id,
          };
        } else {
          return layer;
        }
      }
    });

    td[1].children = [...newRasterLayers];

    setTimeout(() => {
      setTreeStructure(td);
      forceUpdateAllLayers();
    });
  };

  const updateTreeDataAfterSingleLayerRemovalFromGroup = (id) => {
    const td: any = [...treeStructure];
    let layerToRemove: any = null;
    const newVectorLayers = td[0].children.filter((layer) => {
      if (!layer.group) {
        if (layer._id === id) {
          layerToRemove = layer;
        }
        return true;
      } else {
        const groupLayers = layer.value.children.filter((l) => {
          if (l._id === id) {
            layerToRemove = l;
            return false;
          }
          return true;
        });
        layer.value.children = [...groupLayers];
        return true;
      }
    });

    td[0].children = [...newVectorLayers];

    if (layerToRemove) {
      layerToRemove.layerGroupId = null;
      td[0].children.unshift(layerToRemove);
      layerToRemove = null;
    }

    const newRasterLayers = td[1].children.filter((layer) => {
      if (!layer.group) {
        if (layer._id === id) {
          layerToRemove = layer;
        }
        return true;
      } else {
        const groupLayers = layer.value.children.filter((l) => {
          if (l._id === id) {
            layerToRemove = l;
            return false;
          }
          return true;
        });
        layer.value.children = [...groupLayers];
        return true;
      }
    });

    td[1].children = [...newRasterLayers];

    if (layerToRemove) {
      layerToRemove.layerGroupId = null;
      td[1].children.unshift(layerToRemove);
    }

    setTimeout(() => {
      setTreeStructure(td);
    });
  };

  const deleteGroup = (id: any) => {
    props.loading(true);

    http
      .delete(`${apis.DELETE_LAYER_GROUP}`, {
        params: {
          _id: id,
        },
      })
      .then((res) => {
        if (res.data.status) {
          message.success(res.data.message);
          updateTreeDataAfterGroupDelete(id);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const editGroup = (group) => {
    props.loading(true);

    http
      .patch(`${apis.EDIT_LAYER_GROUP}`, {
        name: group.name,
        _id: group.id,
        layers: group.layers,
      })
      .then((res) => {
        if (res.data.status) {
          message.success(res.data.message);
          updateTreeDataAfterGroupEdit(res.data.data, group.id);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        editForm.resetFields();
        setVisibleEditModal(false);
        setgroupName("");
        setgroupToEdit(null);
        props.loading(false);
      });
  };

  // ++++++++++++++++++++++++++++++++
  const renderRangePicker = () => {
    const disabledDate = (current) => {
      return current && current > moment(dateRange[1]);
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
    {
      title: "Mission",
      key: "3",
      children: [
        {
          title: renderRangePicker(),
          key: "3-1",
          checkable: false,
        },
        {
          title: "Alerts",
          key: "3-2",
        },
        {
          title: "VODs",
          key: "3-3",
        },
      ],
    },
  ];
  const [treeDataa, setTreeDataa] = useState<any>(treeData);
  const [treeStructure, setTreeStructure] = useState(treeData);
  const [allLayerGroups, setAllLayerGroups] = useState({});
  //----------------------Segrigate layers-------------------------------------------------------

  useEffect(() => {
    refreshLayers();
  }, [treeStructure, checkedKeys, panes, dateRange]);
  useEffect(() => {
    if (!props.Thread.open) {
      setRefreshLayer(!refreshLayer);
    }
  }, [props.Thread.open]);
  const refreshLayers = () => {
    const td: any = [...treeStructure];
    let newTreeDataVector: any = [];
    let newTreeDataRaster: any = [];

    //console.log(td);
    const data: any = treeData;

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

    newTreeDataRaster = td[1].children.map((layer) => {
      if (layer.group) {
        let groupLayers = [];
        const value = {
          ...layer.value,
        };
        groupLayers = layer.value.children.map((l) => {
          return getTreeData(l, "raster", td[1]["key"]);
        });
        value.children = [...groupLayers];
        return getGroupTitle(value, layer.id);
      } else {
        return getTreeData(layer, "raster", td[1]["key"]);
      }
    });
    data[1].children = [...newTreeDataRaster];

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
        layerPopupLabel: layer.layerPopupLabel,
        isPublic: layer.isPublic,
        flaggedFeatures: layer.flaggedFeatures,
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

  const onFinish = (values: any) => {
    //console.log("Success:", values);
  };

  const onFinish1 = (values: any) => {
    //console.log("Success:", values);
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

  const getEditLayerTypeOptions = (layerType) => {
    console.log(layerType);
    const filteredOptions = options.filter(
      (option) => option.value.toUpperCase() == layerType[0]
    );

    filteredOptions[0].label = filteredOptions[0].title;
    delete filteredOptions[0].title;
    console.log(filteredOptions[0].children);
    if (filteredOptions[0].children.length > 0 && layerType.length > 0) {
      filteredOptions[0].children = filteredOptions[0].children.filter(
        (child) => child.value.toUpperCase() == layerType[1]
      );
      filteredOptions[0].children[0].label =
        filteredOptions[0].children[0].title;
      delete filteredOptions[0].children[0].title;
      filteredOptions[0].children[0].children =
        filteredOptions[0].children[0].children.map((option) => {
          option.label = option.title;
          delete option.title;
          return option;
        });
    }
    return filteredOptions;
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    onRemove: (file) => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      //console.log(file);
      setFileList([file]);
      return false;
    },
    fileList,
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

        return pane;
      }
    });

    setPanes(newPanes);
  };

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

  const changeLayerType = (value) => {
    if (value[0] === "1") {
      setshowColorPicker(true);
      setLayerType("Vector");
      setLayerTypeId(value.substring(4, 28));
    } else if (value[0] === "0") {
      setshowColorPicker(false);
      setLayerType("Raster");
      setLayerTypeId(value.substring(2, 26));
    }
  };

  // ++++++++++++++++++++++++++++++++++++++ Create Layer ++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const fileTypes = ["geojson", "tif", "kml", "shp", "zip"];

  const createLayer = async () => {
    if (!fileList.length) {
      message.error("Please select file to upload");
      return;
    }

    const file = fileList[0];
    const ext = file.name.split(".").pop();

    if (!fileTypes.includes(ext)) {
      message.error("Please select the geojson or tif file");
      return;
    }

    if (!layerType || !layerTypeId || !captureDate || !layerName) {
      message.error("Please fill all the required field");
      return;
    }

    try {
      setUploading(true);

      const fmData = new FormData();
      const config = {
        headers: { "content-type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.floor((event.loaded / event.total) * 100);
          setProgress(percent);
          if (percent === 100) {
            setTimeout(() => setProgress(0), 1000);
          }
        },
      };
      fmData.append("file", fileList[0]);
      fmData.append("captureDate", captureDate);
      fmData.append("name", layerName);
      fmData.append("type", layerType);
      fmData.append("color", layerColor);
      fmData.append("missionId", id);
      fmData.append("inHeritOriginalColorFromFile", inheritColor.toString());

      if (layerType === "Vector") fmData.append("vector", layerTypeId);

      if (layerType === "Raster") fmData.append("raster", layerTypeId);

      fmData.append("icon", icon2);

      const result = await http.post(
        `${apis.CREATE_LAYER}/${layerType}`,
        fmData,
        config
      );

      if (result.data.status) {
        console.log(result.data.data);
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
          //   AxiosErrorHandler(err, VideoProps.logout); //needs to be connected with redux
          // }, 5000);
        } else {
          setLimitModal(true);
          console.log(err.response);
        }
      } else {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      }
    } finally {
      setUploading(false);
      setFileList([]);
      setCaptureDate("");
      setLayerName("");
      setLayerType("");
      setLayerTypeId("");
      setIcon("");
      form.resetFields();
    }
  };

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
          isPublic: layer.isPublic, // #public
          flaggedFeatures: layer.flaggedFeatures,
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
    onClick: (data, e) => {
      if (!e.rightButton) {
        if (modeState.isCompleted) {
          InfoWindow(
            "new",
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
    props.loading(true);
    const data: any = {
      name: layerName,
      captureDate: captureDate,
    };
    if (layerTypeId !== "") {
      data.layerType = layerTypeId;
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
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          setLayerColor("#ffaa00"); // default value that was previously also used in first declaration
          setLayerName("");
          setCaptureDate("");
          setIcon2(iconOptions[0].value); // default value that was previously also used in first declaration
          props.loading(false);
        });

      refreshLayers();
    }

    props.loading(true);

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
          props.loading(false);
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
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        handleCancel1();
        form.resetFields();
        setLayerName("");
        setCaptureDate("");
        setLayerColor("#ffaa00");
        setLayerTypeId("");
        props.loading(false);
      });

    refreshLayers();
  };

  const editFeature = (data, color, index) => {
    data.properties["color"] = color;
    props.loading(true);

    http
      .patch(`${apis.EDIT_FEATURE}`, {
        id: selectedLayerId,
        featureIndex: index,
        feature: data,
      })
      .then((result) => {
        updateLayerDataAfterEditing(result.data.result, null, selectedLayerId);
        forceUpdateLayers(selectedLayerId);
        message.success(result.data.message);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          message.warning(
            "Sorry! You are not authorised to edit feature. Please contact admin"
          );
        } else console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setSelectedLayerId("");
        setColorChangeFeatureData(null);
        setShowColorChangeForm(false);
        props.loading(false);
      });
  };

  const updateLayerDataAfterEditing = (data, color, id) => {
    if (data) {
      const td: any = [...treeStructure];
      const id = data._id;
      const type = data.type;
      let newTreeData: any = [];
      const al = { ...allLayers };
      const l = {};
      switch (type) {
        case "Vector":
          al[`1-${data._id}`].layerLabel = data.layerLabel;
          newTreeData = td[0].children.map((layer: any) => {
            if (!layer.group) {
              if (layer.key === `1-${id}`) {
                data.key = `1-${id}`;
                return data;
              } else return layer;
            } else {
              let groupLayers = [];

              groupLayers = layer.value.children.map((l) => {
                if (l.key === `1-${id}`) {
                  data.key = `1-${id}`;
                  return data;
                } else return l;
              });

              layer.value.children = [...groupLayers];
              return layer;
            }
          });

          td[0].children = [...newTreeData];

          l[td[0]["key"] + "-" + data._id] = {
            layerPath: data.layerpath,
            type: data.vector.type,
            name: data.name,
            id: data._id,
            layerLabel: data.layerLabel,
            layerPopupLabel: data.layerPopupLabel,
            isPublic: data.isPublic,
            flaggedFeatures: data.flaggedFeatures,
          };

          break;
        case "Raster":
          if (props.isBaseMap) {
            // -----to merge all rasters paths------------------
            l[td[1]["key"] + "-" + data._id] = {
              layerPath: data.layerdataArr,
              type: data.raster.name,
              settings: {
                ...data.raster,
                // minp: layer.minp,
                // maxp: layer.maxp,
              },
              name: data.name,
              id: data._id,
            };

            newTreeData = td[1].children.map((layer: any) => {
              if (!layer.group) {
                if (layer.key === `2-${id}`) {
                  data.key = `2-${id}`;
                  return data;
                } else return layer;
              } else {
                let groupLayers = [];

                groupLayers = layer.value.children.map((l) => {
                  if (l.key === `2-${id}`) {
                    data.key = `2-${id}`;
                    return data;
                  } else return l;
                });

                layer.value.children = [...groupLayers];
                return layer;
              }
            });

            td[1].children = [...newTreeData];
          } else {
            newTreeData = td[1].children.map((layer: any) => {
              if (!layer.group) {
                if (layer.key === `2-${id}`) {
                  data.key = `2-${id}`;
                  return data;
                } else return layer;
              } else {
                let groupLayers = [];

                groupLayers = layer.value.children.map((l) => {
                  if (l.key === `2-${id}`) {
                    data.key = `2-${id}`;
                    return data;
                  } else return l;
                });

                layer.value.children = [...groupLayers];
                return layer;
              }
            });

            td[1].children = [...newTreeData];
            break;
          }
      }

      setTreeStructure(td);
      setAllLayers({
        ...al,
        ...l,
      });
      setTimeout(() => {
        forceUpdateLayers(id);
      });
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

  useEffect(() => {
    console.log(
      selectedRasterProps,
      selectedVectorPropsType,
      selectedVectorProps
    );
  }, [selectedRasterProps, selectedVectorPropsType, selectedVectorProps]);

  const onToggleSelectRasterProps = (item) => {
    let newArr = [...selectedRasterProps];
    if (newArr.length && newArr.find((i) => i === item)) {
      newArr = newArr.filter((i) => i !== item);
    } else {
      newArr.push(item);
      setLastAdded(item);
    }
    setValid(true);
    setSelectedRasterProps(newArr);
  };

  const onToggleSelectVectorPropsType = (item) => {
    let newArr = [...selectedVectorPropsType];
    if (newArr.length && newArr.find((i) => i === item)) {
      newArr = newArr.filter((i) => i !== item);
    } else {
      newArr.push(item);
      setLastAdded(item);
    }
    setValid(true);
    setSelectedVectorPropsType(newArr);
  };

  const onToggleSelectVectorProps = (item, type) => {
    let newArr = [...selectedVectorProps];
    if (newArr.length && newArr.find((i) => i === item)) {
      newArr = newArr.filter((i) => i !== item);
    } else {
      let newArr1 = [...selectedVectorPropsType];
      if (type !== "") {
        if (newArr1.length && newArr1.find((i) => i === type))
          newArr1 = newArr1.filter((i) => i !== type);
        setSelectedVectorPropsType(newArr1);
      }
      newArr.push(item);
      setLastAdded(item);
    }
    setValid(true);
    setSelectedVectorProps(newArr);
  };
  const toolMenu: MenuProps["items"] = () => {
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
        {
          key: "Point",
          label: "Point",
          onTitleClick: () => onToggleSelectVectorPropsType("Point"),
          children: options[1].children[2].children.map((i) => {
            return {
              key: `${i.title}-Point`,
              label: i.title,
            };
          }),
        },
        {
          key: "MultiLineString",
          label: "MultiLineString",
          onTitleClick: () => onToggleSelectVectorPropsType("MultiLineString"),
          children: options[1].children[0].children.map((i) => {
            return {
              key: `${i.title}-MultiLineString`,
              label: i.title,
            };
          }),
        },
        {
          key: "MultiPolygon",
          label: "MultiPolygon",
          onTitleClick: () => onToggleSelectVectorPropsType("MultiPolygon"),
          children: options[1].children[1].children.map((i) => {
            return {
              key: `${i.title}-MultiPolygon`,
              label: i.title,
            };
          }),
        },
      ],
    },
    {
      key: "raster",
      label: "Raster",
      children: rasterProps.map((i) => {
        return {
          key: `${i.name}-Raster`,
          label: i.name,
        };
      }),
    },
  ];
  const filterMenuOnClick = (e) => {
    const [name, type] = e.key.split("-");
    if (type === "Raster") {
      onToggleSelectRasterProps(name);
    } else {
      onToggleSelectVectorProps(name, type);
    }
  };

  //----------sorting menu
  const sortMenu = [
    {
      key: "0",
      label: "Name",
    },
    {
      key: "1",
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
    const t = Number(time.split(" ")[0]);
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
    const al = { ...allLayers };
    props.loading(true);
    //console.log(groupid);
    try {
      const res = await http.patch(`${apis.EDIT_LAYER_GROUP}`, {
        _id: groupid,
        layers: layerids,
      });

      if (!res.data.status) {
        return message.error(res.data.message);
      }

      keys.forEach((key) => {
        al[key].groupId = groupid;
      });

      const td: any = [...treeStructure];

      td[0].children = td[0].children.map((layer) => {
        if (!layer.group) {
          if (layerids.includes(layer._id)) {
            layer.layerGroupId
              ? (layer.layerGroupId["_id"] = groupid)
              : (layer.layerGroupId = { _id: groupid });
            return layer;
          } else {
            return layer;
          }
        } else {
          layer.value.children = layer.value.children.map((l) => {
            if (layerids.includes(l._id)) {
              l.layerGroupId
                ? (l.layerGroupId["_id"] = groupid)
                : (l.layerGroupId = { _id: groupid });
              return l;
            } else {
              return l;
            }
          });
          return layer;
        }
      });

      td[1].children = td[1].children.map((layer) => {
        if (!layer.group) {
          if (layerids.includes(layer._id)) {
            layer.layerGroupId
              ? (layer.layerGroupId["_id"] = groupid)
              : (layer.layerGroupId = { _id: groupid });
            return layer;
          } else {
            return layer;
          }
        } else {
          layer.value.children = layer.value.children.map((l) => {
            if (layerids.includes(l._id)) {
              l.layerGroupId
                ? (l.layerGroupId["_id"] = groupid)
                : (l.layerGroupId = { _id: groupid });
              return l;
            } else {
              return l;
            }
          });
          return layer;
        }
      });

      setTreeStructure(td);
      setAllLayers(al);
    } catch (err) {
      console.log(err);
      message.error(err.message);
      AxiosErrorHandler(err, props.logout);
    } finally {
      props.loading(false);
    }
  };

  const removeLayerFromGroup = async (groupId, layerId, key) => {
    const al = { ...allLayers };
    props.loading(true);
    try {
      const res = await http.post(`${apis.DELETE_LAYER_ID_FROM_GROUP}`, {
        _id: groupId,
        layers: [layerId],
      });
      if (!res.data.status) {
        return message.error(res.data.message);
      }

      al[key].groupId = null;

      const td: any = [...treeStructure];

      td[0].children = td[0].children.map((layer) => {
        if (!layer.group) {
          if (layer._id === layerId) {
            layer.layerGroupId = null;
            return layer;
          } else {
            return layer;
          }
        } else {
          layer.value.children = layer.value.children.map((l) => {
            if (l._id === layerId) {
              l.layerGroupId = null;
              return l;
            } else {
              return l;
            }
          });
          return layer;
        }
      });

      td[1].children = td[1].children.map((layer) => {
        if (!layer.group) {
          if (layer._id === layerId) {
            layer.layerGroupId = null;
            return layer;
          } else {
            return layer;
          }
        } else {
          layer.value.children = layer.value.children.map((l) => {
            if (l._id === layerId) {
              l.layerGroupId = null;
              return l;
            } else {
              return l;
            }
          });
          return layer;
        }
      });
      setTreeStructure(td);
      setAllLayers(al);
    } catch (err) {
      console.log(err);
      message.error(err.message);
      AxiosErrorHandler(err, props.logout);
    } finally {
      props.loading(false);
    }
  };

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

  const updateTreeDataAfterGroupCreation = (data, type) => {
    const td: any = [...treeStructure];
    let newTreeData = [];
    const al = { ...allLayers };
    const layers = data.layers.map((layer) => {
      return layer._id;
    });

    switch (type) {
      case "vector":
        newTreeData = td[0].children.filter((layer: any) => {
          if (!layer.group) {
            if (!layers.includes(layer._id)) {
              return true;
            } else return false;
          } else {
            let groupLayers = [];

            groupLayers = layer.value.children.filter((l) => {
              if (!layers.includes(l._id)) {
                return true;
              } else return false;
            });

            layer.value.children = [...groupLayers];
            return true;
          }
        });

        td[0].children = [...newTreeData];

        break;
      case "raster":
        newTreeData = td[1].children.filter((layer: any) => {
          if (!layer.group) {
            if (!layers.includes(layer._id)) return true;
            else return false;
          } else {
            let groupLayers = [];

            groupLayers = layer.value.children.filter((l) => {
              if (!layers.includes(l._id)) {
                return true;
              } else return false;
            });

            layer.value.children = [...groupLayers];
            return true;
          }
        });

        td[1].children = [...newTreeData];
        break;
    }

    switch (type) {
      case "vector":
        const vectors = data.layers.map((layer) => {
          al[`1-${layer._id}`].groupId = data._id;
          return {
            key: `1-${layer._id}`,
            ...layer,
          };
        });

        data.children = [...vectors];

        td[0].children.push({
          group: true,
          value: data,
          id: data._id,
          key: "group-" + data._id,
          groupType: 1,
        });

        break;
      case "raster":
        const rasters = data.layers.map((layer) => {
          al[`2-${layer._id}`].groupId = data._id;
          return {
            key: `2-${layer._id}`,
            ...layer,
          };
        });

        data.children = [...rasters];

        td[1].children.push({
          group: true,
          value: data,
          id: data._id,
          key: "group-" + data._id,
          groupType: 2,
        });
    }

    const ag = { ...allLayerGroups };

    ag[data._id] = {
      id: data._id,
      name: data.name,
      groupType: type === "vector" ? 1 : 2,
    };

    setAllLayerGroups(ag);
    setAllLayers(al);

    setTimeout(() => {
      setTreeStructure(td);
      forceUpdateAllLayers();
      setVisibleGroupCreateModal(false);
      resetGroupFormFields();
    });
  };

  const createLayerGroup = (data) => {
    props.loading(true);
    const layersToGroup = [];
    const type = moveType === 1 ? "vector" : "raster";
    switch (moveType) {
      case 1:
        checkedKeys.forEach((ele: any) => {
          const k = ele.split("-");
          if (k[0] === "1") {
            layersToGroup.push(k[1]);
          }
        });
        break;
      case 2:
        checkedKeys.forEach((ele: any) => {
          const k = ele.split("-");
          if (k[0] === "2") {
            layersToGroup.push(k[1]);
          }
        });
        break;
      default:
        return;
    }

    http
      .post(`${apis.CREATE_GROUP_LAYER}`, {
        name: data.name,
        layers: layersToGroup,
      })
      .then((result) => {
        if (result.data.status) {
          message.success("Group Created");
          updateTreeDataAfterGroupCreation(result.data.data[0], type);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const moveLayers = async (data) => {
    // props.loading(true)
    try {
      const layersToMove = [];

      checkedKeys.forEach((ele: any) => {
        const k = ele.split("-");

        if (k[0] == moveType) {
          layersToMove.push(k[1]);
        }
      });

      await updateTreeDataAfterMovingLayers(
        data.group,
        layersToMove,
        checkedKeys
      );
    } catch (err) {
      console.log(err);
      message.error(err.message);
    } finally {
      setMoveToOtherGroupModal(false);
      toGroupForm.resetFields();
      props.loading(false);
    }
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
              {Object.entries(allLayerGroups).map(
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
              )}
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

  const resetGroupFormFields = () => {
    groupForm.resetFields();
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      cancelDrawing();
    }
  };

  return (
    <div className="map_wrapper" onKeyDown={handleKeyDown}>
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
        getCursor={() => {
          return isDrawing ? "crosshair" : "grab";
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
        onClick={(info, event) => {
          setShowDrawingTools(false);
          if (event.rightButton) {
            if (!info.layer) {
              // setMode({
              //   mode: ViewMode,
              // });
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
          <StaticMap mapboxApiAccessToken={MAPBOX_API_KEY} mapStyle={mapMode} />
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
                      allLayers={allLayers}
                      flag={flag}
                      setFlag={setFlag}
                      setShouldAttributeTableReload={
                        setShouldAttributeTableReload
                      }
                      shouldAttributeTableReload={shouldAttributeTableReload}
                      canDraw={perms.canCreateVectorLayer}
                      isBaseMap={props.isBaseMaps}
                      isPublic={false}
                      setThumbnail={setThumbnail}
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
                open={showPopup}
                style={{ position: "relative" }}
                onOpenChange={() => handleClose(false)}
              />
            </HtmlOverlayItem>
          </HtmlOverlay>
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
              {showMarkerSizeTool && (
                <Tooltip placement="bottom" title="Marker Size">
                  <div className="marker-size-tool">
                    <Slider
                      min={0.3}
                      max={1}
                      onChange={onChangeSizeSlider}
                      value={pointMarkerSize}
                      step={0.1}
                      defaultValue={1}
                      tooltip={{ placement: "right" }}
                    />
                  </div>
                </Tooltip>
              )}
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
                      checked={timeEnabled}
                      onChange={(e) => setTimeEnabled(e.target.checked)}
                      style={{
                        marginTop: "2px",
                        marginRight: "6px",
                        marginLeft: "6px",
                      }}
                    />{" "}
                    <Text strong>Time Filter</Text>
                    <div
                      style={{
                        display: timeFilter ? "inline" : "none",
                        transition: "0.2s",
                      }}
                    >
                      {time && (
                        <span style={{ margin: "0 5px" }}>
                          {dateFormat()} - {moment().format("DD MMM")}{" "}
                        </span>
                      )}

                      <Select
                        defaultValue="100 days"
                        size="small"
                        onChange={(value) => setTime(value)}
                        disabled={!timeEnabled}
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
        style={{ right: sideBarState === false ? "10px" : "354px" }}
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
              {totalLayers !== 0 && (
                <Text type="secondary">Results: {totalLayers}</Text>
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
                menu={{ items: filterMenu, onClick: filterMenuOnClick }}
                //overlay={filterMenu}
                disabled={chipsLoading}
                //overlayStyle={{}}
              >
                <Button style={{ float: "right" }} type="link">
                  Filter <DownOutlined />
                </Button>
              </Dropdown>
            </div>
            <div
              style={{
                display: "flex",
                flexFlow: "row",
                marginTop: "5px",
                marginBottom: "5px",
                overflow: "auto",
              }}
            >
              <Tag
                style={{ display: timeEnabled ? "inline" : "none" }}
                // color='#108ee9'
                icon={
                  chipsLoading ? <SyncOutlined spin /> : <CheckCircleOutlined />
                }
                color="blue"
                closable
                onClose={() => setTimeEnabled(false)}
              >
                Last {time}
              </Tag>
              {selectedRasterProps &&
                selectedRasterProps.map((tag) => (
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
                    onClose={() => onToggleSelectRasterProps(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              {selectedVectorPropsType &&
                selectedVectorPropsType.map((tag) => (
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
                    onClose={() => onToggleSelectVectorPropsType(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              {selectedVectorProps &&
                selectedVectorProps.map((tag) => (
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
                    onClose={() => onToggleSelectVectorProps(tag, "")}
                  >
                    {tag}
                  </Tag>
                ))}
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
                      description="Create a new layer by uploading a vector file (.geojson, .shp, .kml) or raster file (only .tif)"
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
                        message={`Only .geojson and .kml files support for type "Vector" and .tif for type "Raster"`}
                        type="info"
                        showIcon
                      />
                      <Form.Item label="Upload File" name="file">
                        <Upload {...uploadProps}>
                          <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>

                        {uploading ? (
                          <Progress strokeLinecap="square" percent={progress} />
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
              options={options[1].children[2].children}
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
              options={options}
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
                          defaultValue={defaultLayerType}
                          options={getEditLayerTypeOptions(defaultLayerType)}
                          placeholder="Select Layer Type"
                          onChange={(value) => {
                            const temp = String(value[value.length - 1]).split(
                              "-"
                            );
                            const updatedTypeId = temp[temp.length - 2];
                            setLayerTypeId(updatedTypeId);
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
              checkedKeys={checkedKeys}
              onSelect={onSelect}
              selectedKeys={selectedKeys}
              treeData={treeDataa}
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
                    setSelectedIndexes={setSelectedIndexes}
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
                    allLayers={allLayers}
                    refreshLayer={refreshLayer}
                    setRefreshLayer={setRefreshLayer}
                    invertColor={invertColor}
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
                    if (pr === 1.5) {
                      setBottomBarHeight("900px");
                    } else {
                      setBottomBarHeight("900px"); ///-----------adjust height
                    }
                  } else if (height >= 768) {
                    if (pr === 1.5) {
                      setBottomBarHeight("700px");
                    } else {
                      setBottomBarHeight("700px"); ///-----------adjust height
                    }
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
                      if (pr === 1.5) {
                        setBottomBarHeight("480px");
                      } else {
                        setBottomBarHeight("480px");
                      }
                    } else if (height >= 768) {
                      if (pr === 1.5) {
                        setBottomBarHeight("240px");
                      } else {
                        setBottomBarHeight("240px");
                      }
                    } else if (height >= 720) {
                      if (pr === 1.5) {
                        setBottomBarHeight("240px");
                      } else {
                        setBottomBarHeight("240px");
                      }
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
          vectorProps={vectorProps}
          visible={formDrawerVisible}
          setVisible={setformDrawerVisible}
          mode={drawMode ? drawMode : "PolygonView"}
          vectorLayers={vectorLayers}
          features={featureState}
          missionId={id}
          loading={props.loading}
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
        setViewport={setViewport}
        layer={{ ...allLayers[`1-${featureLayer}`] }}
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
          {scales.map((scale: any) => (
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
                  settings={scale.settings}
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

const mapStateToProps = (state) => {
  return {
    userType: state.Auth.userdetails.userType,
    userDetails: state.Auth.userdetails,
    Thread: state.Thread,
  };
};

export default connect(mapStateToProps, {
  loading,
  logout,
  thread,
})(BaseMap);
