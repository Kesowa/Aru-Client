// src/pages/InferencePage.tsx

import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Collapse,
  message,
  Progress,
} from "antd";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import { useParams } from "react-router-dom";
import http from "../../../services/httpCall"
import apis, { apisV2 } from "../../../services/apis";
import { ILayer } from "src/types/layer";
// import { Layer as DLayer } from "deck.gl";
import { ILayerToDeckLayer, Layer } from "../layerRender";
import { calculateViewport, fetchLayerBounds } from "./layerBounds";
import { MAPBOX_API_KEY } from "src/constants";

const { Option } = Select;
const { Panel } = Collapse;

const tileLayer = new TileLayer({
  data: `https://c.tile.openstreetmap.org/{z}/{x}/{y}.png`,
  minZoom: 0,
  maxZoom: 19,
  tileSize: 256,
  renderSubLayers: (props) => {
    const {
      bbox: { west, south, east, north },
    } = props.tile;

    return new BitmapLayer(props, {
      data: null,
      image: props.data,
      bounds: [west, south, east, north],
    });
  },
});

const InferencePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [layer, setLayer] = useState<Layer | null>(null)
  const { layerId, layerName } = useParams<{ layerId: string, layerName: string }>();
  const [layers, setLayers] = useState<any[]>([tileLayer]);
  const [viewport, setViewport] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 12,
    pitch: 0,
    bearing: 0,
  });


  useEffect(() => {
    (async () => {
      const layerRes = await http.get(apisV2.LAYER, {
        params: { layerId }
      });
      if (layerRes.status == 200 && layerRes.data?.data?.length == 1) {
        const layer = layerRes.data.data[0] as ILayer as Layer;
        layer._isChecked = true;
        setLayer(layer);
        setLayers([tileLayer, ILayerToDeckLayer([layer])]);
        const bounds = await fetchLayerBounds(layer);
        setViewport({
          ...calculateViewport(bounds),
          pitch: 0,
          bearing: 0,
        })
      } else {
        throw new Error("failed to load layer data")
      }
    })()
    .then(() => console.log("loaded inference layer"))
    .catch(e => console.error("failed to load inference layer", e))
  }, [layerId])

  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [inferenceType, setInferenceType] = useState<string | null>(null);

  const invokeInference = async (selectedInference: string) => {
    setLoading(true);
    if (!selectedInference) {
      message.warning("Please select an inference type!");
      return;
    }
    setInferenceType(selectedInference);

    const apiEndpoint = apis.INFER_LAYER_API.replace(
      ":layerId",
      layerId
    ).replace(":inferType", selectedInference);

    http
      .post(apiEndpoint)
      .then((res) => {
        if (res.data.status) {
          if (res.data.message === "Task is already completed") {
            setLoading(false);
            setProgress(null);
            setStatus("Complete");
            message.info("Inference task is already complete!");
          } else {
            message.success(
              `${selectedInference} inference has started successfully!`
            );
            if(progress==100 && status == "Complete") { //dobble check weather AI inference is completed
              history.back();
            }
          }
        } else {
          message.error(res.data.message || "Something went wrong!");
        }
      })
      .catch((err) => {
        console.error(`Error starting ${selectedInference} inference:`, err);
        message.error("Failed to start inference.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRun = async () => {
    try {
      const values = await form.validateFields();
      await invokeInference(values.inferenceType);
    } catch (err) {
      console.error("Inference run failed:", err);
      message.error("Please check inputs before running.");
    }
  };

  return (
    <div style={{ height: "calc(100vh - 64px)", width: "100%", padding: 50 }}>
      <Row gutter={16} style={{ height: "100%" }}>
        {/* Left Panel */}
        <Col span={8} style={{ display: "flex", flexDirection: "column" }}>
          <Card
            title="Inference Settings"
            bordered={false}
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <Form
              form={form}
              layout="vertical"
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
                {/* Selected Layer */}
                <Form.Item
                  label="Selected Layer"
                  name="layer"
                  initialValue={layerName}
                  rules={[{ required: true, message: "Layer is required" }]}
                >
                  <Input disabled />
                </Form.Item>

                {/* Inference Type */}
                <Form.Item
                  label="AI Inference Type"
                  name="inferenceType"
                  rules={[
                    {
                      required: true,
                      message: "Please select an inference type",
                    },
                  ]}
                >
                  <Select placeholder="Select AI Inference">
                    <Option value="deepforest">Tree Count</Option>
                    <Option value="rooftopsegmentation">
                      Rooftop Segmentation
                    </Option>
                  </Select>
                </Form.Item>

                {/* Advanced Settings */}
                <Collapse ghost>
                  <Panel header="Advanced Settings" key="1">
                    <Form.Item
                      label="Window Size (px)"
                      name="windowSize"
                      initialValue={500}
                    >
                      <InputNumber min={100} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                      label="Threshold"
                      name="threshold"
                      initialValue={0.6}
                    >
                      <InputNumber
                        min={0}
                        max={1}
                        step={0.1}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Form.Item
                      label="IoU Threshold"
                      name="iouThreshold"
                      initialValue={0.5}
                    >
                      <InputNumber
                        min={0}
                        max={1}
                        step={0.1}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Output Name"
                      name="outputName"
                      initialValue="Tree Layer Ortho"
                      rules={[
                        {
                          required: true,
                          message: "Please enter output name",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Panel>
                </Collapse>
              </div>

              <Button
                type="primary"
                loading={loading}
                onClick={handleRun}
                block
                style={{ marginTop: 14 }}
              >
                Run Inference
              </Button>
            </Form>
            {status === "Complete" ? (
              <p style={{ color: "green", fontWeight: "bold" }}>
                {inferenceType} Inference : Complete
              </p>
            ) : (
              <>
                {loading && (
                  <Progress strokeLinecap="square" percent={progress ?? 0} />
                )}
              </>
            )}
          </Card>
        </Col>

        {/* Right Panel - Deck.gl Map */}
        <Col span={16} style={{ height: "100%" }}>
          <Card
            title="Map Preview"
            bordered={false}
            style={{ height: "100%", borderRadius: "25px", overflow: "hidden" }}
          >
            <DeckGL
              initialViewState={viewport}
              controller={true}
              layers={layers}
              style={{ width: "100%", height: "100%" }}
            >
              <StaticMap
                mapStyle="mapbox://styles/mapbox/light-v10"
                mapboxAccessToken={MAPBOX_API_KEY}
              />
            </DeckGL>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InferencePage;
