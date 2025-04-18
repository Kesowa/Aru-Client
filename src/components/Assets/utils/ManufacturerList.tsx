import { useState, useEffect, useContext } from "react";
import { Row, Col, Typography, Table, message, Button, Input } from "antd";
import { SearchOutlined, ShakeOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import moment from "moment";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import ManufacturerCard from "./ManufacturerCard";
import { AuthContext } from "src/services/authUtils";

const { Title } = Typography;

const ManufacturerList = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [selectedManufacturerID, setSelectedManufacturerID] = useState();

  const [manufacturers, setManufacturers] = useState<any[]>([]);

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchManufacturers();
  }, []);
  const fetchManufacturers = () => {

    http
      .get(`${apis.GET_MANUFACTURERS}`)
      .then((result) => {
        if (result.data.status) {
          setManufacturers(result.data.data);
          console.log(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setIsTableLoading(false);
      });
  };
  
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
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
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.select());
      }
    },
    render: (text) =>
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

  const handleDeleteManufacturer = (name, id) => {
    setIsTableLoading(true);
    http
      .delete(`${apis.DELETE_MANUFACTURER_BY_ID}`, {
        data: { manufacturerID: id },
      })
      .then((result) => {
        if (result.data.status) {
          const newTableData = manufacturers.filter(
            (manufacturer) => manufacturer._id.toString() !== id.toString()
          );
          setManufacturers(newTableData);
          message.success(`Manufacturer "${name}" deleted`);
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

  const columns: any [] = [
    {
      title: "MANUFACTURER",
      dataIndex: "name",
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("name"),
      render: (name, record) => (
        <>
          <span onClick={() => {}}>
            <Title level={5}>
              <ShakeOutlined
                style={{ marginRight: "1rem", color: "#a5a4bf" }}
              />
              {name}
            </Title>
          </span>
        </>
      ),
    },
    {
      title: "NATIONALITY",
      dataIndex: "nationality",
      ...getColumnSearchProps("nationality"),
      render: (text, record) => (
        <>
          <span onClick={() => {}}>{record.nationality}</span>
        </>
      ),
    },
    {
      title: "WEBSITE",
      dataIndex: "website",
      ...getColumnSearchProps("website"),
      render: (text, record) => (
        <>
          <span onClick={() => {}}>{record.website}</span>
        </>
      ),
    },
    {
      title: "CREATED BY",
      dataIndex: "createdBy",
      sorter: (a, b) => a.createdBy.length - b.createdBy.length,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("user"),
      render: (createdBy) => createdBy.name,
    },
    {
      title: "CREATED AT",
      dataIndex: "createdAt",
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("createdAt"),
      render: (createdAt) => moment(createdAt).format("DD-MM-YYYY"),
    },
    {
      title: "ACTIONS",
      dataIndex: "actions",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => setSelectedManufacturerID(record._id)}
        >
          View Details
        </Button>
      ),
    },
    {
      title: "DELETE",
      dataIndex: "delete",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleDeleteManufacturer(record.name, record._id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row>
        <Col span={16}>
          <Table
            columns={columns}
            dataSource={manufacturers}
            rowKey="_id"
            style={{ cursor: "pointer", width: "100%" }}
            loading={isTableLoading}
            scroll={{ x: "max-content" }}
          />
        </Col>
        <Col span={8}>
          <div>
            <ManufacturerCard id={selectedManufacturerID} showDate={true} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ManufacturerList;
