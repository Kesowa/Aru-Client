import React, { useState, useEffect } from "react";
import { FlyToInterpolator } from "deck.gl";
import {
  Typography,
  Table,
  Button,
  Form,
  Input,
  Popconfirm,
  Pagination,
  Space,
  message,
  InputNumber,
  Row,
  Col,
} from "antd";
import {
  SaveOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import "../index.less";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { logout } from "../../../actions/authAction";
import { connect } from "react-redux";
import * as turf from "@turf/turf";
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "text";
  record: any;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = <Input size="small" />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const { Text } = Typography;

function FeatureTable(props) {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [tableData, setTableData] = useState<any>([]);
  const [data, setData] = useState<any>();
  const [editingKey, setEditingKey] = useState("");
  const [columns, setColumns] = useState<any>([]);
  const [contentHeight, setContentHeight] = useState("160px");
  const [search, setSearch] = useState(false);
  const [selectedRowsArray, setSelectedRowsArray] = useState<React.Key[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [page, setPage] = useState(props.page);
  const [limit, setLimit] = useState(props.limit);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  let searchInput: any;

  useEffect(() => {
    if (props.contentHeight) {
      switch (props.contentHeight) {
        case "160px":
          setContentHeight("160px");
          break;
        case "460px":
          setContentHeight("440px");
          break;
        case "340px":
          setContentHeight("400px");
          break;
        case "610px":
          setContentHeight("590px");
          break;
        case "750px":
          setContentHeight("750px");
          break;
      }
    }
  }, [props.contentHeight]);

  useEffect(() => {
    const obj: any = [];
    console.log(props.tableData);
    props.tableData.map((i, index) =>
      obj.push({
        ...i.properties,
        featureIndex: (props.page - 1) * props.limit + index,
        key: index,
        coordinates: [...i.geometry.coordinates],
        type: i.geometry.type,
        index: i.index,
      })
    );
    setCount(props.total);
    setData(obj);
  }, [props.tableData]);

  useEffect(() => {
    if (data) formTable();
  }, [data, editingKey, props.pointMarkerColour]);

  const setPaginationPage = (page) => {
    setPage(page);
  };

  const setPageLimit = (currPage, limit) => {
    setPage(currPage);
    setLimit(limit);
  };

  //-------------------------------Filter Layer By Range----------------------------------------
  const onFinish = async (values: any, key: any) => {
    console.log(values, key);
    // form1.resetFields();
    setIsTableLoading(true);
    const range: any = [];
    range.push(values.lower);
    range.push(values.upper);
    const body = {
      id: props.id,
      // page: page - 1,
      // limit: limit,
      key: key,
      range: range,
    };
    console.log(body);
    http
      .patch(`${apis.GET_FEATURE_BY_LAYER}`, body)
      .then((res) => {
        console.log(res);
        if (res.data.data) {
          setSearch(true);
          const obj: any = [];
          if (res.data.data) {
            res.data.data.map((i, index) => {
              obj.push({
                ...i.properties,
                featureIndex: index,
                key: index,
                coordinates: [...i.geometry.coordinates],
                type: i.geometry.type,
                index: i.index,
              });
            });
            console.log(obj);
            props.updateFeatureCountInLayers(res.data.count, props.id);
            props.setshowSelectedIndexes([values.lower, values.upper]);
            props.setKey(key);
            setTableData(obj);
            //message.success(res.data.message);
          }
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setIsTableLoading(false);
        console.log(data);
        console.log(tableData);
      });
  };

  const onSearch = (key, value) => {
    setIsTableLoading(true);
    const payload: any = {
      id: props.id,
      key: key,
      value: value,
      // page: page - 1,
      // limit: limit,
    };
    http
      .patch(`${apis.GET_FEATURE_BY_LAYER}`, payload)
      .then((res) => {
        console.log(res);
        if (res.data.data) {
          setSearch(true);
          const obj: any = [];
          if (res.data.data) {
            res.data.data.map((i, index) => {
              obj.push({
                ...i.properties,
                featureIndex: index,
                key: index,
                coordinates: [...i.geometry.coordinates],
                type: i.geometry.type,
                index: i.index,
              });
            });
            props.updateFeatureCountInLayers(res.data.count, props.id);
            console.log(obj);
            setTableData(obj);
            //message.success(res.data.message);
          }
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setIsTableLoading(false);
        console.log(data);
        console.log(tableData);
      });
  };

  //--------------------------------------------
  //------------listen default row selection change------------------
  useEffect(() => {
    setSelectedRowsArray(props.defaultKeys);
  }, [props.defaultKeys]);

  const rowSelection = {
    selectedRowKeys: selectedRowsArray,
    onChange: (selectedRowKeys: React.Key[], selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        `count: ${selectedRowKeys.length}`
      );
      setSelectedRowsArray(selectedRowKeys);
      const index = selectedRows.map((row) => {
        console.log("row:", row);
        return row.index; // changed featureindex to index
      });
      console.log(index);
      props.setSelectedIndexes(index);
    },
  };

  const deleteGeoJsonFeature = (index) => {
    http
      .delete(`${apis.DELETE_GEOJSON_FEATURE}`, {
        data: {
          id: props.id,
          featureIndex: index,
        },
      })
      .then((res) => {
        console.log(res);
        setCount(count - 1);
        message.success(res.data.message);
        props.setRefreshLayer(!props.refreshLayer);
        props.setShouldAttributeTableReload(!props.shouldAttributeTableReload);
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      });
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <>
        {/* {isFiltering ? ( */}
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
            onPressEnter={() => {
              onSearch(dataIndex, selectedKeys[0]);
              handleSearch(selectedKeys, confirm, dataIndex);
            }}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => {
                handleSearch(selectedKeys, confirm, dataIndex);
                console.log(selectedKeys, dataIndex);
                onSearch(dataIndex, selectedKeys[0]);
              }}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => {
                handleReset(clearFilters);
                setSearch(false);
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
        {/*  ) : ( */}
        <div style={{ padding: 8 }}>
          <Form
            form={form1}
            onFinish={(e) => {
              onFinish(e, dataIndex);
            }}
          >
            <Row>
              <Col style={{ marginRight: "10px" }}>
                <Form.Item name="lower" rules={[{ required: true }]}>
                  <InputNumber placeholder="Lower Value" />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="upper" rules={[{ required: true }]}>
                  <InputNumber placeholder="Upper Value" />
                </Form.Item>
              </Col>
            </Row>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<FilterOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Filter
              </Button>
              <Button
                onClick={() => {
                  handleReset(clearFilters);
                  setSearch(false);
                }}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
            </Space>
          </Form>
        </div>
        {/* )} */}
      </>
    ),
    filterIcon: (filtered) => (
      <>
        <SearchOutlined
          onClick={() => setIsFiltering(false)}
          style={{ color: filtered ? "#1890ff" : undefined }}
        />
        <FilterOutlined
          onClick={() => setIsFiltering(true)}
          style={{ marginLeft: "5px", color: filtered ? "#1890ff" : undefined }}
        />
      </>
    ),
    // onFilter: (value: any, record: any) => true,
    // onFilterDropdownVisibleChange: (visible: any) => {
    //   if (visible) {
    //     setTimeout(() => searchInput.select());
    //   }
    // },
    // onFilter: (value, record) =>
    //   record[dataIndex]
    //     ? record[dataIndex]
    //         .toString()
    //         .toLowerCase()
    //         .includes(value.toLowerCase())
    //     : "",
    // onFilterDropdownVisibleChange: (visible) => {
    //   if (visible) {
    //     setTimeout(() => searchInput.select(), 100);
    //   }
    // },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    props.setshowSelectedIndexes([]);
    props.setKey("");
    form1.resetFields();
    props.updateFeatureCountInLayers(count, props.id);
    clearFilters();
    setSearchText("");
  };

  const handleDelete = (key: React.Key) => {
    console.log(key, data);
    const newData = data.filter((item) => item.key !== key);
    setData(newData);
    if (search) {
      const newData = tableData.filter((item) => item.key !== key);
      setTableData(newData);
    }
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: React.Key, featureIndex: any) => {
    try {
      const row = await form.validateFields();

      // Edit GeoJson
      const obj = { ...row };
      delete obj.key;
      delete obj.featureIndex;
      delete obj.index;
      const properties = {
        ...obj,
        color: props.tableData[key].properties.color,
        Id: props.tableData[key].properties.Id,
        icon: props.tableData[key].properties.icon,
      };
      const body = {
        id: props.id,
        featureIndex: featureIndex,
        feature: {
          type: props.tableData[key].type,
          properties: properties,
          geometry: props.tableData[key].geometry,
        },
      };
      console.log(body);

      http
        .patch(`${apis.EDIT_GEOJSON_FEATURE}`, body)
        .then((res) => {
          console.log(res.data);
          if (res.data.status) message.success(res.data.message);
          else message.error(res.data.message);
        })
        .catch((err) => {
          message.error(err.message);
          AxiosErrorHandler(err, props.logout);
        });

      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
      if (search) {
        const newData = [...tableData];
        const index = newData.findIndex((item) => key === item.key);
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...properties,
          });
          setTableData(newData);
          setEditingKey("");
        } else {
          newData.push(properties);
          setTableData(newData);
          setEditingKey("");
        }
      }
      //editGeoJsonFeature(featureIndex, key);
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const setAttributeCenter = (type, coordinates) => {
    let centerPoint;
    let isMercator = false;
    if (type === "MultiPolygon") {
      if (coordinates[0][0][0][0] > 100 || coordinates[0][0][0][1] > 100) {
        isMercator = true;
        console.log(
          "Ivalid coordinate system! \n The selected feature of layer is not in WGS84 coordinate system. Please upload a layer whose coordinate system is in WGS84!"
        );
      } else {
        const features = turf.points([...coordinates[0][0]]);
        centerPoint = turf.center(features);
        centerPoint = centerPoint.geometry.coordinates;
      }
    } else if (type === "MultiLineString") {
      if (coordinates[0][0][0] > 100 || coordinates[0][0][1] > 100) {
        isMercator = true;
        console.log(
          "Ivalid coordinate system! \n The selected feature of layer is not in WGS84 coordinate system. Please upload a layer whose coordinate system is in WGS84!"
        );
      } else {
        const features = turf.multiLineString([...coordinates]);
        centerPoint = turf.centroid(features).geometry.coordinates;
      }
    } else if (type === "Polygon") {
      const features = turf.points([...coordinates[0]]);
      //console.log(turf.point(turf.center(features).geometry.coordinates));
      centerPoint = turf.center(features);
      centerPoint = centerPoint.geometry.coordinates;
    } else if (type === "LineString") {
      const features = turf.lineString([...coordinates]);
      centerPoint = turf.center(features);
      centerPoint = centerPoint.geometry.coordinates;
    } else {
      if (coordinates[0] > 100 || coordinates[1] > 100) {
        isMercator = true;
        console.log(
          "Ivalid coordinate system! \n The selected feature of layer is not in WGS84 coordinate system. Please upload a layer whose coordinate system is in WGS84!"
        );
      } else {
        centerPoint = coordinates;
      }
    }

    if (!isMercator) {
      props.setViewport({
        longitude: centerPoint[0],
        latitude: centerPoint[1],
        zoom: 20,
        pitch: 0,
        minZoom: 0,
        maxZoom: 22,
        bearing: 0,
        transitionDuration: 2000,
        transitionInterpolator: new FlyToInterpolator(),
      });
    }
  };

  const [record, setRecord] = useState(null);

  const setHighlightIndex = (record: any) => {
    const key = record.key;
    const index = record.featureIndex;

    const f = selectedRowsArray.filter((g) => g === key);

    if (!f.length) {
      setSelectedRowsArray([...selectedRowsArray, key]);
    }

    const k = props.selectedIndexes.filter((i) => i === index);

    if (k.length === 0) {
      const g = [...props.selectedIndexes, index];
      props.setSelectedIndexes(g);
    }

    setTimeout(() => {
      setAttributeCenter(record.type, record.coordinates);
    }, 100);
    setRecord(null);
  };

  useEffect(() => {
    if (record) {
      setHighlightIndex(record);
    }
  }, [record]);

  const formTable = () => {
    const columns: any = [];

    columns.push(
      {
        title: "F. Index",
        dataIndex: "index",
      },
      {
        title: "Color",
        dataIndex: "color",
        render: (color) => (
          <div
            style={{
              height: "20px",
              width: "20px",
              background: color,
            }}
          ></div>
        ),
      }
    );

    const p = data[0];
    for (const key in data[0]) {
      if (
        p.hasOwnProperty(key) &&
        key != "color" &&
        key != "Id" &&
        key != "featureIndex" &&
        key != "index" &&
        key != "key" &&
        key != "icon" &&
        key != "coordinates" &&
        key != "type" &&
        key != "Nth" &&
        key != "sys_id"
      ) {
        columns.push({
          title: key,
          dataIndex: key,
          editable: true,
          ...getColumnSearchProps(key),
          render: (name, record) => (
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                setRecord(record);
              }}
            >
              {name}
            </span>
          ),
        });
      }
      // if(key == "Nth"){
      //   columns.push({
      //     title: key,
      //     dataIndex: key,
      //     editable: false,
      //     render: (name, record) => (
      //       <>
      //         {Object.keys(name).map(function(key, index) {
      //           console.log("Hose Halapino",key, index);
      //         })}
      //       </>
      //     ),
      //   });
      // }
    }

    if (props.canEditGeojson || props.canDeleteFeature) {
      columns.push({
        title: "Actions",
        fixed: "right",
        dataIndex: "operation",
        render: (_: any, record) => {
          const editable = isEditing(record);
          return editable ? (
            <span>
              <a
                href="javascript:;"
                onClick={() => {
                  save(record.key, record.index);
                }}
                style={{ marginRight: 8 }}
              >
                <SaveOutlined style={{ color: "green" }} />
              </a>
              <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                <a>
                  <CloseOutlined style={{ color: "red" }} />
                </a>
              </Popconfirm>
            </span>
          ) : (
            <>
              {props.canEditGeojson && (
                <Typography.Link
                  disabled={editingKey !== ""}
                  onClick={() => {
                    edit(record);
                  }}
                >
                  <EditOutlined style={{ marginRight: 8 }} />
                </Typography.Link>
              )}
              {props.canDeleteFeature && (
                <Popconfirm
                  title="Sure to delete?"
                  onConfirm={() => {
                    handleDelete(record.key);
                    deleteGeoJsonFeature(record.index);
                  }}
                >
                  <a>
                    <DeleteOutlined style={{ color: "red" }} />
                  </a>
                </Popconfirm>
              )}
            </>
          );
        },
      });
    }
    setColumns(columns);
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const table = (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ marginLeft: "60px" }}>
              <Space direction="vertical" size={4}>
                {Object.keys(record.Nth).map(function (key, index) {
                  return (
                    <Space
                      direction="horizontal"
                      style={{
                        fontSize: "12px",
                      }}
                      wrap
                    >
                      <span> &#8226; </span>
                      <Text strong>{key}:</Text>
                      <Text>{record.Nth[key]}</Text>
                    </Space>
                  );
                })}
              </Space>
            </div>
          ),
          rowExpandable: (record) => record.Nth,
        }}
        rowKey={(record) => {
          //console.log(record.Nth);
          return record.key;
        }}
        columns={mergedColumns}
        dataSource={search ? tableData : data}
        loading={isTableLoading}
        pagination={false}
        rowSelection={{
          type: "checkbox",
          ...rowSelection,
        }}
        size="small"
        rowClassName={(record: any) => {
          return props.flaggedFilter
            ? "flagged-row"
            : props.unflaggedFilter
            ? "unflagged-row"
            : props?.allLayers[`1-${props.id}`]?.flaggedFeatures?.includes(
                record.index
              )
            ? "flagged-row"
            : "unflagged-row";
        }}
        //scroll={{ x: 1100, y: 355 }}
        style={{
          // maxHeight: props.contentHeight,
          height: "calc(100% - 30px)",
          marginBottom: "5px",
          overflowY: "scroll",
        }}
      />
      <Pagination
        style={{
          // maxHeight: props.contentHeight,
          display: "flex",
          justifyContent: "end",
          height: "30px",
        }}
        total={search ? tableData.length : props.total}
        showSizeChanger={false}
        pageSize={search ? limit : props.limit}
        onShowSizeChange={search ? setPageLimit : props.setPageLimit}
        current={search ? page : props.page}
        onChange={search ? setPaginationPage : props.setPaginationPage}
        size={"small"}
      />
    </Form>
  );

  return table;
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { logout })(FeatureTable);
