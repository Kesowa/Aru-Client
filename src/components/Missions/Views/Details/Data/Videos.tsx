import { useEffect, useState, useRef, useContext } from "react";
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
  Dropdown,
  Button,
  Alert,
  Result,
  Carousel,
  Input,
  Skeleton,
  Badge,
  Pagination,
  MenuProps,
  notification,
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
import moment from "moment";
import VideoPlayer from "../../../../shared/VideoPlayer";
import Dragger from "antd/lib/upload/Dragger";
import { API_URL, STATIC_URL } from "src/constants";
import { io } from "socket.io-client";
import FilterToolbar from "src/components/shared/Toolbar/filter";
import ActionToolbar from "src/components/shared/Toolbar/action";
import Thread from "../../../../shared/Thread";
import axios from "axios";
import { DocModel, uploadFile } from "src/services/fileUpload";

import { PERMS } from "src/static/permissions";
import { AuthContext } from "src/services/authUtils";
import { ThreadContext } from "src/services/threadUtils";

type props = {
  missionDetails: any;
  userType: any;
  userDetails: any;
};
const { Text } = Typography;
function Videos(props) {
  const [VodData, setVodData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [videoDetails, setVideoDetails] = useState<any>({});
  const [editVideoName, setEditVideoName] = useState<any>({});
  const [thumbnail, setThumbnail] = useState("");
  const [gridCount, setGridCount] = useState(0);
  const [videoNameLoader, setVideoNameLoader] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState({});
  const [listView, setListView] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [storageModal, setStorageModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [totalCount, setTotalCount] = useState(0);
  const [threadDetails, setThreadDetails] = useState({});
  const [isUploading, setUploading] = useState(false);
  const socket: any = useRef();
  const [activateSelection, setActivateSelection] = useState(false);
  const [isAscending, setIsAscending] = useState(false);
  const [sortType, setSortType] = useState("timeStamp");
  const [flag, setFlag] = useState(false);
  const [flaggedFilter, setFlaggedFilter] = useState(false);
  const [unflaggedFilter, setUnflaggedFilter] = useState(false);

  const { Auth, logout } = useContext(AuthContext);
  const userDetails = Auth.userdetails;
  const userType = userDetails.userType;

  const { thread, openThread } = useContext(ThreadContext);

  const defaultCheckedList = [];
  const [checkedList, setCheckedList] = useState<any>(defaultCheckedList);

  const openNotification = (title, description, type) => {
    notification[type]({
      message: title,
      description: description,
    });
  };

  const vodMenu: MenuProps["items"] = (data) => {
    const item = [
      {
        key: "1",
        label: (
          <span>
            <a
              href={
                STATIC_URL + data.originalFile
              }
              download
            >
              Download
            </a>
          </span>
        ),
        icon: <DownloadOutlined />,
      },
      {
        key: "2",
        label: "Open Thread",
        icon: <MessageOutlined />,
      },
    ];
    if (
      props.missionDetails.currentUserDetails.customPermissions.includes(
        PERMS.VOD_UPDATE
      )
    ) {
      item.push(
        {
          key: "3",
          label: !data.isFlagged ? "Flag" : "Unflag",
          icon: <FlagOutlined />,
        },
        {
          key: "4",
          label: "Rename",
          icon: <EditOutlined />,
        }
      );
    }
    if (
      props.missionDetails.currentUserDetails.customPermissions.includes(
        PERMS.VOD_DELETE
      )
    ) {
      item.push({
        key: "5",
        label: "Delete video",
        icon: <DeleteOutlined />,
      });
    }
    return item;
  };

  const handleEscKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setShowCarousel(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscKeyPress);
    return () => {
      document.removeEventListener("keydown", handleEscKeyPress);
    };
  }, []);

  const vodMenuOnClick: MenuProps["onClick"] = (e) => {
    console.log(e);
    switch (e.key) {
      case "1":
        break;
      case "2":
        openThread(
          "vod",
          selectedVideo?.data._id,
          selectedVideo?.data.bookmarks
            ? {
                bookmarks: generateTags(),
              }
            : {}
        );
        setThumbnail(vodThumbnail());
        break;
      case "3":
        toggleFlag();
        break;
      case "4":
        setEditVideoName({
          id: selectedVideo?.data._id,
          name: selectedVideo?.data.videoName,
        });
        showModal3();
        break;
      case "5":
        Modal.confirm({
          title: "Delete video?",
          icon: <ExclamationCircleOutlined />,
          content: "Are you sure you want to delete this video?",
          okText: "Yes",
          cancelText: "No",
          onOk: () => {
            deleteVideo(selectedVideo?.data._id);
          },
        });
        break;
      default:
        break;
    }
  };
  const updateVODAttr = (body, action = null) => {
    http
      .patch(`${apis.UPDATE_VOD}`, body)
      .then((res) => {
        if (res.data.status) {
          if ("isFlagged" in body.update) {
            setRefresh(true);
            message.success(
              `Video ${
                !body.update.isFlagged ? "un-flagged" : "flagged"
              } successfully!`
            );
          } else if ("bookmarks" in body.update) {
            //setRefresh(true);
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

  // const handleVoilenceInference = (vodId) => {
  //   http
  //     .post(`${apis.BASE_AIML_API}vod/${vodId}/violence/infer`)
  //     .then((res) => {
  //       if (res.data.status) {
  //           setLoading(true);
  //           message.success("Violence inference started successfully!");
  //       } else {
  //         message.error(res.data.message || "Something went wrong!");
  //       }
  //     })
  //     .catch((err) => {
  //       console.error("Error starting violence inference:", err.message);
  //       message.error("Failed to start violence inference. Please try again.");
  //     });
  // };

  const toggleFlag = () => {
    const { data } = selectedVideo;
    const body = {
      id: data._id,
      update: { isFlagged: !data.isFlagged },
    };
    updateVODAttr(body);
  };
  const ImageComponent = (item: any) => {
    return (
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
    const videoExtensions = ["mp4", "mkv", "avi", "mov", "wmv", "flv"];
    if (videoExtensions.includes(videoFile.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }
  useEffect(() => {
    if (!thread.open) {
      setRefresh(true);
    }
  }, [thread.open]);
  //--------------- Upload Props -------------------------

  const UploadProps = {
    name: "file",
    multiple: true,
    action: `${apis.UPLOAD_VOD}`,
    customRequest: async (options: any) => {
      const cancelToken = axios.CancelToken;
      const source = cancelToken.source();
      setUploading(true);

      const uploadToken = await uploadFile(options.file, DocModel.VOD, (prog) => {
        options.onProgress({ percent: prog * 100 });
      }, source.token);
        
      const body = {
        file: uploadToken,
        missionID: props.missionDetails.missionId,
        flightID: props.missionDetails.flightId,
        locationID: props.missionDetails.locationId?._id
          ? props.missionDetails.locationId._id
          : undefined,
      };
      // const fData = new FormData();
      // fData.append("video", options.file);
      // fData.append("missionID", props.missionDetails.missionId);
      // fData.append("flightID", props.missionDetails.flightId);
      // if (props.missionDetails.locationId?._id) {
      //   fData.append("locationID", props.missionDetails.locationId?._id);
      // }

      switch (
        props.missionDetails.userType //upload priviledge checks
      ) {
        case "tenant-root": //when user is a tenant root
          console.log(options.file.name.split(".")[1]);
          const parts = options.file.name.split(".");
          const isValidExtension = checkExtension(parts[parts.length - 1]);
          console.log("isvalid", isValidExtension);
          if (isValidExtension) {
            http
              .post(options.action, body)
              .then((res: any) => {
                options.onSuccess(res.data, options.file);
                console.log("Upload successful! ", res.data);
                message.success(
                  "File " + options.file.name + " uploaded successfully"
                );

                props.setCount(props.totalVOD + 1);
              })
              .catch((err) => {
                if (axios.isCancel(err)) {
                  console.log("Upload Cancelled");
                  return;
                } else if (err.response.status === 403) {
                  if (
                    err.response.data.message ===
                    "Package has expired! Please renew!"
                  ) {
                    setIsModalVisible2(true);
                    window.setTimeout(function () {
                      AxiosErrorHandler(err, logout);
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

        case "tenant-staff": // when user is tenant staff
          const parts2 = options.file.name.split(".");
          const isValidExtension2 = checkExtension(parts2[parts2.length - 1]);
          if (isValidExtension2) {
            http
              .post(options.action, body)
              .then((res: any) => {
                options.onSuccess(res.data, options.file);
                console.log("Upload successful! ", res.data);
                message.success(
                  "File " + options.file.name + " uploaded successfully"
                );

                props.setCount(props.totalVOD + 1);
              })
              .catch((err) => {
                if (axios.isCancel(err)) {
                  console.log("Upload Cancelled");
                  return;
                } else if (err.response.status === 403) {
                  if (
                    err.response.data.message ===
                    "Package has expired! Please renew!"
                  ) {
                    setIsModalVisible2(true);
                    window.setTimeout(function () {
                      AxiosErrorHandler(err, logout);
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
      return {
        abort() {
          console.log("Aborting video upload");
          source.cancel("User cancelled upload");
          setUploading(false);
        },
      };
    },
  };

  const cancelUpload = async () => {
    try {
      await axios.post("/api/cancel-upload"); // Replace with process cancelation api
      message.success("Upload has been canceled successfully");
    } catch (error) {
      console.error("Failed to cancel upload:", error);
      message.error("Failed to cancel upload");
    }
  };

  useEffect(() => {
    let socketInstance = null;

    if (props?.missionDetails?.missionId) {
      if (socket.current) {
        // Close the existing socket connection
        socket.current.disconnect();
      }

      socketInstance = io(
        `${API_URL}/stream/mission-specific?missionID=${props.missionDetails.missionId}`
      );

      socketInstance.on("PROCESS_VIDEO_FINISHED", (data) => {
        console.log("Video processing finished: ", data);
        openNotification(
          "Finished Processing!",
          `Processing ${data.videoName} has been complete!`,
          "success"
        );
        setRefresh(true);
      });

      socketInstance.on("VOD_REMOVED", (data) => {
        setRefresh(true);
      });
    }

    // Cleanup function to close the socket connection
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [props?.missionDetails?.missionId]);

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
          AxiosErrorHandler(err, logout);
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

  const vodThumbnail = () => {
    const { data, idx } = selectedVideo;
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
    setThreadDetails(vodDetails);
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
            threadThumb={true}
            open={showCarousel}
          />
        </div>
      </Badge>
    );
  };
  const updateSelectedVOD = (data, idx: number) => {
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
    } else {
      message.info("Please select some videos to delete!");
    }
  };

  //-------- Upload Modal ------------------------
  
  function uploadModal() {
    Modal.confirm({
      title: "Upload video files!",
      content: (
        <div className="upload-modal-video">
          <Alert
            style={{ marginBottom: "8px" }}
            message="Only .mp4 files are supported for videos."
            type="info"
            showIcon
          />
          <Dragger {...UploadProps} defaultFileList={[]}>
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
      okText: "Close",
      cancelText: "Cancel",
      onOk() {},
      onCancel: cancelUpload, 
    });
  }
  useEffect(() => {
    console.log("selectedVideo", selectedVideo);
  }, [selectedVideo]);
  useEffect(() => {
    console.log(isUploading);
  }, [isUploading]);
  //-------------------------render delete vod button based on permission--------------
  /* Action Button*/

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

  const generateTags = () => {
    return Object.keys(selectedVideo?.data).map((key) => ({
      id: Number(key),
      display: selectedVideo?.data[key],
    }));
  };
  useEffect(() => {
    if (!(activateSelection && checkedList.length > 0)) {
      setFlag(false);
    }

    const flaggedArray = VodData.map((data: any) => {
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
    if (data.length === 0) return <Empty style={{ margin: "auto" }} />;
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
                                videoDetails.missionDetails.originalFile
                              }
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
                                  key={window.crypto.randomUUID()}
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
                          )}
                        </div>
                      </div>
                    )}
                    {data.length > gridCount ? (
                      <Row>
                        {data.map((dataa, idx) => (
                          <Col
                            span={[1920, 2560].includes(window.screen.width) ? 4 : 8}
                            key={`${dataa._id}`}
                          >
                            <Dropdown
                              menu={{
                                items: vodMenu(dataa),
                                onClick: vodMenuOnClick,
                              }}
                              onOpenChange={() =>
                                setSelectedVideo({ data: dataa, idx })
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
                              menu={{
                                items: vodMenu(dataa),
                                onClick: vodMenuOnClick,
                              }}
                              onOpenChange={() =>
                                setSelectedVideo({ data: dataa, idx })
                              }
                              trigger={["contextMenu"]}
                            >
                              <div
                               style={{ padding: "2px", cursor: "pointer" }}
                               onMouseDown={() => handleLongPressStart(dataa)}
                               onMouseUp={handleLongPressEnd}
                               onTouchStart={() => handleLongPressStart(dataa)}
                               onTouchEnd={handleLongPressEnd}
                              >
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
                                  <Badge
                                    style={{
                                      backgroundColor: "#3b86ff",
                                      boxShadow: "0 0 3px 1px black",
                                      zIndex: 10,
                                    }}
                                    offset={[-5, 5]}
                                    count={
                                      dataa.isThreadExist
                                        ? dataa.commentCount
                                        : 0
                                    }
                                    overflowCount={9}
                                  >
                                    <Card
                                      key={`1-${dataa._id}`}
                                      onClick={() => {
                                        if (longPressOccurred) {
                                          setLongPressOccurred(false);
                                          return;
                                        }
                                        if (activateSelection) {
                                          if (checkedList.includes(dataa._id)) {
                                            const filtered = checkedList.filter((i: any) => i !== dataa._id);
                                            setCheckedList(filtered);
                                          } else {
                                            setCheckedList([...checkedList, dataa._id]);
                                          }
                                        } else {
                                          updateSelectedVOD(dataa, idx);
                                        }
                                      }}
                                      className="outcome-cardd"
                                      cover={
                                          <img
                                            style={{
                                              aspectRatio: "16/9",
                                              objectFit: "cover",
                                              objectPosition: "0 0",
                                            }}
                                            src={STATIC_URL + dataa.thumbnail}
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
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                      >
                                        {moment(dataa.createdAt).format("llll")}
                                      </Text>
                                    </Card>
                                  </Badge>
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
                            videoDetails.missionDetails.originalFile
                          }
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
                            key={window.crypto.randomUUID()}
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
                      )}
                    </div>
                  </div>
                )}

                {data.map((dataa, idx) => (
                  <Dropdown
                    menu={{
                      items: vodMenu(dataa),
                      onClick: vodMenuOnClick,
                    }}
                    onOpenChange={() => setSelectedVideo({ data: dataa, idx })}
                    trigger={["contextMenu"]}
                    key={window.crypto.randomUUID()}
                  >
                    <Row
                      className="listview-outcomes"
                      align="middle"
                      onMouseDown={() => handleLongPressStart(dataa)}
                      onMouseUp={handleLongPressEnd}
                      onTouchStart={() => handleLongPressStart(dataa)}
                      onTouchEnd={handleLongPressEnd}
                      onClick={() => {
                        if (longPressOccurred) {
                          setLongPressOccurred(false);
                          return;
                        }
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
                          <Badge
                            style={{
                              backgroundColor: "#3b86ff",
                              boxShadow: "0 0 3px 1px black",
                              zIndex: 10,
                            }}
                            offset={[-5, 5]}
                            count={dataa.isThreadExist ? dataa.commentCount : 0}
                            overflowCount={9}
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
    if (userType === "tenant-staff" || userType === "tenant-client") {
      if (userDetails.customPermissions.includes(PERMS.VOD_CREATE)) {
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

  //media selection
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [longPressOccurred, setLongPressOccurred] = useState(false);

  const handleLongPressStart = (video: any) => {
    const timer = setTimeout(() => {
      setActivateSelection(true);
      setCheckedList(prev => {
        if (prev.includes(video._id)) {
          return prev.filter((id: string) => id !== video._id);
        }
        return [...prev, video._id];
      });
      setLongPressOccurred(true);
    }, 500);
    setLongPressTimer(timer);
  };

  useEffect(() => {
    if (checkedList.length === 0 && activateSelection) {
      setActivateSelection(false);
    }
  }, [checkedList, activateSelection]);

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    } else {
      setTimeout(() => setLongPressOccurred(false), 100);
    }
  };

  return (
    <>
      <Modal
        title="Maximum Limit reached!"
        open={isModalVisible}
        onOk={handleCancel}
        onCancel={handleCancel}
      >
        <Result
          status="500"
          title="Oops! You have reached your limit of uploading videos!"
          subTitle="Please contact your admin."
        />
      </Modal>
      <Modal
        title="Tenant Expired!"
        open={isModalVisible2}
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
        open={storageModal}
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
        open={isEditModalVisible}
        onCancel={handleCancel3}
        footer={[
          <Button onClick={handleCancel3} disabled={videoNameLoader} key={window.crypto.randomUUID()}>
            Cancel
          </Button>,
          <Button type="primary" loading={videoNameLoader} onClick={handleOk3} key={window.crypto.randomUUID()}>
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
      <Thread
        thumbnail={thumbnail}
        setThumbnail={setThumbnail}
        data={threadDetails}
      />
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
        canToggleFlag={userDetails.customPermissions.includes(PERMS.VOD_UPDATE)}
        canDelete={userDetails.customPermissions.includes(PERMS.VOD_DELETE)}
      />
      {loader ? (
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
          )}
        </>
      ) : renderVideos(VodData)}
    </>
  );
}

export default Videos;
