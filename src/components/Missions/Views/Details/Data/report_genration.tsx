import { useEffect, useState, useRef } from "react";
import { default as Shimmer } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Typography, Tabs, Button } from "antd";

import { DownloadOutlined } from "@ant-design/icons";
import { BsFlagFill } from "react-icons/bs";
import "./data.less";
import apis from "../../../../../services/apis";
import http from "../../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";
import { logout } from "../../../../../actions/authAction";
import moment from "moment";
import VideoPlayer from "../../../../shared/VideoPlayer";
import Dragger from "antd/lib/upload/Dragger";
import { connect } from "react-redux";
import { API_URL, STATIC_URL } from "src/constants";
import { io } from "socket.io-client";
import FilterToolbar from "src/components/shared/Toolbar/filter";
import ActionToolbar from "src/components/shared/Toolbar/action";
import { thread } from "../../../../../actions/threadAction";
import Thread from "../../../../shared/Thread";
import axios from "axios";

import "./data.less";
const boxStyle: React.CSSProperties = {
  width: "100%",
  height: 120,
  borderRadius: 6,
  border: "1px solid #40a9ff",
};

const { Text } = Typography;
function ReportGenration(props) {
  const [activeKey, setactiveKey] = useState("1");
  
  function callback(key) {
    setactiveKey(key);
    console.log(activeKey);
  }
  function generateReport(reportType:string) {
    
    http
      .post(`${reportType == "block" ? apis.CREATE_BLOCK_REPORT : apis.CREATE_PLOT_REPORT}`, {
        missionId: props.missionId,
      })
      .then((result) => {
        console.log(result.data.message);
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
     
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

const mapStateToProps = (state: any) => ({
  Theme: state.theme,
  Thread: state.Thread,
});

export default connect(mapStateToProps, {logout, thread })(ReportGenration);
