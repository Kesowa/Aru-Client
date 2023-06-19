import { Row, Col, Typography } from "antd";
import "./index.less";
import FourOhOnePic from "../../../static/401.svg";
const { Title } = Typography;
function FourOhOne() {
  return (
    <div className="tenant-root-userlistpage-wrapper full-width-height">
      <div className="error-wrapper">
        <Row>
          <Col span={16} className="picture-div">
            <img src={FourOhOnePic} className="picture" />
          </Col>
          <Col span={8} className="message-div">
            <Title>ERROR 401</Title>
            <Title level={5}>Unauthorized API response.</Title>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default FourOhOne;
