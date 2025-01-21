"use strict";
exports.__esModule = true;
var react_1 = require("react");
var httpCall_1 = require("../../../services/httpCall");
var httpErrorHandle_1 = require("../../../services/httpErrorHandle");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var apis_1 = require("../../../services/apis");
require("../index.less");
var area_icon_svg_1 = require("../../../static/area_icon.svg");
var small_angle_svg_1 = require("../../../static/small-angle.svg");
var perimeter_icon_svg_1 = require("../../../static/perimeter_icon.svg");
var turf = require("@turf/turf");
var THREE = require("three");
var moment_1 = require("moment");
var reverseGeocoding_1 = require("../../../services/reverseGeocoding");
var constants_1 = require("src/constants");
var bs_1 = require("react-icons/bs");
var authUtils_1 = require("src/services/authUtils");
var threadUtils_1 = require("src/services/threadUtils");
var Text = antd_1.Typography.Text, Paragraph = antd_1.Typography.Paragraph;
var Option = antd_1.Select.Option;
function InfoWindow(props) {
    var _a = react_1.useState({}), properties = _a[0], setProperties = _a[1];
    var _b = react_1.useState(""), address = _b[0], setAddress = _b[1];
    var _c = react_1.useState(false), loader = _c[0], setLoader = _c[1];
    var _d = react_1["default"].useState(turf.area(props.feature).toFixed(2)), area = _d[0], setArea = _d[1];
    var _e = react_1["default"].useState(turf.length(props.feature).toFixed(2)), perimeter = _e[0], setPerimeter = _e[1];
    var _f = react_1.useState(0), angle = _f[0], setAngle = _f[1];
    var _g = react_1.useState("sq. m"), areaUnit = _g[0], setAreaUnit = _g[1];
    var _h = react_1.useState("km"), lengthUnit = _h[0], setLenghtUnit = _h[1];
    var _j = react_1.useState(false), flag = _j[0], setFlag = _j[1];
    var logout = react_1.useContext(authUtils_1.AuthContext).logout;
    var _k = react_1.useContext(threadUtils_1.ThreadContext), thread = _k.thread, openThread = _k.openThread;
    var _l = react_1.useState(0), fileCount = _l[0], setFileCount = _l[1];
    var _m = react_1.useState([]), imageToShow = _m[0], setImageToshow = _m[1];
    var _o = react_1.useState(false), imageLoader = _o[0], setImageLoader = _o[1];
    function openImages() {
        props.setImagesDrawer(true);
        props.togglePopup(false);
    }
    function reverseGeocoder(coordinates) {
        setLoader(true);
        reverseGeocoding_1["default"](coordinates[1], coordinates[0], function (err, address) {
            if (!err) {
                setAddress(address);
            }
            else {
                antd_1.message.error("Location could not be fetched");
            }
            setLoader(false);
        });
    }
    var alertThumbnail = function (item) {
        return (react_1["default"].createElement(antd_1.Badge, { style: {
                backgroundColor: "#f5222d",
                padding: "5px",
                borderRadius: "5px"
            }, offset: [-25, 25], count: item.isFlagged ? (react_1["default"].createElement(bs_1.BsFlagFill, { style: {
                    color: "#fff",
                    fontSize: "24px"
                } })) : (0) },
            react_1["default"].createElement(antd_1.Image, { src: constants_1.STATIC_URL + item.Image, preview: false, fallback: "data:image/png;base64,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", style: {
                    width: "100%",
                    height: "auto",
                    minHeight: "200px"
                } })));
    };
    function areaMeasurementHandeller(unit) {
        switch (unit) {
            case "sq. km":
                setArea((turf.area(props.feature) / 1000000).toFixed(2));
                setAreaUnit("sq. km");
                break;
            case "sq. m":
                setArea(turf.area(props.feature).toFixed(2));
                setAreaUnit("sq. m");
                break;
            case "acres":
                setArea((turf.area(props.feature) * 0.00025).toFixed(2));
                setAreaUnit("acres");
                break;
            case "hectr":
                setArea((turf.area(props.feature) * 0.0001).toFixed(2));
                setAreaUnit("hectr");
                break;
            default:
                setArea(turf.area(props.feature).toFixed(2));
                setAreaUnit("sq. m");
        }
    }
    function lengthMeasurementHandeller(unit) {
        switch (unit) {
            case "km":
                setPerimeter(turf.length(props.feature).toFixed(2));
                setLenghtUnit("km");
                break;
            case "m":
                setPerimeter((turf.length(props.feature) * 1000).toFixed(2));
                setLenghtUnit("m");
                break;
            case "cm":
                setPerimeter((turf.length(props.feature) * 100000).toFixed(2));
                setLenghtUnit("cm");
                break;
            case "ft":
                setPerimeter((turf.length(props.feature) * 3280.84).toFixed(2));
                setLenghtUnit("ft");
                break;
            case "inch":
                setPerimeter((turf.length(props.feature) * 39370.1).toFixed(2));
                setLenghtUnit("inch");
                break;
            default:
                setPerimeter(turf.length(props.feature).toFixed(2));
                setLenghtUnit("km");
        }
    }
    react_1.useEffect(function () {
        reverseGeocoder(props.coordinates);
        var featureData = Object.keys(props.feature.properties).filter(function (key, i) { return key !== "Id" && key !== "color"; });
    }, []);
    var saveDrawingButton = function () {
        if (props.canDraw) {
            return (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement(antd_1.Row, { style: {
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    } },
                    react_1["default"].createElement(antd_1.Button, { style: { width: "100%", marginTop: "15px" }, type: "primary", onClick: function () {
                            props.setformDrawerVisible(true);
                            props.togglePopup(false);
                            props.setShowForm(true);
                        } }, "Save"))));
        }
        else
            return react_1["default"].createElement(react_1["default"].Fragment, null);
    };
    var CancelDrawingButton = function () {
        return (react_1["default"].createElement(antd_1.Row, { style: {
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "-5px"
            } },
            react_1["default"].createElement(antd_1.Button, { style: {
                    width: "100%",
                    marginTop: "15px",
                    background: "#F77775",
                    border: "none",
                    color: "#ffffff"
                }, onClick: function () {
                    props.cancelDrawing();
                } }, "Cancel")));
    };
    var renderFeatureAddress = function () {
        return (react_1["default"].createElement("div", { className: "address-content" }, loader ? (react_1["default"].createElement("div", { className: "spinner" },
            react_1["default"].createElement(antd_1.Spin, null))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(Paragraph, { copyable: true }, address),
            react_1["default"].createElement("a", { href: "https://www.google.com/maps/?q=" + props.coordinates[1] + "," + props.coordinates[0], target: "_blank", rel: "noreferrer" }, "Show on google maps")))));
    };
    var renderFeatureOptions = function () {
        var _a;
        return (react_1["default"].createElement(react_1["default"].Fragment, null, !props.show && (react_1["default"].createElement("div", { style: { float: "right", marginTop: "4px" } },
            react_1["default"].createElement(antd_1.Row, null,
                props.missionLayer === "Alert" ?
                    (react_1["default"].createElement(antd_1.Tooltip, { placement: "right", title: "Open Thread" },
                        react_1["default"].createElement(icons_1.MessageOutlined, { style: {
                                color: thread.open ? "#3b86ff" : "#000",
                                cursor: "pointer",
                                fontSize: "16px"
                            }, onClick: function () {
                                props.setThumbnail(alertThumbnail(props.feature.properties));
                                openThread("alert", props.feature.properties._id, {});
                            } }))) :
                    (react_1["default"].createElement(antd_1.Tooltip, { placement: "bottom", title: "Open Media" },
                        react_1["default"].createElement(antd_1.Badge, { size: "small", count: fileCount, className: "site-badge-count-4" },
                            react_1["default"].createElement(icons_1.CameraOutlined, { style: { marginRight: "6px" }, onClick: function () { return openImages(); } })))),
                props.missionLayer !== "VOD" &&
                    react_1["default"].createElement(antd_1.Tooltip, { placement: props.missionLayer === "Alert" ? "right" : "bottom", title: props.flag ? "Unflag" : "Flag" },
                        react_1["default"].createElement(bs_1.BsFlagFill, { style: (_a = {
                                    color: props.flag ? "#da1c5c" : "#000",
                                    cursor: "pointer"
                                },
                                _a[(props.missionLayer === "Alert") ? "fontSize" : ""] = "16px",
                                _a[(props.missionLayer === "Alert") ? "marginLeft" : ""] = "5px",
                                _a), onClick: function () {
                                toggleFlag();
                            } })))))));
    };
    var renderAttributeContent = function () {
        var _a;
        return (react_1["default"].createElement("div", { className: "attribute-content" }, props.show ? (react_1["default"].createElement(react_1["default"].Fragment, null)) : (react_1["default"].createElement(react_1["default"].Fragment, null, imageToShow.length > 0 || ((_a = props.videoToShow) === null || _a === void 0 ? void 0 : _a.length) > 0 ? (react_1["default"].createElement(antd_1.Row, null,
            react_1["default"].createElement(antd_1.Col, { span: 15, className: "properties" }, Object.keys(properties).map(function (key, i) { return (react_1["default"].createElement(antd_1.Row, { key: i },
                react_1["default"].createElement(antd_1.Col, { md: 10 },
                    react_1["default"].createElement(Text, { className: "key", strong: true }, key)),
                react_1["default"].createElement(antd_1.Col, { md: 14 },
                    react_1["default"].createElement("span", { className: "value" }, properties[key])))); })),
            react_1["default"].createElement(antd_1.Col, { span: 9, className: "image-part" },
                react_1["default"].createElement(antd_1.Spin, { spinning: imageLoader }, props.missionLayer === "Alert" ? (react_1["default"].createElement(antd_1.Image, { src: constants_1.STATIC_URL + imageToShow[0] })) : props.missionLayer === "VOD" ? (react_1["default"].createElement("img", { src: constants_1.STATIC_URL + props.videoToShow[0].thumbnail, style: { cursor: "pointer" } })) : (react_1["default"].createElement("img", { src: constants_1.STATIC_URL + "/images/geojson/1x_" + imageToShow[0].filePath.split("/")[3], onClick: function () { return openImages(); }, style: { cursor: "pointer" } })))))) : (react_1["default"].createElement(react_1["default"].Fragment, null, Object.keys(properties).map(function (key, i) { return (react_1["default"].createElement(antd_1.Row, { key: i },
            react_1["default"].createElement(antd_1.Col, { md: 10 },
                react_1["default"].createElement(Text, { className: "key", strong: true }, key)),
            react_1["default"].createElement(antd_1.Col, { md: 14 },
                react_1["default"].createElement("span", { className: "value" }, properties[key])))); })))))));
    };
    var initFlag = function () {
        var _a;
        if (props.missionLayer === "Alert") {
            httpCall_1["default"]
                .get("" + apis_1["default"].FETCH_ALERT_BY_ID, {
                params: {
                    id: props.feature.properties._id
                }
            })
                .then(function (result) {
                if (result.data.status) {
                    console.log("Alert data", result.data.data);
                    setFlag(result.data.data[0].isFlagged);
                }
                else {
                    antd_1.message.error(result.data.message);
                }
            })["catch"](function (err) {
                console.log(err);
            });
        }
        else if (props.missionLayer === "Vector" && props.mode === "PointView") {
            if ((_a = props.AllLayers.find(function (layer) { return layer._id === props.layerId; })) === null || _a === void 0 ? void 0 : _a.flaggedFeatures.includes(props.featureIdx)) {
                setFlag(true);
            }
            else {
                setFlag(false);
            }
        }
    };
    react_1.useEffect(function () {
        if (!props.isPublic) {
            initFlag();
        }
    }, []);
    function updateLayerFlag() {
        var body = {
            featureIndex: [props.featureIdx],
            flag: !flag
        };
        httpCall_1["default"]
            .patch(apis_1["default"].FLAG_FEATURE + "/" + props.layerId, body)
            .then(function (res) {
            if (res.data.status) {
                antd_1.message.success("Feature " + (!body.flag ? "un-flagged" : "flagged") + " successfully!");
                props.SetAllLayers(function (prev) { return prev.map(function (layer) {
                    if (layer._id === props.layerId) {
                        if (body.flag)
                            layer.flaggedFeatures.push(props.featureIdx);
                        else
                            layer.flaggedFeatures = layer.flaggedFeatures.filter(function (idx) { return idx !== props.featureIdx; });
                    }
                    return layer;
                }); });
                props.setShouldAttributeTableReload(!props.shouldAttributeTableReload);
                setFlag(body.flag);
            }
            else {
                antd_1.message.error(res.data.message);
            }
        })["catch"](function (err) {
            antd_1.message.error(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        });
    }
    var updateAlert = function () {
        var body = {
            id: props.feature.properties._id,
            update: { isFlagged: !flag }
        };
        httpCall_1["default"]
            .patch("" + apis_1["default"].UPDATE_ALERT, body)
            .then(function (res) {
            if (res.data.status) {
                antd_1.message.success("Image " + (!body.update.isFlagged ? "un-flagged" : "flagged") + " successfully!");
                setFlag(function (prev) { return !prev; });
            }
            else
                antd_1.message.error(res.data.message);
        })["catch"](function (err) {
            console.error(err.message);
        });
    };
    var toggleFlag = function () {
        if (props.missionLayer === "Vector") {
            updateLayerFlag();
        }
        else if (props.missionLayer === "Alert") {
            updateAlert();
        }
        else {
            console.warn("item cannot be flagged");
        }
    };
    function filterProperties(object, type) {
        if (type === void 0) { type = "default"; }
        var filtered = {};
        var layerLocationCardKeys = [
            "color",
            "Id",
            "imagepaths",
            "icon",
            "sys_id",
        ];
        var missionAlertKeys = [
            "_id",
            "color",
            "icon",
            "Image",
            "LocationID",
            "isFlagged",
        ];
        var missionVODKeys = ["videos"];
        Object.keys(object).filter(function (key) {
            if (type === "Alert") {
                if (key === "isFlagged") {
                    setFlag(object[key]);
                }
                if (!missionAlertKeys.includes(key)) {
                    filtered[key] = object[key];
                }
            }
            else if (type === "VOD") {
                if (!missionVODKeys.includes(key)) {
                    filtered[key] = object[key];
                }
            }
            else {
                if (props.isBaseMap == false) {
                    if (!layerLocationCardKeys.includes(key)) {
                        filtered[key] = object[key];
                    }
                }
                else {
                    if (!layerLocationCardKeys.includes(key) && key !== "Nth") {
                        filtered[key] = object[key];
                    }
                }
            }
        });
        setProperties(filtered);
    }
    // Function to calculate angle (supports both 2D and 3D)
    function calculateAngle(points, options) {
        if (points === void 0) { points = props.feature.geometry.coordinates; }
        if (options === void 0) { options = { use3D: false }; }
        var start = points[0];
        var end = points[1];
        if (options.use3D) {
            // 3D angle calculation using three.js
            var vectorA = new THREE.Vector3(start[0], start[1], start[2] || 0);
            var vectorB = new THREE.Vector3(end[0], end[1], end[2] || 0);
            var angleInRadians = vectorA.angleTo(vectorB);
            var angleInDegrees = angleInRadians * (180 / Math.PI);
            console.log("3D Angle between points is:", angleInDegrees, "°");
            setAngle(angleInDegrees);
        }
        else {
            // 2D Angle calculation using Turf.js bearing
            var point1 = turf.point(start);
            var point2 = turf.point(end);
            var angle_1 = turf.bearing(point1, point2);
            console.log("2D Angle between points is :", angle_1, "°");
            setAngle(angle_1);
        }
    }
    react_1.useEffect(function () {
        //add condition when more then three points we have then this will run
        calculateAngle();
    }, [props.features]);
    react_1.useEffect(function () {
        if (props.missionLayer === "VOD" || props.missionLayer === "Alert") {
            if (props.missionLayer === "Alert") {
                console.log("Alert", props.feature.properties.isFlagged);
                setImageToshow([props.feature.properties.Image]);
                setFileCount(1);
            }
            else {
                props.setVideoToShow(props.feature.properties.videos);
                setFileCount(props.feature.properties.videos.length);
            }
            filterProperties(props.feature.properties, props.missionLayer);
        }
        else {
            filterProperties(props.feature.properties);
            setFileCount(0);
            console.log(props.sysId);
            if (props.layerId !== "new" && !props.isPublic) {
                var images_1 = [];
                setImageLoader(true);
                console.log("index", props.sysId, "layerId", props.layerId);
                httpCall_1["default"]
                    .get("" + apis_1["default"].FETCH_FEATURE_FILES, {
                    params: {
                        layerId: props.layerId,
                        sys_id: props.sysId
                    }
                })
                    .then(function (res) {
                    if (res.data.status) {
                        images_1 = res.data.data.filter(function (i) { return i.fileType === "image/jpeg" || i.fileType === "image/png"; });
                        var filtered = images_1.filter(function (i) { return i.coverPhoto === true; });
                        var toshow = [];
                        if (filtered.length > 0) {
                            toshow = filtered;
                        }
                        else {
                            toshow = images_1;
                        }
                        toshow.sort(function (a, b) {
                            return moment_1["default"](b.createdAt).diff(moment_1["default"](a.createdAt));
                        });
                        setImageToshow(toshow);
                        setFileCount(res.data.data.length);
                    }
                    else {
                        console.log(res.data.message);
                    }
                })["catch"](function (err) {
                    console.log(err);
                    httpErrorHandle_1.AxiosErrorHandler(err, logout);
                })["finally"](function () { return setImageLoader(false); });
            }
        }
        return function () {
            setProperties({});
        };
    }, [props.feature]);
    switch (props.mode) {
        case "PointView":
            return (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "infoWindowContent" },
                    renderAttributeContent(),
                    renderFeatureAddress(),
                    react_1["default"].createElement("div", { className: "sub-info" },
                        react_1["default"].createElement("span", { className: "coordinates" },
                            react_1["default"].createElement(Text, { copyable: true },
                                react_1["default"].createElement(icons_1.EnvironmentOutlined, null),
                                " ",
                                props.coordinates[1],
                                ",",
                                " ",
                                props.coordinates[0])),
                        react_1["default"].createElement("span", null, !props.isPublic && renderFeatureOptions())),
                    props.show && saveDrawingButton(),
                    props.show && CancelDrawingButton())));
        case "PolygonView":
            return (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "infoWindowContent" },
                    renderAttributeContent(),
                    renderFeatureAddress(),
                    react_1["default"].createElement("div", { className: "sub-info" },
                        react_1["default"].createElement("span", { className: "coordinates" },
                            react_1["default"].createElement(Text, null,
                                react_1["default"].createElement("img", { src: area_icon_svg_1["default"] }),
                                "\u00A0\u00A0",
                                area,
                                "\u00A0\u00A0",
                                react_1["default"].createElement(antd_1.Select, { defaultValue: areaUnit, size: "small", style: { width: "70px", fontSize: "12px" }, onChange: areaMeasurementHandeller },
                                    react_1["default"].createElement(Option, { className: "option-value", value: "sq. m" }, "sq. m"),
                                    react_1["default"].createElement(Option, { className: "option-value", value: "sq. km" }, "sq. km"),
                                    react_1["default"].createElement(Option, { className: "option-value", value: "acres" }, "acres"),
                                    react_1["default"].createElement(Option, { className: "option-value", value: "hectr" }, "hectr")),
                                "\u00A0\u00A0\u00A0\u00A0"),
                            react_1["default"].createElement(Text, null,
                                react_1["default"].createElement("img", { src: perimeter_icon_svg_1["default"] }),
                                "\u00A0\u00A0",
                                perimeter,
                                "\u00A0\u00A0",
                                react_1["default"].createElement(antd_1.Select, { defaultValue: lengthUnit, size: "small", style: { width: "60px", fontSize: "12px" }, onChange: lengthMeasurementHandeller },
                                    react_1["default"].createElement(Option, { className: "option-value", value: "km" }, "km"),
                                    react_1["default"].createElement(Option, { className: "option-value", value: "m" }, "m"),
                                    react_1["default"].createElement(Option, { className: "option-value", value: "ft" }, "ft")))),
                        react_1["default"].createElement("span", null, !props.isPublic && renderFeatureOptions())),
                    props.show && saveDrawingButton(),
                    props.show && CancelDrawingButton())));
        case "LineView":
            return (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "infoWindowContent" },
                    renderAttributeContent(),
                    renderFeatureAddress(),
                    react_1["default"].createElement("div", { className: "sub-info" },
                        react_1["default"].createElement("span", { className: "coordinates" },
                            react_1["default"].createElement(Text, null,
                                react_1["default"].createElement("img", { src: perimeter_icon_svg_1["default"] }),
                                "\u00A0\u00A0",
                                perimeter,
                                "\u00A0\u00A0",
                                react_1["default"].createElement(antd_1.Select, { defaultValue: lengthUnit, size: "small", style: { width: "60px", fontSize: "12px" }, onChange: lengthMeasurementHandeller },
                                    react_1["default"].createElement(Option, { className: "option-value", value: "km" }, "km"),
                                    react_1["default"].createElement(Option, { className: "option-value", value: "m" }, "m"),
                                    react_1["default"].createElement(Option, { className: "option-value", value: "ft" }, "ft")),
                                "\u00A0\u00A0\u00A0\u00A0"),
                            react_1["default"].createElement(Text, null,
                                react_1["default"].createElement("img", { src: small_angle_svg_1["default"] }),
                                "\u00A0\u00A0",
                                angle.toString().split('.')[0],
                                "\u00B0\u00A0degree \u00A0\u00A0")),
                        react_1["default"].createElement("span", null, !props.isPublic && renderFeatureOptions())),
                    props.show && saveDrawingButton(),
                    props.show && CancelDrawingButton())));
        // case "TwoPointsView":
        //   console.log("twopointsview...");
        //   return (
        //     <>
        //       <div className="infoWindowContent">
        //         <div className="sub-info">
        //           <span className="coordinates">
        //             <Text>
        //               <img src={SmallAngleIcon} />
        //               &nbsp;&nbsp;Angle: {props.angle.toFixed(0)}°&nbsp;&nbsp;
        //             </Text>
        //           </span>
        //           <span>{!props.isPublic && renderFeatureOptions()}</span>
        //         </div>
        //         {props.show && saveDrawingButton()}
        //         {props.show && CancelDrawingButton()}
        //       </div>
        //     </>
        //   );
        default:
            return react_1["default"].createElement("p", null, "unknown");
    }
}
exports["default"] = InfoWindow;
