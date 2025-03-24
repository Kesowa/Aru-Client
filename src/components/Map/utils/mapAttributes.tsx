// MapAttributes.tsx

import React, { useState, useEffect, useContext, useRef } from "react";
import { DownOutlined } from "@ant-design/icons";
import {
  Typography,
  Spin,
  Select,
  Switch,
  Space,
  Button,
  Progress,
  message,
  Dropdown,
  Menu,
} from "antd";
import ReactJson from "@uiw/react-json-view";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import FeatureTable from "./featureTable";
import { API_URL, COG_URL, TITILER_STATIC } from "src/constants";
import { Layer } from "../layerRender";
import { rasterProps } from "src/static/rasterprops";
import { AuthContext } from "src/services/authUtils";
import { Feature } from "src/types/geojson";
import io from "socket.io-client";

const { Text } = Typography;
const { Option } = Select;

interface RasterMetaData {
  // Define the type for raster metadata here
}

interface RasterDetails {
  fileName: string;
  fileSize: number;
}

interface Props {
  id: string;
  bottomBarHeight: string;
  type: "raster" | "vector";
  featureCount?: number;
  flaggedFilter?: boolean;
  unflaggedFilter?: boolean;
  shouldAttributeTableReload: boolean;
  setRefreshLayer: (refresh: boolean) => void;
  refreshLayer: boolean;
  setViewport: (viewport: any) => void;
  setSelectedIndexes: (indexes: number[]) => void;
  setSelectedFeatures: (features: Feature<any, any>[]) => void;
  defaultKeys: any;
  selectedIndexes: number[];
  setColorMap: (color: string) => void;
  setOverlayID: (id: string, overlayId: string) => void;
  setTerrainMap: (value: boolean) => void;
  // allLayers: any;
  AllLayers: Layer[];
  canEditGeojson: boolean;
  canDeleteFeature: boolean;
  updateFeatureCountInLayers: (count: number, id: string) => void;
  setshowSelectedIndexes: (values: number[]) => void;
  setShouldAttributeTableReload: (reload: boolean) => void;
  invertColor: any;
  handleMeshSourceOption: (id: string) => void;
  refreshVectorLayers: (refresh: boolean) => void;
}

interface State {
  isTableLoading: boolean;
  rasterDetails: RasterDetails | null;
  rasterMetaData: RasterMetaData | null;
  trueTableData: any[];
  tableData: any[];
  loading: boolean;
  error: boolean;
  contentHeight: string;
  page: number;
  limit: number;
  total: number | undefined;
  refresh: boolean;
}

