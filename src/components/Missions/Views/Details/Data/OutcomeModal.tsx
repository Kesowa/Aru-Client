import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Spin,
  Image,
  Modal,
  Tooltip,
  Button,
  Avatar,
  notification,
  Tag,
  Cascader,
  Select,
  Input,
  Divider,
  Pagination,
  Empty,
  Statistic,
} from "antd";
import {
  ExclamationOutlined,
  CalendarOutlined,
  UserOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  GoogleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import apis from "../../../../../services/apis";
import http from "../../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";
import { logout } from "../../../../../actions/authAction";
import { connect } from "react-redux";
import moment from "moment";
import * as htmlToImage from "html-to-image";
import "./data.less";
import { STATIC_URL } from "src/constants";

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

function OutcomeModal(props) {
  const [currIndex, setcurrIndex] = useState(0);
  const [dataa, setdataa] = useState<any>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [locationNull, setLocationNull] = useState(false);

  useEffect(() => {
    setcurrIndex(props.index);
  }, [props.index]);

  useEffect(() => {
    setdataa(props.data ? props.data[currIndex] : "");
    if (props.data && props.data[currIndex]?.location) {
      if (props.data[currIndex]?.location?.lat !== 0) {
        setLocationNull(false);
      } else setLocationNull(true);
    } else setLocationNull(true);
    // setLocationNull(props.data && props.data[currIndex]?.location?.lat === 0 ? true : false);
  }, [currIndex]);

  const nextIndex = () => {
    setcurrIndex((currIndex + 1) % props.data.length);
  };

  const previousIndex = () => {
    const ind = currIndex - 1;
    setcurrIndex(ind < 0 ? props.data.length - 1 : ind);
  };

  function truncateText(str) {
    return str.length > 15 ? str.substring(0, 15) + "..." : str;
  }

  return (
    <>
      {dataa && (
        <Modal
          title={"Outcome ID: " + dataa._id}
          centered={true}
          visible={props.visible}
          width={1200}
          closable={true}
          onOk={() => {}}
          onCancel={() => props.closeModal(false)}
          footer={null}
        >
          <div>
            <Row style={{ marginTop: 16 }}>
              <Col span={17}>
                {/* <img src={thumb} style={{ width: "100%", height: "auto" }} /> */}
                <div id="image" className="outcome-view">
                  <Image
                    style={{ width: "100%", height: "auto", cursor: "pointer" }}
                    src={STATIC_URL + dataa.image}
                  />
                  <div className="p-mission">
                    <Row>
                      <Text className="text">
                        mission ID: {dataa.missionId._id}
                      </Text>
                    </Row>
                    <Row>
                      <Text className="text">
                        flight ID: {dataa.flightId._id}
                      </Text>
                    </Row>
                    {dataa.pcount > 0 && (
                      <Row>
                        <Text className="text">
                          People Detected: {dataa.pcount}
                        </Text>
                      </Row>
                    )}
                  </div>
                  <div className="preview-location-name">
                    <Row>
                      <Title className="p-name" level={4}>
                        {dataa.locationName}
                      </Title>
                    </Row>
                    <Row>
                      {!locationNull && (
                        <Text className="p-coord">
                          {dataa.location.lat.toFixed(6)},{" "}
                          {dataa.location.long.toFixed(6)}
                        </Text>
                      )}
                    </Row>
                  </div>
                  {!locationNull && (
                    <div className="static-map-div">
                      <a
                        href={`https://www.google.com/maps/?q=${dataa.location.lat},${dataa.location.long}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          className="static-map"
                          src={`https://maps.googleapis.com/maps/api/staticmap?center=${dataa.location.lat},${dataa.location.long}&zoom=16&size=200x130&markers=size:mid|color:red|${dataa.location.lat},${dataa.location.long}&maptype=roadmap&key=AIzaSyCYWROYTFQ3XH4bhhLJnmJSV-0k9a-PHY8`}
                        />
                      </a>
                    </div>
                  )}
                </div>
              </Col>
              <Col span={7}>
                <Row style={{ marginLeft: "8px" }}>
                  <Title level={5}>
                    <ShareAltOutlined style={{ fontSize: "24px" }} />
                    &nbsp;&nbsp;&nbsp;Share
                  </Title>
                </Row>
                <Row>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++TO BE MADE++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
                  {/* <Tooltip placement="bottom" title="share via email">
                      <Button
                        type="primary"
                        shape="round"
                        icon={<MailOutlined />}
                        size="large"
                      />
                    </Tooltip> */}
                  &nbsp;&nbsp;
                  <Tooltip placement="bottom" title="download image">
                    <Button
                      type="primary"
                      onClick={() => {
                        setDownloadLoading(true);
                        htmlToImage
                          .toPng(document.getElementById("image")!)
                          .then(function (dataUrl) {
                            const a = document.createElement("a");
                            a.href = dataUrl;
                            a.download = `${dataa.locationName}_3355.png`;
                            a.click();
                            setDownloadLoading(false);
                          });
                      }}
                      shape="round"
                      icon={
                        downloadLoading ? (
                          <LoadingOutlined />
                        ) : (
                          <DownloadOutlined />
                        )
                      }
                      size="large"
                    />
                  </Tooltip>
                  &nbsp;&nbsp;
                  {!locationNull && (
                    <Tooltip placement="bottom" title="Google map link">
                      <Button
                        type="default"
                        onClick={() =>
                          props.openNotification(
                            `https://www.google.com/maps/?q=${dataa.location.lat},${dataa.location.long}`,
                            "bottomRight"
                          )
                        }
                        shape="round"
                        icon={<GoogleOutlined />}
                        size="large"
                      >
                        Copy Link
                      </Button>
                    </Tooltip>
                  )}
                </Row>
                <div className="outcome-specific-view-info">
                  <Row>
                    <Text type="secondary">Inference generated</Text>
                  </Row>
                  <Row>
                    <Text strong>{dataa.pcount}</Text>
                  </Row>
                  <Row>
                    <Text type="secondary">Mission ID</Text>
                  </Row>
                  <Row>
                    <Text strong>{props.missionId}</Text>
                  </Row>
                  {/* <Row style={{ marginTop: 8 }}>
                    <Text type="secondary">Location</Text>
                  </Row> */}
                  {/* <Row>
                    <Text strong>{truncateText(dataa.locationName)}</Text>
                  </Row> */}
                  {!locationNull && (
                    <>
                      <Row style={{ marginTop: 8 }}>
                        <Text type="secondary">Coordinates</Text>
                      </Row>
                      <Row>
                        <Text keyboard copyable>
                          {`${dataa.location.lat.toFixed(
                            6
                          )}, ${dataa.location.long.toFixed(6)}`}
                        </Text>
                      </Row>
                    </>
                  )}
                  <div className="outcome-specific-view-created-by">
                    <Row>
                      <Text type="secondary">Snapshot Captured by</Text>
                    </Row>
                    <Row>
                      <div
                        className="pilot-profile-badge"
                        style={{ marginTop: 8 }}
                      >
                        <Avatar
                          key="2"
                          size="large"
                          icon={<UserOutlined />}
                          src={STATIC_URL + dataa.createdBy.avatar}
                        />
                        <div className="pilot-name">
                          <Title level={5} className="designation">
                            {dataa.createdBy.name}
                          </Title>
                          <Text type="secondary">
                            {moment(dataa.createdAt).format(
                              "MMMM Do YYYY, h:mm:ss a"
                            )}
                          </Text>
                        </div>
                      </div>
                    </Row>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <Button
              type="primary"
              onClick={() => previousIndex()}
              style={{ marginRight: "15px" }}
            >
              Previous
            </Button>
            <Button type="primary" onClick={() => nextIndex()}>
              Next
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default OutcomeModal;
