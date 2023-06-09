import React, {useState, useEffect, useRef, createRef} from "react";
import { STATIC_URL } from "src/constants";
import "rsuite/dist/rsuite.min.css";
import { Tooltip, Whisper } from "rsuite";

const ThermalImage = (props)=>{
    const [temperature, setTemperature] = useState("")
    const {
        detectedEnvironment: {
            isMouseDetected = false,
            isTouchDetected = false
        } = {},
        elementDimensions: {
            width = 0,
            height = 0
        } = {},
        position: {
            x = 0,
            y = 0
        } = {},
        isActive = false,
        isPositionOutside = false
    } = props;
    useEffect(()=>{
        if(!isPositionOutside){
            let temperature = props.data[x + width*y]
            setTemperature(temperature)
        } else {
            setTemperature("")
        }
    },[x,y,isPositionOutside])
    return(<>
        <Whisper
            followCursor
            open={temperature?true:false}
            speaker={<Tooltip>
                {temperature&&`${parseFloat(temperature).toFixed(2)}°C`}
            </Tooltip>}
            placement={x<width/2?"right":"left"}
            trigger="hover"
           
        >
            <img src={`${STATIC_URL}${props.filePath}`}/>
        </Whisper>
        </>
    )
}

export default ThermalImage;