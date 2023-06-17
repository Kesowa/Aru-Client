import React, { useState, useEffect } from "react";
import { Typography, Spin, Form, Input, Select } from "antd";
import ReactJson from "react-json-view";
import "../index.less";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import { logout } from "../../../actions/authAction";
import { connect } from "react-redux";
import FeatureTable from "./featureTable";
import { COG_URL, TITILER_STATIC } from "src/constants";

const { Text } = Typography;
const { Option } = Select;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "text";
  record: any;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

function MapAttributes(props) {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [rasterDetails, setRasterDetails] = useState<any>();
  const [rasterMetaData, setRasterMetaData] = useState<any>();
  const [trueTableData, setTrueTableData] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [contentHeight, setContentHeight] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState();
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    if (props.bottomBarHeight) {
      switch (props.bottomBarHeight) {
        case "240px":
          if (props.type === "vector") {
            setContentHeight("160px");
            setLimit(2);
            setRefresh(true);
          } else {
            setContentHeight("100px");
          }

          break;

        case "480px":
          if (props.type === "vector") {
            setContentHeight("340px");
            setLimit(8);
            setRefresh(true);
          } else {
            setContentHeight("340px");
          }
          break;
        case "540px":
          if (props.type === "vector") {
            setContentHeight("460px");
            setLimit(10);
            setRefresh(true);
          } else {
            setContentHeight("400px");
          }
          break;

        case "700px":
          if (props.type === "vector") {
            setContentHeight("680px");
            setLimit(14);
            setRefresh(true);
          } else {
            setContentHeight("550px");
          }

          break;

        case "900px":
          if (props.type === "vector") {
            setContentHeight("750px");
            setLimit(20);
            setRefresh(true);
          } else {
            setContentHeight("750px");
          }
          break;
      }
    }
  }, [props.bottomBarHeight, props.type]);

  useEffect(() => {
    console.log("weeeeeeeeeeeeeeeeee", props);
    if (props.type === "raster") {
      setLoading(true);
      http
        .get(`${apis.GET_RASTER_DETAILS_BY_ID}`, {
          params: { id: props.id },
        })
        .then((result) => {
          if (result.data.status) {
            setRasterDetails(result.data.data[0]);
            console.log("Raster details: ", result.data);
          } else {
            setError(true);
          }
        })
        .catch((err) => {
          setError(true);
          console.log(err);
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => setLoading(false));
    } else if (props.type == "vector") {
      if (props.featureCount) setTotal(props.featureCount);
      fetchJsonData();
    }
  }, [props.shouldAttributeTableReload]);

  useEffect(() => {
    getRasterMetaData();
  }, [rasterDetails]);

  useEffect(() => {
    fetchJsonData();
  }, [page, limit, props.flaggedFilter, props.unflaggedFilter]);

  //+++++++++++++++++++++++++++++++++++++++++ Fetching GeoJSON Data +++++++++++++++++++++++++++++++++++++
  const updateTableColors = (records) => {
    return records.map((record) => {
      console.log("record", record);
      if (props.selectedIndexes.includes(record.index)) {
        return {
          ...record,
          properties: { ...record.properties, color: "#ffaa00" },
        };
      }
      if (props.unflaggedFilter) {
        return record;
      }
      if (
        props.flaggedFilter ||
        props.allLayers[`1-${props.id}`]?.flaggedFeatures.includes(record.index)
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

  useEffect(() => {
    const updatedatedTable = updateTableColors(trueTableData);
    setTableData(updatedatedTable);
  }, [props.selectedIndexes]);

  const getFlaggedFilter = () => {
    if (props.flaggedFilter) {
      return props.flaggedFilter;
    } else if (props.unflaggedFilter) {
      return !props.unflaggedFilter;
    } else return undefined;
  };
  const fetchJsonData = () => {
    console.log("props.id", props.id);
    setIsTableLoading(true);
    const payload = {
      id: props.id,
      page: page - 1,
      limit: limit,
    };
    const flagFilter = getFlaggedFilter();
    if (flagFilter !== undefined) {
      payload["isFlagged"] = flagFilter;
    }

    if (props.type == "vector") {
      http
        .patch(`${apis.GET_FEATURE_BY_LAYER}`, payload)
        .then((res) => {
          console.log("Feature table response", res.data);
          if (res.data.status) {
            setTrueTableData(res.data.data);
            const data = updateTableColors(res.data.data);
            console.log("tableData", data);
            setTableData(data);
            props.setRefreshLayer(!props.refreshLayer);
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => setIsTableLoading(false));
    }
  };

  const getRasterMetaData = () => {
    if (rasterDetails) {
      fetch(
        `${COG_URL}/cog/metadata?url=${TITILER_STATIC}/raster/${rasterDetails.fileName}`
      )
        .then((res) => res.json())
        .then((data) => {
          setRasterMetaData(data);
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  useEffect(() => {}, [props.flaggedFilter]);
  const setPaginationPage = (page) => {
    setPage(page);
  };

  const setPageLimit = (currPage, limit) => {
    setPage(currPage);
    setLimit(limit);
  };
  function changeColor(value) {
    props.setColorMap(value);
  }
  //-----------Raster details rendering------------------------------
  const rasterData = (
    <div style={{ width: "100%", padding: "5px" }}>
      {error && <div>Something went wrong!</div>}
      {!loading && !error ? (
        <>
          <div>
            <Text>File Name: </Text>
            <Text type="secondary"> {rasterDetails?.fileName}</Text>
            <Text style={{ marginLeft: "40px" }}>Size: </Text>
            <Text type="secondary">
              {" "}
              {rasterDetails?.fileSize.toFixed(2)} MB
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
                height: contentHeight,
                marginTop: "5px",
                overflow: "auto",
                padding: "10px",
              }}
            >
              <ReactJson
                src={rasterMetaData}
                name={false}
                collapsed={true}
                displayDataTypes={false}
              />
            </div>
          </div>
        </>
      ) : (
        !error && <Spin style={{ margin: "20px auto", width: "100%" }} />
      )}
    </div>
  );

  //--------------Vector attribute table--------------------
  const table = (
    <div
      style={{
        height: "100%",
        overflow: "hidden",
      }}
    >
      {!isTableLoading ? (
        <FeatureTable
          id={props.id}
          bottomBarHeight={props.bottomBarHeight}
          contentHeight={contentHeight}
          tableData={tableData}
          allLayers={props.allLayers}
          flaggedFilter={props.flaggedFilter}
          unflaggedFilter={props.unflaggedFilter}
          setPage={setPage}
          page={page}
          setLimit={setLimit}
          limit={limit}
          setPaginationPage={setPaginationPage}
          setPageLimit={setPageLimit}
          total={total}
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
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { logout })(MapAttributes);
