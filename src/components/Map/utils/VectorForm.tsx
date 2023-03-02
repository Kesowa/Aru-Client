import React, { useState, useEffect, useRef } from "react";

import {
  Row,
  Col,
  Button,
  Drawer,
  Select,
  AutoComplete,
  Input,
  Table,
  Form,
  Popconfirm,
  Cascader,
  Typography,
  message,
} from "antd";
import {
  FieldTimeOutlined,
  CalendarOutlined,
  PlusOutlined,
  DownOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { SketchPicker } from "react-color";
import apis from "../../../services/apis";
import http from "../../../services/httpCall";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { logout } from "../../../actions/authAction";
import { connect } from "react-redux";
import { API_URL } from "src/constants";

const { TextArea } = Input;

const originData = [];

const layerTypes: any = [
  {
    value: "MultiLineString",
    label: "Line",
    children: [],
  },
  {
    value: "MultiPolygon",
    label: "Area",
    children: [],
  },
  {
    value: "Point",
    label: "Marker",
    children: [],
  },
];

function VectorForm(props) {
  const [isAttTableVisible, setIsAttrTableVisible] = useState(false);
  const [data, setData] = useState<any>(originData);
  const [count, setCount] = useState(0);
  const [editingKey, setEditingKey] = useState("");
  const [layerType, setLayerType] = useState("");
  const [layerTypeId, setLayerTypeId] = useState("");
  const [layerName, setLayerName] = useState("");
  const [id, setId] = useState("");
  const [description, setDescription] = useState("");
  const [open, setopen] = useState(false);
  const [color, setColor] = useState("#000000");
  const [cascaderOptions, setCascaderOptions] = useState<any>([]);
  const [layerNames, setLayerNames] = useState([]);
  const [vectorId, setVectorId] = useState("");
  const [form] = Form.useForm();
  const [defaultVectorType, setDefaultVectorType] = useState<any>([]);

  const onClose = () => {
    props.setVisible(false);
    setTimeout(() => {
      props.setShowForm(false);
    }, 150);
  };

  useEffect(() => {
    let coptions: any;
    if (props.vectorProps) {
      switch (props.mode) {
        case "PolygonView":
          setDefaultVectorType(["Area", "Measurement"]);
          coptions = { ...layerTypes[1] };
          break;
        case "LineView":
          setDefaultVectorType(["Line", "Boundary Wall"]);
          coptions = { ...layerTypes[0] };
          break;
        default:
          setDefaultVectorType(["Marker", "Electric Pole"]);
          coptions = { ...layerTypes[2] };
          break;
      }

      props.vectorProps.forEach((vectorProp) => {
        if (props.mode === "PolygonView" && vectorProp.name === "Measurement") {
          setVectorId(vectorProp._id);
        } else if (
          props.mode === "LineView" &&
          vectorProp.name === "Boundary Wall"
        ) {
          setVectorId(vectorProp._id);
        } else if (
          props.mode === "PointView" &&
          vectorProp.name === "Electric Pole"
        ) {
          setVectorId(vectorProp._id);
        }

        if (vectorProp.type == coptions.value) {
          coptions.children.push({
            label: vectorProp.name,
            value: vectorProp._id,
          });
        }
      });
    }

    setCascaderOptions([coptions]);
  }, [props.vectorProps, props.mode]);

  useEffect(() => {
    if (props.vectorLayers) {
      const options: any = [];

      const insertLayers = (vectorLayers, type) => {
        vectorLayers.forEach((layer) => {
          if (type === layer.vector.type) {
            options.push({
              value: layer.name,
              label: layer.name,
              id: layer._id,
              layerpath: layer.layerpath,
              vectorId: layer.vector._id,
            });
          }
        });
      };

      switch (props.mode) {
        case "PolygonView":
          insertLayers(props.vectorLayers, "MultiPolygon");
          break;
        case "LineView":
          insertLayers(props.vectorLayers, "MultiLineString");
          break;
        case "PointView":
          insertLayers(props.vectorLayers, "Point");
      }

      setLayerNames(options);
    }
  }, [props.vectorLayers]);

  const changeLayerType = (value) => {
    setVectorId(value[1]);
  };

  const onSelect = async (data, option) => {
    console.log(option);
    setVectorId(option.vectorId);
    setLayerName(data);
    setId(option.id);

    try {
      const data = await fetch(`${API_URL}${option.layerpath}`, {
        method: "GET",
      });

      const layerData = await data.json();

      addExistingAttributes(layerData.features[0].properties);
    } catch (err: any) {
      message.error(err.message);
    }

    setopen(false);
  };

  const onChange = (data) => {
    setId("");
    setLayerName(data);
  };

  const filterOption = (inputValue, option) => {
    if (!inputValue) return option;
    return option.value.startsWith(inputValue);
  };

  const onDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleChangeComplete = (color) => {
    setColor(color.hex);
  };

  const handleChange = (color, event) => {
    setColor(color.hex);
  };

  const handleAdd = () => {
    const newData: Item = {
      id: count,
      key: `Key ${count + 1}`,
      value: "",
    };
    setData([...data, newData]);
    setCount(count + 1);
  };

  const addExistingAttributes = (properties: any) => {
    const newData: any = [];
    Object.keys(properties).forEach((key: any, i: any) => {
      if (
        key !== "color" &&
        key !== "Id" &&
        key !== "description" &&
        key !== "icon"
      ) {
        newData.push({
          id: newData.length,
          key: key,
          value: "",
        });
      }
      setCount(newData.length + 1);
    });

    setDescription(properties.description);
    setData(newData);
  };

  const isEditing = (record: Item) => record.key === editingKey;

  const cancel = () => {
    setEditingKey("");
  };

  const handleDelete = (key: React.Key) => {
    const newData = data.filter((item) => item.key !== key);
    setData(newData);
    setCount(count - 1);
  };

  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({ label: "", value: "", ...record });
    setEditingKey(record.key);
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as Item;

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
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: "text";
    record: Item;
    index: number;
    children: React.ReactNode;
  }

  interface Item {
    id: any;
    key: any;
    value: any;
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
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${dataIndex}!`,
              },
            ]}
          >
            <Input />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const columns = [
    {
      title: "Key",
      dataIndex: "key",
      width: "35%",
      editable: true,
    },
    {
      title: "Value",
      dataIndex: "value",
      width: "35%",
      editable: true,
    },
    {
      title: "Actions",
      dataIndex: "operation",
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a
              href="javascript:;"
              onClick={() => save(record.key)}
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
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
            >
              <EditOutlined style={{ marginRight: 8 }} />
            </Typography.Link>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record.key)}
            >
              <a>
                <DeleteOutlined style={{ color: "red" }} />
              </a>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const createLayer = () => {
    if (!layerName) {
      message.error("Please fill all fields");
      return;
    }
    props.loading(true);

    const featureData = { ...props.features };

    console.log(featureData);

    if (description)
      featureData.data.features[0].properties["description"] = description;
    featureData.data.features[0].properties["color"] = color;

    data.forEach((element) => {
      const k = element["key"];
      featureData.data.features[0].properties[k] = element["value"];
    });

    if (!id) {
      if (!vectorId) {
        message.error("Please select the vector type");
        return;
      }

      //setting layericon
      //setting layer icon
      switch (vectorId) {
        case "60c3a22aca0cbe039fce0d57": //------------verheadtank
          featureData.data.features[0].properties["icon"] = "TankIcon";
          break;
        case "60c3a1e2ca0cbe039fce0d54": //------------PumpingStation
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a21dca0cbe039fce0d56": //------------Drainage Pumping Station
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a269ca0cbe039fce0d59": //------------Electric Pole
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a2d8ca0cbe039fce0d5b": //------------Electric Transformer
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a316ca0cbe039fce0d5d": //------------Street Light
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a349ca0cbe039fce0d5e": //------------Traffic Square
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a363ca0cbe039fce0d5f": //------------Fire Station
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a372ca0cbe039fce0d60": //------------Cellphone Tower
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a39eca0cbe039fce0d62": //------------Manhole
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a3b4ca0cbe039fce0d63": //------------Garbage Collection Point
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a3c5ca0cbe039fce0d64": //------------Landmark
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a42dca0cbe039fce0d67": //------------Public Convenience
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a464ca0cbe039fce0d6a": //------------Cycle Stand
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a542ca0cbe039fce0d74": //------------Mobile Drone port
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a551ca0cbe039fce0d75": //------------PotHoles
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        default:
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
      }
      let payload: any = {};
      if (props.isBaseMap) {
        payload = {
          name: layerName,
          vectorId: vectorId,
          geoJSON: featureData.data,
        };
      } else {
        payload = {
          name: layerName,
          vectorId: vectorId,
          missionId: props.missionId,
          geoJSON: featureData.data,
        };
      }
      http
        .post<components["schemas"]["CreateBaseVectorLayerResponse"]>(
          props.isBaseMap
            ? `${apis.CREATE_BASE_LAYER_FROM_DRAWING}`
            : `${apis.CREATE_VECTOR_LAYER}`,
          payload
        )
        .then((data) => {
          if (data.data.status) {
            props.addLayer(data.data.data);
            message.success("Vector layer created");
          } else {
            console.log(data);
            message.error("Layer could not be created");
          }
        })
        .catch((err) => {
          console.log(err);
          console.log(err.response?.data.messsage);
          message.error(err.message);
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          props.loading(false);
          props.setVisible(false);
          setTimeout(() => {
            props.setShowForm(false);
          }, 150);
        });
    } else {
      switch (vectorId) {
        case "60c3a22aca0cbe039fce0d57": //------------verheadtank
          featureData.data.features[0].properties["icon"] = "TankIcon";
          break;
        case "60c3a1e2ca0cbe039fce0d54": //------------PumpingStation
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a21dca0cbe039fce0d56": //------------Drainage Pumping Station
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a269ca0cbe039fce0d59": //------------Electric Pole
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a2d8ca0cbe039fce0d5b": //------------Electric Transformer
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a316ca0cbe039fce0d5d": //------------Street Light
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a349ca0cbe039fce0d5e": //------------Traffic Square
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a363ca0cbe039fce0d5f": //------------Fire Station
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a372ca0cbe039fce0d60": //------------Cellphone Tower
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a39eca0cbe039fce0d62": //------------Manhole
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a3b4ca0cbe039fce0d63": //------------Garbage Collection Point
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a3c5ca0cbe039fce0d64": //------------Landmark
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a42dca0cbe039fce0d67": //------------Public Convenience
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a464ca0cbe039fce0d6a": //------------Cycle Stand
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a542ca0cbe039fce0d74": //------------Mobile Drone port
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        case "60c3a551ca0cbe039fce0d75": //------------PotHoles
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
          break;
        default:
          featureData.data.features[0].properties["icon"] = "MarkerIcon";
      }
      const reqData = {
        id: id,
        feature: featureData.data.features[0],
      };

      http
        .patch(`${apis.ADD_FEATURE_TO_GEOJSON}`, reqData)
        .then((data) => {
          if (data.data.status) {
            message.success("Feature successfully added");
            props.updateLayerDataAfterEditing(data.data.data, null, null);
            props.forceUpdateLayers(id);
            props.setShouldAttributeTableReload(
              !props.shouldAttributeTableReload
            );
          } else {
            message.error("Feature could not be added");
          }
        })
        .catch((err) => {
          message.error(err.message);
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          props.loading(false);
          props.setVisible(false);
          props.setIsDrawing(false);
          setTimeout(() => {
            props.setShowForm(false);
          }, 150);
          setId("");
          setVectorId("");
        });
    }
  };

  return (
    <>
      <Drawer
        title={null}
        width={600}
        onClose={onClose}
        visible={props.visible}
        bodyStyle={{ paddingBottom: 80 }}
        mask={false}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button
              onClick={onClose}
              style={{
                marginRight: 8,
                background: "#F64225",
                color: "#ffffff",
                border: "none",
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => createLayer()} type="primary">
              Save
            </Button>
          </div>
        }
      >
        <div style={{ height: "50px" }}>
          {defaultVectorType.length && !id && (
            <Row>
              <Col span={4}>
                <h2>Save as</h2>
              </Col>
              <Col span={18}>
                <Cascader
                  options={cascaderOptions}
                  defaultValue={defaultVectorType}
                  placeholder={props.mode.split("").slice(0, -4).join("")}
                  onChange={changeLayerType}
                  style={{ width: "300px" }}
                  bordered={false}
                />
              </Col>
            </Row>
          )}
        </div>
        <Row gutter={[15, 15]}>
          <Col span={12}>
            <Row>
              <Col span={24} style={{ position: "relative" }}>
                <AutoComplete
                  options={layerNames}
                  style={{
                    width: "100%",
                  }}
                  onSelect={onSelect}
                  placeholder="Layer Name"
                  filterOption={filterOption}
                  open={open}
                  onSearch={onChange}
                />

                <DownOutlined
                  style={{
                    position: "absolute",
                    right: "20px",
                    top: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => setopen(!open)}
                />
                <TextArea
                  onChange={onDescriptionChange}
                  value={description}
                  autoSize={{ minRows: 13, maxRows: 13 }}
                  placeholder="Description"
                  style={{ marginTop: "10px" }}
                />
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <SketchPicker
              color={color}
              onChangeComplete={handleChangeComplete}
              onChange={handleChange}
              width={"250"}
            />
          </Col>
        </Row>
        <Row style={{ cursor: "pointer" }}>
          <h4>Add Attributes</h4>
        </Row>
        <React.Fragment>
          <Row>
            <Button
              onClick={handleAdd}
              type="primary"
              size="small"
              style={{ marginBottom: 8, float: "right" }}
            >
              <PlusOutlined />
            </Button>
          </Row>
          <Row>
            <Col span={24}>
              <Form form={form}>
                <Form.Item>
                  <Table
                    components={{
                      body: {
                        cell: EditableCell,
                      },
                    }}
                    bordered
                    dataSource={data}
                    columns={mergedColumns}
                    rowClassName="editable-row"
                    pagination={false}
                  />
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </React.Fragment>
      </Drawer>
    </>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { logout })(VectorForm);
