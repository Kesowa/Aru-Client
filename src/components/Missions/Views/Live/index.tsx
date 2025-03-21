import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Tabs, Row, Col, message, Typography } from "antd";
import type { TabsProps } from "antd";
import "./index.less";
import io from "src/services/socketConnect";
import About from "./tabContents/about";
import Outcomes from "./tabContents/outcomes";
import VideoPlayer from "../../../shared/VideoPlayer";
import DroneMap from "../../../shared/DroneMap";
import http from "../../../../services/httpCall";
import apis from "../../../../services/apis";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import NoMap from "../../../../static/no-map.svg";
import streamEnd from "../../../../static/streamended.svg";
import Weather from "../../../shared/Weather";
import { LIVE_URL, API_URL } from "src/constants";
import { AuthContext } from "src/services/authUtils";
import { LoaderContext } from "src/components/shared/Loader";

function LiveViewBase() {
  const { id } = useParams<any>();
  const [missionDetails, setMissionDetails] = useState<any>();
  const [missionId, setMissionId] = useState(0);
  const history = useHistory();
  const [theater, setTheater] = useState(false);
  const [pip, setPip] = useState(false);
  const [streamKey, setStreamKey] = useState("");
  const [streamURL, setstreamURL] = useState("");
  const [isoDate, setisoDate] = useState("");
  const [geoFence, setGeoFence] = useState<any>({});
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  const { Title } = Typography;

  const { Auth, logout } = useContext(AuthContext);
  const userDetails = Auth.userdetails;
  const tenantId = Auth.userdetails.tenantId._id || Auth.userdetails.tenantId;

  const { setLoading } = useContext(LoaderContext);

  //socket connectino variable
  const socket: any = useRef();
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "About",
      children: <About mission={missionDetails} />,
    },
    {
      key: "2",
      label: "Outcomes",
      children: <Outcomes missionId={missionId} tenantId={tenantId._id} />,
    },
  ];
  const fetchStreams = async () => {
    try {
      const result = await http.get(`${apis.FETCH_ALL_STREAM_KEYS}`, {
        params: {
          tenantID: tenantId._id,
        },
      });
      const resultFeeds = result.data;
      const feed = resultFeeds.filter((stream) => {
        return (
          stream.flightID.toString() === missionDetails.flight._id.toString()
        );
      });
      setStreamKey(feed[0].streamKey);
    } catch (err) {
      console.log(
        "Could not fetch streams or there is no streamkey in database!"
      );
      AxiosErrorHandler(err, logout);
    }
  };

  //---------------------------Setting Stream URL-------------------------
  useEffect(() => {
    if (streamKey) {
      setstreamURL(`${LIVE_URL}/live/${streamKey}.m3u8`);
    }
  }, [streamKey]);

  useEffect(() => {
    if (missionDetails) {
      fetchStreams();
    }
  }, [missionDetails, streamKey]);

  const getMission = async (id) => {
    setLoading(true);

    try {
      const result = await http.get(`${apis.GET_MISSION_BY_ID}${id}`);
      const cr = result.data.data;
      setMissionDetails(cr);
      setGeoFence({
        geoFence: cr.flight.geoFence,
      });
      setMissionId(cr._id);
    } catch (err) {
      message.error("Something went wrong");
      AxiosErrorHandler(err, logout);
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMission(id);
  }, []);

  useEffect(() => {
    if (missionDetails) {
      setisoDate(
        missionDetails.flight.date +
          "T" +
          missionDetails.flight.time.split(" ")[0] +
          "Z"
      );
    }
  }, [missionDetails]);

  const handleTheater = () => {
    setTheater(!theater);
  };

  const handlePip = () => {
    setPip(!pip);
  };

  useEffect(() => {
    if (missionDetails) {
      const location = { lat: "", lng: "" };
      if (missionDetails.flight.geoFence.circle) {
        location.lat = missionDetails.flight.geoFence.circle.center.lat;
        location.lng = missionDetails.flight.geoFence.circle.center.lng;
      } else {
        location.lat = missionDetails.flight.geoFence.polygon.points[0].lat;
        location.lng = missionDetails.flight.geoFence.polygon.points[0].lng;
      }
      setLocation(location);
    }
  }, [missionDetails]);

  //socket connection code here - listening for streamKey delete
  useEffect(() => {
    if (missionDetails) {
      if (userDetails) {
        if (!socket.current) {
          socket.current = io(
            `${API_URL}/stream/notification?tenantID=${tenantId._id}`
          );
          socket.current.on("STREAM_REMOVED", (streamKey) => {
            const temp = Buffer.from(streamKey, "base64").toString();
            const [mID, fID, lID] = temp.split("-");

            if (fID.toString() === missionDetails.flight._id.toString()) {
              message.success("Stream complete!");
              setStreamKey("");
              //redirecting to missionview page after 5seconds
              window.setTimeout(function () {
                history.push(`/dashboard/mission/view/${missionDetails._id}`);
              }, 5000);
            }
          });
        }
      }
    }
  }, [missionDetails]);
  console.log(missionDetails);
  return (
    <div className="live-view-wrapper">
      <div>
        <div style={{ position: "relative", paddingBottom: "37.5%" }}>
          <Row
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <Col className="video-wrapper" span={theater ? 24 : pip ? 0 : 16}>
              {streamKey ? (
                <VideoPlayer
                  url={streamURL}
                  handleTheater={handleTheater}
                  theater={theater}
                  handlePip={handlePip}
                  pip={pip}
                  streamKey={streamKey}
                  mission={missionDetails}
                  alertBtnStatus=""
                  isLive={true}
                  geoFence={geoFence.geoFence}
                  showHUD={true}
                />
              ) : (
                <div className="no-feed">
                  <img className="no-feed-svg" src={streamEnd} />
                  <div className="no-feed-text">
                    <Title level={4}>Stream is offline!</Title>
                  </div>
                </div>
              )}
            </Col>
            <Col
              className="live-map-wrapper"
              span={theater ? 0 : pip ? 24 : 8}
              onDoubleClick={handlePip}
            >
              {streamKey ? (
                <DroneMap streamKey={streamKey} geoFence={geoFence.geoFence} />
              ) : (
                <div className="no-map">
                  <img className="no-map-svg" src={NoMap} />
                  <div className="no-map-text">
                    <Title level={4}>Drone is currently offline!</Title>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </div>
        <Row gutter={[8, 8]}>
          <Col className="info-wrapper" span={16}>
            <Tabs defaultActiveKey="1" items={items} />
          </Col>
          <Col span={8}>
            <Weather
              location={location}
              isoDate={new Date().toISOString()}
              type="live"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default LiveViewBase;
