import React from "react";
import { Row, Col, Typography } from "antd";
import "./index.less";
import Four0FourPic from "../../../static/404.svg";
const { Title } = Typography;
function FourOFour(props) {
  return (
    <div className="tenant-root-userlistpage-wrapper full-width-height">
      <div className="error-wrapper">
        <Row>
          <Col span={16} className="picture-div">
            <img src={Four0FourPic} className="picture" />
          </Col>
          <Col span={8} className="message-div">
            <Title>ERROR 404</Title>
            <Title level={5}>Not Found!</Title>
            <p>{props.message}</p>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default FourOFour;
