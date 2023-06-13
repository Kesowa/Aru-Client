import { useState, useEffect } from "react";
import { Modal } from "antd";
import ReactCursorPosition, { INTERACTIONS } from "react-cursor-position";
import ThermalImage from "./thermalImage";
import "./index.less";
import { API_URL } from "src/constants";
import http from "src/services/httpCall";
import apis from "src/services/apis";

const ThermalImaging = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thermalData, setThermalData] = useState<any>([]);
  const thermalImagingData = async (filePath: any) => {
    const body = JSON.stringify({ filePath });
    console.log("thermal filePath", filePath, body, apis.THERMAL_DATA);
    const thermalData = await http.post(apis.THERMAL_DATA, { filePath });
    const rawFile = await fetch(API_URL + thermalData.data.rawFilePath);
    const rawBlob = await rawFile.blob();
    const rawArray = new Float32Array(await rawBlob.arrayBuffer());
    setThermalData(rawArray);
    console.log("thermal", thermalData.data.rawFilePath, rawArray);
  };
  useEffect(() => {
    if (props.filePath) {
      thermalImagingData(props.filePath);
    } else {
      setThermalData([]);
    }
  }, [props.filePath]);
  useEffect(() => {
    if (thermalData.length > 0) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [thermalData]);
  const handleCancel = () => {
    props.setFilePath("");
  };
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
        {props.filePath && (
          <ReactCursorPosition activationInteractionMouse={INTERACTIONS.HOVER}>
            <ThermalImage filePath={props.filePath} data={thermalData} />
          </ReactCursorPosition>
        )}
      </Modal>
    </>
  );
};

export default ThermalImaging;
