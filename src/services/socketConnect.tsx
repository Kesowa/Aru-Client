import io from "socket.io-client";
import { API_URL } from "src/constants";

export function StreamKeyConnect (streamKey: string) {
      return connect(`/stream/dronelocation?token=streamer&type=receiver&streamKey=${streamKey}`)
}

export default function connect(uri: string) {
  const cookedURI = uri.startsWith(API_URL) ? uri : API_URL + uri;

  const socket = io(cookedURI, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log(`${uri} connected`);
  });

  return socket;
};
