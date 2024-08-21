import { useState, useEffect, useContext } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { message, Button, Table, Tag, Popconfirm } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "../Package.less";
import { setPackageToEdit } from "../../../../actions/packageAction";

import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { Link } from "react-router-dom";
import Unauthorized from "../../../shared/Error/Unauthorized";
import FourOhOne from "../../../shared/Error/FourOhOne";
import GatewayTimeout from "../../../shared/Error/GatewayTimeout";
import InternalServerError from "../../../shared/Error/InternalServerError";
import ServiceUnavailable from "../../../shared/Error/ServiceUnavailable";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

function ListAllPackages(props: any) {
  const [isTableLoading, setIstableLoading] = useState(false);
  const [packagetableData, setPackagetableData] = useState([]);
  const [errorState, setErrorState] = useState("");
  const history = useHistory();
  const { logout } = useContext(AuthContext);
  const { setLoading } = useContext(LoaderContext);

  const columns: any = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Bandwidth",
      dataIndex: "bandwidth",
      key: "bandwidth",
    },
    {
      title: "Storage",
      dataIndex: "storage",
      key: "storage",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "User Count",
      dataIndex: "userCount",
      key: "userCount",
    },
    {
      title: "Alert Count",
      dataIndex: "alertCount",
      key: "alertCount",
    },
    {
      title: "Client Count",
      dataIndex: "clientCount",
      key: "clientCount",
    },
    {
      title: "Layer Count",
      dataIndex: "layerCount",
      key: "layerCount",
    },
    {
      title: "Location Count",
      dataIndex: "locationCount",
      key: "locationCount",
    },
    {
      title: "Mission Count",
      dataIndex: "missionCount",
      key: "missionCount",
    },
    {
      title: "User Group Count",
      dataIndex: "userGroupCount",
      key: "userGroupCount",
    },
    {
      title: "VOD Count",
      dataIndex: "vodCount",
      key: "vodCount",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "Working" : "Deleted"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      fixed: "right",
      width: 160,
      render: (text, record) => (
        <>
          <Button
            onClick={() => {
              history.push(`/dashboard/admin/package/edit/${record._id}`);
              props.setPackageToEdit(record);
            }}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Are you sure to delete the package?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              setLoading(true);
              http
                .delete(`${apis.DELETE_PACKAGE}`, {
                  data: {
                    _id: record._id,
                  },
                })
                .then((result) => {
                  message.success(result.data.message);
                  fetchAllPackageList();
                })
                .catch((err) => {
                  message.error(err.message);
                  AxiosErrorHandler(err, logout);
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            <Button style={{ marginLeft: "8px" }} danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const fetchAllPackageList = () => {
    setIstableLoading(true);
    http
      .get(apis.FETCH_ALL_PACKAGES)
      .then((result) => {
        if (result.data.status) {
          setPackagetableData(result.data.data);
        } else {
          switch (result.data.message) {
            case "You do not have permission to use this API.":
              setErrorState("unauthorized");
              break;
          }
        }
      })
      .catch((err) => {
        console.log(err);
        switch (err.status.toString()) {
          case "401":
            setErrorState("401");
            break;
          case "503":
            setErrorState("503");
            break;
          case "504":
            setErrorState("504");
            break;
          default:
            setErrorState("500");
        }
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setIstableLoading(false);
      });
  };

  useEffect(() => {
    fetchAllPackageList();
  }, []);

  switch (errorState) {
    case "unauthorized":
      return <Unauthorized />;
    case "401":
      return <FourOhOne />;
    case "500":
      return <InternalServerError />;
    case "503":
      return <ServiceUnavailable />;
    case "504":
      return <GatewayTimeout />;

    default:
      return (
        <div className="package-list-wrapper full-width-height">
          <PageHeader
            className="site-page-header-responsive"
            title="All Packages"
            subTitle="Register a new package"
            extra={[
              <Link to="/dashboard/admin/package/create" key="1">
                <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
                  Create Package
                </Button>
              </Link>,
            ]}
          ></PageHeader>
          <div className="package-list padding-after-page-header">
            <Table
              bordered={true}
              pagination={{ showSizeChanger: true, showQuickJumper: true }}
              loading={isTableLoading}
              dataSource={packagetableData}
              columns={columns}
              rowKey="_id"
              scroll={{ x: 1300 }}
            />
          </div>
        </div>
      );
  }
}

export default connect(null, { setPackageToEdit })(
  ListAllPackages
);
