import React, { useState, useEffect } from "react";
import { Row, Col, Typography } from "antd";
import "./index.less";
import unAuthorizedPic from "../../../static/unauthorized-access.svg";
const { Title } = Typography;
function Unauthorized() {
  return (
    <div className="tenant-root-userlistpage-wrapper full-width-height">
      <div className="error-wrapper">
        <Row>
          <Col span={16} className="picture-div">
            <img src={unAuthorizedPic} className="picture" />
          </Col>
          <Col span={8} className="message-div">
            <Title>Sorry! You dont have access to this feature.</Title>
            <Title level={5}>Please contact your organisation admin.</Title>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Unauthorized;
