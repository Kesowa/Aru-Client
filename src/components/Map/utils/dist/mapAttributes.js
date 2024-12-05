"use strict";
// MapAttributes.tsx
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
exports.__esModule = true;
var react_1 = require("react");
var antd_1 = require("antd");
var react_json_view_1 = require("@uiw/react-json-view");
var httpCall_1 = require("../../../services/httpCall");
var apis_1 = require("../../../services/apis");
var httpErrorHandle_1 = require("../../../services/httpErrorHandle");
var featureTable_1 = require("./featureTable");
var constants_1 = require("src/constants");
var rasterprops_1 = require("src/static/rasterprops");
var authUtils_1 = require("src/services/authUtils");
var Text = antd_1.Typography.Text;
var Option = antd_1.Select.Option;
var MapAttributes = function (props) {
    var _a, _b;
    var initialState = {
        isTableLoading: false,
        rasterDetails: null,
        rasterMetaData: null,
        trueTableData: [],
        tableData: [],
        loading: false,
        error: false,
        contentHeight: "",
        page: 1,
        limit: 10,
        total: 10,
        refresh: false
    };
    var _c = react_1.useState(initialState), state = _c[0], setState = _c[1];
    // const filteredLayers = Object.values(props.allLayers).filter(
    //   (layer) => layer.type === "DEM" || layer.type === "ortho"
    // );
    var filteredLayers = props.AllLayers.filter(function (layer) {
        return layer.type === "Raster" &&
            [rasterprops_1.rasterProps.DEM, rasterprops_1.rasterProps.ORTHO].includes(layer.raster);
    });
    var logout = react_1.useContext(authUtils_1.AuthContext).logout;
    //AIML inference api implementation 
    var _d = react_1.useState(0), progress = _d[0], setProgress = _d[1];
    var _e = react_1.useState(false), loading = _e[0], setLoading = _e[1];
    var layerId = props.id;
    var invokeInference = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("all good");
            setLoading(true);
            httpCall_1["default"]
                .post(apis_1["default"].BASE_TREE_COUNT_INFERENCE + "layer/" + layerId + "/treecount/infer")
                .then(function (res) {
                if (res.data.status) {
                    message.success("Tree count inference has started successfully!");
                }
                else {
                    console.log("Something went wrong!");
                }
            })["catch"](function (err) {
                console.error("Error starting treecount inference:", err);
            });
            return [2 /*return*/];
        });
    }); };
    var onChange = function (checked) {
        props.setTerrainMap(checked);
    };
    react_1.useEffect(function () {
        // Update content height and limit based on props.bottomBarHeight and props.type
        updateContentHeight(props.bottomBarHeight, props.type);
    }, [props.bottomBarHeight, props.type]);
    react_1.useEffect(function () {
        // Fetch raster details when the component mounts or props.shouldAttributeTableReload changes
        if (props.type === "raster") {
            fetchRasterDetails(props.id);
        }
        else if (props.type === "vector") {
            if (props.featureCount) {
                setState(function (prevState) { return (__assign(__assign({}, prevState), { total: props.featureCount })); });
            }
            fetchJsonData();
        }
    }, [props.shouldAttributeTableReload]);
    react_1.useEffect(function () {
        // Fetch raster metadata when rasterDetails changes
        getRasterMetaData();
    }, [state.rasterDetails]);
    react_1.useEffect(function () {
        // Fetch GeoJSON data when page, limit, or filter options change
        fetchJsonData();
    }, [state.page, state.limit, props.flaggedFilter, props.unflaggedFilter]);
    var updateContentHeight = function (bottomBarHeight, type) {
        var contentHeight = "";
        var refresh = false;
        switch (bottomBarHeight) {
            case "240px":
                if (type === "vector") {
                    contentHeight = "160px";
                    refresh = true;
                }
                else {
                    contentHeight = "100px";
                }
                break;
            case "480px":
                if (type === "vector") {
                    contentHeight = "340px";
                    refresh = true;
                }
                else {
                    contentHeight = "340px";
                }
                break;
            case "540px":
                if (type === "vector") {
                    contentHeight = "460px";
                    refresh = true;
                }
                else {
                    contentHeight = "400px";
                }
                break;
            case "700px":
                if (type === "vector") {
                    contentHeight = "680px";
                    refresh = true;
                }
                else {
                    contentHeight = "550px";
                }
                break;
            case "900px":
                if (type === "vector") {
                    contentHeight = "750px";
                    refresh = true;
                }
                else {
                    contentHeight = "750px";
                }
                break;
            default:
                break;
        }
        setState(function (prevState) { return (__assign(__assign({}, prevState), { contentHeight: contentHeight,
            refresh: refresh })); });
    };
    var fetchRasterDetails = function (id) {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { loading: true })); });
        httpCall_1["default"]
            .get("" + apis_1["default"].GET_RASTER_DETAILS_BY_ID, { params: { id: id } })
            .then(function (result) {
            if (result.data.status) {
                setState(function (prevState) { return (__assign(__assign({}, prevState), { rasterDetails: result.data.data[0] })); });
            }
            else {
                setState(function (prevState) { return (__assign(__assign({}, prevState), { error: true })); });
            }
        })["catch"](function (err) {
            setState(function (prevState) { return (__assign(__assign({}, prevState), { error: true })); });
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        })["finally"](function () {
            return setState(function (prevState) { return (__assign(__assign({}, prevState), { loading: false })); });
        });
    };
    var fetchJsonData = function () {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { isTableLoading: true })); });
        var payload = {
            id: props.id,
            page: state.page - 1,
            limit: state.limit
        };
        var flagFilter = getFlaggedFilter();
        if (flagFilter !== undefined) {
            payload["isFlagged"] = flagFilter;
        }
        if (props.type === "vector") {
            httpCall_1["default"]
                .patch("" + apis_1["default"].GET_FEATURE_BY_LAYER, payload)
                .then(function (res) {
                if (res.data.status) {
                    setState(function (prevState) { return (__assign(__assign({}, prevState), { total: res.data.total, trueTableData: res.data.data, tableData: updateTableColors(res.data.data), refresh: !prevState.refresh })); });
                }
            })["catch"](function (err) {
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            })["finally"](function () {
                return setState(function (prevState) { return (__assign(__assign({}, prevState), { isTableLoading: false })); });
            });
        }
    };
    var getFlaggedFilter = function () {
        if (props.flaggedFilter) {
            return props.flaggedFilter;
        }
        else if (props.unflaggedFilter) {
            return !props.unflaggedFilter;
        }
        else
            return undefined;
    };
    var updateTableColors = function (records) {
        return records.map(function (record) {
            var _a;
            if (props.unflaggedFilter) {
                return record;
            }
            if (props.flaggedFilter || ((_a = props.AllLayers.find(function (layer) { return layer._id === props.id; })) === null || _a === void 0 ? void 0 : _a.flaggedFeatures.includes(record.index))) {
                return __assign(__assign({}, record), { properties: __assign(__assign({}, record.properties), { color: props.invertColor(record.properties.color) }) });
            }
            return record;
        });
    };
    var getRasterMetaData = function () {
        if (state.rasterDetails) {
            fetch(constants_1.COG_URL + "/cog/info?url=" + constants_1.TITILER_STATIC + "/raster/" + state.rasterDetails.fileName)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                setState(function (prevState) { return (__assign(__assign({}, prevState), { rasterMetaData: data })); });
            })["catch"](function (err) {
                console.log(err);
            });
        }
    };
    var setPaginationPage = function (page) {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { page: page })); });
    };
    var setPageLimit = function (currPage, limit) {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { page: currPage, limit: limit })); });
    };
    function changeColor(value) {
        props.setColorMap(value);
    }
    function changeOverlay(value) {
        props.setOverlayID(props.id, value);
    }
    var rasterData = (
    // Render raster data UI
    react_1["default"].createElement("div", { style: { width: "100%", padding: "5px" } },
        state.error && react_1["default"].createElement("div", null, "Something went wrong!"),
        !state.loading && !state.error ? (react_1["default"].createElement("div", { style: {
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                padding: "10px"
            } },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(Text, null, "File Name: "),
                    react_1["default"].createElement(Text, { type: "secondary" },
                        " ", (_a = state.rasterDetails) === null || _a === void 0 ? void 0 :
                        _a.fileName),
                    react_1["default"].createElement(Text, { style: { marginLeft: "40px" } }, "Size: "),
                    react_1["default"].createElement(Text, { type: "secondary" },
                        " ", (_b = state.rasterDetails) === null || _b === void 0 ? void 0 :
                        _b.fileSize.toFixed(2),
                        " MB"),
                    react_1["default"].createElement(antd_1.Select, { defaultValue: "plasma", style: { width: 120, float: "right", marginLeft: "12px" }, onChange: changeColor },
                        react_1["default"].createElement(Option, { value: "plasma" }, "plasma"),
                        react_1["default"].createElement(Option, { value: "cfastie" }, "cfastie"),
                        react_1["default"].createElement(Option, { value: "rplumbo" }, "rplumbo"),
                        react_1["default"].createElement(Option, { value: "schwarzwald" }, "schwarzwald"),
                        react_1["default"].createElement(Option, { value: "viridis" }, "viridis"),
                        react_1["default"].createElement(Option, { value: "inferno" }, "inferno"),
                        react_1["default"].createElement(Option, { value: "magma" }, "magma"),
                        react_1["default"].createElement(Option, { value: "cividis" }, "cividis"),
                        react_1["default"].createElement(Option, { value: "hsv" }, "hsv"))),
                react_1["default"].createElement("div", { style: { marginTop: "5px" } },
                    react_1["default"].createElement(Text, null, "MetaData:"),
                    react_1["default"].createElement("div", { style: {
                            boxSizing: "border-box",
                            border: "1px solid gray",
                            height: state.contentHeight,
                            marginTop: "5px",
                            overflow: "auto",
                            padding: "10px"
                        } },
                        react_1["default"].createElement(react_json_view_1["default"], { value: state.rasterMetaData || {}, name: false, collapsed: true, displayDataTypes: false })))),
            react_1["default"].createElement("div", { style: { marginRight: "20rem" } },
                react_1["default"].createElement("div", { style: {
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "50px"
                    } },
                    react_1["default"].createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
                        react_1["default"].createElement(Text, null, "Terrain:"),
                        react_1["default"].createElement(antd_1.Switch, { onChange: onChange })),
                    react_1["default"].createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
                        react_1["default"].createElement(Text, null, "3D-Overlay:"),
                        react_1["default"].createElement(antd_1.Switch, { onChange: function () { return props.handleMeshSourceOption(props.id); } }))),
                react_1["default"].createElement("div", { style: { marginTop: "20px" } },
                    react_1["default"].createElement(antd_1.Button, { type: "primary", onClick: invokeInference, loading: loading, style: {
                            marginBottom: 16,
                            background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
                            border: "none"
                        } }, "Tree count Inference")),
                react_1["default"].createElement("div", { style: { marginTop: "1.1rem" } },
                    react_1["default"].createElement(antd_1.Space, { size: "large" },
                        react_1["default"].createElement(Text, null, "Overlay: "),
                        react_1["default"].createElement(antd_1.Select, { defaultValue: "Select", style: { width: 120, float: "right" }, onChange: changeOverlay }, filteredLayers.map(function (layer) { return (react_1["default"].createElement(Option, { key: layer.name, value: layer._id }, layer.name)); }))))))) : (!state.error && react_1["default"].createElement(antd_1.Spin, { style: { margin: "20px auto", width: "100%" } }))));
    var table = (
    // Render vector attribute table UI
    react_1["default"].createElement("div", { style: { height: "100%", overflow: "hidden" } }, !state.isTableLoading ? (react_1["default"].createElement(featureTable_1["default"], { id: props.id, bottomBarHeight: props.bottomBarHeight, contentHeight: state.contentHeight, tableData: state.tableData, allLayers: props.AllLayers, flaggedFilter: props.flaggedFilter, unflaggedFilter: props.unflaggedFilter, setPage: function (page) { return setState(function (prev) { return (__assign(__assign({}, prev), { page: page })); }); }, page: state.page, setLimit: function (limit) { return setState(function (prev) { return (__assign(__assign({}, prev), { limit: limit })); }); }, limit: state.limit, setPaginationPage: setPaginationPage, setPageLimit: setPageLimit, total: state.total, setTotal: function (total) { return setState(function (prev) { return (__assign(__assign({}, prev), { total: total })); }); }, setViewport: props.setViewport, setSelectedIndexes: props.setSelectedIndexes, setSelectedFeatures: props.setSelectedFeatures, defaultKeys: props.defaultKeys, selectedIndexes: props.selectedIndexes, canEditGeojson: props.canEditGeojson, canDeleteFeature: props.canDeleteFeature, updateFeatureCountInLayers: props.updateFeatureCountInLayers, setshowSelectedIndexes: props.setshowSelectedIndexes, setKey: props.setKey, setShouldAttributeTableReload: props.setShouldAttributeTableReload, shouldAttributeTableReload: props.shouldAttributeTableReload, refreshLayer: props.refreshLayer, setRefreshLayer: props.setRefreshLayer })) : (react_1["default"].createElement(antd_1.Spin, { style: { margin: "20px auto", width: "100%" } }))));
    switch (props.type) {
        case "raster":
            return rasterData;
        case "vector":
            return table;
        default:
            return null;
    }
};
exports["default"] = MapAttributes;
