import React, { useState, useEffect } from "react";
import { Row, Col, Typography } from "antd";
import "./index.less";
import FiveZeroFour from "../../../static/504.svg";
const { Title } = Typography;
function GatewayTimeout() {
  return (
    <div className="tenant-root-userlistpage-wrapper full-width-height">
      <div className="error-wrapper">
        <Row>
          <Col span={16} className="picture-div">
            <img src={FiveZeroFour} className="picture" />
          </Col>
          <Col span={8} className="message-div">
            <Title>ERROR 504: Gateway timed out!</Title>
            <Title level={5}>
              Please try again, or check your internet connectivity.
            </Title>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default GatewayTimeout;
