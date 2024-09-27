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
exports.__esModule = true;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var react_highlight_words_1 = require("react-highlight-words");
var moment_1 = require("moment");
var httpCall_1 = require("../../../services/httpCall");
var apis_1 = require("../../../services/apis");
var httpErrorHandle_1 = require("../../../services/httpErrorHandle");
var authUtils_1 = require("src/services/authUtils");
var Title = antd_1.Typography.Title;
function AssetListing(_a) {
    var filter = _a.filter, refreshAssets = _a.refreshAssets;
    var _b = react_1.useState(""), searchText = _b[0], setSearchText = _b[1];
    var _c = react_1.useState(""), searchedColumn = _c[0], setSearchedColumn = _c[1];
    var _d = react_1.useState(true), isTableLoading = _d[0], setIsTableLoading = _d[1];
    var _e = react_1.useState([]), assetTableData = _e[0], setAssetTableData = _e[1];
    var history = react_router_dom_1.useHistory();
    var logout = react_1.useContext(authUtils_1.AuthContext).logout;
    react_1.useEffect(function () {
        fetchAssets();
    }, [refreshAssets]);
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++ Fetch Assets +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    var fetchAssets = function () {
        httpCall_1["default"]
            .get("" + apis_1["default"].GET_ALL_ASSETS)
            .then(function (result) {
            if (result.data.status) {
                setAssetTableData(result.data.data.gotDoc);
            }
            else {
                antd_1.message.error("Unable to fetch assets. API response: " + result.data.message);
            }
        })["catch"](function (err) {
            if (err.response.status === 404) {
                setAssetTableData([]);
            }
            else {
                antd_1.message.error("Unable to fetch assets. Error info: " + err);
                httpErrorHandle_1.AxiosErrorHandler(err, logout);
            }
        })["finally"](function () {
            setIsTableLoading(false);
        });
    };
    // +++++++++++++++++++++++++++++++++++++++++++++++++++ Delete Assets +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    var handleDeleteAsset = function (name, id) {
        setIsTableLoading(true);
        httpCall_1["default"]["delete"]("" + apis_1["default"].DELETE_ASSET_BY_ID, {
            data: { assetID: id }
        })
            .then(function (result) {
            if (result.data.status) {
                var newTableData = assetTableData.filter(function (asset) { return asset._id !== id; });
                setAssetTableData(newTableData);
                antd_1.message.success("Asset \"" + name + "\" deleted");
            }
            else {
                antd_1.message.error(result.data.message);
            }
        })["catch"](function (err) {
            antd_1.message.error(err.message);
            httpErrorHandle_1.AxiosErrorHandler(err, logout);
        })["finally"](function () {
            setIsTableLoading(false);
        });
    };
    var actionMenu = function (record) { return [
        {
            key: "1",
            label: "Edit Asset",
            icon: react_1["default"].createElement(icons_1.EditOutlined, null)
        },
        {
            key: "2",
            label: (react_1["default"].createElement(antd_1.Popconfirm, { title: "Are you sure to delete the asset", okText: "Yes", cancelText: "No", onConfirm: function () {
                    handleDeleteAsset(record.assetName, record._id);
                } },
                react_1["default"].createElement(icons_1.DeleteOutlined, null),
                " Delete Asset"))
        },
        {
            key: "3",
            label: "Block Asset",
            icon: react_1["default"].createElement(icons_1.StopOutlined, null)
        },
    ]; };
    var searchInput;
    var handleSearch = function (selectedKeys, confirm, dataIndex) {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    var handleReset = function (clearFilters) {
        clearFilters();
        setSearchText("");
    };
    var getColumnSearchProps = function (dataIndex) { return ({
        filterDropdown: function (_a) {
            var setSelectedKeys = _a.setSelectedKeys, selectedKeys = _a.selectedKeys, confirm = _a.confirm, clearFilters = _a.clearFilters;
            return (react_1["default"].createElement("div", { style: { padding: 8 } },
                react_1["default"].createElement(antd_1.Input, { ref: function (node) {
                        searchInput = node;
                    }, placeholder: "Search " + dataIndex, value: selectedKeys[0], onChange: function (e) {
                        return setSelectedKeys(e.target.value ? [e.target.value] : []);
                    }, onPressEnter: function () { return handleSearch(selectedKeys, confirm, dataIndex); }, style: { width: 188, marginBottom: 8, display: "block" } }),
                react_1["default"].createElement(antd_1.Button, { type: "primary", onClick: function () { return handleSearch(selectedKeys, confirm, dataIndex); }, size: "small", style: { width: 90, marginRight: 8 } }, "Search"),
                react_1["default"].createElement(antd_1.Button, { onClick: function () { return handleReset(clearFilters); }, size: "small", style: { width: 90 } }, "Reset")));
        },
        filterIcon: function (filtered) { return (react_1["default"].createElement(icons_1.SearchOutlined, { style: { color: filtered ? "#1890ff" : undefined } })); },
        onFilter: function (value, record) {
            return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
        },
        onFilterDropdownOpenChange: function (visible) {
            if (visible) {
                setTimeout(function () { return searchInput.select(); });
            }
        },
        render: function (text) {
            return searchedColumn === dataIndex ? (react_1["default"].createElement(react_highlight_words_1["default"], { highlightStyle: { backgroundColor: "#ffc069", padding: 0 }, searchWords: [searchText], autoEscape: true, textToHighlight: text.toString() })) : (text);
        }
    }); };
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++Columns++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    var columns = [
        __assign(__assign({ title: "ASSET", dataIndex: "assetName", sorter: function (a, b) { return a.assetName.length - b.assetName.length; }, sortDirections: ["ascend", "descend"] }, getColumnSearchProps("name")), { render: function (assetName) {
                return (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement("span", { onClick: function () { } },
                        react_1["default"].createElement(Title, { level: 5 },
                            react_1["default"].createElement(icons_1.ShakeOutlined, { style: { marginRight: "1rem", color: "#a5a4bf" } }),
                            assetName))));
            } }),
        __assign(__assign({ title: "TYPE", dataIndex: "modelID", sorter: function (a, b) {
                return a.modelID.assetClassID.typeName.length -
                    b.modelID.assetClassID.typeName.length;
            }, sortDirections: ["ascend", "descend"] }, getColumnSearchProps("type")), { render: function (modelID) { return modelID.assetClassID.typeName; } }),
        __assign(__assign({ title: "MODEL", dataIndex: "modelID", sorter: function (a, b) {
                return a.modelID.modelName.length - b.modelID.modelName.length;
            }, sortDirections: ["ascend", "descend"] }, getColumnSearchProps("model")), { render: function (modelID) { return modelID.modelName; } }),
        __assign(__assign({ title: "CREATED AT", dataIndex: "createdAt", sorter: function (a, b) {
                return moment_1["default"](a.createdAt).unix() - moment_1["default"](b.createdAt).unix();
            }, sortDirections: ["descend", "ascend"] }, getColumnSearchProps("createdAt")), { render: function (createdAt) { return moment_1["default"](createdAt).format("DD-MM-YYYY"); } }),
        __assign(__assign({ title: "ASSET ID", dataIndex: "_id" }, getColumnSearchProps("_id")), { render: function (text, record) { return (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("span", { onClick: function () { } }, record._id))); } }),
        __assign(__assign({ title: "CREATED BY", dataIndex: "createdBy", sorter: function (a, b) {
                return a.createdBy.name.length - b.createdBy.name.length;
            }, sortDirections: ["descend", "ascend"] }, getColumnSearchProps("user")), { render: function (createdBy) { return createdBy.name; } }),
        {
            title: "STATUS",
            dataIndex: "isActive",
            sorter: function (a, b) { return a.isActive.length - b.isActive.length; },
            sortDirections: ["ascend", "descend"],
            render: function (isActive) {
                var color = isActive === "true" ? "geekblue" : "red";
                var status = isActive === "true" ? "Active" : "Inactive";
                return (react_1["default"].createElement(antd_1.Tag, { color: color, key: status }, status.toUpperCase()));
            }
        },
        {
            title: "ACTIONS",
            dataIndex: "actions",
            render: function (text, record) { return (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement(antd_1.Dropdown.Button, { onClick: function () {
                        history.push("/dashboard/asset/view/" + record._id);
                    }, className: "dropdown-option", menu: { items: actionMenu(record) } },
                    react_1["default"].createElement(icons_1.EyeOutlined, null)))); }
        },
    ];
    return (react_1["default"].createElement("div", null,
        react_1["default"].createElement(antd_1.Table, { columns: columns, dataSource: (filter === "all") ?
                assetTableData :
                assetTableData.filter(function (row) {
                    return row.isActive === filter;
                }), rowKey: "_id", style: { cursor: "pointer" }, loading: isTableLoading })));
}
exports["default"] = AssetListing;
