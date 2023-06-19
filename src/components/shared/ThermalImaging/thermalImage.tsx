import { useState, useEffect } from "react";
import { STATIC_URL } from "src/constants";
import "rsuite/dist/rsuite.min.css";
import { Tooltip, Whisper } from "rsuite";

const ThermalImage = (props) => {
  const [temperature, setTemperature] = useState("");
  const [pixelColor, setPixelColor] = useState("");
  const {
    elementDimensions: { width = 0, height = 0 } = {},
    position: { x = 0, y = 0 } = {},
    isPositionOutside = false,
  } = props;
  useEffect(() => {
    if (!isPositionOutside) {
      const temperature = props.data[x + width * y];
      setTemperature(temperature);
    } else {
      setTemperature("");
      setPixelColor("");
    }
  }, [x, y, isPositionOutside]);

  const extractPixelColor = (data: any, cols: number, x: number, y: number) => {
    //To get the exact pixel, the logic is to multiply total columns in this image with the row position of this pixel and then add the column position of this pixed
    const pixel = cols * x + y;
    //To get the array position in the entire image data array, simply multiply your pixel position by 4 (since each pixel will have its own r,g,b,a in that order)
    const position = pixel * 4;
    //the rgba value of current pixel will be the following
    return {
      red: data[position],
      green: data[position + 1],
      blue: data[position + 2],
      alpha: data[position + 3],
    };
  };
  useEffect(() => {
    function imageLoaded() {
      const canvas = document.getElementById("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      canvas.addEventListener("mousemove", (ev) => {
        //as the mouse moves around the image
        const cols = canvas.width;
        const { offsetX, offsetY } = ev;
        //call the method to get the r,g,b,a values for current pixel
        const c = extractPixelColor(data, cols, offsetY, offsetX);

        const hexCode = `#${[c.red, c.green, c.blue]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")}`;
        setPixelColor(hexCode);
      });
    }
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = imageLoaded;
    img.src = STATIC_URL + props.filePath;
  }, [props.filePath, x, y]);
  return (
    <>
      <Whisper
        followCursor
        open={temperature ? true : false}
        speaker={
          <Tooltip className="pixel-tooltip">
            {temperature && (
              <div className="pixel-tooltip-content">
                <div
                  className="pixel-color"
                  style={{ backgroundColor: pixelColor }}
                />
                <p>{parseFloat(temperature).toFixed(2)}°C</p>
              </div>
            )}
          </Tooltip>
        }
        placement={x < width / 2 ? "right" : "left"}
        trigger="hover"
      >
        <canvas id="canvas"></canvas>
      </Whisper>
    </>
  );
};

export default ThermalImage;
