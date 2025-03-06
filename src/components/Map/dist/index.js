"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.MASK_ID = exports.getPolygon = void 0;
var react_1 = require("react");
var infoWindow_1 = require("./utils/infoWindow");
var ColorScale_1 = require("./utils/ColorScale");
var downloadjs_1 = require("downloadjs");
var viewport_mercator_project_1 = require("viewport-mercator-project");
var extensions_1 = require("@deck.gl/extensions");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var tb_1 = require("react-icons/tb");
var MarkerIcon_png_1 = require("../../static/MarkerIcon.png");
var TankIcon_png_1 = require("../../static/TankIcon.png");
var location_svg_1 = require("../../static/location.svg");
var ValveIcon_png_1 = require("../../static/ValveIcon.png");
var DotIcon_png_1 = require("../../static/DotIcon.png");
var react_color_1 = require("react-color");
require("./index.less");
var line_svg_1 = require("../../static/line.svg");
var angle_svg_1 = require("../../static/angle.svg");
var polygon_svg_1 = require("../../static/polygon.svg");
var volume_svg_1 = require("../../static/volume.svg");
var react_2 = require("@deck.gl/react");
var deck_gl_1 = require("deck.gl");
var layers_1 = require("@deck.gl/layers");
var layers_2 = require("@deck.gl/layers");
var geo_layers_1 = require("@deck.gl/geo-layers");
var HTMLOverlay_1 = require("../shared/HTMLOverlay");
var editable_layers_1 = require("@deck.gl-community/editable-layers");
var editable_layers_2 = require("@deck.gl-community/editable-layers");
var react_map_gl_1 = require("react-map-gl");
var mapAttributes_1 = require("./utils/mapAttributes");
var apis_1 = require("../../services/apis");
var httpCall_1 = require("../../services/httpCall");
var httpErrorHandle_1 = require("../../services/httpErrorHandle");
var moment_1 = require("moment");
var react_router_dom_1 = require("react-router-dom");
var VectorForm_1 = require("./utils/VectorForm");
var Media_1 = require("./utils/Media");
var layerDocs_1 = require("./utils/layer/layerDocs");
var createLayer_1 = require("./utils/layer/createLayer");
var createBaseLayer_1 = require("./utils/layer/createBaseLayer");
var socket_io_client_1 = require("socket.io-client");
var Thread_1 = require("../shared/Thread");
var constants_1 = require("src/constants");
var turf = require("@turf/turf");
var nav_icon_png_1 = require("../../static/nav_icon.png");
var layerRender_1 = require("./layerRender");
var treeRender_1 = require("./treeRender");
var geojson_1 = require("src/types/geojson");
var colorUtils_1 = require("./colorUtils");
var vectorprops_1 = require("src/static/vectorprops");
var rasterprops_1 = require("src/static/rasterprops");
var propUtils_1 = require("./utils/propUtils");
var elevationTooltip_1 = require("./utils/elevationTooltip");
var fileUpload_1 = require("src/services/fileUpload");
var permissions_1 = require("src/static/permissions");
var FourOhOne_1 = require("../shared/Error/FourOhOne");
var authUtils_1 = require("src/services/authUtils");
var Loader_1 = require("../shared/Loader");
var threadUtils_1 = require("src/services/threadUtils");
var elevationTooltip_2 = require("./utils/elevationTooltip");
var SvgToGeojson = react_1.lazy(function () { return Promise.resolve().then(function () { return require("../Digitizer/svgToGeojson"); }); });
var volumeCal_1 = require("./utils/volumeCal");
exports.getPolygon = function (lat, lng, size) { return [
    [lat - size * 0.5, lng - size * 0.5],
    [lat + size * 0.5, lng - size * 0.5],
    [lat + size * 0.5, lng + size * 0.5],
    [lat - size * 0.5, lng + size * 0.5],
]; };
var DRAW_EDIT_POLYGON = new editable_layers_2.CompositeMode([
    new editable_layers_2.DrawPolygonMode(),
    new editable_layers_2.ModifyMode(),
]);
var DRAW_EDIT_LINE = new editable_layers_2.CompositeMode([
    new editable_layers_2.DrawLineStringMode(),
    new editable_layers_2.ModifyMode(),
]);
var DRAW_EDIT_POINT = new editable_layers_2.CompositeMode([
    new editable_layers_2.DrawPointMode(),
    new editable_layers_2.ModifyMode(),
]);
var Title = antd_1.Typography.Title, Text = antd_1.Typography.Text, Link = antd_1.Typography.Link;
var Dragger = antd_1.Upload.Dragger;
var Option = antd_1.Select.Option;
var SubMenu = antd_1.Menu.SubMenu;
var Meta = antd_1.Card.Meta;
exports.MASK_ID = "MaskLayerGeofence";
function BaseMap(props) {
    var _this = this;
    var _a = react_1.useState(false), refreshLayer = _a[0], setRefreshLayer = _a[1];
    var _b = react_1.useState(false), isMinimise = _b[0], setMinimise = _b[1];
    var _c = react_1.useState("#000"), pointMarkerColour = _c[0], setPointMarkerColour = _c[1];
    var _d = react_1.useState({}), missionData = _d[0], setMissionData = _d[1];
    var _e = react_1.useState(props.isBaseMap ? false : true), loader = _e[0], setLoader = _e[1];
    var _f = react_1.useState(""), thumbnail = _f[0], setThumbnail = _f[1];
    var _g = react_1.useState({}), threadDetails = _g[0], setThreadDetails = _g[1];
    var _h = react_1.useState({}), geoJsonVOD = _h[0], setGeoJsonVOD = _h[1];
    var _j = react_1.useState({}), geoJsonAlert = _j[0], setGeoJsonAlert = _j[1];
    var _k = react_1.useState(""), srtVideoPath = _k[0], setSrtVideoPath = _k[1];
    var _l = react_1.useState(false), showFlightPath = _l[0], setShowFlightPath = _l[1];
    var _m = react_1.useState([]), marker = _m[0], setMarker = _m[1];
    var _o = react_1.useState(0), bearing = _o[0], setBearing = _o[1];
    var _p = react_1.useState(false), isMaskLayerVisible = _p[0], setisMaskLayerVisible = _p[1];
    var _q = react_1.useState([]), flightPath = _q[0], setFlightPath = _q[1];
    var _r = react_1.useState(""), missionLayer = _r[0], setMissionLayer = _r[1];
    var _s = react_1.useState({}), videoDetails = _s[0], setVideoDetails = _s[1];
    var _t = react_1.useState(false), showCarousel = _t[0], setShowCarousel = _t[1];
    var _u = react_1.useState(false), terrainmap = _u[0], setTerrainMap = _u[1];
    var _v = react_1.useState(false), volumeCalculation = _v[0], setVolumeCalculation = _v[1];
    // const [overlayId, setOverlayID] = useState<string>();
    var _w = react_1.useState(false), isElevationEnabled = _w[0], setIsElevationEnabled = _w[1];
    var isElevationEnabledRef = react_1.useRef(isElevationEnabled);
    var _x = react_1.useState([
        moment_1["default"](moment_1["default"]().subtract(7, "d").format("YYYY-MM-DD") + " " + "00:00", "YYYY-MM-DD HH:mm").format(),
        moment_1["default"](moment_1["default"]().format("YYYY-MM-DD") + " " + "23:59", "YYYY-MM-DD HH:mm").format(),
    ]), dateRange = _x[0], setDateRange = _x[1];
    var _y = react_1.useState(null), featureIdx = _y[0], setFeatureIdx = _y[1];
    var _z = react_1.useState(false), flaggedFilter = _z[0], setFlaggedFilter = _z[1];
    var _0 = react_1.useState(false), unflaggedFilter = _0[0], setUnflaggedFilter = _0[1];
    var _1 = react_1.useState({
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
        canUploadToBaseLayer: false
    }), perms = _1[0], setPerms = _1[1];
    var _2 = react_1.useContext(authUtils_1.AuthContext), Auth = _2.Auth, logout = _2.logout;
    var setLoading = react_1.useContext(Loader_1.LoaderContext).setLoading;
    var _3 = react_1.useContext(threadUtils_1.ThreadContext), thread = _3.thread, openThread = _3.openThread;
    var treeMenu = function (layer) {
        var items = [];
        if (props.isBaseMap ? perms.canEditBaseLayer : perms.canEditLayer) {
            items.push({
                key: "1",
                label: "Edit"
            });
        }
        if (layer.type === "Raster" || layer.type === "Vector") {
            items.push({
                key: "2",
                label: "Open Thread"
            });
        }
        items.push({
            key: "3",
            label: "Download"
        });
        if (layer.type === "Vector") {
            items.push({
                key: "10",
                label: "Download KML"
            });
            if (props.isBaseMap ? perms.canEditBaseLayer : perms.canEditLayer) {
                items.push({
                    key: "flagSubMenu",
                    label: "Toggle Flag",
                    children: [
                        {
                            key: "11",
                            label: "Flag Layer"
                        },
                        {
                            key: "12",
                            label: "Unflag Layer"
                        },
                    ]
                });
            }
        }
        if (props.isBaseMap && perms.canUpdateBaseLayer) {
            items.push({
                key: "4",
                label: "Update Layer"
            });
        }
        if (props.isBaseMap ? perms.canDeleteBaseLayer : perms.canDeleteLayer) {
            items.push({
                key: "5",
                label: "Delete"
            });
        }
        if (layer.layerGroupId &&
            (props.isBaseMap ? perms.canCreateBaseLayer : perms.canCreateLayer)) {
            items.push({
                key: "6",
                label: "Unassign Form Group"
            });
        }
        if (layer._isChecked) {
            var submenuChildren = [];
            if (props.isBaseMap ? perms.canCreateBaseLayer : perms.canCreateLayer) {
                submenuChildren.push({
                    key: "7",
                    label: "Group Selected Layers"
                });
            }
            if (props.isBaseMap ? perms.canDeleteBaseLayer : perms.canDeleteLayer) {
                submenuChildren.push({
                    key: "8",
                    label: "Delete Selected Layers"
                });
            }
            if (props.isBaseMap ? perms.canEditBaseLayer : perms.canEditLayer) {
                submenuChildren.push({
                    key: "9",
                    label: "Move Selected Layers"
                });
            }
            items.push({
                key: "submenu",
                label: "Selected",
                children: submenuChildren
            });
        }
        if (layer.type === "Vector") {
            items.push({
                key: "13",
                label: "More"
            });
        }
        items.push({
            key: "14",
            label: layer._isMasked ? "Remove Mask" : "Add Mask"
        });
        items.push({
            key: "15",
            label: "Elevation"
        });
        // if (layer.type == "Raster" && layer.raster == "CESIUM_3D")
        //   items.push({
        //     key: "16",
        //     label: layer._isMeshSource ? "Remove Mesh" : "Add Mesh",
        //   });
        return items;
    };
    react_1.useEffect(function () {
        console.log("isMaskLayerVisible updated:", isMaskLayerVisible);
    }, [isMaskLayerVisible]);
    react_1.useEffect(function () {
        isElevationEnabledRef.current = isElevationEnabled;
    }, [isElevationEnabled]);
    //---------Notifications--------------------------------------
    var openNotification = function (layerName) {
        antd_1.notification.success({
            message: "Photos assigned in layer: " + layerName + "!",
            description: "Please check the layer's review section to finalise the images."
        });
    };
    //----------UseEffectBlock to assign permissions--------------
    react_1.useEffect(function () {
        setPerms({
            canCreateLayer: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.UPLOAD_LAYER),
            canDeleteLayer: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.DELETE_LAYER),
            canEditLayer: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.EDIT_LAYER),
            canDownloadLayer: true,
            canEditGeojson: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.EDIT_FEATURE),
            canDeleteFeature: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.DELETE_FEATURE),
            canAddFeature: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.ADD_FEATURE),
            canUploadFileToGeojson: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.FEATURE_FILE_UPLOAD),
            canDeleteFileFromGeojson: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.FEATURE_FILE_DELETE),
            canSetCoverPhoto: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.SET_COVER_PHOTO),
            canCreateBaseLayer: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.CAN_CREATE_BASE_LAYER),
            canUpdateBaseLayer: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.CAN_UPDATE_BASE_LAYER),
            canDeleteBaseLayer: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.CAN_DELETE_BASE_LAYER),
            canEditBaseLayer: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.CAN_EDIT_BASE_LAYER),
            canUploadToBaseLayer: Auth.userdetails.customPermissions.includes(permissions_1.PERMS.CAN_UPLOAD_TO_BASE_LAYER)
        });
    }, []);
    var socket = react_1.useRef();
    var _4 = react_1.useState(false), ExpiryModal = _4[0], setExpiryModal = _4[1];
    var _5 = react_1.useState(false), LimitModal = _5[0], setLimitModal = _5[1];
    var _6 = react_1.useState(false), showBorder = _6[0], setShowBorder = _6[1];
    var _7 = react_1.useState(false), osmState = _7[0], setOsmState = _7[1];
    var _8 = react_1.useState({
        lat: 22.571194159512256,
        lng: 88.49175358524279
    }), defaultLocation = _8[0], setDefaultLocation = _8[1];
    // Viewport settings
    var _9 = react_1.useState({
        longitude: defaultLocation.lng,
        latitude: defaultLocation.lat,
        zoom: 13,
        pitch: 0,
        minZoom: 0,
        maxZoom: 22,
        bearing: 0
    }), INITIAL_VIEW_STATE = _9[0], setViewport = _9[1];
    var mapRef = react_1.useRef(null);
    // ---- setting map location -----------------
    react_1.useEffect(function () {
        if (props.isBaseMap) {
            if (navigator.geolocation) {
                navigator.permissions
                    .query({ name: "geolocation" })
                    .then(function (result) {
                    if (result.state === "granted") {
                        navigator.geolocation.getCurrentPosition(function (pos) {
                            var crd = pos.coords;
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
                                transitionInterpolator: new TransitionInterpolator()
                            });
                        });
                    }
                    else if (result.state === "prompt") {
                        navigator.geolocation.getCurrentPosition(function (pos) {
                            var crd = pos.coords;
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
                                transitionInterpolator: new deck_gl_1.FlyToInterpolator()
                            });
                        }, function (err) {
                            console.log("Location fetch error: \n " + err);
                        }, {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                        });
                    }
                    else if (result.state === "denied") {
                        antd_1.message.warning("Please allow location access from your browser for best experience of ARU!");
                    }
                    result.onChange = function () {
                        console.log(result.state);
                    };
                });
            }
            else {
                console.log("Sorry navigator not available!");
            }
        }
    }, []);
    var COPYRIGHT_LICENSE_STYLE = {
        position: "absolute",
        right: 0,
        bottom: 0,
        backgroundColor: "hsla(0,0%,100%,.5)",
        padding: "0 5px",
        font: "12px/20px Helvetica Neue,Arial,Helvetica,sans-serif"
    };
    var LINK_STYLE = {
        textDecoration: "none",
        color: "rgba(0,0,0,.75)",
        cursor: "grab"
    };
    var devicePixelRatio = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
    var _10 = react_1.useState(), selectedKey = _10[0], setSelectedKey = _10[1];
    // //volume calculation..................
    //  const [co,setCo] = useState(null);
    //   const colorScale = (value) => {
    //     const minZ = Math.min(...volumeMesh.flat().map(p => p[2]));
    //     const maxZ = Math.max(...volumeMesh.flat().map(p => p[2]));
    //     const ratio = (value - minZ) / (maxZ - minZ);
    //     return [
    //       Math.floor(255 * ratio),    // Red
    //       Math.floor(255 * (1 - ratio)), // Green
    //       128,                        // Blue
    //       200                         // Alpha
    //     ];
    //   };
    //   const polygonLayer = new PolygonLayer({
    //     id: 'terrain-surface',
    //     data: volumeMesh,
    //     getPolygon: triangle => [
    //       ...triangle, 
    //       triangle[0] // Close the polygon loop
    //     ],
    //     stroked: false,
    //     filled: true,
    //     extruded: false,
    //     getFillColor: triangle => {
    //       // Color by average elevation
    //       const avgZ = triangle.reduce((sum, p) => sum + p[2], 0) / 3;
    //       return colorScale(avgZ); // Implement your color scale
    //     },
    //     pickable: true,
    //     opacity: 0.8
    //   });
    //.................draw angle.........................
    var _11 = react_1.useState(false), drawAngle = _11[0], setDrawAngle = _11[1];
    var _12 = react_1.useState([]), points = _12[0], setPoints = _12[1];
    var _13 = react_1.useState([]), dashedLines = _13[0], setDashedLines = _13[1];
    var _14 = react_1.useState(null), intersectionPoint = _14[0], setIntersectionPoint = _14[1];
    var _15 = react_1.useState(null), angle = _15[0], setAngle = _15[1];
    var _16 = react_1.useState(null), screenPosition = _16[0], setScreenPosition = _16[1];
    var _17 = react_1.useState(null), mousePosition = _17[0], setMousePosition = _17[1];
    var handleMouseMove1 = function (info) {
        if (points.length < 3) {
            setMousePosition(info.coordinate);
        }
        else {
            setMousePosition(null);
        }
    };
    var calculateAngle = function (pointA, pointB, pointC) {
        var a = turf.point(pointA);
        var b = turf.point(pointB);
        var c = turf.point(pointC);
        var angle = turf.angle(a, b, c);
        return angle.toFixed(0);
    };
    var handleDrawAngle = function (info) {
        var _a = info.coordinate, lng = _a[0], lat = _a[1];
        if (points.length >= 3) {
            setPoints([]);
            setDashedLines([]);
            setIntersectionPoint(null);
            setAngle(null);
        }
        setPoints(function (prevPoints) {
            var newPoints = __spreadArrays(prevPoints, [[lng, lat]]);
            if (newPoints.length > 1) {
                var newDashedLines = __spreadArrays(dashedLines, [[newPoints[newPoints.length - 2], newPoints[newPoints.length - 1]]]);
                setDashedLines(newDashedLines);
            }
            if (newPoints.length === 3) {
                var pointA = newPoints[0], pointB = newPoints[1], pointC = newPoints[2];
                var calculatedAngle = calculateAngle(pointA, pointB, pointC);
                setAngle(calculatedAngle);
                setIntersectionPoint(pointB);
                var viewport = new viewport_mercator_project_1.WebMercatorViewport(deckRef.current.deck.viewManager._viewports[0]);
                var _a = viewport.project(pointB), x = _a[0], y = _a[1];
                setScreenPosition({ x: x, y: y });
                setMousePosition(null);
            }
            return newPoints;
        });
    };
    var angleLayers = [
        new layers_1.IconLayer({
            id: "marker-layer",
            data: points.map(function (coord) { return ({ position: coord }); }),
            getIcon: function () { return ({
                url: location_svg_1["default"],
                width: 250,
                height: 250,
                anchorY: 250
            }); },
            getSize: 20,
            sizeScale: 2,
            pickable: true
        }),
        new layers_1.LineLayer({
            id: "combined-lines",
            data: __spreadArrays(dashedLines.map(function (line) { return ({
                sourcePosition: line[0],
                targetPosition: line[1],
                isDashed: true
            }); }), (points.length > 0 && mousePosition
                ? [{ sourcePosition: points[points.length - 1], targetPosition: mousePosition, isDashed: false }]
                : [])),
            getWidth: 2,
            getDashArray: function (d) { return (d.isDashed ? [20, 5] : [0, 0]); },
            billboard: true
        }),
    ];
    var _18 = react_1.useState(null), hoverInfo = _18[0], setHoverInfo = _18[1];
    var deckRef = react_1.useRef(null);
    var _19 = react_1.useState(150), polygonSize = _19[0], setPolygonSize = _19[1];
    var _20 = react_1.useState(1), layerOpacity = _20[0], setLayerOpacity = _20[1];
    var _21 = react_1.useState(exports.getPolygon(88, 22, 1)), polygon = _21[0], setPolygon = _21[1];
    var _22 = react_1.useState(false), digitizer = _22[0], setDigitizer = _22[1];
    var _23 = react_1.useState(null), digitizerLayer = _23[0], setDigitizerLayer = _23[1];
    var handleFileUpload = function (file) {
        setIsModalVisible(true);
        if (file) {
            setFileList([file]);
        }
    };
    var handleChildValueChange = function (newValue) {
        console.log(newValue);
        setDigitizerLayer(newValue);
    };
    var changePolygonSize = function (value) {
        setPolygonSize(value);
    };
    var changeOpacity = function (value) {
        setLayerOpacity(value);
    };
    var maskLayer = react_1.useMemo(function () {
        return new layers_2.SolidPolygonLayer({
            id: exports.MASK_ID,
            operation: "mask",
            data: [polygon],
            getPolygon: function (d) { return d; },
            getColor: [255, 0, 0],
            visible: isMaskLayerVisible,
            zIndex: 9999,
            opacity: layerOpacity
        });
    }, [polygon, isMaskLayerVisible]);
    react_1.useEffect(function () {
        var handleValueChange = function (newValue) {
            setHoverInfo(newValue);
        };
        elevationTooltip_1.valueChangeEmitter.on('valueChanged', handleValueChange);
        return function () {
            elevationTooltip_1.valueChangeEmitter.off('valueChanged', handleValueChange);
        };
    }, []);
    var osm = [
        new geo_layers_1.TileLayer({
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
            renderSubLayers: function (props) {
                var _a = props.tile.bbox, west = _a.west, south = _a.south, east = _a.east, north = _a.north;
                console.log("props.data:", props.data);
                return [
                    new layers_1.BitmapLayer(props, {
                        data: null,
                        image: props.data,
                        bounds: [west, south, east, north],
                        extensions: [new extensions_1.MaskExtension()],
                        maskId: exports.MASK_ID,
                        opacity: layerOpacity
                    }),
                    showBorder &&
                        new layers_1.PathLayer({
                            id: props.id + "-border",
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
                            getPath: function (d) { return d; },
                            getColor: [255, 0, 0],
                            widthMinPixels: 4
                        }),
                ];
            }
        }),
    ];
    var ICON_MAPPING = {
        marker: {
            x: 0,
            y: 0,
            width: 128,
            height: 128,
            mask: true,
            anchorX: 64,
            anchorY: 120
        }
    };
    var _24 = react_1.useState(false), showPopup = _24[0], togglePopup = _24[1];
    react_1.useEffect(function () { return console.log("SHOW_POPUP: ", showPopup); }, [showPopup]);
    var _25 = react_1.useState([]), featureData = _25[0], setFeatureData = _25[1];
    var _26 = react_1.useState(""), sysId = _26[0], setSysId = _26[1];
    var _27 = react_1.useState([]), coordinates = _27[0], setCoordinates = _27[1];
    var _28 = react_1.useState(true), sideBarState = _28[0], setSideBarState = _28[1];
    var _29 = react_1.useState(react_1["default"].createElement(icons_1.DoubleRightOutlined, null)), sideBarIcon = _29[0], setSideBarIcon = _29[1];
    var _30 = react_1.useState([]), attributeTable = _30[0], SetAttributeTable = _30[1];
    var _31 = react_1.useState("mapbox://styles/mapbox/streets-v8"), mapMode = _31[0], setMapMode = _31[1];
    var _32 = react_1.useState(false), isModalVisible = _32[0], setIsModalVisible = _32[1]; // upload layer
    var _33 = react_1.useState(false), isModalVisible1 = _33[0], setIsModalVisible1 = _33[1];
    var _34 = react_1.useState(false), isModalVisible2 = _34[0], setIsModalVisible2 = _34[1]; // upload layer modal
    var _35 = react_1.useState(false), isModalVisible3 = _35[0], setIsModalVisible3 = _35[1]; // create layer modal
    var _36 = react_1.useState(false), isModalVisible4 = _36[0], setIsModalVisible4 = _36[1]; // create base layer modal
    var _37 = react_1.useState(false), timeFilter = _37[0], setTimeFilter = _37[1];
    var _38 = react_1.useState("240px"), bottomBarHeight = _38[0], setBottomBarHeight = _38[1];
    var _39 = react_1.useState("#ffaa00"), layerColor = _39[0], setLayerColor = _39[1];
    var _40 = react_1.useState(""), icon = _40[0], setIcon = _40[1];
    var _41 = react_1.useState([]), fileList = _41[0], setFileList = _41[1];
    // const [rasterProps, setRasterProps] = useState<any>([]);
    // const [vectorProps, setVectorProps] = useState<any>([]);
    var _42 = react_1.useState(), data = _42[0], setData = _42[1];
    var _43 = react_1.useState(""), editingKey = _43[0], setEditingKey = _43[1];
    var _44 = react_1.useState(""), missioName = _44[0], setMissioName = _44[1];
    var _45 = react_1.useState(""), layerType = _45[0], setLayerType = _45[1];
    var _46 = react_1.useState(null), layerProp = _46[0], setLayerProp = _46[1];
    var _47 = react_1.useState(""), captureDate = _47[0], setCaptureDate = _47[1];
    var _48 = react_1.useState(false), uploading = _48[0], setUploading = _48[1];
    var _49 = react_1.useState(0), progress = _49[0], setProgress = _49[1];
    var _50 = react_1.useState(""), layerName = _50[0], setLayerName = _50[1];
    var _51 = react_1.useState(""), infoWindowMode = _51[0], setInfoWindowMode = _51[1];
    var _52 = react_1.useState(), activeKey = _52[0], setActiveKey = _52[1];
    var _53 = react_1.useState([]), panes = _53[0], setPanes = _53[1];
    var _54 = react_1.useState([]), tabKeys = _54[0], setTabKeys = _54[1];
    var _55 = react_1.useState(""), drawMode = _55[0], setdrawMode = _55[1];
    var _56 = react_1.useState(false), formDrawerVisible = _56[0], setformDrawerVisible = _56[1];
    var _57 = react_1.useState(false), viewMedia = _57[0], setViewMedia = _57[1];
    var _58 = react_1.useState({}), selectedLayerInfo = _58[0], setSelectedLayerInfo = _58[1];
    var _59 = react_1.useState(false), viewDocs = _59[0], setViewDocs = _59[1];
    var _60 = react_1.useState([]), vectorLayers = _60[0], setvectorLayers = _60[1];
    var _61 = react_1.useState(false), saveButtonShow = _61[0], setSaveButtonShow = _61[1];
    var _62 = react_1.useState(false), showForm = _62[0], setShowForm = _62[1];
    var _63 = react_1.useState(""), toolSelected = _63[0], setToolSelected = _63[1];
    var _64 = react_1.useState(null), defaultLayerType = _64[0], setDefaultLayerType = _64[1];
    var _65 = react_1.useState(false), activeType = _65[0], setActiveType = _65[1];
    var _66 = react_1.useState("createdAt"), sortType = _66[0], setSortType = _66[1];
    var _67 = react_1.useState(false), isAscending = _67[0], setIsAscending = _67[1];
    var _68 = react_1.useState(false), showEditModel = _68[0], setshowEditModel = _68[1];
    var _69 = react_1.useState({
        vectorProps: new Set([]),
        rasterProps: new Set([]),
        vectorPropsType: new Set([]),
        time: null
    }), filterState = _69[0], setFilterState = _69[1];
    var _70 = react_1.useState(false), inheritColor = _70[0], setInheritColor = _70[1];
    var _71 = react_1.useState(false), chipsLoading = _71[0], setChipsLoading = _71[1];
    var _72 = react_1.useState(""), lastAdded = _72[0], setLastAdded = _72[1];
    var _73 = react_1.useState(true), valid = _73[0], setValid = _73[1];
    var _74 = react_1.useState(true), showColorPicker = _74[0], setshowColorPicker = _74[1];
    var _75 = react_1.useState(false), layerLoading = _75[0], setLayerLoading = _75[1];
    var _76 = react_1.useState(""), threeDState = _76[0], set3DState = _76[1];
    var _77 = react_1.useState(false), T3DTranspose = _77[0], set3DTranspose = _77[1];
    var _78 = react_1.useState([]), picToMapData = _78[0], setPicToMapData = _78[1];
    var _79 = react_1.useState(false), pic2Mapv2Status = _79[0], setPic2Mapv2Status = _79[1];
    var _80 = react_1.useState({}), pic2Mapv2Data = _80[0], setPic2Mapv2Data = _80[1];
    var _81 = react_1.useState([]), layerz = _81[0], setlayerz = _81[1];
    var _82 = react_1.useState(true), activeGroupButton = _82[0], setActiveGroupButton = _82[1];
    var _83 = react_1.useState(false), isLayerDocs = _83[0], setIsLayerDocs = _83[1];
    var _84 = react_1.useState(false), isUpdate = _84[0], setUpdate = _84[1];
    var _85 = react_1.useState(""), updateType = _85[0], setUpdateType = _85[1];
    var _86 = react_1.useState(""), updateId = _86[0], setUpdateId = _86[1];
    var _87 = react_1.useState(1), pointMarkerSize = _87[0], setPointMarkerSize = _87[1];
    var _88 = react_1.useState(false), showMarkerSizeTool = _88[0], setShowMarkerSizeTool = _88[1];
    var iconOptions = [
        {
            value: "MarkerIcon",
            title: "Marker Icon",
            icon: react_1["default"].createElement("img", { src: MarkerIcon_png_1["default"], style: { width: "10px" } })
        },
        {
            value: "TankIcon",
            title: "Tank Icon",
            icon: react_1["default"].createElement("img", { src: TankIcon_png_1["default"], style: { width: "10px" } })
        },
        {
            value: "ValveIcon",
            title: "Valve Icon",
            icon: react_1["default"].createElement("img", { src: ValveIcon_png_1["default"], style: { width: "10px" } })
        },
        {
            value: "DotIcon",
            title: "Dot Icon",
            icon: react_1["default"].createElement("img", { src: DotIcon_png_1["default"], style: { width: "10px" } })
        },
    ];
    var _89 = react_1.useState(iconOptions[0].value), icon2 = _89[0], setIcon2 = _89[1];
    //----------------auto detect browser height---------------------
    // let initHeight = window.screen.height;
    // if(initHeight === 1080){
    //   setBottomBarHeight("500px");
    // }
    var history = react_router_dom_1.useHistory();
    react_1.useEffect(function () {
        setTimeout(function () {
            if (layerLoading) {
                setLayerLoading(false);
            }
        }, 1000);
    }, [layerLoading]);
    react_1.useEffect(function () {
        var initHeight = window.screen.height;
        if (initHeight >= 1080) {
            setBottomBarHeight("480px");
        }
    }, []);
    var _90 = react_1.useState({
        editMode: null,
        isCompleted: false
    }), modeState = _90[0], setModeState = _90[1];
    var _91 = react_1.useState({
        mode: editable_layers_2.ViewMode
    }), mode = _91[0], setMode = _91[1];
    // const [geoJson, setGeoJson] = useState({
    //     type: 'FeatureCollection',
    //     features: []
    // });
    var onChangeSizeSlider = function (value) {
        if (isNaN(value)) {
            return;
        }
        setPointMarkerSize(value);
    };
    var myFeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    var _92 = react_1.useState([]), selectedFeatureIndexes = _92[0], setselectedFeatureIndexes = _92[1];
    var _93 = react_1.useState(myFeatureCollection), featureState = _93[0], setFeatureState = _93[1];
    var _94 = react_1.useState(), selectedLayerId = _94[0], setSelectedLayerId = _94[1];
    var _95 = react_1.useState(""), selectedLayerType = _95[0], setSelectedLayerType = _95[1];
    var _96 = react_1.useState(null), layerToAddInAttributeTable = _96[0], setlayerToAddInAttributeTable = _96[1];
    var _97 = react_1.useState(false), shouldAttributeTableReload = _97[0], setShouldAttributeTableReload = _97[1];
    var _98 = react_1.useState(false), scaleVisible = _98[0], setScaleVisible = _98[1];
    var rawId = react_router_dom_1.useParams().id;
    if (!rawId) {
        rawId = "thisIsBase-Layer";
    }
    var _99 = rawId.split("-").reverse(), id = _99[0], userType = _99[1];
    var form = antd_1.Form.useForm()[0];
    var showModal = function () {
        setIsModalVisible(true);
    };
    var handleOk = function () {
        setIsModalVisible(false);
    };
    var handleCancel = function () {
        form.resetFields();
        setIsModalVisible(false);
    };
    var showModal1 = function () {
        setshowEditModel(true);
        setIsModalVisible1(true);
        console.log(selectedLayerId);
    };
    var handleOk1 = function () {
        setLayerName("");
        setDefaultLayerType(null);
        setCaptureDate("");
        setIsModalVisible1(false);
    };
    var handleCancel1 = function () {
        setTimeout(function () {
            setshowEditModel(false);
        }, 500);
        setLayerName("");
        setDefaultLayerType(null);
        setCaptureDate("");
        setIsModalVisible1(false);
    };
    var handleCancel2 = function () {
        setIsModalVisible2(false);
        setSelectedKey();
    };
    // ----------------------------------------- disable default right click event of browser ----------------------------------------------------------
    react_1.useEffect(function () {
        window.addEventListener("contextmenu", function (e) { return e.preventDefault(); });
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
    var filterLayers = function () {
        var body = {};
        if (!props.isBaseMap) {
            body = {
                missionId: id
            };
        }
        if (filterState.rasterProps.size)
            body["rasterProps"] = Array.from(filterState.rasterProps);
        if (filterState.vectorProps.size)
            body["vectorProps"] = Array.from(filterState.vectorProps);
        if (filterState.vectorPropsType.size)
            body["vectorPropsType"] = Array.from(filterState.vectorPropsType);
        if (filterState.time)
            body["time"] = filterState.time;
        if (filterState.rasterProps.size ||
            filterState.vectorProps.size ||
            filterState.vectorPropsType.size ||
            !!filterState.time) {
            setChipsLoading(true);
            httpCall_1["default"]
                .post("" + apis_1["default"].FILTER_LAYER, body)
                .then(function (res) {
                console.log("Filter API response", res);
                if (res.data.status) {
                    SetAllLayers(res.data.data);
                    // removeChips(res.data.data);
                }
                else {
                    antd_1.message.info("No result for selected filter!");
                }
            })["catch"](function (err) {
                console.log(err);
                antd_1.message.error("Layers couldn't be filtered");
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            })["finally"](function () { return setChipsLoading(false); });
        }
        else {
            getAllLayers(id);
        }
    };
    react_1.useEffect(function () {
        var missionData = function () { return __awaiter(_this, void 0, void 0, function () {
            var mission;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, httpCall_1["default"].get("" + apis_1["default"].GET_MISSION_BY_ID + id)];
                    case 1:
                        mission = _a.sent();
                        console.log("basemap", props.isBaseMap, mission.data, moment_1["default"](mission.data.data.createdAt));
                        if (mission.data.status) {
                            setMissionData(mission.data.data);
                            setDateRange([
                                moment_1["default"](mission.data.data.createdAt, "YYYY-MM-DD HH:mm").format(),
                                dateRange[1],
                            ]);
                        }
                        setLoader(false);
                        return [2 /*return*/];
                }
            });
        }); };
        if (!props.isBaseMap) {
            setLoader(true);
            missionData();
        }
    }, []);
    react_1.useEffect(function () {
        filterLayers();
    }, [filterState]);
    // ++++++++++++++++++++++++++++++ Sort All Layers +++++++++++++++++++++++++++++++++++++
    var changeSortArrange = function (ascending) {
        if (ascending !== isAscending) {
            setIsAscending(ascending);
        }
    };
    react_1.useEffect(function () {
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
        SetAllLayers(function (prev) { return __spreadArrays(prev.sort(function (a, b) {
            if (sortType === "createdAt") {
                if (isAscending)
                    return moment_1["default"](a.createdAt).diff(moment_1["default"](b.createdAt));
                else
                    return moment_1["default"](b.createdAt).diff(moment_1["default"](a.createdAt));
            }
            else {
                // sortType is "name"
                if (isAscending)
                    return a.name.localeCompare(b.name);
                else
                    return b.name.localeCompare(a.name);
            }
        })); });
    }, [sortType, isAscending]);
    var _100 = react_1.useState([]), expandedKeys = _100[0], setExpandedKeys = _100[1];
    // const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    var _101 = react_1.useState([]), selectedKeys = _101[0], setSelectedKeys = _101[1];
    var _102 = react_1.useState(true), autoExpandParent = _102[0], setAutoExpandParent = _102[1];
    var _103 = react_1.useState("plasma"), colorMap = _103[0], SetColorMap = _103[1];
    var _104 = react_1.useState(""), featureLayer = _104[0], setFeatureLayer = _104[1];
    var _105 = react_1.useState(""), featureLayerPath = _105[0], setFeatureLayerPath = _105[1];
    var _106 = react_1.useState(""), windowTitle = _106[0], setWindowTitle = _106[1];
    var _107 = react_1.useState(""), selectedLayerLabel = _107[0], setSelectedLayerLabel = _107[1];
    var _108 = react_1.useState(""), selectedLayerPopupLabel = _108[0], setSelectedLayerPopupLabel = _108[1];
    var _109 = react_1.useState(""), activeID = _109[0], setActiveID = _109[1];
    var _110 = react_1.useState([]), selectedIndexes = _110[0], setSelectedIndexes = _110[1];
    var _111 = react_1.useState([]), selectedFeatures = _111[0], setSelectedFeatures = _111[1];
    var _112 = react_1.useState([]), showSelectedIndexes = _112[0], setshowSelectedIndexes = _112[1];
    var _113 = react_1.useState(""), key = _113[0], setKey = _113[1];
    var _114 = react_1.useState([]), defaultKeys = _114[0], setDefaultKeys = _114[1];
    var _115 = react_1.useState([]), videoToShow = _115[0], setVideoToShow = _115[1];
    var onExpand = function (expandedKeysValue) {
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };
    // const [allLayers, setAllLayers] = useState<Layer[]>([]);
    var _116 = react_1.useState([]), AllLayers = _116[0], SetAllLayers = _116[1];
    var _117 = react_1.useState({
        alertGeojsonUrl: "",
        vodGeojsonUrl: "",
        isAlertChecked: false,
        isVODChecked: false
    }), MissionLayers = _117[0], SetMissionLayers = _117[1];
    var _118 = react_1.useState([]), visibleLayers = _118[0], setVisibleLayers = _118[1];
    var _119 = react_1.useState(null), colorChangeFeatureData = _119[0], setColorChangeFeatureData = _119[1];
    var _120 = react_1.useState(false), showColorChangeForm = _120[0], setShowColorChangeForm = _120[1];
    var _121 = react_1.useState(""), color = _121[0], setColor = _121[1];
    var _122 = react_1.useState([]), scales = _122[0], setScales = _122[1];
    var onRangeChange = function (date, dateString) {
        var startDate = moment_1["default"](dateString[0] + " " + "00:00", "DD-MM-YYYY HH:mm").format();
        var endDate = moment_1["default"](dateString[1] + " " + "23:59", "DD-MM-YYYY HH:mm").format();
        setDateRange([startDate, endDate]);
    };
    var missionGeojsonURL = function (type, isBaseMap, startDate, endDate) {
        var params = new URLSearchParams({ startDate: startDate, endDate: endDate }).toString();
        var url = "";
        if (isBaseMap) {
            if (type === "alert")
                url = apis_1["default"].GET_ALERT_LOCATION_GEOJSON + "?" + params;
            if (type === "vod")
                url = apis_1["default"].GET_VOD_LOCATION_GEOJSON + "?" + params;
        }
        else {
            if (type === "alert")
                url = apis_1["default"].GET_MISSION_GEOJSON + "/" + id + "/alerts?" + params;
            if (type === "vod")
                url = apis_1["default"].GET_MISSION_GEOJSON + "/" + id + "/vods?" + params;
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
    var markerData = [
        {
            name: "Drone",
            address: "",
            exits: 4214,
            coordinates: marker
        },
    ];
    var fpLayer = [
        new layers_1.PathLayer({
            id: "flight-path-layer",
            data: flightPath,
            pickable: true,
            widthScale: 1,
            widthMinPixels: 1,
            capRounded: true,
            jointRounded: true,
            //billboard: true,
            getPath: function (d) { return d.path; },
            getColor: function (d) { return [0, 195, 255]; },
            getWidth: function (d) { return 3; }
        }),
        new layers_1.IconLayer({
            id: "flight-icon-layer",
            data: markerData,
            pickable: true,
            getIcon: function (d) { return ({
                url: "" + nav_icon_png_1["default"],
                width: 100,
                height: 129,
                anchorY: 70,
                mask: false
            }); },
            sizeScale: 15,
            getPosition: function (d) {
                // console.log(d, "getpos");
                return d.coordinates;
            },
            getSize: function (d) { return 4; },
            getAngle: function (d) { return bearing; }
        }),
    ];
    function getBearing(startLat, startLong, endLat, endLong) {
        var p1 = turf.point([startLong, startLat]);
        var p2 = turf.point([endLong, endLat]);
        var bearing = turf.bearing(p1, p2);
        if (bearing > 0) {
            return bearing * -1;
        }
        else if (bearing < 0) {
            return bearing * -1;
        }
        else {
            return 0;
        }
    }
    var removeFlightPath = function () {
        var vlayers = __spreadArrays(visibleLayers);
        var layers = vlayers.filter(function (l) {
            if (String(l.id) !== "flight-path-layer" &&
                String(l.id) !== "flight-icon-layer") {
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
            transitionInterpolator: new deck_gl_1.FlyToInterpolator()
        });
        setViewMedia(true);
    };
    react_1.useEffect(function () {
        if (srtVideoPath && showFlightPath) {
            fetchJSON(constants_1.STATIC_URL + srtVideoPath.replace(/.\w+$/, ".geojson"))
                .then(function (data) {
                var flightTelemetry = data.features;
                var pathObject = flightTelemetry.pop();
                //console.log("the obejct", pathObject)
                var points = [];
                pathObject.geometry.coordinates.map(function (i) {
                    var values = [];
                    values.push(i[0]);
                    values.push(i[1]);
                    //console.log(values);
                    points.push(values);
                });
                // //flightpath.push(flightTelemetry.at(-1));
                // console.log("FLight features", flightTelemetry, "FLightpath", flightpath.features[0]);
                var filterArray = points.filter(function (i) { return i[0] !== null && i[1] !== null; });
                setFlightPath([
                    {
                        path: filterArray,
                        name: "Drone's Flight Path",
                        color: [255, 0, 0]
                    },
                ]);
                if (points.length > 0) {
                    var x = Math.floor(0 * points.length);
                    if (points[x] !== undefined &&
                        points[x][0] !== null &&
                        points[x][1] !== null) {
                        setMarker(points[x]);
                        var startPoint = points[x];
                        var endPoint = points[x + 1];
                        console.log("start", startPoint, "end", endPoint);
                        if (startPoint !== undefined &&
                            endPoint !== undefined &&
                            startPoint[0] !== null &&
                            endPoint[0] !== null &&
                            startPoint[1] !== null &&
                            endPoint[1] !== null) {
                            setBearing(getBearing(startPoint[1], startPoint[0], endPoint[1], endPoint[0]));
                        }
                    }
                }
            })["catch"](function (err) {
                setShowFlightPath(false);
                console.log("could not fetch geojson");
            });
        }
    }, [showFlightPath, srtVideoPath]);
    //---------viewport alignment---------
    react_1.useEffect(function () {
        if (marker.length > 0 && showFlightPath) {
            setVisibleLayers(function (vlayers) { return __spreadArrays(vlayers, fpLayer); });
            setViewport({
                longitude: marker[0],
                latitude: marker[1],
                zoom: 17,
                minZoom: 0,
                maxZoom: 17,
                pitch: 0,
                bearing: 0,
                transitionDuration: 1000,
                transitionInterpolator: new deck_gl_1.FlyToInterpolator()
            });
        }
    }, [marker]);
    function fetchJSON(file) {
        return fetch(file)
            .then(function (res) {
            return res.json();
        })["catch"](function (err) { return console.log(err); });
    }
    //-----creating drone path-----
    react_1.useEffect(function () {
        SetMissionLayers(function (prev) { return ({
            alertGeojsonUrl: missionGeojsonURL("alert", props.isBaseMap, dateRange[0], dateRange[1]),
            vodGeojsonUrl: missionGeojsonURL("vod", props.isBaseMap, dateRange[0], dateRange[1]),
            isAlertChecked: prev.isAlertChecked,
            isVODChecked: prev.isVODChecked
        }); });
    }, [dateRange]);
    var updateVOD = function (data, idx) {
        var body = {
            Id: videoToShow.map(function (v) { return v._id; })
        };
        httpCall_1["default"]
            .post("" + apis_1["default"].FETCH_VIDEOS_BY_ID, body)
            .then(function (res) {
            setVideoDetails({
                link: res.data.data[idx].videoPath,
                missionDetails: res.data.data[idx],
                isSRT: res.data.data[idx].isSRT
            });
            setShowCarousel(true);
        })["catch"](function (err) {
            console.log(err.response.status);
            if (err.response.status == 404) {
                setVideoDetails({
                    link: data.videoPath,
                    missionDetails: data,
                    isSRT: data.isSRT
                });
                setShowCarousel(true);
            }
            else if (err.response.status == 500) {
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            }
            else {
                antd_1.message.error("API Call failed! " + err);
            }
        });
    };
    var updateVODs = function () {
        var body = {
            Id: videoToShow.map(function (v) { return v._id; })
        };
        httpCall_1["default"]
            .post("" + apis_1["default"].FETCH_VIDEOS_BY_ID, body)
            .then(function (res) {
            setVideoToShow(res.data.data);
        })["catch"](function (err) {
            console.log(err.response.status);
            if (err.response.status == 500) {
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            }
            else {
                antd_1.message.error("API Call failed! " + err);
            }
        });
    };
    react_1.useEffect(function () {
        if (viewMedia && videoToShow.length > 0) {
            updateVODs();
        }
    }, [viewMedia]);
    react_1.useEffect(function () {
        console.log("missionLayer2", missionLayer, coordinates);
    }, [missionLayer, coordinates]);
    // useEffect(() => console.log("All layers: ", AllLayers), [AllLayers]);
    var handleChangeComplete = function (color) {
        setColor(color.hex);
    };
    var handleChange = function (color, event) {
        setColor(color.hex);
    };
    react_1.useEffect(function () {
        SetAllLayers(function (prev) {
            return prev.map(function (layer) {
                if (layer._id === activeID) {
                    layer._isChecked = true;
                    layer._metadata = __assign(__assign({}, layer._metadata), { highlightIndexes: selectedIndexes });
                }
                return layer;
            });
        });
        if (selectedFeatures.length > 0) {
            var bounds = turf.bbox(turf.featureCollection(selectedFeatures));
            var _a = calculateViewport(bounds), longitude = _a.longitude, latitude = _a.latitude, zoom = _a.zoom;
            setViewport({
                longitude: longitude,
                latitude: latitude,
                zoom: zoom,
                pitch: 0,
                minZoom: 0,
                maxZoom: 22,
                bearing: 0,
                transitionDuration: 2000,
                transitionInterpolator: new deck_gl_1.FlyToInterpolator()
            });
        }
    }, [selectedIndexes, activeID]);
    var actionMenuOnClick = function (_a) {
        var key = _a.key;
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
    var filterItems = [
        {
            key: "1",
            label: "Flagged",
            className: "flag-filter " + (flaggedFilter ? "selected" : ""),
            icon: react_1["default"].createElement(tb_1.TbFlag, null)
        },
        {
            key: "2",
            label: "Un-flagged",
            className: "flag-filter " + (unflaggedFilter ? "selected" : ""),
            icon: react_1["default"].createElement(tb_1.TbFlagOff, null)
        },
    ];
    var filterOnClick = function (_a) {
        var key = _a.key;
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
    var actionMenuItems = [
        {
            key: "export",
            label: "Export CSV",
            icon: react_1["default"].createElement(icons_1.ExportOutlined, null),
            children: [
                {
                    key: "1",
                    label: "Export All"
                },
                {
                    key: "2",
                    label: "Export Selected"
                },
            ]
        },
    ];
    if (perms.canEditGeojson) {
        actionMenuItems.push({
            key: "flag",
            label: "Toggle Flag",
            icon: react_1["default"].createElement(icons_1.FlagOutlined, null),
            children: [
                {
                    key: "3",
                    label: "Flag Selected"
                },
                {
                    key: "4",
                    label: "Un-flag Selected"
                },
            ]
        });
    }
    var toggleLayerFlag = function (layerId, flag) {
        var payload = {
            flag: flag
        };
        httpCall_1["default"]
            .patch(apis_1["default"].FLAG_LAYER + "/" + layerId, payload)
            .then(function (res) {
            if (res.data.status) {
                antd_1.message.success(flag ? "Layer Flagged Successfully" : "Layer Unflagged Successfully");
                SetAllLayers(function (prev) {
                    return prev.map(function (layer) {
                        if (layer._id === layerId) {
                            layer.isFlagged = flag;
                        }
                        return layer;
                    });
                });
                setRefreshLayer(!refreshLayer);
                setShouldAttributeTableReload(!shouldAttributeTableReload);
            }
            else {
                antd_1.message.error(res.data.message);
            }
        })["catch"](function (err) {
            antd_1.message.error(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        });
    };
    function toggleFlagSelected(flag) {
        var payload = {
            featureIndex: selectedIndexes,
            flag: flag
        };
        httpCall_1["default"]
            .patch(apis_1["default"].FLAG_FEATURE + "/" + activeID, payload)
            .then(function (res) {
            if (res.data.status) {
                antd_1.message.success(flag
                    ? "Flagged Selected Successfully"
                    : "Unflagged Selected Successfully");
                SetAllLayers(function (prev) {
                    return prev.map(function (layer) {
                        if (activeID === layer._id) {
                            var indexes_1 = selectedIndexes.map(function (i) { return Number(i); });
                            return __assign(__assign({}, layer), { flaggedFeatures: flag
                                    ? __spreadArrays(layer.flaggedFeatures, indexes_1) : layer.flaggedFeatures.filter(function (f) { return !indexes_1.includes(f); }) });
                        }
                        else
                            return layer;
                    });
                });
                setShouldAttributeTableReload(!shouldAttributeTableReload);
            }
            else {
                antd_1.message.error(res.data.message);
            }
        })["catch"](function (err) {
            antd_1.message.error(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        });
    }
    function exportAll() {
        var payload = {
            id: activeID
        };
        httpCall_1["default"]
            .patch("" + apis_1["default"].EXPORT_FEATURES, payload)
            .then(function (res) {
            if (res.data.status) {
                antd_1.message.success("Export Successful");
                //console.log(res.data);
                window.open("" + constants_1.PUBLIC_URL + res.data.pathh);
            }
            else {
                antd_1.message.error(res.data.message);
            }
        })["catch"](function (err) {
            antd_1.message.error(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        });
    }
    function exportSelected() {
        var payload = {
            id: activeID,
            featureIndex: selectedIndexes
        };
        httpCall_1["default"]
            .patch("" + apis_1["default"].EXPORT_FEATURES, payload)
            .then(function (res) {
            if (res.data.status) {
                antd_1.message.success("Export Successful");
                window.open("" + constants_1.PUBLIC_URL + res.data.pathh);
            }
            else {
                antd_1.message.error(res.data.message);
            }
        })["catch"](function (err) {
            antd_1.message.error(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
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
    function InfoWindow(idx, coordinate, layername, mode, feature, show, id, sysId, type) {
        if (type === void 0) { type = ""; }
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
    function handleClose(status) {
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
    react_1.useEffect(function () {
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
    react_1.useEffect(function () {
        forceUpdateAllLayers();
    }, [selectedIndexes, showSelectedIndexes]);
    function setOverlayID(id, overlayId) {
        SetAllLayers(function (prev) {
            return prev.map(function (layer) {
                if (layer._id === id)
                    layer._metadata = __assign(__assign({}, layer._metadata), { overlayId: overlayId });
                return layer;
            });
        });
    }
    react_1.useEffect(function () {
        SetAllLayers(function (prev) {
            return prev.map(function (layer) {
                if (layer.type === "Raster" && layer.raster === rasterprops_1.rasterProps.DEM) {
                    layer._render3D = terrainmap;
                    layer._metadata = __assign(__assign({}, layer._metadata), { colorMap: colorMap });
                }
                if (layerOpacity) {
                    layer._metadata = __assign(__assign({}, layer._metadata), { layerOpacity: layerOpacity });
                }
                return layer;
            });
        });
    }, [terrainmap, colorMap, layerOpacity]);
    react_1.useEffect(function () {
        //console.log("current 3d", threeDState);
        SetAllLayers(function (prev) {
            return prev.map(function (layer) {
                if (layer._id === featureLayer)
                    layer._render3D = threeDState === "Enabled";
                return layer;
            });
        });
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
    var forceUpdateLayers = function (id) {
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
        SetAllLayers(function (prev) { return __spreadArrays(prev); });
    };
    var forceUpdateAllLayers = function () {
        // console.log("it my br by terrainmap");
        // const cv = [...checkedKeys];
        // setCheckedKeys([]);
        // setTimeout(() => {
        //   setCheckedKeys(cv);
        // });
        SetAllLayers(function (prev) { return __spreadArrays(prev); });
    };
    var setScaleData = function () {
        var demLayers = AllLayers.filter(function (layer) {
            return layer._isChecked &&
                layer.type === "Raster" &&
                layer.raster === rasterprops_1.rasterProps.DEM;
        });
        setScales(demLayers);
        if (demLayers.length) {
            setScaleVisible(true);
        }
        else {
            setScaleVisible(false);
        }
    };
    var calculateViewport = function (bbox) {
        var minLon = bbox[0], minLat = bbox[1], maxLon = bbox[2], maxLat = bbox[3];
        var mapContainer = document.getElementById("view-default-view");
        if (mapContainer) {
            var mapWidth = mapContainer.clientWidth; // Get the actual width of the map container
            var mapHeight = mapContainer.clientHeight;
            // Replace with the actual height of your map container
            // Calculate the new viewport using getViewState
            var viewport = new viewport_mercator_project_1.WebMercatorViewport({
                width: mapWidth,
                height: mapHeight
            });
            // Get the new zoom and center to fit the layer on the screen
            var _a = viewport.fitBounds([
                [minLon, minLat],
                [maxLon, maxLat],
            ], {
                padding: 10,
                offset: [0, 0]
            }), longitude = _a.longitude, latitude = _a.latitude, zoom = _a.zoom;
            return {
                longitude: longitude,
                latitude: latitude,
                zoom: zoom
            };
        }
    };
    var focusSelectedLayers = function () { return __awaiter(_this, void 0, void 0, function () {
        var boundingBoxes, _i, AllLayers_1, layer, data_1, features, bounds, data_2, features, bounds, finalBounds, _a, longitude, latitude, zoom;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    boundingBoxes = [];
                    for (_i = 0, AllLayers_1 = AllLayers; _i < AllLayers_1.length; _i++) {
                        layer = AllLayers_1[_i];
                        if (layer._isChecked && ((_b = layer._metadata) === null || _b === void 0 ? void 0 : _b.bounds)) {
                            boundingBoxes.push(layer._metadata.bounds);
                        }
                    }
                    if (!MissionLayers.isAlertChecked) return [3 /*break*/, 2];
                    return [4 /*yield*/, httpCall_1["default"].get(constants_1.STATIC_URL + MissionLayers.alertGeojsonUrl)];
                case 1:
                    data_1 = (_c.sent()).data;
                    features = data_1.features;
                    if (Array.isArray(features) && features.length > 0) {
                        bounds = turf.bbox(turf.featureCollection(features));
                        boundingBoxes.push(bounds);
                    }
                    _c.label = 2;
                case 2:
                    if (!MissionLayers.isVODChecked) return [3 /*break*/, 4];
                    return [4 /*yield*/, httpCall_1["default"].get(constants_1.STATIC_URL + MissionLayers.vodGeojsonUrl)];
                case 3:
                    data_2 = (_c.sent()).data;
                    features = data_2.features;
                    if (Array.isArray(features) && features.length > 0) {
                        bounds = turf.bbox(turf.featureCollection(features));
                        boundingBoxes.push(bounds);
                    }
                    _c.label = 4;
                case 4:
                    if (boundingBoxes.length > 0) {
                        finalBounds = geojson_1.mergeBoundingBoxes(boundingBoxes);
                        _a = calculateViewport(finalBounds), longitude = _a.longitude, latitude = _a.latitude, zoom = _a.zoom;
                        setViewport({
                            longitude: longitude /* : (bounds[0][0] + bounds[1][0]) / 2 */,
                            latitude: latitude /* : (bounds[0][1] + bounds[1][1]) / 2 */,
                            zoom: zoom,
                            pitch: 0,
                            minZoom: 0,
                            maxZoom: 22,
                            bearing: 0,
                            transitionDuration: 2000,
                            transitionInterpolator: new deck_gl_1.FlyToInterpolator()
                        });
                    }
                    return [2 /*return*/];
            }
        });
    }); };
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
    var linearInterpolation = function (rgbValues) {
        console.log("DeckGL Canvas Class Name:");
        // Your linear interpolation logic here
        // For example, average of the RGB values
        var averageValue = (rgbValues[0] + rgbValues[1] + rgbValues[2]) / 3;
        return averageValue;
    };
    var _123 = react_1.useState(0), lastCount = _123[0], setLastCount = _123[1];
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
    var fetchLayerBounds = function (_a) {
        var type = _a.type, layerpath = _a.layerpath, flaggedFeatures = _a.flaggedFeatures, vector = _a.vector, raster = _a.raster, metadata = _a.metadata;
        return __awaiter(_this, void 0, Promise, function () {
            var response, data_3, features, metaDataURL, response, metadata_1, res, tileset, bounds_rad;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(type === "Vector")) return [3 /*break*/, 3];
                        return [4 /*yield*/, fetch(constants_1.STATIC_URL + layerpath)];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data_3 = _b.sent();
                        features = data_3.features;
                        if (flaggedFilter || unflaggedFilter) {
                            features = features.filter(function (feature, idx) {
                                if (flaggedFilter) {
                                    return flaggedFeatures === null || flaggedFeatures === void 0 ? void 0 : flaggedFeatures.includes(idx);
                                }
                                else if (unflaggedFilter) {
                                    return !(flaggedFeatures === null || flaggedFeatures === void 0 ? void 0 : flaggedFeatures.includes(idx));
                                }
                            });
                        }
                        return [2 /*return*/, turf.bbox(turf.featureCollection(features))];
                    case 3:
                        if (!["ORTHO", "DEM", "DTM", "NDVI"].includes(raster)) return [3 /*break*/, 6];
                        metaDataURL = constants_1.COG_URL + "/cog/info?url=" + constants_1.TITILER_STATIC + layerpath;
                        return [4 /*yield*/, fetch(metaDataURL, {
                                method: "GET"
                            })];
                    case 4:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 5:
                        metadata_1 = _b.sent();
                        return [2 /*return*/, [
                                metadata_1["bounds"][0],
                                metadata_1["bounds"][1],
                                metadata_1["bounds"][2],
                                metadata_1["bounds"][3],
                            ]];
                    case 6:
                        if (!(raster == "CESIUM_3D")) return [3 /*break*/, 9];
                        return [4 /*yield*/, fetch(constants_1.STATIC_URL + metadata)];
                    case 7:
                        res = _b.sent();
                        return [4 /*yield*/, res.json()];
                    case 8:
                        tileset = _b.sent();
                        bounds_rad = [
                            tileset.properties.Longitude.minimum,
                            tileset.properties.Latitude.minimum,
                            tileset.properties.Longitude.maximum,
                            tileset.properties.Latitude.maximum
                        ];
                        return [2 /*return*/, bounds_rad.map(function (coord) { return coord * 180 / Math.PI; })];
                    case 9: 
                    // Implementation for Cesium_3D pending
                    return [2 /*return*/, [0, 0, 0, 0]];
                }
            });
        });
    };
    var onCheck = function (checkedKeysValue, e) { return __awaiter(_this, void 0, void 0, function () {
        var updatedLayers, _i, updatedLayers_1, layer, bounds;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // why setLayerLoading(true) only for vectors?
                    // if (
                    //   checkedKeysValue.length > lastCount &&
                    //   checkedKeysValue[checkedKeysValue.length - 1].split("-")[0] === "1"
                    // ) {
                    //   setLayerLoading(true);
                    // }
                    if (checkedKeysValue.length) {
                        setActiveGroupButton(false);
                    }
                    else {
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
                    updatedLayers = AllLayers.map(function (layer) { return (__assign(__assign({}, layer), { _isChecked: checkedKeysValue.includes(layer._id) })); });
                    _i = 0, updatedLayers_1 = updatedLayers;
                    _b.label = 1;
                case 1:
                    if (!(_i < updatedLayers_1.length)) return [3 /*break*/, 5];
                    layer = updatedLayers_1[_i];
                    if (!layer._isChecked) return [3 /*break*/, 4];
                    if (!!((_a = layer._metadata) === null || _a === void 0 ? void 0 : _a.bounds)) return [3 /*break*/, 3];
                    return [4 /*yield*/, fetchLayerBounds(layer)];
                case 2:
                    bounds = _b.sent();
                    layer._metadata = __assign(__assign({}, layer._metadata), { bounds: bounds });
                    _b.label = 3;
                case 3:
                    // add raster settings
                    if (layer.type === "Raster") {
                        layer._metadata = __assign(__assign({}, rasterprops_1.defaultRasterSettings[layer.raster]), layer._metadata);
                    }
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    SetAllLayers(updatedLayers);
                    SetMissionLayers({
                        alertGeojsonUrl: missionGeojsonURL("alert", props.isBaseMap, dateRange[0], dateRange[1]),
                        vodGeojsonUrl: missionGeojsonURL("vod", props.isBaseMap, dateRange[0], dateRange[1]),
                        isAlertChecked: checkedKeysValue.includes("alert"),
                        isVODChecked: checkedKeysValue.includes("vod")
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    // ++++++++++++++++++++++++++++++++++++++++++++++++ Start Drawing +++++++++++++++++++++++++++++++++++++++++++++++++++++
    var _124 = react_1.useState(false), isDrawing = _124[0], setIsDrawing = _124[1];
    var startDrawing = function (mode, tool) {
        setShowDrawingTools(false);
        setToolSelected(tool);
        var modes = {
            DrawPolygon: editable_layers_2.DrawPolygonMode,
            DrawLine: editable_layers_2.DrawLineStringMode,
            DrawPoint: editable_layers_2.DrawPointMode
        };
        var drawModes = {
            DrawPolygon: "PolygonView",
            DrawLine: "LineView",
            DrawPoint: "PointView"
        };
        setFeatureState(myFeatureCollection);
        setdrawMode(drawModes[mode]);
        setMode({
            mode: modes[mode]
        });
        setModeState({
            editMode: null,
            isCompleted: false
        });
        setIsDrawing(true);
    };
    var cancelDrawing = function () {
        setIsDrawing(false);
        setFeatureState(myFeatureCollection);
        //angle tool 
        setDrawAngle(false);
        setToolSelected(null);
        setPoints([]);
        setDashedLines([]);
        setIntersectionPoint(null);
        setAngle(null);
        setScreenPosition(null);
        setVolumeCalculation(false);
        setMode({
            mode: editable_layers_2.ViewMode
        });
        setModeState({
            editMode: null,
            isCompleted: false
        });
        togglePopup(false);
        setShowForm(false);
    };
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    var onSelect = function (selectedKeysValue, info) {
        setSelectedKeys(selectedKeysValue);
    };
    var VectorLayerIcons = {
        Point: react_1["default"].createElement(icons_1.EnvironmentOutlined, null),
        MultiLineString: react_1["default"].createElement(icons_1.BranchesOutlined, null),
        MultiPolygon: react_1["default"].createElement(icons_1.GatewayOutlined, null)
    };
    var AirPollutionIcon = function (_a) {
        var color = _a.color;
        return (react_1["default"].createElement("svg", { fill: color, version: "1.1", id: "Smoke", xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", width: "68", height: "68", viewBox: "64 64 896 896", "enable-background": "new 0 0 256 256", xmlSpace: "preserve", style: { padding: "0.5px" } },
            react_1["default"].createElement("path", { d: "M220.37,102.96c1.66-4.58,2.5-9.39,2.5-14.34c0-23.29-18.95-42.24-42.24-42.24c-2.36,0-4.71,0.19-7.01,0.58\n\tc-5.67-13.22-16.76-23.52-30.54-28.11C116.59,10.02,87.85,24.39,79,50.9c-0.06,0.16-0.11,0.33-0.17,0.49\n\tc-7.15,2.98-12.97,8.1-16.84,14.46C46.56,63,30.46,68.32,19.83,80.13c-8.14,9.04-12.28,20.71-11.64,32.85\n\tc0.63,12.14,5.96,23.31,14.99,31.45c2.91,2.62,6.09,4.83,9.5,6.6c-2.21,8.11-1.14,16.84,3.16,24.28\n\tc4.26,7.37,11.13,12.65,19.35,14.85c2.75,0.74,5.54,1.1,8.31,1.1c5.52,0,10.97-1.45,15.88-4.28c3.85-2.23,7.22-5.3,9.88-8.98H137\n\tc3.31,0,6-2.69,6-6s-2.69-6-6-6H86c-2.16,0-4.15,1.16-5.21,3.03c-1.8,3.15-4.43,5.83-7.41,7.56c-4.6,2.65-9.95,3.35-15.08,1.98\n\ts-9.41-4.66-12.07-9.26c-3.34-5.79-3.545-12.817-0.56-18.81c0.872-1.75,0.927-3.81,0.247-5.25c-0.68-1.45-2.097-2.55-3.597-3.09\n\tc-4.1-1.46-7.83-3.69-11.1-6.64c-6.66-6-10.58-14.22-11.05-23.17c-0.47-8.94,2.58-17.53,8.58-24.19c7.3-8.1,18.1-12.04,28.73-10.83\n\tc-0.48,2.36-0.75,4.8-0.75,7.29c0,17.5,12.31,32.05,28.93,35.33C86.54,136.94,99.99,150,117,150h45c12.17,0,22.06,9.89,22.06,22.04\n\tV178h12v-5.96c0-18.77-15.28-34.04-34.06-34.04h-45c-10.87,0-19.39-8.71-19.39-19.83v-3.55c0-3.23-2.55-5.88-5.77-6\n\tc-12.96-0.48-23.11-11.02-23.11-24c0-10.55,6.76-19.76,16.82-22.91c1.99-0.63,3.51-2.24,4.02-4.26c0.22-0.88,0.5-1.82,0.82-2.77\n\tc6.75-20.22,28.68-31.18,48.9-24.44c11.89,3.96,21.16,13.49,24.78,25.51c0.46,1.54,1.52,2.82,2.93,3.57\n\tc1.42,0.75,3.08,0.91,4.61,0.42c2.89-0.9,5.93-1.36,9.02-1.36c16.68,0,30.24,13.56,30.24,30.24c0,2.78-0.37,5.5-1.1,8.12\n\tc-4.54-1.79-9.49-2.77-14.7-2.77h-5.67c-5.54-14.74-21.4-23.38-37.09-19.53c-6.82,1.69-12.73,5.47-17.09,10.94\n\tc-2.06,2.59-1.63,6.37,0.96,8.43c2.59,2.07,6.37,1.64,8.43-0.95c2.69-3.38,6.35-5.72,10.58-6.77\n\tc10.48-2.57,21.132,3.852,23.67,14.35c0.921,3.81,3.328,5.53,6.2,5.53h10.01c16.22,0,28.93,13.63,28.93,31.03v41h12v-41\n\tC236,123,229.94,110.77,220.37,102.96z M172.044,188.062L248,188v26h-12v24h-52v-24h-12L172.044,188.062z" })));
    };
    var WindDirectionIcon = function (_a) {
        var color = _a.color;
        return (react_1["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", height: "28", width: "28", viewBox: "64 64 896 896", style: { padding: "1.5px" } },
            react_1["default"].createElement("path", { fill: color, d: "M288 32c0 17.7 14.3 32 32 32h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H352c53 0 96-43 96-96s-43-96-96-96H320c-17.7 0-32 14.3-32 32zm64 352c0 17.7 14.3 32 32 32h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H384c-17.7 0-32 14.3-32 32zM128 512h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H160c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32 14.3-32 32s14.3 32 32 32z" })));
    };
    var generateIcon = function (type, color) {
        switch (type) {
            case "Point":
                return react_1["default"].createElement(icons_1.EnvironmentOutlined, { style: { color: color } });
            case "MultiLineString":
                return react_1["default"].createElement(icons_1.BranchesOutlined, { style: { color: color } });
            case "MultiPolygon":
                return react_1["default"].createElement(icons_1.GatewayOutlined, { style: { color: color } });
            case "air_pollution":
                return react_1["default"].createElement(AirPollutionIcon, { color: color });
            case "wind_direction":
                return react_1["default"].createElement(WindDirectionIcon, { color: color });
        }
    };
    react_1.useEffect(function () {
        setLoading(true);
    }, []);
    react_1.useEffect(function () {
        if (props.isBaseMap) {
            setLoading(true);
            getAllLayers(null);
        }
    }, [props.isBaseMap, refreshLayer]);
    //---------------Fetch all layers in mission----------------------------------------
    var getAllLayers = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("I am inside getAllLayers");
                    if (!!props.isBaseMap) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpCall_1["default"].get("" + apis_1["default"].GET_ALL_LAYERS_FOR_MISSION, {
                            params: {
                                missionId: id
                            }
                        })];
                case 2:
                    result = _a.sent();
                    if (result.data.status) {
                        SetAllLayers(result.data.data.layers);
                        SetMissionLayers({
                            alertGeojsonUrl: missionGeojsonURL("alert", props.isBaseMap, dateRange[0], dateRange[1]),
                            vodGeojsonUrl: missionGeojsonURL("vod", props.isBaseMap, dateRange[0], dateRange[1]),
                            isAlertChecked: false,
                            isVODChecked: false
                        });
                        // setAllLayers(result.data.data.layers);
                        if (result.data.message === "No layer exists for mission") {
                            setMissioName(result.data.data.mission);
                            setViewport({
                                latitude: result.data.data.centerPoints.lat,
                                longitude: result.data.data.centerPoints.lng,
                                zoom: 13,
                                pitch: 0,
                                minZoom: 0,
                                maxZoom: 22,
                                bearing: 0
                            });
                        }
                        else {
                            setMissioName(result.data.data.mission);
                            // segrigateLayers(result.data.data.layers);
                            setViewport({
                                latitude: result.data.data.centerPoints.lat,
                                longitude: result.data.data.centerPoints.lng,
                                zoom: 13,
                                pitch: 0,
                                minZoom: 0,
                                maxZoom: 22,
                                bearing: 0
                            });
                        }
                    }
                    else {
                        antd_1.message.error("" + result.data.message);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.log(error_1);
                    antd_1.message.error("Layers Could Not Be Loaded");
                    httpErrorHandle_1.AxiosErrorHandler(error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [3 /*break*/, 10];
                case 6:
                    _a.trys.push([6, 8, 9, 10]);
                    return [4 /*yield*/, httpCall_1["default"].get(apis_1["default"].GET_ALL_BASELAYERS)];
                case 7:
                    result = _a.sent();
                    if (result.data.success) {
                        setMissioName("none");
                        // setAllLayers(result.data.data);
                        SetAllLayers(result.data.data);
                    }
                    else {
                        antd_1.message.error(result.data.message);
                    }
                    return [3 /*break*/, 10];
                case 8:
                    error_2 = _a.sent();
                    console.log(error_2);
                    //message.error("errrorrrrr");
                    httpErrorHandle_1.AxiosErrorHandler(error_2);
                    return [3 /*break*/, 10];
                case 9:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
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
    var deleteLayer = function (layerId) {
        setLoading(true);
        if (props.isBaseMap) {
            httpCall_1["default"]["delete"]("" + apis_1["default"].DELETE_BASE_LAYER, {
                data: {
                    layers: [layerId]
                }
            })
                .then(function (res) {
                if (res.data.status) {
                    // removeLayerFromTree([layerId]);
                    // remove layer from vector create form
                    var vectors = vectorLayers.filter(function (layer) { return layer._id !== id; });
                    setvectorLayers(vectors);
                    var newTabkeys = tabKeys.filter(function (key) { return key !== id; });
                    setTabKeys(newTabkeys);
                    var newPanes = panes.filter(function (pane) { return pane.id !== id; });
                    if (newPanes.length) {
                        setActiveKey(newPanes[newPanes.length - 1].id);
                    }
                    else {
                        setActiveKey("");
                    }
                    setPanes(newPanes);
                    SetAllLayers(function (prev) {
                        return prev.filter(function (layer) { return layer._id !== layerId; });
                    });
                    antd_1.message.success(res.data.message);
                    //console.log(res.data);
                }
                else {
                    antd_1.message.error(res.data.message);
                    console.log(res.data);
                }
            })["catch"](function (err) {
                var _a;
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
                if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                    antd_1.message.warning("Sorry! You are not authorised to delete layer. Please contact admin");
                }
                else
                    console.log(err);
            })["finally"](function () {
                setLoading(false);
                handleCancel1();
            });
        }
        else {
            httpCall_1["default"]["delete"]("" + apis_1["default"].DELETE_LAYER, {
                params: {
                    id: layerId
                }
            })
                .then(function (res) {
                if (res.data.status) {
                    // removeLayerFromTree([layerId]);
                    // remove layer from vector create form
                    var vectors = vectorLayers.filter(function (layer) { return layer._id !== id; });
                    setvectorLayers(vectors);
                    var newTabkeys = tabKeys.filter(function (key) { return key !== id; });
                    setTabKeys(newTabkeys);
                    var newPanes = panes.filter(function (pane) { return pane.id !== id; });
                    if (newPanes.length) {
                        setActiveKey(newPanes[newPanes.length - 1].id);
                    }
                    else {
                        setActiveKey("");
                    }
                    setPanes(newPanes);
                    SetAllLayers(function (prev) {
                        return prev.filter(function (layer) { return layer._id !== layerId; });
                    });
                    antd_1.message.success(res.data.message);
                    //console.log(res.data);
                }
                else {
                    antd_1.message.error(res.data.message);
                    console.log(res.data);
                }
            })["catch"](function (err) {
                var _a;
                if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                    antd_1.message.warning("Sorry! You are not authorised to delete layer. Please contact admin");
                }
                else
                    console.log(err);
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            })["finally"](function () {
                setLoading(false);
                handleCancel1();
            });
        }
    };
    var deleteMultipleLayers = function (type) {
        setLoading(true);
        var layers = AllLayers.filter(function (layer) { return layer._isChecked && layer.type === type; }).map(function (layer) { return layer._id; });
        if (props.isBaseMap) {
            httpCall_1["default"]["delete"]("" + apis_1["default"].DELETE_BASE_LAYER, {
                data: {
                    layers: layers
                }
            })
                .then(function (res) {
                if (res.data.status) {
                    // removeLayerFromTree(layers);
                    // remove layer from vector create form
                    var vectors = vectorLayers.filter(function (layer) { return !layers.includes(layer._id); });
                    setvectorLayers(vectors);
                    var newTabkeys = tabKeys.filter(function (key) { return !layers.includes(key); });
                    setTabKeys(newTabkeys);
                    var newPanes = panes.filter(function (pane) { return !layers.includes(pane.id); });
                    if (newPanes.length) {
                        setActiveKey(newPanes[newPanes.length - 1].id);
                    }
                    else {
                        setActiveKey("");
                    }
                    setPanes(newPanes);
                    SetAllLayers(function (prev) {
                        return prev.filter(function (layer) { return !layers.includes(layer._id); });
                    });
                    antd_1.message.success(res.data.message);
                    //console.log(res.data);
                }
                else {
                    antd_1.message.error(res.data.message);
                    console.log(res.data);
                }
            })["catch"](function (err) {
                var _a;
                if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                    antd_1.message.warning("Sorry! You are not authorised to delete layer. Please contact admin");
                }
                else
                    console.log(err);
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            })["finally"](function () {
                setLoading(false);
                handleCancel1();
            });
        }
        else {
            httpCall_1["default"]
                .post("" + apis_1["default"].DELETE_MULTIPLE_LAYERS, {
                layers: layers
            })
                .then(function (res) {
                if (res.data.status) {
                    // removeLayerFromTree(layers);
                    // remove layer from vector create form
                    var vectors = vectorLayers.filter(function (layer) { return !layers.includes(layer._id); });
                    setvectorLayers(vectors);
                    var newTabkeys = tabKeys.filter(function (key) { return !layers.includes(key); });
                    setTabKeys(newTabkeys);
                    var newPanes = panes.filter(function (pane) { return !layers.includes(pane.id); });
                    if (newPanes.length) {
                        setActiveKey(newPanes[newPanes.length - 1].id);
                    }
                    else {
                        setActiveKey("");
                    }
                    setPanes(newPanes);
                    SetAllLayers(function (prev) {
                        return prev.filter(function (layer) { return !layers.includes(layer._id); });
                    });
                    antd_1.message.success(res.data.message);
                    //console.log(res.data);
                }
                else {
                    antd_1.message.error(res.data.message);
                    console.log(res.data);
                }
            })["catch"](function (err) {
                var _a;
                if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                    antd_1.message.warning("Sorry! You are not authorised to delete layer. Please contact admin");
                }
                else
                    console.log(err);
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            })["finally"](function () {
                setLoading(false);
                handleCancel1();
            });
        }
    };
    var handleMaskLayerOption = function (id) {
        SetAllLayers(function (prev) {
            return prev.map(function (layer) {
                if (layer._id === id)
                    layer._isMasked = !layer._isMasked;
                setLayerOpacity(1);
                return layer;
            });
        });
    };
    var handleMeshSourceOption = function (id) {
        SetAllLayers(function (prev) {
            return prev.map(function (layer) {
                if (layer.type == "Raster" && layer.raster == "CESIUM_3D") {
                    if (layer._id == id) {
                        layer._isMeshSource = !layer._isMeshSource;
                    }
                    else {
                        layer._isMeshSource = false;
                    }
                }
                return layer;
            });
        });
    };
    var refreshVectorLayer = function () {
        filterLayers();
        antd_1.message.success("Checkout the vector section for Inference Layer");
    };
    var toggleElevation = function () {
        setIsElevationEnabled(function (prevValue) { return !prevValue; });
        console.log("Elevation toggled successfully. New state:", isElevationEnabled);
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
    var getTitleElement = function (layer) {
        var treeMenuOnClick = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var type, _a, idOfLayerGroup;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        type = layer.type;
                        _a = e.key;
                        switch (_a) {
                            case "1": return [3 /*break*/, 1];
                            case "2": return [3 /*break*/, 2];
                            case "3": return [3 /*break*/, 3];
                            case "4": return [3 /*break*/, 4];
                            case "5": return [3 /*break*/, 5];
                            case "6": return [3 /*break*/, 6];
                            case "7": return [3 /*break*/, 8];
                            case "8": return [3 /*break*/, 9];
                            case "9": return [3 /*break*/, 10];
                            case "10": return [3 /*break*/, 11];
                            case "11": return [3 /*break*/, 12];
                            case "12": return [3 /*break*/, 13];
                            case "13": return [3 /*break*/, 14];
                            case "14": return [3 /*break*/, 15];
                            case "15": return [3 /*break*/, 16];
                        }
                        return [3 /*break*/, 17];
                    case 1:
                        showModal1();
                        setSelectedLayerId(layer._id);
                        setCaptureDate(layer.captureDate);
                        setLayerName(layer.name);
                        setDefaultLayerType({
                            layerType: type,
                            layerProp: type === "Vector" ? layer.vector : layer.raster,
                            featureType: type === "Vector" ? vectorprops_1.featureType[layer.vector] : null
                        });
                        setSelectedLayerType(type.toLowerCase());
                        return [3 /*break*/, 18];
                    case 2:
                        openThread("layer", layer._id, {});
                        return [3 /*break*/, 18];
                    case 3:
                        downloadjs_1["default"](constants_1.STATIC_URL + layer.layerpath);
                        return [3 /*break*/, 18];
                    case 4:
                        setUpdate(true);
                        setUpdateType(type);
                        setUpdateId(layer._id);
                        setIsModalVisible4(true);
                        return [3 /*break*/, 18];
                    case 5:
                        antd_1.Modal.confirm({
                            title: "Delete Layer?",
                            icon: react_1["default"].createElement(icons_1.ExclamationCircleOutlined, null),
                            content: "Are you sure you want to delete this layer?",
                            okText: "Yes",
                            cancelText: "No",
                            onOk: function () {
                                deleteLayer(layer._id);
                            }
                        });
                        return [3 /*break*/, 18];
                    case 6:
                        idOfLayerGroup = typeof layer.layerGroupId === "object"
                            ? layer.layerGroupId._id
                            : layer.layerGroupId;
                        return [4 /*yield*/, removeLayerFromGroup(idOfLayerGroup, layer._id)];
                    case 7:
                        _b.sent();
                        // updateTreeDataAfterSingleLayerRemovalFromGroup(layer._id);
                        return [3 /*break*/, 18];
                    case 8:
                        setVisibleGroupCreateModal(!visibleGroupCreateModal);
                        type === "Raster" ? setMoveType(2) : setMoveType(1);
                        return [3 /*break*/, 18];
                    case 9:
                        antd_1.Modal.confirm({
                            title: "Delete Selected Layers?",
                            icon: react_1["default"].createElement(icons_1.ExclamationCircleOutlined, null),
                            content: "Are you sure you want to delete selected layers?",
                            okText: "Yes",
                            cancelText: "No",
                            onOk: function () {
                                deleteMultipleLayers(type);
                            }
                        });
                        return [3 /*break*/, 18];
                    case 10:
                        setMoveToOtherGroupModal(true);
                        type === "Raster" ? setMoveType(2) : setMoveType(1);
                        return [3 /*break*/, 18];
                    case 11:
                        httpCall_1["default"]
                            .get(apis_1["default"].DOWNLOAD_KML + "?id=" + layer._id)
                            .then(function (res) {
                            if (res.data.status) {
                                //download(API_URL + res.data.link);
                                window.open(constants_1.PUBLIC_URL + res.data.link);
                            }
                            else {
                                console.log(res.data.message);
                            }
                        })["catch"](function (err) {
                            console.log(err);
                            httpErrorHandle_1.AxiosErrorHandler(err, logout);
                        });
                        return [3 /*break*/, 18];
                    case 12:
                        antd_1.Modal.confirm({
                            title: "Flag Layer?",
                            icon: react_1["default"].createElement(icons_1.ExclamationCircleOutlined, null),
                            content: "Are you sure you want to flag the entire layer?",
                            okText: "Yes",
                            cancelText: "No",
                            onOk: function () {
                                toggleLayerFlag(layer._id, true);
                            }
                        });
                        return [3 /*break*/, 18];
                    case 13:
                        antd_1.Modal.confirm({
                            title: "Un-flag Layer?",
                            icon: react_1["default"].createElement(icons_1.ExclamationCircleOutlined, null),
                            content: "Are you sure you want to un-flag the entire layer? This will un-flag all flagged features as well.",
                            okText: "Yes",
                            cancelText: "No",
                            onOk: function () {
                                toggleLayerFlag(layer._id, false);
                            }
                        });
                        return [3 /*break*/, 18];
                    case 14:
                        setViewDocs(true);
                        setSelectedLayerInfo(layer);
                        setFeatureLayer(layer._id);
                        setFeatureLayerPath(layer.layerpath);
                        setWindowTitle(layer.name);
                        setSelectedLayerLabel(layer.layerLabel ? layer.layerLabel : "No label selected");
                        setSelectedLayerPopupLabel(layer.layerPopupLabel ? layer.layerPopupLabel : "No label selected");
                        setIsLayerDocs(true);
                        return [3 /*break*/, 18];
                    case 15:
                        handleMaskLayerOption(layer._id);
                        return [3 /*break*/, 18];
                    case 16:
                        toggleElevation();
                        return [3 /*break*/, 18];
                    case 17: return [3 /*break*/, 18];
                    case 18: return [2 /*return*/];
                }
            });
        }); };
        return (react_1["default"].createElement(antd_1.Dropdown, { menu: { items: treeMenu(layer), onClick: treeMenuOnClick }, trigger: ["contextMenu"] },
            react_1["default"].createElement(antd_1.Tooltip, { mouseLeaveDelay: 0.0, mouseEnterDelay: 0.0, placement: "bottom", title: react_1["default"].createElement("span", null,
                    layer.name,
                    " \u2022",
                    " ",
                    moment_1["default"](layer.captureDate).format("DD/MM/YYYY")) },
                react_1["default"].createElement(antd_1.Badge, { style: {
                        backgroundColor: "#3b86ff",
                        boxShadow: "0 0 3px 1px black",
                        zIndex: 10
                    }, offset: [25, 6], count: react_1["default"].createElement(react_1["default"].Fragment, null, layer.isThreadExist ? layer.commentCount : ""), overflowCount: 9 },
                    react_1["default"].createElement(Text, { style: {
                            width: layer.type === "Raster"
                                ? layer.layerGroupId
                                    ? "139px"
                                    : "160px"
                                : layer.layerGroupId
                                    ? "119px"
                                    : "140px"
                        }, ellipsis: true, onClick: function () {
                            var _a;
                            if (layer._isChecked && ((_a = layer._metadata) === null || _a === void 0 ? void 0 : _a.bounds)) {
                                var _b = calculateViewport(layer._metadata.bounds), longitude = _b.longitude, latitude = _b.latitude, zoom = _b.zoom;
                                setViewport({
                                    longitude: longitude /* : (bounds[0][0] + bounds[1][0]) / 2 */,
                                    latitude: latitude /* : (bounds[0][1] + bounds[1][1]) / 2 */,
                                    zoom: zoom,
                                    pitch: 0,
                                    minZoom: 0,
                                    maxZoom: 22,
                                    bearing: 0,
                                    transitionDuration: 2000,
                                    transitionInterpolator: new deck_gl_1.FlyToInterpolator()
                                });
                            }
                        }, onDoubleClick: function () {
                            if (!props.isBaseMap || layer.type === "Vector") {
                                setlayerToAddInAttributeTable({
                                    name: layer.name,
                                    type: layer.type,
                                    id: layer._id,
                                    path: layer.layerpath,
                                    count: layer.featureCount
                                });
                            }
                        } }, layer.name),
                    layer.type === "Vector" && layer.isFlagged && (react_1["default"].createElement(icons_1.FlagOutlined, { style: { color: "#da1c5c" } })),
                    layer.type === "Vector" && layer.isPublic && (react_1["default"].createElement(icons_1.EyeOutlined, { style: { color: "#3b86ff" } }))))));
    };
    var getGroupTitleElement = function (layerGroup) {
        var items = [
            {
                key: "1",
                label: "Rename"
            },
            {
                key: "2",
                label: "Delete"
            },
        ];
        var onClick = function (e) {
            if (e.key === "1") {
                setgroupName(layerGroup.name);
                setgroupToEdit({
                    id: layerGroup._id,
                    name: layerGroup.name
                });
                setVisibleEditModal(true);
            }
            if (e.key === "2") {
                antd_1.Modal.confirm({
                    title: "Delete Group?",
                    icon: react_1["default"].createElement(icons_1.ExclamationCircleOutlined, null),
                    content: (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("p", null, "Are You Sure To Want To Delete This Group"),
                        react_1["default"].createElement("b", null, "These Layers Will be deleted along with this group"),
                        react_1["default"].createElement(react_1["default"].Fragment, null, AllLayers.filter(function (layer) { var _a; return ((_a = layer.layerGroupId) === null || _a === void 0 ? void 0 : _a._id) === layerGroup._id; }).map(function (layer) {
                            return react_1["default"].createElement("p", null, layer.name);
                        })))),
                    okText: "Yes",
                    cancelText: "No",
                    onOk: function () {
                        deleteGroup(layerGroup._id);
                    }
                });
            }
        };
        return (react_1["default"].createElement(antd_1.Dropdown, { menu: { items: items, onClick: onClick }, trigger: ["contextMenu"] },
            react_1["default"].createElement(Text, { style: { width: "160px" }, ellipsis: true }, layerGroup.name)));
    };
    var _125 = react_1.useState(null), groupToEdit = _125[0], setgroupToEdit = _125[1];
    var _126 = react_1.useState(false), visibleEditModal = _126[0], setVisibleEditModal = _126[1];
    var _127 = react_1.useState(""), groupName = _127[0], setgroupName = _127[1];
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
    var deleteGroup = function (id) {
        setLoading(true);
        httpCall_1["default"]["delete"]("" + apis_1["default"].DELETE_LAYER_GROUP, {
            params: {
                _id: id
            }
        })
            .then(function (res) {
            if (res.data.status) {
                antd_1.message.success(res.data.message);
                var deletedLayerGroupId_1 = res.data.data._id;
                SetAllLayers(function (prev) {
                    return prev.filter(function (layer) { var _a; return ((_a = layer.layerGroupId) === null || _a === void 0 ? void 0 : _a._id) !== deletedLayerGroupId_1; });
                });
                // updateTreeDataAfterGroupDelete(id);
            }
            else {
                antd_1.message.error(res.data.message);
            }
        })["catch"](function (err) {
            console.log(err);
            antd_1.message.error(err.message);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        })["finally"](function () {
            setLoading(false);
        });
    };
    var editGroup = function (group) {
        setLoading(true);
        httpCall_1["default"]
            .patch("" + apis_1["default"].EDIT_LAYER_GROUP, {
            name: group.name,
            _id: group.id,
            layers: []
        })
            .then(function (res) {
            if (res.data.status) {
                antd_1.message.success(res.data.message);
                // updateTreeDataAfterGroupEdit(res.data.data, group.id);
                var updatedLayerGroup_1 = {
                    _id: res.data.data._id,
                    name: res.data.data.name,
                    layers: res.data.data.layers,
                    createdBy: res.data.data.createdBy,
                    tenantId: res.data.data.tenantId,
                    createdAt: res.data.data.createdAt,
                    updatedAt: res.data.data.updatedAt
                };
                SetAllLayers(function (prev) {
                    return prev.map(function (layer) {
                        if (updatedLayerGroup_1.layers.includes(layer._id)) {
                            layer.layerGroupId = updatedLayerGroup_1;
                        }
                        return layer;
                    });
                });
            }
            else {
                antd_1.message.error(res.data.message);
            }
        })["catch"](function (err) {
            console.log(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        })["finally"](function () {
            editForm.resetFields();
            setVisibleEditModal(false);
            setgroupName("");
            setgroupToEdit(null);
            setLoading(false);
        });
    };
    // ++++++++++++++++++++++++++++++++
    var renderRangePicker = function () {
        var disabledDate = function (current) {
            return current && current > moment_1["default"]();
        };
        return (react_1["default"].createElement(antd_1.DatePicker.RangePicker, { defaultValue: [moment_1["default"](dateRange[0]), moment_1["default"](dateRange[1])], disabledDate: disabledDate, disabled: [props.isBaseMap ? false : true, false], format: "DD-MM-YYYY", onChange: onRangeChange }));
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
    react_1.useEffect(function () {
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
    var onFinish = function (values) {
        //console.log("Success:", values);
    };
    var onFinish1 = function (values) {
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
    var uploadProps = {
        name: "file",
        multiple: false,
        fileList: fileList,
        onRemove: function (file) {
            setFileList([]);
        },
        beforeUpload: function (file) {
            // console.log("digi files:",file);
            setFileList([file]);
            return false;
        }
    };
    react_1.useEffect(function () {
        console.log("panes", panes);
    }, [panes]);
    var updateFeatureCountInLayers = function (count, id) {
        var newPanes = panes.map(function (pane) {
            if (pane.id === id) {
                return __assign(__assign({}, pane), { count: count });
                return pane;
            }
        });
        setPanes(newPanes);
    };
    // TabPanes
    var add = function (name, type, id, path, count) {
        if (!tabKeys.find(function (key) { return key == id; })) {
            tabKeys.push(id);
            setTabKeys(tabKeys);
            panes.push({
                title: name,
                type: type == "Raster" ? "raster" : "vector",
                key: id,
                id: id,
                path: path,
                count: count
            });
            setPanes(panes);
            setActiveKey(id);
        }
        else
            setActiveKey(id);
        // const newPanes = [...panes];
        // newPanes.push({ title: name, content: 'Content of new Tab', key: id,id:id, type: type == "Raster" ? "raster" : "vector", });
        // setPanes(newPanes);
        // setActiveKey(id)
        //setNewTabIndex(newTabIndex + 1);
        //const activeKey = `newTab${newTabIndex}`;
        //const newPanes = [...panes];
    };
    react_1.useEffect(function () {
        if (layerToAddInAttributeTable) {
            var name = layerToAddInAttributeTable.name, type = layerToAddInAttributeTable.type, id_1 = layerToAddInAttributeTable.id, path = layerToAddInAttributeTable.path, count = layerToAddInAttributeTable.count;
            add(name, type, id_1, path, count);
        }
    }, [layerToAddInAttributeTable]);
    var remove = function (targetKey) {
        var newActiveKey = activeKey;
        var lastIndex;
        panes.forEach(function (pane, i) {
            if (pane.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        var newPanes = panes.filter(function (pane) { return pane.key !== targetKey; });
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex].key;
            }
            else {
                newActiveKey = newPanes[0].key;
            }
        }
        var newTabKeys = tabKeys.filter(function (tabKey) { return tabKey !== targetKey; });
        setTabKeys(newTabKeys);
        setPanes(newPanes);
        setActiveKey(newActiveKey);
    };
    var changeLayerType = function (value) {
        if (Object.values(vectorprops_1.vectorProps).includes(value)) {
            setshowColorPicker(true);
            setLayerType("Vector");
            setLayerProp(value);
        }
        else if (Object.values(rasterprops_1.rasterProps).includes(value)) {
            setshowColorPicker(false);
            setLayerType("Raster");
            setLayerProp(value);
        }
    };
    // ++++++++++++++++++++++++++++++++++++++ Create Layer ++++++++++++++++++++++++++++++++++++++++++++++++++++++
    var fileTypes = ["geojson", "tif", "kml", "shp", "zip", "laz"];
    var createLayer = function () { return __awaiter(_this, void 0, void 0, function () {
        var file, ext, docModel, uploadToken, body, result, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!fileList.length) {
                        antd_1.message.error("Please select file to upload");
                        return [2 /*return*/];
                    }
                    file = fileList[0];
                    ext = file.name.split(".").pop();
                    if (!fileTypes.includes(ext)) {
                        antd_1.message.error("Please select the geojson or tif file or laz file");
                        return [2 /*return*/];
                    }
                    if (!layerType || !layerProp || !captureDate || !layerName) {
                        antd_1.message.error("Please fill all the required field");
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    setUploading(true);
                    docModel = layerType === "Vector" ? fileUpload_1.DocModel.VECTOR : layerType === "Raster" ? fileUpload_1.DocModel.RASTER : fileUpload_1.DocModel.LAYER_FILES;
                    return [4 /*yield*/, fileUpload_1.uploadFile(fileList[0], docModel, function (prog) {
                            console.info("PROGRESS: " + prog);
                            setProgress(prog * 100);
                        })];
                case 2:
                    uploadToken = _c.sent();
                    body = __assign(__assign({ file: uploadToken, missionId: id, captureDate: captureDate, name: layerName, type: layerType, color: layerColor, inHeritOriginalColorFromFile: inheritColor, icon: icon2 }, (layerType === "Vector" ? { vector: layerProp } : {})), (layerType === "Raster" ? { raster: layerProp } : {}));
                    return [4 /*yield*/, httpCall_1["default"].post(apis_1["default"].CREATE_LAYER + "/" + layerType, body)];
                case 3:
                    result = _c.sent();
                    console.log("vector layer is uploaded", result);
                    if (result.data.status) {
                        console.log("metadata for me:", result.data.data);
                        addLayer(result.data.data);
                        antd_1.message.success("Layer created!");
                    }
                    else {
                        antd_1.message.error(result.data.message);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _c.sent();
                    if (((_a = err_1.response) === null || _a === void 0 ? void 0 : _a.status) === 403) {
                        if (((_b = err_1.response) === null || _b === void 0 ? void 0 : _b.data.message) === "Package has expired! Please renew!") {
                            setExpiryModal(true);
                            // window.setTimeout(function () {
                            //   AxiosErrorHandler(err, logout);
                            // }, 5000);
                        }
                        else {
                            setLimitModal(true);
                            console.log(err_1.response);
                        }
                    }
                    else {
                        console.log(err_1);
                        httpErrorHandle_1.AxiosErrorHandler(err_1, logout);
                    }
                    return [3 /*break*/, 6];
                case 5:
                    setUploading(false);
                    setFileList([]);
                    setCaptureDate("");
                    setLayerName("");
                    setLayerType("");
                    setLayerProp(null);
                    setIcon("");
                    form.resetFields();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // ++++++++++++++++++++++++++++++++++++++++++++++ Add Layer to list after createing new one +++++++++++++++++++++++++++++++++++++++++++++++
    var addLayer = function (layer) {
        try {
            setIsDrawing(false);
            setFeatureState(myFeatureCollection);
            if (layer.type === "Vector") {
                setvectorLayers(__spreadArrays(vectorLayers, [layer]));
            }
            var rasterSettings_1 = layer.type === "Raster" ? rasterprops_1.defaultRasterSettings[layer.raster] : {};
            fetchLayerBounds(layer)
                .then(function (bounds) {
                SetAllLayers(function (prev) { return __spreadArrays(prev, [
                    __assign(__assign({}, layer), { _isChecked: true, _render3D: false, _metadata: __assign({ bounds: bounds }, rasterSettings_1) }),
                ]); });
            })["catch"](function (error) { return antd_1.message.error(error.message); });
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
        }
        catch (error) {
            antd_1.message.error(error.message);
        }
    };
    var drawPolygonTool = new editable_layers_1.EditableGeoJsonLayer({
        id: "geojson",
        data: featureState,
        mode: mode.mode,
        selectedFeatureIndexes: selectedFeatureIndexes,
        onEdit: function (_a) {
            var updatedData = _a.updatedData, editType = _a.editType, editContext = _a.editContext;
            var updatedSelectedFeatureIndexes = selectedFeatureIndexes;
            setFeatureState(updatedData);
            if (editType === "addFeature") {
                //event to fire up infowindow for registering new vector layer/shape
                //console.log("New Shape Created!", updatedData);
                var featureIndexes = editContext.featureIndexes;
                updatedSelectedFeatureIndexes = __spreadArrays(selectedFeatureIndexes, featureIndexes);
                var modee = void 0;
                var centerPoint = void 0;
                if (mode.mode === editable_layers_2.DrawPolygonMode) {
                    modee = "PolygonView";
                    var fLat = 0;
                    var fLng = 0;
                    for (var i = 0; i < updatedData.features[0].geometry.coordinates[0].length; i++) {
                        fLng += updatedData.features[0].geometry.coordinates[0][i][0];
                    }
                    fLng = fLng / updatedData.features[0].geometry.coordinates[0].length;
                    for (var i = 0; i < updatedData.features[0].geometry.coordinates[0].length; i++) {
                        fLat += updatedData.features[0].geometry.coordinates[0][i][1];
                    }
                    fLat = fLat / updatedData.features[0].geometry.coordinates[0].length;
                    centerPoint = [fLng, fLat];
                    if (volumeCalculation) {
                        volumeCal_1.calculateVolume(updatedData.features[0].geometry.coordinates[0], deckRef);
                    }
                }
                else if (mode.mode === editable_layers_2.DrawLineStringMode) {
                    modee = "LineView";
                    var fLat = 0;
                    var fLng = 0;
                    for (var i = 0; i < updatedData.features[0].geometry.coordinates.length; i++) {
                        fLng += updatedData.features[0].geometry.coordinates[i][0];
                    }
                    fLng = fLng / updatedData.features[0].geometry.coordinates.length;
                    for (var i = 0; i < updatedData.features[0].geometry.coordinates.length; i++) {
                        fLat += updatedData.features[0].geometry.coordinates[i][1];
                    }
                    fLat = fLat / updatedData.features[0].geometry.coordinates.length;
                    centerPoint = [fLng, fLat];
                }
                else {
                    modee = "PointView";
                    centerPoint = __spreadArrays(updatedData.features[updatedData.features.length - 1].geometry
                        .coordinates);
                }
                setMode({
                    mode: editable_layers_2.ModifyMode
                });
                setModeState({
                    editMode: null,
                    isCompleted: true
                });
                setToolSelected("");
                InfoWindow("new", centerPoint, "New Shape", modee, updatedData.features[0], true, "new", "0");
            }
            setselectedFeatureIndexes(updatedSelectedFeatureIndexes);
        },
        pickable: true,
        pickingRadius: 15,
        pointRadiusUnits: "pixels",
        pointRadiusScale: 1,
        pointRadiusMinPixels: 8
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
    var editLayer = function () {
        setLoading(true);
        var data = {
            name: layerName,
            captureDate: captureDate
        };
        if (layerProp) {
            data.layerType = layerProp;
        }
        // change color
        if (selectedLayerType === "vector") {
            httpCall_1["default"]
                .patch(apis_1["default"].CHANGE_COLOR_BY_ID, {
                id: selectedLayerId,
                color: layerColor,
                icon: icon2
            })
                .then(function (res) {
                if (res.data.status) {
                    updateLayerDataAfterEditing(res.data.data, "color changed", selectedLayerId);
                    setShouldAttributeTableReload(!shouldAttributeTableReload);
                }
                else {
                    antd_1.message.error("Color not updated: " + res.data.message);
                }
            })["catch"](function (err) {
                var _a;
                console.log(err);
                if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                    antd_1.message.warning("Sorry! You are not authorised to change color. Please contact admin");
                }
                else
                    console.log(err);
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            })["finally"](function () {
                setLayerColor("#ffaa00"); // default value that was previously also used in first declaration
                setLayerName("");
                setCaptureDate("");
                setIcon2(iconOptions[0].value); // default value that was previously also used in first declaration
                setLoading(false);
            });
            // refreshLayers();
        }
        setLoading(true);
        httpCall_1["default"]
            .patch("" + apis_1["default"].EDIT_LAYER, data, {
            params: {
                id: selectedLayerId
            }
        })
            .then(function (res) {
            if (res.data.data) {
                antd_1.message.success(res.data.message);
                //console.log(res.data.data);
                // --update layer
                updateLayerDataAfterEditing(res.data.data[0], null, null);
                setLoading(false);
            }
            else {
                antd_1.message.error(res.data.message);
            }
        })["catch"](function (err) {
            var _a;
            if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                antd_1.message.warning("Sorry! You are not authorised to edit layer. Please contact admin");
            }
            else
                console.log(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        })["finally"](function () {
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
    var editFeature = function (data, color, index) {
        data.properties["color"] = color;
        setLoading(true);
        httpCall_1["default"]
            .patch("" + apis_1["default"].EDIT_FEATURE, {
            id: selectedLayerId,
            featureIndex: index,
            feature: data
        })
            .then(function (result) {
            updateLayerDataAfterEditing(result.data.data, null, selectedLayerId);
            forceUpdateLayers(selectedLayerId);
            antd_1.message.success(result.data.message);
        })["catch"](function (err) {
            var _a;
            if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                antd_1.message.warning("Sorry! You are not authorised to edit feature. Please contact admin");
            }
            else
                console.log(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        })["finally"](function () {
            setSelectedLayerId("");
            setColorChangeFeatureData(null);
            setShowColorChangeForm(false);
            setLoading(false);
        });
    };
    var updateLayerDataAfterEditing = function (data, color, id) {
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
            SetAllLayers(function (prev) {
                return prev.map(function (layer) {
                    if (layer._id === data._id)
                        return __assign(__assign({}, data), { _isChecked: layer._isChecked, _render3D: layer._render3D });
                    else
                        return layer;
                });
            });
        }
    };
    //==============socket listen========================
    react_1.useEffect(function () {
        if (id) {
            if (!socket.current) {
                socket.current = socket_io_client_1["default"](constants_1.API_URL + "/stream/mission-specific?missionID=" + id);
                socket.current.on("IMAGE_UPLOADED", function (data) {
                    //console.log("Image upload successful!!", data);
                    forceUpdateLayers(data.layerId);
                });
                socket.current.on("ASSIGNED SUCESSFULLY", function (dataa) {
                    openNotification(dataa.layerName);
                    setPicToMapData(dataa.data);
                    console.log(dataa);
                });
                // ----- listen to pic2map v2 event -----------------
                socket.current.on("pic-to-map", function (data) {
                    console.log("socket testing!  ", data);
                    if (data.result) {
                        antd_1.message.success("Layer Created Successfully!");
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
    var toolMenu = function () {
        var items = [
            {
                key: "0",
                label: "Line Tool"
            },
            {
                key: "1",
                label: "Polygon Tool"
            },
            {
                key: "2",
                label: "Marker Tool"
            },
        ];
        if (showMarkerSizeTool) {
            items.push({
                key: "3",
                label: (react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Marker Size" },
                    react_1["default"].createElement(antd_1.Slider, { min: 0.3, max: 1, onChange: onChangeSizeSlider, step: 0.1, defaultValue: 1, value: pointMarkerSize, tooltip: { placement: "right" }, style: { margin: 0, padding: "5px 4px" } })))
            });
        }
        if (isMaskLayerVisible) {
            items.push({
                key: "3",
                label: (react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Mask Layer Size" },
                    react_1["default"].createElement(antd_1.Slider, { min: 150, max: 400, onChange: changePolygonSize, step: 0.1, defaultValue: 1, value: polygonSize, tooltip: { placement: "right" }, style: { margin: 0, padding: "5px 4px" } })))
            });
        }
        return items;
    };
    var toolMenuOnClick = function (e) {
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
    var filterMenu = [
        {
            key: "vector",
            label: "Vector",
            children: __spreadArrays(Object.values(vectorprops_1.featureTypes).map(function (type) {
                return {
                    key: type,
                    label: type,
                    onTitleClick: function () {
                        setFilterState(function (prev) {
                            prev.vectorPropsType.add(type);
                            return __assign({}, prev);
                        });
                    },
                    children: __spreadArrays(Object.keys(vectorprops_1.featureType)
                        .filter(function (prop) { return vectorprops_1.featureType[prop] === type; })
                        .map(function (propName) {
                        return {
                            key: "" + propName + type,
                            label: (react_1["default"].createElement("div", { onClick: function () {
                                    return setFilterState(function (prev) {
                                        // prev.vectorPropsType.add(type);
                                        prev.vectorProps.add(propName);
                                        return __assign({}, prev);
                                    });
                                } }, propName))
                        };
                    }))
                };
            }), [
                {
                    key: "Other",
                    label: "Other",
                    children: __spreadArrays(Object.keys(vectorprops_1.featureType)
                        .filter(function (p) {
                        return ![
                            vectorprops_1.featureTypes.POINT,
                            vectorprops_1.featureTypes.MULTI_LINE_STRING,
                            vectorprops_1.featureTypes.MULTI_POLYGON,
                        ].includes(vectorprops_1.featureType[p]);
                    })
                        .map(function (p) {
                        return {
                            key: "" + p + vectorprops_1.featureType[p],
                            label: (react_1["default"].createElement("div", { onClick: function () {
                                    return setFilterState(function (prev) {
                                        // prev.vectorPropsType.add(featureType[p]);
                                        prev.vectorProps.add(p);
                                        return __assign({}, prev);
                                    });
                                } }, p))
                        };
                    }))
                },
            ])
        },
        {
            key: "raster",
            label: "Raster",
            children: Object.values(rasterprops_1.rasterProps).map(function (propName) {
                return {
                    key: propName,
                    label: (react_1["default"].createElement("div", { onClick: function () {
                            return setFilterState(function (prev) {
                                prev.rasterProps.add(propName);
                                return __assign({}, prev);
                            });
                        } }, propName))
                };
            })
        },
    ];
    //----------sorting menu
    var sortMenu = [
        {
            key: "1",
            label: "Name"
        },
        {
            key: "2",
            label: "Time"
        },
    ];
    var sortMenuOnClick = function (e) {
        if (e.key === "1") {
            setSortType("name");
        }
        if (e.key === "2") {
            setSortType("createdAt");
        }
    };
    // Set Active Layer Type
    react_1.useEffect(function () {
        console.log(activeKey);
        panes.map(function (pane) {
            console.log(pane);
            if (pane.id === activeKey && pane.type === "vector") {
                setActiveID(pane.id);
            }
            if (pane.id === activeKey)
                setActiveType(pane.type === "vector");
            //console.log(pane.type);
        });
    }, [activeKey]);
    //-----------------Date Formatting for Time Filter--------------------------
    var dateFormat = function () {
        var _a;
        var t = Number((_a = filterState.time) === null || _a === void 0 ? void 0 : _a.split(" ")[0]);
        var dt = new Date();
        dt.setDate(dt.getDate() - t);
        return moment_1["default"](dt).format("DD MMM");
    };
    //----------------------Badge Feature Count-------------------------------
    var overflowCount = function (count) {
        if (count <= 1000)
            return 1000;
        else if (count >= 5000)
            return 5000;
        else if (count % 500 === 0)
            return count - 500;
        else {
            var a = Math.floor(count / 1000);
            var b = count % 1000;
            var c = Math.floor(b / 500);
            var res = a * 1000;
            if (c > 0)
                res += 500;
            return res;
        }
    };
    //----------------SideBar state handeller function-----------------------------
    function sideBarHandeller() {
        if (sideBarState) {
            setSideBarIcon(react_1["default"].createElement(icons_1.DoubleLeftOutlined, null));
            setSideBarState(false);
        }
        else {
            setSideBarIcon(react_1["default"].createElement(icons_1.DoubleRightOutlined, null));
            setSideBarState(true);
        }
    }
    //---------------Handle Icon-----------------------------------
    function handleIcon(value) {
        setIcon(value);
    }
    var changeGroupOfLayer = function (groupid, layerids, keys) { return __awaiter(_this, void 0, void 0, function () {
        var res, updatedLayerGroup_2, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // const al = { ...allLayers };
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpCall_1["default"].patch("" + apis_1["default"].EDIT_LAYER_GROUP, {
                            _id: groupid,
                            layers: layerids
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.data.status) {
                        return [2 /*return*/, antd_1.message.error(res.data.message)];
                    }
                    updatedLayerGroup_2 = {
                        _id: res.data.data._id,
                        name: res.data.data.name,
                        layers: res.data.data.layers,
                        createdBy: res.data.data.createdBy,
                        tenantId: res.data.data.tenantId,
                        createdAt: res.data.data.createdAt,
                        updatedAt: res.data.data.updatedAt
                    };
                    SetAllLayers(function (prev) {
                        return prev.map(function (layer) {
                            if (updatedLayerGroup_2.layers.includes(layer._id)) {
                                layer.layerGroupId = updatedLayerGroup_2;
                            }
                            return layer;
                        });
                    });
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    console.log(err_2);
                    antd_1.message.error(err_2.message);
                    httpErrorHandle_1.AxiosErrorHandler(err_2, logout);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var removeLayerFromGroup = function (groupId, layerId) { return __awaiter(_this, void 0, void 0, function () {
        var res, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // const al = { ...allLayers };
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpCall_1["default"].post("" + apis_1["default"].DELETE_LAYER_ID_FROM_GROUP, {
                            _id: groupId,
                            layers: [layerId]
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.data.status) {
                        return [2 /*return*/, antd_1.message.error(res.data.message)];
                    }
                    SetAllLayers(function (prev) {
                        return prev.map(function (layer) {
                            if (layer._id === layerId) {
                                layer.layerGroupId = null;
                            }
                            return layer;
                        });
                    });
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _a.sent();
                    console.log(err_3);
                    antd_1.message.error(err_3.message);
                    httpErrorHandle_1.AxiosErrorHandler(err_3, logout);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var onDrop = function (info) { return __awaiter(_this, void 0, void 0, function () {
        var key_1, layerId, oldGroupId, newGroupId, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!(info.dragNode && !info.dragNode.group)) return [3 /*break*/, 4];
                    key_1 = info.dragNode.key;
                    layerId = info.dragNode._id;
                    oldGroupId = info.dragNode.groupId;
                    newGroupId = info.node.groupId;
                    if (!!newGroupId) return [3 /*break*/, 2];
                    if (info.node.pos === "0-0")
                        return [2 /*return*/];
                    // the node under which it was dragged is not a layer group, so it must have been dragged under "Vector" or "Raster"
                    // this means it was actually ungrouped
                    return [4 /*yield*/, removeLayerFromGroup(oldGroupId, layerId)];
                case 1:
                    // the node under which it was dragged is not a layer group, so it must have been dragged under "Vector" or "Raster"
                    // this means it was actually ungrouped
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: 
                // layer was moved under a new group
                //console.log(layerid, newGroupId);
                return [4 /*yield*/, changeGroupOfLayer(newGroupId, [layerId], [key_1])];
                case 3:
                    // layer was moved under a new group
                    //console.log(layerid, newGroupId);
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_3 = _a.sent();
                    console.log(error_3);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var _128 = react_1.useState(false), showDrawingTools = _128[0], setShowDrawingTools = _128[1];
    var _129 = react_1.useState([0, 0]), toolCoordinates = _129[0], settoolCoordinates = _129[1];
    var drawingMenuRef = react_1.useRef();
    //---------------Handle map modes-------------------------------
    function handleMapMode(value) {
        if (value === "osm") {
            var currenViewPort = INITIAL_VIEW_STATE;
            setViewport({
                longitude: INITIAL_VIEW_STATE.longitude,
                latitude: INITIAL_VIEW_STATE.latitude,
                zoom: INITIAL_VIEW_STATE.zoom,
                pitch: INITIAL_VIEW_STATE.pitch,
                minZoom: 0,
                maxZoom: 19
            });
            setOsmState(true);
        }
        else {
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
            setMapMode("mapbox://styles/mapbox/" + value + "-v8");
        }
    }
    function onChangeInherit(checked) {
        //console.log(`switch to ${checked}`);
        if (checked) {
            setInheritColor(true);
            setshowColorPicker(false);
        }
        else {
            setInheritColor(false);
            setshowColorPicker(true);
        }
    }
    var Cancel1 = function () {
        setLimitModal(false);
    };
    var Cancel2 = function () {
        setExpiryModal(false);
    };
    // **** Group Layer Options ****
    var _130 = react_1.useState("vector"), groupType = _130[0], setgroupType = _130[1];
    var _131 = react_1.useState(false), visibleGroupCreateModal = _131[0], setVisibleGroupCreateModal = _131[1];
    var _132 = react_1.useState(false), moveToOtherGroupModal = _132[0], setMoveToOtherGroupModal = _132[1];
    var _133 = react_1.useState(1), moveType = _133[0], setMoveType = _133[1];
    var groupForm = antd_1.Form.useForm()[0];
    var toGroupForm = antd_1.Form.useForm()[0];
    var editForm = antd_1.Form.useForm()[0];
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
    var createLayerGroup = function (data) {
        setLoading(true);
        var layersToGroup = AllLayers.filter(function (layer) {
            return layer._isChecked && layer.type === ["", "Vector", "Raster"][moveType];
        }).map(function (layer) { return layer._id; });
        httpCall_1["default"]
            .post("" + apis_1["default"].CREATE_GROUP_LAYER, {
            name: data.name,
            layers: layersToGroup
        })
            .then(function (result) {
            if (result.data.status) {
                antd_1.message.success("Group Created");
                var layerGroup_1 = {
                    _id: result.data.data[0]._id,
                    name: result.data.data[0].name,
                    layers: result.data.data[0].layers.map(function (layer) { return layer._id; }),
                    createdBy: result.data.data[0].createdBy,
                    tenantId: result.data.data[0].tenantId,
                    createdAt: result.data.data[0].createdAt,
                    updatedAt: result.data.data[0].updatedAt
                };
                SetAllLayers(function (prev) {
                    return prev.map(function (layer) {
                        if (layerGroup_1.layers.includes(layer._id)) {
                            layer.layerGroupId = layerGroup_1;
                        }
                        return layer;
                    });
                });
                // setAllLayerGroups(prev => ({
                //   ...prev,
                //   [layerGroup._id]: {
                //     id: layerGroup._id,
                //     name: layerGroup.name,
                //     groupType: moveType
                //   }
                // }));
            }
            else {
                antd_1.message.error(result.data.message);
            }
        })["catch"](function (err) {
            console.log(err);
            antd_1.message.error(err.message);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        })["finally"](function () {
            setVisibleGroupCreateModal(false);
            resetGroupFormFields();
            setLoading(false);
        });
    };
    var moveLayers = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var layersToMove;
        return __generator(this, function (_a) {
            setLoading(true);
            layersToMove = AllLayers.filter(function (layer) {
                return layer._isChecked && layer.type === ["", "Vector", "Raster"][moveType];
            }).map(function (layer) { return layer._id; });
            httpCall_1["default"]
                .patch("" + apis_1["default"].EDIT_LAYER_GROUP, {
                _id: data.group,
                layers: layersToMove
            })
                .then(function (result) {
                if (result.data.status) {
                    antd_1.message.success("Layers Moved");
                    var updatedLayerGroup_3 = {
                        _id: result.data.data._id,
                        name: result.data.data.name,
                        layers: result.data.data.layers,
                        createdBy: result.data.data.createdBy,
                        tenantId: result.data.data.tenantId,
                        createdAt: result.data.data.createdAt,
                        updatedAt: result.data.data.updatedAt
                    };
                    SetAllLayers(function (prev) {
                        return prev.map(function (layer) {
                            if (updatedLayerGroup_3.layers.includes(layer._id)) {
                                layer.layerGroupId = updatedLayerGroup_3;
                            }
                            return layer;
                        });
                    });
                }
                else {
                    antd_1.message.error(result.data.message);
                }
            })["catch"](function (err) {
                console.log(err);
                antd_1.message.error(err.message);
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            })["finally"](function () {
                setMoveToOtherGroupModal(false);
                toGroupForm.resetFields();
                setLoading(false);
            });
            return [2 /*return*/];
        });
    }); };
    var creteNewGroupCard = function () {
        return (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(antd_1.Form, { name: "basic", onFinish: createLayerGroup, initialValues: { remember: true }, autoComplete: "off", form: groupForm },
                react_1["default"].createElement(antd_1.Form.Item, { label: "Group Name", name: "name", rules: [{ required: true, message: "Please input groupname" }] },
                    react_1["default"].createElement(antd_1.Input, { style: { width: "350px" }, placeholder: "Enter Group Name" })),
                react_1["default"].createElement(antd_1.Form.Item, { wrapperCol: { offset: 5, span: 16 } },
                    react_1["default"].createElement(antd_1.Button, { type: "primary", htmlType: "submit" }, "Submit")))));
    };
    var moveToGroupForm = function () {
        var groups = [];
        AllLayers.forEach(function (layer) {
            if (layer.layerGroupId &&
                !groups.find(function (group) { return group.id === layer.layerGroupId._id; })) {
                groups.push({
                    id: layer.layerGroupId._id,
                    name: layer.layerGroupId.name
                });
            }
        });
        return (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(antd_1.Form, { name: "basic", onFinish: moveLayers, initialValues: { remember: true }, autoComplete: "off", form: toGroupForm },
                react_1["default"].createElement(antd_1.Form.Item, { label: "Select Group", name: "group", hasFeedback: true, rules: [{ required: true, message: "Please select grouptype" }] },
                    react_1["default"].createElement(antd_1.Select, { style: { width: "350px", marginLeft: "8px" }, placeholder: "Select Group To Move Layers", onChange: function (type) {
                            setgroupType(type);
                        } }, groups.map(function (group, idx) {
                        return (react_1["default"].createElement(Option, { value: group.id, key: idx }, group.name));
                    }))),
                react_1["default"].createElement(antd_1.Form.Item, { wrapperCol: { offset: 6, span: 16 } },
                    react_1["default"].createElement(antd_1.Button, { type: "primary", htmlType: "submit" }, "Submit")))));
    };
    var _134 = react_1.useState({ x: 0, y: 0 }), cursorPosition = _134[0], setCursorPosition = _134[1];
    var handleShowMaskLayer = function () {
        setisMaskLayerVisible(false);
        setLayerOpacity(1);
    };
    var resetGroupFormFields = function () {
        groupForm.resetFields();
    };
    var handleKeyDown = function (e) {
        if (e.keyCode === 27) {
            cancelDrawing();
        }
    };
    var handleMouseMove = function (e) {
        setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    if (props.isBaseMap && !["tenant-root", "tenant-staff"].includes(Auth.userdetails.userType)) {
        return react_1["default"].createElement(FourOhOne_1["default"], null);
    }
    return (react_1["default"].createElement("div", { className: "map_wrapper", onKeyDown: handleKeyDown, onMouseMove: handleMouseMove },
        react_1["default"].createElement(Thread_1["default"], { thumbnail: thumbnail, setThumbnail: setThumbnail, data: threadDetails }),
        react_1["default"].createElement(antd_1.Modal, { title: "Maximum Limit reached!", open: LimitModal, onOk: Cancel1, onCancel: Cancel1 },
            react_1["default"].createElement(antd_1.Result, { status: "500", title: "Oops! You have reached your limit of creating layers!", subTitle: "Please contact your admin." })),
        react_1["default"].createElement(antd_1.Modal, { title: "Tenant Expired!", open: ExpiryModal, onOk: Cancel2, onCancel: Cancel2 },
            react_1["default"].createElement(antd_1.Result, { status: "403", title: "Oops! Your tenant has expired!", subTitle: "Please contact admin@kesowa.com to renew our services!" })),
        layerLoading && (react_1["default"].createElement("div", { className: "overlay" },
            react_1["default"].createElement(antd_1.Spin, { size: "large", tip: "Loading...", style: { color: "#ffffff" } }))),
        react_1["default"].createElement(react_2["default"], { initialViewState: INITIAL_VIEW_STATE, ref: deckRef, 
            // onHover={(info) => {
            //   const coords = getPolygon(info.x, info.y, 150);
            //   const mapCoords = coords.map((coord) =>DeckGL
            //     info.viewport?.unproject(coord)
            //   );
            //   setPolygon(mapCoords);
            // }}
            onHover: function (info) {
                if (isMaskLayerVisible) {
                    var coords = exports.getPolygon(info.x, info.y, polygonSize);
                    var mapCoords = coords.map(function (coord) { var _a; return (_a = info.viewport) === null || _a === void 0 ? void 0 : _a.unproject(coord); });
                    setPolygon(mapCoords);
                }
                else if (drawAngle) {
                    handleMouseMove1(info);
                }
            }, controller: true, layers: (function () {
                var layers = [];
                // OSMState Layers
                if (osmState)
                    layers.push(osm);
                // Drawing State Layers
                if (isDrawing) {
                    layers.push(drawPolygonTool);
                }
                else {
                    layers.push(maskLayer);
                }
                // if (volumeCalculation && co){
                //   layers.push(polygonLayer);
                // }
                if (angleLayers) {
                    layers.push(angleLayers);
                }
                // Tree Menu Layers
                layers.push(react_1.useMemo(function () { return layerRender_1.ILayerToDeckLayer(AllLayers); }, [AllLayers]));
                layers.push(react_1.useMemo(function () { return layerRender_1.MissionLayerToDeckLayer(MissionLayers); }, [MissionLayers]));
                if (digitizer)
                    layers.push(digitizerLayer);
                return layers;
            })(), style: { height: "100vh", width: "100%" }, 
            // onHover={(info) => {
            //   const coords = getPolygon(info.x, info.y, 150);
            //   const mapCoords = coords.map((coord) =>
            //     info.viewport?.unproject(coord)
            //   );
            //   setPolygon(mapCoords);
            // }}
            getCursor: function () {
                return isDrawing ? "crosshair" : "pointer";
            }, getTooltip: function (_a) {
                var _b, _c;
                var object = _a.object;
                return (object && ((_b = object === null || object === void 0 ? void 0 : object.properties) === null || _b === void 0 ? void 0 : _b[selectedLayerPopupLabel]) && {
                    html: "<div style=\"font-size: 1rem; color: #000\">" + layerName + "</div><hr style=\"color: " + object.properties.color + "\"/>" + selectedLayerPopupLabel + " : " + ((_c = object === null || object === void 0 ? void 0 : object.properties) === null || _c === void 0 ? void 0 : _c[selectedLayerPopupLabel]),
                    style: {
                        backgroundColor: "#fff",
                        margin: "0px",
                        borderRadius: "5px"
                    }
                });
            }, onDrag: function () { }, onClick: function (info, event) {
                setShowDrawingTools(false);
                if (event.rightButton) {
                    var layerIndex = AllLayers.findIndex(function (layer) { var _a; return ((_a = info.layer) === null || _a === void 0 ? void 0 : _a.id) === layer._id; });
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
                }
                else if (info.layer) {
                    var layer = AllLayers.find(function (layer) { var _a; return layer.type === 'Vector' && ((_a = info.layer) === null || _a === void 0 ? void 0 : _a.id) === layer._id; });
                    if (layer) {
                        InfoWindow(info.index, info.coordinate, layer.name, (vectorprops_1.featureType[layer.vector] === vectorprops_1.featureTypes.POINT) ? "PointView" : "PolygonView", info.object, false, layer._id, info.object.properties.sys_id, "Vector");
                        setSelectedLayerLabel(layer.layerLabel ? layer.layerLabel : "No label selected");
                        setSelectedLayerPopupLabel(layer.layerPopupLabel ? layer.layerPopupLabel : "No label selected");
                    }
                    else {
                        setShowDrawingTools(false);
                    }
                }
                else if (drawAngle) {
                    handleDrawAngle(info);
                }
            } },
            react_1["default"].createElement(elevationTooltip_2["default"], { hoverInfo: hoverInfo, isElevationEnabled: isElevationEnabled }),
            osmState ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { style: COPYRIGHT_LICENSE_STYLE },
                    "© ",
                    react_1["default"].createElement("a", { style: LINK_STYLE, href: "http://www.openstreetmap.org/copyright", target: "blank" }, "OpenStreetMap contributors")))) : (react_1["default"].createElement(react_map_gl_1.StaticMap, { mapboxApiAccessToken: constants_1.MAPBOX_API_KEY, mapStyle: mapMode, ref: mapRef })),
            showPopup && (react_1["default"].createElement(HTMLOverlay_1.HTMLOverlay, null,
                react_1["default"].createElement(HTMLOverlay_1.HTMLOverlayItem, { coordinates: coordinates },
                    react_1["default"].createElement(antd_1.Popover, { content: react_1["default"].createElement(infoWindow_1["default"], { mode: infoWindowMode, coordinates: coordinates, token: constants_1.MAPBOX_API_KEY, feature: featureData, sysId: sysId, featureIdx: featureIdx, setformDrawerVisible: setformDrawerVisible, drawerVisibility: viewMedia, setImagesDrawer: setViewMedia, videoToShow: videoToShow, setVideoToShow: setVideoToShow, show: saveButtonShow, setShowForm: setShowForm, cancelDrawing: cancelDrawing, togglePopup: togglePopup, layerId: featureLayer, missionLayer: missionLayer, setMissionLayer: setMissionLayer, AllLayers: AllLayers, SetAllLayers: SetAllLayers, setShouldAttributeTableReload: setShouldAttributeTableReload, shouldAttributeTableReload: shouldAttributeTableReload, canDraw: perms.canCreateLayer, isBaseMap: props.isBaseMaps, isPublic: false, setThumbnail: setThumbnail }), title: react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(Title, { level: 5, style: { float: "left" } }, layerName),
                            react_1["default"].createElement("a", { style: {
                                    float: "right"
                                }, onClick: function () { return handleClose(false); } }, "X")), trigger: "click", open: showPopup, style: { position: "relative" }, onOpenChange: function () { return handleClose(false); } }))))),
        react_1["default"].createElement("div", { className: "drawing-tools", style: {
                top: toolCoordinates[1] + "px",
                left: toolCoordinates[0] + "px"
            } },
            react_1["default"].createElement(antd_1.Dropdown, { menu: { items: toolMenu(), onClick: toolMenuOnClick }, 
                // ref={drawingMenuRef}
                placement: "bottom", trigger: ["click"] },
                react_1["default"].createElement(antd_1.Button, { style: { visibility: "hidden" }, ref: drawingMenuRef }))),
        react_1["default"].createElement("div", { className: "map-header-toolbar" },
            react_1["default"].createElement(antd_1.Row, null,
                react_1["default"].createElement(antd_1.Col, { md: 12 },
                    react_1["default"].createElement("div", { className: "map-selector" },
                        react_1["default"].createElement(antd_1.Select, { defaultValue: "streets", style: { width: 120 }, onChange: handleMapMode },
                            react_1["default"].createElement(Option, { value: "streets" }, "Street Maps"),
                            react_1["default"].createElement(Option, { value: "osm" }, "Open Street Maps"),
                            react_1["default"].createElement(Option, { value: "satellite" }, "Satellite"),
                            react_1["default"].createElement(Option, { value: "light" }, "Light mode"),
                            react_1["default"].createElement(Option, { value: "dark" }, "Dark mode")))),
                react_1["default"].createElement(antd_1.Col, { md: 12 },
                    react_1["default"].createElement("div", { className: "toolbar" },
                        showFlightPath && (react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Remove Flight Path" },
                            react_1["default"].createElement(antd_1.Button, { className: "remove-flight-tool", type: "primary", icon: react_1["default"].createElement(icons_1.NodeIndexOutlined, null), size: "large", danger: true, onClick: removeFlightPath }))),
                        screenPosition && angle && (react_1["default"].createElement("div", { style: {
                                position: "absolute",
                                left: screenPosition.x - 860,
                                top: screenPosition.y - 40,
                                background: "rgba(0, 0, 0, 0.85)",
                                color: "white",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                fontSize: "14px",
                                fontWeight: "bold",
                                pointerEvents: "none",
                                whiteSpace: "nowrap",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)"
                            } },
                            "Angle: ",
                            angle,
                            "\u00B0")),
                        isMaskLayerVisible && (react_1["default"].createElement("div", { style: {
                                position: "fixed",
                                left: cursorPosition.x - polygonSize / 2,
                                top: cursorPosition.y - polygonSize / 2,
                                width: polygonSize + "px",
                                height: polygonSize + "px",
                                border: "2.6px solid rgba(0, 255, 255, 0.5)",
                                borderRadius: "4px",
                                pointerEvents: "none",
                                zIndex: 9999
                            } })),
                        isMaskLayerVisible && (react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Polygon Size" },
                            react_1["default"].createElement("div", { style: {
                                    background: "white",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    marginRight: "20px",
                                    marginBottom: "10px"
                                } },
                                react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Polygon Size" },
                                    react_1["default"].createElement(antd_1.Slider, { min: 150, max: 350, onChange: changePolygonSize, step: 0.1, defaultValue: 1, value: polygonSize, tooltip: { placement: "right" }, style: {
                                            width: "100px",
                                            margin: "5px 0",
                                            padding: "1px 1px"
                                        } }))))),
                        isMaskLayerVisible && (
                        // HERE: Polygon Opacity Slider
                        react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Opacity" },
                            react_1["default"].createElement("div", { style: {
                                    background: "white",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    marginRight: "20px",
                                    marginBottom: "10px"
                                } },
                                react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Opacity" },
                                    react_1["default"].createElement(antd_1.Slider, { min: 0.1, max: 1, onChange: changeOpacity, step: 0.1, defaultValue: 1, value: layerOpacity, tooltip: { placement: "right" }, style: {
                                            width: "100px",
                                            margin: "5px 0",
                                            padding: "1px 1px"
                                        } }))))),
                        react_1["default"].createElement(antd_1.Tooltip, { title: "digitize image to map", placement: "bottom" },
                            react_1["default"].createElement("div", { className: "time-filter-tool", onClick: function () { return setDigitizer(function (digitizer) { return !digitizer; }); } },
                                react_1["default"].createElement(Text, { strong: true }, "Digitizer"))),
                        react_1["default"].createElement(antd_1.Tooltip, { title: "Time", placement: "bottom" },
                            react_1["default"].createElement("div", { className: "time-filter-tool", style: { width: "max-content" } },
                                react_1["default"].createElement("div", { style: {
                                        //backgroundColor: "gold",
                                        marginTop: "-4px"
                                    } },
                                    react_1["default"].createElement("span", { onClick: function () {
                                            setTimeFilter(!timeFilter);
                                        } }, timeFilter ? (react_1["default"].createElement(icons_1.RightOutlined, { style: { fontSize: "10px" } })) : (react_1["default"].createElement(icons_1.LeftOutlined, { style: { fontSize: "10px" } }))),
                                    " ",
                                    react_1["default"].createElement(antd_1.Checkbox, { style: {
                                            marginTop: "2px",
                                            marginRight: "6px",
                                            marginLeft: "6px"
                                        }, onChange: function (e) {
                                            return setFilterState(function (prev) {
                                                prev.time = e.target.checked ? "100 days" : null;
                                                return __assign({}, prev);
                                            });
                                        } }),
                                    " ",
                                    react_1["default"].createElement(Text, { strong: true }, "Time Filter"),
                                    react_1["default"].createElement("div", { style: {
                                            display: timeFilter ? "inline" : "none",
                                            transition: "0.2s"
                                        } },
                                        !!filterState.time && (react_1["default"].createElement("span", { style: { margin: "0 5px" } },
                                            dateFormat(),
                                            " - ",
                                            moment_1["default"]().format("DD MMM"),
                                            " ")),
                                        react_1["default"].createElement(antd_1.Select, { defaultValue: "100 days", size: "small", onChange: function (value) {
                                                setFilterState(function (prev) {
                                                    prev.time = value;
                                                    return __assign({}, prev);
                                                });
                                            }, disabled: !filterState.time },
                                            react_1["default"].createElement(Option, { value: "7 days" }, "Last 1 Week"),
                                            react_1["default"].createElement(Option, { value: "30 days" }, "Last 1 Month"),
                                            react_1["default"].createElement(Option, { value: "100 days" }, "Last 100 Days")))))),
                        isDrawing && (react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Clear Selection" },
                            react_1["default"].createElement("div", { className: "cancel-tool", onClick: function () { return cancelDrawing(); } },
                                react_1["default"].createElement("span", { className: "cancel-icon" }, "Cancel")))),
                        react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: isMaskLayerVisible ? "Disable Masking" : "Enable Masking" },
                            react_1["default"].createElement("div", { className: "time-filter-tool", onClick: function () {
                                    setisMaskLayerVisible(function (prev) { return !prev; });
                                } },
                                react_1["default"].createElement(Text, { strong: true }, isMaskLayerVisible ? "Disable Masking" : "Enable Masking"))),
                        isElevationEnabled && (react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Disable Elevation" },
                            react_1["default"].createElement("div", { className: "cancel-tool", onClick: function () { return toggleElevation(); } },
                                react_1["default"].createElement("span", { className: "cancel-icon" }, "Disable")))),
                        react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Volume tool" },
                            react_1["default"].createElement("div", { className: "polygon-tool", style: {
                                    background: toolSelected === "Volume" ? "#35BDD0" : "#ffffff"
                                }, onClick: function () {
                                    startDrawing("DrawPolygon", "Volume");
                                    setVolumeCalculation(true);
                                } },
                                react_1["default"].createElement("div", { className: "polygon-icon" },
                                    react_1["default"].createElement("img", { src: volume_svg_1["default"], alt: "" })))),
                        react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Angle tool" },
                            react_1["default"].createElement("div", { className: "line-tool", style: {
                                    background: toolSelected === "Angle" ? "#35BDD0" : "#ffffff"
                                }, onClick: function () {
                                    setDrawAngle(function (prev) { return !prev; });
                                    setToolSelected(function (prev) {
                                        return prev === "Angle" ? null : "Angle";
                                    });
                                    setIsDrawing(true);
                                } },
                                react_1["default"].createElement("div", { className: "line-icon" },
                                    react_1["default"].createElement("img", { src: angle_svg_1["default"], alt: "" })))),
                        react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Line tool" },
                            react_1["default"].createElement("div", { className: "line-tool", style: {
                                    background: toolSelected === "Line" ? "#35BDD0" : "#ffffff"
                                }, onClick: function () { return startDrawing("DrawLine", "Line"); } },
                                react_1["default"].createElement("div", { className: "line-icon" },
                                    react_1["default"].createElement("img", { src: line_svg_1["default"], alt: "" })))),
                        react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Polygon tool" },
                            react_1["default"].createElement("div", { className: "polygon-tool", style: {
                                    background: toolSelected === "Polygon" ? "#35BDD0" : "#ffffff"
                                }, onClick: function () { return startDrawing("DrawPolygon", "Polygon"); } },
                                react_1["default"].createElement("div", { className: "polygon-icon" },
                                    react_1["default"].createElement("img", { src: polygon_svg_1["default"], alt: "" })))),
                        react_1["default"].createElement(antd_1.Tooltip, { placement: "bottomRight", title: "Marker tool" },
                            react_1["default"].createElement("div", { className: "marker-tool", style: {
                                    background: toolSelected === "Marker" ? "#35BDD0" : "#ffffff"
                                }, onClick: function () { return startDrawing("DrawPoint", "Marker"); } },
                                react_1["default"].createElement(icons_1.EnvironmentOutlined, { className: "marker-icon" }))))))),
        react_1["default"].createElement("div", { className: "collapser-button", onClick: function () { return sideBarHandeller(); }, style: {
                right: sideBarState === false ? "10px" : "354px",
                zIndex: 9999
            } },
            react_1["default"].createElement("span", { className: "icon" }, sideBarIcon)),
        sideBarState && (react_1["default"].createElement("div", { className: "map-sidebar" },
            react_1["default"].createElement("div", { className: "header-content" },
                react_1["default"].createElement(antd_1.Row, { style: { justifyContent: "space-between" } },
                    react_1["default"].createElement(Title, { level: 4 },
                        props.isBaseMap == false ? (react_1["default"].createElement(icons_1.ArrowLeftOutlined, { onClick: function () { return history.goBack(); }, style: { fontSize: "20px" } })) : (react_1["default"].createElement(react_1["default"].Fragment, null)),
                        " ",
                        react_1["default"].createElement(Text, { style: { width: 225 }, ellipsis: { tooltip: missioName } }, missioName === "none" ? "Map" : missioName)),
                    AllLayers.length !== 0 && (react_1["default"].createElement(Text, { type: "secondary" },
                        "Results: ",
                        AllLayers.length))),
                react_1["default"].createElement("div", { style: {
                        display: "inline-block",
                        width: "100%",
                        marginTop: "10px"
                    } },
                    props.isBaseMap ? (react_1["default"].createElement(react_1["default"].Fragment, null, perms.canCreateBaseLayer ? (react_1["default"].createElement(antd_1.Button, { icon: react_1["default"].createElement(icons_1.PlusOutlined, null), onClick: function () {
                            setUpdate(false);
                            setIsModalVisible4(true);
                        }, style: { float: "left" } }, "Create Layer")) : (react_1["default"].createElement(react_1["default"].Fragment, null)))) : (react_1["default"].createElement(react_1["default"].Fragment, null, perms.canCreateLayer ? (react_1["default"].createElement(antd_1.Button, { icon: react_1["default"].createElement(icons_1.UploadOutlined, null), onClick: function () {
                            setIsModalVisible2(true);
                        }, style: { float: "left" } }, "Upload")) : (react_1["default"].createElement(react_1["default"].Fragment, null)))),
                    sortType && (react_1["default"].createElement("div", { style: { float: "right" } },
                        react_1["default"].createElement(icons_1.SortAscendingOutlined, { onClick: function () { return changeSortArrange(true); }, style: {
                                color: isAscending ? "#1890ff" : "#000",
                                fontSize: "1.2rem",
                                marginTop: "0.5rem",
                                marginBottom: "0.5rem"
                            } }),
                        react_1["default"].createElement(icons_1.SortDescendingOutlined, { onClick: function () { return changeSortArrange(false); }, style: {
                                color: !isAscending ? "#1890ff" : "#000",
                                fontSize: "1.2rem",
                                marginTop: "0.5rem",
                                marginBottom: "0.5rem"
                            } }))),
                    react_1["default"].createElement(antd_1.Dropdown, { menu: { items: sortMenu, onClick: sortMenuOnClick }, trigger: ["click"] },
                        react_1["default"].createElement(antd_1.Button, { style: { float: "right" }, type: "link" }, "Sort")),
                    react_1["default"].createElement(antd_1.Dropdown, { menu: { items: filterMenu }, 
                        //overlay={filterMenu}
                        disabled: chipsLoading },
                        react_1["default"].createElement(antd_1.Button, { style: { float: "right" }, type: "link" },
                            "Filter ",
                            react_1["default"].createElement(icons_1.DownOutlined, null)))),
                react_1["default"].createElement("div", { style: {
                        display: "flex",
                        flexFlow: "row",
                        marginTop: "5px",
                        marginBottom: "5px",
                        overflow: "auto"
                    } },
                    react_1["default"].createElement(antd_1.Tag, { style: { display: filterState.time ? "inline" : "none" }, 
                        // color='#108ee9'
                        icon: chipsLoading ? react_1["default"].createElement(icons_1.SyncOutlined, { spin: true }) : react_1["default"].createElement(icons_1.CheckCircleOutlined, null), color: "blue", closable: true, onClose: function () {
                            return setFilterState(function (prev) {
                                prev.time = null;
                                return __assign({}, prev);
                            });
                        } },
                        "Last ",
                        filterState.time),
                    Array.from(filterState.rasterProps).map(function (tag) {
                        return (react_1["default"].createElement(antd_1.Tag, { icon: chipsLoading ? (react_1["default"].createElement(icons_1.SyncOutlined, { spin: true })) : (react_1["default"].createElement(icons_1.CheckCircleOutlined, null)), color: "blue", closable: true, onClose: function () {
                                return setFilterState(function (prev) {
                                    prev.rasterProps["delete"](tag);
                                    return __assign({}, prev);
                                });
                            } }, tag));
                    }),
                    Array.from(filterState.vectorPropsType).map(function (tag) {
                        return (react_1["default"].createElement(antd_1.Tag, { icon: chipsLoading ? (react_1["default"].createElement(icons_1.SyncOutlined, { spin: true })) : (react_1["default"].createElement(icons_1.CheckCircleOutlined, null)), color: "blue", closable: true, onClose: function () {
                                return setFilterState(function (prev) {
                                    prev.vectorPropsType["delete"](tag);
                                    return __assign({}, prev);
                                });
                            } }, tag));
                    }),
                    Array.from(filterState.vectorProps).map(function (tag) {
                        return (react_1["default"].createElement(antd_1.Tag, { style: { display: "inline" }, icon: chipsLoading ? (react_1["default"].createElement(icons_1.SyncOutlined, { spin: true })) : (react_1["default"].createElement(icons_1.CheckCircleOutlined, null)), color: "blue", closable: true, onClose: function () {
                                return setFilterState(function (prev) {
                                    prev.vectorProps["delete"](tag);
                                    return __assign({}, prev);
                                });
                            } }, tag));
                    })),
                react_1["default"].createElement(antd_1.Modal, { title: "Upload Layer", open: isModalVisible2, onCancel: handleCancel2, footer: null },
                    react_1["default"].createElement(antd_1.Row, { align: "middle", justify: "center" },
                        react_1["default"].createElement(antd_1.Col, null,
                            react_1["default"].createElement(antd_1.Card, { key: "1", onClick: function () { return setSelectedKey(1); }, className: "create-mission-extended-card " + (selectedKey == 1
                                    ? "create-mission-extended-card-selected"
                                    : ""), 
                                // loading={isLoading}
                                hoverable: true },
                                react_1["default"].createElement(Meta, { avatar: react_1["default"].createElement(antd_1.Avatar, { size: 50, icon: react_1["default"].createElement(icons_1.FileAddOutlined, null), style: {
                                            backgroundColor: "transparent",
                                            color: "black"
                                        } }), title: "Upload File", description: "Create a new layer by uploading a vector file (.geojson, .shp, .kml) or raster file (.tif, .laz)" })),
                            react_1["default"].createElement(antd_1.Card, { key: "2", onClick: function () { return setSelectedKey(2); }, className: "create-mission-extended-card " + (selectedKey == 2
                                    ? "create-mission-extended-card-selected"
                                    : ""), 
                                // loading={isLoading}
                                hoverable: true },
                                react_1["default"].createElement(Meta, { avatar: react_1["default"].createElement(antd_1.Avatar, { size: 50, icon: react_1["default"].createElement(icons_1.FileImageOutlined, null), style: {
                                            backgroundColor: "transparent",
                                            color: "black"
                                        } }), title: "Upload Images", description: "Create a vector layer from geolocated images." })),
                            react_1["default"].createElement(antd_1.Button, { className: "create-mission-proceed-button", type: "primary", 
                                // onClick={() => nextStage()}
                                onClick: function () {
                                    handleCancel2();
                                    if (selectedKey == 1)
                                        showModal();
                                    else if (selectedKey == 2)
                                        setIsModalVisible3(true);
                                }, disabled: !selectedKey }, "Next")))),
                react_1["default"].createElement(antd_1.Modal, { title: "Upload Layer", open: isModalVisible, onCancel: handleCancel, footer: null, width: 700 },
                    react_1["default"].createElement(antd_1.Form, { name: "upload2", onFinish: onFinish, layout: "vertical", form: form },
                        react_1["default"].createElement(antd_1.Row, { style: { paddingLeft: "10px", paddingRight: "5px" } },
                            react_1["default"].createElement(antd_1.Alert, { style: { width: "100%" }, message: "Please note!", description: "Make sure that your geojson file has the \"color\" attribute in each feature, in order to inherit colors", type: "info", banner: true, showIcon: true })),
                        react_1["default"].createElement(antd_1.Row, null,
                            react_1["default"].createElement(antd_1.Col, { span: 14, style: { padding: "10px" } },
                                react_1["default"].createElement(antd_1.Form.Item, { label: "Name", name: "name" },
                                    react_1["default"].createElement(antd_1.Input, { placeholder: "Layer's Name", onChange: function (e) {
                                            setLayerName(e.target.value);
                                        } })),
                                react_1["default"].createElement(antd_1.Form.Item, { label: "Layer Type", name: "type" },
                                    react_1["default"].createElement(antd_1.TreeSelect, { showSearch: true, style: { width: "100%" }, dropdownStyle: { maxHeight: 400, overflow: "auto" }, placeholder: "Select Layer Type", allowClear: true, treeData: propUtils_1.options, onChange: changeLayerType })),
                                react_1["default"].createElement(antd_1.Row, null,
                                    react_1["default"].createElement(antd_1.Form.Item, { label: "Capture Date", name: "date" },
                                        react_1["default"].createElement(antd_1.DatePicker, { format: "YYYY/MM/DD HH:mm", onChange: function (value) {
                                                setCaptureDate(value.toISOString(true));
                                            } }))),
                                react_1["default"].createElement(antd_1.Row, null,
                                    react_1["default"].createElement(antd_1.Form.Item, { label: "Icon", name: "icon" },
                                        react_1["default"].createElement(antd_1.TreeSelect, { showSearch: true, style: { width: "150%" }, dropdownStyle: { maxHeight: 400, overflow: "auto" }, placeholder: "Select Icon", placement: "bottomLeft", defaultValue: "MarkerIcon", treeData: iconOptions, onChange: function (value) { return setIcon2(value); }, treeIcon: true }))),
                                react_1["default"].createElement(antd_1.Row, null,
                                    react_1["default"].createElement(antd_1.Alert, { style: { width: "100%" }, message: "Only .geojson and .kml files support for type \"Vector\" and .tif or .laz for type \"Raster\"", type: "info", showIcon: true }),
                                    react_1["default"].createElement(antd_1.Form.Item, { label: "Upload File", name: "file" },
                                        react_1["default"].createElement(antd_1.Upload, __assign({}, uploadProps),
                                            react_1["default"].createElement(antd_1.Button, { icon: react_1["default"].createElement(icons_1.UploadOutlined, null) }, "Select File")),
                                        uploading ? (react_1["default"].createElement(antd_1.Progress, { strokeLinecap: "square", percent: Math.floor(progress) })) : null))),
                            react_1["default"].createElement(antd_1.Col, { span: 10, style: { padding: "5px" } },
                                showColorPicker && (react_1["default"].createElement(antd_1.Row, null,
                                    react_1["default"].createElement(react_color_1.SketchPicker, { color: layerColor, onChangeComplete: function (color) { return setLayerColor(color.hex); } }))),
                                react_1["default"].createElement(antd_1.Row, { style: { paddingLeft: "2rem" } },
                                    react_1["default"].createElement("p", null,
                                        "Inherit color\u00A0\u00A0\u00A0",
                                        react_1["default"].createElement(antd_1.Switch, { onChange: onChangeInherit })))))),
                    react_1["default"].createElement(antd_1.Row, null,
                        react_1["default"].createElement(antd_1.Col, { span: 24, className: "modal-footer" },
                            react_1["default"].createElement(antd_1.Button, { style: { marginRight: "10px" }, onClick: function () { return handleCancel(); } }, "Cancel"),
                            !uploading ? (react_1["default"].createElement(antd_1.Button, { type: "primary", onClick: function () { return createLayer(); } }, "Save")) : (react_1["default"].createElement(antd_1.Button, { type: "primary", loading: true }, "Loading"))))),
                react_1["default"].createElement(createLayer_1["default"], { isModalVisible: isModalVisible3, setVisbible: setIsModalVisible3, missionId: id, addLayer: addLayer, status: pic2Mapv2Status, setStatus: setPic2Mapv2Status, data: pic2Mapv2Data, isBaseMap: props.isBaseMap }),
                react_1["default"].createElement(createBaseLayer_1["default"], { isModalVisible: isModalVisible4, 
                    // handleCancel={() => setIsModalVisible4(false)}
                    isUpdate: isUpdate, updateType: updateType, BaseLayerId: updateId, setShow: setIsModalVisible4, addLayer: addLayer, updateLayer: updateLayerDataAfterEditing, openPic2Mapv2: setIsModalVisible3 }),
                showEditModel && (react_1["default"].createElement(antd_1.Modal, { title: "Edit Layer", open: isModalVisible1, onOk: handleOk1, onCancel: handleCancel1, footer: null, okText: "Save", width: 600 }, layerName && captureDate && (react_1["default"].createElement(antd_1.Form, { name: "edit", form: form, onFinish: onFinish1, layout: "vertical" },
                    react_1["default"].createElement(antd_1.Row, null,
                        react_1["default"].createElement(antd_1.Col, { span: selectedLayerType == "vector" ? 12 : 24 },
                            react_1["default"].createElement(antd_1.Form.Item, { label: "Name", name: "name" },
                                react_1["default"].createElement(antd_1.Input, { placeholder: "Layer's Name", defaultValue: layerName, onChange: function (e) {
                                        setLayerName(e.target.value);
                                    } })),
                            react_1["default"].createElement(antd_1.Cascader, { style: { width: "100%" }, defaultValue: defaultLayerType
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
                                    : [], options: propUtils_1.getEditLayerTypeOptions(defaultLayerType), placeholder: "Select Layer Type", onChange: function (value) {
                                    // cascader returns a selection path from the top-most menu item to the bottom-most submenu item
                                    // in form of a string array
                                    // Here, we have "Vector" or "Raster" as the topmost menu, then for vector we have featureType submenu
                                    // and finally at the bottom-most level we have the vectorprops and rasterprops
                                    // So, value is a string array, of one of the following formats:
                                    // either [ "Vector", (geometry type), <vector prop name> ]
                                    // or [ "Raster", <raster prop name> ]
                                    var updatedTypeId = __spreadArrays(value).reverse()[0];
                                    setLayerProp(updatedTypeId);
                                } }),
                            react_1["default"].createElement(antd_1.Form.Item, { label: "Capture Date", name: "date" },
                                react_1["default"].createElement(antd_1.DatePicker, { defaultValue: moment_1["default"](captureDate, "YYYY-MM-DD"), onChange: function (value) {
                                        setCaptureDate(moment_1["default"](value).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"));
                                    } })),
                            react_1["default"].createElement(antd_1.Form.Item, { label: "Icon", name: "icon" },
                                react_1["default"].createElement(antd_1.TreeSelect, { showSearch: true, dropdownStyle: { maxHeight: 400, overflow: "auto" }, placeholder: "Select Icon", placement: "bottomLeft", defaultValue: icon2, treeData: iconOptions, onChange: function (value) { return setIcon2(value); }, treeIcon: true }))),
                        selectedLayerType == "vector" ? (react_1["default"].createElement(antd_1.Col, { span: selectedLayerType == "vector" ? 12 : 0 },
                            react_1["default"].createElement(react_color_1.SketchPicker, { color: layerColor, onChangeComplete: function (color) {
                                    return setLayerColor(color.hex);
                                } }))) : null),
                    react_1["default"].createElement(antd_1.Button, { type: "primary", onClick: editLayer }, "Save")))))),
            react_1["default"].createElement("div", { className: "body-content" },
                react_1["default"].createElement(antd_1.Tree, { virtual: false, 
                    //height={250}
                    showIcon: true, checkable: true, onExpand: onExpand, expandedKeys: expandedKeys, autoExpandParent: autoExpandParent, onCheck: onCheck, checkedKeys: (function () {
                        var checked = AllLayers.filter(function (layer) { return layer._isChecked; }).map(function (layer) { return layer._id; });
                        if (MissionLayers.isAlertChecked)
                            checked.push("alert");
                        if (MissionLayers.isVODChecked)
                            checked.push("vod");
                        return checked;
                    })(), onSelect: onSelect, selectedKeys: selectedKeys, treeData: treeRender_1.ILayersToTree(AllLayers, getTitleElement, getGroupTitleElement, renderRangePicker, sortType, isAscending), onDrop: onDrop, draggable: function (node) {
                        if (node.key === "1" ||
                            node.key === "2" ||
                            node.key === "3" ||
                            node.key === "3-1")
                            return false;
                        return true;
                    }, blockNode: true })))),
        react_1["default"].createElement(react_1.Suspense, { fallback: react_1["default"].createElement("div", { className: "example" },
                react_1["default"].createElement(antd_1.Space, { size: "middle" },
                    react_1["default"].createElement(antd_1.Spin, { size: "large" }))) }, digitizer && (react_1["default"].createElement(SvgToGeojson, { deckRef: deckRef, onValueChange: handleChildValueChange, fileUpload: handleFileUpload }))),
        react_1["default"].createElement("div", { className: "bottom-bar", style: {
                height: bottomBarHeight,
                display: panes.length ? "initial" : "none"
            } },
            react_1["default"].createElement(antd_1.Tabs, { style: { height: "100%" }, type: "editable-card", onChange: function (activeKey) {
                    setActiveKey(activeKey);
                }, activeKey: activeKey, onEdit: function (targetKey, action) {
                    if (action == "remove")
                        remove(targetKey);
                }, onTabClick: function () {
                    setSelectedIndexes([]);
                    setDefaultKeys([]);
                }, items: panes.length > 0 &&
                    panes.map(function (pane) {
                        return {
                            key: pane.key,
                            label: (react_1["default"].createElement("span", null, pane === null || pane === void 0 ? void 0 :
                                pane.title,
                                " ",
                                react_1["default"].createElement(antd_1.Badge, { size: "small", count: pane.count, overflowCount: overflowCount(pane.count), style: {
                                        backgroundColor: "#52c41a",
                                        marginLeft: "2px",
                                        display: pane.type == "vector" ? "inherit" : "none"
                                    } }))),
                            children: (react_1["default"].createElement(mapAttributes_1["default"], { type: pane.type, id: pane.id, path: pane.path, bottomBarHeight: bottomBarHeight, featureCount: pane.count, setViewport: setViewport, setColorMap: SetColorMap, setOverlayID: setOverlayID, setTerrainMap: setTerrainMap, setSelectedIndexes: setSelectedIndexes, setSelectedFeatures: setSelectedFeatures, setshowSelectedIndexes: setshowSelectedIndexes, selectedIndexes: selectedIndexes, setKey: setKey, defaultKeys: defaultKeys, setShouldAttributeTableReload: setShouldAttributeTableReload, shouldAttributeTableReload: shouldAttributeTableReload, canEditGeojson: perms.canEditGeojson, canDeleteFeature: perms.canDeleteFeature, updateFeatureCountInLayers: updateFeatureCountInLayers, flaggedFilter: flaggedFilter, unflaggedFilter: unflaggedFilter, AllLayers: AllLayers, refreshLayer: refreshLayer, setRefreshLayer: setRefreshLayer, invertColor: colorUtils_1.invertColor, handleMeshSourceOption: handleMeshSourceOption, refreshVectorLayers: refreshVectorLayer })),
                            closeable: true
                        };
                    }), 
                //onEdit={(targetKey) => remove(targetKey)}
                //onClick={() => console.log(activeKey)}
                hideAdd: true, tabBarExtraContent: react_1["default"].createElement("div", null,
                    react_1["default"].createElement(antd_1.Dropdown, { menu: {
                            items: actionMenuItems,
                            onClick: actionMenuOnClick
                        }, placement: "bottom" },
                        react_1["default"].createElement(antd_1.Button, { style: { display: activeType ? "inline" : "none" }, type: "link" },
                            "Actions ",
                            react_1["default"].createElement(icons_1.DownOutlined, null))),
                    react_1["default"].createElement(antd_1.Dropdown, { menu: {
                            items: filterItems,
                            selectable: true,
                            className: "filter-item",
                            onClick: filterOnClick
                        }, placement: "bottom" },
                        react_1["default"].createElement(antd_1.Button, { type: "text", className: flaggedFilter || unflaggedFilter
                                ? "filter-btn-selected"
                                : "", icon: react_1["default"].createElement(icons_1.FilterOutlined, null) })),
                    react_1["default"].createElement(antd_1.Button, { type: "text", onClick: function () {
                            var pr = window.devicePixelRatio;
                            var height = window.screen.height;
                            console.log(height);
                            if (height >= 1080) {
                                if (pr === 1.5) {
                                    setBottomBarHeight("900px");
                                }
                                else {
                                    setBottomBarHeight("900px"); ///-----------adjust height
                                }
                            }
                            else if (height >= 768) {
                                if (pr === 1.5) {
                                    setBottomBarHeight("700px");
                                }
                                else {
                                    setBottomBarHeight("700px"); ///-----------adjust height
                                }
                            }
                            else if (height >= 720) {
                                if (pr === 1.5) {
                                    setBottomBarHeight("540px"); ///-----------adjust height
                                }
                                else {
                                    setBottomBarHeight("700px"); ///-----------adjust height
                                }
                            }
                        }, icon: react_1["default"].createElement(icons_1.SwitcherOutlined, null) }),
                    react_1["default"].createElement(antd_1.Button, { type: "text", onClick: function () {
                            if (isMinimise) {
                                var pr = window.devicePixelRatio;
                                var height = window.screen.height;
                                if (height >= 1080) {
                                    if (pr === 1.5) {
                                        setBottomBarHeight("480px");
                                    }
                                    else {
                                        setBottomBarHeight("480px");
                                    }
                                }
                                else if (height >= 768) {
                                    if (pr === 1.5) {
                                        setBottomBarHeight("240px");
                                    }
                                    else {
                                        setBottomBarHeight("240px");
                                    }
                                }
                                else if (height >= 720) {
                                    if (pr === 1.5) {
                                        setBottomBarHeight("240px");
                                    }
                                    else {
                                        setBottomBarHeight("240px");
                                    }
                                }
                                setMinimise(false);
                            }
                            else {
                                setBottomBarHeight("70px");
                                setMinimise(true);
                            }
                        }, icon: bottomBarHeight === "70px" ? react_1["default"].createElement(icons_1.UpOutlined, null) : react_1["default"].createElement(icons_1.DownOutlined, null) })) })),
        showForm && (react_1["default"].createElement(VectorForm_1["default"], { visible: formDrawerVisible, setVisible: setformDrawerVisible, mode: drawMode ? drawMode : "PolygonView", vectorLayers: vectorLayers, features: featureState, missionId: id, loading: setLoading, isBaseMap: props.isBaseMap, setIsDrawing: setIsDrawing, forceUpdateLayers: forceUpdateLayers, setShowForm: setShowForm, addLayer: addLayer, updateLayerDataAfterEditing: updateLayerDataAfterEditing, setShouldAttributeTableReload: setShouldAttributeTableReload, shouldAttributeTableReload: shouldAttributeTableReload })),
        react_1["default"].createElement(Media_1["default"], { setVisibility: setViewMedia, visible: viewMedia, layerId: featureLayer, featureIndex: sysId, feature: featureData, videoToShow: videoToShow, coordinates: coordinates, canUpload: perms.canUploadFileToGeojson, canDelete: perms.canDeleteFileFromGeojson, canSetCoverPhoto: perms.canSetCoverPhoto, layerLabel: selectedLayerLabel, canUploadToBaseLayer: perms.canUploadToBaseLayer, isBaseMap: props.isBaseMap, dateRange: dateRange, videoDetails: videoDetails, showCarousel: showCarousel, setShowCarousel: setShowCarousel, updateVOD: updateVOD, updateVODs: updateVODs, setShowFlightPath: setShowFlightPath, setSrtVideoPath: setSrtVideoPath, setThumbnail: setThumbnail, setThreadDetails: setThreadDetails }),
        react_1["default"].createElement(layerDocs_1["default"], { setVisibility: setViewDocs, visible: viewDocs, layerId: featureLayer, title: windowTitle, set3Dstate: set3DState, layerData: selectedLayerInfo, canUpload: perms.canUploadFileToGeojson, canDelete: perms.canDeleteFileFromGeojson, isBaseMap: props.isBaseMap, canUploadToBaseLayer: perms.canUploadToBaseLayer, canUpdateBaseLayer: perms.canUpdateBaseLayer, canEditLayer: perms.canEditLayer, canUploadFileToGeojson: perms.canUploadFileToGeojson, setViewport: setViewport, layer: AllLayers.find(function (layer) { return layer._id === featureLayer; }), layerPath: featureLayerPath, layerLabel: selectedLayerLabel, updateLayerDataAfterEditing: updateLayerDataAfterEditing, renderLayerDocs: setIsLayerDocs, isRenderContent: isLayerDocs, setSelectedLayerLabel: setSelectedLayerLabel, layerPopupLabel: selectedLayerPopupLabel, setSelectedLayerPopupLabel: setSelectedLayerPopupLabel, missionId: id, picToMapData: picToMapData, setPicToMapData: setPicToMapData }),
        react_1["default"].createElement(antd_1.Modal, { title: "Change Color", open: showColorChangeForm, width: "300px", bodyStyle: { paddingLeft: 10 }, onOk: function () {
                editFeature(colorChangeFeatureData.object, color, colorChangeFeatureData.index);
            }, onCancel: function () { return setShowColorChangeForm(false); } },
            react_1["default"].createElement("div", { style: { width: "250px" } },
                react_1["default"].createElement(react_color_1.SketchPicker, { color: color, onChangeComplete: handleChangeComplete, onChange: handleChange }))),
        react_1["default"].createElement(antd_1.Modal, { title: "Group Layers", open: visibleGroupCreateModal, onCancel: function () {
                setVisibleGroupCreateModal(false);
            }, footer: null },
            react_1["default"].createElement("div", { style: { marginTop: "20px" } }, creteNewGroupCard())),
        react_1["default"].createElement(antd_1.Modal, { title: "Select Group", open: moveToOtherGroupModal, onCancel: function () {
                setMoveToOtherGroupModal(false);
            }, footer: null },
            react_1["default"].createElement("div", { style: { marginTop: "20px" } }, moveToGroupForm())),
        visibleEditModal && groupName && (react_1["default"].createElement(antd_1.Modal, { title: "Edit Group", open: visibleEditModal, onOk: function () { }, onCancel: function () {
                setVisibleEditModal(false);
            }, footer: null },
            react_1["default"].createElement(antd_1.Form, { name: "basic", autoComplete: "off", form: editForm },
                react_1["default"].createElement(antd_1.Form.Item, { label: "Group Name", name: "name", rules: [{ required: true, message: "Please input groupname" }] },
                    react_1["default"].createElement(antd_1.Input, { defaultValue: groupName, onChange: function (e) { return setgroupName(e.target.value); } })),
                react_1["default"].createElement(antd_1.Form.Item, { wrapperCol: { offset: 5, span: 16 } },
                    react_1["default"].createElement(antd_1.Button, { onClick: function () {
                            editGroup({
                                name: groupName,
                                id: groupToEdit.id,
                                layers: []
                            });
                        } }, "Submit"))))),
        scaleVisible && (react_1["default"].createElement("div", { style: {
                position: "absolute",
                bottom: "10px",
                right: "120px",
                width: "200px"
            } }, scales.map(function (scale) { return (react_1["default"].createElement("div", { style: {
                position: "relative",
                width: "200px",
                height: "100px",
                marginBottom: "20px"
            } }, !props.isBaseMap ? (react_1["default"].createElement(ColorScale_1["default"], { settings: {
                minp: scale.minp,
                maxp: scale.maxp
            }, name: scale.name, colorMap: colorMap })) : (react_1["default"].createElement(react_1["default"].Fragment, null)))); })))));
}
exports["default"] = BaseMap;
