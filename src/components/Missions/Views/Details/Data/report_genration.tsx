import { useContext, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { Typography, Tabs, Button, message } from "antd";

import { DownloadOutlined } from "@ant-design/icons";
import "./data.less";
import apis from "../../../../../services/apis";
import http from "../../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";

import "./data.less";
import { AuthContext } from "src/services/authUtils";
const boxStyle: React.CSSProperties = {
  width: "100%",
  height: 120,
  borderRadius: 6,
  border: "1px solid #40a9ff",
};

const { Text } = Typography;
function ReportGenration(props) {
  const [activeKey, setactiveKey] = useState("1");
  const { logout } = useContext(AuthContext);

  function callback(key) {
    setactiveKey(key);
    console.log(activeKey);
  }
  function generateReport(reportType: string) {
    http
      .post(
        `${
          reportType == "block"
            ? apis.CREATE_BLOCK_REPORT
            : apis.CREATE_PLOT_REPORT
        }`,
        {
          missionId: props.missionId,
        }
      )
      .then((result) => {
        console.log(result.data.message);
        if (result.data.status) message.success(result.data.message);
        else {
          props.setReportErrors(result.data.errors);
          props.setReportErrorCSVPath(result.data.csvPath);
          props.setShowReportErrors(true);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      });
  }

  function onclick_genratereport(reportType: string) {
    const generateReportHandler = () => {
      generateReport(reportType);
    };

    return (
      <>
        <div className="center__button">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            onClick={generateReportHandler}
          >
            Generate {reportType} Report
          </Button>
        </div>
      </>
    );
  }

  const returnTabPaneItem = () => {
    const items: TabsProps["items"] = [
      {
        key: "1",
        label: <span>Plot </span>,
        children: onclick_genratereport("Plot"),
      },
      {
        key: "2",
        label: <span>Block </span>,
        children: onclick_genratereport("block"),
      },
    ];
    return items;
  };

  return (
    <>
      <Tabs
        defaultActiveKey={activeKey}
        onChange={callback}
        items={returnTabPaneItem()}
      />
    </>
  );
}

export default ReportGenration;
