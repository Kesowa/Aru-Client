// MapAttributes.tsx

import React, { useState, useEffect } from "react";
import { Typography, Spin, Select } from "antd";
import ReactJson from "react-json-view";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { logout } from "../../../actions/authAction";
import { connect } from "react-redux";
import FeatureTable from "./featureTable";
import { COG_URL, TITILER_STATIC } from "src/constants";

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
  logout: () => void;
  setViewport: (viewport: any) => void;
  setSelectedIndexes: (indexes: number[]) => void;
  defaultKeys: any;
  selectedIndexes: number[];
  setColorMap: (color: string) => void;
  allLayers: any;
  canEditGeojson: boolean;
  canDeleteFeature: boolean;
  updateFeatureCountInLayers: (id: string, count: number) => void;
  setshowSelectedIndexes: (show: boolean) => void;
  setKey: (key: number) => void;
  setShouldAttributeTableReload: (reload: boolean) => void;
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
    rasterDetails: null,
    rasterMetaData: null,
    trueTableData: [],
    tableData: [],
    loading: false,
    error: false,
    contentHeight: "",
    page: 1,
    limit: 10,
    total: undefined,
    refresh: false,
  };

  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    // Update content height and limit based on props.bottomBarHeight and props.type
    updateContentHeightAndLimit(props.bottomBarHeight, props.type);
  }, [props.bottomBarHeight, props.type]);

  useEffect(() => {
    // Fetch raster details when the component mounts or props.shouldAttributeTableReload changes
    if (props.type === "raster") {
      fetchRasterDetails(props.id);
    } else if (props.type === "vector") {
      if (props.featureCount) setTotal(props.featureCount);
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

  useEffect(() => {
    // Update table data colors when selectedIndexes change
    updateTableColors();
  }, [props.selectedIndexes]);

  const updateContentHeightAndLimit = (
    bottomBarHeight: string,
    type: string
  ) => {
    let contentHeight = "";
    let limit = 10;
    let refresh = false;

    switch (bottomBarHeight) {
      case "240px":
        if (type === "vector") {
          contentHeight = "160px";
          limit = 2;
          refresh = true;
        } else {
          contentHeight = "100px";
        }
        break;

      case "480px":
        if (type === "vector") {
          contentHeight = "340px";
          limit = 8;
          refresh = true;
        } else {
          contentHeight = "340px";
        }
        break;

      case "540px":
        if (type === "vector") {
          contentHeight = "460px";
          limit = 10;
          refresh = true;
        } else {
          contentHeight = "400px";
        }
        break;

      case "700px":
        if (type === "vector") {
          contentHeight = "680px";
          limit = 14;
          refresh = true;
        } else {
          contentHeight = "550px";
        }
        break;

      case "900px":
        if (type === "vector") {
          contentHeight = "750px";
          limit = 20;
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
      limit,
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
          setError(true);
        }
      })
      .catch((err) => {
        setError(true);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => setLoading(false));
  };

  const fetchJsonData = () => {
    setIsTableLoading(true);
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
              trueTableData: res.data.data,
              tableData: updateTableColors(res.data.data),
              refresh: !prevState.refresh,
            }));
          }
        })
        .catch((err) => {
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => setIsTableLoading(false));
    }
  };

  const getFlaggedFilter = () => {
    if (props.flaggedFilter) {
      return props.flaggedFilter;
    } else if (props.unflaggedFilter) {
      return !props.unflaggedFilter;
    } else return undefined;
  };

  const updateTableColors = () => {
    // Implement the logic to update table data colors based on selectedIndexes and filters
    // ...
    setState((prevState) => ({ ...prevState, tableData: updatedTableData }));
  };

  const getRasterMetaData = () => {
    if (state.rasterDetails) {
      fetch(
        `${COG_URL}/cog/metadata?url=${TITILER_STATIC}/raster/${state.rasterDetails.fileName}`
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

  const rasterData = (
    // Render raster data UI
    <div style={{ width: "100%", padding: "5px" }}>
      {state.error && <div>Something went wrong!</div>}
      {!state.loading && !state.error ? (
        <>
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
              style={{ width: 120, float: "right" }}
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
                src={state.rasterMetaData}
                name={false}
                collapsed={true}
                displayDataTypes={false}
              />
            </div>
          </div>
        </>
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
          allLayers={props.allLayers}
          flaggedFilter={props.flaggedFilter}
          unflaggedFilter={props.unflaggedFilter}
          setPage={setPage}
          page={state.page}
          setLimit={setLimit}
          limit={state.limit}
          setPaginationPage={setPaginationPage}
          setPageLimit={setPageLimit}
          total={state.total}
          setTotal={setTotal}
          setViewport={props.setViewport}
          setSelectedIndexes={props.setSelectedIndexes}
          defaultKeys={props.defaultKeys}
          selectedIndexes={props.selectedIndexes}
          canEditGeojson={props.canEditGeojson}
          canDeleteFeature={props.canDeleteFeature}
          updateFeatureCountInLayers={props.updateFeatureCountInLayers}
          setshowSelectedIndexes={props.setshowSelectedIndexes}
          setKey={props.setKey}
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

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { logout })(MapAttributes);
