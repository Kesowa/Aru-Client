import { useEffect } from "react";
import { Button, Row, Col, Card, Avatar } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { clearMissionCreationStateWithGeoFence } from "../../../../actions/missionCreation";
import "../index.less";

const { Meta } = Card;

function StageOne(props: any) {
  const { formData, setFormData } = props;

  const { isLoading } = props;
  const { missionTypes } = props;

  const { nextStage } = props;

  const updateSelectedJobType = (jobType: string, name: string) => {
    setFormData((oldData: any) => ({ ...oldData, typeName: name, jobType }));
  };

  useEffect(() => {
    props.clearMissionCreationStateWithGeoFence();
  }, []);

  return (
    <div className="stage_one">
      <Row align="middle" justify="center">
        <Col>
          {missionTypes.map((d: any) => (
            <Card
              key={d._id}
              onClick={() => updateSelectedJobType(d._id, d.name)}
              className={`create-mission-extended-card ${
                formData.jobType === d._id
                  ? "create-mission-extended-card-selected"
                  : ""
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
                title={d.name}
                description={d.description}
              />
            </Card>
          ))}

          <Button
            className="create-mission-proceed-button"
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
}

export default connect(() => {}, {
  clearMissionCreationStateWithGeoFence,
})(StageOne);
