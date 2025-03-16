import React, { useState, useEffect, useMemo, useContext } from "react";
import KesowaNewLogo from "../../../../static/kesowa-black.png";
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
  DoubleLeftOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  FlagOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import "../../index.less";
import DeckGL from "@deck.gl/react";
import { FlyToInterpolator } from "deck.gl";
import { BitmapLayer, } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { HTMLOverlayItem, HTMLOverlay } from "src/components/shared/HTMLOverlay";
import {
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
import { BBox, GeoJson } from "src/types/geojson";
import { Layer, ILayerToDeckLayer } from "../../layerRender";
import { ILayersToTree } from "../../treeRender";
import { WebMercatorViewport } from "viewport-mercator-project";
import Fuse from "fuse.js";
import { featureType, featureTypes } from "src/static/vectorprops";
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
  const [errorState, setErrorState] = useState(-1);

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
  const [fuse, setFuse] = useState<
    {
      layerId: string;
      searchIndex: Fuse<any>;
    }[]
  >([]);
  const [featureData, setFeatureData] = useState<any>([]);
  const [coordinates, setCoordinates] = useState([]);
  const [sideBarState, setSideBarState] = useState(true);
  const [sideBarIcon, setSideBarIcon] = useState(<DoubleRightOutlined />);
  const [mapMode, setMapMode] = useState("mapbox://styles/mapbox/streets-v8");

  const [tenantName, setTenantName] = useState("");
  const [mission, setMission] = useState<IMission>("");

  const [layerName, setLayerName] = useState("");
  const [infoWindowMode, setInfoWindowMode] = useState("");

  const [sortType, setSortType] = useState("");
  const [isAscending, setIsAscending] = useState(true);

  const [layerLoading, setLayerLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (layerLoading) {
        setLayerLoading(false);
      }
    }, 1000);
  }, [layerLoading]);

  const { id, tenantId, missionId } = useParams<any>(); // fetch id from url

  // ----------------------------------------- disable default right click event of browser ----------------------------------------------------------
  useEffect(() => {
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }, []);

  useEffect(() => {
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
    id: any,
  ) {
    setCoordinates(coordinate);
    setFeatureData(feature);
    setLayerName(layername);
    setInfoWindowMode(mode);
    setFeatureLayer(id);
    togglePopup(true);
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

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    setSelectedKeys(selectedKeysValue);
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
    let nameTextWidth: string;
    if (layer.type === "Raster") nameTextWidth = layer.layerGroupId ? "139px" : "160px";
    else nameTextWidth = layer.layerGroupId ? "119px" : "140px";
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
                width: nameTextWidth,
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

  const memoizedAllLayers = useMemo(() => ILayerToDeckLayer(AllLayers), [AllLayers]);
  const computeLayers = () => {
    const layers: any[] = [];

    // OSMState Layers
    if (osmState) layers.push(osm);

    // Tree Menu Layers
    layers.push(memoizedAllLayers);

    return layers;
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
              layers={computeLayers()}
              style={{ height: "100vh", width: "100%" }}
              onClick={(info, _) => {
                if (info.layer) {
                  const layer = AllLayers.find((layer) => layer.type === 'Vector' && info.layer?.id === layer._id);
                  if (layer) {
                    InfoWindow(
                      info.coordinate,
                      layer.name,
                      (featureType[layer.vector] === featureTypes.POINT) ? "PointView" : "PolygonView",
                      info.object,
                      layer._id,
                    );
                }
              }}}
            >
              {osmState ? (
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
                          <InfoWindowContent
                            mode={infoWindowMode}
                            coordinates={coordinates}
                            token={MAPBOX_API_KEY}
                            feature={featureData}
                            layerId={featureLayer}
                            show={false}
                            canDraw={false}
                            isPublic={true}
                            isBaseMap={false}
                            missionLayer={"Vector"}
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
                              if (layer._id === f.layerId) {
                                layer._isChecked = true;
                                layer._metadata = {
                                  ...layer._metadata,
                                  highlightIndexes: [searchResult.refIndex],
                                }
                              }
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
                      // this section is reached both when search failed AND when search cleared
                      if (searchValue !== "") message.warn("No match found!");
                      SetAllLayers((prev) =>
                        prev.map((layer) => {
                          layer._metadata = {
                            ...layer._metadata,
                            highlightIndexes: [],
                          }
                          return layer;
                        })
                      );
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
                                {mission?.name || ""}
                              </Text>
                            </Text>
                            <Text type="primary">
                              ID:{" "}
                              <Text type="secondary" copyable>
                                {mission?._id || ""}
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
                              onClick={() => setIsAscending(true)}
                              style={{
                                color: isAscending ? "#1890ff" : "#000",
                                fontSize: "1.2rem",
                                marginTop: "0.5rem",
                                marginBottom: "0.5rem",
                              }}
                            />
                            <SortDescendingOutlined
                              onClick={() => setIsAscending(false)}
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
