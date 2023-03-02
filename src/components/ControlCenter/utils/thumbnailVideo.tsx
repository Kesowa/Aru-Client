import React from "react";
import Hls from "hls.js";

class Video extends React.Component {
  player: any = null;

  componentDidMount() {
    if (this.player) {
      const video = this.player;

      if (Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup: function (xhr, url) {
            xhr.withCredentials = true;
          },
        });
        hls.loadSource(
          "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8"
        );
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
          video.pause();
        });
      } else {
        alert("Please use a modern browser to play the video");
      }
    }
  }

  render() {
    return (
      <video
        src=""
        id="thumbnail"
        ref={(player) => (this.player = player)}
        style={{ width: "100%", background: "#000000" }}
        onMouseEnter={() => {
          this.player.play();
        }}
        onMouseLeave={() => {
          this.player.pause();
        }}
      ></video>
    );
  }
}

export default Video;
