import React, { useState, useEffect } from "react";
import {
  Card,
  message,
  Typography,
  Row,
  Divider,
  Col,
  Button,
  Modal,
  Table,
  Form,
  Input,
  Popconfirm,
  Select,
  Cascader,
  DatePicker,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { logout } from "../../../actions/authAction";
import AloneLogo from "../../../static/Alone-rafiki.svg";
import moment from "moment";
import { connect } from "react-redux";


const { Text } = Typography;

type optionType = {
  value: any;
  label: any;
};

type optionType1 = {
  value: any;
  label: any;
  children: optionType[];
};

interface Item {
  id: any;
  key: any;
  value: any;
}

const originData = [
  {
    id: "0",
    key: "UIN",
    value: "",
  },
  {
    id: "1",
    key: "FCID",
    value: "",
  },
  {
    id: "2",
    key: "serialNo",
    value: "",
  },
];

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "text";
  record: Item;
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

function ModelCard(props) {
  const [selectedID, setSelectedID] = useState(null);
  const [data, setData] = useState<any>(null);
  const [isCardLoading, setIsCardLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState<any>([]);
  const [manufacturers, setManufacturers] = useState<any>([]);
  const [models, setModels] = useState<any>([]);
  const [manufacturingDate, setManufacturingDate] = useState<any>("");
  const [tableData, setTableData] = useState<any>("");
  const [modelInfo, setModelInfo] = useState<any>([]);

  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
    setTableData(modelInfo);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showModal2 = () => {
    setIsModalVisible2(true);
    setTableData(originData);
    setCount(3);
  };

  const handleOk2 = () => {
    setIsModalVisible2(false);
  };

  const handleCancel2 = () => {
    setIsModalVisible2(false);
    setCount(0);
  };

  const getModelDetails = (id) => {
    let model = props.models.filter((model) => {
      return model._id === id;
    });
    model = model[0];
    setData(model);
  };

  useEffect(() => {
    setIsCardLoading(true);
    setSelectedID(props.id);
    if (props.id) {
      http
        .get(`${apis.GET_MODEL_BY_ID}`, {
          params: {
            _id: props.id,
          },
        })
        .then((result) => {
          if (result.data.status) {
            setData(result.data.data);
          } else {
            message.error(result.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          setIsCardLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (selectedID === null) {
      setData(null);
    }
  }, [selectedID]);

  useEffect(() => {
    const obj: Array<any> = [];
    if (data) {
      setCount(0);
      Object.keys(data.props).map((key) => {
        const obj1 = {} as Item;
        obj1.key = key;
        obj1.id = count;
        obj1.value = data.props[key];
        setCount(count + 1);
        obj.push(obj1);
      });
    }
    setModelInfo(obj);
    setTableData(obj);
  }, [data]);

  const filter = (inputValue, path) => {
    return path.some(
      (option) =>
        option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
  };

  useEffect(() => {
    getOwner();
    getManufacturer();
    getModel();
  }, []);

  const modelOptions: Array<any> = [];

  const getOwner = () => {
    http
      .get(`${apis.FETCH_ALL_USERS_OF_TENANT}`)
      .then((result) => {
        if (result.data.status) {
          setUsers(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      });
  };

  const getManufacturer = () => {
    http
      .get(`${apis.GET_MANUFACTURERS}`)
      .then((result) => {
        if (result.data.status) {
          setManufacturers(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      });
  };

  const getModel = () => {
    http
      .get(`${apis.GET_MODELS}`)
      .then((result) => {
        if (result.data.status) {
          setModels(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      });
  };

  const getModelOptions = () => {
    manufacturers.map((manufacturer: any) => {
      const obj1 = {} as optionType1;
      obj1.value = manufacturer._id;
      obj1.label = manufacturer.name;
      obj1.children = [];
      models.map((model: any) => {
        if (model.manufacturerID._id == obj1.value) {
          const obj = {} as optionType;
          obj.value = model._id;
          obj.label = model.modelName;
          obj1.children.push(obj);
        }
      });
      modelOptions.push(obj1);
    });
  };

  if (manufacturers && models) {
    getModelOptions();
  }

  const [editingKey, setEditingKey] = useState("");

  const isEditing = (record: Item) => record.key === editingKey;

  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({ label: "", value: "", ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as Item;

      const newData = [...tableData];

      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setTableData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setTableData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const onFinish = async (values: any) => {
    form.resetFields();
    const modelProps = {};
    for (let i = 0; i < tableData.length; ++i) {
      modelProps[tableData[i].key] = tableData[i].value;
    }

    http
      .patch(`${apis.UPDATE_MODEL}`, {
        id: data._id,
        update: {
          props: modelProps,
        },
      })
      .then((result) => {
        if (result.data.status) {
          message.success(result.data.message);
          setData({
            ...data,
            props: modelProps,
          });
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        handleCancel();
      });
  };

  const onFinish2 = async (values: any) => {
    if (
      !manufacturingDate ||
      manufacturingDate === "" ||
      manufacturingDate === " "
    ) {
      message.error("Please select valid date");
      return;
    }

    form.resetFields();

    const assetInfo = {};
    for (let i = 0; i < tableData.length; ++i) {
      assetInfo[tableData[i].key] = tableData[i].value;
    }

    const asset = {
      assetName: values.name,
      userID: props.Auth.userid,
      assetInfo: [assetInfo],
      model: values.type[1],
      assetOwner: values.owner,
      manufactureDate: moment(manufacturingDate).format(
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
      ),
      manufacturerID: values.type[0],
    };

    http
      .post(`${apis.CREATE_ASSET}`, asset)
      .then((result) => {
        if (result.data.status) {
          message.success("Asset Created Successfully");
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        handleCancel2();
      });
  };

  const columns = [
    {
      title: "KEY",
      dataIndex: "key",
      width: "35%",
      editable: true,
    },
    {
      title: "VALUE",
      dataIndex: "value",
      width: "35%",
      editable: true,
    },
    {
      title: "ACTIONS",
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

  const handleDelete = (key: React.Key) => {
    const newData = tableData.filter((item) => item.key !== key);
    setTableData(newData);
    setCount(count - 1);
  };

  const handleAdd = () => {
    const newData: Item = {
      id: count,
      key: `Key ${count + 1}`,
      value: "",
    };
    setTableData([...tableData, newData]);
    setCount(count + 1);
  };

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

  let card = (
    <Card
      bordered={true}
      style={{ background: "#eceaea", padding: "20px", minHeight: "500px" }}
    >
      <img src={AloneLogo} alt="" />
      <p style={{ textAlign: "center" }}>Please Select a Model to View</p>
    </Card>
  );

  if (data) {
    card = (
      <Card
        loading={isCardLoading}
        style={{
          background: "#eceaea",
          padding: "10px",
          minHeight: "500px",
          position: "relative",
        }}
      >
        <Row>
          <Col span={12}>
            <Text
              style={{
                fontSize: "18px",
                marginTop: "20px",
                fontWeight: "bold",
              }}
            >
              {data.modelName}
            </Text>
          </Col>
          {props.showDate && (
            <Col span={12} style={{ display: "flex" }}>
              <Text
                type="secondary"
                style={{ fontSize: "12px", alignSelf: "flex-end" }}
              >
                created {moment(data.createdAt).format("DD/MM/YYYY")}
              </Text>
            </Col>
          )}
        </Row>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {data.manufacturerID.name}
        </Text>
        <Row style={{ marginTop: "10px" }}>
          <Col span={12}>
            <Text>Model No.</Text>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "12px" }}
            >
              {data.modelNumber}
            </Text>
          </Col>
          <Col span={12}>
            <Text>Asset Class</Text>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "12px" }}
            >
              {data.assetClassID.typeName}
            </Text>
          </Col>
        </Row>
        <Row style={{ marginTop: "10px" }}>
          <Col span={12}>
            <Text>Dimensions</Text>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "12px" }}
            >
              {data.dimensions.length}cm x {data.dimensions.breadth}cm x{" "}
              {data.dimensions.height}cm
            </Text>
          </Col>
          <Col span={12}>
            <Text>Created By</Text>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "12px" }}
            >
              {data.createdBy.name}
            </Text>
          </Col>
        </Row>
        <Divider />
        <Row
          style={{
            display: "flex",
            flexFlow: "row",
            justifyContent: "space-between",
          }}
        >
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Model Information
          </Text>
          <Button type="link" size="small" onClick={showModal}>
            View All
          </Button>
        </Row>
        <Row style={{ marginTop: "15px" }}>
          {Object.keys(data.props).map((key) => {
            return (
              <Col span={12} style={{ marginTop: "10px" }}>
                <Text>{key}</Text>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "12px" }}
                >
                  {data.props[key]}
                </Text>
              </Col>
            );
          })}
        </Row>
        {props.showDate && (
          <Row
            style={{
              position: "absolute",
              bottom: "20px",
            }}
          >
            <Col span={12}>
              <Button
                type="link"
                size="small"
                onClick={() => setSelectedID(null)}
              >
                CANCEL
              </Button>
            </Col>
            <Col span={12}>
              <Button
                onClick={showModal2}
                type="primary"
                size="middle"
                style={{
                  float: "right",
                  marginLeft: "100px",
                }}
              >
                Asset <PlusOutlined />
              </Button>
            </Col>
          </Row>
        )}

        <Modal
          title="Model Information"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            name="update_model"
            initialValues={{
              remember: true,
            }}
            requiredMark={false}
            id="myForm"
          >
            <Form.Item>
              <Button
                onClick={handleAdd}
                type="primary"
                size="small"
                style={{ marginBottom: 8, float: "right" }}
              >
                <PlusOutlined />
              </Button>
              <Table
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
                bordered
                dataSource={modelInfo}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={false}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginTop: "15px" }}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Add New Asset"
          open={isModalVisible2}
          onOk={handleOk2}
          onCancel={handleCancel2}
          footer={null}
        >
          <Form
            form={form}
            onFinish={onFinish2}
            layout="vertical"
            name="create_asset"
            initialValues={{
              remember: true,
              type: [data.manufacturerID._id, data._id],
            }}
            requiredMark={false}
          >
            <Form.Item
              label="Asset Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Asset Name is required",
                },
              ]}
            >
              <Input placeholder="Asset Name" />
            </Form.Item>

            <Form.Item
              label="Asset Type"
              name="type"
              rules={[
                {
                  required: true,
                  message: "Asset Type is required",
                },
              ]}
            >
              <Cascader
                options={modelOptions}
                placeholder="Choose asset model"
                showSearch={{ filter }}
              />
            </Form.Item>
            <Form.Item
              label="Asset Owner"
              name="owner"
              rules={[
                {
                  required: true,
                  message: "Asset Owner is required",
                },
              ]}
            >
              <Select placeholder="Choose asset owner">
                {users.map((user: any) => (
                  <Select.Option value={user._id}>{user.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Asset Info">
              <Button
                onClick={handleAdd}
                type="primary"
                size="small"
                style={{ marginBottom: 8, float: "right" }}
              >
                <PlusOutlined />
              </Button>
              <Table
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
                bordered
                dataSource={tableData}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={false}
              />
            </Form.Item>

            <Form.Item label="Date Of Manufacturing">
              <DatePicker
                showTime
                onOk={(value) => setManufacturingDate(value)}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  }

  return <div style={{ margin: "0 10px" }}>{card}</div>;
}

const mapStateToProps = (state) => {
  return {
    models: state.Models.models,
    Auth: state.Auth,
  };
};

export default connect(mapStateToProps, { logout })(ModelCard);
