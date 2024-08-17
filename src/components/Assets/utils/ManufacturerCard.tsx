import React, { useState, useEffect, useContext } from "react";
import { connect } from "react-redux";
import {
  Card,
  message,
  Typography,
  Row,
  Divider,
  Col,
  Button,
  Popover,
  Form,
  Select,
  Modal,
  Input,
  Table,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import AloneLogo from "../../../static/Alone-rafiki.svg";
import moment from "moment";
import { setManufacturersToState } from "src/actions/manufacturerAction";
import { AuthContext } from "src/services/authUtils";

const { Text } = Typography;

interface Item {
  id: number;
  key: string;
  value: string;
}

const originData: Item[] = [
  {
    id: 0,
    key: "tshirt-size",
    value: "",
  },
  {
    id: 1,
    key: "key12",
    value: "",
  },
  {
    id: 2,
    key: "imageURL",
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

interface ManufacturerCardProps {
  id: string;
  showDate: boolean;
  manufacturers: any[];
}

const ManufacturerCard: React.FC<ManufacturerCardProps> = ({
  id,
  showDate,
  manufacturers,
}) => {
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isCardLoading, setIsCardLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [count, setCount] = useState(3);
  const [tableData, setTableData] = useState<Item[]>(originData);
  const [editingKey, setEditingKey] = useState<string>("");

  const [form] = Form.useForm();
  const [assetClasses, setAssetClasses] = useState<any>([]);

  const { logout } = useContext(AuthContext);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getAssetClass = () => {
    http
      .get(`${apis.GET_ASSET_CLASSES}`)
      .then((result) => {
        if (result.data.status) {
          setAssetClasses(result.data.data);
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
          setManufacturersToState(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      });
  };

  useEffect(() => {
    getManufacturer();
    getAssetClass();
  }, []);

  useEffect(() => {
    setIsCardLoading(true);
    setSelectedID(id);
    if (id) {
      http
        .get(`${apis.GET_MANUFACTURER_BY_ID}`, {
          params: {
            _id: id,
          },
        })
        .then((result) => {
          if (result.data.status) {
            setData(result.data.data[0]);
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
  }, [id]);

  useEffect(() => {
    if (selectedID === null) {
      setData(null);
    }
  }, [selectedID]);

  const onFinish = async (values: any) => {
    form.resetFields();
    const props2 = {};
    for (let i = 0; i < tableData.length; ++i) {
      props2[tableData[i].key] = tableData[i].value;
    }
    const dimensions = {
      length: values.length,
      breadth: values.breadth,
      height: values.height,
    };
    const model = {
      modelName: values.name,
      modelNumber: values.number,
      assetClassID: values.type,
      manufacturerID: values.manufacturer,
      website: values.website,
      dimensions: dimensions,
      props: props2,
    };
    http
      .post(`${apis.CREATE_MODEL}`, model)
      .then((result) => {
        if (result.data.status) {
          message.success("Model Created Successfully");
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

  let card = (
    <Card
      bordered={true}
      style={{ background: "#eceaea", padding: "20px", minHeight: "500px" }}
    >
      <img src={AloneLogo} alt="" />
      <p style={{ textAlign: "center" }}>
        Please Select a Manufacturer to View
      </p>
    </Card>
  );

  if (data) {
    card = (
      <Card
        loading={isCardLoading}
        style={{
          background: "#eceaea",
          padding: "20px",
          minHeight: "500px",
          position: "relative",
        }}
      >
        <Row>
          <Col span={12}>
            <Text
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginTop: "20px",
              }}
            >
              {data.name}
            </Text>
          </Col>
          {showDate && (
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
        <Row style={{ marginTop: "20px" }}>
          <Col span={12}>
            <Text>Address</Text>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "12px" }}
            >
              {data.address}
            </Text>
          </Col>
          <Col span={12}>
            <Text>Nationality</Text>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "12px" }}
            >
              {data.nationality}
            </Text>
          </Col>
        </Row>
        <Row style={{ marginTop: "10px" }}>
          <Col span={12}>
            <Text>Created By</Text>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "12px" }}
            >
              {data.createdBy?.name}
            </Text>
          </Col>
          <Col span={12}>
            <Text>Website Link</Text>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "12px" }}
            >
              {data.website}
            </Text>
          </Col>
        </Row>
        <Divider />
        <Text
          type="secondary"
          style={{ fontSize: "18px", marginBottom: "15px" }}
        >
          Contacts
        </Text>
        <Row>
          {data.contacts &&
            data.contacts.map((obj) => {
              const content = (
                <div>
                  <Row style={{ height: "max-content" }}>
                    <Col style={{ display: "flex" }}>
                      <UserOutlined
                        style={{
                          marginRight: "15px",
                          fontSize: "20px",
                          alignSelf: "center",
                        }}
                      />
                    </Col>
                    <Col>
                      <Text style={{ fontSize: "14px" }}>{obj.name}</Text>
                      <Text
                        type="secondary"
                        style={{ display: "block", fontSize: "10px" }}
                      >
                        {obj.designation}
                      </Text>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: "10px" }}>
                    <Col style={{ display: "flex" }}>
                      <MailOutlined
                        style={{
                          marginRight: "15px",
                          fontSize: "20px",
                          alignSelf: "center",
                        }}
                      />
                    </Col>
                    <Col>
                      <Text
                        copyable
                        style={{
                          fontSize: "14px",
                        }}
                      >
                        {obj.email}
                      </Text>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: "10px" }}>
                    <Col>
                      <PhoneOutlined
                        style={{
                          marginRight: "15px",
                          fontSize: "20px",
                          alignSelf: "center",
                        }}
                      />
                    </Col>
                    <Col>
                      <Text
                        copyable
                        style={{
                          fontSize: "14px",
                        }}
                      >
                        {obj.Mobile}
                      </Text>
                    </Col>
                  </Row>
                </div>
              );
              return (
                <Col span={12} style={{ marginTop: "10px" }}>
                  <Popover placement="left" content={content} trigger="click">
                    <div
                      style={{
                        width: "70%",
                        padding: "10px",
                        background: "white",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        boxShadow: "0 0 2px gray",
                      }}
                    >
                      <Row>
                        <Col style={{ display: "flex" }}>
                          <UserOutlined
                            style={{
                              marginRight: "15px",
                              fontSize: "20px",
                              alignSelf: "center",
                            }}
                          />
                        </Col>
                        <Col>
                          <Text style={{ display: "block", fontSize: "14px" }}>
                            {obj.name}
                          </Text>
                          <Text
                            type="secondary"
                            style={{ display: "block", fontSize: "10px" }}
                          >
                            {obj.designation}
                          </Text>
                        </Col>
                      </Row>
                    </div>
                  </Popover>
                </Col>
              );
            })}
        </Row>
        {showDate && (
          <Row style={{ position: "absolute", bottom: "20px" }}>
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
                onClick={showModal}
                type="primary"
                size="middle"
                style={{
                  float: "right",
                  marginLeft: "100px",
                }}
              >
                Model <PlusOutlined />
              </Button>
            </Col>
          </Row>
        )}
        <Modal
          title="Add New Model"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            name="create_model"
            initialValues={{
              remember: true,
              manufacturer: data._id,
            }}
            requiredMark={false}
          >
            <Form.Item
              label="Model Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Model Name is required",
                },
              ]}
            >
              <Input placeholder="Model Name" />
            </Form.Item>
            <Form.Item
              label="Model Number"
              name="number"
              rules={[
                {
                  required: true,
                  message: "Model Number is required",
                },
              ]}
            >
              <Input placeholder="Model Number" />
            </Form.Item>
            <Form.Item
              label="Asset Class"
              name="type"
              rules={[
                {
                  required: true,
                  message: "Asset Class is required",
                },
              ]}
            >
              <Select placeholder="Choose Asset Class">
                {assetClasses.map((assetClass: any) => (
                  <Select.Option value={assetClass._id}>
                    {assetClass.typeName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Manufacturer"
              name="manufacturer"
              rules={[
                {
                  required: true,
                  message: "Manufacturer is required",
                },
              ]}
            >
              <Select placeholder="Choose Manufacturer">
                {manufacturers.map((manufacturer: any) => (
                  <Select.Option value={manufacturer._id}>
                    {manufacturer.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div style={{ display: "flex", flexFlow: "row" }}>
              <Form.Item label="Dimensions" name="length">
                <Input placeholder="Length" />
              </Form.Item>
              <Form.Item label="  " name="breadth">
                <Input placeholder="Breadth" />
              </Form.Item>
              <Form.Item label="  " name="height">
                <Input placeholder="Height" />
              </Form.Item>
            </div>

            <Form.Item label="Model Props">
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

            <Form.Item
              label="Website"
              name="website"
              rules={[
                {
                  required: true,
                  message: "Website is required",
                },
              ]}
            >
              <Input placeholder="Website Link" />
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
};

const mapStateToProps = (state: any) => {
  return {
    manufacturers: state.Manufacturers.manufacturers,
  };
};

export default connect(mapStateToProps, null)(ManufacturerCard);
