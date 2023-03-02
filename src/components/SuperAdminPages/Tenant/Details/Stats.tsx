import React, { useEffect, useState } from "react";
import { Row, Col, Typography } from "antd";
import moment from "moment";

const { Text } = Typography;

export default function Stats(props: any) {
  const [data, setData] = useState({});

  useEffect(() => {
    console.log(props);
    const { userData } = props;
    if (userData) {
      const obj = {
        "Bandwidth Used": userData.bandwidthUsed,
        "Package Start Date": moment(userData.packageStartDate).format(
          "DD-MM-YYYY"
        ),
        "Storage Used (in GB)": userData.storageUsed,
        "Actual Alert Count": userData.actualAlertCount,
        "Actual Client Count": userData.actualClientCount,
        "Actual Layer Count": userData.actualLayerCount,
        "Actual Location Count": userData.actualLocationCount,
        "Actual Mission Count": userData.actualMissionCount,
        "Actual User Group Count": userData.actualUserGroupCount,
        "Actual VOD Count": userData.actualVodCount,
      };
      setData(obj);
    }
  }, [props]);

  return (
    <div>
      <div style={{ padding: "24px", fontSize: "16px" }}>
        {Object.keys(data).map((key) => {
          return (
            <Row style={{ marginBottom: "5px" }}>
              <Col span={5}>{key} :</Col>
              <Col span={19}>{data[key]}</Col>
            </Row>
          );
        })}
      </div>
    </div>
  );
}
