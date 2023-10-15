import { useState, useEffect, useRef } from "react";
import { Modal, message } from "antd";
import ReactCursorPosition, { INTERACTIONS } from "react-cursor-position";
import ThermalImage from "./thermalImage";
import "./index.less";
import { STATIC_URL } from "src/constants";
/* import http from "src/services/httpCall";
import apis from "src/services/apis"; */
import { Space, Table, Tag } from 'antd';
import apis from "../../../services/apis";
import http from "../../../services/httpCall";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";

interface DataType {
  index: number;
  pixel_position: string;
  color: string;
  temperature: number;
}



const ThermalImaging = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thermalData, setThermalData] = useState<any>([]);
  const [tableData, setTableData] = useState([]);
  const tableDataRef = useRef([]);
  const thermalImagingData = async ({ id, doc }) => {
    try {
      const thermalData = await http.post(apis.THERMAL_DATA, { id, doc });
      const rawFile = await fetch(STATIC_URL + thermalData.data.rawFilePath);
      const rawBlob = await rawFile.blob();
      const rawArray = new Float32Array(await rawBlob.arrayBuffer());
      setThermalData(rawArray);
      console.log("thermal", thermalData.data.rawFilePath, rawArray);
    } catch (err) {
      message.info("Selected image does not have a thermal view.");
    }
  };
  
  const fetchTableData = () => {
    setMissionsLoading(true);

    http
      .get(apis.GET_ALL_THERMALPOINT)
      .then((res) => {
        console.log(res.data);
        const tableDataResponse = res.data; // Assuming the response data matches your table data format
        tableDataRef.current = tableDataResponse;
        setTableData([...tableDataRef.current]);
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
      fetchTableData();
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
  const handlePixelClick = (dataToAdd) => {

    tableDataRef.current.push(dataToAdd); 
    setTableData([...tableDataRef.current]);
  };
  const handleDelete = (record) => {
    // Filter out the record to be deleted from the tableDataRef
    tableDataRef.current = tableDataRef.current.filter((item) => item.index !== record.index);
    setTableData([...tableDataRef.current]);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'Index',
      dataIndex: 'index',
      key: 'index',
    /*   render: (text) => <a>{text}</a>, */
    },
    {
      title: 'Pixel Position',
      dataIndex: 'pixel_position',
      key: 'pixel_position',
      render: (text, record) => (
        <div>
          {record.posX} x {record.posY}
        </div>
      ),
    },
    {
      title: 'Pixel Color',
      dataIndex: 'color',
      key: 'color',
      render: (text, record) => (
        <div>
          <div style={{ backgroundColor: text , width : '1rem', height : '1rem' }} ></div>
          
        </div>
      ),
    },
    {
      title: 'Temperature',
      key: 'temperature',
      dataIndex: 'temperature',
      render: (text) => <div>{parseFloat(text).toFixed(2)}°C</div>
    },
    {
      title: 'Action',
      key: 'action',
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
          <ReactCursorPosition activationInteractionMouse={INTERACTIONS.HOVER} >
 
            <ThermalImage
              filePath={props.thermalPayload?.filePath}
              data={thermalData}
              onPixelClick={handlePixelClick}
            />

             
          </ReactCursorPosition>
           <div className="widget" style={{ marginRight: "10px", padding: "1rem" }}>
           <Table columns={columns} dataSource={tableData} size="small" /> {/* Use tableData as the data source */}
         </div>
         </div>
        )}
      </Modal>
    </>
  );
};

export default ThermalImaging;