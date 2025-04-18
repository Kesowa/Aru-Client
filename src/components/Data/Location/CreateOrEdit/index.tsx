import { useContext, useEffect, useState } from "react";
import LocationMap from "../Map";
import "../../index.less";
import { Card, Typography, message } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import LocationCreateOrEditForm from "./Form";
import http from "src/services/httpCall";
import apis from "src/services/apis";
import { AxiosErrorHandler } from "src/services/httpErrorHandle";
import { useParams } from "react-router-dom";
import { AuthContext } from "src/services/authUtils";

type CreateOrEditLocationProps = {
  isEditing: boolean;
};

function CreateOrEditLocation(props: Readonly<CreateOrEditLocationProps>) {
  const [areaSelected, setAreaSelected] = useState(false);
  const [drawingToolBtns, setDrawingToolBtns] = useState(false);
  const [polygonData, setPolygonData] = useState<{
    area: number;
    length: number;
    points: any;
  } | null>(null);
  const [geolocation, setGeolocation] = useState("");
  const { id } = useParams<any>();
  const [locationToEdit, setLocationToEdit] = useState(null);
  const { Title } = Typography;

  const { logout } = useContext(AuthContext);

  const mapProps: any = {
    areaSelected,
    setAreaSelected,
    drawingToolBtns,
    setDrawingToolBtns,
    polygonData,
    setPolygonData,
    setGeolocation,
    isEditing: props.isEditing,
    locationToEdit,
  };

  const getLocation = (id: string) => {
    http
      .get(`${apis.GET_LOCATION_BY_ID}`, {
        params: { id },
      })
      .then((result) => {
        if (result.data.data) {
          setLocationToEdit(result.data.data);
          setAreaSelected(true);
        }
      })
      .catch((err) => {
        message.error("Locations could not be fetched");
        AxiosErrorHandler(err, logout);
      });
  };

  useEffect(() => {
    if (props.isEditing && id) {
      getLocation(id);
    }
  }, []);

  return (
    <>
      <div className="edit-location-header">
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.2rem" }}>
          {props.isEditing ? "Edit" : "Create"} Location
        </h1>
        <p>
          You can {props.isEditing ? "edit" : "create"} geofence based on a real
          location for monitoring data influx
        </p>
      </div>
      <div
        className="create-location-container"
        style={{ position: "absolute", left: 0, right: 0 }}
      >
        {(!props.isEditing || (props.isEditing && locationToEdit)) && (
          <>
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
                    &nbsp;&nbsp;{props.isEditing ? "Edit" : "Create"} location
                  </Title>
                </div>
                <LocationCreateOrEditForm
                  areaSelected={areaSelected}
                  setAreaSelected={setAreaSelected}
                  geoData={polygonData}
                  setPolygonData={setPolygonData}
                  geolocation={geolocation}
                  isEditing={props.isEditing}
                  locationToEdit={locationToEdit}
                />
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default CreateOrEditLocation;
