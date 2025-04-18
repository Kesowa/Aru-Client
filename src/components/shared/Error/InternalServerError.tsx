import { Row, Col, Typography } from "antd";
import "./index.less";
import FiveHundred from "../../../static/500.svg";
const { Title } = Typography;
function InternalServerError() {
  return (
    <div className="tenant-root-userlistpage-wrapper full-width-height">
      <div className="error-wrapper">
        <Row>
          <Col span={16} className="picture-div">
            <img src={FiveHundred} className="picture" alt="" />
          </Col>
          <Col span={8} className="message-div">
            <Title>ERROR 505: Internal Server Error</Title>
            <Title level={5}>What did you mess up this time? *Face palm*</Title>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default InternalServerError;
