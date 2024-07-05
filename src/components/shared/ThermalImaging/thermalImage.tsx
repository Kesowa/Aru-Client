import React, { useState, useEffect, useRef, MouseEvent as ME } from "react";
import { STATIC_URL } from "src/constants";

const ThermalImage = (props: { data: any[]; onPixelClick: (arg0: { x: number; y: number; temp: any; color: string; label: string; }) => void; filePath: unknown; }) => {
  const [temperature, setTemperature] = useState(0);
  const [pixelColor, setPixelColor] = useState("");
  const [pixel, setPixel] = useState({x:0, y:0});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCanvasClick = (event: ME<HTMLCanvasElement, MouseEvent>) => {
    if (canvasRef.current == null)
      return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx == null)
      return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    const pixelData = {
      x: x,
      y: y,
      temp: props.data[x + canvas.width * y],
      color: color,
      label: "",
    };
    props.onPixelClick(pixelData);
  };

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = STATIC_URL + props.filePath;
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx == null)
          return;
        ctx.drawImage(img, 0, 0);
        const onHover = (event: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          const x = Math.floor(event.clientX - rect.left);
          const y = Math.floor(event.clientY - rect.top);
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
          const temperature = props.data[x + canvas.width * y];
          setPixelColor(color);
          setTemperature(temperature);
          setPixel({x: event.clientX - rect.left, y: event.clientY - rect.top});
        }
        canvas.addEventListener("mouseenter", () => canvas.addEventListener("mousemove", onHover));
        canvas.addEventListener("mouseleave", () => canvas.removeEventListener("mousemove", onHover))
      }
    }
  }, [props.filePath])

  return (
    <div id="container__canvas" style={{ display: "flex" }}>
      <div
        style={{
          position: "absolute",
          left: `${pixel.x + 5}px`,
          top: `${pixel.y + 5}px`,
          background: "black",
          padding: "5px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "-5px",
          marginBottom: "-5px",
        }}
      >
        <div
          style={{
            background: `${pixelColor}`,
            width: "25px",
            height: "25px",
            marginRight: "5px",
            borderRadius: "5px",
          }}
        ></div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "-10px",
          }}
        >
          <p style={{color:"white"}}>{temperature !== undefined ? `${temperature.toFixed(2)}°C` : ""}</p>
        </div>
      </div>
      <div id="canvas-container">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{ cursor: "crosshair" }}
        ></canvas>
      </div>
    </div>
  );
};

export default ThermalImage;
