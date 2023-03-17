import React, { useState } from "react";
import LocationMap from "../Map";
import "../../index.less";
import { Card, Typography, Collapse } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import LocationCreateForm from "./Form";

function CreateLocation(props) {
  const [areaSelected, setAreaSelected] = useState(false);
  const [drawingToolBtns, setDrawingToolBtns] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const { Panel } = Collapse;
  const { Title } = Typography;

  const mapProps: any = {
    areaSelected,
    setAreaSelected,
    drawingToolBtns,
    setDrawingToolBtns,
  };

  return (
    <>
      <div className="edit-location-header">
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.2rem" }}>
          Create Location
        </h1>
        <p>
          You can create geofence based on a real location for monitoring data
          influx
        </p>
      </div>
      <div
        className="create-location-container"
        style={{ position: "absolute", left: 0, right: 0 }}
      >
        <LocationMap {...mapProps} />
        <div className="form-container">
          <Card
            bordered={false}
            className="mission_creation_form"
            style={{ maxHeight: "98%" }}
            id="data_nested_card_content"
          >
            <div>
              <Title className="panel-title" level={5}>
                <InfoCircleFilled />
                &nbsp;&nbsp;Create location
              </Title>
            </div>
            <LocationCreateForm
              setFormComplete={setFormComplete}
              areaSelected={areaSelected}
              setAreaSelected={setAreaSelected}
            />
          </Card>
        </div>
      </div>
    </>
  );
}

export default CreateLocation;
