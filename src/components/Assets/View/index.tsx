import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { message, Typography, Row, Col, PageHeader } from "antd";
import ManufacturerCard from "../utils/ManufacturerCard";
import ModelCard from "../utils/ModelCard";
import { connect } from "react-redux";
import { loading } from "../../../actions/loadingAction";
import moment from "moment";
import { Link } from "react-router-dom";
import assetBase from "..";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";

const { Title, Text } = Typography;

function AssetView(props) {
  const [AssetDetails, setAssetDetails] = useState<any>({});
  const [data, setData] = useState<any>({});
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams<any>();
  const history = useHistory();

  useEffect(() => {
    props.loading(true);
    getAssetDetails(id);
  }, []);

  useEffect(() => {
    //console.log(data.assetInfo);
    setDeviceInfo(Object.assign({}, data.assetInfo));
  }, [data]);

  const getAssetDetails = (id) => {
    let asset = props.assets.filter((asset) => {
      return asset._id === id;
    });
    asset = asset[0];
    //console.log(asset);
    if (!asset) {
      message.error("Asset is not available");
      history.push("/dashboard/assets");
      props.loading(false);
      return;
    }
    setAssetDetails(asset);
    setData(asset);
    props.loading(false);
    setIsLoading(false);
    // http
    //   .get(`${API_URL}${apis.GET_MODEL_BY_ID}`, {
    //     params: {
    //       assetID: id,
    //     },
    //   })
    //   .then((result) => {
    //     console.log(result.data);
    //     if (result.data.status) {
    //       setData(result.data.data);
    //       console.log(result.data.data);
    //     } else {
    //       message.error(result.data.message);
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   })
    //   .finally(() => {
    //     setIsLoading(false);
    //   });
  };

  return (
    <div>
      {/* <Title level={2}>{data.assetName}</Title> */}
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
          {deviceInfo[0] &&
            Object.keys(deviceInfo[0]).map((key) => {
              if (key !== "_id") {
                return (
                  <Row style={{ marginTop: "5px" }}>
                    <Col span={12}>
                      <Text>{key}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">{deviceInfo[0][key]}</Text>
                    </Col>
                  </Row>
                );
              }
            })}
        </Col>
        <Col span={8}>
          <Title level={4}>Model</Title>
          {data.modelID && <ModelCard id={data.modelID._id} showDate={false} />}
        </Col>
        <Col span={8}>
          <Title level={4}>Manufacturer</Title>
          {data.manufactureID && (
            <ManufacturerCard id={data.manufactureID} showDate={false} />
          )}
        </Col>
      </Row>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    assets: state.Assets.assets,
  };
};

export default connect(mapStateToProps, { loading })(AssetView);
