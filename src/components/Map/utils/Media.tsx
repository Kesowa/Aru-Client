import React, { useState, useEffect, useRef } from "react";
import { default as Shimmer } from "react-loading-skeleton";
import http from "../../../services/httpCall";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { logout } from "../../../actions/authAction";
import { connect } from "react-redux";
import {
  Image,
  Row,
  Col,
  Spin,
  message,
  Dropdown,
  Menu,
  Drawer,
  Empty,
  Tabs,
  List,
  Modal,
  Alert,
  Result,
  Carousel,
  Badge,
  Space,
} from "antd";
import {
  InboxOutlined,
  FileImageOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  NodeIndexOutlined,
  DeleteOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  FlagOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import "../index.less";
import apis from "../../../services/apis";
import Dragger from "antd/lib/upload/Dragger";
import moment from "moment";
import { PUBLIC_URL, STATIC_URL } from "src/constants";
import VideoPlayer from "src/components/shared/VideoPlayer";
import { BsFlagFill } from "react-icons/bs";
import { thread } from "../../../actions/threadAction";
import Thread from "../../shared/Thread";

const { TabPane } = Tabs;

function Media(props) {
  const [files, populateFiles] = useState<any>([]);
  const [defaultFileList, setDefaultFileList] = useState<any>([]);
  const [progress, setProgress] = useState(0);
  const socket: any = useRef();
  const [multiDelete, setMultiDelete] = useState(false);
  const [checkedList, setCheckedList] = useState<any>([]);
  const [loader, setLoader] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState<any>([]);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [storageModal, setStorageModal] = useState(false);
  //-------------Handle Drawer Close------------------------
  const onClose = () => {
    props.setVisibility(false);
  };

  //---------------------File validator----------------
  function validateFile(file: any) {
    const extension = file.name.split(".")[1];
    switch (file.type) {
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return true;
      case "image/png":
        return true;
      case "image/jpeg":
        return true;
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return true;
      case "application/pdf":
        return true;
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return true;
      default:
        return false;
    }
  }
  const actionMenu = (
    <Menu onClick={(e) => handleAction(e)}>
      <Menu.Item key={0}>Toggle Selection</Menu.Item>
      <Menu.Item key={1} disabled={checkedList.length > 0 ? false : true}>
        Clear Selection
      </Menu.Item>
      <Menu.Item key={2} disabled={files?.length > 0 ? false : true}>
        Select all files
      </Menu.Item>
      <Menu.Item key={3} disabled={checkedList.length > 0 ? false : true}>
        Delete files
      </Menu.Item>
    </Menu>
  );
  const handleAction = (e) => {
    if (e.key == 0) {
      setMultiDelete(!multiDelete);
      setCheckedList([]);
    } else if (e.key == 1) {
      setCheckedList([]);
    } else if (e.key == 2) {
      if (!multiDelete) {
        setMultiDelete(true);
        setCheckedList(
          props.data.map((item: any) => {
            return item._id;
          })
        );
      } else {
        setCheckedList(
          files.map((item: any) => {
            return item._id;
          })
        );
      }
    } else if (e.key == 3) {
      Modal.confirm({
        title: `Delete multiple images?`,
        icon: <ExclamationCircleOutlined />,
        content: "Are you sure you want to delete these images ?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => {
          deleteMultipleFile(checkedList);
        },
      });
    }
  };
  const updateVODAttr = (body, action = null) => {
    console.log("updateVODAttr", body, action);
    message.success(body);
    http
      .patch(`${apis.UPDATE_VOD}`, body)
      .then((res) => {
        if (res.data.status) {
          if ("isFlagged" in body.update) {
            message.success(
              `Video ${
                !body.update.isFlagged ? "un-flagged" : "flagged"
              } successfully!`
            );
          } else if ("bookmarks" in body.update) {
            message.success(
              `Bookmark ${action === "add" ? "added" : "removed"} successfully!`
            );
          }
          props.updateVODs();
        } else message.error(res.data.message);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };
  const toggleFlag = (vod) => {
    const body = {
      id: vod._id,
      update: { isFlagged: !vod.isFlagged },
    };
    updateVODAttr(body);
  };
  const showFlightPath = (item) => {
    props.setVisibility(false);
    props.setShowFlightPath(true);
    props.setSrtVideoPath(item.videoPath);
  };
  //-----------extract images------------------------
  function extractImages(files: any) {
    const images: any = [];
    //console.log("Uploaded files here",files)
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
  //--------------UploadProps---------------------------
  const UploadProps = {
    name: "file",
    multiple: true,
    action: `${apis.UPLOAD_FILE_TO_FEATURE}`,
    customRequest: (options: any) => {
      //console.log(options.file)
      if (props.layerLabel === "No label selected") {
        message.warning(
          "Please select a layer label before uploading to a node!"
        );
        options.onError("File not Supported!");
      } else {
        if (validateFile(options.file)) {
          //console.log(options.file);
          const fData = new FormData();
          fData.append("file", options.file);
          fData.append("layerId", props.layerId);
          fData.append("sys_Id", props.featureIndex);
          fData.append("centerPoints[lat]", props.coordinates[1]);
          fData.append("centerPoints[lng]", props.coordinates[0]);
          fData.append("type", options.file.type);
          fData.append(
            "featureLabel",
            props.feature.properties[props.layerLabel]
          );

          const config = {
            headers: {
              "content-type": "multipart/form-data;",
            },
            onUploadProgress: (event) => {
              const percent = Math.floor((event.loaded / event.total) * 100);
              setProgress(percent);
              if (percent === 100) {
                setTimeout(() => setProgress(0), 1000);
              }
              options.onProgress({
                percent: (event.loaded / event.total) * 100,
              });
            },
          };
          let uploadedFile: any = [];
          uploadedFile = files;
          http
            .patch(options.action, fData, config)
            .then((res: any) => {
              if (res.data.status) {
                options.onSuccess(res.data, options.file);
                message.success(
                  "File " + options.file.name + " uploaded successfully"
                );
                uploadedFile.push(res.data.data);
                populateFiles(uploadedFile);
              } else {
                message.error("Unable to upload file!");
                console.log(
                  "Error message for status false while uploading: ",
                  res.data.message
                );
                options.onError({ res });
              }
            })
            .catch((err) => {
              if (err.response?.status === 403) {
                if (
                  err.response?.data.message ===
                  "Actual storage exceeded the Limit of Set storage!"
                ) {
                  setStorageModal(true);
                } else {
                  message.error(err.response?.data.message);
                  console.log(err.response);
                }
              } else {
                console.log("Upload Error!", err);
                message.error("Unable to upload file!");
                options.onError({ err });
              }
              AxiosErrorHandler(err, props.logout);
            })
            .finally(() => {
              setRefresh(true);
            });
        } else {
          message.warning("File not supported!");
          options.onError("File not Supported!");
        }
      }
    },
  };

  //---------------Populating images----------------------
  useEffect(() => {
    if (props.visible) {
      if (refresh) {
        setRefresh(false);
      }
      if (!(props.videoToShow.length > 0)) {
        setLoader(true);
        const newdata: any = [];
        http
          .get(`${apis.FETCH_FEATURE_FILES}`, {
            params: {
              layerId: props.layerId,
              sys_id: props.featureIndex,
            },
          })
          .then((res) => {
            if (res.data.status) {
              //console.log(res.data.data);
              res.data.data.map((item: any) => {
                newdata.push(item);
              });
              populateFiles(newdata);
            } else {
              message.error(res.data.message);
            }
          })
          .catch((err) => {
            message.error(err);
            AxiosErrorHandler(err, props.logout);
          })
          .finally(() => setLoader(false));
      } else {
        setLoader(false);
      }
    }
  }, [props.layerId, props.featureIndex, props.visible, refresh]);

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
          //console.log("FIle detelted",res.data)
          message.success("File Deleted!");
          const filteredArray = files.filter(function (obj) {
            return obj._id !== res.data.data._id;
          });
          populateFiles(filteredArray);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setRefresh(true);
      });
  }

  function deleteMultipleFile(ids: any) {
    http
      .delete(`${apis.DELETE_FEATURE_FILES}`, {
        data: {
          layerFileIds: ids,
        },
      })
      .then((res) => {
        if (res.data.status) {
          //console.log("FIle detelted",res.data)
          message.success("Files Deleted!");
          const filteredArray = files.filter(function (obj) {
            return !ids.include(obj._id);
          });
          populateFiles(filteredArray);
          setCheckedList([]);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setRefresh(true);
      });
  }
  const vodThumbnail = (data: any, idx: any) => {
    console.log("vodThumbnail", data);
    let vodDetails = {};
    if (
      idx < props.videoToShow.length &&
      props.videoToShow[idx].videoPath &&
      props.videoToShow[idx].isSRT
    ) {
      vodDetails = {
        link: props.videoToShow[idx].videoPath,
        missionDetails: props.videoToShow[idx],
        isSRT: props.videoToShow[idx].isSRT,
      };
    } else {
      vodDetails = {
        link: data.videoPath,
        missionDetails: data,
        isSRT: data.isSRT,
      };
    }
    console.log("vodThumbnail", vodDetails);
    return (
      <Badge
        style={{
          backgroundColor: "#f5222d",
          padding: "5px",
          borderRadius: "5px",
          zIndex: 9999,
        }}
        offset={[-15, 15]}
        count={
          data.isFlagged ? (
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
        <div
          style={{
            height: "150px", //video player
            width: "100%",
            margin: "auto",
            backgroundColor: "black",
          }}
        >
          <VideoPlayer // NEED TO PASS MISSION DETAILS AND LIVE TAG CHECK
            url={STATIC_URL + vodDetails.link}
            mission={vodDetails.missionDetails}
            alertBtnStatus=""
            theatreModeStatus="none"
            liveTagStatus="none"
            liveTelemetry={false}
            showHUD={false}
            updateVOD={updateVODAttr}
            threadThumb={true}
          />
        </div>
      </Badge>
    );
  };
  //console.log("data from props:",props.visible, props.layerId, props.featureIndex, props.properties);
  const renderVideo = () => {
    console.log("videoToShow", props.videoToShow);
    return (
      <>
        {props.videoToShow.length < 1 ? (
          <Empty style={{ margin: "auto" }} />
        ) : (
          <></>
        )}

        <Image.PreviewGroup>
          {props.videoToShow.map((item: any, idx) => {
            return (
              <>
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="1">
                        <span>
                          <a
                            href={
                              STATIC_URL +
                              item.videoPath.toString().replace(".m3u8", ".flv")
                            }
                            // target='_blank'
                            download
                          >
                            <DownloadOutlined /> Download{" "}
                          </a>
                        </span>
                      </Menu.Item>
                      <Menu.Item
                        key="2"
                        onClick={() => {
                          toggleFlag(item);
                        }}
                      >
                        {!item.isFlagged ? (
                          <>
                            <FlagOutlined /> Flag
                          </>
                        ) : (
                          <>
                            <FlagOutlined /> Unflag
                          </>
                        )}
                      </Menu.Item>
                      <Menu.Item
                        key="3"
                        onClick={() => {
                          props.setThumbnail(vodThumbnail(item, idx));
                          props.thread(true, {
                            docType: "vod",
                            docId: item._id,
                          });
                        }}
                      >
                        <MessageOutlined /> Open Thread{" "}
                      </Menu.Item>
                      {item.isSRT ? (
                        <Menu.Item
                          key="4"
                          onClick={() => {
                            showFlightPath(item);
                          }}
                        >
                          <NodeIndexOutlined /> Show Flight Path
                        </Menu.Item>
                      ) : (
                        ""
                      )}
                    </Menu>
                  }
                  trigger={["contextMenu"]}
                >
                  <Col span={8} md={8}>
                    <Badge
                      style={{
                        backgroundColor: "#f5222d",
                        padding: "5px",
                        borderRadius: "5px",
                      }}
                      offset={[-15, 15]}
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
                        style={{ cursor: "pointer" }}
                        src={STATIC_URL + item.thumbnail}
                        preview={false}
                        onClick={() => {
                          props.updateVOD(item, idx);
                          props.setVisibility(false);
                        }}
                      />
                    </Badge>
                  </Col>
                </Dropdown>
              </>
            );
          })}
        </Image.PreviewGroup>
      </>
    );
  };

  //-------------- render media content --------------------
  function renderMedia() {
    const media: any[] = extractImages(files);
    media.sort((a, b) => {
      return moment(b.createdAt).diff(moment(a.createdAt));
    });
    return (
      <>
        {media.length < 1 ? <Empty style={{ margin: "auto" }} /> : <></>}
        {multiDelete ? (
          <>
            {media.map((item: any) => {
              return (
                <Col
                  span={8}
                  md={8}
                  key={`1.1.${item._id}`}
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  <Image
                    key={`${item._id}`}
                    style={
                      checkedList.includes(item._id)
                        ? {
                            border: "2px solid #3b86ff",
                          }
                        : {
                            padding: "2px",
                          }
                    }
                    width={"100%"}
                    height={180}
                    src={
                      STATIC_URL +
                      "/images/geojson/1x_" +
                      item.filePath.split("/")[3]
                    }
                    preview={false}
                    fallback="data:image/png;base64,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"
                    onClick={() => {
                      if (checkedList.includes(item._id)) {
                        const filtered: any = checkedList.filter(
                          (i: any) => i !== item._id
                        );
                        setCheckedList(filtered);
                      } else {
                        setCheckedList([...checkedList, item._id]);
                      }
                    }}
                  ></Image>
                </Col>
              );
            })}
          </>
        ) : (
          <Image.PreviewGroup>
            {media.map((item: any) => {
              return (
                <Col
                  span={8}
                  md={8}
                  key={`1.1.${item._id}`}
                  style={{ padding: "8px" }}
                >
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key={`1.${item._id}`}
                          onClick={() =>
                            window.open(`${PUBLIC_URL}${item.filePath}`)
                          }
                        >
                          <DownloadOutlined /> Download
                        </Menu.Item>
                        {props.canDelete ? (
                          <Menu.Item
                            key={`2.${item._id}`}
                            onClick={() => {
                              Modal.confirm({
                                title: "Delete Image?",
                                icon: <ExclamationCircleOutlined />,
                                content:
                                  "Are you sure you want to delete this Image?",
                                okText: "Yes",
                                cancelText: "No",
                                onOk: () => {
                                  deleteFile(item._id);
                                },
                              });
                            }}
                          >
                            <DeleteOutlined /> Delete
                          </Menu.Item>
                        ) : (
                          <></>
                        )}
                        {props.canSetCoverPhoto ? (
                          <Menu.Item
                            key={`4.${item._id}`}
                            onClick={() => addCover(item._id, props.layerId)}
                          >
                            <FileImageOutlined /> Set Cover Photo
                          </Menu.Item>
                        ) : (
                          <></>
                        )}
                      </Menu>
                    }
                    trigger={["contextMenu"]}
                  >
                    <Image
                      key={`${item._id}`}
                      width={"100%"}
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
                </Col>
              );
            })}
          </Image.PreviewGroup>
        )}
      </>
    );
  }

  //--------------------- Render Document Content-----------------------
  function renderDocuments() {
    const data: any[] = extractDocuments(files);
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

  function addCover(id: any, layerId: any) {
    const payload: any = {
      id: id,
      layerId: layerId,
      sys_id: props.featureIndex,
      coverPhoto: true,
    };
    http
      .post(`${apis.SET_COVER_PHOTO}`, payload)
      .then((res) => {
        if (res.data.status) {
          message.success("Cover photo set!");
        } else {
          message.warning(res.data.message);
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => setRefresh(true));
  }

  useEffect(() => {
    const media: any = files.filter((i) => i.coverPhoto === true);
    //console.log("Filtered",media, "files", files);
    setCoverPhoto(media);
  }, [files, props.visible]);

  function returnCoverPath() {
    const media: any[] = extractImages(files);
    const cover: any = coverPhoto;
    let images: any = [];
    if (cover.length > 0) {
      images = cover;
      //console.log("COver photo present")
    } else {
      images = media;
      //console.log("No cover photo")
    }

    images.sort((a, b) => {
      return moment(b.createdAt).diff(moment(a.createdAt));
    });

    return images[0];
  }

  useEffect(() => {
    //console.log("selected prop:", props.properties.properties ? props.properties.properties[props.layerLabel] : "null");
  }, [props.videoDetails]);

  return (
    <>
      <Modal
        title="Storage Exceeded!"
        visible={storageModal}
        onOk={() => setStorageModal(false)}
        onCancel={() => setStorageModal(false)}
      >
        <Result
          status="403"
          title="Oops! You have run out of storage!"
          subTitle="Please contact admin@kesowa.com to renew our services! to see you storage details, head over to My Account > Package."
        />
      </Modal>
      {props.showCarousel && (
        <div className="backdrop">
          <div className="topbar">
            <CloseOutlined
              onClick={() => {
                props.setShowCarousel(false);
                if (props.videoToShow.length > 0) {
                  props.setVisibility(true);
                }
              }}
              className="btn-icon"
            />
            {props.videoDetails.link && (
              <a
                href={
                  STATIC_URL +
                  props.videoDetails.link.toString().replace(".m3u8", ".flv")
                }
                // target='_blank'
                download
              >
                <DownloadOutlined className="btn-icon" />
              </a>
            )}
          </div>
          <div className="main" tabIndex={1}>
            <Carousel
              beforeChange={(oldIndex, newIndex) => {
                props.updateVOD(props.videoToShow[newIndex], newIndex);
              }}
              dots={false}
              arrows
              nextArrow={<RightOutlined />}
              prevArrow={<LeftOutlined />}
            >
              {props.videoToShow.map((i, idx) => {
                return (
                  <div
                    style={{
                      height: "500px",
                      textAlign: "center",
                      background: "black",
                    }}
                  >
                    {!props.videoDetails.link && (
                      <img
                        style={{
                          height: "400px",
                          width: "auto",
                          margin: "auto",
                        }}
                        src={STATIC_URL + i.thumbnail}
                        onClick={() => {
                          props.updateVOD(i, idx);
                        }}
                        onError={(e: any) =>
                          (e.target.src = `/icons/fallback.png`)
                        }
                      />
                    )}
                  </div>
                );
              })}
            </Carousel>
            {props.videoDetails.link && (
              <div
                style={{
                  height: "400px", //video player
                  width: "712px",
                  margin: "auto",
                  backgroundColor: "black",
                }}
                className="video-div"
              >
                <VideoPlayer // NEED TO PASS MISSION DETAILS AND LIVE TAG CHECK
                  url={STATIC_URL + props.videoDetails.link}
                  mission={props.videoDetails.missionDetails}
                  alertBtnStatus=""
                  theatreModeStatus="none"
                  liveTagStatus="none"
                  liveTelemetry={false}
                  showHUD={props.videoDetails.isSRT}
                  updateVOD={updateVODAttr}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <Drawer
        title="Attachments"
        width={600}
        placement="right"
        closable={true}
        onClose={onClose}
        visible={props.visible}
        footer={
          <>
            {!(props.videoToShow.length > 0) ? (
              <>
                {props.isBaseMap ? (
                  <>
                    {props.canUploadToBaseLayer ? (
                      <div>
                        {props.layerLabel === "No label selected" ? (
                          <>
                            <Alert
                              message="Please select a layer label first!"
                              description="You can select a layer label for this layer by right clicking on the layer > more > Layer settings"
                              type="info"
                              showIcon
                            />
                          </>
                        ) : (
                          <>
                            {props.visible && (
                              <>
                                {props.canUpload ? (
                                  <Dragger
                                    {...UploadProps}
                                    defaultFileList={defaultFileList}
                                  >
                                    <p className="ant-upload-drag-icon">
                                      <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">
                                      Click or drag image to this area to upload
                                    </p>
                                    <p className="ant-upload-hint">
                                      Supports jpeg and png for images, and doc,
                                      excel, ppt and pdf for documents
                                    </p>
                                  </Dragger>
                                ) : (
                                  <></>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <div>
                    {props.layerLabel === "No label selected" ? (
                      <>
                        <Alert
                          message="Please select a layer label first!"
                          description="You can select a layer label for this layer by right clicking on the layer > more > Layer settings"
                          type="info"
                          showIcon
                        />
                      </>
                    ) : (
                      <>
                        {props.visible && (
                          <>
                            {props.canUpload ? (
                              <Dragger
                                {...UploadProps}
                                defaultFileList={defaultFileList}
                              >
                                <p className="ant-upload-drag-icon">
                                  <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">
                                  Click or drag image to this area to upload
                                </p>
                                <p className="ant-upload-hint">
                                  Supports jpeg and png for images, and doc,
                                  excel, ppt and pdf for documents
                                </p>
                              </Dragger>
                            ) : (
                              <></>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              ""
            )}
          </>
        }
      >
        {props.visible ? (
          <>
            <Row>
              {files.length > 0 ? (
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    marginBottom: "18px",
                    backgroundColor: "#c2c2c2",
                    borderRadius: "8px",
                  }}
                >
                  {loader ? (
                    <></>
                  ) : (
                    <img
                      src={
                        loader
                          ? "#"
                          : `${STATIC_URL}/images/geojson/2x_${
                              returnCoverPath().filePath.split("/")[3]
                            }`
                      }
                      style={
                        coverLoaded
                          ? {
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }
                          : {
                              display: "none",
                            }
                      }
                      onLoad={() => setCoverLoaded(true)}
                      onError={(e: any) =>
                        (e.target.src = `/icons/fallback.png`)
                      }
                    />
                  )}
                </div>
              ) : (
                <></>
              )}
            </Row>
            <Row style={{ marginTop: "-1.5rem" }}>
              <Tabs
                defaultActiveKey="1"
                size="large"
                centered
                style={{ width: "100%" }}
                tabBarExtraContent={{
                  right: (
                    <Dropdown overlay={actionMenu} trigger={["click"]}>
                      <a onClick={(e) => e.preventDefault()}>
                        <Space>
                          Actions
                          <DownOutlined />
                        </Space>
                      </a>
                    </Dropdown>
                  ),
                }}
              >
                <TabPane
                  tab={
                    <span>
                      <FileImageOutlined />
                      Media
                    </span>
                  }
                  key="1"
                >
                  {loader ? (
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
                  ) : props.videoToShow.length > 0 ? (
                    <Row gutter={[16, 16]}>{renderVideo()}</Row>
                  ) : (
                    <Row>{renderMedia()}</Row>
                  )}
                </TabPane>
                {!(props.videoToShow.length > 0) ? (
                  <TabPane
                    tab={
                      <span>
                        <FileTextOutlined />
                        Documents
                      </span>
                    }
                    key="2"
                  >
                    <Spin
                      size="large"
                      spinning={loader}
                      tip="Loading documents..."
                    >
                      <Row>{renderDocuments()}</Row>
                    </Spin>
                  </TabPane>
                ) : (
                  ""
                )}
              </Tabs>
            </Row>
          </>
        ) : (
          <></>
        )}
      </Drawer>
    </>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { logout, thread })(Media);
