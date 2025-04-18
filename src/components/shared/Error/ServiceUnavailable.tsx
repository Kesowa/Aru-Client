import { Row, Col, Typography } from "antd";
import "./index.less";
import FiveZeroThree from "../../../static/503.svg";
const { Title } = Typography;
function ServiceUnvailable() {
  return (
    <div className="tenant-root-userlistpage-wrapper full-width-height">
      <div className="error-wrapper">
        <Row>
          <Col span={16} className="picture-div">
            <img src={FiveZeroThree} className="picture" alt="" />
          </Col>
          <Col span={8} className="message-div">
            <Title>ERROR 503: Service Unavailable</Title>
            <Title level={5}>What did you mess up this time? *Face palm*</Title>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default ServiceUnvailable;
