import React, { useState, useEffect, useRef, MouseEvent as ME } from "react";
import { STATIC_URL } from "src/constants";

const ThermalImage = (props: { data: any[]; onPixelClick: (arg0: { x: number; y: number; temp: any; color: string; label: string; }) => void; filePath: unknown; }) => {
  const [temperature, setTemperature] = useState(0);
  const [pixelColor, setPixelColor] = useState("");
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
        }
        canvas.addEventListener("mouseenter", () => canvas.addEventListener("mousemove", onHover));
        canvas.addEventListener("mouseleave", () => canvas.removeEventListener("mousemove", onHover))
      }
    }
  }, [props.filePath])

  return (
    <div id="container__canvas" style={{ display: "flex" }}>
      <div id="canvas-container">
        <canvas 
          title={`${temperature.toFixed(2)}°C`} 
          ref={canvasRef} onClick={handleCanvasClick} 
          style={{cursor: "crosshair", border: `5px solid ${pixelColor}`}}>
        </canvas>
      </div>
    </div>
  );
};

export default ThermalImage;
