import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import {
  Typography,
  Button,
  Tag,
  Input,
  Popconfirm,
  Table,
  Dropdown,
  Menu,
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
import { logout } from "../../../actions/authAction";
import { setAssetsToState, deleteAsset } from "../../../actions/assetAction";

const { Title } = Typography;

interface TableProps {
  filter: any;
  userType: any;
  tenantId: any;
  userId: any;
  logout: any;
  setAssetsToState: any;
  deleteAsset: any;
  assets: any;
}

function AssetListing(props: TableProps) {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [assetTableData, setAssetTableData] = useState<any>([]);

  const history = useHistory();

  useEffect(() => {
    fetchAssets();
  }, []);

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++ Fetch Assets +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const fetchAssets = () => {

    http
      .get(`${apis.GET_ALL_ASSETS}`)
      .then((result) => {
        if (result.data.status) {
          props.setAssetsToState(result.data.data.gotDoc);
          //console.log(result.data.data);
        } else {
          message.error(
            "Unable to fetch assets. API response: " + result.data.message
          );
        }
      })
      .catch((err) => {
        if (err.response.status === 404) {
          props.setAssetsToState([]);
        } else {
          message.error("Unable to fetch assets. Error info: " + err);
          AxiosErrorHandler(err, props.logout);
        }
      })
      .finally(() => {
        setIsTableLoading(false);
      });
  };

  useEffect(() => {
    if (props.assets.length) {
      if (props.filter === "all") {
        setAssetTableData(props.assets);
      } else {
        const data = props.assets.filter((row) => {
          return row.status === props.filter;
        });
        setAssetTableData(data);
      }
    }
  }, [props.assets, props.filter]);

  // +++++++++++++++++++++++++++++++++++++++++++++++++++ Delete Assets +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const deleteAsset = (name, id) => {
    setIsTableLoading(true);
    http
      .delete(`${apis.DELETE_ASSET_BY_ID}`, {
        data: { assetID: id },
      })
      .then((result) => {
        if (result.data.status) {
          const newTableData = assetTableData.filter((asset: any) => {
            return asset._id.toString() != id.toString();
          });
          setAssetTableData(newTableData);
          props.deleteAsset(id);
          message.success(`Asset "${name}" deleted`);
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
    onFilterDropdownVisibleChange: (visible: any) => {
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
      title: "ASSET",
      dataIndex: "assetName",
      sorter: (a: any, b: any) => a.assetName.length - b.assetName.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("name"),
      render: (assetName: any, record) => {
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
      sorter: (a: any, b: any) => a.type.length - b.type.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("type"),
      render: (typeName: any) => typeName.assetClassID.typeName,
    },
    {
      title: "MODEL",
      dataIndex: "modelID",
      sorter: (a: any, b: any) => a.modelID.length - b.modelID.length,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("model"),
      render: (modelID: any) => modelID.modelName,
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
    {
      title: "ASSET ID",
      dataIndex: "_id",
      ...getColumnSearchProps("_id"),
      render: (text, record) => (
        <>
          <span onClick={() => {}}>{record._id}</span>
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
      title: "STATUS",
      dataIndex: "isActive",
      sorter: (a: any, b: any) => a.isActive.length - b.isActive.length,
      sortDirections: ["ascend", "descend"],
      render: (tags: any) => {
        let color;
        let status;

        switch (tags) {
          case "true":
            status = "Active";
            color = "geekblue";
            break;

          default:
            status = "Inactive";
            color = "red";
        }
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
      render: (text, record) => (
        <>
          <Dropdown.Button
            onClick={() => {
              history.push(`/dashboard/asset/view/${record._id}`);
            }}
            className="dropdown-option"
            overlay={
              <Menu>
                <Menu.Item key="1">
                  <EditOutlined /> Edit Asset
                </Menu.Item>
                <Menu.Item key="2">
                  <Popconfirm
                    title="Are you sure to delete the asset"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => {
                      deleteAsset(record.assetName, record._id);
                    }}
                  >
                    <DeleteOutlined /> Delete Asset
                  </Popconfirm>
                </Menu.Item>
                <Menu.Item key="3">
                  <StopOutlined /> Block Asset
                </Menu.Item>
              </Menu>
            }
          >
            <EyeOutlined />
          </Dropdown.Button>
        </>
      ),
    },
  ];

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++SAMPLE DATA++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
  const data = [
    {
      name: "Kingshuk's Drone",
      type: "Drone",
      model: "Phantom 4 v2",
      createdAt: "2021-01-07T10:05:24.153+00:00",
      _id: "5ff6dce41b8f451580f059df",
      user: "kingshuk",
      isActive: "Active",
    },
    {
      name: "Neel's Drone",
      type: "Drone",
      model: "Mavic Mini",
      createdAt: "2021-01-07T10:05:24.153+00:00",
      _id: "5ff6dce41b8f451580f059df",
      user: "root",
      isActive: "Inactive",
    },
    {
      name: "Krishanu's Drone",
      type: "Drone",
      model: "Pantom Paibh",
      createdAt: "2021-01-07T10:05:24.153+00:00",
      _id: "5ff6dce41b8f451580f059df",
      user: "root",
      isActive: "Blocked",
    },
  ];
  return (
    <div>
      <Table
        columns={columns}
        dataSource={assetTableData}
        rowKey="_id"
        style={{ cursor: "pointer" }}
        loading={isTableLoading}
      />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    userType: state.Auth.userdetails.userType,
    tenantId: state.Auth.userdetails.tenantId._id,
    userId: state.Auth.userdetails._id,
    assets: state.Assets.assets,
  };
};

export default connect(mapStateToProps, {
  logout,
  setAssetsToState,
  deleteAsset,
})(AssetListing);
