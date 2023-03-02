import React, { useState, useEffect } from "react";
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
import { connect } from "react-redux";

const { Step } = Steps;

function CreateMissionBase(props: any) {
  const [currentStage, setCurrentStage] = useState(0);
  const [formData, setFormData] = useState<any>({
    jobType: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [missionTypes, setMissionTypes] = useState([]);
  const [areaSelected, setAreaSelected] = useState(false);
  const [drawingToolBtns, setDrawingToolBtns] = useState(false);
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
    <div className="create-mission-container">
      {currentStage == 0 ? (
        <h1 className="create-mission-base-title">Create a Mission</h1>
      ) : (
        <></>
      )}

      {currentStage === 1 && <GoogleMap {...mapProps} />}
      <div
        className="create-mission-steps-card-holder"
        style={{
          top: currentStage === 1 ? "-40px" : "50px",
          boxShadow:
            currentStage == 1
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
          //style={{width:'80%'}}
        >
          {steps.map((item) => (
            <Step key={item.title} description={item.title} />
          ))}
        </Steps>
      </div>

      <div className="steps-content">{steps[currentStage].content}</div>
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    userType: state.Auth.userdetails.userType,
    refresh: state.Missions.refresh,
  };
};
export default connect(mapStateToProps, {
  logout,
})(CreateMissionBase);
