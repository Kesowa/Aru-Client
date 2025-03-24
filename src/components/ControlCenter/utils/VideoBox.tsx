import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Avatar, Tag, Typography } from "antd";
import { DeleteOutlined, SwapOutlined, UserOutlined } from "@ant-design/icons";
import ReactHlsPlayer from "react-hls-player";
import "./videoBox.less";
import { LIVE_URL, STATIC_URL } from "src/constants";
const { Title, Text } = Typography;
const VideoBox = (props: any) => {
  const [streamURL, setstreamURL] = useState("");
  const history = useHistory();

  useEffect(() => {
    const url = `${LIVE_URL}/live/${props.streamKey}.m3u8`;

    setstreamURL(url);
  }, [props.streamKey]);
  return (
    <div className="v">
      <ReactHlsPlayer
        url={streamURL}
        autoplay={true}
        controls={false}
        className="live_feed"
      />

      <div className="buttons">
        <div className="action-buttons">
          <Button
            className={"swap_feed"}
            onClick={() => {
              props.swapFeed(props.group, props.index);
            }}
            style={{
              background: "#ffffff",
              color: "#000000",
            }}
          >
            <SwapOutlined />
          </Button>

          <Button
            className={"remove_feed"}
            onClick={() => {
              props.removeFeed(props.group, props.index);
            }}
            style={{
              background: "#ffffff",
              color: "#000000",
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
        <Tag className="live_tag" color="#cd201f">
          Live
        </Tag>
        <div className="hoverables">
          <Title level={5} className="geolocation">
            {props.value.flight[0].geoLocation}
          </Title>

          <Button
            type="text"
            onClick={() => {
              history.push(`/dashboard/data/live/${props.value.missionID}`);
            }}
          >
            <Text className="flight_id" strong>
              FlightID: {props.value.flightID}
            </Text>
          </Button>
          <div className="pilot">
            <Avatar
              size={40}
              icon={<UserOutlined />}
              src={`${STATIC_URL}${props.value.flight[0]?.pilotID?.avatar}`}
            />
            <div className="pilot_details">
              <h3 style={{ paddingLeft: "10px", margin: 0 }}>
                {props.value.flight[0].pilotID.name}
              </h3>
              <p style={{ paddingLeft: "10px", margin: 0 }}>
                +91 {props.value.flight[0].pilotID.phoneNo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VideoBox);
