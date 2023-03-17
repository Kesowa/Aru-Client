import React, { useState } from "react";
import LocationMap from "../Map";
import "../../index.less";
import { Card, Typography, Collapse } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import LocationEditForm from "./Form";

function EditLocation(props) {
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
          Edit Location
        </h1>
        <p>
          You can edit existing geofence based on a real location for monitoring
          data influx
        </p>
      </div>
      <div
        className="edit-location-container"
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
                &nbsp;&nbsp;Edit location
              </Title>
            </div>
            <LocationEditForm
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

export default EditLocation;
