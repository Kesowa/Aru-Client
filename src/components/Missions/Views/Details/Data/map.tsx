import React, { useRef, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  message,
  List,
  Spin,
  notification,
} from "antd";
import "./data.less";
import goToMap from "../../../../../assets/go-to-map.svg";
import { useHistory } from "react-router-dom";
import { setChonkyDefaults } from "chonky";
import { loading } from "../../../../../actions/loadingAction";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import moment from "moment";
import apis from "../../../../../services/apis";
import { FileTextOutlined, DownloadOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import http from "../../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";
import { logout } from "../../../../../actions/authAction";
import download from "src/services/download";
import { connect } from "react-redux";
import {
  getImageForCircle,
  getImageForPolygon,
} from "../../../../../services/staticMap";
import io from "socket.io-client";
import { API_URL, STATIC_URL } from "src/constants";

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const { Text, Title } = Typography;
function Map(props) {
  const history = useHistory();
  const [files2, setFiles] = useState([]);
  const [loader, setLoader] = useState(false);
  const [mapImage, setmapImage] = useState("");
  const socket: any = useRef();
  useEffect(() => {
    let mapUrl = "";
    if (props.mission.missionGeofence.circle) {
      const lat = props.mission.missionGeofence.circle.center.lat;
      const lng = props.mission.missionGeofence.circle.center.lng;
      const radius = props.mission.missionGeofence.circle.radius;
      mapUrl = getImageForCircle(lat, lng, radius);
    } else if (props.mission.missionGeofence.polygon) {
      const points = props.mission.missionGeofence.polygon.points;
      mapUrl = getImageForPolygon(points);
    }
    setmapImage(mapUrl);
  }, [props]);

  const downloadAllLayers = (id) => {
    props.loading(true);
    http
      .get(`${apis.DOWNLOAD_ALL_LAYER_FOR_MISSION}`, {
        params: {
          missionId: id,
        },
      })
      .then((res) => {
        // console.log(res);
        if (res.data.status) {
          const url = `${STATIC_URL}/${res.data.link}`;
          //window.open(url, "_blank");
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  //--------socket handleing--------------
  useEffect(() => {
    if (props.id) {
      if (!socket.current) {
        socket.current = io(
          `${API_URL}/stream/mission-specific?missionID=${props.id}`
        );
        socket.current.on("LAYER_ZIP_START", (data) => {
          //console.log("RECC",data);
          message.success(
            "Preparing your data for download, this may take some time!"
          );
          // setRefreshState(true);
          // fetchDocuments();
        });
        socket.current.on("LAYER_ZIP_COMPLETED", (data) => {
          // console.log("RECC2",data);
          const key = `open${Date.now()}`;
          const btn = (
            <a href={`${STATIC_URL}/${data}`} target="_blank" rel="noreferrer">
              <Button type="primary" size="small" onClick={() => {}}>
                Download
              </Button>
            </a>
          );
          notification["success"]({
            message: `Your files are ready!`,
            description: `Click the download button to download all layers of this mission in a zipped file.`,
            btn,
            key,
            placement: "bottomRight",
            duration: null,
          });
          // setRefreshState(true);
          // fetchDocuments();
        });
        socket.current.on("LAYER_ZIP_FAILED", (data) => {
          console.log("ERROR! Could not compress mission layers!", data);
          message.error("Oops! Failed to compress files. Please try again!");
          // setRefreshState(true);
          // fetchDocuments();
        });
      }
    }
  }, [props.id]);

  useEffect(() => {
    setLoader(true);
    http
      .get(`${apis.GET_ALL_LAYERS_FOR_MISSION}?missionId=${props.id}`)
      .then((res) => {
        if (res.data.status) {
          // console.log(res.data.data);
          if (res.data.data !== undefined) {
            const filtered: any = res.data.data.layers;
            filtered.sort((a, b) => {
              return moment(b.createdAt).diff(moment(a.createdAt));
            });
            setFiles(filtered);
          }
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => setLoader(false));
  }, []);

  return (
    <div className="map-data-wrapper">
      <div className="data-container">
        <Row>
          <Col md={8}>
            <Row>
              <div className="text-container">
                {mapImage && (
                  <div
                    className="map-button"
                    onClick={() => history.push("/dashboard/map/" + props.id)}
                    style={{
                      background: `url(${mapImage})`,
                      backgroundSize: "contain",
                    }}
                  >
                    {/* <img
                      // style={{width : "15vw" , height:"15vw"}}
                      className="map-image"
                      src={mapImage}
                      alt='Mapimage is not fetched'
                    /> */}
                    <div className="overlay-content">
                      <div className="inner-content">
                        <Row>
                          <img src={goToMap} alt="Mapimage is not fetched" />
                        </Row>
                        <Row>
                          <span className="overlay-text">Map</span>
                        </Row>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Row>
          </Col>
          <Col md={16}>
            <div className="text-container">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Title level={4} className="title-text">
                  Map files
                </Title>
                {files2.length > 0 ? (
                  <Button
                    onClick={() => {
                      downloadAllLayers(props.id);
                    }}
                  >
                    <DownloadOutlined /> Download All
                  </Button>
                ) : null}
              </div>
              <Spin spinning={loader}>
                <List
                  itemLayout="horizontal"
                  style={{
                    width: "100%",
                    height: "300px",
                    overflow: "auto",
                  }}
                  dataSource={files2}
                  renderItem={(item: any) => (
                    <List.Item
                      actions={[
                        <a
                          key={`1.${item._id}`}
                          onClick={() =>
                            download(STATIC_URL + item.layerpath, item.name + item.layerpath.split('.').pop())
                          }
                        >
                          <DownloadOutlined /> Download
                        </a>,
                      ]}
                    >
                      <List.Item.Meta
                        key={`${item._id}`}
                        avatar={<FileTextOutlined />}
                        title={item.name}
                        description={moment(item.createdAt).format("LLLL")}
                      />
                    </List.Item>
                  )}
                />
              </Spin>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default connect(
  () => {
    return {};
  },
  {
    loading,
    logout,
  }
)(Map);
