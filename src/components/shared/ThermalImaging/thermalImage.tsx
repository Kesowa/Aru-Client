import React, { useState, useEffect, useRef } from "react";
import { STATIC_URL } from "src/constants";
import "rsuite/dist/rsuite.min.css";
import { Tooltip, Whisper } from "rsuite";

/* import { CloseCircleIcon } from "@rsuite/icons"; */

const ThermalImage = (props) => {
  const [temperature, setTemperature] = useState("");
  const [pixelColor, setPixelColor] = useState("");
  const [isWidgetOpen, setWidgetOpen] = useState(false);
  const tableDataRef = useRef([]);
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
      canvas.addEventListener("click", (ev) => {
        setWidgetOpen(!isWidgetOpen);
        const cols = canvas.width;
        const { offsetX, offsetY } = ev;
        //call the method to get the r,g,b,a values for current pixel
        const c = extractPixelColor(data, cols, offsetY, offsetX);

        const hexCode = `#${[c.red, c.green, c.blue]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")}`;
        // Call the function to handle pixel click
        if (!isPositionOutside) {
          const pixelData = {
            index:tableDataRef.current.length + 1,
            pixel_position: `${offsetX} x ${offsetY}`,
            pixel_color: hexCode,
            temperature: (temperature),
          };
          // Call the parent component's function to add data to the table
          tableDataRef.current.push(pixelData);
          console.log(temperature);
          props.onPixelClick(pixelData);
        }
      });
    }
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = imageLoaded;
    img.src = STATIC_URL + props.filePath;
  }, [props.filePath, x, y]);

  const handleDelete = (index) => {
    // Remove the row with the specified index from the table
    const updatedTableData = tableData.filter((row) => row.index !== index);
    setTableData(updatedTableData);
  };

  return (
    <div id="container__canvas" style={{ display: "flex" }}>
      <div
        id="canvas-container"
        style={{ marginRight: "10px", padding: "1rem" }}
      >
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
          trigger="hover"
        >
          <canvas id="canvas"></canvas>
        </Whisper>
      </div>
    </div>
  );
};

export default ThermalImage;
