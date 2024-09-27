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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var antd_1 = require("antd");
var pro_layout_1 = require("@ant-design/pro-layout");
var icons_1 = require("@ant-design/icons");
var moment_1 = require("moment");
var assetListing_1 = require("./utils/assetListing");
var ModelList_1 = require("./utils/ModelList");
var ManufacturerList_1 = require("./utils/ManufacturerList");
var httpCall_1 = require("../../services/httpCall");
var apis_1 = require("../../services/apis");
var httpErrorHandle_1 = require("../../services/httpErrorHandle");
require("./index.less");
var authUtils_1 = require("src/services/authUtils");
var Text = antd_1.Typography.Text, Title = antd_1.Typography.Title;
var Option = antd_1.Select.Option;
var TextArea = antd_1.Input.TextArea;
var TabPane = antd_1.Tabs.TabPane;
var originData = [
    {
        id: "0",
        key: "UIN",
        value: ""
    },
    {
        id: "1",
        key: "FCID",
        value: ""
    },
    {
        id: "2",
        key: "serialNo",
        value: ""
    },
];
var originData2 = [
    {
        id: "0",
        key: "tshirt-size",
        value: ""
    },
    {
        id: "1",
        key: "key12",
        value: ""
    },
    {
        id: "2",
        key: "imageURL",
        value: ""
    },
];
var EditableCell = function (_a) {
    var editing = _a.editing, dataIndex = _a.dataIndex, title = _a.title, inputType = _a.inputType, record = _a.record, index = _a.index, children = _a.children, restProps = __rest(_a, ["editing", "dataIndex", "title", "inputType", "record", "index", "children"]);
    return (react_1["default"].createElement("td", __assign({}, restProps), editing ? (react_1["default"].createElement(antd_1.Form.Item, { name: dataIndex, style: { margin: 0 }, rules: [
            {
                required: true,
                message: "Please Input " + dataIndex + "!"
            },
        ] },
        react_1["default"].createElement(antd_1.Input, null))) : (children)));
};
function AssetBase(props) {
    var _this = this;
    var _a = react_1.useState(false), isModalVisible = _a[0], setIsModalVisible = _a[1];
    var _b = react_1.useState(false), isModalVisible2 = _b[0], setIsModalVisible2 = _b[1];
    var _c = react_1.useState(false), isModalVisible3 = _c[0], setIsModalVisible3 = _c[1];
    var _d = react_1.useState([]), users = _d[0], setUsers = _d[1];
    var _e = react_1.useState([]), manufacturers = _e[0], setManufacturers = _e[1];
    var _f = react_1.useState([]), models = _f[0], setModels = _f[1];
    var _g = react_1.useState([]), assetClasses = _g[0], setAssetClasses = _g[1];
    var _h = react_1.useState(3), count = _h[0], setCount = _h[1];
    var _j = react_1.useState(""), manufacturingDate = _j[0], setManufacturingDate = _j[1];
    var _k = react_1.useState(originData), data = _k[0], setData = _k[1];
    var _l = react_1.useState(""), editingKey = _l[0], setEditingKey = _l[1];
    var _m = react_1.useState(false), refreshAssets = _m[0], setRefreshAssets = _m[1];
    var _o = react_1.useState(true), assetButton = _o[0], setAssetButton = _o[1];
    var _p = react_1.useState(true), modelButton = _p[0], setModelButton = _p[1];
    var _q = react_1.useState(true), manufacturerButton = _q[0], setManufacturerButton = _q[1];
    var form = antd_1.Form.useForm()[0];
    var history = react_router_dom_1.useHistory();
    var _r = react_1.useContext(authUtils_1.AuthContext), Auth = _r.Auth, logout = _r.logout;
    var showModal = function () {
        setIsModalVisible(true);
        setData(originData);
    };
    var handleOk = function () {
        setIsModalVisible(false);
    };
    var handleCancel = function () {
        setIsModalVisible(false);
        form.resetFields();
    };
    var showModal2 = function () {
        setIsModalVisible2(true);
        setData(originData2);
    };
    var handleOk2 = function () {
        setIsModalVisible2(false);
    };
    var handleCancel2 = function () {
        setIsModalVisible2(false);
        form.resetFields();
    };
    var showModal3 = function () {
        setIsModalVisible3(true);
        setData(originData2);
    };
    var handleOk3 = function () {
        setIsModalVisible3(false);
    };
    var handleCancel3 = function () {
        setIsModalVisible3(false);
        form.resetFields();
    };
    var filter = function (inputValue, path) {
        return path.some(function (option) {
            return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
        });
    };
    var modelOptions = [];
    var getAssetClass = function () {
        httpCall_1["default"]
            .get("" + apis_1["default"].GET_ASSET_CLASSES)
            .then(function (result) {
            if (result.data.status) {
                setAssetClasses(result.data.data);
            }
            else {
                antd_1.message.error(result.data.message);
            }
        })["catch"](function (err) {
            console.log(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        });
    };
    var getOwner = function () {
        httpCall_1["default"]
            .get("" + apis_1["default"].FETCH_ALL_USERS_OF_TENANT)
            .then(function (result) {
            if (result.data.status) {
                setUsers(result.data.data);
            }
            else {
                antd_1.message.error(result.data.message);
            }
        })["catch"](function (err) {
            console.log(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        });
    };
    var getManufacturer = function () {
        httpCall_1["default"]
            .get("" + apis_1["default"].GET_MANUFACTURERS)
            .then(function (result) {
            if (result.data.status) {
                setManufacturers(result.data.data);
            }
            else {
                antd_1.message.error(result.data.message);
            }
        })["catch"](function (err) {
            console.log(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        });
    };
    var getModel = function () {
        httpCall_1["default"]
            .get("" + apis_1["default"].GET_MODELS)
            .then(function (result) {
            if (result.data.status) {
                setModels(result.data.data);
            }
            else {
                antd_1.message.error(result.data.message);
            }
        })["catch"](function (err) {
            console.log(err);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        });
    };
    var getModelOptions = function () {
        manufacturers.map(function (manufacturer) {
            var obj1 = {};
            obj1.value = manufacturer._id;
            obj1.label = manufacturer.name;
            obj1.children = [];
            models.map(function (model) {
                if (model.manufacturerID._id == obj1.value) {
                    var obj = {};
                    obj.value = model._id;
                    obj.label = model.modelName;
                    obj1.children.push(obj);
                }
            });
            modelOptions.push(obj1);
        });
    };
    react_1.useEffect(function () {
        getOwner();
        getManufacturer();
        getModel();
        getAssetClass();
    }, []);
    var onFinish = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var assetInfo, i, key, value, i, asset;
        return __generator(this, function (_a) {
            if (!manufacturingDate ||
                manufacturingDate === "" ||
                manufacturingDate === " ") {
                antd_1.message.error("Please select valid date");
                return [2 /*return*/];
            }
            assetInfo = {};
            for (i = 0; i < data.length; ++i) {
                key = data[i].key;
                value = data[i].value;
                assetInfo[key] = value;
                if (key === "FCID" && !value || key === "serialNo" && !value || key === "UIN" && !value) {
                    antd_1.message.error("AssetInfo is required");
                    return [2 /*return*/];
                }
            }
            form.resetFields();
            for (i = 0; i < data.length; ++i) {
                assetInfo[data[i].key] = data[i].value;
            }
            asset = {
                assetName: values.name,
                userID: Auth.userid,
                assetInfo: [assetInfo],
                model: values.type[1],
                assetOwner: values.owner,
                manufactureDate: moment_1["default"](manufacturingDate).format("YYYY-MM-DD"),
                manufactureID: values.type[0]
            };
            httpCall_1["default"]
                .post("" + apis_1["default"].CREATE_ASSET, asset)
                .then(function (result) {
                if (result.data.status) {
                    history.push("/dashboard/assets");
                    setRefreshAssets(function (prev) { return !prev; });
                    antd_1.message.success("Asset Created Successfully");
                }
            })["catch"](function (err) {
                console.log(err);
                antd_1.message.error(err.message);
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            })["finally"](function () {
                handleCancel();
            });
            return [2 /*return*/];
        });
    }); };
    var onFinish2 = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var props2, i, dimensions, model;
        return __generator(this, function (_a) {
            form.resetFields();
            props2 = {};
            for (i = 0; i < data.length; ++i) {
                props2[data[i].key] = data[i].value;
            }
            dimensions = {};
            dimensions["length"] = values.length;
            dimensions["breadth"] = values.breadth;
            dimensions["height"] = values.height;
            model = {
                modelName: values.name,
                modelNumber: values.number,
                assetClassID: values.type,
                manufacturerID: values.manufacturer,
                website: values.website,
                dimensions: dimensions,
                props: props2
            };
            httpCall_1["default"]
                .post("" + apis_1["default"].CREATE_MODEL, model)
                .then(function (result) {
                if (result.data.status) {
                    history.push("/dashboard/assets");
                    antd_1.message.success("Model Created Successfully");
                }
            })["catch"](function (err) {
                console.log(err);
                antd_1.message.error(err.message);
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            })["finally"](function () {
                handleCancel2();
            });
            return [2 /*return*/];
        });
    }); };
    var onFinish3 = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var manufacturer;
        return __generator(this, function (_a) {
            if (!values.contacts || values.contacts.length === 0) {
                antd_1.message.error("Please enter at least 1 client");
                return [2 /*return*/];
            }
            form.resetFields();
            manufacturer = {
                name: values.name,
                address: values.address,
                nationality: values.nationality,
                website: values.website,
                contacts: values.contacts
            };
            httpCall_1["default"]
                .post("" + apis_1["default"].CREATE_MANUFACTURER, manufacturer)
                .then(function (result) {
                if (result.data.status) {
                    history.push("/dashboard/assets");
                    antd_1.message.success("Manufacturer Created Successfully");
                }
            })["catch"](function (err) {
                console.log(err);
                antd_1.message.error(err.message);
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            })["finally"](function () {
                handleCancel3();
            });
            return [2 /*return*/];
        });
    }); };
    if (manufacturers && models) {
        getModelOptions();
    }
    var isEditing = function (record) { return record.key === editingKey; };
    var edit = function (record) {
        form.setFieldsValue(__assign({ label: "", value: "" }, record));
        setEditingKey(record.key);
    };
    var cancel = function () {
        setEditingKey("");
    };
    var save = function (key) { return __awaiter(_this, void 0, void 0, function () {
        var row, newData, index, item, errInfo_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, form.validateFields()];
                case 1:
                    row = (_a.sent());
                    newData = __spreadArrays(data);
                    index = newData.findIndex(function (item) { return key === item.key; });
                    if (index > -1) {
                        item = newData[index];
                        newData.splice(index, 1, __assign(__assign({}, item), row));
                        setData(newData);
                        setEditingKey("");
                    }
                    else {
                        newData.push(row);
                        setData(newData);
                        setEditingKey("");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    errInfo_1 = _a.sent();
                    console.log("Validate Failed:", errInfo_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var columns = [
        {
            title: "Key",
            dataIndex: "key",
            width: "35%",
            editable: true
        },
        {
            title: "Value",
            dataIndex: "value",
            width: "35%",
            editable: true
        },
        {
            title: "Actions",
            dataIndex: "operation",
            render: function (_, record) {
                var editable = isEditing(record);
                return editable ? (react_1["default"].createElement("span", null,
                    react_1["default"].createElement("a", { href: "javascript:;", onClick: function () { return save(record.key); }, style: { marginRight: 8 } },
                        react_1["default"].createElement(icons_1.SaveOutlined, { style: { color: "green" } })),
                    react_1["default"].createElement(antd_1.Popconfirm, { title: "Sure to cancel?", onConfirm: cancel },
                        react_1["default"].createElement("a", null,
                            react_1["default"].createElement(icons_1.CloseOutlined, { style: { color: "red" } }))))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(antd_1.Typography.Link, { disabled: editingKey !== "", onClick: function () { return edit(record); } },
                        react_1["default"].createElement(icons_1.EditOutlined, { style: { marginRight: 8 } })),
                    react_1["default"].createElement(antd_1.Popconfirm, { title: "Sure to delete?", onConfirm: function () { return handleDelete(record.key); } },
                        react_1["default"].createElement("a", null,
                            react_1["default"].createElement(icons_1.DeleteOutlined, { style: { color: "red" } })))));
            }
        },
    ];
    var handleDelete = function (key) {
        var newData = data.filter(function (item) { return item.key !== key; });
        setData(newData);
        setCount(count - 1);
    };
    var handleAdd = function (e) {
        var newData = {
            id: count,
            key: "Key " + (count + 1),
            value: ""
        };
        setData(__spreadArrays(data, [newData]));
        setCount(count + 1);
    };
    var mergedColumns = columns.map(function (col) {
        if (!col.editable) {
            return col;
        }
        return __assign(__assign({}, col), { onCell: function (record) { return ({
                record: record,
                inputType: "text",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record)
            }); } });
    });
    var onTabClick = function (key) {
        if (key == "1") {
            setAssetButton(true);
            setModelButton(true);
            setManufacturerButton(true);
        }
        else if (key == "2") {
            setAssetButton(false);
            setModelButton(true);
            setManufacturerButton(false);
        }
        else if (key == "3") {
            setAssetButton(false);
            setModelButton(false);
            setManufacturerButton(true);
        }
    };
    return (react_1["default"].createElement("div", { className: "asset-view-wrapper" },
        react_1["default"].createElement(pro_layout_1.PageHeader, { onBack: function () { return window.history.back(); }, title: "My Assets", className: "site-page-header-responsive", subTitle: "Here you all your assets, and also manage them", extra: [
                react_1["default"].createElement(antd_1.Button, { id: "manufacturerButton", key: "3", onClick: showModal3, type: "primary", style: { display: manufacturerButton ? "inline" : "none" } },
                    "Manufacturer ",
                    react_1["default"].createElement(icons_1.PlusOutlined, null)),
                react_1["default"].createElement(antd_1.Button, { id: "modelButton", key: "2", onClick: showModal2, type: "primary", style: { display: modelButton ? "inline" : "none" } },
                    "Model ",
                    react_1["default"].createElement(icons_1.PlusOutlined, null)),
                react_1["default"].createElement(antd_1.Button, { id: "assetButton", key: "1", onClick: showModal, type: "primary", style: { display: assetButton ? "inline" : "none" } },
                    "Asset ",
                    react_1["default"].createElement(icons_1.PlusOutlined, null)),
            ] }),
        react_1["default"].createElement(antd_1.Modal, { title: "Add New Asset", open: isModalVisible, onOk: handleOk, onCancel: handleCancel, footer: null },
            react_1["default"].createElement(antd_1.Form, { form: form, onFinish: onFinish, layout: "vertical", name: "create_mission", initialValues: {
                    remember: true
                }, requiredMark: false, id: "myForm" },
                react_1["default"].createElement(antd_1.Form.Item, { label: "Asset Name", name: "name", rules: [
                        {
                            required: true,
                            message: "Asset Name is required"
                        },
                    ] },
                    react_1["default"].createElement(antd_1.Input, { placeholder: "Asset Name" })),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Asset Type", name: "type", rules: [
                        {
                            required: true,
                            message: "Asset Type is required"
                        },
                    ], initialValue: [] },
                    react_1["default"].createElement(antd_1.Cascader, { options: modelOptions, placeholder: "Choose asset model", showSearch: { filter: filter }, displayRender: function (label) { return label.join(" > "); } })),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Asset Owner", name: "owner", rules: [
                        {
                            required: true,
                            message: "Asset Owner is required"
                        },
                    ] },
                    react_1["default"].createElement(antd_1.Select, { placeholder: "Choose asset owner" }, users.map(function (user) { return (react_1["default"].createElement(antd_1.Select.Option, { value: user._id }, user.name)); }))),
                react_1["default"].createElement(antd_1.Button, { onClick: handleAdd, type: "primary", size: "small", style: { marginBottom: 8, float: "right" } },
                    react_1["default"].createElement(icons_1.PlusOutlined, null)),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Asset Info" },
                    react_1["default"].createElement(antd_1.Table, { components: {
                            body: {
                                cell: EditableCell
                            }
                        }, bordered: true, dataSource: data, columns: mergedColumns, rowClassName: "editable-row", pagination: false })),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Date Of Manufacturing" },
                    react_1["default"].createElement(antd_1.DatePicker, { showTime: true, onChange: function (value) { return setManufacturingDate(value); } })),
                react_1["default"].createElement(antd_1.Form.Item, null,
                    react_1["default"].createElement(antd_1.Button, { type: "primary", htmlType: "submit" }, "Submit")))),
        react_1["default"].createElement(antd_1.Modal, { title: "Add New Model", open: isModalVisible2, onOk: handleOk2, onCancel: handleCancel2, footer: null },
            react_1["default"].createElement(antd_1.Form, { form: form, onFinish: onFinish2, layout: "vertical", name: "create_model", initialValues: {
                    remember: true
                }, requiredMark: false },
                react_1["default"].createElement(antd_1.Form.Item, { label: "Model Name", name: "name", rules: [
                        {
                            required: true,
                            message: "Model Name is required"
                        },
                    ] },
                    react_1["default"].createElement(antd_1.Input, { placeholder: "Model Name" })),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Model Number", name: "number", rules: [
                        {
                            required: true,
                            message: "Model Number is required"
                        },
                    ] },
                    react_1["default"].createElement(antd_1.Input, { placeholder: "Model Number" })),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Asset Class", name: "type", rules: [
                        {
                            required: true,
                            message: "Asset Class is required"
                        },
                    ] },
                    react_1["default"].createElement(antd_1.Select, { placeholder: "Choose Asset Class" }, assetClasses.map(function (assetClass) { return (react_1["default"].createElement(antd_1.Select.Option, { value: assetClass._id }, assetClass.typeName)); }))),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Manufacturer", name: "manufacturer", rules: [
                        {
                            required: true,
                            message: "Manufacturer is required"
                        },
                    ] },
                    react_1["default"].createElement(antd_1.Select, { placeholder: "Choose Manufacturer" }, manufacturers.map(function (manufacturer) { return (react_1["default"].createElement(antd_1.Select.Option, { value: manufacturer._id }, manufacturer.name)); }))),
                react_1["default"].createElement("div", { style: { display: "flex", flexFlow: "row" } },
                    react_1["default"].createElement(antd_1.Form.Item, { label: "Dimensions", name: "length" },
                        react_1["default"].createElement(antd_1.Input, { placeholder: "Length" })),
                    react_1["default"].createElement(antd_1.Form.Item, { label: "  ", name: "breadth" },
                        react_1["default"].createElement(antd_1.Input, { placeholder: "Breadth" })),
                    react_1["default"].createElement(antd_1.Form.Item, { label: "  ", name: "height" },
                        react_1["default"].createElement(antd_1.Input, { placeholder: "Height" }))),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Properties" },
                    react_1["default"].createElement(antd_1.Table, { components: {
                            body: {
                                cell: EditableCell
                            }
                        }, bordered: true, dataSource: data, columns: mergedColumns, rowClassName: "editable-row", pagination: false })),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Website", name: "website", rules: [
                        {
                            required: true,
                            message: "Website is required"
                        },
                    ] },
                    react_1["default"].createElement(antd_1.Input, { placeholder: "Website" })),
                react_1["default"].createElement(antd_1.Form.Item, null,
                    react_1["default"].createElement(antd_1.Button, { type: "primary", htmlType: "submit" }, "Submit")))),
        react_1["default"].createElement(antd_1.Modal, { title: "Add New Manufacturer", open: isModalVisible3, onOk: handleOk3, onCancel: handleCancel3, footer: null },
            react_1["default"].createElement(antd_1.Form, { form: form, onFinish: onFinish3, layout: "vertical", name: "create_manufacturer", initialValues: {
                    remember: true
                }, requiredMark: false },
                react_1["default"].createElement(antd_1.Form.Item, { label: "Manufacturer Name", name: "name", rules: [
                        {
                            required: true,
                            message: "Manufacturer Name is required"
                        },
                    ] },
                    react_1["default"].createElement(antd_1.Input, { placeholder: "Manufacturer Name" })),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Address", name: "address", rules: [
                        {
                            required: true,
                            message: "Address is required"
                        },
                    ] },
                    react_1["default"].createElement(TextArea, { rows: 4, placeholder: "Address" })),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Nationality", name: "nationality", rules: [
                        {
                            required: true,
                            message: "Nationality is required"
                        },
                    ] },
                    react_1["default"].createElement(antd_1.Input, { placeholder: "Nationality" })),
                react_1["default"].createElement(antd_1.Form.List, { name: "contacts" }, function (fields, _a) {
                    var add = _a.add, remove = _a.remove;
                    return (react_1["default"].createElement(react_1["default"].Fragment, null,
                        fields.map(function (field) { return (react_1["default"].createElement(antd_1.Space, { key: field.key, style: { display: "flex", marginBottom: 8 }, align: "baseline" },
                            react_1["default"].createElement(antd_1.Form.Item, __assign({}, field, { name: [field.name, "name"], rules: [
                                    {
                                        required: true,
                                        message: "Contact Name is required"
                                    },
                                ] }),
                                react_1["default"].createElement(antd_1.Input, { placeholder: "Contact Name" })),
                            react_1["default"].createElement(antd_1.Form.Item, __assign({}, field, { name: [field.name, "email"], rules: [
                                    {
                                        required: true,
                                        message: "Contact Email is required"
                                    },
                                ] }),
                                react_1["default"].createElement(antd_1.Input, { placeholder: "Contact Email" })),
                            react_1["default"].createElement(icons_1.MinusCircleOutlined, { onClick: function () {
                                    remove(field.name);
                                } }))); }),
                        react_1["default"].createElement(antd_1.Form.Item, null,
                            react_1["default"].createElement(antd_1.Button, { type: "dashed", onClick: function () {
                                    add();
                                }, block: true }, "Add Contact"))));
                }),
                react_1["default"].createElement(antd_1.Form.Item, { label: "Website", name: "website", rules: [
                        {
                            required: true,
                            message: "Website is required"
                        },
                    ] },
                    react_1["default"].createElement(antd_1.Input, { placeholder: "Website" })),
                react_1["default"].createElement(antd_1.Form.Item, null,
                    react_1["default"].createElement(antd_1.Button, { type: "primary", htmlType: "submit" }, "Submit")))),
        react_1["default"].createElement(antd_1.Tabs, { defaultActiveKey: "1", onTabClick: onTabClick },
            react_1["default"].createElement(TabPane, { tab: "Assets", key: "1" },
                react_1["default"].createElement(assetListing_1["default"], { filter: "all", refreshAssets: refreshAssets })),
            react_1["default"].createElement(TabPane, { tab: "Models", key: "2" },
                react_1["default"].createElement(ModelList_1["default"], null)),
            react_1["default"].createElement(TabPane, { tab: "Manufacturers", key: "3" },
                react_1["default"].createElement(ManufacturerList_1["default"], null)))));
}
exports["default"] = AssetBase;
