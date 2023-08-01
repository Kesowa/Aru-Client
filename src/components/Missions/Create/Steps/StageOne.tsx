import React, { useEffect, FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Button, Row, Col, Card, Avatar } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import { clearMissionCreationStateWithGeoFence } from "../../../../actions/missionCreation";
import "../index.less";

const { Meta } = Card;

interface MissionType {
  _id: string;
  name: string;
  description: string;
}

interface StageOneProps extends PropsFromRedux {
  formData: any; // Replace with the appropriate type for formData
  setFormData: (data: any) => void; // Replace with the appropriate type for setFormData
  isLoading: boolean;
  missionTypes: MissionType[];
  nextStage: Function;
}

const StageOne: FC<StageOneProps> = ({
  formData,
  setFormData,
  isLoading,
  missionTypes,
  nextStage,
  clearMissionCreationStateWithGeoFence,
}) => {
  const updateSelectedJobType = (jobType: string, name: string) => {
    setFormData((oldData: any) => ({ ...oldData, typeName: name, jobType }));
  };

  useEffect(() => {
    clearMissionCreationStateWithGeoFence();
  }, []);

  return (
    <div className="stage_one">
      <Row align="middle" justify="center">
        <Col>
          {missionTypes.map((missionType: MissionType) => (
            <Card
              key={missionType._id}
              onClick={() =>
                updateSelectedJobType(missionType._id, missionType.name)
              }
              className={`card-secondary ${
                formData.jobType === missionType._id ? "selected" : ""
              }`}
              loading={isLoading}
              hoverable
            >
              <Meta
                avatar={
                  <Avatar
                    size={50}
                    icon={<VideoCameraOutlined />}
                    style={{ backgroundColor: "transparent", color: "black" }}
                  />
                }
                title={missionType.name}
                description={missionType.description}
              />
            </Card>
          ))}

          <Button
            className="button-block"
            type="primary"
            onClick={() => nextStage()}
            disabled={formData.jobType === ""}
          >
            Get to next stage
          </Button>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  isLoading: state.Loader.loading_active,
});

const connector = connect(() => ({}), {
  clearMissionCreationStateWithGeoFence,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(StageOne);
