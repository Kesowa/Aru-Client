import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { message, Typography, Row, Col } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import ManufacturerCard from "../utils/ManufacturerCard";
import ModelCard from "../utils/ModelCard";
import { connect } from "react-redux";
import { loading } from "../../../actions/loadingAction";
import moment from "moment";
import http from "src/services/httpCall";
import apis from "src/services/apis";
import { AxiosErrorHandler } from "src/services/httpErrorHandle";

const { Title, Text } = Typography;

function AssetView(props) {
  const [data, setData] = useState<any>(null);
  const { id } = useParams<any>();
  const history = useHistory();

  const getAssetDetails = (id: string) => {
    props.loading(true);
    http
      .get(`${apis.GET_ASSET_BY_ID}`, {
        params: {
          assetID: id
        }
      })
      .then((result) => {
        if (result.data.status) {
          const asset = result.data.data.gotDoc[0];
          setData(asset);
        } else {
          message.error(
            "Unable to fetch assets. API response: " + result.data.message
          );
        }
      })
      .catch((err) => {
        setData(null);
        if (err.response.status === 404) {
          message.error("Asset is not available");
          history.push("/dashboard/assets");
        } else {
          message.error("Unable to fetch asset. Error info: " + err);
          AxiosErrorHandler(err, props.logout);
        }
      })
      .finally(() => {
        props.loading(false);
      });
  };

  useEffect(() => {
    getAssetDetails(id);
  }, []);

  return (
    <>
      {
        data &&
        <div style={{ padding: "24px" }}>
          <PageHeader onBack={() => window.history.back()} title={data.assetName} />
          <Row style={{ padding: "25px" }}>
            <Col span={8} style={{ paddingRight: "15px" }}>
              <div>
                <Text type="secondary" style={{ fontSize: "10px" }}>
                  STATUS
                </Text>
                {data.isActive ? (
                  <Text
                    type="success"
                    style={{ fontSize: "20px", display: "block" }}
                  >
                    Active
                  </Text>
                ) : (
                  <Text
                    type="danger"
                    style={{ fontSize: "20px", display: "block" }}
                  >
                    Inactive
                  </Text>
                )}
              </div>
              <Row>
                <Col span={12} style={{ margin: "10px 0" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Owner
                  </Text>
                  <Text style={{ fontSize: "16px", display: "block" }}>
                    {data.assetOwner?.name}
                  </Text>
                </Col>
                <Col span={12} style={{ margin: "10px 0" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Assigned To
                  </Text>
                  <Text style={{ fontSize: "16px", display: "block" }}>
                    {data.userID?.name}
                  </Text>
                </Col>
                <Col span={12} style={{ margin: "10px 0" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Date of Manufacturing
                  </Text>
                  <Text style={{ fontSize: "18px", display: "block" }}>
                    {moment(data.manufactureDate).format("DD/MM/YYYY")}
                  </Text>
                </Col>
                <Col span={12} style={{ margin: "10px 0" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Created At
                  </Text>
                  <Text style={{ fontSize: "18px", display: "block" }}>
                    {moment(data.createdAt).format("DD/MM/YYYY")}
                  </Text>
                </Col>
                <Col span={12} style={{ margin: "10px 0" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Created By
                  </Text>
                  <Text style={{ fontSize: "16px", display: "block" }}>
                    {data.createdBy && data.createdBy.name}
                  </Text>
                </Col>
                <Col span={12} style={{ margin: "10px 0" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Serial No
                  </Text>
                  <Text style={{ fontSize: "18px", display: "block" }}>
                    {data.serialNo}
                  </Text>
                </Col>
              </Row>
              <Text style={{ marginTop: "40px", fontSize: "22px" }}>
                Device Info
              </Text>
              {(data.assetInfo.length > 0) &&
                Object.keys(data.assetInfo[0]).map((key) => {
                  if (key !== "_id") {
                    return (
                      <Row style={{ marginTop: "5px" }}>
                        <Col span={12}>
                          <Text>{key}</Text>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">{data.assetInfo[0][key]}</Text>
                        </Col>
                      </Row>
                    );
                  }
                })}
            </Col>
            <Col span={8}>
              <Title level={4}>Model</Title>
              {data.modelID && <ModelCard id={data.modelID} showDate={false} />}
            </Col>
            <Col span={8}>
              <Title level={4}>Manufacturer</Title>
              {data.manufactureID && (
                <ManufacturerCard id={data.manufactureID} showDate={false} />
              )}
            </Col>
          </Row>
        </div>
      }
    </>
  );
}

export default connect(null, { loading })(AssetView);
