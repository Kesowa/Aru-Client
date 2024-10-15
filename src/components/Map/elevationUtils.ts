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
    