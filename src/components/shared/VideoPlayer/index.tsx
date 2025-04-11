import React, { useState, useRef, useEffect, useContext } from "react";
import ReactPlayer from "react-player";
import "./index.less";
import "./hud.less";
import { reverseGeocoder as geocoder } from "../../../services/MapBoxGeocoder";
import * as htmlToImage from "html-to-image";
import {
  Row,
  Col,
  Typography,
  Slider,
  Button,
  Tag,
  notification,
  Dropdown,
  Menu,
  Spin,
  Tooltip,
  Switch,
  Modal,
  Progress,
  Image,
  Result,
  message,
} from "antd";
import {
  LoadingOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  SwapOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeUp,
  faCamera,
  faExpand,
  faPlay,
  faPause,
  faVolumeMute,
  faTv,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import {
  BsBookmarkPlusFill,
  BsBookmarkDashFill,
  BsFlagFill,
} from "react-icons/bs";
import { DocModel, uploadFile } from "src/services/fileUpload";
import screenfull from "screenfull";
import DroneMap from "../DroneMap";
import FlightLogMap from "../FlightLogMap";
import connectSocket from "../../../services/socketConnect";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import * as turf from "@turf/turf";
import { API_URL, LIVE_URL, STATIC_URL } from "src/constants";
import { FlightPath } from "src/types/FlightPath";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartToolTip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { io } from "socket.io-client";
import { AuthContext } from "src/services/authUtils";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartToolTip,
  Filler,
  Legend
);
ChartJS.defaults.elements.point.pointStyle = false;
const { Text, Link } = Typography;
const { SubMenu, Item } = Menu;

