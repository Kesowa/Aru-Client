import { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Row,
  Col,
  Typography,
  Button,
  Input,
  Table,
  message
} from "antd";
import {
  SearchOutlined,
  ShakeOutlined
} from "@ant-design/icons";

import Highlighter from "react-highlight-words";
import moment from "moment";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { logout } from "../../../actions/authAction";
import {
  setManufacturersToState,
  deleteManufacturer,
} from "../../../actions/manufacturerAction";
import ManufacturerCard from "./ManufacturerCard";

const { Title, Text } = Typography;

interface TableProps {
  userType: any;
  tenantId: any;
  userId: any;
  logout: any;
  setManufacturersToState: any;
  deleteManufacturer: any;
  manufacturers: any;
}

function ManufacturerList(props: TableProps) {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [manufacturerTableData, setManufacturerTableData] = useState<any>([]);
  const [selectedManufacturerID, setSelectedManufacturerID] = useState();

  useEffect(() => {
    fetchManufacturers();
  }, []);

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++ Fetch Manufacturers +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const fetchManufacturers = () => {

    http
      .get(`${apis.GET_MANUFACTURERS}`)
      .then((result) => {
        if (result.data.status) {
          props.setManufacturersToState(result.data.data);
          console.log(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setIsTableLoading(false);
      });
  };

  useEffect(() => {
    if (props.manufacturers.length) {
      setManufacturerTableData(props.manufacturers);
    }
  }, [props.manufacturers]);

  // +++++++++++++++++++++++++++++++++++++++++++++++++++ Delete Manufacturers +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const deleteManufacturer = (name, id) => {
    setIsTableLoading(true);
    http
      .delete(`${apis.DELETE_MANUFACTURER_BY_ID}`, {
        data: { manufacturerID: id },
      })
      .then((result) => {
        if (result.data.status) {
          const newTableData = manufacturerTableData.filter(
            (manufacturer: any) => {
              return manufacturer._id.toString() != id.toString();
            }
          );
          setManufacturerTableData(newTableData);
          props.deleteManufacturer(id);
          message.success(`Manufacturer "${name}" deleted`);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setIsTableLoading(false);
      });
  };

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
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++Columns++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

  const columns: any[] = [
    {
      title: "MANUFACTURER",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name.length - b.name.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("name"),
      render: (name: any, record) => {
        return (
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
        );
      },
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
      sorter: (a: any, b: any) => a.createdBy.length - b.createdBy.length,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("user"),
      render: (createdBy: any) => createdBy.name,
    },
    {
      title: "CREATED AT",
      dataIndex: "createdAt",
      sorter: (a: any, b: any) =>
        moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("createdAt"),
      render: (createdAt: string) => moment(createdAt).format("DD-MM-YYYY"),
    },
  ];


  return (
    <div>
      <Row>
        <Col span={16}>
          <Table
            columns={columns}
            dataSource={manufacturerTableData}
            rowKey="_id"
            style={{ cursor: "pointer", width: "100%" }}
            loading={isTableLoading}
            rowSelection={{ type: "radio" }}
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
}

const mapStateToProps = (state) => {
  return {
    userType: state.Auth.userdetails.userType,
    tenantId: state.Auth.userdetails.tenantId._id,
    userId: state.Auth.userdetails._id,
    manufacturers: state.Manufacturers.manufacturers,
  };
};

export default connect(mapStateToProps, {
  logout,
  setManufacturersToState,
  deleteManufacturer,
})(ManufacturerList);
