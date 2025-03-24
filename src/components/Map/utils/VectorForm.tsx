import React, { useState, useEffect, useContext } from "react";

import {
  Row,
  Col,
  Button,
  Drawer,
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
  PlusOutlined,
  DownOutlined,
  SaveOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { SketchPicker } from "react-color";
import apis from "../../../services/apis";
import http from "../../../services/httpCall";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { API_URL } from "src/constants";
import { featureType, featureTypes, vectorProps } from "src/static/vectorprops";
import { ILayer } from "src/types/layer";
import { Components } from "src/handlers/schema";
import { Feature, GeoJson, Properties } from "src/types/geojson";
import { AuthContext } from "src/services/authUtils";

const { TextArea } = Input;

interface IVectorFormProps {
  visible: boolean;
  setVisible: (b: boolean) => void;
  mode: string;
  vectorLayers: ILayer[];
  features: {
    type: string;
    features: Feature<any, Properties>[];
  };
  missionId: string;
  loading: (b: boolean) => void;
  isBaseMap: boolean;
  setIsDrawing: (b: boolean) => void;
  forceUpdateLayers: (id: string) => void;
  setShowForm: (b: boolean) => void;
  addLayer: (l: any) => void;
  updateLayerDataAfterEditing: (...args: any) => void;
  setShouldAttributeTableReload: (b: boolean) => void;
  shouldAttributeTableReload: boolean;
}

interface ILayerNameAutoCompleteOptions {
  id: string;
  value: string;
  label: string;
  layerpath: string;
  vectorId: vectorProps;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: "text";
  record: Item;
  index: number;
  children: React.ReactNode;
}

interface Item {
  id: string;
  key: string;
  value: string;
}

function VectorForm(props: Readonly<IVectorFormProps>) {
  const [data, setData] = useState<
    { id: string; key: string; value: string }[]
  >([]);
  const [count, setCount] = useState(0);
  const [editingKey, setEditingKey] = useState("");

  const [layerName, setLayerName] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [open, setopen] = useState(false);
  const [color, setColor] = useState("#000000");
  const [cascaderOptions, setCascaderOptions] = useState<
    { value: string; label: string; children: any[] }[]
  >([]);
  const [layerNames, setLayerNames] = useState<ILayerNameAutoCompleteOptions[]>(
    []
  );
  const [vectorId, setVectorId] = useState<vectorProps | null>(null);
  const [form] = Form.useForm();
  const [defaultVectorType, setDefaultVectorType] =
    useState<[string, vectorProps]>();

  const { logout } = useContext(AuthContext);

  const onClose = () => {
    props.setVisible(false);
    setTimeout(() => {
      props.setShowForm(false);
    }, 150);
  };

  const getCascaderOptions = (fType: featureTypes) => {
    let label: string;
    if (fType === featureTypes.MULTI_POLYGON) label = "Area";
    else if (fType === featureTypes.MULTI_LINE_STRING) label = "Line";
    else label = "Marker";
    return {
      value: fType,
      label,
      children: Object.keys(featureType)
        .filter((p) => featureType[p] === fType)
        .map((p) => ({ label: p, value: p })),
    };
  };

  const insertLayers = (type: featureTypes) => {
    return props.vectorLayers
      .filter((layer) => featureType[layer.vector] === type)
      .map((layer) => ({
        id: layer._id,
        value: layer.name,
        label: layer.name,
        layerpath: layer.layerpath,
        vectorId: layer.vector,
      }));
  };

  useEffect(() => {
    let fType: featureTypes;
    switch (props.mode) {
      case "PolygonView":
        setDefaultVectorType(["Area", vectorProps.MEASUREMENT]);
        setVectorId(vectorProps.MEASUREMENT);
        fType = featureTypes.MULTI_POLYGON;
        break;
      case "LineView":
        setDefaultVectorType(["Line", vectorProps.BOUNDARY_WALL]);
        setVectorId(vectorProps.BOUNDARY_WALL);
        fType = featureTypes.MULTI_LINE_STRING;
        break;
      default:
        setDefaultVectorType(["Marker", vectorProps.ELECTRIC_POLE]);
        setVectorId(vectorProps.ELECTRIC_POLE);
        fType = featureTypes.POINT;
        break;
    }
    setCascaderOptions([getCascaderOptions(fType)]);
    if (props.vectorLayers) setLayerNames(insertLayers(fType));
  }, [props.mode, props.vectorLayers]);

  const changeLayerType = (value: (string | number)[]) => {
    setVectorId(value[1] as vectorProps);
  };

  const onSelect = async (
    data: string,
    option: ILayerNameAutoCompleteOptions
  ) => {
    console.log(option);
    setVectorId(option.vectorId);
    setLayerName(data);
    setId(option.id);

    try {
      const data = await fetch(`${API_URL}${option.layerpath}`, {
        method: "GET",
      });

      const layerData = (await data.json()) as GeoJson;

      addExistingAttributes(layerData.features[0].properties);
    } catch (err: any) {
      await message.error(err.message);
    }

    setopen(false);
  };

  const onChange = (data: string) => {
    setId(null);
    setLayerName(data);
  };

  const filterOption = (
    inputValue: string,
    option?: ILayerNameAutoCompleteOptions
  ) => {
    if (inputValue && option) return option.value.startsWith(inputValue);
    return false;
  };

  const onDescriptionChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    setDescription(e.target.value);
  };

  const handleChangeComplete = (color) => {
    setColor(color.hex);
  };

  const handleChange = (color) => {
    setColor(color.hex);
  };

  const handleAdd = () => {
    const newData: Item = {
      id: String(count),
      key: `Key ${count + 1}`,
      value: "",
    };
    setData([...data, newData]);
    setCount(count + 1);
  };

  const addExistingAttributes = (properties: Properties) => {
    const keysToIgnore = ["color", "Id", "description", "icon"];
    const newData = Object.keys(properties)
      .filter((key) => !keysToIgnore.includes(key))
      .map((key, idx) => ({
        id: String(idx),
        key: key,
        value: "",
      }));

    setCount(newData.length + 1);

    setDescription(properties.description ?? "");
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

  const edit = (record: { key: React.Key }) => {
    form.setFieldsValue({ label: "", value: "", ...record });
    setEditingKey(String(record.key));
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

  const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
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
            <Button
              type="text"
              href="javascript:;"
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
            >
              <SaveOutlined style={{ color: "green" }} />
            </Button>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Button type="text">
                <CloseOutlined style={{ color: "red" }} />
              </Button>
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
              <Button type="text">
                <DeleteOutlined style={{ color: "red" }} />
              </Button>
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

    const featureData = { ...props.features };

    console.log(featureData);

    if (description)
      featureData.features[0].properties["description"] = description;
    featureData.features[0].properties["color"] = color;

    data.forEach((element) => {
      const k = element["key"];
      featureData.features[0].properties[k] = element["value"];
    });

    if (!id) {
      if (!vectorId) {
        message.error("Please select the vector type");
        return;
      }

      //setting layericon
      //setting layer icon
      if (vectorId === vectorProps.OVER_HEAD_TANK) {
        featureData.features[0].properties["icon"] = "TankIcon";
      } else {
        featureData.features[0].properties["icon"] = "MarkerIcon";
      }

      let payload: any = {};
      if (props.isBaseMap) {
        payload = {
          name: layerName,
          vectorType: vectorId,
          geoJSON: featureData,
        };
      } else {
        payload = {
          name: layerName,
          vectorType: vectorId,
          missionId: props.missionId,
          geoJSON: featureData,
        };
      }
      props.loading(true);
      http
        .post<Components["schemas"]["CreateBaseVectorLayerResponse"]>(
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
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          props.loading(false);
          props.setVisible(false);
          setTimeout(() => {
            props.setShowForm(false);
          }, 150);
        });
    } else {
      if (vectorId === vectorProps.OVER_HEAD_TANK) {
        featureData.features[0].properties["icon"] = "TankIcon";
      } else {
        featureData.features[0].properties["icon"] = "MarkerIcon";
      }
      const reqData = {
        id: id,
        feature: featureData.features[0],
      };
      props.loading(true);
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
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          props.loading(false);
          props.setVisible(false);
          props.setIsDrawing(false);
          setTimeout(() => {
            props.setShowForm(false);
          }, 150);
          setId(null);
          setVectorId(null);
        });
    }
  };

  return (
      <Drawer
        title={null}
        width={600}
        onClose={onClose}
        open={props.visible}
        bodyStyle={{ paddingBottom: 80, overflow: "auto" }}
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
          {defaultVectorType?.length && !id && (
            <Row>
              <Col span={4}>
                <h2>Save As</h2>
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
  );
}

export default VectorForm;