const antIcon = <LoadingOutlined style={{ fontSize: 64 }} spin />;
const openNotification = (placement) => {
  notification.info({
    message: `Alert Captured Successfully!`,
    description:
      "Your alert was captured successfully from your browser-based video player! You can view them in the Outcomes section of this page.",
    placement,
  });
};
const openVODNotification = (title, description, type) => {
  notification[type]({
    message: title,
    description: description,
  });
};
const format = (seconds) => {
  if (isNaN(seconds)) {
    return "00:00";
  }

  const date = new Date(seconds * 1000);

  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes().toString().padStart(2, "0");
  const ss = date.getUTCSeconds().toString().padStart(2, "0");

  if (hh) {
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
};

//-----------Base 64--------------------------
const b64toBlob = (b64Data, contentType) => {
  contentType = contentType || "";
  const sliceSize = 512;

  const byteCharacters = atob(b64Data);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

function VideoPlayer(props: any) {
  const { Auth, logout } = useContext(AuthContext);
  const [isAiTaskCompleted, setIsAiTaskCompleted] = useState(false);
  const [aiTaskData, setAiTaskData] = useState({ Keys: [], Values: [] });
  const [aiGraphData, setAiGraphData] = useState({});
  const [aiGraphGenerated, setAiGraphGenerated] = useState(false);
  const [aiTask, setAiTask] = useState("");
  const [aiTaskStatus, setAiTaskStatus] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [playingBeforeCapture, setPlayingBeforeCapture] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [pip, setPip] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [bookmark, setBookmark] = useState({});
  const [controlVisibleCounter, setControlVisibleCounter] = useState(0);
  const [bottomHudHeight, setBottomHudHeight] = useState(70);
  const [bottomMapHeight, setBottomHeight] = useState(95);
  const [isAlertEnabled, setIsAlertEnabled] = useState(false);
  const [alertImage, setAlertImage] = useState("");
  const [volume, setVolume] = useState(0.5);
  const [playbackSpeed, setPlaybackSpeed] = useState<any>(1);
  const [position, setPosition] = useState({
    lat: 43.642567,
    long: -79.387054,
  });
  const [location, setLocation] = useState({
    lat: 43.642567,
    long: -79.387054,
  });
  const [inferType, setInferType] = useState("");
  const [peopleData, setPeopleData] = useState();
  const [boundingBoxes,setBoundingBoxes] = useState();
  const [peopleCount,setPeopleCount] = useState()
  const [scaledBoxes, setScaledBoxes] = useState([]);

  const [showHotkeys, setShowHotkeys] = useState(false);
  const [storageModal, setStorageModal] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const playerControlsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoLoader, setVideoLoader] = useState(true);
  const [volumeBar, setVolumeBar] = useState(false);
  const [showAltitude, setShowAltitude] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [showVSpeed, setShowVSpeed] = useState(true);
  const [showHSpeed, setShowHSpeed] = useState(true);
  const [showCourse, setShowCourse] = useState(true);
  const [showBatter, setShowBatter] = useState(true);
  const [showPosition, setShowPosition] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [distance, setDistance] = useState<any>(undefined);
  const [velocity, setVelocity] = useState<any>(undefined);
  const [h_speed, setH_speed] = useState<any>(undefined);
  const [v_speed, setV_speed] = useState<any>(undefined);
  const [dPosition, setDPosition] = useState<any>({
    lat: undefined,
    long: undefined,
  });
  const [height, setHeight] = useState<any>(undefined);
  const [course, setCourse] = useState<any>(undefined);
  const [vSpeedDeg, setVSpeedDeg] = useState(-150);
  const [hSpeedDeg, setHSpeedDeg] = useState(-150);
  const [batter, setBatter] = useState(0);
  const [batterLevel, setBatteryLevel] = useState(0);
  //---misc tele-------------------------------
  const [ISO, setIso] = useState(0);
  const [EV, setEv] = useState(0);
  const [shutter, setShutter] = useState(0);
  const [fStop, setFStop] = useState(0);

  const [bounds, setBounds] = useState<any>([]);
  const [mapCenter, setMapCenter] = useState<any>([]);
  const [mapZoom, setMapZoom] = useState<any>(0);
  //-------snapshopt states---------------------------------------
  const [captLat, setCaptLat] = useState<any>(0);
  const [captLong, setCaptLong] = useState<any>(0);
  const [captAddress, setCaptAddress] = useState<any>("");
  const [captTime, setCaptTime] = useState<any>("");
  const [loader, setLoader] = useState(false);

  //-----------props states passed to flight log map-----------
  const [flightPathSrt, setFlightPathSrt] = useState<any>({});
  const [flightTeleSrt, setFlightTeleSrt] = useState<any>([]);
  const { Title } = Typography;
  const {
    url,
    handleTheater,
    theater,
    streamKey,
    mission,
    isLive,
    alertBtnStatus,
    theatreModeStatus,
    liveTagStatus,
    map,
  } = props; //add prop for alert button #2

  const resolutionURLs = {
    auto: `${LIVE_URL}/live/${streamKey}.m3u8`,
    fullDefinition: `${LIVE_URL}/live/${streamKey}_480p1128kbs/index.m3u8`, //480p
    highDefinition: `${LIVE_URL}/live/${streamKey}_720p2628kbs/index.m3u8`, //720p
  };

  const [activeURL, setActiveURL] = useState(resolutionURLs.fullDefinition);
  const [quality, setQuality] = useState("480p");
  const [showHUDcontrols, setShowHUDcontrols] = useState(true);
  const duration = playerRef.current ? playerRef.current.getDuration() : 0;
  const currentTime = playerRef.current
    ? playerRef.current.getCurrentTime()
    : "00:00";
  const elapsedTime = format(currentTime);

  let socket;
  const aiSocket: any = useRef();

  const tenantId = props.mission.tenantId;
  const [loading, setLoading] = useState(false);
  const [status ,setStatus] = useState("Idle");
  const [inferenceProgress, setInferenceProgress] = useState(0);

  useEffect(() => {
    let socketInstance = null;

    if (tenantId) {
      if (aiSocket.current) {
        aiSocket.current.disconnect();
      }

      socketInstance = io(
        `${API_URL}/stream/notification?tenantID=${tenantId}`
      );

      aiSocket.current = socketInstance;

      socketInstance.on("AI_TASK_PROGRESS", (data) => {
        console.log(data);
        setLoading(true);
        const { inferId, status, progress } = data;
        setInferenceProgress(progress);

        if (progress === 100) {
          setInferenceProgress(0);
          setLoading(false);
          setStatus("Complete");
          openVODNotification(
            `Finished Processing!`,
            `AI has ${aiTaskStatus} processing video: ${props.mission._id}`,
            "success"
          );
        }

        console.log(`Inference ${inferId} progress: ${progress}%`);
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [tenantId]);


  useEffect(() => {
    setIsFlagged(props.mission?.isFlagged);
    if (props.mission && props.mission.bookmarks !== undefined)
      setBookmark(props.mission.bookmarks);
  }, [props.mission, props.mission?.bookmarks]);
  useEffect(() => {
    socket = connectSocket(streamKey);

    if (socket !== null) {
      socket.on("TELEMETRY", (data) => {
        setHeight(data.altitude);
        setVelocity(data.velocity);
        setPosition({
          lat: data.location.lat,
          long: data.location.long,
        });
        setDPosition({
          lat: data.location.lat,
          long: data.location.long,
        });
        setCourse(data.compass);
        setBatter(data.battery);
        setBatteryLevel(getInterPolatedValue(0, 100, 0, 84, data.battery));
      });
    }

    return () => socket.close();
  }, [streamKey]);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handlepip = () => setPip(!pip);

  const handleMute = () => {
    setMuted(!muted);
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
        ticks: {
          padding: 0,
        },
      },
      y: {
        display: false,
        ticks: {
          padding: 0,
        },
      },
    },
    maintainAspectRatio: false,
  };
  const aiTaskDisplay = () => {
    switch (aiTask) {
      case "violence":
        return "Violence";
      case "non-violence":
        return "Non-Violence";
      case "people-count":
        return "People-Count";
      default:
        return;
    }
  };
  const generateDurationLabel = () => {
    const length = aiTaskData.Values.length;
    console.log("AIML length", length, duration, duration / length);
    if (length) {
      const durationSteps = duration / length;
      let steps = durationSteps;
      console.log("AIML durationSteps", durationSteps, steps);
      const label: number[] = [];
      label.push(0);
      for (let i = 0; i < length - 1; i++) {
        label.push(`${Math.round((steps / 100) * 100) / 100} s`);
        steps += durationSteps;
      }
      console.log("AIML label", label);
      return label;
    } else {
      return [];
    }
  };
  const generateGraphData = (task: any) => {
    const index = aiTaskData.Keys.indexOf(task);
    console.log("AIML graphData", task, aiTaskData);
    if (aiTaskData.Values.length > 0) {
      if(task == "people-count") {
        setPeopleData(aiTaskData);
      }
      const graphData = aiTaskData.Values.map((value) => {
        return value[index];
      });
      const labels = generateDurationLabel();
      const taskLabel = aiTaskDisplay();
      const data = {
        labels,
        datasets: [
          {
            fill: true,
            label: taskLabel,
            data: graphData,
            borderColor: "rgba(255, 255, 255, 0.5)",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
          },
        ],
      };
      setAiGraphGenerated(true);
      setAiGraphData(data);
    }
  };

  const startInferenceVODViolence = async () => {
    const taskStatusResponse = await http
      .post(
        apis.INFER_VOD_VIOLENCE
          .replace(":vodId", props.mission._id)
          .replace(":inferType", inferType)
      )
      .catch((err) => {
        console.log("AIML: Error", err);
      });
    if (taskStatusResponse.status) {
      console.log("AIML: Task status -", taskStatusResponse.data.message);
      const message = taskStatusResponse.data.message;
      if (message.includes("started")) {
        setAiTaskStatus("started");
      } else if (message.includes("restarted")) {
        setAiTaskStatus("restarted");
      }
      if (message === "task completed") {
        setIsAiTaskCompleted(true);
      }
    } else {
      console.log("AIML: Error");
    }
  };
  const fetchAITasks = async () => {
    const tasks = await http
      .get(`${apis.FETCH_AI_TASK}/vod/${props.mission._id}`)
      .catch((err) => {
        console.log("AIML", err);
      });
    console.log("AIML tasks.data", tasks.data);
    if (tasks.data?.status) {
      const vodTask = tasks.data.data.filter(
        (task) => task.doc === props.mission._id
      );
      if (vodTask.length !== 0 || vodTask[0].data !== "null") {
        fetchJSON(STATIC_URL + "/" + vodTask[0].data).then((d) => {
          console.log("AIML data", d);
          setAiTaskData(d);
        });
      }

      console.log("AIML", vodTask[0].data);
    }
  };
  const socketFetchTaskStatus = (tenantID: any) => {
    console.log("AIML socket: ", aiSocket, aiSocket.current);
    if (!aiSocket.current) {
      aiSocket.current = io(
        `${API_URL}/stream/notification?tenantID=${tenantID}`
      );

      aiSocket.current.on("AI_TASK", ({ status }) => {
        console.log("AIML AI_TASK: ", status);
        setAiTaskStatus(status);
      });
    }
  };
  useEffect(() => {
    console.log("AIML AI_TASK_STATUS: ", aiTaskStatus);
    if (aiTaskStatus === "started" || aiTaskStatus === "restarted") {
      openVODNotification(
        `Video Processing!`,
        `AI has ${aiTaskStatus} processing video: ${props.mission._id}`,
        "info"
      );
    } else if (aiTaskStatus === "completed") {
      fetchAITasks();
      openVODNotification(
        `Finished Processing!`,
        `AI has ${aiTaskStatus} processing video: ${props.mission._id}`,
        "success"
      );
    }
  }, [aiTaskStatus]);
  useEffect(() => {
    if (!props.open) {
      setIsAiTaskCompleted(false);
      setAiTask("");
      setAiTaskStatus("");
    }
  }, [props.open]);

  useEffect(() => {
    if (aiTask) {
      console.log("AIML aiTask: ", aiTask);
      startInferenceVODViolence();
      if (isAiTaskCompleted) {
        fetchAITasks();
      } else {
        if (
          Auth.userdetails.userType === "tenant-root" ||
          Auth.userdetails.userType === "tenant-staff"
        ) {
          if (Auth.userdetails.tenantId._id) {
            console.log("tenantID>_id");
            socketFetchTaskStatus(Auth.userdetails.tenantId._id);
          } else if (Auth.userdetails.tenantId) {
            console.log("tenantID");
            socketFetchTaskStatus(Auth.userdetails.tenantId);
          }
        }
      }
    }
  }, [Auth.userdetails, props.mission, isAiTaskCompleted, aiTask]);
  useEffect(() => {
    if (aiTask) {
      generateGraphData(aiTask);
    } else {
      setAiGraphGenerated(false);
    }
  }, [aiTask, aiTaskData]);
  useEffect(() => {
    if (aiGraphGenerated) {
      setShowHUDcontrols(false);
    } else {
      setShowHUDcontrols(true);
    }
  }, [aiGraphGenerated]);
  const toggleFullScreen = () => {
    if (
      screenfull.isEnabled &&
      playerContainerRef &&
      playerContainerRef.current
    ) {
      screenfull.toggle(playerContainerRef.current);
    }

    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        if (screenfull.isEnabled) {
          setIsFullScreen(screenfull.isFullscreen);
        }
      });
    }
  };

  const handleEnablePip = () => {
    if (isFullScreen) {
      setIsFullScreen(!isFullScreen);
    }

    if (theater) {
      handleTheater();
    }
  };

  const handleProgress = (changedState) => {
    if (!seeking) {
      if (props.seek && !changedState.played) {
        setPlayed(props.seek / 100 + changedState.played);
      } else {
        setPlayed(changedState.played);
      }
    }
    if (
      controlVisibleCounter > 0 &&
      playerControlsRef &&
      playerControlsRef.current &&
      !isAlertEnabled
    ) {
      playerControlsRef.current.style.opacity = "0";
      setControlVisibleCounter(0);
      setBottomHudHeight(18);
      setBottomHeight(45);
    }

    if (
      playerControlsRef &&
      playerControlsRef.current &&
      playerControlsRef.current.style.opacity === "1"
    ) {
      setControlVisibleCounter(controlVisibleCounter + 1);
    }
  };

  const handleSeekChange = (newValue) => {
    setPlayed(newValue / 100);
    setSeeking(true);
  };

  const handleSeekMouseUp = (newValue) => {
    setSeeking(false);
    if (playerRef && playerRef.current) {
      playerRef.current.seekTo(newValue / 100);
    }
  };
  useEffect(() => {
    console.log("props.seek", props.seek);
    if (props.seek) {
      handleSeekChange(props.seek);
      handleSeekMouseUp(props.seek);
      setPlaying(false);
    }
  }, [props.seek]);
  const handleMouseMove = () => {
    if (playerControlsRef && playerControlsRef.current) {
      playerControlsRef.current.style.opacity = "1";
      setControlVisibleCounter(0);
      setBottomHudHeight(70);
      setBottomHeight(95);
    }
  };

  const handleToolbarSeek = (value) => {
    const fraction = value / 100;
    // If user is not seeking the slider, return normal elapsed time
    if (!seeking) {
      return elapsedTime;
    }
    // Else calulate the current seconds of the video from slider
    return format(fraction * duration);
  };

  // handle snapshot button
  const handleSnapShot = () => {
    if (!isAlertEnabled && canvasRef && canvasRef.current) {
      const canvas = canvasRef.current;

      canvas.width = 1280;
      canvas.height = 720;

      const ctx = canvas.getContext("2d");
      let video;

      if (playerRef && playerRef.current) {
        video = playerRef.current.getInternalPlayer();
      }

      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageURL = canvas.toDataURL();
      setAlertImage(imageURL);

      canvas.width = 0;
      canvas.height = 0;

      setLocation(position);
      setIsAlertEnabled(true);
      if (isFullScreen) toggleFullScreen();
      setPlayingBeforeCapture(playing);
      setPlaying(false);
    }
  };

  // Upload alert api
  const saveAlert = async() => {
    const body = {
      locationName: captAddress,
      location: isLive
        ? location
        : {
            lat: captLat ? captLat : null,
            long: captLong ? captLong : null,
          },
      missionId: isLive ? mission._id : mission.missionID._id,
      flightId: isLive ? mission.flight._id : mission.flightID._id,
      pcount: 0,
      type: "Automated",
      image: "",
    };
    const form = document.createElement("form");
    form.innerHTML = `<input type="file" id="filename" name="filename" /> 
    <input type="submit" id="submitButton" name="submitButton" />`;

    const ImageURL = alertImage;
    const block = ImageURL.split(";");
    const contentType = block[0].split(":")[1];
    const realData = block[1].split(",")[1];
    const blob = b64toBlob(realData, contentType);
    const rcFile = new File([blob], "image.png", { type: contentType });

    const uploadToken = await uploadFile(rcFile, DocModel.ALERT_IMAGES, (prog) => console.info("PROGRESS: " + prog));

    body.image = uploadToken;
    // const formDataToUpload = new FormData(form);
    // formDataToUpload.append("image", blob);
    setLoader(true);
    http
      .post(`${apis.CREATE_ALERT}`, body)
      .then((res) => {
        body.image = res.data.file;

        if (captLat !== undefined && captLong !== undefined) {
          const addressLocation: any = geocoder([
            //Review
            isLive ? location.long : captLong,
            isLive ? location.lat : captLat,
          ])
            .then((res: any) => {
              console.log(res);
              setCaptAddress(res);
            })
            .catch((err: any) => message.error("Error: ", err));
        }

        return http.post(`${apis.CREATE_ALERT}`, body);
      })
      .then((res) => {
        console.log(res.data);
        setIsAlertEnabled(false);
        if (isLive) {
          openNotification("bottomRight");
        }
        setIsModalVisible(false);
        setPlaying(playingBeforeCapture);
      })
      .catch((err: any) => {
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
        } else console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => setLoader(false));
  };

  const cancelAlert = () => {
    setIsAlertEnabled(false);
  };

  const fastforward = () => {
    if (playerRef.current) {
      if (
        playerRef.current.getCurrentTime() + 10 >
        playerRef.current.getDuration()
      )
        playerRef.current.seekTo(playerRef.current.getDuration());
      else playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
    }
  };

  const fastbackward = () => {
    if (playerRef.current) {
      if (playerRef.current.getCurrentTime() - 10 < 0)
        playerRef.current.seekTo(0);
      else playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
    }
  };

  const toggleFlag = (vod) => {
    const body = {
      id: vod._id,
      update: { isFlagged: !isFlagged },
    };
    props.updateBookmark(body);
    setIsFlagged((prev) => !prev);
  };
  const updateBookmark = (updatedBookmark, action) => {
    console.log("updateBookmark", props);
    const body = {
      id: props.mission._id,
      update: { bookmarks: updatedBookmark },
    };
    props.updateVOD(body, action);
  };
  const addBookmark = () => {
    console.log("Add", bookmark);
    if (playerRef.current) {
      const progress = Math.round(played * 100);
      if (!(progress in bookmark)) {
        const allBookmark = { ...bookmark, [progress]: elapsedTime };
        console.log("allbookmark", allBookmark);
        setBookmark(allBookmark);
        updateBookmark(allBookmark, "add");
      }
    }
  };
  const removeBookmark = () => {
    if (playerRef.current) {
      const progress = Math.round(played * 100);
      if (progress in bookmark) {
        const removeKey = (key, { [key]: _, ...rest }) => rest;
        const allBookmark = removeKey(progress, bookmark);
        setBookmark((prev) => removeKey(progress, prev));
        updateBookmark(allBookmark, "remove");
      }
    }
  };
  function fetchJSON(file: any) {
    return fetch(file)
      .then(function (res) {
        return res.json();
      })
      .catch((err) => console.log(err));
  }

  function deg2rad(degree: any) {
    return degree * (Math.PI / 180);
  }

  function rad2deg(rad: any) {
    return (rad * 180) / Math.PI;
  }

  function computeZoomLevel(bounds: any, padding: any) {
    const minx = bounds[1];
    const miny = bounds[0];
    const maxx = bounds[3];
    const maxy = bounds[2];

    const ry1 = Math.log(
      (Math.sin(deg2rad(miny)) + 1) / Math.cos(deg2rad(miny))
    );
    const ry2 = Math.log(
      (Math.sin(deg2rad(maxy)) + 1) / Math.cos(deg2rad(maxy))
    );

    const ryc = (ry1 + ry2) / 2;
    const centerY = rad2deg(Math.atan(Math.sinh(ryc)));
    const resolutionHorizontal = Math.abs(minx - maxx) / 500;
    const vy0 = Math.log(Math.tan(Math.PI * (0.25 + centerY / 360)));
    const vy1 = Math.log(Math.tan(Math.PI * (0.25 + maxx / 360)));
    const viewHeightHalf = 300 / 2;
    const zoomFactorPowered = viewHeightHalf / (40.7436654315252 * (vy1 - vy0));
    const resolutionVertical = 360.0 / (zoomFactorPowered * 256);
    const resolution =
      Math.max(resolutionHorizontal, resolutionVertical) * padding;
    const zoom = Math.log(360 / (resolution * 256));

    return Math.floor(zoom);
  }

  function getBearing(
    startLat: any,
    startLong: any,
    endLat: any,
    endLong: any
  ) {
    const p1 = turf.point([startLong, startLat]);
    const p2 = turf.point([endLong, endLat]);
    const bearing = turf.bearing(p1, p2);
    return bearing;
  }

  function getInterPolatedValue(
    u1: any,
    l1: any,
    u2: any,
    l2: any,
    value: any
  ) {
    const lerp = (x: any, y: any, a: any) => x * (1 - a) + y * a;
    const clamp = (a: any, min = 0, max = 1) => Math.min(max, Math.max(min, a));
    const invlerp = (x: any, y: any, a: any) => clamp((a - x) / (y - x));
    const range = (x1: any, y1: any, x2: any, y2: any, a: any) =>
      lerp(x2, y2, invlerp(x1, y1, a));

    const final = range(u1, l1, u2, l2, value);
    return final;
  }
  //-------------fetch flight log from srt geojson--------------------------------
  useEffect(() => {
    if (!isLive) {
      fetchJSON((props.url as string).replace(/.\w+$/, ".geojson"))
        .then((d) => {
          const data = d as FlightPath;
          const lineString = data.features.pop(); // Remove linestring at the very end
          const flightTelemetry = data.features;

          const flightpath = {
            type: "FeatureCollection",
            crs: {
              type: "name",
              properties: {
                name: "urn:ogc:def:crs:OGC:1.3:CRS84",
              },
            },
            features: [lineString],
          };

          setFlightPathSrt(flightpath.features[0]); //-------need to filter out the z axis to access
          setFlightTeleSrt(flightTelemetry);

          const getBounds = turf.bbox(flightpath.features[0]);

          setMapZoom(computeZoomLevel(getBounds, 1));
          const reGetBounds = [
            [getBounds[0], getBounds[1]],
            [getBounds[2], getBounds[3]],
          ];

          setBounds(reGetBounds);
          setMapCenter(turf.centroid(lineString!.geometry));
        })
        .catch((err) => {
          console.log("could not fetch geojson", err);
        });
    }
  }, [props.url, isLive]);

  //----------------people count implementation----------
  useEffect(() => {
    if (played && !isLive && peopleData?.Values?.length > 0) {
      console.log("people data: ",peopleData.values);
      const currentFrame = Math.floor(played * peopleData.Values.length);
      console.log("people current frame: ",currentFrame);
      const frameData = peopleData.Values[currentFrame];
      console.log("people frame: ",frameData);
      
      if (frameData) {
        console.log(frameData);
        setBoundingBoxes(frameData.coordinates);
        setPeopleCount(frameData.people_count);
      }
    }
  }, [played, aiGraphData, peopleData]);

  const VIDEO_SIZES = {
    normal: { width: 712, height: 400 },
    large: { width: 1920, height: 808 },
  };

  useEffect(() => {
    const adjustBoundingBoxes = () => {
      if (playerRef.current && boundingBoxes) {
        const videoElement = playerRef.current.getInternalPlayer();
        const { offsetWidth: containerWidth, offsetHeight: containerHeight } =
          playerRef.current.wrapper;
  
        const mode =
          containerWidth === VIDEO_SIZES.large.width &&
          containerHeight === VIDEO_SIZES.large.height
            ? "large"
            : "normal";
  
        const videoWidth = VIDEO_SIZES[mode].width;
        const videoHeight = VIDEO_SIZES[mode].height;
  
        const scaleX = containerWidth / videoWidth;
        const scaleY = containerHeight / videoHeight;
  
        const heightAdjustmentFactor = 0.85;
        const newBoxes = boundingBoxes.map(([x1, y1, x2, y2]) => {
          const scaledX1 = x1 * scaleX;
          const scaledY1 = y1 * scaleY;
          const scaledX2 = x2 * scaleX;
          const scaledY2 = y2 * scaleY * heightAdjustmentFactor;
          return [
            Math.max(0, scaledX1),
            Math.max(0, scaledY1),
            Math.min(containerWidth, scaledX2),
            Math.min(containerHeight, scaledY2),
          ];
        });
  
        setScaledBoxes(newBoxes);
      }
    };
    adjustBoundingBoxes();
    document.addEventListener("fullscreenchange", adjustBoundingBoxes);
  
    return () => {
      document.removeEventListener("fullscreenchange", adjustBoundingBoxes);
    };
  }, [boundingBoxes]);
  
  //----------fetch telemetry------------------
  useEffect(() => {
    if (played && !isLive) {
      const x = Math.floor(played * flightTeleSrt.length);
      if (flightTeleSrt[x]?.properties.DISTANCE) {
        console.log("Distance: ", flightTeleSrt[x]?.properties.DISTANCE);
        console.log("H.SPEED: ", flightTeleSrt[x]?.properties.SPEED_TWOD);
        console.log("V.SPEED: ", flightTeleSrt[x]?.properties.SPEED_VERTICAL);
        console.log(
          "position: ",
          flightTeleSrt[x]?.geometry.coordinates[1],
          flightTeleSrt[x]?.geometry.coordinates[0]
        );
        console.log("Altitude: ", flightTeleSrt[x]?.geometry.coordinates[2]);
      }
      setDistance(flightTeleSrt[x]?.properties.DISTANCE);
      setH_speed(flightTeleSrt[x]?.properties.SPEED_TWOD);
      setIso(flightTeleSrt[x]?.properties.ISO);
      setEv(flightTeleSrt[x]?.properties.EV);
      setShutter(flightTeleSrt[x]?.properties.SHUTTER);
      setFStop(flightTeleSrt[x]?.properties.FNUM);
      setHSpeedDeg(
        getInterPolatedValue(
          0,
          100,
          -150,
          150,
          flightTeleSrt[x]?.properties.SPEED_TWOD
        )
      );
      setVSpeedDeg(
        getInterPolatedValue(
          0,
          100,
          -150,
          150,
          flightTeleSrt[x]
            ? flightTeleSrt[x].properties.SPEED_VERTICAL * 3.6
            : undefined
        )
      );
      setV_speed(
        flightTeleSrt[x]
          ? flightTeleSrt[x].properties.SPEED_VERTICAL * 3.6
          : undefined
      );
      setDPosition({
        lat: flightTeleSrt[x]?.geometry.coordinates[1],
        long: flightTeleSrt[x]?.geometry.coordinates[0],
      });
      setHeight(flightTeleSrt[x]?.geometry.coordinates[2]);
      const startPoint: any = [
        flightTeleSrt[x]?.geometry.coordinates[0],
        flightTeleSrt[x]?.geometry.coordinates[1],
      ];
      const endPoint: any = [
        flightTeleSrt[x + 1]?.geometry.coordinates[0],
        flightTeleSrt[x + 1]?.geometry.coordinates[1],
      ];

      if (
        startPoint[0] !== undefined &&
        endPoint[0] !== undefined &&
        startPoint[0] !== null &&
        endPoint[0] !== null &&
        startPoint[1] !== null &&
        endPoint[1] !== null
      ) {
        setCourse(
          getBearing(startPoint[1], startPoint[0], endPoint[1], endPoint[0])
        );
      }
    }
  }, [played, isLive]);

  const flightlogmap = (
    <FlightLogMap
      played={played}
      flight={flightPathSrt?.geometry?.coordinates}
      telemetry={flightTeleSrt}
      bounds={bounds}
      center={mapCenter}
      zoom={mapZoom}
    />
  );

  const settingsMenu = (
    <Menu
      triggerSubMenuAction="click"
      className="settings-menu"
      theme="dark"
      style={{ width: "190px" }}
      getPopupContainer={() => document.getElementById("area22") as HTMLElement}
    >
      {isLive ? (
        <SubMenu
          title={
            <>
              <span>Quality</span>
              <span style={{ float: "right" }}>{quality}</span>
            </>
          }
        >
          <Item
            onClick={() => {
              setActiveURL(resolutionURLs["auto"]);
              setQuality("Auto");
            }}
          >
            Auto
          </Item>
          <Item
            onClick={() => {
              setActiveURL(resolutionURLs["fullDefinition"]);
              setQuality("720p");
            }}
          >
            720p
          </Item>
          <Item
            onClick={() => {
              setActiveURL(resolutionURLs["highDefinition"]);
              setQuality("480p");
            }}
          >
            480p
          </Item>
        </SubMenu>
      ) : (
        <>
          <SubMenu
            title={
              <>
                <span>Playback Speed </span>
                <span style={{ float: "right" }}>{playbackSpeed}x</span>
              </>
            }
          >
            <Item onClick={() => setPlaybackSpeed(5)}>5x</Item>
            <Item onClick={() => setPlaybackSpeed(2)}>2x</Item>
            <Item onClick={() => setPlaybackSpeed(1.5)}>1.5x</Item>
            <Item onClick={() => setPlaybackSpeed(1)}>1x</Item>
          </SubMenu>
          <SubMenu
            title={
              <>
                <span>AI Graph </span>
                <span style={{ float: "right" }}>{aiTaskDisplay()}</span>
              </>
            }
          >
            <div
              style={{ display: "flex", alignItems: "center", width: "140px" }}
            >
              <Item
                className="bg-transparent"
                onClick={() => {
                  setInferType("violence");
                  if (aiTask === "violence") {
                    setAiTask("");
                  } else {
                    setAiTask("violence");
                  }
                }}
              >
                Violence
              </Item>
              {aiTask === "violence" && (
                <CheckOutlined style={{ color: "white" }} />
              )}
            </div>
            <div
              style={{ width: "140px", display: "flex", alignItems: "center" }}
            >
              <Item
                className="bg-transparent"
                onClick={() => {
                  if (aiTask === "non-violence") {
                    setAiTask("");
                  } else {
                    setAiTask("non-violence");
                  }
                }}
              >
                Non-Violence
              </Item>
              {aiTask === "non-violence" && (
                <CheckOutlined style={{ color: "white" }} />
              )}
            </div>
            <div
              style={{ width: "140px", display: "flex", alignItems: "center" }}
            >
              <Item
                className="bg-transparent"
                onClick={() => {
                  setInferType("people-count");
                  if (aiTask === "people-count") {
                    setAiTask("");
                  } else {
                    setAiTask("people-count");
                  }
                }}
              >
                People-Count
              </Item>
              {aiTask === "people-count" && (
                <CheckOutlined style={{ color: "white" }} />
              )}
            </div>
          </SubMenu>
        </>
      )}
      {props.showHUD ? (
        <SubMenu
          title={
            <>
              <span>HUD Controls</span>
              <Switch
                size="small"
                defaultChecked
                checked={showHUDcontrols}
                style={{ float: "right", marginTop: "3px" }}
                onChange={(value) => {
                  setShowHUDcontrols(value);
                  setShowAltitude(value);
                  setShowBatter(isLive ? value : false);
                  setShowCourse(value);
                  setShowDistance(value);
                  setShowHSpeed(value);
                  setShowMap(value);
                  setShowPosition(value);
                  setShowVSpeed(value);
                }}
              />
            </>
          }
        >
          {showHUDcontrols ? (
            <div style={{ width: "170px" }}>
              <Item className="bg-transparent">
                <span>Altitude</span>
                <Switch
                  size="small"
                  style={{ float: "right" }}
                  defaultChecked
                  onChange={(value) => setShowAltitude(value)}
                />
              </Item>
              <Item className="bg-transparent">
                <span>Map</span>
                <Switch
                  size="small"
                  style={{ float: "right" }}
                  defaultChecked
                  onChange={(value) => setShowMap(value)}
                />
              </Item>
              <Item className="bg-transparent">
                <span>Distance</span>
                <Switch
                  size="small"
                  style={{ float: "right" }}
                  defaultChecked
                  onChange={(value) => setShowDistance(value)}
                />
              </Item>
              <Item className="bg-transparent">
                <span>Vertical Speed</span>
                <Switch
                  size="small"
                  style={{ float: "right" }}
                  defaultChecked
                  onChange={(value) => setShowVSpeed(value)}
                />
              </Item>
              <Item className="bg-transparent">
                <span>Horizontal Speed</span>
                <Switch
                  size="small"
                  style={{ float: "right" }}
                  defaultChecked
                  onChange={(value) => setShowHSpeed(value)}
                />
              </Item>
              <Item className="bg-transparent">
                <span>Course</span>
                <Switch
                  size="small"
                  style={{ float: "right" }}
                  defaultChecked
                  onChange={(value) => setShowCourse(value)}
                />
              </Item>
              <Item className="bg-transparent">
                <span>Battery</span>
                <Switch
                  size="small"
                  style={{ float: "right" }}
                  defaultChecked
                  onChange={(value) => setShowBatter(value)}
                />
              </Item>
              <Item className="bg-transparent">
                <span>Position</span>
                <Switch
                  size="small"
                  style={{ float: "right" }}
                  defaultChecked
                  onChange={(value) => setShowPosition(value)}
                />
              </Item>
            </div>
          ) : null}
        </SubMenu>
      ) : (
        <></>
      )}
    </Menu>
  );
  const menu = [
    {
      key: "1",
      label: "Help",
      icon: <InfoCircleOutlined />,
    },
  ];

  const handleCancel = () => {
    setIsModalVisible(false);
    setPlaying(playingBeforeCapture);
    cancelAlert();
  };

  return (
    <div
      ref={playerContainerRef}
      className="player-wrapper"
      onMouseMove={handleMouseMove}
    >
      {isAlertEnabled ? (
        <Modal
          open={isModalVisible}
          title="Snapshot Captured!"
          onOk={() => {}}
          width={1200}
          centered={true}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel} type="default">
              Cancel
            </Button>,
            <Button
              key="01"
              onClick={saveAlert}
              type="primary"
              loading={loader}
            >
              Save alert
            </Button>,
          ]}
        >
          <div>
            <Row>
              <Col span={17}>
                <div id="image" className="outcome-view">
                  <Image
                    style={{ width: "100%", height: "auto", cursor: "pointer" }}
                    src={alertImage}
                  />
                  <div className="preview-location-name">
                    <Row>
                      <Title className="p-name" level={4}>
                        {captAddress}
                      </Title>
                    </Row>
                    {captLat !== undefined && captLong !== undefined ? (
                      <Row>
                        <Text className="p-coord">
                          {`${captLat.toFixed(6)}, ${captLong.toFixed(6)}`}
                        </Text>
                      </Row>
                    ) : (
                      <></>
                    )}
                  </div>
                  {captLat !== undefined && captLong !== undefined ? (
                    <div className="static-map-div">
                      <a
                        href={`https://www.google.com/maps/?q=${captLat},${captLong}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          className="static-map"
                          src={`https://maps.googleapis.com/maps/api/staticmap?center=${captLat},${captLong}&zoom=16&size=200x130&markers=size:mid|color:red|${captLat},${captLong}&maptype=roadmap&key=AIzaSyCYWROYTFQ3XH4bhhLJnmJSV-0k9a-PHY8`}
                        />
                      </a>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </Col>
              <Col span={7}>
                <Row style={{ marginLeft: "8px" }}>
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
                            a.download = `snapshot_3355.png`;
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
                </Row>
                <div className="outcome-specific-view-info">
                  {captLat !== undefined && captLong !== undefined ? (
                    <>
                      <Row style={{ marginTop: 8 }}>
                        <Text type="secondary">Coordinates</Text>
                      </Row>
                      <Row>
                        <Text keyboard copyable>
                          {`${captLat.toFixed(6)}, ${captLong.toFixed(6)}`}
                        </Text>
                      </Row>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </Modal>
      ) : null}
      <ReactPlayer
        ref={playerRef}
        url={isLive ? activeURL : url}
        muted={muted}
        playing={playing}
        pip={pip}
        volume={volume}
        onEnablePIP={handleEnablePip}
        playbackRate={playbackSpeed}
        onEnded={handlePlayPause}
        onProgress={handleProgress}
        onReady={() => {
          window.setTimeout(function () {
            setVideoLoader(false);
          }, 500);
        }}
        onBuffer={() => {
          setVideoLoader(true);
        }}
        onBufferEnd={() => {
          window.setTimeout(function () {
            setVideoLoader(false);
          }, 500);
        }}
        width="100%"
        height="100%"
        config={{
          file: {
            attributes: {
              crossOrigin: "anonymous",
            },
          },
        }}
      />
      {peopleCount !== undefined && scaledBoxes.length > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              color: "white",
              background: "rgba(0, 0, 0, 0.5)",
              padding: "5px",
              zIndex: 10,
            }}
          >
            People Count: {peopleCount}
          </div>

          {scaledBoxes.map((box, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${box[0]}px`,
                top: `${box[1]}px`,
                width: `${box[2] - box[0]}px`,
                height: `${box[3] - box[1]}px`,
                border: "2px solid red",
                boxSizing: "border-box",
                zIndex: 9,
              }}
            />
          ))}
        </>
      )}

      {/* ---------MAP NAV UI----------------------------------------------------------------- */}
      <>
        {props.showHUD && showHUDcontrols ? (
          <>
            <div className="hud-top">
              <>
                {showAltitude ? (
                  <>
                    <div id="Altitude" className="Altitude">
                      <svg className="Rectangle_1918">
                        <rect
                          id="Rectangle_1918"
                          rx="0"
                          ry="0"
                          x="0"
                          y="0"
                          width="84"
                          height="28"
                        ></rect>
                      </svg>
                      <div id="n_85_M">
                        <span>{height ? height.toFixed(1) : "--"} M</span>
                      </div>
                      <svg
                        className="Path_11042"
                        viewBox="-13509.326 -16542.059 16.757 12.355"
                      >
                        <path
                          id="Path_11042"
                          d="M -13509.326171875 -16529.703125 L -13503.5830078125 -16542.05859375 L -13500.037109375 -16536.111328125 L -13498.1279296875 -16539.94921875 L -13492.5693359375 -16529.703125 L -13509.326171875 -16529.703125 Z"
                        ></path>
                      </svg>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
            </div>
            <div className="batter-div">
              <>
                {showBatter && isLive ? (
                  <>
                    <div id="battery" className="battery">
                      <svg className="Rectangle_1916_dn">
                        <rect
                          id="Rectangle_1916_dn"
                          rx="0"
                          ry="0"
                          x="0"
                          y="0"
                          width="84"
                          height="28"
                        ></rect>
                      </svg>
                      <div id="battery-level" className="battery_level">
                        <svg className="Rectangle_1923_dq">
                          <linearGradient
                            id="Rectangle_1923_dq"
                            spreadMethod="pad"
                            x1="0.5"
                            x2="0.5"
                            y1="0"
                            y2="1"
                          >
                            <stop
                              offset="0"
                              stop-color="#3b86ff"
                              stop-opacity="1"
                            ></stop>
                            <stop
                              offset="1"
                              stop-color="#00d4ff"
                              stop-opacity="1"
                            ></stop>
                          </linearGradient>
                          <rect
                            id="Rectangle_1923_dq"
                            rx="0"
                            ry="0"
                            x="0"
                            y="0"
                            width="40"
                            height="28"
                            style={{
                              width: `${batterLevel}px`,
                            }}
                          ></rect>
                        </svg>
                      </div>
                      <div id="n_9">
                        <span>{batter}%</span>
                      </div>
                      <div id="battery_full_black_24dp">
                        <svg className="Path_11046" viewBox="0 0 19.614 19.614">
                          <path
                            id="Path_11046"
                            d="M 0 0 L 19.6142578125 0 L 19.6142578125 19.6142578125 L 0 19.6142578125 L 0 0 Z"
                          ></path>
                        </svg>
                        <svg className="Path_11047" viewBox="7 2 8.173 16.345">
                          <path
                            id="Path_11047"
                            d="M 14.08565044403076 3.634521484375 L 12.7208251953125 3.634521484375 L 12.7208251953125 2 L 9.4517822265625 2 L 9.4517822265625 3.634521484375 L 8.086956024169922 3.634521484375 C 7.4903564453125 3.634521484375 7 4.1248779296875 7 4.72147798538208 L 7 17.25008583068848 C 7 17.8548583984375 7.4903564453125 18.34521484375 8.086956024169922 18.34521484375 L 14.07747745513916 18.34521484375 C 14.6822509765625 18.34521484375 15.172607421875 17.8548583984375 15.172607421875 17.25825881958008 L 15.172607421875 4.72147798538208 C 15.172607421875 4.1248779296875 14.6822509765625 3.634521484375 14.08565044403076 3.634521484375 Z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
            </div>
            <div
              className="hud-bottom"
              style={{ bottom: `${bottomHudHeight}px` }}
            >
              <>
                {showCourse ? (
                  <>
                    <div id="Course" className="Course">
                      <svg className="Rectangle_1916_d">
                        <rect
                          id="Rectangle_1916_d"
                          rx="0"
                          ry="0"
                          x="0"
                          y="0"
                          width="116"
                          height="40"
                        ></rect>
                      </svg>
                      <div id="n_90_DEG">
                        <span>{course ? course.toFixed(1) : "--"} DEG</span>
                      </div>
                      <div id="COURSE">
                        <span>COURSE</span>
                      </div>
                      <div id="Compass" className="Compass">
                        <div id="Comp_gauge" className="Comp_gauge">
                          <svg className="Ellipse_492">
                            <ellipse
                              id="Ellipse_492"
                              rx="16"
                              ry="16"
                              cx="16"
                              cy="16"
                            ></ellipse>
                          </svg>
                        </div>
                        <div
                          id="comp_needle"
                          className="comp_needle"
                          style={{
                            transform: `rotate(${course}deg)`,
                          }}
                        >
                          <svg
                            className="Path_11057"
                            viewBox="4.853 3.638 14.304 16.993"
                          >
                            <path
                              id="Path_11057"
                              d="M 12.93000030517578 4.260000228881836 L 19.07999992370605 19.25 C 19.42000007629395 20.07999992370605 18.56999969482422 20.90999984741211 17.75 20.54000091552734 L 12.40999984741211 18.18000030517578 C 12.14999961853027 18.06999969482422 11.85999965667725 18.06999969482422 11.59999942779541 18.18000030517578 L 6.25999927520752 20.54000091552734 C 5.439999103546143 20.90000152587891 4.589999198913574 20.08000183105469 4.929999351501465 19.25 L 11.07999992370605 4.260000228881836 C 11.40999984741211 3.430000305175781 12.59000015258789 3.430000305175781 12.93000030517578 4.260000228881836 Z"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>

              <>
                {showVSpeed ? (
                  <>
                    <div id="v_speed" className="v_speed">
                      <svg className="Rectangle_1916">
                        <rect
                          id="Rectangle_1916"
                          rx="0"
                          ry="0"
                          x="0"
                          y="0"
                          width="116"
                          height="40"
                        ></rect>
                      </svg>
                      <div id="n_1_KMH">
                        <span>
                          {isLive
                            ? velocity
                              ? velocity.toFixed()
                              : "--"
                            : v_speed
                            ? v_speed.toFixed()
                            : "--"}{" "}
                          KM/H
                        </span>
                      </div>
                      <div id="V_SPEED_cz">
                        <span>{isLive ? "VELOCITY" : "V. SPEED"}</span>
                      </div>
                      <div id="v_speed_gauge" className="v_speed_gauge">
                        <div id="V_gauge" className="V_gauge">
                          <svg
                            className="Path_11053"
                            viewBox="2 3 31.796 29.649"
                          >
                            <path
                              id="Path_11053"
                              d="M 17.89781188964844 3.000000715255737 C 9.122220039367676 3.000000715255737 2 10.12221813201904 2 18.8978099822998 C 2 24.78000068664551 5.195460796356201 29.89909362792969 9.93300724029541 32.6494140625 L 11.52278900146484 29.89909362792969 C 7.739109992980957 27.68930053710938 5.179562568664551 23.60356140136719 5.179562568664551 18.8978099822998 C 5.179562568664551 11.8709774017334 10.87097835540771 6.179562091827393 17.89781188964844 6.179562091827393 C 24.92464256286621 6.179562091827393 30.61605644226074 11.8709774017334 30.61605644226074 18.8978099822998 C 30.61605644226074 23.60356140136719 28.05650901794434 27.68930053710938 24.25693321228027 29.89909362792969 L 25.84671592712402 32.6494140625 C 30.60015869140625 29.89909362792969 33.79561996459961 24.78000068664551 33.79561996459961 18.8978099822998 C 33.79561996459961 10.12221813201904 26.67340278625488 3.000000715255737 17.89781188964844 3.000000715255737 Z"
                            ></path>
                          </svg>
                        </div>
                        <div
                          id="V_needle"
                          className="V_needle"
                          style={{
                            transform: `rotate(${
                              vSpeedDeg ? vSpeedDeg : -150
                            }deg)`,
                          }}
                        >
                          <svg
                            className="Union_19"
                            viewBox="13524.001 16587 5.999 13.824"
                          >
                            <path
                              id="Union_19"
                              d="M 13524.0009765625 16597.82421875 C 13524.0009765625 16596.85546875 13524.4599609375 16595.994140625 13525.171875 16595.4453125 L 13527.2216796875 16587 L 13529.056640625 16595.640625 C 13529.6376953125 16596.1875 13530 16596.962890625 13530 16597.82421875 C 13530 16599.478515625 13528.6591796875 16600.82421875 13527.0009765625 16600.82421875 C 13525.3427734375 16600.82421875 13524.0009765625 16599.478515625 13524.0009765625 16597.82421875 Z"
                            ></path>
                          </svg>
                          <svg
                            className="Union_20"
                            viewBox="13524.001 16587 5.999 13.824"
                          >
                            <path
                              id="Union_20"
                              d="M 13524.0009765625 16597.82421875 C 13524.0009765625 16596.85546875 13524.4599609375 16595.994140625 13525.171875 16595.4453125 L 13527.2216796875 16587 L 13529.056640625 16595.640625 C 13529.6376953125 16596.1875 13530 16596.962890625 13530 16597.82421875 C 13530 16599.478515625 13528.6591796875 16600.82421875 13527.0009765625 16600.82421875 C 13525.3427734375 16600.82421875 13524.0009765625 16599.478515625 13524.0009765625 16597.82421875 Z"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
              <>
                {showHSpeed && !isLive ? (
                  <>
                    <div id="h_speed" className="h_speed">
                      <svg className="Rectangle_1916">
                        <rect
                          id="Rectangle_1916"
                          rx="0"
                          ry="0"
                          x="0"
                          y="0"
                          width="116"
                          height="40"
                        ></rect>
                      </svg>
                      <div id="n_1_KMH">
                        <span>{h_speed ? h_speed.toFixed() : "--"} KM/H</span>
                      </div>
                      <div id="V_SPEED_cz">
                        <span>H. SPEED</span>
                      </div>
                      <div id="v_speed_gauge" className="v_speed_gauge">
                        <div id="V_gauge" className="V_gauge">
                          <svg
                            className="Path_11053"
                            viewBox="2 3 31.796 29.649"
                          >
                            <path
                              id="Path_11053"
                              d="M 17.89781188964844 3.000000715255737 C 9.122220039367676 3.000000715255737 2 10.12221813201904 2 18.8978099822998 C 2 24.78000068664551 5.195460796356201 29.89909362792969 9.93300724029541 32.6494140625 L 11.52278900146484 29.89909362792969 C 7.739109992980957 27.68930053710938 5.179562568664551 23.60356140136719 5.179562568664551 18.8978099822998 C 5.179562568664551 11.8709774017334 10.87097835540771 6.179562091827393 17.89781188964844 6.179562091827393 C 24.92464256286621 6.179562091827393 30.61605644226074 11.8709774017334 30.61605644226074 18.8978099822998 C 30.61605644226074 23.60356140136719 28.05650901794434 27.68930053710938 24.25693321228027 29.89909362792969 L 25.84671592712402 32.6494140625 C 30.60015869140625 29.89909362792969 33.79561996459961 24.78000068664551 33.79561996459961 18.8978099822998 C 33.79561996459961 10.12221813201904 26.67340278625488 3.000000715255737 17.89781188964844 3.000000715255737 Z"
                            ></path>
                          </svg>
                        </div>
                        <div
                          id="H_needle"
                          className="H_needle"
                          style={{
                            transform: `rotate(${
                              hSpeedDeg ? hSpeedDeg : -150
                            }deg)`,
                          }}
                        >
                          <svg
                            className="Union_19"
                            viewBox="13524.001 16587 5.999 13.824"
                          >
                            <path
                              id="Union_19"
                              d="M 13524.0009765625 16597.82421875 C 13524.0009765625 16596.85546875 13524.4599609375 16595.994140625 13525.171875 16595.4453125 L 13527.2216796875 16587 L 13529.056640625 16595.640625 C 13529.6376953125 16596.1875 13530 16596.962890625 13530 16597.82421875 C 13530 16599.478515625 13528.6591796875 16600.82421875 13527.0009765625 16600.82421875 C 13525.3427734375 16600.82421875 13524.0009765625 16599.478515625 13524.0009765625 16597.82421875 Z"
                            ></path>
                          </svg>
                          <svg
                            className="Union_20"
                            viewBox="13524.001 16587 5.999 13.824"
                          >
                            <path
                              id="Union_20"
                              d="M 13524.0009765625 16597.82421875 C 13524.0009765625 16596.85546875 13524.4599609375 16595.994140625 13525.171875 16595.4453125 L 13527.2216796875 16587 L 13529.056640625 16595.640625 C 13529.6376953125 16596.1875 13530 16596.962890625 13530 16597.82421875 C 13530 16599.478515625 13528.6591796875 16600.82421875 13527.0009765625 16600.82421875 C 13525.3427734375 16600.82421875 13524.0009765625 16599.478515625 13524.0009765625 16597.82421875 Z"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
              <>
                {showDistance && !isLive ? (
                  <>
                    <div id="Distance" className="Distance">
                      <svg className="Rectangle_1916_c">
                        <rect
                          id="Rectangle_1916_c"
                          rx="0"
                          ry="0"
                          x="0"
                          y="0"
                          width="107"
                          height="40"
                        ></rect>
                      </svg>
                      <div id="n_5_KM">
                        <span>{distance ? distance.toFixed(1) : "--"} M</span>
                      </div>
                      <div id="DISTANCE_COVERED">
                        <span>DISTANCE COVERED</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
            </div>
          </>
        ) : (
          <></>
        )}
      </>

      {pip && !isLive ? (
        <div
          className="video-div"
          style={{
            height: "100%",
            width: "100%",
            margin: "auto",
            backgroundColor: "black",
            zIndex: 105,
          }}
        >
          {flightlogmap}
        </div>
      ) : (
        <></>
      )}

      <Dropdown
        menu={{ items: menu, onClick: () => setShowHotkeys(true) }}
        trigger={["contextMenu"]}
        getPopupContainer={() =>
          document.getElementById("area22") as HTMLElement
        }
      >
        <div
          ref={playerControlsRef}
          className="controls-wrapper"
          tabIndex={1}
          onKeyPress={(e) => {
            if (e.key === " ") handlePlayPause();
            if (e.key === "m") setMuted(!muted);
            if (e.key === "s") handleSnapShot();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") fastforward();
            if (e.key === "ArrowLeft") fastbackward();
          }}
          onDoubleClick={() => {
            toggleFullScreen();
          }}
          onClick={() => setShowHotkeys(false)}
        >
          {videoLoader ? (
            <div className="video-loader">
              <Spin indicator={antIcon} />
            </div>
          ) : (
            <></>
          )}

          {showHotkeys && (
            <div className="hot-keys">
              <Row className="hot-keys-table">
                <Text strong>Keyboard ShortCuts</Text>
                <Button
                  type="text"
                  size="small"
                  style={{ marginLeft: "30px" }}
                  icon={<CloseCircleOutlined style={{ color: "#ffffffd9" }} />}
                  onClick={() => setShowHotkeys(false)}
                />
              </Row>
              <Row className="hot-keys-table">
                <Text>Mute/Unmute</Text>
                <Text keyboard>M</Text>
              </Row>
              <Row className="hot-keys-table">
                <Text>Pause/Play</Text>
                <Text keyboard>SpaceBar</Text>
              </Row>
              <Row className="hot-keys-table">
                <Text>Snapshot</Text>
                <Text keyboard>S</Text>
              </Row>
              <Row className="hot-keys-table">
                <Text>Forward/Backward</Text>
                <Text keyboard>Arrow Keys</Text>
              </Row>
              <Row
                className="hot-keys-table"
                style={{
                  marginTop: "12px",
                }}
              >
                <Text strong>Stats from drone</Text>
              </Row>
              <Row className="hot-keys-table">
                <Text>ISO</Text>
                <Text>{ISO ? ISO : "--"}</Text>
              </Row>
              <Row className="hot-keys-table">
                <Text>Exposure</Text>
                <Text>{EV ? EV : "--"}</Text>
              </Row>
              <Row className="hot-keys-table">
                <Text>Shutter speed</Text>
                <Text>{shutter ? shutter : "--"}</Text>
              </Row>
              <Row className="hot-keys-table">
                <Text>Fstop</Text>
                <Text>{fStop ? fStop : "--"}</Text>
              </Row>
            </div>
          )}

          <Row style={{ padding: "16px" }}>
            <Col span={24}>
              <Title level={3} style={{ color: "#fff" }}>
                {" "}
              </Title>
            </Col>
          </Row>

          <Row
            justify="center"
            style={!props.threadThumb ? { marginTop: "100px" } : {}}
          >
            <Col span={4}>
              {playing ? (
                <FontAwesomeIcon
                  onClick={handlePlayPause}
                  icon={faPause}
                  className="control-icons"
                />
              ) : (
                <FontAwesomeIcon
                  onClick={handlePlayPause}
                  icon={faPlay}
                  className="control-icons"
                />
              )}
            </Col>
          </Row>
          <Row justify="space-between" style={{ padding: "16px" }}>
            {(isFullScreen || theater) && !isAlertEnabled && streamKey ? (
              <Col span={5} offset={19}>
                <div className="custom-div" onDoubleClick={handlepip}>
                  <DroneMap streamKey={streamKey} geoFence={props.geoFence} />
                </div>
              </Col>
            ) : null}
            <Col span={24}>
              {isLive ? (
                <div className="live-slider"></div>
              ) : (
                <>
                  {!props.threadThumb && (
                    <div style={{ height: "100px", width: "100%" }}>
                      {aiGraphGenerated && (
                        <Line options={options} data={aiGraphData} />
                      )}
                    </div>
                  )}

                  <Slider
                    className="video-slider"
                    min={0}
                    max={100}
                    value={played * 100}
                    marks={bookmark}
                    onChange={handleSeekChange}
                    onAfterChange={handleSeekMouseUp}
                    tooltip={{ formatter: handleToolbarSeek }}
                    style={
                      !props.threadThumb
                        ? {
                            bottom: "5px",
                            padding: "0px",
                            margin: "0px 6px 10px",
                          }
                        : {}
                    }
                  />
                </>
              )}
            </Col>

            <Col span={24}>
              {!props.threadThumb && !props.seek && (
                <Row justify="space-between">
                  <Col span={17}>
                    <Row>
                      <span
                        onClick={fastbackward}
                        className="material-icons video-control-icons"
                        style={{
                          fontSize: "24px",
                          display: isLive ? "none" : "inline",
                        }}
                      >
                        replay_10
                      </span>

                      {playing ? (
                        <Tooltip title="Pause">
                          <FontAwesomeIcon
                            onClick={handlePlayPause}
                            icon={faPause}
                            className="video-control-icons"
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Play">
                          <FontAwesomeIcon
                            onClick={handlePlayPause}
                            icon={faPlay}
                            className="video-control-icons"
                          />
                        </Tooltip>
                      )}
                      <span
                        onClick={fastforward}
                        className="material-icons video-control-icons"
                        style={{
                          fontSize: "24px",
                          display: isLive ? "none" : "inline",
                        }}
                      >
                        forward_10
                      </span>
                      {!isLive ? (
                        <>
                          <Tooltip title="Add Bookmark">
                            <BsBookmarkPlusFill
                              onClick={addBookmark}
                              className="video-control-icons"
                            />
                          </Tooltip>
                          <Tooltip title="Remove Bookmark">
                            <BsBookmarkDashFill
                              onClick={removeBookmark}
                              className="video-control-icons"
                            />
                          </Tooltip>
                          <Tooltip title="Flag">
                            <BsFlagFill
                              onClick={() => {
                                toggleFlag(props.mission);
                              }}
                              color={`${isFlagged ? "red" : "white"}`}
                              className="video-control-icons"
                            />
                          </Tooltip>
                        </>
                      ) : (
                        ""
                      )}
                      {!isLive && (
                        <div
                          style={{
                            marginRight: "10px",
                            marginLeft: "10px",
                            color: "rgba(255, 255, 255, 0.897)",
                          }}
                        >
                          {elapsedTime} / {format(duration)}
                        </div>
                      )}
                      {muted ? (
                        <Tooltip title="Unmute">
                          <FontAwesomeIcon
                            onClick={handleMute}
                            icon={faVolumeMute}
                            className="bottom-icons"
                            style={{
                              marginRight: "10px",
                              marginLeft: "10px",
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexFlow: "row",
                            marginRight: "10px",
                            marginLeft: "10px",
                            marginTop: "-8px",
                          }}
                          onMouseOver={() => setVolumeBar(true)}
                          onMouseLeave={() => setVolumeBar(false)}
                        >
                          <Tooltip title="Mute">
                            <FontAwesomeIcon
                              onClick={handleMute}
                              icon={faVolumeUp}
                              className="bottom-icons"
                            />
                          </Tooltip>

                          <Slider
                            defaultValue={50}
                            min={0}
                            max={100}
                            onChange={(value) => setVolume(value / 100)}
                            style={{
                              width: "80px",
                              visibility: volumeBar ? "visible" : "hidden",
                            }}
                          />
                        </div>
                      )}
                    </Row>
                  </Col>
                  <Col span={2}>
                    {!isLive ? (
                      <></>
                    ) : (
                      <Row>
                        <Col span={12}>
                          <Tag color="#cd201f" style={{ marginLeft: "-5px" }}>
                            LIVE
                          </Tag>
                        </Col>
                      </Row>
                    )}
                  </Col>
                  <Col span={5}>
                    <Row>
                      <Col flex={1}>
                        <div
                          style={{
                            padding: 1,
                            height: "10px",
                            background: "transparent",
                            position: "absolute",
                            marginRight: "4px",
                          }}
                          id="area22"
                        >
                          <Dropdown
                            overlay={settingsMenu}
                            trigger={["click"]}
                            overlayStyle={{
                              position: "relative",
                              zIndex: 110,
                            }}
                            getPopupContainer={() =>
                              document.getElementById("area22") as HTMLElement
                            }
                          >
                            <FontAwesomeIcon
                              icon={faCog}
                              className="bottom-icons"
                            />
                          </Dropdown>
                        </div>
                      </Col>

                      <Col flex={1} style={{ marginLeft: "10px" }}>
                        <Tooltip title="Take Snapshot(s)">
                          <FontAwesomeIcon
                            onClick={() => {
                              handleSnapShot();
                              console.log(dPosition.lat, dPosition.long);
                              if (
                                dPosition.lat !== undefined &&
                                dPosition.long !== undefined
                              ) {
                                if (
                                  dPosition.lat !== null &&
                                  dPosition.long !== null
                                ) {
                                  setCaptLat(dPosition.lat);
                                  setCaptLong(dPosition.long);
                                  const address: any = geocoder([
                                    dPosition.long,
                                    dPosition.lat,
                                  ]).then((res: any) => setCaptAddress(res));
                                  setIsModalVisible(true);
                                } else {
                                  console.log(props.mission);
                                  setCaptLat(dPosition.lat);
                                  setCaptLong(dPosition.long);
                                  setCaptAddress(
                                    props.mission.flightID.geoLocation
                                  );
                                  setIsModalVisible(true);
                                }
                              } else {
                                console.log(props.mission);
                                setCaptLat(dPosition.lat);
                                setCaptLong(dPosition.long);
                                setCaptAddress(
                                  // The same VideoPlayer component is used to play videos in three different files
                                  // LiveViewBase, Mission/DataViews/Videos and LocationCard/Videos
                                  // But the structure of data sent in props is different for different components
                                  props.mission?.flight?.geoLocation
                                    ? props.mission.flight.geoLocation // for LiveViewBase component
                                    : props.flightID?.geoLocation
                                    ? props.flightID.geoLocation // for Mission/DataViews/Videos component
                                    : "" // not matched with any structure, keep blank
                                  // NOTE: LocationCard/Videos is currently not sending any geoLocation address anywhere in props
                                );
                                setIsModalVisible(true);
                              }
                            }}
                            icon={faCamera}
                            className="bottom-icons"
                          />
                        </Tooltip>
                      </Col>
                      {isLive || props.showHUD ? (
                        <Col flex={1}>
                          <Tooltip title="Switch Viewing Mode">
                            <SwapOutlined
                              onClick={handlepip}
                              className="bottom-icons"
                            />
                          </Tooltip>
                        </Col>
                      ) : (
                        <></>
                      )}
                      {theatreModeStatus == "none" ? (
                        <></>
                      ) : (
                        <Col flex={1}>
                          <FontAwesomeIcon
                            onClick={() => {
                              if (isFullScreen) {
                                toggleFullScreen();
                                if (!theater) {
                                  handleTheater();
                                }
                              } else {
                                handleTheater();
                              }
                            }}
                            icon={faTv}
                            className="bottom-icons"
                          />
                        </Col>
                      )}

                      <Col flex={1}>
                        <Tooltip title="Toggle FullScreen">
                          <FontAwesomeIcon
                            onClick={toggleFullScreen}
                            icon={faExpand}
                            className="bottom-icons"
                          />
                        </Tooltip>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )}
            </Col>
          </Row>

          {/* Map section is being rendered here, so that if does not overlap with settings menu */}
          {props.showHUD ? (
            <div
              className="map-section"
              style={{ bottom: `${bottomHudHeight + 20}px` }}
            >
              <>
                {showPosition ? (
                  <>
                    <div id="position" className="position">
                      <svg className="Rectangle_1920">
                        <rect
                          id="Rectangle_1920"
                          rx="0"
                          ry="0"
                          x="0"
                          y="0"
                          width="150"
                          height="20"
                        ></rect>
                      </svg>
                      <div id="N_22342342____E_8832342">
                        <span>
                          N {dPosition.lat ? dPosition.lat.toFixed(6) : "--"} E{" "}
                          {dPosition.long ? dPosition.long.toFixed(6) : "--"}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
            </div>
          ) : (
            <></>
          )}
          {!pip &&
          !isLive &&
          !isFullScreen &&
          props.showHUD &&
          showMap &&
          showHUDcontrols ? (
            <div className="map-box" style={{ bottom: `${bottomMapHeight}px` }}>
              <div id="swap" className="swap" onClick={handlepip}>
                <div className="Rectangle_1924">
                  <div id="swap_horiz_black_24dp">
                    <svg className="Path_11048" viewBox="0 0 24 24">
                      <path
                        id="Path_11048"
                        d="M 0 0 L 24 0 L 24 24 L 0 24 L 0 0 Z"
                      ></path>
                    </svg>
                    <svg className="Path_11049" viewBox="3 5 18 14">
                      <path
                        id="Path_11049"
                        d="M 6.989999771118164 11 L 3 15 L 6.989999771118164 19 L 6.989999771118164 16 L 14 16 L 14 14 L 6.989999771118164 14 L 6.989999771118164 11 Z M 21 9 L 17.01000022888184 5 L 17.01000022888184 8 L 10 8 L 10 10 L 17.01000022888184 10 L 17.01000022888184 13 L 21 9 Z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
              {flightlogmap}
            </div>
          ) : (
            <></>
          )}

          {isFullScreen && !isLive && props.showHUD && showMap && (
            <>
              {!pip ? (
                <div
                  className="map-box"
                  style={{ bottom: `${bottomMapHeight}px` }}
                >
                  <div id="swap" className="swap" onClick={handlepip}>
                    <div className="Rectangle_1924">
                      <div id="swap_horiz_black_24dp">
                        <svg className="Path_11048" viewBox="0 0 24 24">
                          <path
                            id="Path_11048"
                            d="M 0 0 L 24 0 L 24 24 L 0 24 L 0 0 Z"
                          ></path>
                        </svg>
                        <svg className="Path_11049" viewBox="3 5 18 14">
                          <path
                            id="Path_11049"
                            d="M 6.989999771118164 11 L 3 15 L 6.989999771118164 19 L 6.989999771118164 16 L 14 16 L 14 14 L 6.989999771118164 14 L 6.989999771118164 11 Z M 21 9 L 17.01000022888184 5 L 17.01000022888184 8 L 10 8 L 10 10 L 17.01000022888184 10 L 17.01000022888184 13 L 21 9 Z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {flightlogmap}
                </div>
              ) : (
                <></>
              )}
            </>
          )}
        </div>
      </Dropdown>
      {status === "Complete" && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          Violence Inference: Complete
        </p>
      )}
      {loading && (
        <>
          <Text>Inference Progress:</Text>
          <Progress percent={inferenceProgress} />
        </>
      )}

      <canvas ref={canvasRef} />
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
    </div>
  );
}

export default VideoPlayer;