const MapAttributes: React.FC<Props> = (props) => {
  const initialState: State = {
    isTableLoading: false,
    rasterDetails: null, // for fileSize and fileDetails of associated raster file
    rasterMetaData: null, // bounnds data and more similar stuff (??)
    trueTableData: [],
    tableData: [],
    loading: false,
    error: false,
    contentHeight: "",
    page: 1,
    limit: 10,
    total: 10,
    refresh: false,
  };

  const [state, setState] = useState<State>(initialState);
  // const filteredLayers = Object.values(props.allLayers).filter(
  //   (layer) => layer.type === "DEM" || layer.type === "ortho"
  // );
  const filteredLayers = props.AllLayers.filter(
    (layer) =>
      layer.type === "Raster" &&
      [rasterProps.DEM, rasterProps.ORTHO].includes(layer.raster)
  );

  const { logout } = useContext(AuthContext);

  //AIML inference api implementation
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState("Idle");
  const socket = useRef<unknown>(null);
  const [inferenceType, setInferenceType] = useState(null);

  const layerId = props.id;
  const tenantId = props.AllLayers[0].tenantId;

  useEffect(() => {
    let socketInstance: unknown = null;

    if (tenantId) {
      if (socket.current) {
        socket.current.disconnect();
      }

      socketInstance = io(
        `${API_URL}/stream/notification?tenantID=${tenantId}`
      );

      socket.current = socketInstance;

      socketInstance.on("AI_TASK", (data) => {
        console.log("AI_TASK:", data);
        if (data.status === "completed") {
          props.refreshVectorLayers(!props.refreshLayer);
        }
      });

      socketInstance.on("AI_TASK_PROGRESS", (data) => {
        console.log(data);
        const { inferId, progress } = data;
        setProgress(progress);

        if (progress === 100) {
          setProgress(0);
          setLoading(false);
          setStatus("Complete");
        }

        console.log(`Inference ${inferId} progress: ${progress}%`);
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [tenantId]);

  const menu = (
    <Menu onClick={({ key }) => invokeInference(key)}>
      <Menu.Item key="deepforest">Tree Count</Menu.Item>
      <Menu.Item key="rooftopsegmentation">Rooftop Segmentation </Menu.Item>
      {/* Add more inference types as needed */}
    </Menu>
  );

  const invokeInference = async (selectedInference) => {
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
            setProgress(0);
            setStatus("Complete");
            message.info("Inference task is already complete!");
          } else {
            message.success(
              `${selectedInference} inference has started successfully!`
            );
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

  const onChange = (checked: boolean) => {
    props.setTerrainMap(checked);
  };

  useEffect(() => {
    // Update content height and limit based on props.bottomBarHeight and props.type
    updateContentHeight(props.bottomBarHeight, props.type);
  }, [props.bottomBarHeight, props.type]);

  useEffect(() => {
    // Fetch raster details when the component mounts or props.shouldAttributeTableReload changes
    if (props.type === "raster") {
      fetchRasterDetails(props.id);
    } else if (props.type === "vector") {
      if (props.featureCount) {
        setState((prevState) => ({
          ...prevState,
          total: props.featureCount,
        }));
      }
      fetchJsonData();
    }
  }, [props.shouldAttributeTableReload]);

  useEffect(() => {
    // Fetch raster metadata when rasterDetails changes
    getRasterMetaData();
  }, [state.rasterDetails]);

  useEffect(() => {
    // Fetch GeoJSON data when page, limit, or filter options change
    fetchJsonData();
  }, [state.page, state.limit, props.flaggedFilter, props.unflaggedFilter]);

  const updateContentHeight = (bottomBarHeight: string, type: string) => {
    let contentHeight = "";
    let refresh = false;

    switch (bottomBarHeight) {
      case "240px":
        if (type === "vector") {
          contentHeight = "160px";
          refresh = true;
        } else {
          contentHeight = "100px";
        }
        break;

      case "480px":
        if (type === "vector") {
          contentHeight = "340px";
          refresh = true;
        } else {
          contentHeight = "340px";
        }
        break;

      case "540px":
        if (type === "vector") {
          contentHeight = "460px";
          refresh = true;
        } else {
          contentHeight = "400px";
        }
        break;

      case "700px":
        if (type === "vector") {
          contentHeight = "680px";
          refresh = true;
        } else {
          contentHeight = "550px";
        }
        break;

      case "900px":
        if (type === "vector") {
          contentHeight = "750px";
          refresh = true;
        } else {
          contentHeight = "750px";
        }
        break;

      default:
        break;
    }

    setState((prevState) => ({
      ...prevState,
      contentHeight,
      refresh,
    }));
  };

  const fetchRasterDetails = (id: string) => {
    setState((prevState) => ({ ...prevState, loading: true }));
    http
      .get(`${apis.GET_RASTER_DETAILS_BY_ID}`, { params: { id } })
      .then((result) => {
        if (result.data.status) {
          setState((prevState) => ({
            ...prevState,
            rasterDetails: result.data.data[0],
          }));
        } else {
          setState((prevState) => ({ ...prevState, error: true }));
        }
      })
      .catch((err) => {
        setState((prevState) => ({ ...prevState, error: true }));
        AxiosErrorHandler(err, logout);
      })
      .finally(() =>
        setState((prevState) => ({ ...prevState, loading: false }))
      );
  };

  const fetchJsonData = () => {
    setState((prevState) => ({
      ...prevState,
      isTableLoading: true,
    }));
    const payload = {
      id: props.id,
      page: state.page - 1,
      limit: state.limit,
    };
    const flagFilter = getFlaggedFilter();
    if (flagFilter !== undefined) {
      payload["isFlagged"] = flagFilter;
    }

    if (props.type === "vector") {
      http
        .patch(`${apis.GET_FEATURE_BY_LAYER}`, payload)
        .then((res) => {
          if (res.data.status) {
            setState((prevState) => ({
              ...prevState,
              total: res.data.total,
              trueTableData: res.data.data,
              tableData: updateTableColors(res.data.data),
              refresh: !prevState.refresh,
            }));
          }
        })
        .catch((err) => {
          AxiosErrorHandler(err, logout);
        })
        .finally(() =>
          setState((prevState) => ({
            ...prevState,
            isTableLoading: false,
          }))
        );
    }
  };

  const getFlaggedFilter = () => {
    if (props.flaggedFilter) {
      return props.flaggedFilter;
    } else if (props.unflaggedFilter) {
      return !props.unflaggedFilter;
    } else return undefined;
  };

  const updateTableColors = (records) => {
    return records.map((record) => {
      if (props.unflaggedFilter) {
        return record;
      }
      if (
        props.flaggedFilter ||
        props.AllLayers.find(
          (layer) => layer._id === props.id
        )?.flaggedFeatures.includes(record.index)
      ) {
        return {
          ...record,
          properties: {
            ...record.properties,
            color: props.invertColor(record.properties.color),
          },
        };
      }
      return record;
    });
  };

  const getRasterMetaData = () => {
    if (state.rasterDetails) {
      fetch(
        `${COG_URL}/cog/info?url=${TITILER_STATIC}/raster/${state.rasterDetails.fileName}`
      )
        .then((res) => res.json())
        .then((data) => {
          setState((prevState) => ({ ...prevState, rasterMetaData: data }));
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const setPaginationPage = (page: number) => {
    setState((prevState) => ({ ...prevState, page }));
  };

  const setPageLimit = (currPage: number, limit: number) => {
    setState((prevState) => ({ ...prevState, page: currPage, limit }));
  };

  function changeColor(value: string) {
    props.setColorMap(value);
  }

  function changeOverlay(value: string) {
    props.setOverlayID(props.id, value);
  }

  const rasterData = (
    // Render raster data UI
    <div style={{ width: "100%", padding: "5px" }}>
      {state.error && <div>Something went wrong!</div>}
      {!state.loading && !state.error ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            padding: "10px",
          }}
        >
          <div>
            <div>
              <Text>File Name: </Text>
              <Text type="secondary"> {state.rasterDetails?.fileName}</Text>
              <Text style={{ marginLeft: "40px" }}>Size: </Text>
              <Text type="secondary">
                {" "}
                {state.rasterDetails?.fileSize.toFixed(2)} MB
              </Text>
              <Select
                defaultValue="plasma"
                style={{ width: 120, float: "right", marginLeft: "12px" }}
                onChange={changeColor}
              >
                <Option value="plasma">plasma</Option>
                <Option value="cfastie">cfastie</Option>
                <Option value="rplumbo">rplumbo</Option>
                <Option value="schwarzwald">schwarzwald</Option>
                <Option value="viridis">viridis</Option>
                <Option value="inferno">inferno</Option>
                <Option value="magma">magma</Option>
                <Option value="cividis">cividis</Option>
                <Option value="hsv">hsv</Option>
              </Select>
            </div>
            <div style={{ marginTop: "5px" }}>
              <Text>MetaData:</Text>
              <div
                style={{
                  boxSizing: "border-box",
                  border: "1px solid gray",
                  height: state.contentHeight,
                  marginTop: "5px",
                  overflow: "auto",
                  padding: "10px",
                }}
              >
                <ReactJson
                  value={state.rasterMetaData || {}}
                  collapsed={true}
                  displayDataTypes={false}
                />
              </div>
            </div>
          </div>
          <div style={{ marginRight: "20rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "50px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Text>Terrain:</Text>
                <Switch onChange={onChange} />
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Text>3D-Overlay:</Text>
                <Switch
                  onChange={() => props.handleMeshSourceOption(props.id)}
                />
              </div>
            </div>
            <div style={{ marginTop: "20px" }}>
              {status === "Complete" ? (
                <p style={{ color: "green", fontWeight: "bold" }}>
                  {inferenceType} Inference : Complete
                </p>
              ) : (
                <Dropdown overlay={menu} trigger={["click"]}>
                  <Button loading={loading}>
                    <Space>
                      Select Inference
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              )}
              {loading && <Progress percent={progress} />}
            </div>
            <div style={{ marginTop: "1.1rem" }}>
              <Space size="large">
                <Text>Overlay: </Text>
                <Select
                  defaultValue="Select"
                  style={{ width: 120, float: "right" }}
                  onChange={changeOverlay}
                >
                  {filteredLayers.map((layer) => (
                    <Option key={layer.name} value={layer._id}>
                      {layer.name}
                    </Option>
                  ))}
                </Select>
              </Space>
            </div>
          </div>
        </div>
      ) : (
        !state.error && <Spin style={{ margin: "20px auto", width: "100%" }} />
      )}
    </div>
  );

  const table = (
    // Render vector attribute table UI
    <div style={{ height: "100%", overflow: "hidden" }}>
      {!state.isTableLoading ? (
        <FeatureTable
          id={props.id}
          bottomBarHeight={props.bottomBarHeight}
          contentHeight={state.contentHeight}
          tableData={state.tableData}
          allLayers={props.AllLayers}
          flaggedFilter={!!props.flaggedFilter}
          unflaggedFilter={!!props.unflaggedFilter}
          setPage={(page) => setState((prev) => ({ ...prev, page }))}
          page={state.page}
          setLimit={(limit) => setState((prev) => ({ ...prev, limit }))}
          limit={state.limit}
          setPaginationPage={setPaginationPage}
          setPageLimit={setPageLimit}
          total={Number(state.total)}
          setTotal={(total) => setState((prev) => ({ ...prev, total }))}
          setViewport={props.setViewport}
          setSelectedIndexes={props.setSelectedIndexes}
          setSelectedFeatures={props.setSelectedFeatures}
          defaultKeys={props.defaultKeys}
          selectedIndexes={props.selectedIndexes}
          canEditGeojson={props.canEditGeojson}
          canDeleteFeature={props.canDeleteFeature}
          updateFeatureCountInLayers={props.updateFeatureCountInLayers}
          setshowSelectedIndexes={props.setshowSelectedIndexes}
          setShouldAttributeTableReload={props.setShouldAttributeTableReload}
          shouldAttributeTableReload={props.shouldAttributeTableReload}
          refreshLayer={props.refreshLayer}
          setRefreshLayer={props.setRefreshLayer}
        />
      ) : (
        <Spin style={{ margin: "20px auto", width: "100%" }} />
      )}
    </div>
  );

  switch (props.type) {
    case "raster":
      return rasterData;
    case "vector":
      return table;
    default:
      return null;
  }
};

export default MapAttributes;
