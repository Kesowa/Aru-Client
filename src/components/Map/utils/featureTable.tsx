import React, { useState, useEffect, useContext } from "react";
import { FlyToInterpolator } from "deck.gl";
import {
  Typography,
  Table,
  Button,
  Form,
  Input,
  Popconfirm,
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
import * as turf from "@turf/turf";
import { AuthContext } from "src/services/authUtils";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
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
  const initialValue = record ? record[dataIndex] : undefined;
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

interface FeatureTableProps {
  contentHeight?: string;
  tableData: any[];
  total: number;
  page: number;
  setPage: (number) => void;
  limit: number;
  setLimit: (number) => void;
  id: string;
  canEditGeojson: boolean;
  canDeleteFeature: boolean;
  flaggedFilter: boolean;
  unflaggedFilter: boolean;
  allLayers: any;
  updateFeatureCountInLayers: (count: number, id: string) => void;
  setshowSelectedIndexes: (values: number[]) => void;
  setKey: (key: string) => void;
  setSelectedIndexes: (values: number[]) => void;
  setSelectedFeatures: (features: any[]) => void;
  setViewport: (viewport: any) => void;
  refreshLayer: boolean;
  setRefreshLayer: (refresh: boolean) => void;
  shouldAttributeTableReload: boolean;
  setShouldAttributeTableReload: (reload: boolean) => void;
}

const FeatureTable: React.FC<FeatureTableProps> = (props) => {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [tableData, setTableData] = useState<any>([]);
  const [data, setData] = useState<any>();
  const [editingKey, setEditingKey] = useState("");
  const [columns, setColumns] = useState<any>([]);
  const [contentHeight, setContentHeight] = useState(160);
  const [search, setSearch] = useState(false);
  const [selectedRowsArray, setSelectedRowsArray] = useState<React.Key[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const page = props.page;
  const setPage = props.setPage;
  const limit = props.limit;
  const setLimit = props.setLimit;
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  let searchInput: any;

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    if (props.contentHeight) {
      switch (props.contentHeight) {
        case "160px":
          setContentHeight(160);
          break;
        case "460px":
          setContentHeight(440);
          break;
        case "340px":
          setContentHeight(400);
          break;
        case "610px":
          setContentHeight(590);
          break;
        case "750px":
          setContentHeight(750);
          break;
      }
    }
  }, [props.contentHeight]);

  useEffect(() => {
    const obj: any = props.tableData.map((i, index) => ({
      ...i.properties,
      featureIndex: (props.page - 1) * props.limit + index,
      key: index,
      coordinates: [...i.geometry.coordinates],
      type: i.geometry.type,
      index: i.index,
    }));
    setCount(props.total);
    setData(obj);
  }, [props.tableData]);

  useEffect(() => {
    if (data) formTable();
  }, [data, editingKey]);

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
    setIsTableLoading(true);
    const range: any = [];
    range.push(values.lower);
    range.push(values.upper);
    const body = {
      id: props.id,
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
          }
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, logout);
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
          }
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, logout);
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
      const features = selectedRows.map(({ type, coordinates }) => ({ geometry: { type, coordinates } }));
      console.log(index);
      props.setSelectedIndexes(index);
      props.setSelectedFeatures(features);
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
        AxiosErrorHandler(err, logout);
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
              onClick={() => handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
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
                onClick={() => handleReset(clearFilters)}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
            </Space>
          </Form>
        </div>
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
      const initialProperties = props.tableData[key].properties;
      const properties = {
        ...initialProperties,
        ...obj,
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
          AxiosErrorHandler(err, logout);
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
        width: 8 * 15, // 15 is experimental constant, selected after checking for responsiveness across various bottom bar heights
      },
      {
        title: "Color",
        dataIndex: "color",
        width: 5 * 15, // 15 is experimental constant, selected after checking for responsiveness across various bottom bar heights
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

    // ===== Calculating maxWidth of each column based on lengths of content and headings of the column,
    // and then mapping the length to corresponding size by multiplying with a constant (experimentally determined) =====

    const maxWidths: { [key: string]: number } = {};

    for (const d of data) {
      for (const key in d) {
        maxWidths[key] = Math.max(key.length, String(d[key]).length);
      }
    }

    // ================================================================================================

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
          width: maxWidths[key] * 15, // 15 is experimental constant, selected after checking for responsiveness across various bottom bar heights
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
    }

    if (props.canEditGeojson || props.canDeleteFeature) {
      columns.push({
        title: "Actions",
        fixed: "right",
        width: 7 * 20, // 20 is experimental constant, selected after checking for responsiveness across various bottom bar heights
        dataIndex: "operation",
        render: (_: any, record) => {
          const editable = isEditing(record);
          return editable ? (
            <span>
              <Button
                type="link"
                size="small"
                onClick={() => save(record.key, record.featureIndex)}
                icon={<SaveOutlined />}
              ></Button>
              <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                <Button type="link" size="small" icon={<CloseOutlined />} />
              </Popconfirm>
            </span>
          ) : (
            <>
              {props.canEditGeojson && (
                <Button
                  type="link"
                  size="small"
                  disabled={editingKey !== ""}
                  onClick={() => edit(record)}
                  icon={<EditOutlined />}
                />
              )}
              {props.canDeleteFeature && (
                <Popconfirm
                  title="Sure to delete?"
                  onConfirm={() => {
                    handleDelete(record.key);
                    deleteGeoJsonFeature(record.featureIndex);
                  }}
                >
                  <Button
                    type="link"
                    size="small"
                    disabled={editingKey !== ""}
                    icon={<DeleteOutlined />}
                  />
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
      onCell: (record: any) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <Form form={form} component={false}>
      <Table
        // size="small"
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        columns={mergedColumns}
        rowSelection={{
          type: "checkbox",
          ...rowSelection,
        }}
        dataSource={data}
        loading={isTableLoading}
        pagination={{
          total: count,
          pageSize: limit,
          current: page,
          onChange: (page, pageSize) => {
            setPage(page);
            setLimit(pageSize);
            props.setshowSelectedIndexes([]);
            props.setKey("");
            form1.resetFields();
          },
        }}
        scroll={{ x: "max-content", y: contentHeight * 0.75 }}
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              if (editingKey !== "") {
                event.stopPropagation();
              }
            },
          };
        }}
      />
    </Form>
  );
};

export default FeatureTable;
