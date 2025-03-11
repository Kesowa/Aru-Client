import React, { useState, useEffect, useRef, useContext } from "react";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { default as Shimmer } from "react-loading-skeleton";
import { FlyToInterpolator } from "deck.gl";
import download from "downloadjs";
import {
  Image,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Dropdown,
  Select,
  Drawer,
  Empty,
  Tabs,
  List,
  Modal,
  Switch,
  Button,
  Divider,
  Skeleton,
  Alert,
  Space,
} from "antd";
import {
  FileImageOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  DeleteOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  UploadOutlined,
  AuditOutlined,
  DownOutlined,
  LoadingOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import "../../index.less";
import apis from "../../../../services/apis";
import moment from "moment";
import "../locateBtn.less";
import PictoMap from "../pic2map";
import Link from "antd/lib/typography/Link";
import Paragraph from "antd/lib/typography/Paragraph";
import { PUBLIC_URL, STATIC_URL } from "../../../../constants";
import { featureType, featureTypes } from "src/static/vectorprops";
import { AuthContext } from "src/services/authUtils";

const { Title, Text } = Typography;
const { Option } = Select;

function LayerDocs(props) {
  const [files, populateFiles] = useState<any>([]);
  const [defaultFileList, setDefaultFileList] = useState([]);
  const [progress, setProgress] = useState(0);
  const socket: any = useRef();
  const [loader, setLoader] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [attributess, setAttributes] = useState([]);
  const [attributesLoading, setAttLoading] = useState(false);
  const [selectLoader, setSelectLoader] = useState(false);
  const [reviewShow, setReviewShow] = useState(false);
  const [reviewFiles, populateReviewFiles] = useState([]);
  const [reviewFilesLoader, setReviewFilesLoader] = useState(true);
  const [reviewOptions, setReviewOptions] = useState([]);
  const [isLayerLabel, setIsLayerLabel] = useState(
    props.layerLabel === "No label selected" ? false : true
  );
  const [activateButtons, setActivateButtons] = useState(true);
  const [showConfirmBtn, setShowConfirmBtn] = useState(false);
  const [reviewList, setReviewList] = useState<any>([]);
  const [fetchReviewFiles, setFetchReviewFiles] = useState(false);
  const [confirmingFiles, setConfirmingFiles] = useState(false);
  const [documents, fillDocuments] = useState<any>([]);
  const [subHeading, setSubHeading] = useState("");

  const { logout } = useContext(AuthContext);

  const menuItem1 = [
    {
      key: "1",
      label: "Unassign Group",
    },
    ...reviewOptions.map((item) => ({
      key: `2-${item.index}-${item.label}`,
      label: item.label,
    })),
  ];
  const onClickMenu1 = (e) => {
    if (e.key === "1") {
      unAssignGroup(subHeading.label);
    }
    const splitKey = e.key.split("-");
    if (splitKey[0] === "2") {
      updateReviewList(`${splitKey[1]}-${splitKey[2]}`, subHeading.data.fIndex);
    }
  };
  const menuItem2 = () => {
    const item = [
      {
        key: "submenu",
        label: "Move To",
        children: reviewOptions.map((item) => {
          return {
            key: `1-${item._id}-${item.index}-${item.label}`,
            label: item.label,
          };
        }),
      },
    ];
    return item;
  };
  const onClickMenu2 = (e) => {
    const splitKey = e.key.split("-");
    if (splitKey[0] === "1") {
      updateReviewListSingle(
        splitKey[1],
        splitKey[2],
        subHeading.data.fIndex,
        splitKey[3]
      );
    }
  };
  const tabItem = () => {
    const items = [
      {
        key: "1",
        label: (
          <span>
            <FileImageOutlined />
            Media
          </span>
        ),
        children: (
          <>
            {loader ? (
              <div>
                <Row>
                  <Skeleton paragraph={{ rows: 1 }} />
                </Row>
                <Row>
                  <Col span={8} md={8}>
                    <div style={{ padding: "8px" }}>
                      <Shimmer height={172} width={172} />
                    </div>
                  </Col>
                  <Col span={8} md={8}>
                    <div style={{ padding: "8px" }}>
                      <Shimmer height={172} width={172} />
                    </div>
                  </Col>
                  <Col span={8} md={8}>
                    <div style={{ padding: "8px" }}>
                      <Shimmer height={172} width={172} />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Skeleton paragraph={{ rows: 1 }} />
                </Row>
                <Row>
                  <Col span={8} md={8}>
                    <div style={{ padding: "8px" }}>
                      <Shimmer height={172} width={172} />
                    </div>
                  </Col>
                  <Col span={8} md={8}>
                    <div style={{ padding: "8px" }}>
                      <Shimmer height={172} width={172} />
                    </div>
                  </Col>
                  <Col span={8} md={8}>
                    <div style={{ padding: "8px" }}>
                      <Shimmer height={172} width={172} />
                    </div>
                  </Col>
                </Row>
              </div>
            ) : (
              renderMedia()
            )}
          </>
        ),
      },
      {
        key: "2",
        label: (
          <span>
            <FileTextOutlined />
            Documents
          </span>
        ),
        children: (
          <Row>
            {loader ? (
              <Spin
                size="large"
                style={{
                  position: "relative",
                  margin: "auto",
                }}
              />
            ) : (
              renderDocuments()
            )}
          </Row>
        ),
      },
    ];
    if (props.isBaseMap) {
      if (props.canUpdateBaseLayer) {
        items.push({
          key: "3",
          label: (
            <span>
              <SettingOutlined />
              Layer Settings
            </span>
          ),
          children: (
            <>
              {props.layerData.vector &&
              featureType[props.layerData.vector] ===
                featureTypes.MULTI_POLYGON ? (
                <>
                  <Title level={4}>Enable 3D</Title>
                  <Alert
                    message="How to use?"
                    description="For this feature to work, you need to have the property ${Height} present in all the features of the layer!"
                    type="info"
                    showIcon
                  />
                  <div
                    style={{
                      paddingLeft: "5rem",
                      paddingRight: "5rem",
                      paddingTop: "1rem",
                      //backgroundColor: "orange",
                      display: "flex",
                    }}
                  >
                    <p>Toggle 3D transpose</p>
                    <Switch
                      style={{ marginLeft: "5rem" }}
                      onChange={switchHandle}
                      checked={props.layer.T3DTranspose}
                    />
                  </div>
                  <Divider />
                  {layerLabelSelector()}
                  {/* Make map public */}
                  <Divider />
                  <Title level={4}>Make layer public</Title>
                  {!props.layer.isPublic && (
                    <Alert
                      message="Warning! This process is irreversible!"
                      type="warning"
                      showIcon
                    />
                  )}
                  {madePublic && (
                    <Alert
                      message="Please save the map link as this won't be shared further on."
                      type="info"
                      showIcon
                    />
                  )}
                  <div
                    style={{
                      paddingLeft: "5rem",
                      paddingRight: "5rem",
                      paddingTop: "1rem",
                      //backgroundColor: "orange",
                      display: "flex",
                    }}
                  >
                    <p>Public Visibility</p>
                    <span>
                      {props.layer.isPublic ? (
                        <Text
                          type="secondary"
                          style={{
                            marginLeft: "20px",
                          }}
                        >
                          {" "}
                          Deactivate
                        </Text>
                      ) : (
                        <Link
                          href="#"
                          onClick={() => {
                            makePublic();
                          }}
                          style={{
                            marginLeft: "20px",
                          }}
                        >
                          Activate
                        </Link>
                      )}{" "}
                      {publicLoading ? <LoadingOutlined /> : <></>}
                    </span>
                  </div>
                  {madePublic && (
                    <Space direction="vertical">
                      <Title level={5}>
                        {" "}
                        <LinkOutlined /> Your public map link
                      </Title>
                      <Paragraph
                        copyable
                        ellipsis
                        style={{
                          backgroundColor: "#e9e9f0",
                          fontSize: "16px",
                          padding: "8px",
                          borderRadius: "4px",
                          width: "400px",
                        }}
                      >{`${PUBLIC_URL}/map/${publicMapRefId}`}</Paragraph>
                    </Space>
                  )}
                </>
              ) : (
                <>
                  {layerLabelSelector()}
                  <Divider />
                  <Title level={4}>Make layer public</Title>
                  {!props.layer.isPublic && (
                    <Alert
                      message="Warning! This process is irreversible!"
                      type="warning"
                      showIcon
                    />
                  )}
                  {madePublic && (
                    <Alert
                      message="Please save the map link as this won't be shared further on."
                      type="info"
                      showIcon
                    />
                  )}
                  <div
                    style={{
                      paddingLeft: "5rem",
                      paddingRight: "5rem",
                      paddingTop: "1rem",
                      //backgroundColor: "orange",
                      display: "flex",
                    }}
                  >
                    <p>Public Visibility</p>
                    <span>
                      {props.layer.isPublic ? (
                        <Text
                          type="secondary"
                          style={{
                            marginLeft: "20px",
                          }}
                        >
                          {" "}
                          Deactivate
                        </Text>
                      ) : (
                        <Link
                          href="#"
                          onClick={() => {
                            makePublic();
                          }}
                          style={{
                            marginLeft: "20px",
                          }}
                        >
                          Activate
                        </Link>
                      )}{" "}
                      {publicLoading ? <LoadingOutlined /> : <></>}
                    </span>
                  </div>
                  {madePublic && (
                    <Space direction="vertical">
                      <Title level={5}>
                        {" "}
                        <LinkOutlined /> Your public map link
                      </Title>
                      <Paragraph
                        copyable
                        ellipsis
                        style={{
                          backgroundColor: "#e9e9f0",
                          fontSize: "16px",
                          padding: "8px",
                          borderRadius: "4px",
                          width: "400px",
                        }}
                      >{`${PUBLIC_URL}/map/${publicMapRefId}`}</Paragraph>
                    </Space>
                  )}
                </>
              )}
            </>
          ),
        });
        items.push({
          key: "4",
          label: (
            <span>
              <AuditOutlined />
              Review
            </span>
          ),
          children: (
            <>
              {reviewFilesLoader ? (
                <div>
                  <Row>
                    <Skeleton paragraph={{ rows: 1 }} />
                  </Row>
                  <Row>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Skeleton paragraph={{ rows: 1 }} />
                  </Row>
                  <Row>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                <>
                  {reviewFiles.length > 0 ? (
                    <div>
                      {reviewFiles.map((subHeading: any) => {
                        return (
                          <>
                            <Row>
                              <Dropdown
                                onOpenChange={() => setSubHeading(subHeading)}
                                menu={{
                                  items: menuItem1,
                                  onClick: onClickMenu1,
                                }}
                                trigger={["click"]}
                              >
                                <Text
                                  onClick={(e: any) => e.preventDefault()}
                                  style={{ cursor: "pointer" }}
                                >
                                  <EnvironmentOutlined />{" "}
                                  {subHeading.label === null
                                    ? "Unassigned Images"
                                    : subHeading.label}{" "}
                                  <DownOutlined />
                                </Text>
                              </Dropdown>
                            </Row>
                            <Row>
                              {subHeading.data.files.map((item: any) => {
                                return (
                                  <Col span={8} md={8}>
                                    <div>
                                      <Dropdown
                                        onOpenChange={() =>
                                          setSubHeading(subHeading)
                                        }
                                        menu={{
                                          items: menuItem2(),
                                          onClick: onClickMenu2,
                                        }}
                                        trigger={["contextMenu"]}
                                      >
                                        <Image
                                          key={`${item._id}`}
                                          style={{ padding: "8px" }}
                                          width={"auto"}
                                          height={180}
                                          src={`${STATIC_URL}/images/geojson/1x_${
                                            item.filePath.split("/")[3]
                                          }`}
                                          preview={false}
                                          fallback="data:image/png;base64,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"
                                        />
                                      </Dropdown>
                                    </div>
                                  </Col>
                                );
                              })}
                            </Row>
                          </>
                        );
                      })}
                    </div>
                  ) : (
                    <Empty style={{ margin: "auto" }} />
                  )}
                </>
              )}
            </>
          ),
        });
      }
    } else {
      if (props.canEditLayer) {
        items.push({
          key: "3",
          label: (
            <span>
              <SettingOutlined />
              Layer Settings
            </span>
          ),
          children: (
            <>
              {props.layerData.vector &&
              featureType[props.layerData.vector] ===
                featureTypes.MULTI_POLYGON ? (
                <>
                  <Title level={3}>Enable 3D</Title>
                  <div
                    style={{
                      paddingLeft: "5rem",
                      paddingRight: "5rem",
                      paddingTop: "1rem",
                      //backgroundColor: "orange",
                      display: "flex",
                    }}
                  >
                    <p>Toggle 3D transpose</p>
                    <Switch
                      style={{ marginLeft: "5rem" }}
                      onChange={switchHandle}
                      checked={props.layer.T3DTranspose}
                    />
                  </div>
                  <Divider />
                  {layerLabelSelector()}
                </>
              ) : (
                <>{layerLabelSelector()}</>
              )}
            </>
          ),
        });
        items.push({
          key: "4",
          label: (
            <span>
              <AuditOutlined />
              Review
            </span>
          ),
          children: (
            <>
              {reviewFilesLoader ? (
                <div>
                  <Row>
                    <Skeleton paragraph={{ rows: 1 }} />
                  </Row>
                  <Row>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Skeleton paragraph={{ rows: 1 }} />
                  </Row>
                  <Row>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                    <Col span={8} md={8}>
                      <div style={{ padding: "8px" }}>
                        <Shimmer height={172} width={172} />
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                <>
                  {reviewFiles.length > 0 ? (
                    <div>
                      {reviewFiles.map((subHeading: any) => {
                        return (
                          <>
                            <Row>
                              <Dropdown
                                onOpenChange={() => setSubHeading(subHeading)}
                                menu={{
                                  items: menuItem1,
                                  onClick: onClickMenu1,
                                }}
                                trigger={["click"]}
                              >
                                <Text
                                  onClick={(e: any) => e.preventDefault()}
                                  style={{ cursor: "pointer" }}
                                >
                                  <EnvironmentOutlined />{" "}
                                  {subHeading.label === null
                                    ? "Unassigned Images"
                                    : subHeading.label}{" "}
                                  <DownOutlined />
                                </Text>
                              </Dropdown>
                            </Row>
                            <Row>
                              {subHeading.data.files.map((item: any) => {
                                return (
                                  <Col span={8} md={8}>
                                    <div>
                                      <Dropdown
                                        onOpenChange={() =>
                                          setSubHeading(subHeading)
                                        }
                                        menu={{
                                          items: menuItem2(),
                                          onClick: onClickMenu2,
                                        }}
                                        trigger={["contextMenu"]}
                                      >
                                        <Image
                                          key={`${item._id}`}
                                          style={{ padding: "8px" }}
                                          width={"auto"}
                                          height={180}
                                          src={`${STATIC_URL}/images/geojson/1x_${
                                            item.filePath.split("/")[3]
                                          }`}
                                          preview={false}
                                          fallback="data:image/png;base64,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"
                                        />
                                      </Dropdown>
                                    </div>
                                  </Col>
                                );
                              })}
                            </Row>
                          </>
                        );
                      })}
                    </div>
                  ) : (
                    <Empty style={{ margin: "auto" }} />
                  )}
                </>
              )}
            </>
          ),
        });
      }
    }
    return items;
  };
  //-----------extract images------------------------
  function extractImages(files: any) {
    const images: any = [];
    files.map((item: any) => {
      if (item.fileType === "image/png" || item.fileType === "image/jpeg") {
        images.push(item);
      }
    });
    return images;
  }

  //-----------extract images------------------------
  function extractDocuments(files: any) {
    const documents: any = [];
    files.map((item: any) => {
      if (
        item.fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        item.fileType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        item.fileType === "application/pdf" ||
        item.fileType ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) {
        documents.push(item);
      }
    });
    return documents;
  }

  //---------------Populating images----------------------
  useEffect(() => {
    if (props.visible) {
      if (refresh) {
        setRefresh(false);
        setLoader(true);
        const newdata: any = [];
        http
          .get(`${apis.FETCH_FEATURE_FILES}`, {
            params: {
              layerId: props.layerId,
            },
          })
          .then((res) => {
            if (res.data.status) {
              console.log("layer files result", res.data);
              const finalArray: any = [];
              const LastFeature: any = [];
              const images: any = extractImages(res.data.data);
              const documents: any = extractDocuments(res.data.data);
              if (documents.length > 0) {
                fillDocuments(documents);
              }
              images.map((data: any) => {
                if (LastFeature.includes(data.sys_Id) === false) {
                  const x: any = {
                    label: data.featureLabel,
                    data: {
                      fIndex: data.sys_Id,
                      files: [],
                    },
                  };
                  const index = data.sys_Id;
                  images.map((dataa: any) => {
                    if (index === dataa.sys_Id) {
                      x.data.files.push(dataa);
                    }
                  });
                  finalArray.push(x);
                  LastFeature.push(data.sys_Id);
                }
              });
              populateFiles(finalArray);
            } else {
              if (res.data.message !== "Oops no data to show") {
                //console.log(res.data);
                message.error(res.data.message);
              }
            }
          })
          .catch((err) => {
            message.error(err);
            AxiosErrorHandler(err, logout);
          })
          .finally(() => setLoader(false));
      } else {
        setLoader(true);
        const newdata: any = [];
        http
          .get(`${apis.FETCH_FEATURE_FILES}`, {
            params: {
              layerId: props.layerId,
            },
          })
          .then((res) => {
            if (res.data.status) {
              const finalArray: any = [];
              const LastFeature: any = [];
              const images: any = extractImages(res.data.data);
              const documents: any = extractDocuments(res.data.data);
              if (documents.length > 0) {
                fillDocuments(documents);
              }
              images.map((data: any) => {
                if (LastFeature.includes(data.sys_Id) === false) {
                  const x: any = {
                    label: data.featureLabel,
                    data: {
                      fIndex: data.sys_Id,
                      files: [],
                    },
                  };
                  const index = data.sys_Id;
                  images.map((dataa: any) => {
                    if (index === dataa.sys_Id) {
                      x.data.files.push(dataa);
                    }
                  });
                  finalArray.push(x);
                  LastFeature.push(data.sys_Id);
                }
              });
              populateFiles(finalArray);
            } else {
              if (res.data.message !== "Oops no data to show") {
                //console.log(res.data);
                message.error(res.data.message);
              }
            }
          })
          .catch((err) => {
            message.error(err);
            AxiosErrorHandler(err, logout);
          })
          .finally(() => setLoader(false));
      }
    }
  }, [props.layerId, props.featureIndex, props.visible, refresh]);

  //-------------Fetching review files-----------------------------
  useEffect(() => {
    if (
      (props.visible || fetchReviewFiles) &&
      (props.canEditLayer || props.canUpdateBaseLayer)
    ) {
      //setActivateButtons(true);
      setReviewFilesLoader(true);
      setFetchReviewFiles(false);
      http
        .get(`${apis.FETCH_UNCHECKED_FILES}`, {
          params: {
            layerId: props.layerId,
          },
        })
        .then((res) => {
          if (res.data.status) {
            const finalArray: any = [];
            const lastFeature: any = [];
            //console.log("array is full")
            console.log(res.data.data);
            res.data.data.map((data: any) => {
              if (lastFeature.includes(data.sys_Id) === false) {
                const x: any = {
                  label: data.featureLabel,
                  data: {
                    fIndex: data.sys_Id,
                    files: [],
                  },
                };
                const index = data.sys_Id;
                res.data.data.map((dataa: any) => {
                  if (index === dataa.sys_Id) {
                    x.data.files.push(dataa);
                  }
                });
                finalArray.push(x);
                lastFeature.push(data.sys_Id);
              }
            });
            const UnassignedImages: any = finalArray.filter(
              (i) => i.label === null
            ); // filtering the unassigned entry
            const filtered2Array: any = finalArray.filter(
              (i) => i.label !== null
            ); //filtering the array to get rid of the unassigned object
            if (UnassignedImages.length > 0) {
              filtered2Array.unshift(UnassignedImages[0]);
              populateReviewFiles(filtered2Array);
            } else {
              populateReviewFiles(finalArray);
            }
          } else {
            if (res.data.message !== "Could not fetch layer files!") {
              message.error(res.data.message);
            } else {
              //console.log(res.data);
              const emptyArray: any = [];
              populateReviewFiles(emptyArray);
            }
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setReviewFilesLoader(false);
          setReviewShow(false);
        });
      const data = fetchJSON().then((data) => {
        const filteredArrayy: any = [];
        data?.features.forEach(function (value, i) {
          let objecty: any = {};
          let test;
          if (props.layerLabel) {
            test = value.properties[props.layerLabel];
          }
          objecty = {
            index: value.properties.sys_id,
            label: test,
          };
          filteredArrayy.push(objecty);
        });
        setReviewOptions(filteredArrayy);
      });

      //console.log(data);
    }
  }, [
    props.layerId,
    props.featureIndex,
    props.visible,
    reviewShow,
    fetchReviewFiles,
  ]);

  //set Review list--------------------
  useEffect(() => {
    const currentReviewList: any = [];
    const filteredReviewList: any = reviewFiles.filter(
      (i: any) => i.label !== null
    );
    if (filteredReviewList.length > 0) {
      filteredReviewList.map((item: any) => {
        let sampleObj: any = {};
        item.data.files.map((data: any) => {
          sampleObj = {
            _id: data._id,
            sys_Id: item.data.fIndex !== null ? item.data.fIndex : null,
          };
          currentReviewList.push(sampleObj);
        });
      });
      setReviewList(currentReviewList);
    }
  }, [reviewFiles]);

  //-------update review list-----------------------
  function updateReviewList(value, currentIndex) {
    const files: any = reviewFiles;
    const [featureIndex, featureLabel] = value.split(/-(.+)/);
    //console.log("featureLable: ", featureLabel, "selectedIndex: ", featureIndex, "currentIndex: ", currentIndex)
    if (currentIndex === featureIndex) {
      console.log("no change");
    } else {
      let newIndexFiles: any = [];
      newIndexFiles = files.filter((i) => i.data.fIndex == featureIndex);
      const currentIndexFiles: any = files.filter(
        (i) => i.data.fIndex === currentIndex
      );
      if (newIndexFiles.length > 0) {
        currentIndexFiles[0].data.files.map((i: any) => {
          newIndexFiles[0].data.files.push(i);
        });
        const filteredArray: any = files.filter(
          (i) =>
            i.data.fIndex !== currentIndex && i.data.fIndex !== featureIndex
        );
        newIndexFiles.map((i: any) => {
          filteredArray.push(i);
        });
        populateReviewFiles(filteredArray);
      } else {
        const newFiles: any = [
          {
            label: featureLabel,
            data: {
              fIndex: featureIndex,
              files: [],
            },
          },
        ];
        currentIndexFiles[0].data.files.map((i: any) => {
          newFiles[0].data.files.push(i);
        });
        const filteredArray: any = files.filter(
          (i) => i.data.fIndex !== currentIndex
        );
        newFiles.map((i: any) => {
          filteredArray.push(i);
        });
        populateReviewFiles(filteredArray);
      }
    }
  }
  const layerLabelSelector = () => {
    console.log("props.layerLabel", props.layerLabel);
    return (
      <>
        <Title level={4}>Layer Label</Title>
        <Alert
          message="What is layer label?"
          description="A layer label points to the attribute of a feature, that you want to associate with all the files linked with a layer"
          type="info"
          showIcon
        />
        <div style={{ marginTop: "8px" }}>
          <p>Select your layer label</p>
          <Spin spinning={attributesLoading}>
            <Select
              placeholder={props.layerLabel}
              style={{ width: "100%" }}
              onChange={handleChange}
              loading={selectLoader}
              virtual={false}
            >
              {attributess.map((item: any) => {
                return (
                  <Option key={`1-${item}`} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </Spin>
        </div>
        {isLayerLabel && (
          <div style={{ marginTop: "1rem" }}>
            <p>Popup Attribute</p>
            <Select
              placeholder={props.layerPopupLabel}
              style={{ width: "100%" }}
              onChange={handlePopupAttrChange}
              virtual={false}
            >
              {attributess.map((item: any) => {
                return (
                  <Option key={`1-${item}`} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </div>
        )}
      </>
    );
  };
  //------Review single item-----------------------
  function updateReviewListSingle(
    id: any,
    index: any,
    current: any,
    newLabel: any
  ) {
    //console.log(id, index, current);
    if (index.toString() !== current) {
      const files: any = reviewFiles;
      const originalDesitination = files.filter(
        (i: any) => i.data.fIndex === current
      ); //---filtering the current layerfile
      //console.log(originalDesitination);
      const fileInQuestion = originalDesitination[0].data.files.filter(
        (i: any) => i._id === id
      ); //------filtering the file in question
      //console.log(originalDesitination, fileInQuestion);
      originalDesitination[0].data.files =
        originalDesitination[0].data.files.filter((i: any) => i._id !== id); //---removing selected file from original destination
      const newDestination = files.filter(
        (i: any) => i.data.fIndex === index.toString()
      ); //-----filtering new destination for file
      //console.log("new destination",newDestination, "original destination",originalDesitination,"file in question", fileInQuestion)
      if (newDestination.length > 0) {
        newDestination[0].data.files.push(fileInQuestion[0]);
        const filtered = files.filter(
          (i: any) =>
            i.data.fIndex !== index.toString() && i.data.fIndex !== current
        );
        if (originalDesitination[0].data.files.length > 0) {
          filtered.push(originalDesitination[0]);
        }
        filtered.push(newDestination[0]);
        //console.log(filtered);
        const UnassignedImages: any = filtered.filter((i) => i.label === null); // filtering the unassigned entry
        const filtered2Array: any = filtered.filter((i) => i.label !== null); //filtering the array to get rid of the unassigned object
        if (UnassignedImages.length > 0) {
          filtered2Array.unshift(UnassignedImages[0]);
          populateReviewFiles(filtered2Array);
        } else {
          populateReviewFiles(filtered);
        }
        //populateReviewFiles(filtered);
      } else {
        const object: any = {
          label: newLabel,
          data: {
            fIndex: index.toString(),
            files: [],
          },
        };
        object.data.files.push(fileInQuestion[0]);
        const filtered = files.filter((i: any) => i.data.fIndex !== current);
        filtered.push(object);
        if (originalDesitination[0].data.files.length > 0) {
          filtered.push(originalDesitination[0]);
        }
        //console.log(filtered);
        const UnassignedImages: any = filtered.filter((i) => i.label === null); // filtering the unassigned entry
        const filtered2Array: any = filtered.filter((i) => i.label !== null); //filtering the array to get rid of the unassigned object
        if (UnassignedImages.length > 0) {
          filtered2Array.unshift(UnassignedImages[0]);
          populateReviewFiles(filtered2Array);
        } else {
          populateReviewFiles(filtered);
        }
        //populateReviewFiles(filtered);
      }
    }
  }

  useEffect(() => console.log(reviewList), [reviewList]);
  //------------confirm review list-----------------------
  function confirmReviewdFiles() {
    if (reviewList.length > 0) {
      setConfirmingFiles(true);
      const payload: any = {
        layerId: props.layerId,
        check: reviewList,
      };
      http
        .patch(`${apis.CONFIRM_REVIEW_IMAGES}`, payload)
        .then((res) => {
          if (res.data.status) {
            //console.log(res.data);
          } else {
            message.error(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setFetchReviewFiles(true);
          setConfirmingFiles(false);
          message.success("Files successfully reviewed!");
          setRefresh(true);
        });
    } else {
      message.warning("Please assign at least 1 image to a feature!");
    }
  }

  //------------Delete File-----------------------------
  function deleteFile(id: any) {
    http
      .delete(`${apis.DELETE_FEATURE_FILE}`, {
        params: {
          id: id,
        },
      })
      .then((res) => {
        if (res.data.status) {
          //console.log("FIle detelted", res.data);
          message.success("File Deleted!");
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setRefresh(true);
      });
  }

  //-------------Handle Drawer Close------------------------
  const onClose = () => {
    props.setVisibility(false);
    setDefaultFileList([]);
    props.set3Dstate("");
    setMadePublic(false);
    setPublicMapRefId("");
    setTimeout(() => {
      props.renderLayerDocs(false);
    }, 1000);
  };

  //-------------- render media content --------------------
  function renderMedia() {
    const media: any = files;
    const items = [
      {
        key: "1",
        label: "Download",
        icon: <DownloadOutlined />,
      },
      {
        key: "2",
        label: "Delete",
        icon: <DeleteOutlined />,
      },
    ];
    const genOnClick = (mediaItem: any) => {
      return (e: unknown) => {
        if (e.key === "1") {
          download(PUBLIC_URL + mediaItem.filePath);
        }
        if (e.key === "2") {
          Modal.confirm({
            title: "Delete Image?",
            icon: <ExclamationCircleOutlined />,
            content: "Are you sure you want to delete this Image?",
            okText: "Yes",
            cancelText: "No",
            onOk: () => {
              deleteFile(mediaItem._id);
            },
          });
        }
      };
    };
    return (
      <div>
        {media.length > 0 ? (
          <Image.PreviewGroup>
            {media.map((subHeading: any) => {
              return (
                <>
                  <Row>
                    <Text
                      onClick={(e: any) => {
                        e.preventDefault();
                        props.setViewport({
                          longitude: parseFloat(
                            subHeading.data.files[0].centerPoints.lng
                          ),
                          latitude: parseFloat(
                            subHeading.data.files[0].centerPoints.lat
                          ),
                          zoom: 20,
                          pitch: 0,
                          minZoom: 0,
                          maxZoom: 22,
                          bearing: 0,
                          transitionDuration: 2000,
                          transitionInterpolator: new FlyToInterpolator(),
                        });
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <EnvironmentOutlined /> {subHeading.label}
                    </Text>
                  </Row>
                  <Row>
                    {subHeading.data.files.map((item: any) => {
                      return (
                        <Dropdown
                          menu={{ items, onClick: genOnClick(item) }}
                          trigger={["contextMenu"]}
                        >
                          <Image
                            key={`${item._id}`}
                            style={{ padding: "8px" }}
                            width={"auto"}
                            height={180}
                            src={
                              STATIC_URL +
                              "/images/geojson/1x_" +
                              item.filePath.split("/")[3]
                            }
                            preview={{
                              src:
                                STATIC_URL +
                                "/images/geojson/2x_" +
                                item.filePath.split("/")[3],
                            }}
                            fallback="data:image/png;base64,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"
                          />
                        </Dropdown>
                      );
                    })}
                    <Divider />
                  </Row>
                </>
              );
            })}
          </Image.PreviewGroup>
        ) : (
          <Empty style={{ position: "relative", margin: "auto" }} />
        )}
      </div>
    );
  }

  //--------------------- Render Document Content-----------------------
  function renderDocuments() {
    const data: any[] = documents;
    data.sort((a, b) => {
      return moment(b.createdAt).diff(moment(a.createdAt));
    });
    return (
      <>
        <List
          itemLayout="horizontal"
          style={{
            width: "100%",
          }}
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              actions={[
                <a
                  key={`1.${item._id}`}
                  onClick={() => window.open(`${PUBLIC_URL}${item.filePath}`)}
                >
                  <DownloadOutlined /> Download
                </a>,
                <>
                  {props.canDelete ? (
                    <a
                      key={`2.${item._id}`}
                      onClick={() => {
                        Modal.confirm({
                          title: "Delete Document?",
                          icon: <ExclamationCircleOutlined />,
                          content:
                            "Are you sure you want to delete this Document?",
                          okText: "Yes",
                          cancelText: "No",
                          onOk: () => {
                            deleteFile(item._id);
                          },
                        });
                      }}
                    >
                      <DeleteOutlined /> Delete
                    </a>
                  ) : (
                    <></>
                  )}
                </>,
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
        {/* {data.map((item:any)=>{
            return(<p>{item.name}</p>)
          })} */}
      </>
    );
  }

  function switchHandle(checked) {
    //console.log(`switch to ${checked}`);
    if (checked) {
      props.set3Dstate("Enabled");
    } else {
      props.set3Dstate("Disabled");
    }
  }

  const showModal = () => {
    setIsModalVisible(true);
  };

  // set layer label api
  function handleChange(value) {
    //console.log(`selected ${value}`);
    const payload = {
      layerId: props.layerId,
      label: value,
    };
    setSelectLoader(true);
    http
      .patch(`${apis.SET_LAYER_LABEL}`, payload)
      .then((res: any) => {
        if (res.data.status) {
          message.success("Layer labelled!");
          setIsLayerLabel(true);
          props.setSelectedLayerLabel(res.data.data.layerLabel);
          props.updateLayerDataAfterEditing(res.data.data, null, null);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => setSelectLoader(false));
  }

  function handlePopupAttrChange(value) {
    //console.log(`selected ${value}`);
    const payload = {
      layerId: props.layerId,
      label: value,
    };
    http
      .patch(`${apis.SET_LAYER_LABEL}?popup=true`, payload)
      .then((res: any) => {
        if (res.data.status) {
          message.success("Feature Point popup labelled!");
          props.setSelectedLayerPopupLabel(res.data.data.layerPopupLabel);
          props.updateLayerDataAfterEditing(res.data.data, null, null);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      });
  }

  // make layer public
  const [publicLoading, setPublicLoader] = useState(false);
  const [madePublic, setMadePublic] = useState(false);
  const [publicMapRefId, setPublicMapRefId] = useState("");

  function makePublic() {
    const payload: any = {
      layerId: props.layerId,
    };
    setPublicLoader(true);
    http
      .patch<components["schemas"]["PublishBaseLayerResponse"]>(
        `${apis.MAKE_LAYER_PUBLIC}`,
        payload
      )
      .then((res: any) => {
        if (res.data.status) {
          message.success("Layer has been made public!");
          setMadePublic(true);
          setPublicMapRefId(res.data.publicMapRef);
          props.updateLayerDataAfterEditing(res.data.data, null, null);
        } else message.warning(res.data.message);
      })
      .catch((err: any) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => setPublicLoader(false));
  }

  //---Get properties keys ---

  async function fetchJSON() {
    console.log("props.layerPath", props.layerPath);
    try {
      const res = await fetch(`${STATIC_URL}${props.layerPath}`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (props.visible) {
      setAttLoading(true);
      fetchJSON()
        .then((data) => {
          // let filteredObjectArray:any = [];
          // data.features.map((feature: any)=>{
          //   let filteredProps = {};
          //   Object.keys(feature.properties).filter((key: any)=>{
          //     if(
          //       key !== "color" &&
          //       key !== "Id" &&
          //       key !== "imagepaths" &&
          //       key !== "icon"
          //     ) {
          //       filteredProps[key] = feature.properties[key];
          //     }
          //   });
          //   filteredObjectArray.push(filteredProps);
          // });
          // console.log(filteredObjectArray);

          const attributes: any = [];
          Object.keys(data.features[0].properties).forEach((key: any) => {
            if (
              key !== "color" &&
              key !== "Id" &&
              key !== "imagepaths" &&
              key !== "icon" &&
              key !== "sys_id" &&
              key !== "Nth"
            ) {
              attributes.push(key);
            }
          });
          //console.log(attributes);
          setAttributes(attributes);
        })
        .catch((err) => {
          console.log("could not fetch geojson");
        })
        .finally(() => setAttLoading(false));
    }
  }, [props.visible]);

  //------handling render of confirm button based on tabclick----------
  const onClickForTab = (key: any, value: any) => {
    if (key == 4) {
      setReviewShow(true);
      setShowConfirmBtn(true);
    } else {
      setShowConfirmBtn(false);
    }
  };

  // ----------Unassign whole group-----------------
  function unAssignGroup(label: any) {
    const file: any = reviewFiles;
    const fileToUnassign: any = file.filter((i) => i.label == label);
    const filteredArray: any = file.filter((i) => i.label !== label);
    fileToUnassign.map((i: any) => {
      const x: any = {
        label: null,
        data: {
          fIndex: i.data.fIndex,
          files: i.data.files,
        },
      };
      filteredArray.push(x);
    });
    populateReviewFiles(filteredArray);
  }

  return (
    <>
      <PictoMap
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        layerId={props.layerId}
        layerPath={props.layerPath}
        layerLabel={props.layerLabel}
        setRefresh={setRefresh}
        triggerReviewReload={setFetchReviewFiles}
        missionId={props.missionId}
        data={props.picToMapData}
        setData={props.setPicToMapData}
      />
      <Drawer
        title={props.title}
        width={600}
        placement="right"
        closable={true}
        onClose={onClose}
        open={props.visible}
        footer={
          <>
            {(props.isBaseMap
              ? props.canUploadToBaseLayer
              : props.canUploadFileToGeojson) && (
              <Button
                type="dashed"
                icon={<UploadOutlined />}
                style={{ float: "right" }}
                onClick={showModal}
              >
                Upload to features
              </Button>
            )}
            {showConfirmBtn && reviewFiles.length > 0 ? (
              <>
                <Button
                  type="primary"
                  style={{ float: "left" }}
                  onClick={() => confirmReviewdFiles()}
                  loading={confirmingFiles}
                  disabled={confirmingFiles}
                >
                  Confirm images
                </Button>
              </>
            ) : (
              <></>
            )}
          </>
        }
      >
        <Row style={{ marginTop: "-1.5rem" }}>
          {props.isRenderContent ? (
            <Tabs
              defaultActiveKey="1"
              size="large"
              centered
              style={{ width: "100%" }}
              onTabClick={onClickForTab}
              items={tabItem()}
            ></Tabs>
          ) : (
            <></>
          )}
        </Row>
      </Drawer>
    </>
  );
}

export default LayerDocs;
