import React, { useEffect, useState, useRef } from "react";
import { default as Shimmer } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Row,
  Col,
  Card,
  Typography,
  message,
  Modal,
  Empty,
  Tooltip,
  Menu,
  Dropdown,
  Button,
  Alert,
  Result,
  Carousel,
  Input,
  Skeleton,
  Checkbox,
  Select,
  Badge,
  Pagination,
} from "antd";
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  FlagOutlined,
  InboxOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DownloadOutlined,
  MessageOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { BsFlagFill } from "react-icons/bs";
import "./data.less";
import apis from "../../../../../services/apis";
import http from "../../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";
import { logout } from "../../../../../actions/authAction";
import moment from "moment";
import VideoPlayer from "../../../../shared/VideoPlayer";
import Dragger from "antd/lib/upload/Dragger";
import { connect } from "react-redux";
import { API_URL, STATIC_URL } from "src/constants";
import { io } from "socket.io-client";
import FilterToolbar from "src/components/shared/Toolbar/filter";
import ActionToolbar from "src/components/shared/Toolbar/action";
import { thread } from "../../../../../actions/threadAction";
import Thread from "../../../../shared/Thread";
declare let require: any;

//import { Replay } from "vimond-replay";
//import "vimond-replay/index.css";

type props = {
  missionDetails: any;
  userType: any;
  userDetails: any;
  logout: any;
  thread: any;
};
const { next, prev } = Carousel;
const { Text } = Typography;
const { Option } = Select;
const plainOptions = new Array<any>();
function Videos(props) {
  const [VodData, setVodData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [defaultFileList, setDefaultFileList] = useState([]);
  const [progress, setProgress] = useState(0); //this can be used for a different progress component
  const [refresh, setRefresh] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [videoDetails, setVideoDetails] = useState<any>({});
  const [editVideoName, setEditVideoName] = useState<any>({});
  const [thumbnail, setThumbnail] = useState("");
  const [gridCount, setGridCount] = useState(0);
  const [videoNameLoader, setVideoNameLoader] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [refreshState, setRefreshState] = useState(false);
  const [listView, setListView] = useState(false);
  const [Video, setVideo] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [storageModal, setStorageModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isUploading, setUploading] = useState(false);
  const [uploadModall, setUploadModal] = useState(false);
  const socket: any = useRef();
  const [updatedVideo, setUpdatedVideo] = useState("");
  const [activateSelection, setActivateSelection] = useState(false);
  const [isAscending, setIsAscending] = useState(false);
  const [sortType, setSortType] = useState("timeStamp");
  const [flag, setFlag] = useState(false);
  const [flaggedFilter, setFlaggedFilter] = useState(false);
  const [unflaggedFilter, setUnflaggedFilter] = useState(false);
  const CheckboxGroup = Checkbox.Group;
  const carouselRef = useRef();

  const defaultCheckedList = [];
  const [checkedList, setCheckedList] = useState<any>(defaultCheckedList);

  function truncateText(str) {
    return str.length > 15 ? str.substring(0, 15) + "..." : str;
  }
  const updateVODAttr = (body, action = null) => {
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
  const ImageComponent = (item: any) => {
    return (
      <>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={8}
          xl={6}
          xxl={6}
          className="vid-thumbnail"
        >
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
            <Card
              className="outcome-cardd"
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
              style={
                checkedList.includes(item._id)
                  ? {
                      border: "4px solid #3b86ff",
                      cursor: "pointer",
                    }
                  : {
                      cursor: "pointer",
                    }
              }
              cover={
                <img
                  alt={`${item.videoName}`}
                  src={STATIC_URL + item.thumbnail}
                  style={{
                    aspectRatio: "16/9",
                    objectFit: "cover",
                    objectPosition: "0 0",
                  }}
                  // className='card-img-size'

                  onError={(e: any) => (e.target.src = `/icons/fallback.png`)}
                />
              }
            >
              <Row style={{ marginTop: "-12px" }}>
                <Col>
                  <Tooltip
                    placement="bottom"
                    title={item.videoName ? item.videoName : item.flightID.name}
                  >
                    <Text strong ellipsis style={{ width: 130 }}>
                      <VideoCameraOutlined /> &nbsp;{" "}
                      {item.videoName ? item.videoName : item.flightID.name}
                    </Text>
                  </Tooltip>
                </Col>
              </Row>
              <Text type="secondary">
                {moment(item.createdAt).format("llll")}
              </Text>
            </Card>
          </Badge>
        </Col>
      </>
    );
  };

  const showModal3 = () => {
    setIsEditModalVisible(true);
  };

  const handleOk3 = () => {
    setVideoNameLoader(true);
    const body = {
      id: editVideoName.id,
      update: { videoName: editVideoName.name },
    };
    console.log(body);
    http
      .patch(`${apis.RENAME_VOD}`, body)
      .then((res) => {
        if (res.data.status) {
          message.success("Video Renamed Successfully!");
          setRefresh(true);
        } else message.error(res.data.message);
      })
      .catch((err) => {
        console.error(err.message);
      })
      .finally(() => {
        setVideoNameLoader(false);
        handleCancel3();
      });
  };

  const handleCancel3 = () => {
    setIsEditModalVisible(false);
    setEditVideoName({});
  };

  function checkExtension(videoFile) {
    if (videoFile === "mp4" || videoFile === "MP4") {
      return true;
    } else {
      return false;
    }
  }
  //--------------- Upload Props -------------------------

  const UploadProps = {
    name: "file",
    multiple: true,
    action: `${apis.UPLOAD_VOD}`,
    customRequest: (options: any) => {
      console.log("here");
      // console.log(props.missionDetails.locationId);
      setUploading(true);
      const fData = new FormData();
      fData.append("video", options.file);
      fData.append("missionID", props.missionDetails.missionId);
      fData.append("flightID", props.missionDetails.flightId);
      if (props.missionDetails.locationId?._id) {
        fData.append("locationID", props.missionDetails.locationId?._id);
      }

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
          options.onProgress({ percent: (event.loaded / event.total) * 100 });
        },
      };

      switch (
        props.missionDetails.userType //upload priviledge checks
      ) {
        case "tenant-root": //when user is a tenant root
          console.log(options.file.name.split(".")[1]);
          const isValidExtension = checkExtension(
            options.file.name.split(".")[1]
          );
          if (isValidExtension) {
            http
              .post(options.action, fData, config)
              .then((res: any) => {
                options.onSuccess(res.data, options.file);
                console.log("Upload successful! ", res.data);
                message.success(
                  "File " + options.file.name + " uploaded successfully"
                );

                props.setCount(props.totalVOD + 1);
              })
              .catch((err) => {
                if (err.response.status === 403) {
                  if (
                    err.response.data.message ===
                    "Package has expired! Please renew!"
                  ) {
                    setIsModalVisible2(true);
                    window.setTimeout(function () {
                      AxiosErrorHandler(err, props.logout); //needs to be connected with redux
                    }, 5000);
                  } else if (
                    err.response?.data.message ===
                    "Actual storage exceeded the Limit of Set storage!"
                  )
                    setStorageModal(true);
                  else {
                    {
                      message.error(err.response?.data.message);
                      console.log(err.response);
                    }
                    setIsModalVisible(true);
                  }
                } else {
                  console.log("Upload Error!", err);
                  message.error("Unable to upload file!");
                }
                options.onError({ err });
              })
              .finally(() => setUploading(false));
          } else {
            options.onError({});
            message.error(
              "Invalid file type! Only .mp4 video files supported for upload. Please try again!"
            );
          }
          break;

        case "tenant-staff": // when user is tenant staff
          console.log(options.file.name.split(".")[1]);
          const isValidExtension2 = checkExtension(
            options.file.name.split(".")[1]
          );
          if (isValidExtension2) {
            http
              .post(options.action, fData, config)
              .then((res: any) => {
                options.onSuccess(res.data, options.file);
                console.log("Upload successful! ", res.data);
                message.success(
                  "File " + options.file.name + " uploaded successfully"
                );

                props.setCount(props.totalVOD + 1);
              })
              .catch((err) => {
                if (err.response.status === 403) {
                  if (
                    err.response.data.message ===
                    "Package has expired! Please renew!"
                  ) {
                    setIsModalVisible2(true);
                    window.setTimeout(function () {
                      AxiosErrorHandler(err, props.logout); //needs to be connected with redux
                    }, 5000);
                  } else if (
                    err.response?.data.message ===
                    "Actual storage exceeded the Limit of Set storage!"
                  )
                    setStorageModal(true);
                  else {
                    message.error(err.response?.data.message);
                    console.log(err.response);
                    setIsModalVisible(true);
                  }
                } else {
                  console.log("Upload Error!", err);
                  message.error("Unable to upload file!");
                }
                options.onError({ err });
              })
              .finally(() => setUploading(false));
          } else {
            options.onError({});
            message.error(
              "Invalid file type! Only .mp4 video files supported for upload. Please try again!"
            );
          }
          break;
        default:
          message.warning("You are not permitted to perform this action!");
      }
    },
  };

  useEffect(() => {
    if (props?.missionDetails?.missionId) {
      socket.current = io(
        `${API_URL}/stream/mission-specific?missionID=${props.missionDetails.missionId}`
      );

      socket.current.on("PROCESS_VIDEO_FINISHED", (data) => {
        // console.log("New video uploaded");
        setRefresh(true);
      });

      socket.current.on("VOD_REMOVED", (data) => {
        // console.log("Video Deleted");
        setRefresh(true);
      });
    }
  }, []);

  //----------- Fetching video data for mission --------------------
  const getFlaggedFilter = () => {
    if (flaggedFilter) {
      return flaggedFilter;
    } else if (unflaggedFilter) {
      return !unflaggedFilter;
    } else return undefined;
  };
  const getSortKey = () => {
    switch (sortType) {
      case "timeStamp":
        return "createdAt";
      case "name":
        return "videoName";
      case "size":
        return "fileSize";
      default:
        return "createdAt";
    }
  };
  const fetchVODByMission = () => {
    const query = {
      missionID: props.missionDetails.missionId,
      page,
      limit,
    };
    const flagFilter = getFlaggedFilter();
    if (flagFilter !== undefined) {
      query["isFlagged"] = flagFilter;
    }
    const sortKey = getSortKey();
    if (isAscending) {
      query["sort"] = sortKey + ":asc";
    }
    if (!isAscending) {
      query["sort"] = sortKey + ":desc";
    }

    console.log("sort", isAscending, sortType);
    if (refresh) {
      setRefresh(false);
    }

    setLoader(true);
    http
      .get(`${apis.FETCH_VIDEOS_BY_MISSION_ID}`, {
        params: query,
      })
      .then((res) => {
        setVodData(res.data.data);
        setTotalCount(res.data.total);
        setLoader(false);
      })
      .catch((err) => {
        console.log(err.response.status);
        if (err.response.status == 404) {
          setLoader(false);
          setVodData([]);
        } else if (err.response.status == 500) {
          AxiosErrorHandler(err, props.logout);
        } else {
          message.error("API Call failed! " + err);
        }
      });
  };

  useEffect(() => {
    if (props.missionID !== 0) {
      fetchVODByMission();
      if (VodData.length) {
        setVideoDetails({
          link: VodData[0].videoPath,
          missionDetails: VodData[0].missionDetails,
          isSRT: VodData[0].isSRT,
        });
      }
    }
  }, [props, refresh, flaggedFilter, unflaggedFilter]);

  useEffect(() => {
    fetchVODByMission();
  }, [page, limit]);

  const vodThumbnail = (data: any, idx: any) => {
    let vodDetails = {};
    if (idx < VodData.length && VodData[idx].videoPath && VodData[idx].isSRT) {
      vodDetails = {
        link: VodData[idx].videoPath,
        missionDetails: VodData[idx],
        isSRT: VodData[idx].isSRT,
      };
    } else {
      vodDetails = {
        link: data.videoPath,
        missionDetails: data,
        isSRT: data.isSRT,
      };
    }

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
  const updateSelectedVOD = (data, idx: number) => {
    setSelectedVideo(data._id);
    fetchVODByMission(); // re-fetch

    // set current vod details
    if (idx < VodData.length && VodData[idx].videoPath && VodData[idx].isSRT) {
      setVideoDetails({
        link: VodData[idx].videoPath,
        missionDetails: VodData[idx],
        isSRT: VodData[idx].isSRT,
      });
    } else {
      setVideoDetails({
        link: data.videoPath,
        missionDetails: data,
        isSRT: data.isSRT,
      });
    }
    setShowCarousel(true);
  };

  //----------------------Delete video-----------------------------------
  const deleteVideo = (id: any) => {
    console.log(id);
    message.loading("Deleting video...");
    // if (checkedList.length > 0) {
    if (id !== undefined || id.length !== 0) {
      http
        .delete(
          `${Array.isArray(id) ? apis.DELETE_MULTI_VOD : apis.DELETE_VOD}`,
          {
            data: {
              Id: id,
            },
          }
        )
        .then((res) => {
          message.success("Video deleted succesfully!");
          props.setCount(props.totalVOD - (Array.isArray(id) ? id.length : 1));
          setRefresh(true);
        })
        .catch((err) => {
          message.error("ERROR" + err);
        });
    }
    // }
    else {
      message.info("Please select some videos to delete!");
    }
  };

  //----------Video Player Modal-------------------------------------
  // function openVideoPlayer(link: any, name: any, missionDetails: any[]) {
  //   Modal.info({
  //     // title: "Flight Name: " + name,
  //     content: (
  //       <div
  //         style={{ height: "400px", backgroundColor: "#0000", padding: "0" }}
  //       >
  //         <VideoPlayer // NEED TO PASS MISSION DETAILS AND LIVE TAG CHECK
  //           url={STATIC_URL + link}
  //           map={true}
  //           // handleTheater=''
  //           // theater=''
  //           // handlePip=''
  //           // pip=''
  //           // streamKey=''
  //           mission={missionDetails}
  //           alertBtnStatus=''
  //           theatreModeStatus='none'
  //           liveTagStatus='none'
  //         />
  //       </div>
  //     ),
  //     centered: true,
  //     // width: 1000,
  //     // closable: true,
  //     onOk() {},
  //   });
  // }

  //-------- Upload Modal ------------------------

  function uploadModal() {
    // setUploadModal(true);
    Modal.info({
      title: "Upload video files!",
      content: (
        <div className="upload-modal-video">
          <Alert
            style={{ marginBottom: "8px" }}
            message="Only .mp4 files are supported for videos."
            type="info"
            showIcon
          />
          <Dragger {...UploadProps} defaultFileList={defaultFileList}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload.
            </p>
          </Dragger>
        </div>
      ),
      centered: true,
      width: 640,
      //closable: true,
      //cancelText: "Cancel",
      okText: "Close",
      onOk() {},
      onCancel() {},
    });
  }
  useEffect(() => {
    console.log("selectedVideo", selectedVideo);
  }, [selectedVideo]);
  useEffect(() => {
    console.log(isUploading);
  }, [isUploading]);
  //-------------------------render delete vod button based on permission--------------
  function renderDeleteBtn(id: any) {
    if (
      props.missionDetails.userType === "tenant-staff" ||
      props.missionDetails.userType === "tenant-client"
    ) {
      let permissions: any = [];
      //console.log(props.missionDetails.currentUserDetails);
      props.missionDetails.currentUserDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "vod_delete"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Menu.Item key="4">
            <span
              onClick={() => {
                Modal.confirm({
                  title: "Delete video?",
                  icon: <ExclamationCircleOutlined />,
                  content: "Are you sure you want to delete this video?",
                  okText: "Yes",
                  cancelText: "No",
                  onOk: () => {
                    deleteVideo(id);
                  },
                });
              }}
            >
              <DeleteOutlined /> Delete video{" "}
            </span>
          </Menu.Item>
        );
      }
    } else {
      return (
        <Menu.Item key="4">
          <span
            onClick={() => {
              Modal.confirm({
                title: "Delete video?",
                icon: <ExclamationCircleOutlined />,
                content: "Are you sure you want to delete this video?",
                okText: "Yes",
                cancelText: "No",
                onOk: () => {
                  deleteVideo(id);
                },
              });
            }}
          >
            <DeleteOutlined /> Delete video{" "}
          </span>
        </Menu.Item>
      );
    }
  }

  /* Action Button*/

  const onChange = (list) => {
    setCheckedList(list);
  };
  useEffect(() => {
    console.log(checkedList);
  }, [checkedList]);

  const handleSortChange = (value) => {
    setSortType(value);
    setRefresh(!refresh);
  };
  useEffect(() => {
    setRefresh(!refresh);
  }, [isAscending]);

  // function UrlExists(url) {
  //   var http = new XMLHttpRequest();
  //   http.open("HEAD", url, false);
  //   http.send();
  //   return http.status;
  // }

  // useEffect(() => {
  //   if (videoDetails.link) {
  //     console.log(
  //       UrlExists(
  //         STATIC_URL +
  //           videoDetails.link.toString().replace(".m3u8", ".flv")
  //       )
  //     );
  //     console.log(
  //       UrlExists(
  //         STATIC_URL +
  //           videoDetails.link.toString().replace(".m3u8", ".mp43")
  //       )
  //     );
  //   }
  // }, [videoDetails.link]);

  useEffect(() => {
    if (!(activateSelection && checkedList.length > 0)) {
      setFlag(false);
    }

    const flaggedArray = VodData.map((data: any) => {
      //console.log('toggleFlag', checkedList, data._id);
      if (checkedList.includes(data._id)) {
        return data.isFlagged;
      }
    }).filter((flag) => flag !== undefined);
    if (!flaggedArray.includes(false)) {
      setFlag(true);
    } else if (flaggedArray.includes(false)) {
      setFlag(false);
    }
  }, [activateSelection, checkedList, VodData]);

  useEffect(() => {
    console.log("width", window.screen.width);
    console.log("apsect ratio", window.devicePixelRatio);
    if (window.devicePixelRatio == 1.5 || window.devicePixelRatio == 1.25) {
      // 3
      setGridCount(3);
    } else {
      if (window.screen.width == 2560 || window.screen.width == 1920) {
        // 8
        setGridCount(6);
      } else if (window.screen.width == 1366) {
        // 3
        setGridCount(3);
      }
    }
  }, []);

  useEffect(() => console.log(editVideoName), [editVideoName]);

  //---------------Render video thumbnails------------------------------------------------
  function renderVideos(data: any[]) {
    return (
      <div>
        {data.length < 1 ? (
          <Empty style={{ margin: "auto" }} />
        ) : (
          <>
            {!listView ? (
              <>
                {activateSelection ? (
                  <Row>{VodData?.map((item: any) => ImageComponent(item))}</Row>
                ) : (
                  <>
                    {showCarousel && (
                      <div className="backdrop">
                        <div className="topbar">
                          <CloseOutlined
                            onClick={() => {
                              fetchVODByMission();
                              setShowCarousel(false);
                            }}
                            className="btn-icon"
                          />
                          {videoDetails.link && (
                            <a
                              href={
                                STATIC_URL +
                                videoDetails.link
                                  .toString()
                                  .replace(".m3u8", ".flv")
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
                              updateSelectedVOD(data[newIndex], newIndex);
                            }}
                            dots={false}
                            arrows
                            nextArrow={<RightOutlined />}
                            prevArrow={<LeftOutlined />}
                          >
                            {data.map((i, idx) => {
                              return (
                                <div
                                  style={{
                                    height: "500px",
                                    textAlign: "center",
                                    background: "black",
                                  }}
                                >
                                  {!videoDetails.link && (
                                    <img
                                      style={{
                                        height: "400px",
                                        width: "auto",
                                        margin: "auto",
                                      }}
                                      src={STATIC_URL + i.thumbnail}
                                      onClick={() => {
                                        updateSelectedVOD(i, idx);
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </Carousel>
                          {videoDetails.link && (
                            <>
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
                                  url={STATIC_URL + videoDetails.link}
                                  mission={videoDetails.missionDetails}
                                  alertBtnStatus=""
                                  theatreModeStatus="none"
                                  liveTagStatus="none"
                                  liveTelemetry={false}
                                  showHUD={videoDetails.isSRT}
                                  updateVOD={updateVODAttr}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {data.length > gridCount ? (
                      <Row>
                        {data.map((dataa, idx) => (
                          <Col
                            span={
                              window.devicePixelRatio == 1.5
                                ? 8
                                : window.screen.width == 1920
                                ? 4
                                : window.screen.width == 1366
                                ? 8
                                : window.screen.width == 2560
                                ? 4
                                : 8
                            }
                            key={`${dataa._id}`}
                          >
                            <Dropdown
                              overlay={
                                <Menu>
                                  <Menu.Item key="1">
                                    <span>
                                      <a
                                        href={
                                          STATIC_URL +
                                          dataa.videoPath
                                            .toString()
                                            .replace(".m3u8", ".flv")
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
                                      setThumbnail(vodThumbnail(dataa, idx));
                                      props.thread(true, {
                                        docType: "vod",
                                        docId: dataa._id,
                                      });
                                    }}
                                  >
                                    <MessageOutlined /> Open Thread{" "}
                                  </Menu.Item>
                                  <Menu.Item
                                    key="3"
                                    onClick={() => {
                                      toggleFlag(dataa);
                                    }}
                                  >
                                    {!dataa.isFlagged ? (
                                      <>
                                        <FlagOutlined /> Flag
                                      </>
                                    ) : (
                                      <>
                                        <FlagOutlined /> Unflag
                                      </>
                                    )}
                                  </Menu.Item>
                                  {renderDeleteBtn(dataa._id)}
                                  <Menu.Item key="5">
                                    <span
                                      onClick={() => {
                                        setEditVideoName({
                                          id: dataa._id,
                                          name: dataa.videoName,
                                        });
                                        showModal3();
                                      }}
                                    >
                                      <EditOutlined /> Rename
                                    </span>
                                  </Menu.Item>
                                </Menu>
                              }
                              trigger={["contextMenu"]}
                            >
                              <div
                                style={{
                                  padding: "2px",
                                  cursor: "pointer",
                                }}
                              >
                                <Card
                                  key={`1-${dataa._id}`}
                                  className="video-card"
                                  cover={
                                    <img
                                      style={{
                                        aspectRatio: "16/9",
                                        objectFit: "cover",
                                        objectPosition: "0 0",
                                      }}
                                      src={STATIC_URL + dataa.thumbnail}
                                      className="card-img-size"
                                      onClick={() => {
                                        updateSelectedVOD(dataa, idx);
                                      }}
                                      onError={(e: any) =>
                                        (e.target.src = `/icons/fallback.png`)
                                      }
                                    />
                                  }
                                >
                                  <Row style={{ marginTop: "-12px" }}>
                                    <Col>
                                      <Tooltip
                                        placement="bottom"
                                        title={
                                          dataa.videoName
                                            ? dataa.videoName
                                            : dataa.flightID.name
                                        }
                                      >
                                        <Text
                                          strong
                                          ellipsis
                                          style={{ width: 130 }}
                                        >
                                          <VideoCameraOutlined /> &nbsp;{" "}
                                          {dataa.videoName
                                            ? dataa.videoName
                                            : dataa.flightID.name}
                                        </Text>
                                      </Tooltip>
                                    </Col>
                                  </Row>
                                  <Text type="secondary">
                                    {moment(dataa.createdAt).format("llll")}
                                  </Text>
                                </Card>
                              </div>
                            </Dropdown>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Row>
                        {data.map((dataa, idx) => (
                          <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={8}
                            xl={6}
                            xxl={6}
                            key={`${dataa._id}`}
                          >
                            <Dropdown
                              overlay={
                                <Menu>
                                  <Menu.Item key="1">
                                    <span>
                                      <a
                                        href={
                                          STATIC_URL +
                                          dataa.videoPath
                                            .toString()
                                            .replace(".m3u8", ".flv")
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
                                      setThumbnail(vodThumbnail(dataa, idx));
                                      props.thread(true, {
                                        docType: "vod",
                                        docId: dataa._id,
                                      });
                                    }}
                                  >
                                    <MessageOutlined /> Open Thread{" "}
                                  </Menu.Item>
                                  <Menu.Item
                                    key="3"
                                    onClick={() => {
                                      toggleFlag(dataa);
                                      setRefresh(true);
                                    }}
                                  >
                                    {!dataa.isFlagged ? (
                                      <>
                                        <FlagOutlined /> Flag
                                      </>
                                    ) : (
                                      <>
                                        <FlagOutlined /> Unflag
                                      </>
                                    )}
                                  </Menu.Item>
                                  {renderDeleteBtn(dataa._id)}
                                  <Menu.Item key="5">
                                    <span
                                      onClick={() => {
                                        setEditVideoName({
                                          id: dataa._id,
                                          name: dataa.videoName,
                                        });
                                        showModal3();
                                      }}
                                    >
                                      <EditOutlined /> Rename
                                    </span>
                                  </Menu.Item>
                                </Menu>
                              }
                              trigger={["contextMenu"]}
                            >
                              <div
                                style={{
                                  padding: "2px",
                                }}
                              >
                                <Badge
                                  style={{
                                    backgroundColor: "#f5222d",
                                    padding: "5px",
                                    borderRadius: "5px",
                                  }}
                                  offset={[-15, 15]}
                                  count={
                                    dataa.isFlagged ? (
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
                                  <Card
                                    key={`1-${dataa._id}`}
                                    className="outcome-cardd"
                                    cover={
                                      <>
                                        <img
                                          style={{
                                            aspectRatio: "16/9",
                                            objectFit: "cover",
                                            objectPosition: "0 0",
                                          }}
                                          src={STATIC_URL + dataa.thumbnail}
                                          // className='card-img-size'
                                          onClick={() => {
                                            updateSelectedVOD(dataa, idx);
                                          }}
                                          onError={(e: any) =>
                                            (e.target.src = `/icons/fallback.png`)
                                          }
                                        />
                                      </>
                                    }
                                  >
                                    <Row style={{ marginTop: "-12px" }}>
                                      <Col>
                                        <Tooltip
                                          placement="bottom"
                                          title={
                                            dataa.videoName
                                              ? dataa.videoName
                                              : dataa.flightID.name
                                          }
                                        >
                                          <Text
                                            strong
                                            ellipsis
                                            style={{ width: 130 }}
                                          >
                                            <VideoCameraOutlined /> &nbsp;{" "}
                                            {dataa.videoName
                                              ? dataa.videoName
                                              : dataa.flightID.name}
                                          </Text>
                                        </Tooltip>
                                      </Col>
                                    </Row>
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: "12px" }}
                                    >
                                      {moment(dataa.createdAt).format("llll")}
                                    </Text>
                                  </Card>
                                </Badge>
                              </div>
                            </Dropdown>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {showCarousel && (
                  <div className="backdrop">
                    <div className="topbar">
                      <CloseOutlined
                        onClick={() => {
                          fetchVODByMission();
                          setShowCarousel(false);
                        }}
                        className="btn-icon"
                      />
                      {videoDetails.link && (
                        <a
                          href={
                            STATIC_URL +
                            videoDetails.link
                              .toString()
                              .replace(".m3u8", ".flv")
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
                          updateSelectedVOD(data[newIndex], newIndex);
                        }}
                        dots={false}
                        arrows
                        nextArrow={<RightOutlined />}
                        prevArrow={<LeftOutlined />}
                      >
                        {data.map((i, idx) => (
                          <div
                            style={{
                              height: "500px",
                              textAlign: "center",
                              background: "black",
                            }}
                          >
                            {!videoDetails.link && (
                              <img
                                style={{
                                  height: "400px",
                                  width: "auto",
                                  margin: "auto",
                                }}
                                src={STATIC_URL + i.thumbnail}
                                onClick={() => {
                                  updateSelectedVOD(i, idx);
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </Carousel>
                      {videoDetails.link && (
                        <>
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
                              url={STATIC_URL + videoDetails.link}
                              mission={videoDetails.missionDetails}
                              alertBtnStatus=""
                              theatreModeStatus="none"
                              liveTagStatus="none"
                              liveTelemetry={false}
                              showHUD={videoDetails.isSRT}
                              updateVOD={updateVODAttr}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {data.map((dataa, idx) => (
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item key="1">
                          <span>
                            <a
                              href={
                                STATIC_URL +
                                dataa.videoPath
                                  .toString()
                                  .replace(".m3u8", ".flv")
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
                            setThumbnail(vodThumbnail(dataa, idx));
                            props.thread(true, {
                              docType: "vod",
                              docId: dataa._id,
                            });
                          }}
                        >
                          <MessageOutlined /> Open Thread{" "}
                        </Menu.Item>
                        {renderDeleteBtn(dataa._id)}
                        <Menu.Item>
                          <span
                            onClick={() => {
                              setEditVideoName({
                                id: dataa._id,
                                name: dataa.videoName,
                              });
                              showModal3();
                            }}
                          >
                            <EditOutlined /> Rename
                          </span>
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={["contextMenu"]}
                  >
                    <Row
                      className="listview-outcomes"
                      align="middle"
                      onClick={() => {
                        if (activateSelection) {
                          if (checkedList.includes(dataa._id)) {
                            const filtered: any = checkedList.filter(
                              (i: any) => i !== dataa._id
                            );
                            setCheckedList(filtered);
                          } else {
                            setCheckedList([...checkedList, dataa._id]);
                          }
                        }
                      }}
                      style={
                        activateSelection && checkedList.includes(dataa._id)
                          ? {
                              border: "4px solid #3b86ff",
                              cursor: "pointer",
                              padding: "6px",
                            }
                          : {}
                      }
                    >
                      <Col md={8} style={{ padding: "10px" }}>
                        <Badge
                          style={{
                            backgroundColor: "#f5222d",
                            padding: "5px",
                            borderRadius: "5px",
                          }}
                          offset={[-25, 25]}
                          count={
                            dataa.isFlagged ? (
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
                          <img
                            style={{
                              padding: "8px",
                              width: "100%",
                              height: "auto",
                            }}
                            width={310}
                            height={175}
                            src={STATIC_URL + dataa.thumbnail}
                            onClick={() => {
                              if (!activateSelection) {
                                updateSelectedVOD(dataa, idx);
                              }
                            }}
                            onError={(e: any) =>
                              (e.target.src = `/icons/fallback.png`)
                            }
                          />
                        </Badge>
                      </Col>
                      <Col md={16}>
                        <div className="info-part">
                          <Row>
                            <Text style={{ fontSize: "17px" }}>
                              {dataa.videoName
                                ? dataa.videoName
                                : dataa.flightID.name}
                            </Text>
                          </Row>
                          <Row>
                            <Col md={20}>
                              <Text type="secondary">
                                Size : {dataa.fileSize.toFixed(2)} mb
                              </Text>
                            </Col>
                            <Col md={4}>
                              <Text type="secondary" className="inference">
                                Inference: {dataa.__v}
                              </Text>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={20}>
                              <Text type="secondary">
                                <UserOutlined /> {dataa.createdBy}
                              </Text>
                            </Col>
                            <Col md={4}>
                              <Text type="secondary" className="relative-time">
                                <em>{moment(dataa.createdAt).fromNow()}</em>
                              </Text>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </Dropdown>
                ))}
              </>
            )}
            <Pagination
              defaultCurrent={page}
              defaultPageSize={limit}
              onShowSizeChange={(currPage, limit) => {
                setPage(currPage);
                setLimit(limit);
              }}
              current={page}
              onChange={(currPage, limit) => {
                setPage(currPage);
                setLimit(limit);
              }}
              total={totalCount}
              hideOnSinglePage={true}
              showSizeChanger={true}
            />
          </>
        )}
      </div>
    );
  }

  //----------------Render Assign Pilot Button---------------------

  function renderUploadBtn() {
    if (
      props.userType === "tenant-staff" ||
      props.userType === "tenant-client"
    ) {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "vod_create"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <div className="upload-btn">
            <Button onClick={() => uploadModal()}>
              <UploadOutlined /> Upload{" "}
            </Button>
          </div>
        );
      }
    } else {
      return (
        <div className="upload-btn">
          <Button onClick={() => uploadModal()}>
            <UploadOutlined /> Upload{" "}
          </Button>
        </div>
      );
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleCancel2 = () => {
    setIsModalVisible2(false);
  };

  return (
    <>
      <Modal
        title="Maximum Limit reached!"
        visible={isModalVisible}
        onOk={handleCancel}
        onCancel={handleCancel}
      >
        <Result
          status="500"
          title="Oops! You have reached your limit of uploading videos!"
          subTitle="Please contact your admin."
          //extra={<Button type="primary" onClick={() => window.history.back()}>Back</Button>}
        />
      </Modal>
      <Modal
        title="Tenant Expired!"
        visible={isModalVisible2}
        onOk={handleCancel2}
        onCancel={handleCancel2}
      >
        <Result
          status="403"
          title="Oops! Your tenant has expired!"
          subTitle="Please contact admin@kesowa.com to renew our services!"
        />
      </Modal>
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
      <Modal
        title="Edit Video Name"
        visible={isEditModalVisible}
        // onOk={handleOk3}
        onCancel={handleCancel3}
        footer={[
          <Button onClick={handleCancel3} disabled={videoNameLoader}>
            Cancel
          </Button>,
          <Button type="primary" loading={videoNameLoader} onClick={handleOk3}>
            Save
          </Button>,
        ]}
      >
        <Input
          value={editVideoName.name}
          onChange={(e) =>
            setEditVideoName({ ...editVideoName, name: e.target.value })
          }
        />
      </Modal>
      <Thread thumbnail={thumbnail} setThumbnail={setThumbnail} />
      <FilterToolbar
        type="Video"
        loader={loader}
        setListView={setListView}
        listView={listView}
        setIsAscending={setIsAscending}
        isAscending={isAscending}
        setFlaggedFilter={setFlaggedFilter}
        flaggedFilter={flaggedFilter}
        setUnflaggedFilter={setUnflaggedFilter}
        unflaggedFilter={unflaggedFilter}
        handleSortChange={handleSortChange}
      />

      <ActionToolbar
        type="Video"
        setCheckedList={setCheckedList}
        checkedList={checkedList}
        setActivateSelection={setActivateSelection}
        activateSelection={activateSelection}
        setData={setVodData}
        data={VodData}
        totalCount={totalCount}
        setFlag={setFlag}
        flag={flag}
        uploadBtn={renderUploadBtn}
        updateAPI={apis.UPDATE_MULTI_VOD}
        delete={deleteVideo}
      />

      {loader ? (
        // <div style={{ margin: "auto", marginTop: "5%" }}>
        //   <Spin size='large' />
        // </div>
        <>
          {!listView ? (
            <>
              <Col span={8} className="vid-thumbnail">
                <Card
                  key="1"
                  className="video-card"
                  cover={<Shimmer height={100} width={208} />}
                >
                  <Row style={{ marginTop: "-12px" }}>
                    <Skeleton active paragraph={{ rows: 1 }} />
                  </Row>
                </Card>
              </Col>
              <Col span={8} className="vid-thumbnail">
                <Card
                  key="2"
                  className="video-card"
                  cover={<Shimmer height={100} width={208} />}
                >
                  <Row style={{ marginTop: "-12px" }}>
                    <Skeleton active paragraph={{ rows: 1 }} />
                  </Row>
                </Card>
              </Col>
              <Col span={8} className="vid-thumbnail">
                <Card
                  key="3"
                  className="video-card"
                  cover={<Shimmer height={100} width={208} />}
                >
                  <Row style={{ marginTop: "-12px" }}>
                    <Skeleton active paragraph={{ rows: 1 }} />
                  </Row>
                </Card>
              </Col>
            </>
          ) : (
            <>
              <Row>
                <Row className="vid-thumbnail">
                  <Card
                    key="1"
                    className="video-card"
                    cover={<Shimmer height={100} width={208} />}
                  >
                    <Row style={{ marginTop: "-12px" }}>
                      <Skeleton active paragraph={{ rows: 1 }} />
                    </Row>
                  </Card>
                </Row>
                <Row className="vid-thumbnail">
                  <Card
                    key="2"
                    className="video-card"
                    cover={<Shimmer height={100} width={208} />}
                  >
                    <Row style={{ marginTop: "-12px" }}>
                      <Skeleton active paragraph={{ rows: 1 }} />
                    </Row>
                  </Card>
                </Row>
                <Row className="vid-thumbnail">
                  <Card
                    key="3"
                    className="video-card"
                    cover={<Shimmer height={100} width={208} />}
                  >
                    <Row style={{ marginTop: "-12px" }}>
                      <Skeleton active paragraph={{ rows: 1 }} />
                    </Row>
                  </Card>
                </Row>
              </Row>
            </>
          )}
        </>
      ) : VodData.length > 0 ? (
        renderVideos(VodData)
      ) : (
        <Empty style={{ margin: "auto" }} />
      )}
    </>
  );
}

const mapStateToProps = (state: any) => ({
  Theme: state.theme,
});

export default connect(mapStateToProps, { logout, thread })(Videos);
