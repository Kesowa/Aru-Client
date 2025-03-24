import { useContext, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Button } from "antd";
import { API_URL } from "src/constants";
import { AuthContext } from "src/services/authUtils";

function MavlinkTest() {
  const socket: any = useRef();

  const vref: any = useRef();

  const { Auth } = useContext(AuthContext);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(
        `${API_URL}/stream/mavStats?tenantID=${Auth.userdetails.tenantId._id}`
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
  }, [Auth]);

  async function startStream() {
    const assetId = "62010fe84e70b1b79f6228b1";
    const missionId = "615ad0f5e5324204d8b97c88";

    socket.current.emit("START_STREAM", {
      missionId,
      assetId,
    });
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
        ><track kind="captions"></track></video>
      </div>
    </div>
  );
}

export default MavlinkTest;
