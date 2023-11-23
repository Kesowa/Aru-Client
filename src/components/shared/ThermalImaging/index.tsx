import { useState, useEffect, useRef } from "react";
import { Button, Modal, message, Input } from "antd";
import ReactCursorPosition, { INTERACTIONS } from "react-cursor-position";
import ThermalImage from "./thermalImage";
import "./index.less";
import { STATIC_URL } from "src/constants";
/* import http from "src/services/httpCall";
import apis from "src/services/apis"; */
import { Space, Table, Tag } from "antd";
import apis from "../../../services/apis";
import http from "../../../services/httpCall";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";

interface DataType {
  // index: number;
  label: string;
  pixel_position: string;
  color: string;
  temp: number;
}

const ThermalImaging = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thermalData, setThermalData] = useState<any>([]);
  const [tableData, setTableData] = useState([]);
  const tableDataRef = useRef([]); // Initialize with an empty array
  const [isLoading, setMissionsLoading] = useState(false);
  const [isFetching, setFetch] = useState(false);
  const [xValues, setXValues] = useState([]);
  const [latestData, setLatestData] = useState(null);

  const thermalImagingData = async ({ id, doc }) => {
    try {
      const thermalData = await http.get(apis.THERMAL_DATA, {
        params: { id, doc },
      });
      const rawFile = await fetch(STATIC_URL + thermalData.data.data.data.file);
      const rawBlob = await rawFile.blob();
      const rawArray = new Float32Array(await rawBlob.arrayBuffer());
      setThermalData(rawArray);
      console.log("thermal", thermalData.data.rawFilePath, rawArray);
    } catch (err) {
      console.error(err);
      message.info("Selected image does not have a thermal view.");
    }
  };

  const sendPixelDataToDatabase = async () => {
    const dataToAdd = {
      id: props.thermalPayload.id,
      doc: props.thermalPayload.doc,
      table: tableData,
    };

    await http
      .post(`${apis.CREATE_THERMALTABLE}`, dataToAdd)
      .then((result) => {
        if (result.data.status) {
          message.success("Data point added Successfully");
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(err.message);
        AxiosErrorHandler(err, props.logout);
      });
  };

  const fetchTableData = async ({ id, doc }) => {
    setMissionsLoading(true);

    await http
      .get(apis.GET_THERMALPOINT, { params: { id, doc } })
      .then((res) => {
        // console.log(res.data.data.data);
        const tableDataResponse = res.data.data.data.table;
        console.log("tableDataResponse", tableDataResponse); // Assuming the response data matches your table data format
        // tableDataRef.current = tableDataResponse;
        setTableData(tableDataResponse);
        console.log(tableData);
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setMissionsLoading(false);
        setFetch(false);
      });
  };

  useEffect(() => {
    if (Object.keys(props.thermalPayload).length > 0) {
      thermalImagingData(props.thermalPayload);
      fetchTableData(props.thermalPayload);
    } else {
      setThermalData([]);
    }
  }, [props.thermalPayload]);
  useEffect(() => {
    if (thermalData.length > 0) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [thermalData]);
  const handleCancel = () => {
    props.setThermalPayload({});
  };

  const handlePixelClick = async (dataToAdd) => {
    setLatestData(dataToAdd);
  };

  useEffect(() => {
    // This effect will run whenever xValues changes
    // You can call dummy_data here or inside handlePixelClick
    if (latestData) {
      const { x, y } = latestData;
      console.log(latestData);
      const isDuplicate__xValues = xValues.some(
        (item) => item.x === x && item.y === y
      );
      const isDuplicate__tabledata = tableData.some(
        (item) => item.x === x && item.y === y
      );
      if (!isDuplicate__xValues || !isDuplicate__tabledata) {
        // If not a duplicate, add the new dataToAdd to tableData
        setTableData((prevTableData) => [...prevTableData, latestData]);
        setXValues((prevXValues) => [...prevXValues, { x, y }]);
      }
    }
    console.log("xValues updated:", xValues);
  }, [xValues, latestData]);

  const handleDelete = (record) => {
    // Filter out the record to be deleted from the tableDataRef

    const updatedTableData = tableData.filter(
      (item) => item.x !== record.x && item.y !== record.y
    );
    setTableData(updatedTableData);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Pixel Position",
      dataIndex: "pixel_position",
      key: "pixel_position",
      render: (text, record) => (
        <div>
          {record.x} x {record.y}
        </div>
      ),
    },
    {
      title: "Pixel Color",
      dataIndex: "color",
      key: "color",
      render: (text, record) => (
        <div>
          <div
            style={{ backgroundColor: text, width: "1rem", height: "1rem" }}
          ></div>
        </div>
      ),
    },
    {
      title: "Temperature",
      key: "temp",
      dataIndex: "temp",
      render: (text) => <div>{parseFloat(text).toFixed(2)}°C</div>,
    },
    {
      title: "Label",
      render: (text, record) => (
        <Input
          style={{ width: "100%" }}
          // value={tableData[record.label]}
          // onChange={(e) => {
          //   const updatedLabels = { ...tableData, [record.label]: e.target.value };
          //   setTableData(updatedLabels);
          // }}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleDelete(record)}>Delete</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        className="thermalViewModal"
        centered
        title="Thermal View"
        width={"fit-content"}
        footer={null}
        open={isModalOpen}
        onCancel={handleCancel}
      >
        {"filePath" in props.thermalPayload && (
          <div className="diff__modal">
            <ReactCursorPosition
              activationInteractionMouse={INTERACTIONS.HOVER}
            >
              <ThermalImage
                filePath={props.thermalPayload?.filePath}
                data={thermalData}
                onPixelClick={handlePixelClick}
              />
            </ReactCursorPosition>
            <div
              className="widget"
              style={{ marginRight: "10px", padding: "1rem" }}
            >
              <Table
                columns={columns}
                dataSource={tableData}
                size="small"
                style={{ cursor: "pointer", minHeight: "450px" }}
                pagination={{ pageSize: 7 }}
              />
              <Button
                type="primary"
                size={"large"}
                onClick={sendPixelDataToDatabase}
              >
                Submit
              </Button>{" "}
              {/* Use tableData as the data source */}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ThermalImaging;
//Screen -D -r code-changes
