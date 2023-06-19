import { useEffect, useState } from "react";
import { Row, Col } from "antd";

export default function RootUser(props: any) {
  const [data, setData] = useState({});

  useEffect(() => {
    console.log(props);
    const { userData } = props;
    if (userData) {
      const obj = {
        "Registration Number": userData.registrationNumber,
        "GST Number": userData.gstNumber,
        "Active Package": userData.activePackage.name,
        "Billing Address Line 1": userData.billingAddressLine1,
        "Billing Address Line 2": userData.billingAddressLine2,
        "Billing City": userData.billingCity,
        "Billing District": userData.billingDistrict,
        "Billing State": userData.billingState,
        "Billing PIN": userData.billingPin,
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
