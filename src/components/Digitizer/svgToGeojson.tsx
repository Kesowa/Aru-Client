import React, { useState, useEffect } from "react";
import { BinaryImageConverter, ColorImageConverter } from "vtracer-webapp";
import { geoFromSVGXML } from "svg2geojson";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { BitmapLayer } from "@deck.gl/layers";
import { parse, stringify } from "svgson";
import svgpath from "svgpath";
import "./index.less";

const SvgToGeojson = ({ deckRef, onValueChange }) => {
  const [canvas, setCanvas] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [svg, setSvg] = useState(null);
  const [img, setImg] = useState(new Image());
  const [outputCanvas, setOutputCanvas] = useState(null);
  const [outputCtx, setOutputCtx] = useState(null);
  const [mode1, setMode1] = useState("polygon");
  const [clusteringMode, setClusteringMode] = useState("color");
  const [clusteringHierarchical, setClusteringHierarchical] =
    useState("stacked");
  const [runner, setRunner] = useState(null);
  const [globalCorner, setGlobalCorner] = useState(60);
  const [globalLength, setGlobalLength] = useState(4);
  const [iterations, setIterations] = useState(10);
  const [globalSplice, setGlobalSplice] = useState(45);
  const [globalFilterSpeckle, setGlobalFilterSpeckle] = useState(4);
  const [globalColorPrecision, setGlobalColorPrecision] = useState(6);
  const [globalLayerDifference, setGlobalLayerDifference] = useState(16);
  const [globalPathPrecision, setGlobalPathPrecision] = useState(8);
  const [conversionInProgress, setConversionInProgress] = useState(false);
  const [svgImage, setSvgImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [canvasOffsetX, setCanvasOffsetX] = useState(0);
  const [canvasOffsetY, setCanvasOffsetY] = useState(0);
  const [canvasRotation, setCanvasRotation] = useState(0);
  const [canvasImageOpacity, setCanvasImageOpacity] = useState(1);
  const [flattenedBounds, setFlattenedBounds] = useState([]);

  useEffect(() => {
    if (canvas) {
      const context = canvas.getContext("2d");
      setCtx(context);

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMoves);
      canvas.addEventListener("mouseup", handleMouseUp);
    }
    if (outputCanvas) {
      const outputContext = outputCanvas.getContext("2d");
      setOutputCtx(outputContext);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMoves);
        canvas.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [canvas, outputCanvas]);

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setDragStartX(event.clientX);
    setDragStartY(event.clientY);
    setCanvasOffsetX(canvas.offsetLeft);
    setCanvasOffsetY(canvas.offsetTop);
  };

  const handleMouseMoves = (event) => {
    if (isDragging) {
      const offsetX = event.clientX - dragStartX;
      const offsetY = event.clientY - dragStartY;
      canvas.style.left = `${canvasOffsetX + offsetX}px`;
      canvas.style.top = `${canvasOffsetY + offsetY}px`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // const handleRotationChange = (event) => {
  //   setCanvasRotation(parseInt(event.target.value));
  // };

  const handleCanvasImageOpacityChange = (event) => {
    const newValue = parseFloat(event.target.value);
    const snappedValue = Math.round(newValue * 10) / 10;
    setCanvasImageOpacity(snappedValue);
  };

  useEffect(() => {
    try {
      restart();
    } catch (error) {
      console.error("An error occurred while restarting:", error);
    }
  }, [
    img,
    mode1,
    clusteringMode,
    clusteringHierarchical,
    globalCorner,
    globalLength,
    iterations,
    globalSplice,
    globalFilterSpeckle,
    globalColorPrecision,
    globalLayerDifference,
    globalPathPrecision,
  ]);

  //   useEffect(() => {
  //     const svgElement = document.getElementById("svg");

  //     if(svgElement){
  //     svgElement.addEventListener("mouseover", handleMouseOver);
  //     svgElement.addEventListener("mouseout", handleMouseOut);
  //     return () => {
  //       svgElement.removeEventListener("mouseover", handleMouseOver);
  //       svgElement.removeEventListener("mouseout", handleMouseOut);
  //     };
  //   }
  //   }, []);

  //   const handleMouseOver = (e) => {

  //     svgElement.setAttribute("fill", "#ff0");
  //     svgElement.setAttribute("stroke", "#f00");
  //   };

  //   const handleMouseOut = (e) => {

  //     svgElement.removeAttribute("fill");
  //     svgElement.removeAttribute("stroke");
  //   };

  const handleImageLoad = async () => {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (width > 0 && height > 0 && canvas) {
      console.log("canvas ", canvas);
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      if (svg) {
        while (svg.firstChild) {
          svg.removeChild(svg.firstChild);
        }
      }
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      restart();
    } else {
      console.error("Invalid canvas or image dimensions.");
    }
  };
  img.onload = handleImageLoad;

  const deg2rad = (deg) => {
    return (deg / 180) * Math.PI;
  };

  //function to convert bitmap image to svg
  const restart = () => {
    if (!img.src) {
      return;
    }
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const converterParams = {
      canvas_id: canvas.id,
      svg_id: svg.id,
      mode: mode1,
      clustering_mode: clusteringMode,
      hierarchical: clusteringHierarchical,
      corner_threshold: deg2rad(globalCorner),
      length_threshold: globalLength,
      max_iterations: iterations,
      splice_threshold: deg2rad(globalSplice),
      filter_speckle: globalFilterSpeckle * globalFilterSpeckle,
      color_precision: 8 - globalColorPrecision,
      layer_difference: globalLayerDifference,
      path_precision: globalPathPrecision,
    };
    if (runner) {
      runner.stop();
    }
    setConversionInProgress(true);
    const converterRunner = new ConverterRunner(converterParams);
    setRunner(converterRunner);
    converterRunner
      .run()
      .then(() => {
        setConversionInProgress(false);
      })
      .catch((error) => {
        console.error("Error during conversion:", error);
        setConversionInProgress(false);
      });
  };

  const handleFileInputChange = (info) => {
    const file = info.file.originFileObj;
    const reader = new FileReader();
    reader.onload = (e) => {
      const source = e.target.result;
      const newImg = new Image();
      newImg.onload = handleImageLoad;
      newImg.src = source;
      setImg(newImg); // Update state with the new image
      setSvgImage(true);
      setCanvasImageOpacity(1);
    };
    reader.readAsDataURL(file);
  };

  const ConverterRunner = class {
    constructor(converterParams) {
      this.converter =
        clusteringMode === "color"
          ? ColorImageConverter.new_with_string(JSON.stringify(converterParams))
          : BinaryImageConverter.new_with_string(
              JSON.stringify(converterParams)
            );
      this.converter.init();
    }

    run() {
      return new Promise((resolve, reject) => {
        const tick = () => {
          if (!this.stopped) {
            let done = false;
            const startTick = performance.now();
            while (
              !(done = this.converter.tick()) &&
              performance.now() - startTick < 25
            ) {}
            if (!done) {
              requestAnimationFrame(tick);
            } else {
              resolve();
            }
          }
        };
        tick();
      });
    }

    stop() {
      this.stopped = true;
      this.converter.free();
    }
  };

  // const downloadGeojson = (a, b) => {
  //   // const svgRect = svg.getBoundingClientRect();

  //   // // Extract width and height from the rect object
  //   // const svgWidth = svgRect.width;
  //   // const svgHeight = svgRect.height;

  //   // console.log("SVG width:", svgWidth);
  //   // console.log("SVG height:", svgHeight);

  //   const svgDem = svg.viewBox.animVal;

  //   const svgContent = svg.outerHTML;
  //   const blob = new Blob([svgContent], { type: "image/svg+xml" });

  //   const reader = new FileReader();
  //   reader.onload = async function (event) {
  //     const svgText = event.target.result;

  //     console.log(svgText);

  //     const parser = new DOMParser();
  //     const svgDocument = parser.parseFromString(svgText, "image/svg+xml");

  //     const metaInfoNS = "http://www.prognoz.ru";
  //     const metaInfoElement = svgDocument.createElementNS(
  //       metaInfoNS,
  //       "MetaInfo"
  //     );

  //     const geoElement = svgDocument.createElement("Geo");

  //     // const geoItems = [
  //     //   { X: "0", Y: "0", Latitude: "37.375593", Longitude: "-121.977795" },
  //     //   { X: "665", Y: "632", Latitude: "37.369930", Longitude: "-121.959404" }
  //     // ];

  //     const geoItems = [
  //       { X: "0", Y: "0", Latitude: a[1], Longitude: a[0] }, //use all the coordinates get in the imagepin function with Dimension of svg at X and Y properly {dont chnage order of lat,lng}
  //       { X: svgDem.height, Y: svgDem.width, Latitude: b[1], Longitude: b[0] },
  //     ];

  //     for (const item of geoItems) {
  //       const geoItemElement = svgDocument.createElement("GeoItem");
  //       geoItemElement.setAttribute("X", item.X);
  //       geoItemElement.setAttribute("Y", item.Y);
  //       geoItemElement.setAttribute("Latitude", item.Latitude);
  //       geoItemElement.setAttribute("Longitude", item.Longitude);
  //       geoElement.appendChild(geoItemElement);
  //     }

  //     metaInfoElement.appendChild(geoElement);

  //     svgDocument.documentElement.appendChild(metaInfoElement);

  //     const modifiedSvgText = new XMLSerializer().serializeToString(
  //       svgDocument
  //     );

  //     await new Promise((resolve, reject) => {
  //       geoFromSVGXML(
  //         modifiedSvgText,
  //         (layers) => {
  //           const json = JSON.stringify(layers[0].geo);
  //           console.log(json);
  //           const geoJsonString = JSON.stringify(layers[0].geo);
  //           const blob = new Blob([geoJsonString], {
  //             type: "application/json",
  //           });
  //           const link = document.createElement("a");
  //           link.href = URL.createObjectURL(blob);
  //           link.download = "output.geojson";
  //           link.click();
  //           URL.revokeObjectURL(link.href);
  //           // setGeojsonRender(link.href);
  //           resolve();
  //         },
  //         { layers: true, tolerance: 0.5 }
  //       );
  //     });
  //   };
  //   reader.readAsText(blob);
  //   setSvgImage(false);
  // };

  const downloadGeojson = (a, b) => {
    const svgContent = svg.outerHTML;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });

    const svgDem = svg.viewBox.animVal;

    const reader = new FileReader();
    reader.onload = async function (event) {
      const svgText = event.target.result;

      // Parse SVG to JSON using svgson
      const svgJson = await parse(svgText);

      // Apply transformations to path coordinates
      svgJson.children.forEach((child) => {
        if (child.name === "path") {
          const transform = child.attributes.transform;
          if (transform) {
            const translateMatch = transform.match(
              /translate\(([-\d.]+),\s*([-.\d]+)\)/
            );
            if (translateMatch) {
              const translateX = parseFloat(translateMatch[1]);
              const translateY = parseFloat(translateMatch[2]);

              const updatedPathData = svgpath(child.attributes.d)
                .translate(translateX, translateY)
                .toString();

              child.attributes.d = updatedPathData;
              delete child.attributes.transform;
            }
          }
        }
      });

      const updatedSvgText = stringify(svgJson);

      const parser = new DOMParser();
      const svgDocument = parser.parseFromString(
        updatedSvgText,
        "image/svg+xml"
      );

      const metaInfoNS = "http://www.prognoz.ru";
      const metaInfoElement = svgDocument.createElementNS(
        metaInfoNS,
        "MetaInfo"
      );

      const geoElement = svgDocument.createElement("Geo");

      const geoItems = [
        { X: "0", Y: "0", Latitude: a[1], Longitude: a[0] }, //use all the coordinates get in the imagepin function with Dimension of svg at X and Y properly {dont chnage order of lat,lng}
        { X: svgDem.height, Y: svgDem.width, Latitude: b[1], Longitude: b[0] },
      ];

      for (const item of geoItems) {
        const geoItemElement = svgDocument.createElement("GeoItem");
        geoItemElement.setAttribute("X", item.X);
        geoItemElement.setAttribute("Y", item.Y);
        geoItemElement.setAttribute("Latitude", item.Latitude);
        geoItemElement.setAttribute("Longitude", item.Longitude);
        geoElement.appendChild(geoItemElement);
      }

      metaInfoElement.appendChild(geoElement);
      svgDocument.documentElement.appendChild(metaInfoElement);

      const modifiedSvgText = new XMLSerializer().serializeToString(
        svgDocument
      );

      await new Promise((resolve, reject) => {
        geoFromSVGXML(
          modifiedSvgText,
          (layers) => {
            // Extract the fill color from each path
            const paths = svgDocument.querySelectorAll("path");
            const geoJsonFeatures = layers[0].geo.features.map(
              (feature, index) => {
                const path = paths[index];
                const pathStyle = path.getAttribute("style");
                const fillMatch = pathStyle.match(/fill:\s*([^;]+)/);
                const fillColor = fillMatch ? fillMatch[1] : null;

                // Add color property to the properties of each feature
                return {
                  ...feature,
                  properties: {
                    ...feature.properties,
                    color: fillColor,
                  },
                };
              }
            );

            layers[0].geo.features = geoJsonFeatures;

            const geoJsonString = JSON.stringify(layers[0].geo);
            const blob = new Blob([geoJsonString], {
              type: "application/json",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "output.geojson";
            link.click();
            URL.revokeObjectURL(link.href);
            resolve();
          },
          { layers: true, tolerance: 0.5 }
        );
      });
    };
    reader.readAsText(blob);
    setSvgImage(false);
  };

  // function to pin image to the map
  const imagePin = () => {
    // Use deckgl reference to access the unproject method
    const deck = deckRef.current.deck;
    const defaultViewport = deck.viewManager._viewportMap["default-view"];

    const pointNW = [canvas.offsetLeft, canvas.offsetTop];
    const pointNE = [canvas.offsetLeft + canvas.width, canvas.offsetTop];
    const pointSE = [
      canvas.offsetLeft + canvas.width,
      canvas.offsetTop + canvas.height,
    ];
    const pointSW = [canvas.offsetLeft, canvas.offsetTop + canvas.height];

    // Convert points to LatLng
    const lngLatNW = defaultViewport.unproject(pointNW);
    const lngLatNE = defaultViewport.unproject(pointNE);
    const lngLatSE = defaultViewport.unproject(pointSE);
    const lngLatSW = defaultViewport.unproject(pointSW);

    console.log("lnglatNW :", lngLatNW, lngLatNE, lngLatSE, lngLatSW);
    const bounds = [lngLatSW, lngLatNE];
    const flattenedBounds = [];
    for (const coord of bounds) {
      flattenedBounds.push(...coord);
    }
    setFlattenedBounds(flattenedBounds);

    downloadGeojson(lngLatNW, lngLatSE);
    setDigitizer(false);
  };

  useEffect(() => {
    if (img && flattenedBounds.length > 0) {
      const newDigitizerLayer = new BitmapLayer({
        id: "image-layer",
        image: img,
        bounds: flattenedBounds,
        opacity: 1,
      });
      onValueChange(newDigitizerLayer);
    }
  }, [img, flattenedBounds]);

  return (
    <>
      {svgImage && (
        <canvas
          id="frame"
          title="Drag to set location"
          ref={(ref) => setCanvas(ref)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `rotate(${canvasRotation}deg)`,
            border: "1px dashed black",
            opacity: canvasImageOpacity,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMoves}
          onMouseUp={handleMouseUp}
        ></canvas>
      )}

      {svgImage && (
        <div className="canvas-rotate">
          {/* <input
            title="Rotate Image"
            type="range"
            min="0"
            max="360"
            value={canvasRotation}
            onChange={handleRotationChange}
          /> */}
          <input
            title="Opacity Of Image"
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={canvasImageOpacity}
            onChange={handleCanvasImageOpacityChange}
          />
        </div>
      )}
      <div className="digitizer">
        <Upload
          accept="image/*"
          onChange={handleFileInputChange}
          multiple={false}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Select Image</Button>
        </Upload>
        <div className="parameters-container">
          <label>
            Global Corner: {globalCorner}
            <input
              title="Global Corner"
              type="range"
              name="globalCorner"
              min="0"
              max="180"
              step="1"
              value={globalCorner}
              onChange={(e) => setGlobalCorner(parseInt(e.target.value))}
              className="broad-slider"
            />
          </label>
          <label>
            Global Length: {globalLength}
            <input
              title="Global Length"
              type="range"
              name="globalLength"
              min="3.5"
              max="10"
              step="0.5"
              value={globalLength}
              onChange={(e) => setGlobalLength(parseFloat(e.target.value))}
              className="broad-slider"
            />
          </label>
          <label>
            Global Splice: {globalSplice}
            <input
              title="Golbal Splice"
              type="range"
              name="globalSplice"
              min="0"
              max="180"
              step="1"
              value={globalSplice}
              onChange={(e) => setGlobalSplice(parseInt(e.target.value))}
              className="broad-slider"
            />
          </label>
          <label>
            Filter Speckle: {globalFilterSpeckle}
            <input
              title="Global FilterSpeckle"
              type="range"
              name="globalFilterSpeckle"
              min="1"
              max="16"
              step="1"
              value={globalFilterSpeckle}
              onChange={(e) => setGlobalFilterSpeckle(parseInt(e.target.value))}
              className="broad-slider"
            />
          </label>
          <label>
            Color Precision: {globalColorPrecision}
            <input
              title="Global ColorPrecision"
              type="range"
              name="globalColorPrecision"
              min="1"
              max="8"
              step="1"
              value={globalColorPrecision}
              onChange={(e) =>
                setGlobalColorPrecision(parseInt(e.target.value))
              }
              className="broad-slider"
            />
          </label>
          <label>
            Layer Difference: {globalLayerDifference}
            <input
              title="Global LayerDifference"
              type="range"
              name="globalLayerDifference"
              min="0"
              max="255"
              step="1"
              value={globalLayerDifference}
              onChange={(e) =>
                setGlobalLayerDifference(parseInt(e.target.value))
              }
              className="broad-slider"
            />
          </label>
          <label>
            Path Precision: {globalPathPrecision}
            <input
              title="Global PathPrecision"
              type="range"
              name="globalPathPrecision"
              min="0"
              max="360"
              step="0.1"
              value={globalPathPrecision}
              onChange={(e) => setGlobalPathPrecision(parseInt(e.target.value))}
              className="broad-slider"
            />
          </label>
        </div>
        <Button
          type="primary"
          style={{ position: "absolute", bottom: "10px", right: "10px" }}
          onClick={imagePin}
        >
          Pin to map
        </Button>
      </div>
      {svgImage && (
        <div className="svgprev" title="Svg Image Preview">
          <svg
            id="svg"
            ref={(ref) => setSvg(ref)}
            style={{ width: "90%", height: "80%", marginTop: "20px" }}
          ></svg>
        </div>
      )}
    </>
  );
};

export default SvgToGeojson;
