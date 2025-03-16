import React, { useState, useEffect, useContext } from "react";

import http from "../../../services/httpCall";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import {
  Row,
  Col,
  Typography,
  Button,
  Tooltip,
  Image,
  Spin,
  message,
  Select,
  Badge,
} from "antd";
import {
  CameraOutlined,
  EnvironmentOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import apis from "../../../services/apis";
import "../index.less";
import Area from "../../../static/area_icon.svg";
import Perimeter from "../../../static/perimeter_icon.svg";
import * as turf from "@turf/turf";
import moment from "moment";
import getAddressfromLatLong from "../../../services/reverseGeocoding";
import { STATIC_URL } from "src/constants";
import { BsFlagFill } from "react-icons/bs";
import { AuthContext } from "src/services/authUtils";
import { ThreadContext } from "src/services/threadUtils";
import { Layer } from "../layerRender";

const { Text, Paragraph } = Typography;
const { Option } = Select;

function InfoWindow(props) {
  const [properties, setProperties] = useState({});
  const [address, setAddress] = useState("");
  const [loader, setLoader] = useState(false);
  const [area, setArea] = React.useState<any>(
    turf.area(props.feature).toFixed(2)
  );
  const [perimeter, setPerimeter] = React.useState<any>(
    turf.length(props.feature).toFixed(2)
  );
  const [areaUnit, setAreaUnit] = useState("sq. m");
  const [lengthUnit, setLenghtUnit] = useState("km");
  const [flag, setFlag] = useState(false);

  const { logout } = useContext(AuthContext);
  const { thread, openThread } = useContext(ThreadContext);

  const [fileCount, setFileCount] = useState(0);
  const [imageToShow, setImageToshow] = useState<any>([]);
  const [imageLoader, setImageLoader] = useState(false);
  function openImages() {
    props.setImagesDrawer(true);
    props.togglePopup(false);
  }

  function reverseGeocoder(coordinates: any) {
    setLoader(true);
    getAddressfromLatLong(coordinates[1], coordinates[0], (err, address) => {
      if (!err) {
        setAddress(address);
      } else {
        message.error("Location could not be fetched");
      }
      setLoader(false);
    });
  }
  const alertThumbnail = (item: any) => {
    return (
      <Badge
        style={{
          backgroundColor: "#f5222d",
          padding: "5px",
          borderRadius: "5px",
        }}
        offset={[-25, 25]}
        count={
          item.isFlagged ? (
            <BsFlagFill
              style={{
                color: "#fff",
                fontSize: "24px",
              }}
            />
          ) : (
            0
          )
        }
      >
        <Image
          src={STATIC_URL + item.Image}
          preview={false}
          fallback="data:image/png;base64,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"
          style={{
            width: "100%",
            height: "auto",
            minHeight: "200px",
          }}
        />
      </Badge>
    );
  };
  function areaMeasurementHandeller(unit: any) {
    switch (unit) {
      case "sq. km":
        setArea((turf.area(props.feature) / 1000000).toFixed(2));
        setAreaUnit("sq. km");
        break;
      case "sq. m":
        setArea(turf.area(props.feature).toFixed(2));
        setAreaUnit("sq. m");
        break;
      case "acres":
        setArea((turf.area(props.feature) * 0.00025).toFixed(2));
        setAreaUnit("acres");
        break;
      case "hectr":
        setArea((turf.area(props.feature) * 0.0001).toFixed(2));
        setAreaUnit("hectr");
        break;
      default:
        setArea(turf.area(props.feature).toFixed(2));
        setAreaUnit("sq. m");
    }
  }

  function lengthMeasurementHandeller(unit: any) {
    switch (unit) {
      case "km":
        setPerimeter(turf.length(props.feature).toFixed(2));
        setLenghtUnit("km");
        break;
      case "m":
        setPerimeter((turf.length(props.feature) * 1000).toFixed(2));
        setLenghtUnit("m");
        break;
      case "cm":
        setPerimeter((turf.length(props.feature) * 100000).toFixed(2));
        setLenghtUnit("cm");
        break;
      case "ft":
        setPerimeter((turf.length(props.feature) * 3280.84).toFixed(2));
        setLenghtUnit("ft");
        break;
      case "inch":
        setPerimeter((turf.length(props.feature) * 39370.1).toFixed(2));
        setLenghtUnit("inch");
        break;
      default:
        setPerimeter(turf.length(props.feature).toFixed(2));
        setLenghtUnit("km");
    }
  }
  useEffect(() => {
    reverseGeocoder(props.coordinates);
  }, []);

  const saveDrawingButton = () => {
    if (props.canDraw) {
      return (
        <React.Fragment>
          <Row
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              style={{ width: "100%", marginTop: "15px" }}
              type="primary"
              onClick={() => {
                props.setformDrawerVisible(true);
                props.togglePopup(false);
                props.setShowForm(true);
              }}
            >
              Save
            </Button>
          </Row>
        </React.Fragment>
      );
    } else return <></>;
  };

  const CancelDrawingButton = () => {
    return (
      <Row
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "-5px",
        }}
      >
        <Button
          style={{
            width: "100%",
            marginTop: "15px",
            background: "#F77775",
            border: "none",
            color: "#ffffff",
          }}
          onClick={() => {
            props.cancelDrawing();
          }}
        >
          Cancel
        </Button>
      </Row>
    );
  };

  const renderFeatureAddress = () => {
    return (
      <div className="address-content">
        {loader ? (
          <div className="spinner">
            <Spin />
          </div>
        ) : (
          <>
            <Paragraph copyable>{address}</Paragraph>
            <a
              href={`https://www.google.com/maps/?q=${props.coordinates[1]},${props.coordinates[0]}`}
              target="_blank"
              rel="noreferrer"
            >
              Show on google maps
            </a>
          </>
        )}
      </div>
    );
  }

  const renderFeatureOptions = () => {
    return (
      <>
        {!props.show && (
          <div style={{ float: "right", marginTop: "4px" }}>
            <Row>
              {
                props.missionLayer === "Alert" ?
                (<Tooltip placement="right" title={"Open Thread"}>
                  <MessageOutlined
                    style={{
                      color: thread.open ? "#3b86ff" : "#000",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                    onClick={() => {
                      props.setThumbnail(
                        alertThumbnail(props.feature.properties)
                      );
                      openThread("alert", props.feature.properties._id, {});
                    }}
                  />
                </Tooltip>) :
                (<Tooltip placement="bottom" title="Open Media">
                  <Badge
                    size="small"
                    count={fileCount}
                    className="site-badge-count-4"
                  >
                    <CameraOutlined
                      style={{ marginRight: "6px" }}
                      onClick={() => openImages()}
                    />
                  </Badge>
                </Tooltip>)
              }
              {
                props.missionLayer !== "VOD" &&
                <Tooltip
                  placement={props.missionLayer === "Alert" ? "right" : "bottom"}
                  title={props.flag ? "Unflag" : "Flag"}
                >
                  <BsFlagFill
                    style={{
                      color: props.flag ? "#da1c5c" : "#000",
                      cursor: "pointer",
                      [(props.missionLayer === "Alert") ? "fontSize" : ""]: "16px",
                      [(props.missionLayer === "Alert") ? "marginLeft" : ""]: "5px",
                    }}
                    onClick={() => {
                      toggleFlag();
                    }}
                  />
                </Tooltip>
              }
            </Row>
          </div>
        )}
      </>
    );
  }

  const renderAttributeContent = () => {
    return (
      <div className="attribute-content">
        {props.show ? (
          <></>
        ) : (
          <>
            {imageToShow.length > 0 || props.videoToShow?.length > 0 ? (
              <Row>
                <Col span={15} className="properties">
                  {Object.keys(properties).map((key: any) => (
                    <Row key={window.crypto.randomUUID()}>
                      <Col md={10}>
                        <Text className="key" strong>
                          {key}
                        </Text>
                      </Col>
                      <Col md={14}>
                        <span className="value">{properties[key]}</span>
                      </Col>
                    </Row>
                  ))}
                </Col>
                <Col span={9} className="image-part">
                  <Spin spinning={imageLoader}>
                    {props.missionLayer === "Alert" ? (
                      <Image src={STATIC_URL + imageToShow[0]} />
                    ) : props.missionLayer === "VOD" ? (
                      <img
                        src={STATIC_URL + props.videoToShow[0].thumbnail}
                        style={{ cursor: "pointer" }}
                      />
                    ) : (
                      <img
                        src={`${STATIC_URL}/images/geojson/1x_${
                          imageToShow[0].filePath.split("/")[3]
                        }`}
                        onClick={() => openImages()}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </Spin>
                </Col>
              </Row>
            ) : (
              <>
                {Object.keys(properties).map((key: any) => (
                  <Row key={window.crypto.randomUUID()}>
                    <Col md={10}>
                      <Text className="key" strong>
                        {key}
                      </Text>
                    </Col>
                    <Col md={14}>
                      <span className="value">{properties[key]}</span>
                    </Col>
                  </Row>
                ))}
              </>
            )}
          </>
        )}
      </div>
    );
  }

  const initFlag = () => {
    if (props.missionLayer === "Alert") {
      http
        .get(`${apis.FETCH_ALERT_BY_ID}`, {
          params: {
            id: props.feature.properties._id,
          },
        })
        .then((result) => {
          if (result.data.status) {
            console.log("Alert data", result.data.data);
            setFlag(result.data.data[0].isFlagged);
          } else {
            message.error(result.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (props.missionLayer === "Vector" && props.mode === "PointView") {
      if (
        props.AllLayers.find(
          (layer) => layer._id === props.layerId
        )?.flaggedFeatures.includes(props.featureIdx)
      ) {
        setFlag(true);
      } else {
        setFlag(false);
      }
    }
  };

  useEffect(() => {
    if (!props.isPublic) {
      initFlag();
    }
  }, []);

  function updateLayerFlag() {
    const body = {
      featureIndex: [props.featureIdx],
      flag: !flag,
    };
    http
      .patch(`${apis.FLAG_FEATURE}/${props.layerId}`, body)
      .then((res) => {
        if (res.data.status) {
          message.success(
            `Feature ${!body.flag ? "un-flagged" : "flagged"} successfully!`
          );
          props.SetAllLayers((prev: Layer[]) => prev.map((layer) => {
            if (layer._id === props.layerId) {
              if (body.flag) layer.flaggedFeatures.push(props.featureIdx);
              else layer.flaggedFeatures = layer.flaggedFeatures.filter(idx => idx !== props.featureIdx);
            }
            return layer;
          }));
          props.setShouldAttributeTableReload(
            !props.shouldAttributeTableReload
          );
          setFlag(body.flag);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, logout);
      });
  }

  const updateAlert = () => {
    const body = {
      id: props.feature.properties._id,
      update: { isFlagged: !flag },
    };
    http
      .patch(`${apis.UPDATE_ALERT}`, body)
      .then((res) => {
        if (res.data.status) {
          message.success(
            `Image ${
              !body.update.isFlagged ? "un-flagged" : "flagged"
            } successfully!`
          );
          setFlag((prev) => !prev);
        } else message.error(res.data.message);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const toggleFlag = () => {
    if (props.missionLayer === "Vector") {
      updateLayerFlag();
    } else if (props.missionLayer === "Alert") {
      updateAlert();
    } else {
      console.warn("item cannot be flagged");
    }
  };

  function filterProperties(object: any, type: any = "default") {
    const filtered = {};
    const layerLocationCardKeys = [
      "color",
      "Id",
      "imagepaths",
      "icon",
      "sys_id",
    ];
    const missionAlertKeys = [
      "_id",
      "color",
      "icon",
      "Image",
      "LocationID",
      "isFlagged",
    ];
    const missionVODKeys = ["videos"];
    Object.keys(object).forEach((key: any) => {
      if (type === "Alert") {
        if (key === "isFlagged") {
          setFlag(object[key]);
        }
        if (!missionAlertKeys.includes(key)) {
          filtered[key] = object[key];
        }
      } else if (type === "VOD") {
        if (!missionVODKeys.includes(key)) {
          filtered[key] = object[key];
        }
      } else {
        if (!props.isBaseMap) {
          if (!layerLocationCardKeys.includes(key)) {
            filtered[key] = object[key];
          }
        } else {
          if (!layerLocationCardKeys.includes(key) && key !== "Nth") {
            filtered[key] = object[key];
          }
        }
      }
    });
    setProperties(filtered);
  }
  useEffect(() => {
    if (props.missionLayer === "VOD" || props.missionLayer === "Alert") {
      if (props.missionLayer === "Alert") {
        console.log("Alert", props.feature.properties.isFlagged);
        setImageToshow([props.feature.properties.Image]);
        setFileCount(1);
      } else {
        props.setVideoToShow(props.feature.properties.videos);
        setFileCount(props.feature.properties.videos.length);
      }
      filterProperties(props.feature.properties, props.missionLayer);
    } else {
      filterProperties(props.feature.properties);
      setFileCount(0);
      console.log(props.sysId);
      if (props.layerId !== "new" && !props.isPublic) {
        let images: any = [];
        setImageLoader(true);
        console.log("index", props.sysId, "layerId", props.layerId);
        http
          .get(`${apis.FETCH_FEATURE_FILES}`, {
            params: {
              layerId: props.layerId,
              sys_id: props.sysId,
            },
          })
          .then((res) => {
            if (res.data.status) {
              images = res.data.data.filter(
                (i) => i.fileType === "image/jpeg" || i.fileType === "image/png"
              );
              const filtered: any = images.filter((i) => i.coverPhoto === true);
              let toshow: any = [];
              if (filtered.length > 0) {
                toshow = filtered;
              } else {
                toshow = images;
              }
              toshow.sort((a, b) => {
                return moment(b.createdAt).diff(moment(a.createdAt));
              });
              setImageToshow(toshow);
              setFileCount(res.data.data.length);
            } else {
              console.log(res.data.message);
            }
          })
          .catch((err) => {
            console.log(err);
            AxiosErrorHandler(err, logout);
          })
          .finally(() => setImageLoader(false));
      }
    }
    return () => {
      setProperties({});
    };
  }, [props.feature]);

  switch (props.mode) {
    case "PointView":
      return (
        <>
          <div className="infoWindowContent">
            {renderAttributeContent()}
            {renderFeatureAddress()}
            <div className="sub-info">
              <span className="coordinates">
                <Text copyable>
                  <EnvironmentOutlined /> {props.coordinates[1]},{" "}
                  {props.coordinates[0]}
                </Text>
              </span>
              <span>
                {!props.isPublic && renderFeatureOptions()}
              </span>
            </div>
            {props.show && saveDrawingButton()}
            {props.show && CancelDrawingButton()}
          </div>
        </>
      );

    case "PolygonView":
      return (
        <>
          <div className="infoWindowContent">
            {renderAttributeContent()}
            {renderFeatureAddress()}
            <div className="sub-info">
              <span className="coordinates">
                <Text>
                  <img src={Area} />
                  &nbsp;&nbsp;{area}&nbsp;&nbsp;
                  <Select
                    defaultValue={areaUnit}
                    size="small"
                    style={{ width: "70px", fontSize: "12px" }}
                    onChange={areaMeasurementHandeller}
                  >
                    <Option className="option-value" value="sq. m">
                      sq. m
                    </Option>
                    <Option className="option-value" value="sq. km">
                      sq. km
                    </Option>
                    <Option className="option-value" value="acres">
                      acres
                    </Option>
                    <Option className="option-value" value="hectr">
                      hectr
                    </Option>
                  </Select>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                </Text>
                <Text>
                  <img src={Perimeter} />
                  &nbsp;&nbsp;{perimeter}&nbsp;&nbsp;
                  <Select
                    defaultValue={lengthUnit}
                    size="small"
                    style={{ width: "60px", fontSize: "12px" }}
                    onChange={lengthMeasurementHandeller}
                  >
                    <Option className="option-value" value="km">
                      km
                    </Option>
                    <Option className="option-value" value="m">
                      m
                    </Option>
                    <Option className="option-value" value="ft">
                      ft
                    </Option>
                  </Select>
                </Text>
              </span>
              <span>
                {!props.isPublic && renderFeatureOptions()}
              </span>
            </div>
            {props.show && saveDrawingButton()}
            {props.show && CancelDrawingButton()}
          </div>
        </>
      );
    case "LineView":
      return (
        <>
          <div className="infoWindowContent">
            {renderAttributeContent()}
            {renderFeatureAddress()}
            <div className="sub-info">
              <span className="coordinates">
                <Text>
                  <img src={Perimeter} />
                  &nbsp;&nbsp;{perimeter}&nbsp;&nbsp;
                  <Select
                    defaultValue={lengthUnit}
                    size="small"
                    style={{ width: "60px", fontSize: "12px" }}
                    onChange={lengthMeasurementHandeller}
                  >
                    <Option className="option-value" value="km">
                      km
                    </Option>
                    <Option className="option-value" value="m">
                      m
                    </Option>
                    <Option className="option-value" value="ft">
                      ft
                    </Option>
                  </Select>
                </Text>
              </span>
              <span>
                {!props.isPublic && renderFeatureOptions()}
              </span>
            </div>
            {props.show && saveDrawingButton()}
            {props.show && CancelDrawingButton()}
          </div>
        </>
      );
    default:
      return <p>unknown</p>;
  }
}

export default InfoWindow;
