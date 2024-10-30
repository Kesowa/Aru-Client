// ElevationBlock.tsx
import React from "react";
import EventEmitter from 'events';

export const valueChangeEmitter = new EventEmitter();

export const handleHover = 
({ x, y, layer,bitmap,sourceLayer}) => {
      try {
        const layerType = layer.raster;
        const {device} = sourceLayer.context;
        if (bitmap && layerType === "DEM") {
          const pixelColor = device.readPixelsToArrayWebGL(sourceLayer.props.image,{
            sourceX: bitmap.pixel[0],
            sourceY: bitmap.pixel[1],
            sourceWidth: 1,
            sourceHeight: 1,
          });
          const [R, G, B] = pixelColor;
          const scalarValue = pixelColor[0]/ 255.0;
          const minp = layer.minp;
          const maxp = layer.maxp;
          const elevation = minp + (maxp - minp) * scalarValue;
          const elevationInfo = {R,G,B, x, y, elevation }
          valueChangeEmitter.emit('valueChanged', elevationInfo);
        } else {
          return null;
        }
      } catch (error) {
        console.error("Try with the dem layer instead", error);
      }
    }
    
interface HoverInfo {
  R: number;
  G: number;
  B: number;
  x: number;
  y: number;
  elevation: number;
}

interface ElevationBlockProps {
  hoverInfo: HoverInfo | null;
  isElevationEnabled: boolean;
}

const ElevationBlock: React.FC<ElevationBlockProps> = ({ hoverInfo, isElevationEnabled }) => {
  if (!hoverInfo || !isElevationEnabled) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: hoverInfo.x + 15,
        top: hoverInfo.y,
        background: "white",
        padding: "4px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "-15px",
        marginBottom: "-15px",
      }}
    >
      <div
        style={{
          background: `rgb(${hoverInfo.R}, ${hoverInfo.G}, ${hoverInfo.B})`,
          width: "25px",
          height: "30px",
          marginRight: "8px",
          borderRadius: "7px",
        }}
      ></div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "-15px" }}>
        <p>{hoverInfo.elevation.toFixed(2)} Meter</p>
      </div>
    </div>
  );
};

export default ElevationBlock;
