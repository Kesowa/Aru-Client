import io from "socket.io-client";
import { API_URL } from "src/constants";

const connectSocket = (streamKey: string) => {
  const socket = io(
    `${API_URL}/stream/dronelocation?token=streamer&type=receiver&streamKey=${streamKey}`
  );

  socket.on("connect", () => {
    console.log(`${streamKey} connected`);
  });

  return socket;
};

export default connectSocket;
