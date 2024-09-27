import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Typography,
  Button,
  Modal,
  Select,
  Cascader,
  Form,
  Input,
  message,
  Table,
  Popconfirm,
  DatePicker,
  Tabs,
  Space,
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import {
  MinusCircleOutlined,
  PlusOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import moment from "moment";
import AssetList from "./utils/assetListing";
import ModelList from "./utils/ModelList";
import ManufacturerList from "./utils/ManufacturerList";
import http from "../../services/httpCall";
import apis from "../../services/apis";
import { AxiosErrorHandler } from "../../services/httpErrorHandle";
import "./index.less";
import { AuthContext } from "src/services/authUtils";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

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

const originData2 = [
  {
    id: "0",
    key: "tshirt-size",
    value: "",
  },
  {
    id: "1",
    key: "key12",
    value: "",
  },
  {
    id: "2",
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

function AssetBase(props: any) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [isModalVisible3, setIsModalVisible3] = useState(false);
  const [users, setUsers] = useState<any>([]);
  const [manufacturers, setManufacturers] = useState<any>([]);
  const [models, setModels] = useState<any>([]);
  const [assetClasses, setAssetClasses] = useState<any>([]);
  const [count, setCount] = useState(3);
  const [manufacturingDate, setManufacturingDate] = useState<any>("");
  const [data, setData] = useState(originData);
  const [editingKey, setEditingKey] = useState("");
  const [refreshAssets, setRefreshAssets] = useState(false);

  const [assetButton, setAssetButton] = useState(true);
  const [modelButton, setModelButton] = useState(true);
  const [manufacturerButton, setManufacturerButton] = useState(true);

  const [form] = Form.useForm();
  const history = useHistory();

  const { Auth, logout } = useContext(AuthContext);

  const showModal = () => {
    setIsModalVisible(true);
    setData(originData);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const showModal2 = () => {
    setIsModalVisible2(true);
    setData(originData2);
  };

  const handleOk2 = () => {
    setIsModalVisible2(false);
  };

  const handleCancel2 = () => {
    setIsModalVisible2(false);
    form.resetFields();
  };

  const showModal3 = () => {
    setIsModalVisible3(true);
    setData(originData2);
  };

  const handleOk3 = () => {
    setIsModalVisible3(false);
  };

  const handleCancel3 = () => {
    setIsModalVisible3(false);
    form.resetFields();
  };

  const filter = (inputValue, path) => {
    return path.some(
      (option) =>
        option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
  };

  const modelOptions: Array<any> = [];

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
        if (model.manufacturerID._id == obj1.value) {
          const obj = {} as OptionType;
          obj.value = model._id;
          obj.label = model.modelName;
          obj1.children.push(obj);
        }
      });
      modelOptions.push(obj1);
    });
  };

  useEffect(() => {
    getOwner();
    getManufacturer();
    getModel();
    getAssetClass();
  }, []);

  const onFinish = async (values: any) => {
    if (
      !manufacturingDate ||
      manufacturingDate === "" ||
      manufacturingDate === " "
    ) {
      message.error("Please select valid date");
      return;
    }

    const assetInfo = {};
    for (let i = 0; i < data.length; ++i) {
      const key = data[i].key;
      const value = data[i].value;
      assetInfo[key] = value;
      if (key === "FCID" && !value || key === "serialNo" && !value || key === "UIN" && !value) {
        message.error("AssetInfo is required");
        return;
      }
    }
    
    form.resetFields();

    for (let i = 0; i < data.length; ++i) {
      assetInfo[data[i].key] = data[i].value;
    }

    const asset = {
      assetName: values.name,
      userID: Auth.userid,
      assetInfo: [assetInfo],
      model: values.type[1],
      assetOwner: values.owner,
      manufactureDate: moment(manufacturingDate).format("YYYY-MM-DD"),
      manufactureID: values.type[0],
    };

    http
      .post(`${apis.CREATE_ASSET}`, asset)
      .then((result) => {
        if (result.data.status) {
          history.push("/dashboard/assets");
          setRefreshAssets((prev) => !prev); 
          message.success("Asset Created Successfully");
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
    form.resetFields();
    const props2 = {};
    for (let i = 0; i < data.length; ++i) {
      props2[data[i].key] = data[i].value;
    }
    const dimensions = {};
    dimensions["length"] = values.length;
    dimensions["breadth"] = values.breadth;
    dimensions["height"] = values.height;
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
          history.push("/dashboard/assets");
          message.success("Model Created Successfully");
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

  const onFinish3 = async (values: any) => {
    if (!values.contacts || values.contacts.length === 0) {
      message.error("Please enter at least 1 client");
      return;
    }

    form.resetFields();

    const manufacturer = {
      name: values.name,
      address: values.address,
      nationality: values.nationality,
      website: values.website,
      contacts: values.contacts,
    };

    http
      .post(`${apis.CREATE_MANUFACTURER}`, manufacturer)
      .then((result) => {
        if (result.data.status) {
          history.push("/dashboard/assets");
          message.success("Manufacturer Created Successfully");
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        handleCancel3();
      });
  };

  if (manufacturers && models) {
    getModelOptions();
  }

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

  const handleDelete = (key: React.Key) => {
    const newData = data.filter((item) => item.key !== key);
    setData(newData);
    setCount(count - 1);
  };

  const handleAdd = (e) => {
    const newData: Item = {
      id: count,
      key: `Key ${count + 1}`,
      value: "",
    };
    setData([...data, newData]);
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

  const onTabClick = (key) => {
    if (key == "1") {
      setAssetButton(true);
      setModelButton(true);
      setManufacturerButton(true);
    } else if (key == "2") {
      setAssetButton(false);
      setModelButton(true);
      setManufacturerButton(false);
    } else if (key == "3") {
      setAssetButton(false);
      setModelButton(false);
      setManufacturerButton(true);
    }
  };

  return (
    <div className="asset-view-wrapper">
      <PageHeader
        onBack={() => window.history.back()}
        title="My Assets"
        className="site-page-header-responsive"
        subTitle="Here you all your assets, and also manage them"
        extra={[
          <Button
            id="manufacturerButton"
            key="3"
            onClick={showModal3}
            type="primary"
            style={{ display: manufacturerButton ? "inline" : "none" }}
          >
            Manufacturer <PlusOutlined />
          </Button>,
          <Button
            id="modelButton"
            key="2"
            onClick={showModal2}
            type="primary"
            style={{ display: modelButton ? "inline" : "none" }}
          >
            Model <PlusOutlined />
          </Button>,
          <Button
            id="assetButton"
            key="1"
            onClick={showModal}
            type="primary"
            style={{ display: assetButton ? "inline" : "none" }}
          >
            Asset <PlusOutlined />
          </Button>,
        ]}
      />
      <Modal
        title="Add New Asset"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          name="create_mission"
          initialValues={{
            remember: true,
          }}
          requiredMark={false}
          id="myForm"
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
            initialValue={[]}
          >
            <Cascader
              options={modelOptions}
              placeholder="Choose asset model"
              showSearch={{ filter }}
              displayRender={(label) => label.join(" > ")}
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

          <Button
            onClick={handleAdd}
            type="primary"
            size="small"
            style={{ marginBottom: 8, float: "right" }}
          >
            <PlusOutlined />
          </Button>
          <Form.Item label="Asset Info">
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

          <Form.Item label="Date Of Manufacturing">
            <DatePicker
              showTime
              onChange={(value) => setManufacturingDate(value)}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Model"
        open={isModalVisible2}
        onOk={handleOk2}
        onCancel={handleCancel2}
        footer={null}
      >
        <Form
          form={form}
          onFinish={onFinish2}
          layout="vertical"
          name="create_model"
          initialValues={{
            remember: true,
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

          <Form.Item label="Properties">
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
            <Input placeholder="Website" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Manufacturer"
        open={isModalVisible3}
        onOk={handleOk3}
        onCancel={handleCancel3}
        footer={null}
      >
        <Form
          form={form}
          onFinish={onFinish3}
          layout="vertical"
          name="create_manufacturer"
          initialValues={{
            remember: true,
          }}
          requiredMark={false}
        >
          <Form.Item
            label="Manufacturer Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Manufacturer Name is required",
              },
            ]}
          >
            <Input placeholder="Manufacturer Name" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[
              {
                required: true,
                message: "Address is required",
              },
            ]}
          >
            <TextArea rows={4} placeholder="Address" />
          </Form.Item>

          <Form.Item
            label="Nationality"
            name="nationality"
            rules={[
              {
                required: true,
                message: "Nationality is required",
              },
            ]}
          >
            <Input placeholder="Nationality" />
          </Form.Item>

          <Form.List name="contacts">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space
                    key={field.key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, "name"]}
                      rules={[
                        {
                          required: true,
                          message: "Contact Name is required",
                        },
                      ]}
                    >
                      <Input placeholder="Contact Name" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, "email"]}
                      rules={[
                        {
                          required: true,
                          message: "Contact Email is required",
                        },
                      ]}
                    >
                      <Input placeholder="Contact Email" />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                    }}
                    block
                  >
                    Add Contact
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

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
            <Input placeholder="Website" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Tabs defaultActiveKey="1" onTabClick={onTabClick}>
        <TabPane tab="Assets" key="1">
        <AssetList filter="all" refreshAssets={refreshAssets}/>
        </TabPane>
        <TabPane tab="Models" key="2">
          <ModelList />
        </TabPane>
        <TabPane tab="Manufacturers" key="3">
          <ManufacturerList />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default AssetBase;
