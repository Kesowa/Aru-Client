import { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Row,
  Col,
  Table,
  message,
  Input,
  Button,
  Typography
} from "antd";
import {
  SearchOutlined,
  ShakeOutlined
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import moment from "moment";
import "../index.less";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { logout } from "../../../actions/authAction";
import { setModelsToState, deleteModel } from "../../../actions/modelAction";
import ModelCard from "./ModelCard";

const { Title } = Typography;

interface TableProps {
  userType: any;
  tenantId: any;
  userId: any;
  logout: any;
  setModelsToState: any;
  deleteModel: any;
  models: any;
}

function ModelList(props: TableProps) {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [modelTableData, setModelTableData] = useState<any>([]);
  const [selectedModelID, setSelectedModelID] = useState();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = () => {
    http
      .get(`${apis.GET_MODELS}`)
      .then((result) => {
        if (result.data.status) {
          props.setModelsToState(result.data.data);
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
    if (props.models.length) {
      setModelTableData(props.models);
    }
  }, [props.models]);

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

  const columns: any[] = [
    {
      title: "NAME",
      dataIndex: "modelName",
      sorter: (a: any, b: any) => a.modelName.length - b.modelName.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("name"),
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
      ...getColumnSearchProps("asset class"),
      render: (assetClassID: any) => assetClassID.typeName,
    },
    {
      title: "MANUFACTURER",
      dataIndex: "manufacturerID",
      width: "15%",
      sorter: (a: any, b: any) =>
        a.manufacturerID.length - b.manufacturerID.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("manufacturer"),
      render: (manufacturerID: any) => manufacturerID.name,
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
      ...getColumnSearchProps("user"),
      render: (createdBy: any) => createdBy.name,
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedModelID(selectedRows[0]._id);
    },
  };

  return (
    <div>
      <Row>
        <Col span={16}>
          <Table
            columns={columns}
            dataSource={modelTableData}
            rowKey="_id"
            style={{ cursor: "pointer", minHeight: "500px" }}
            loading={isTableLoading}
            rowSelection={{ type: "radio", ...rowSelection }}
            scroll={{ x: "max-content" }}
          />
        </Col>
        <Col span={8}>
          <div>
            <ModelCard id={selectedModelID} showDate={true} />
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
    models: state.Models.models,
  };
};

export default connect(mapStateToProps, {
  setModelsToState,
  deleteModel,
  logout,
})(ModelList);
