import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { connect } from "react-redux";
import { Button } from "antd";
import { API_URL } from "src/constants";

function MavlinkTest(props) {
  const socket: any = useRef();
  const pc: any = useRef();
  const [defaultLocation, setDefaultLocation] = useState({
    lat: 22.571194159512256,
    lng: 88.49175358524279,
  });
  const [INITIAL_VIEW_STATE, setViewport] = useState<any>({
    longitude: defaultLocation.lng,
    latitude: defaultLocation.lat,
    zoom: 13,
    pitch: 0,
    minZoom: 0,
    maxZoom: 22,
    bearing: 0,
    // transitionDuration: 8000,
    // transitionInterpolator: new FlyToInterpolator(),
  });

  const vref: any = useRef();

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(
        `${API_URL}/stream/mavStats?tenantID=${props.Auth.userdetails.tenantId._id}`
      );
      console.log(socket);

      //----Telemetry
      socket.current.on("message", ({ data }) => {
        console.log("Telemetry: ", data);
      });

      //------listen acknowledgement
      socket.current.on("ACK", ({ data }) => {
        console.log("Acknowledgement: ", data);
      });
    }
  }, [props.Auth]);

  async function startStream() {
    const assetId = "62010fe84e70b1b79f6228b1";
    const missionId = "615ad0f5e5324204d8b97c88";

    // pc.current = new RTCPeerConnection({
    //     iceServers: [
    //         {
    //             urls: "turn:14.97.37.70:3478",
    //             username : "test",
    //             credential : "test123"
    //         }
    //     ]
    // });

    // pc.current.addTransceiver("video", { direction: "recvonly" })

    // const offer = await pc.current.createOffer({ offerToReceiveVideo: true });

    // await pc.current.setLocalDescription(offer);

    socket.current.emit("START_STREAM", {
      missionId,
      assetId,
      // offer : pc.current.localDescription
    });

    // socket.current.on("ANSWER",async (payload) => {
    //     console.log("++++++++++++++", payload)
    //     const desc = new RTCSessionDescription(payload.sdp);
    //     await pc.current.setRemoteDescription(desc).catch(e => console.log(e));
    // })

    // pc.current.addEventListener('icegatheringstatechange', function() {
    //     console.log("hp", pc.current.iceGatheringState);
    // })

    // pc.current.addEventListener('iceconnectionstatechange', function() {
    //     console.log("as", pc.current.iceConnectionState)
    // });

    // pc.current.addEventListener('signalingstatechange', function() {
    //     console.log("kp", pc.current.signalingState);
    // });

    // pc.current.ontrack = function(evt) {
    //     console.log("-------------------------------", evt.streams[0]);
    // };
  }

  const startFileSync = () => {
    const assetId = "62010fe84e70b1b79f6228b1";
    const missionId = "615ad0f5e5324204d8b97c88";
    socket.current.emit("START_FILE_SYNC", {
      assetId,
      missionId,
    });
  };

  function stopStream() {
    const assetId = "615acfc3e5324204d8b97c87";
    const missionId = "615ad0f5e5324204d8b97c88";
    socket.current.emit("END_STREAM", missionId, assetId);
    console.log("Emitted Stop Stream");
  }

  return (
    <div
      style={{
        margin: "auto",
        width: "500px",
        marginTop: "200px",
      }}
    >
      <Button type="primary" onClick={() => startStream()}>
        Start stream
      </Button>
      <Button type="primary" onClick={() => stopStream()}>
        Stop stream
      </Button>
      <Button type="primary" onClick={() => startFileSync()}>
        Start File sync
      </Button>
      <Button type="primary">Stop file sync</Button>
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <video
          style={{ height: "500px", width: "500px" }}
          ref={vref}
          src=""
        ></video>
      </div>
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    Auth: state.Auth,
    refresh: state.Missions.refresh,
  };
};
export default connect(mapStateToProps, {})(MavlinkTest);
