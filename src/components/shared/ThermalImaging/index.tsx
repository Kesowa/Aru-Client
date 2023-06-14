import {useState, useEffect, useRef} from "react"
import { Modal, Tooltip } from "antd";
import ReactCursorPosition, { INTERACTIONS } from 'react-cursor-position';
import ThermalImage from "./thermalImage";
import "./index.less";
import { API_URL } from "src/constants";
import http from "src/services/httpCall";
import apis from "src/services/apis";

const ThermalImaging = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [thermalData, setThermalData] = useState<any>([]);
    const thermalImagingData = async ({id, doc}) => {
        let thermalData = (await http.post(apis.THERMAL_DATA, {id, doc}));
        let rawFile = (await fetch(API_URL+thermalData.data.rawFilePath));
        const rawBlob = await rawFile.blob();
        let rawArray =  new Float32Array(await rawBlob.arrayBuffer())
        setThermalData(rawArray)
        console.log("thermal", thermalData.data.rawFilePath, rawArray);
      };
    useEffect(()=>{
        if (Object.keys(props.thermalPayload).length>0){
            thermalImagingData(props.thermalPayload)
        } else {
            setThermalData([])
        }   
    },[props.thermalPayload])
    useEffect(()=>{
        if(thermalData.length>0){
            setIsModalOpen(true);
        } else {
            setIsModalOpen(false);
            
        }
    },[thermalData])
    const handleCancel = () => {
        props.setThermalPayload({})
    };
    return (
    <>
        <Modal className="thermalViewModal" centered title="Thermal View" width={'fit-content'} footer={null} open={isModalOpen} onCancel={handleCancel}>
        {"filePath" in props.thermalPayload && <ReactCursorPosition
        activationInteractionMouse={INTERACTIONS.HOVER}>
            <ThermalImage filePath={props.thermalPayload?.filePath} data={thermalData}/>
        </ReactCursorPosition>}
        </Modal>
    </>)
}

export default ThermalImaging;
