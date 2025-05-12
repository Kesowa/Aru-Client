import { useContext, useState } from "react";
import {
  Row,
  Col,
  Table,
  Input,
  Button,
  Typography,
  Tooltip,
  Popconfirm,
  message
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ShakeOutlined
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import moment from "moment";
import "../index.less";
import ModelCard from "./ModelCard";
import http from "src/services/httpCall";
import apis from "src/services/apis";
import { AxiosErrorHandler } from "src/services/httpErrorHandle";
import { AuthContext } from "src/services/authUtils";

const { Title } = Typography;

function ModelList({ isTableLoading, setIsTableLoading, models, setModels }) {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedModelID, setSelectedModelID] = useState();

  const { logout } = useContext(AuthContext);

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
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          size="small"
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
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
    onFilterDropdownOpenChange: (visible: any) => {
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

  const handleDeleteModel = (name, id) => {
    setIsTableLoading(true);
    http
      .delete(`${apis.DELETE_MODEL}`, {
        data: { id },
      })
      .then((result) => {
        if (result.data.status) {
          const newTableData = models.filter(
            (manufacturer) => manufacturer._id.toString() !== id.toString()
          );
          setModels(newTableData);
          message.success(`Model deleted`);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setIsTableLoading(false);
      });
  };

  const columns: any[] = [
    {
      title: "NAME",
      dataIndex: "modelName",
      sorter: (a: any, b: any) => a.modelName.length - b.modelName.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("modelName"),
      width: "15%",
      render: (modelName: any, record) => {
        return (
          <>
            <span onClick={() => {}}>
              <Title level={5}>
                <ShakeOutlined
                  style={{ marginRight: "1rem", color: "#a5a4bf" }}
                />
                {modelName}
              </Title>
            </span>
          </>
        );
      },
    },
    {
      title: "ASSET CLASS",
      dataIndex: "assetClassID",
      width: "15%",
      sorter: (a: any, b: any) => a.assetClassID.length - b.assetClassID.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("assetClassID"),
      render: (assetClassID: any) => assetClassID.typeName,
    },
    {
      title: "MANUFACTURER",
      dataIndex: "manufacturerID",
      width: "15%",
      sorter: (a: any, b: any) =>
        a.manufacturerID.length - b.manufacturerID.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("manufacturerID"),
      render: (manufacturerID: any) => manufacturerID ? manufacturerID.name : "",
    },

    {
      title: "WEBSITE LINK",
      dataIndex: "website",
      width: "15%",
      ...getColumnSearchProps("website"),
      render: (text, record) => (
        <>
          <span onClick={() => {}}>{record.website}</span>
        </>
      ),
    },

    {
      title: "CREATED AT",
      dataIndex: "createdAt",
      width: "15%",
      sorter: (a: any, b: any) =>
        moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("createdAt"),
      render: (createdAt: string) => moment(createdAt).format("DD-MM-YYYY"),
    },

    {
      title: "CREATED BY",
      dataIndex: "createdBy",
      width: "15%",
      sorter: (a: any, b: any) => a.createdBy.length - b.createdBy.length,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("createdBy"),
      render: (createdBy: any) => createdBy.name,
    },
    {
      title: "ACTIONS",
      dataIndex: "actions",
      fixed: "right",
      render: (_, record) => (
        <div style={{ display: "flex" }}>
        <Tooltip title="View Details">
          <Button
            onClick={() => setSelectedModelID(record._id)}
          >
            <EyeOutlined className="missionViewBtn" />
          </Button>
        </Tooltip>
        <Popconfirm
            title="Are you sure to delete the model?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDeleteModel(record.name, record._id)}
          >
            <Tooltip title="Delete">
              <Button style={{ marginLeft: "8px" }} danger>
                <DeleteOutlined className="missionViewDelBtn" />
              </Button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row>
        <Col span={16}>
          <Table
            columns={columns}
            dataSource={models}
            rowKey="_id"
            style={{ cursor: "pointer", minHeight: "500px" }}
            loading={isTableLoading}
            scroll={{ x: "max-content" }}
          />
        </Col>
        <Col span={8}>
          <div>
            <ModelCard id={selectedModelID} showDate={true} key={selectedModelID}/>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default ModelList;
