import React, { useState, useEffect } from "react";
import { Row, Col, Typography, Table, Button, Card, message } from "antd";
import { Input } from "antd";
import {
  AudioOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkedAlt } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import AloneLogo from "../../../static/Alone-rafiki.svg";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { logout } from "../../../actions/authAction";
import { setEditLocation } from "../../../actions/locationAction";
import { connect } from "react-redux";
import { loading } from "../../../actions/loadingAction";

interface TabOptions {
  filter: any;
}
function DataLocation(props) {
  const { Search } = Input;
  const { Title } = Typography;
  const suffix = (
    <AudioOutlined
      style={{
        fontSize: 16,
        color: "#1890ff",
      }}
    />
  );

  // ++++++++++++++++++++++++++++++++++++++++++Searchable columns+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [geofence, setGeofence] = useState([]);
  const [centerPoint, setCenterPoint] = useState({ lat: "", long: "" });
  const [locationData, setLocationData] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);

  const getAllLocations = () => {
    http
      .get(`${apis.GET_ALL_LOCATIONS}`)
      .then((result) => {
        if (result.data.data) {
          //console.log(result.data.data);
          const data: any = [];
          for (const location of result.data.data) {
            const obj: any = new Object();
            obj.name = location.properties.name;
            if (location.geometry.type == "Point") {
              obj.geofence = [
                {
                  lat: location.geometry.coordinates.lat,
                  long: location.geometry.coordinates.lng,
                },
              ];
            } else {
              obj.geofence = location.geometry.coordinates[0].map((coord) => {
                return { lat: coord[1], long: coord[0] };
              });
            }
            /* */
            obj.missionCount = location.missionCount;
            obj.outcomeCount = location.outcomeCount;
            obj.centerPoint = findPolygonCenter(obj.geofence);
            obj.key = location._id;
            data.push(obj);
          }

          //console.log(data);
          setLocationData(data);
        }
      })
      .catch((err) => {
        message.error("Locations could not be fetched");
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setIsTableLoading(false);
      });
  };

  useEffect(() => {
    getAllLocations();
  }, []);

  let searchInput: any;
  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex: any) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput.select());
      }
    },
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  const findPolygonCenter = (points) => {
    const bounds = new window.google.maps.LatLngBounds();

    const polygonCoords: google.maps.LatLng[] = [];

    for (const x of points) {
      const llbound = new window.google.maps.LatLng(x.lat, x.long);
      polygonCoords.push(llbound);
    }
    let i;
    for (i = 0; i < polygonCoords.length; i++) {
      bounds.extend(polygonCoords[i]);
    }

    const centerOfPolygon = bounds.getCenter();

    return { lat: centerOfPolygon.lat(), long: centerOfPolygon.lng() };
  };

  // ++++++++++++++++++++++++++++++++++++++++++Defining Columns++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const columns: any[] = [
    {
      title: "LOCATION",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("name"),
      render: (lName: any) => {
        return (
          <>
            <Title level={5}>
              <FontAwesomeIcon
                icon={faMapMarkedAlt}
                style={{ marginRight: "1rem", color: "#a5a4bf" }}
              />
              {lName}
            </Title>
          </>
        );
      },
    },
    {
      title: "MISSIONS",
      dataIndex: "missionCount",
      sorter: (a: any, b: any) => a.missionCount - b.missionCount,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("missionCount"),
    },
    {
      title: "OUTCOMES",
      dataIndex: "outcomeCount",
      sorter: (a: any, b: any) => a.outcomeCount - b.outcomeCount,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("outcomeCount"),
    },
    {
      title: "Actions",
      dataIndex: "",
      key: "x",
      render: (data) => (
        <>
          <Link to={`data/location/${data.key}`}>
            <Button
              onClick={() => {
                props.setEditLocation({
                  location: data,
                  isEditing: true,
                });
              }}
              style={{ marginRight: "10px" }}
            >
              <EyeOutlined />
            </Button>
          </Link>
          <Link to={`data/location/edit/${data.key}`}>
            <Button
              onClick={() => {
                props.setEditLocation({
                  location: data,
                  isEditing: true,
                });
              }}
            >
              <EditOutlined />
            </Button>
          </Link>
          <Button
            style={{ marginLeft: "8px" }}
            danger
            onClick={() => {
              props.loading(true);
              http
                .delete(`${apis.DELETE_LOCATION}?id=${data.key}`)
                .then((result) => {
                  if (result.data.data.status) {
                    message.success(`LOcation ${data.name} deleted`);
                  } else {
                    message.error(result.data.data.message);
                  }
                })
                .catch((err) => {
                  message.error(err.message);
                  AxiosErrorHandler(err, props.logout);
                })
                .finally(() => {
                  props.loading(false);
                });
            }}
          >
            <DeleteOutlined />
          </Button>
        </>
      ),
    },
  ];
  // ++++++++++++++++++++++++++++++++++++SAMPLE DATA, fetch only completed missions here++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const data = [
    {
      key: 1,
      name: "Newtown BC Block",
      missionCount: 8,
      outcomeCount: 15,
      centerPoint: {
        lat: 22.57257,
        long: 88.43461,
      },
      geofence: [
        {
          lat: 22.57653,
          long: 88.42912,
        },
        {
          lat: 22.57268,
          long: 88.43813,
        },
        {
          lat: 22.56721,
          long: 88.43594,
        },
        {
          lat: 22.57098,
          long: 88.42607,
        },
        {
          lat: 22.57653,
          long: 88.42912,
        },
      ],
      createdBy: "root",
      createdAt: "17/02/2021",
    },
    {
      key: 2,
      name: "Salt Lake AG Block",
      missionCount: 3,
      outcomeCount: 12,
      centerPoint: {
        lat: 22.51121,
        long: 87.37773,
      },
      geofence: [
        {
          lat: 22.51135,
          long: 87.37769,
        },
        {
          lat: 22.51118,
          long: 87.37817,
        },
        {
          lat: 22.51109,
          long: 87.37734,
        },
        {
          lat: 22.51135,
          long: 87.37769,
        },
      ],
      createdBy: "root",
      createdAt: "17/02/2021",
    },
    {
      key: 3,
      name: "Sector 5, Salt lake",
      missionCount: 4,
      outcomeCount: 13,
      centerPoint: {
        lat: 22.51121,
        long: 87.37773,
      },
      geofence: [
        {
          lat: 22.51135,
          long: 87.37769,
        },
        {
          lat: 22.51118,
          long: 87.37817,
        },
        {
          lat: 22.51109,
          long: 87.37734,
        },
        {
          lat: 22.51135,
          long: 87.37769,
        },
      ],
      createdBy: "root",
      createdAt: "17/02/2021",
    },
  ];

  function onChange(pagination, filters, sorter, extra) {
    //console.log("params", pagination, filters, sorter, extra);
  }

  const onSearch = (value) => console.log(value);

  function fetchRowDetails(geofence, name) {
    //return console.log(`coordinates: ${geofence}`, `location name: ${name}`);
    return console.log("");
  }

  function formatGeoFenceForUrl(geofence) {
    if (geofence.length > 0) {
      let formattedGeoFence = "";
      geofence.forEach((point) => {
        formattedGeoFence += "|" + point.lat + "," + point.long;
      });
      return formattedGeoFence;
    }
    return "";
  }

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(
      //   `selectedRowKeys: ${selectedRowKeys}`,
      //   "selectedRows: ",
      //   selectedRows[0].geofence
      // );
      fetchRowDetails(selectedRows[0].geofence, selectedRows[0].name);
      setGeofence(selectedRows[0].geofence);
      setCenterPoint(selectedRows[0].centerPoint);
    },
  };
  return (
    <div>
      {/* ++++++++++++++++++SEARCH BOX+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      {/* <Row>
        <Col>
          <Tooltip placement='bottomLeft' title='search for missions'>
            <Search
              placeholder='input search text'
              allowClear
              onSearch={onSearch}
              style={{ width: "20rem", margin: "0 10px" }}
            />
          </Tooltip>
        </Col>
      </Row> */}
      {/* +++++++++++++++++++++++++++++++++MISION LISTING+++++++++++++++++++++++++++++++++++++++++ */}
      <Row style={{ marginTop: "1rem" }}>
        <Col span={16}>
          <Table
            columns={columns}
            rowSelection={{ type: "radio", ...rowSelection }}
            dataSource={locationData}
            loading={isTableLoading}
          />
        </Col>
        <Col span={8}>
          <div>
            <Card bordered={true} style={{ width: "100%" }}>
              <img
                src={
                  geofence.length > 0
                    ? `https://maps.googleapis.com/maps/api/staticmap?center=${
                        centerPoint.lat
                          ? centerPoint.lat
                          : data[0].centerPoint.lat
                      },${
                        centerPoint.long
                          ? centerPoint.long
                          : data[0].centerPoint.long
                      }&zoom=15&size=800x400&markers=size:mid|color:red|${
                        centerPoint.lat
                          ? centerPoint.lat
                          : data[0].centerPoint.lat
                      },${
                        centerPoint.long
                          ? centerPoint.long
                          : data[0].centerPoint.long
                      }&path=color:0x00B3FF|weight:5|fillcolor:0xcfe1ff${formatGeoFenceForUrl(
                        geofence.length > 0 ? geofence : data[0].geofence
                      )}&maptype=roadmap&key=AIzaSyCYWROYTFQ3XH4bhhLJnmJSV-0k9a-PHY8`
                    : AloneLogo
                }
                style={{
                  width: geofence.length > 0 ? "100%" : "60%",
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
              {geofence.length > 0 ? null : (
                <p style={{ textAlign: "center" }}>
                  Please Select a location to view
                </p>
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default connect(() => {}, {
  setEditLocation,
  loading,
  logout,
})(DataLocation);
