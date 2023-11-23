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
  const [clickPending, setClickPending] = useState(false);
  const dataRef = useRef(null);

 
  const {
    detectedEnvironment: {
      isMouseDetected = false,
      isTouchDetected = false,
    } = {},
    elementDimensions: { width = 0, height = 0 } = {},
    position: { x = 0, y = 0 } = {},
    isActive = false,
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


  const handleCanvasClick = () => {
     // Adjust the debounce delay as needed (1 second in this example)
     if (!isPositionOutside && !clickPending) {
      
      // Prevent further clicks until the debounce period is over
      setClickPending(true);
     canvas.addEventListener("click", (ev) => {
      const cols = canvas.width;
      const { offsetX, offsetY } = ev;
      // Call the method to get the r,g,b,a values for the current pixel
      const c = extractPixelColor(dataRef.current, cols, offsetY, offsetX);
      const hexCode = `#${[c.red, c.green, c.blue]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`;
      // Call the function to handle pixel click
      const pixelData = {
        // index: tableDataRef.current.length + 1,
        x: offsetX,
        y:offsetY,
        temp: props.data[(offsetX) + width * (offsetY)],
        color: hexCode,
        label:'',
      };
      // Call the parent component's function to add data to the table
      tableDataRef.current.push(pixelData);
      // console.log(pixelData);
      // console.log(props.data[(offsetX + 16) + canvas.width * (offsetY + 16)]);
      props.onPixelClick(pixelData);
    });
  }
    
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
      dataRef.current = data;
     
      
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
          placement={x < width / 2 ? "right" : "left"}
          trigger="hover"
        >
          <canvas id="canvas" onClick={handleCanvasClick}></canvas>
        </Whisper>
      </div>
    </div>
  );
};

export default ThermalImage;
