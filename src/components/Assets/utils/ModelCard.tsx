import React, { useState, useEffect, useContext } from "react";
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
} from "@ant-design/icons";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import AloneLogo from "../../../static/Alone-rafiki.svg";
import moment from "moment";
import { AuthContext } from "src/services/authUtils";

const { Text } = Typography;
const { Option } = Select;

type OptionType = {
  value: any;
  label: any;
};

type OptionType1 = {
  value: any;
  label: any;
  children: OptionType[];
};

interface Item {
  id: number;
  key: string;
  value: any;
}

const originData: Item[] = [
  {
    id: 0,
    key: "UIN",
    value: "",
  },
  {
    id: 1,
    key: "FCID",
    value: "",
  },
  {
    id: 2,
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

interface ModelCardProps {
  id: any;
  showDate: boolean;
}

const ModelCard: React.FC<ModelCardProps> = (props) => {
  const [selectedID, setSelectedID] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [isCardLoading, setIsCardLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isModalVisible2, setIsModalVisible2] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [users, setUsers] = useState<any>([]);
  const [manufacturers, setManufacturers] = useState<any>([]);
  const [models, setModels] = useState<any>([]);
  const [manufacturingDate, setManufacturingDate] = useState<any>("");
  const [tableData, setTableData] = useState<Item[]>([]);
  const [modelInfo, setModelInfo] = useState<Item[]>([]);

  const { Auth, logout } = useContext(AuthContext);

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
          AxiosErrorHandler(err, logout);
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
    if (data) {
      const obj: Item[] = Object.keys(data.props).map((key, idx) => ({
        key,
        id: idx,
        value: data.props[key],
      }));
      setCount(obj.length);
      setModelInfo(obj);
      setTableData(obj);
    } else {
      setModelInfo([]);
      setTableData([]);
    }
  }, [data]);

  const filter = (inputValue: string, path: any) => {
    return path.some(
      (option: any) =>
        option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
  };

  useEffect(() => {
    getOwner();
    getManufacturer();
    getModel();
  }, []);

  const modelOptions: OptionType1[] = [];

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
        AxiosErrorHandler(err, logout);
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
        AxiosErrorHandler(err, logout);
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
        AxiosErrorHandler(err, logout);
      });
  };

  const getModelOptions = () => {
    manufacturers.map((manufacturer: any) => {
      const obj1 = {} as OptionType1;
      obj1.value = manufacturer._id;
      obj1.label = manufacturer.name;
      obj1.children = [];
      models.map((model: any) => {
        if (model.manufacturerID?._id == obj1.value) {
          const obj = {} as OptionType;
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
    const modelProps: { [key: string]: any } = {};
    for (const element of tableData) {
      modelProps[element.key] = element.value;
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
        AxiosErrorHandler(err, logout);
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
      message.error("Please select a valid date");
      return;
    }

    form.resetFields();

    const assetInfo: { [key: string]: any } = {};
    for (const element of tableData) {
      assetInfo[element.key] = element.value;
    }

    const asset = {
      assetName: values.name,
      userID: Auth.userid,
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
        AxiosErrorHandler(err, logout);
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

  let card: React.ReactElement = (
    <Card
      bordered={true}
      style={{ background: "#eceaea", padding: "20px", minHeight: "500px" }}
    >
      <img src={AloneLogo} alt="" />
      <p style={{ textAlign: "center" }}>Please Select a Model to View</p>
    </Card>
  );

if (data) {
  if (isCardLoading) {
    card = (
      <Card
        title="MODEL INFO"
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
        }}
        loading={isCardLoading}
      />
    );
  } else {
    card = (
      <Card
        title="MODEL INFO"
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
        }}
        loading={isCardLoading}
      >
        <Row>
          <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
            {data ? (
              <Row>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <Text type="secondary">Model Name</Text>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <Text>{data.modelName}</Text>
                </Col>
                <Divider
                  style={{
                    margin: "12px 0",
                    border: "1px solid #d9d9d9",
                  }}
                />
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <Text type="secondary">Manufacturer</Text>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <Text>{data.manufacturerID?.name}</Text>
                </Col>
                <Divider
                  style={{
                    margin: "12px 0",
                    border: "1px solid #d9d9d9",
                  }}
                />
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <Text type="secondary">Manufacturer Part No</Text>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <Text>{data.manufacturerPartNumber}</Text>
                </Col>
                <Divider
                  style={{
                    margin: "12px 0",
                    border: "1px solid #d9d9d9",
                  }}
                />
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <Text type="secondary">Description</Text>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <Text>{data.description}</Text>
                </Col>
                <Divider
                  style={{
                    margin: "12px 0",
                    border: "1px solid #d9d9d9",
                  }}
                />
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <Text type="secondary">Images</Text>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  {data.images && data.images.length > 0 ? (
                    <img
                      src={data.images[0]}
                      alt="Asset"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <img
                      src={AloneLogo}
                      alt="Asset"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                </Col>
              </Row>
            ) : (
              <Text type="secondary">Select a model from the table</Text>
            )}
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
            {data ? (
              <div>
                <Button
                  type="primary"
                  style={{
                    margin: "20px 0",
                    background: "#0077B5",
                    borderColor: "#0077B5",
                  }}
                  onClick={showModal}
                >
                  Edit Model
                </Button>
              </div>
            ) : (
              <div>
                <Text type="secondary">Create a new Asset</Text>
                <br />
                <br />
                <Button
                  type="primary"
                  style={{
                    margin: "20px 0",
                    background: "#0077B5",
                    borderColor: "#0077B5",
                  }}
                  onClick={showModal2}
                >
                  Add Asset
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Card>
    );
  }
}

  return (
    <div>
      {card}
      <Modal
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Card>
          {data ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={data.props}
            >
              <Row>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <Table
                    components={{
                      body: {
                        cell: EditableCell,
                      },
                    }}
                    dataSource={tableData}
                    columns={mergedColumns}
                    pagination={false}
                    bordered
                    rowClassName="editable-row"
                  />
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <br />
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ marginRight: "8px" }}
                    >
                      Save
                    </Button>
                    <Button onClick={handleCancel}>Cancel</Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          ) : null}
        </Card>
      </Modal>
      <Modal
        open={isModalVisible2}
        onOk={handleOk2}
        onCancel={handleCancel2}
        footer={null}
        width={800}
      >
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish2}
            initialValues={{
              owner: "",
              type: [],
              name: "",
            }}
          >
            <Row>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Form.Item
                  label="Asset Name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Please input the Asset name!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Form.Item
                  label="Asset Owner"
                  name="owner"
                  rules={[
                    {
                      required: true,
                      message: "Please select an Asset Owner!",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      option?.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {users.map((user: any) => (
                      <Option key={user._id} value={user._id}>
                        {user.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Form.Item
                  label="Asset Type"
                  name="type"
                  rules={[
                    {
                      required: true,
                      message: "Please select an Asset Type!",
                    },
                  ]}
                >
                  <Cascader
                    options={modelOptions}
                    placeholder="Select"
                    showSearch={{ filter }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Form.Item
                  label="Manufacturing Date"
                  name="manufacturingDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select the Manufacturing Date!",
                    },
                  ]}
                >
                  <DatePicker
                    showTime
                    onChange={(value) => setManufacturingDate(value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <br />
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ marginRight: "8px" }}
                  >
                    Save
                  </Button>
                  <Button onClick={handleCancel2}>Cancel</Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </Modal>
    </div>
  );
};

export default ModelCard;
