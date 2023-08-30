import { useState, useEffect, FC } from "react";
import { Steps, message } from "antd";
import "./index.less";
import StageOne from "./Steps/StageOne";
import StageTwo from "./Steps/StageTwo";
import StageThree from "./Steps/StageThree";

import apis from "../../../services/apis";
import http from "../../../services/httpCall";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import GoogleMap from "../GoogleMap";
import { logout } from "../../../actions/authAction";
import { connect, ConnectedProps } from "react-redux";

type CreateMissionBaseProps = PropsFromRedux;

const CreateMissionBase: FC<CreateMissionBaseProps> = (props) => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [formData, setFormData] = useState<any>({
    jobType: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [missionTypes, setMissionTypes] = useState<any[]>([]);
  const [areaSelected, setAreaSelected] = useState<boolean>(false);
  const [drawingToolBtns, setDrawingToolBtns] = useState<boolean>(false);
  const [location, setlocation] = useState<any>({});

  const mapProps: any = {
    areaSelected,
    setAreaSelected,
    drawingToolBtns,
    setDrawingToolBtns,
    setlocation,
  };

  useEffect(() => {
    http
      .get(apis.GET_ALL_MISSION_TYPES)
      .then((result) => {
        if (result.data.status) {
          setMissionTypes(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const steps = [
    {
      title: "Type of Job",
      content: (
        <StageOne
          missionTypes={missionTypes}
          isLoading={isLoading}
          nextStage={() => setCurrentStage(1)}
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
    {
      title: "Schedule Flight",
      content: (
        <StageTwo
          areaSelected={areaSelected}
          setAreaSelected={setAreaSelected}
          nextStage={() => setCurrentStage(2)}
          prevStage={() => setCurrentStage(0)}
          location={location}
          setlocation={setlocation}
        />
      ),
    },
    {
      title: "Review",
      content: (
        <StageThree
          missionType={formData.jobType}
          jobTypeName={formData.typeName}
          prevStage={() => setCurrentStage(1)}
        />
      ),
    },
  ];

  return (
    <div className="container-full">
      {currentStage === 0 ? (
        <h1 className="text-center">Create a Mission</h1>
      ) : null}

      {currentStage === 1 && <GoogleMap {...mapProps} />}
      <div
        className="card-base"
        style={{
          top: currentStage === 1 ? "-40px" : "50px",
          boxShadow:
            currentStage === 1
              ? "0px 2px 10px #00000028"
              : "0px 0px 0px #00000028",
        }}
      >
        <Steps
          current={currentStage}
          size="small"
          labelPlacement="vertical"
          onChange={(current) => {
            if (formData.jobType === "") {
              message.error("Please set a Type of job to proceed");
              return;
            }
            setCurrentStage(current);
          }}
          items={steps.map((item) => {
            return {
              title: item.title,
            };
          })}
        />
      </div>

      <div className="steps-content">{steps[currentStage].content}</div>
    </div>
  );
};

// Map state to props
const mapStateToProps = (state: any) => ({
  userType: state.Auth.userdetails.userType,
  refresh: state.Missions.refresh,
});

// Connect component to Redux store
const connector = connect(mapStateToProps, {
  logout,
});

// Define type for props received from redux
type PropsFromRedux = ConnectedProps<typeof connector>;

// Export the connected component
export default connector(CreateMissionBase);
