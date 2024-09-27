import React, { useState, useEffect, useRef, useMemo, useContext } from "react";
import KesowaNewLogo from "../../../../static/kesowa-black.png";
import { DataFilterExtension } from "@deck.gl/extensions";
import * as turf from "@turf/turf";
import {
  Row,
  Col,
  Typography,
  Button,
  Tooltip,
  Spin,
  message,
  Tree,
  Dropdown,
  Modal,
  Input,
  Select,
  Space,
  MenuProps,
  DatePicker,
  Badge,
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
  FlagOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import "../../index.less";
import DeckGL from "@deck.gl/react";
import { FlyToInterpolator } from "deck.gl";
import { BitmapLayer, } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { HTMLOverlayItem, HTMLOverlay } from "src/components/shared/HTMLOverlay";
import { EditableGeoJsonLayer } from "@deck.gl-community/editable-layers";
import {
  DrawPolygonMode,
  ModifyMode,
  ViewMode,
  DrawLineStringMode,
  GeoJsonEditMode,
} from "@deck.gl-community/editable-layers";
import { StaticMap } from "react-map-gl";
import InfoWindowContent from "../../utils/infoWindow";

import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import moment from "moment";
import { useParams } from "react-router-dom";

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
import { AxiosResponse } from "axios";
import { IMission } from "src/types/mission";
import { ILayer } from "src/types/layer";
import { BBox, mergeBoundingBoxes, GeoJson } from "src/types/geojson";
import { Layer, ILayerToDeckLayer } from "../../layerRender";
import { ILayersToTree } from "../../treeRender";
import { WebMercatorViewport } from "viewport-mercator-project";
import Fuse from "fuse.js";
import { featureType } from "src/static/vectorprops";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

interface Config {
  mode: typeof GeoJsonEditMode;
}

const { Title, Text } = Typography;

const { Option } = Select;

const { Search } = Input;

const DEFAULT_LOCATION = {
  lat: 22.571194159512256,
  lng: 88.49175358524279,
};

function PublicMap(props) {
  const selectedLayer = decodeURI(window.location.hash).slice(1); // Get selected layer from url hashed part
  const [osmState, setOsmState] = useState(false);
  const [errorState, setErrorState] = useState("");

  const { logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);

  // Viewport settings
  const [INITIAL_VIEW_STATE, setViewport] = useState<any>({
    longitude: DEFAULT_LOCATION.lng,
    latitude: DEFAULT_LOCATION.lat,
    zoom: 13,
    pitch: 0,
    minZoom: 0,
    maxZoom: 22,
    bearing: 0,
  });

  // ---- setting map location -----------------
  useEffect(() => {
    if (!props.isMissionMap) {
      if (navigator.geolocation) {
        if (navigator.permissions !== undefined) {
          navigator.permissions
            .query({ name: "geolocation" })
            .then(function (result: any) {
              if (result.state === "granted") {
                navigator.geolocation.getCurrentPosition(function (pos: any) {
                  const crd = pos.coords;
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

        return [
          new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north],
          }),
        ];
      },
    }),
  ];

  const [showPopup, togglePopup] = useState(false);
  // const [searching, SetSearching] = useState(false);
  // const [searchValue, setSearchValue] = useState("");
  const [fuse, setFuse] = useState<
    {
      layerId: string;
      searchIndex: Fuse<any>;
    }[]
  >([]);
  const [featureData, setFeatureData] = useState<any>([]);
  const [sysId, setSysId] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [sideBarState, setSideBarState] = useState(true);
  const [sideBarIcon, setSideBarIcon] = useState(<DoubleRightOutlined />);
  const [mapMode, setMapMode] = useState("mapbox://styles/mapbox/streets-v8");

  const [bottomBarHeight, setBottomBarHeight] = useState("240px");

  const [tenantName, setTenantName] = useState("");
  const [mission, setMission] = useState<IMission>("");

  const [layerName, setLayerName] = useState("");
  const [infoWindowMode, setInfoWindowMode] = useState("");
  const [activeKey, setActiveKey] = useState<any>();
  const [panes, setPanes] = useState<any>([]);
  const [tabKeys, setTabKeys] = useState<any>([]);
  // const [drawMode, setdrawMode] = useState("");
  // const [formDrawerVisible, setformDrawerVisible] = useState(false);
  // const [viewImages, setViewImages] = useState(false);

  const [saveButtonShow, setSaveButtonShow] = useState(false);
  // const [showForm, setShowForm] = useState(false);
  // const [toolSelected, setToolSelected] = useState("");

  // const [activeType, setActiveType] = useState(false);
  const [sortType, setSortType] = useState("");
  // const [isAscending, setIsAscending] = useState(true);
  const isAscending = true;

  const [layerLoading, setLayerLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (layerLoading) {
        setLayerLoading(false);
      }
    }, 1000);
  }, [layerLoading]);

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

  const [layerToAddInAttributeTable, setlayerToAddInAttributeTable] =
    useState<any>(null);

  const { id, tenantId, missionId } = useParams<any>(); // fetch id from url

  // ----------------------------------------- disable default right click event of browser ----------------------------------------------------------
  useEffect(() => {
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }, []);

  useEffect(() => {
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
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [featureLayer, setFeatureLayer] = useState("");

  // const [activeID, setActiveID] = useState("");
  const onExpand = (expandedKeysValue: React.Key[]) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const [AllLayers, SetAllLayers] = useState<Layer[]>([]);
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
    console.log("sysid:", sysId);
    setCoordinates(coordinate);
    setSysId(sysId);
    setFeatureData(feature);
    setLayerName(layername);
    setInfoWindowMode(mode);
    setFeatureLayer(id);
    console.log("togglePopup:", showPopup);
    togglePopup(true);
    console.log("togglePopup:", showPopup);
    setSaveButtonShow(show);
  }

  function handleClose(status: boolean) {
    togglePopup(status);
  }

  //-------------on layer check-------------------------------

  const calculateViewport = (bbox: BBox) => {
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
  const focusSelectedLayers = () => {
    const boundingBoxes: BBox[] = [];
    for (const layer of AllLayers) {
      if (layer._isChecked && layer._metadata?.bounds) {
        boundingBoxes.push(layer._metadata.bounds);
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

  const fetchLayerBounds = async (
    type: string,
    layerpath: string,
  ) => {
    let bounds: BBox;
    if (type === "Vector") {
      const response = await fetch(STATIC_URL + layerpath);
      const data = await response.json();
      let features = data.features;
      bounds = turf.bbox(turf.featureCollection(features)) as BBox;
    } else {
      const metaDataURL = `${COG_URL}/cog/info?url=${TITILER_STATIC}${layerpath}`;
      const response = await fetch(metaDataURL, {
        method: "GET",
      });
      const metadata = await response.json();
      bounds = [
        metadata["bounds"][0],
        metadata["bounds"][1],
        metadata["bounds"][2],
        metadata["bounds"][3],
      ] as BBox;
    }
    return bounds;
  };
  const onCheck = async (checkedKeysValue: any[], e) => {
    const layersWithBounds: Layer[] = [];

    for (const layer of AllLayers) {
      const _isChecked = checkedKeysValue.includes(layer._id);
      if (_isChecked && !layer._metadata?.bounds) {
        const bounds = await fetchLayerBounds(
          layer.type,
          layer.layerpath,
        );
        layersWithBounds.push({
          ...layer,
          _isChecked,
          _metadata: {
            ...layer._metadata,
            bounds,
          },
        });
      } else {
        layersWithBounds.push({
          ...layer,
          _isChecked,
        });
      }
    }

    SetAllLayers(layersWithBounds);
  };

  // ++++++++++++++++++++++++++++++++++++++++++++++++ Start Drawing +++++++++++++++++++++++++++++++++++++++++++++++++++++

  const [isDrawing, setIsDrawing] = useState(false);

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
    console.log("togglePopup:", showPopup);
    togglePopup(false);
    // setShowForm(false);
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    setSelectedKeys(selectedKeysValue);
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
    setLoading(true);
    getAllLayers();
  }, []);

  useEffect(() => {
    if (fuse.length !== AllLayers.length) {
      getSearchIndexes();
    }
  }, [AllLayers]);

  //---------------Fetch all layers in mission----------------------------------------

  const getAllLayers = async () => {
    try {
      let result: AxiosResponse<{
        status: boolean;
        message: string;
        mission: IMission;
        data: ILayer[];
      }>;
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
      if (result.data.status) {
        SetAllLayers(
          result.data.data.map((layer) => ({
            ...layer,
            _isChecked: layer.name == selectedLayer,
          }))
        );
        if (props.isMissionMap) {
          setViewport({
            latitude: result.data.centerPoints.lat,
            longitude: result.data.centerPoints.lng,
            zoom: 13,
            pitch: 0,
            minZoom: 0,
            maxZoom: 22,
            bearing: 0,
            transitionDuration: 1000,
            transitionInterpolator: new FlyToInterpolator(),
          });
        }
        setTenantName(result.data.data[0].tenantId.name);
      } else {
        message.error(result.data.message);
      }
    } catch (err) {
      console.log(err);
      setErrorState(err.response.status);
      setLoading(false);
      AxiosErrorHandler(err, logout);
    } finally {
      setLoading(false);
    }
  };

  const getTreeData = (layer, type, keyPrefix) => {
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
            featureType[layer.vector],
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
    const menuOnClick: MenuProps["onClick"] = (e) => {
      switch (e.key) {
        case "1":
          setgroupName(value.name);
          setgroupToEdit({
            id: id,
            name: value.name,
          });
          setVisibleEditModal(true);
          break;
        case "2":
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
              console.error("something tried to delete group:" + id);
            },
          });
          break;
        default:
          console.log("Incorrect selection");
          break;
      }
    };
    const menuItem: MenuProps["items"] = [
      {
        key: "1",
        label: "Rename",
      },
      {
        key: "2",
        label: "Delete",
      },
    ];
    return {
      title: (
        <>
          <Dropdown
            menu={{ items: menuItem, onClick: menuOnClick }}
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
  const renderRangePicker = () => {
    const disabledDate = (current) => {
      return current && current > moment();
    };
    return (
      <DatePicker.RangePicker
        defaultValue={[moment(dateRange[0]), moment(dateRange[1])]}
        disabledDate={disabledDate}
        disabled={false}
        format="DD-MM-YYYY"
        onChange={onRangeChange}
      />
    );
  };

  const getTitleElement = (layer: Layer) => {
    return (
      <Dropdown menu={{ items: [] }} trigger={["contextMenu"]}>
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
    return (
      <Dropdown menu={{ items: [] }} trigger={["contextMenu"]}>
        <Text style={{ width: "160px" }} ellipsis={true}>
          {layerGroup.name}
        </Text>
      </Dropdown>
    );
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
  };

  useEffect(() => {
    if (layerToAddInAttributeTable) {
      const { name, type, id, path, count } = layerToAddInAttributeTable;
      add(name, type, id, path, count);
    }
  }, [layerToAddInAttributeTable]);


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
        // setToolSelected("");

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
            "",
            // drawMode,
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
  const menu = [
    {
      key: "0",
      label: "Name",
    },
    {
      key: "1",
      label: "Time",
    },
  ];
  const menuOnClick: MenuProps["onClick"] = (e) => {
    switch (e.key) {
      case "0":
        setSortType("name");
        break;
      case "1":
        setSortType("createdAt");
        break;
      default:
        break;
    }
  };

  // Set Active Layer Type
  useEffect(() => {
    panes.map((pane) => {
      if (pane.id === activeKey && pane.type === "vector") {
        // setActiveID(pane.id);
      }
      // if (pane.id === activeKey) setActiveType(pane.type === "vector");
    });
  }, [activeKey]);

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
  // Is layer group changing allowed in public map ?
  // const onDrop = (info) => {
  //   try {
  //     if (info.dragNode && !info.dragNode.group) {
  //       // allow only individual layers to be dragged and dropped, not entire layer groups
  //       const key = info.dragNode.key;
  //       const layerId = info.dragNode._id;
  //       const oldGroupId = info.dragNode.groupId;
  //       const newGroupId = info.node.groupId;

  //       if (!newGroupId) {
  //         if (info.node.pos === "0-0") return;
  //         // the node under which it was dragged is not a layer group, so it must have been dragged under "Vector" or "Raster"
  //         // this means it was actually ungrouped
  //         await removeLayerFromGroup(oldGroupId, layerId);
  //       } else {
  //         // layer was moved under a new group
  //         //console.log(layerid, newGroupId);
  //         await changeGroupOfLayer(newGroupId, [layerId], [key]);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const [showDrawingTools, setShowDrawingTools] = useState(false);
  // const [toolCoordinates, settoolCoordinates] = useState([0, 0]);
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

  // Handle Current Layer

  // Public map search
  // useEffect(() => {
  //   if (searchValue) {
  //     SetSearching(true);
  //     http
  //       .get<components["schemas"]["SearchPublicLayerResponse"]>(
  //         `${apis.PUBLIC_SEARCH}`,
  //         {
  //           params: {
  //             mapRef: id,
  //             key: "PremisesNo",
  //             value: searchValue,
  //           },
  //         }
  //       )
  //       .then((res: any) => {
  //         if (res.data.status) {
  //           console.log("search successful", res.data);
  //           // setActiveID(res.data.layerId);
  //           const centerPoint = turf.centroid(res.data.data[0]);
  //           setViewport({
  //             longitude: centerPoint.geometry.coordinates[0],
  //             latitude: centerPoint.geometry.coordinates[1],
  //             zoom: 15,
  //             pitch: 0,
  //             minZoom: 0,
  //             maxZoom: 22,
  //             bearing: 0,
  //             transitionDuration: 1000,
  //             transitionInterpolator: new FlyToInterpolator(),
  //           });
  //         } else {
  //           console.log("search failed", res.data);
  //           message.warning("No match found!");
  //         }
  //       })
  //       .catch((err: any) => {
  //         console.log(err);
  //         AxiosErrorHandler(err, logout);
  //       })
  //       .finally(() => SetSearching(false));
  //   } else {
  //     // setActiveID("");
  //   }
  // }, [searchValue]);

  const getSearchIndexes = async () => {
    const searchIndexes: {
      layerId: string;
      searchIndex: Fuse<any>;
    }[] = [];

    for (const layer of AllLayers) {
      const dataResponse = await fetch(STATIC_URL + layer.layerpath);
      const data = (await dataResponse.json()) as GeoJson;
      const searchIndexResponse = await fetch(
        STATIC_URL + String(layer.metadata?.searchIndexPath)
      );
      const searchIndex = await searchIndexResponse.json();
      searchIndexes.push({
        layerId: layer._id,
        searchIndex: new Fuse(
          data.features,
          { threshold: 0 },
          Fuse.parseIndex<any>(searchIndex)
        ),
      });
    }

    setFuse(searchIndexes);
  };

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
              layers={(() => {
                const layers: any[] = [];

                // OSMState Layers
                if (osmState) layers.push(osm);

                // Drawing State Layers
                if (isDrawing) {
                  layers.push(drawPolygonTool);
                } else {
                  // layers.push(maskLayer);
                }

                // Tree Menu Layers
                layers.push(
                  useMemo(() => ILayerToDeckLayer(AllLayers), [AllLayers])
                );

                return layers;
              })()}
              style={{ height: "100vh", width: "100%" }}
              onClick={(info, event) => {
                // setShowDrawingTools(false);
                if (event.rightButton) {
                  if (!info.layer) {
                    setMode({
                      mode: ViewMode,
                    });
                    // setToolSelected("");
                    // setShowDrawingTools(false);
                    // settoolCoordinates([
                    //   event.offsetCenter.x,
                    //   event.offsetCenter.y - 50,
                    // ]);
                    // setShowDrawingTools(true);
                    drawingMenuRef.current.click();
                  }
                } else {
                  // setShowDrawingTools(false);
                }
              }}
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

              { showPopup &&
                (
                <HTMLOverlay>
                 <HTMLOverlayItem coordinates={coordinates}>
                    <Popover
                      content={
                        <>
                          <InfoWindowContent
                            mode={infoWindowMode}
                            coordinates={coordinates}
                            token={MAPBOX_API_KEY}
                            feature={featureData}
                            featureIndex={sysId}
                            setformDrawerVisible={(arg: boolean) => {}}
                            setImagesDrawer={(arg: boolean) => {}}
                            show={saveButtonShow}
                            setShowForm={(arg: boolean) => {}}
                            cancelDrawing={cancelDrawing}
                            togglePopup={togglePopup}
                            layerId={featureLayer}
                            canDraw={null}
                            isPublic={true}
                            isBaseMap={false}
                            AllLayers={AllLayers}
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
                      onVisibleChange={() => handleClose(false)}
                    />
                  </HTMLOverlayItem>
                </HTMLOverlay>
              )}
            </DeckGL>

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
                    onSearch={(e) => {
                      const searchValue = e;
                      for (const f of fuse) {
                        const searchResult =
                          f.searchIndex.search(searchValue)[0];
                        if (searchResult) {
                          // check the layer sothat feature is visible on map
                          SetAllLayers((prev) =>
                            prev.map((layer) => {
                              if (layer._id === f.layerId)
                                layer._isChecked = true;
                              return layer;
                            })
                          );
                          // bring the feature to focus
                          const bounds = turf.bbox(
                            turf.featureCollection([searchResult.item])
                          ) as BBox;
                          const { longitude, latitude, zoom } =
                            calculateViewport(bounds);
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
                          message.success("Feature found!");
                          return;
                        }
                      }
                      message.warn("No match found!");
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
                              onClick={() => console.error("Something tried to sort:" + false)}
                              style={{
                                color: isAscending ? "#1890ff" : "#000",
                                fontSize: "1.2rem",
                                marginTop: "0.5rem",
                                marginBottom: "0.5rem",
                              }}
                            />
                            <SortDescendingOutlined
                              onClick={() => console.error("Something tried to sort:" + false)}
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
                          menu={{ items: menu, onClick: menuOnClick }}
                          trigger={["click"]}
                        >
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
                    // onDrop={onDrop}
                    // draggable={(node: any) => {
                    //   if (node.key === "1" || node.key === "2") return false;
                    //   return true;
                    // }}
                    draggable={false}
                    blockNode
                  />
                </div>
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

export default PublicMap;
