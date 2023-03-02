import React from "react";
import "./index.less";
import AryaLogo from "../../../static/kesowa-logo.svg";
import { Typography } from "antd";
//dsdadsdfsdfs
export default function EntryLoader() {
  return (
    <div className="entry-loader-container">
      <img src={AryaLogo} className="brand-logo" alt="entry-loader" />
      <Typography.Title level={4}>Loading...</Typography.Title>
    </div>
  );
}
