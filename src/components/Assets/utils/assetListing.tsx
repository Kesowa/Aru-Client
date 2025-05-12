import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Typography,
  Button,
  Tag,
  Input,
  Popconfirm,
  Table,
  Dropdown,
  message,
} from "antd";
import {
  SearchOutlined,
  ShakeOutlined,
  EyeOutlined,
  DeleteOutlined,
  StopOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import moment from "moment";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { AuthContext } from "src/services/authUtils";

const { Title } = Typography;

interface Asset {
  assetName: string;
  modelID: {
    assetClassID: {
      typeName: string;
    };
    modelName: string;
  };
  createdAt: string;
  _id: string;
  createdBy: {
    name: string;
  };
  isActive: string;
}

interface TableProps {
  filter: string;
  refreshAssets: boolean;
}

function AssetListing({ filter, refreshAssets }: TableProps) {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [assetTableData, setAssetTableData] = useState<Asset[]>([]);

  const history = useHistory();

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchAssets();
  }, [refreshAssets]);

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++ Fetch Assets +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const fetchAssets = () => {
    http
      .get(`${apis.GET_ALL_ASSETS}`)
      .then((result) => {
        if (result.data.status) {
          setAssetTableData(result.data.data.gotDoc);
        } else {
          message.error(
            "Unable to fetch assets. API response: " + result.data.message
          );
        }
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setAssetTableData([]);
        } else {
          message.error("Unable to fetch assets. Error info: " + err);
          AxiosErrorHandler(err, logout);
        }
      })
      .finally(() => {
        setIsTableLoading(false);
      });
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++ Delete Assets +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const handleDeleteAsset = (name: string, id: string) => {
    setIsTableLoading(true);
    http
      .delete(`${apis.DELETE_ASSET_BY_ID}`, {
        data: { assetID: id },
      })
      .then((result) => {
        if (result.data.status) {
          const newTableData = assetTableData.filter(
            (asset: Asset) => asset._id !== id
          );
          setAssetTableData(newTableData);
          message.success(`Asset "${name}" deleted`);
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

  const actionMenu = (record: Asset) => [
    {
      key: "1",
      label: "Edit Asset",
      icon: <EditOutlined />,
    },
    {
      key: "2",
      label: (
        <Popconfirm
          title="Are you sure to delete the asset"
          okText="Yes"
          cancelText="No"
          onConfirm={() => {
            handleDeleteAsset(record.assetName, record._id);
          }}
        >
          <DeleteOutlined /> Delete Asset
        </Popconfirm>
      ),
    },
    {
      key: "3",
      label: "Block Asset",
      icon: <StopOutlined />,
    },
  ];

  let searchInput: any;
  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: string
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex: string) => ({
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
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value: string, record: Asset) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.select());
      }
    },
    render: (text: string) =>
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
      title: "ASSET",
      dataIndex: "assetName",
      sorter: (a: Asset, b: Asset) => a.assetName.length - b.assetName.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("assetName"),
      render: (assetName: string) => {
        return (
          <>
            <span onClick={() => {}}>
              <Title level={5}>
                <ShakeOutlined
                  style={{ marginRight: "1rem", color: "#a5a4bf" }}
                />
                {assetName}
              </Title>
            </span>
          </>
        );
      },
    },
    {
      title: "TYPE",
      dataIndex: "modelID",
      sorter: (a: Asset, b: Asset) =>
        a.modelID.assetClassID.typeName.length -
        b.modelID.assetClassID.typeName.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("modelID"),
      render: (modelID: Asset["modelID"]) => modelID.assetClassID.typeName,
    },
    {
      title: "MODEL",
      dataIndex: "modelID",
      sorter: (a: Asset, b: Asset) =>
        a.modelID.modelName.length - b.modelID.modelName.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("modelID"),
      render: (modelID: Asset["modelID"]) => modelID.modelName,
    },
    {
      title: "CREATED AT",
      dataIndex: "createdAt",
      sorter: (a: Asset, b: Asset) =>
        moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("createdAt"),
      render: (createdAt: string) => moment(createdAt).format("DD-MM-YYYY"),
    },
    {
      title: "ASSET ID",
      dataIndex: "_id",
      ...getColumnSearchProps("_id"),
      render: (text: string, record: Asset) => (
        <>
          <span onClick={() => {}}>{record._id}</span>
        </>
      ),
    },
    {
      title: "CREATED BY",
      dataIndex: "createdBy",
      sorter: (a: Asset, b: Asset) =>
        a.createdBy.name.length - b.createdBy.name.length,
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("createdBy"),
      render: (createdBy: Asset["createdBy"]) => createdBy.name,
    },
    {
      title: "STATUS",
      dataIndex: "isActive",
      sorter: (a: Asset, b: Asset) => a.isActive.length - b.isActive.length,
      sortDirections: ["ascend", "descend"],
      render: (isActive: string) => {
        const color = isActive === "true" ? "geekblue" : "red";
        const status = isActive === "true" ? "Active" : "Inactive";
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "ACTIONS",
      dataIndex: "actions",
      render: (text: string, record: Asset) => (
        <>
          <Dropdown.Button
            onClick={() => {
              history.push(`/dashboard/asset/view/${record._id}`);
            }}
            className="dropdown-option"
            menu={{ items: actionMenu(record) }}
          >
            <EyeOutlined />
          </Dropdown.Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={
          (filter === "all") ?
          assetTableData :
          assetTableData.filter((row) => {
            return row.isActive === filter;
          })
        }
        rowKey="_id"
        style={{ cursor: "pointer" }}
        loading={isTableLoading}
      />
    </div>
  );
}

export default AssetListing;
