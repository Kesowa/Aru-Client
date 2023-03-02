import React, { useState } from "react";

import { Link, useHistory } from "react-router-dom";
import { PageHeader, Button, Tabs, Badge } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import DataMission from "./Mission";
import DataLocation from "./Location";

const { TabPane } = Tabs;

function DataList() {
  const [displayedDataType, setDisplayedDataType] = useState("1");
  const history = useHistory();
  const [missionCount, setMissionCount] = useState(0);

  return (
    <div style={{ padding: "24px" }}>
      <PageHeader
        onBack={() => window.history.back()}
        title="My Data"
        className="site-page-header-responsive"
        subTitle="Here you will find all the data captured from your missions!"
        extra={[
          <Link to="/dashboard/data/locations/create" key="1">
            <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
              Create location
            </Button>
          </Link>,
        ]}
      />

      <Tabs defaultActiveKey="1" onChange={(key) => setDisplayedDataType(key)}>
        <TabPane
          tab={
            <span>
              Completed{" "}
              <Badge
                style={{ backgroundColor: "#3D85FC" }}
                count={missionCount}
              />
            </span>
          }
          key="1"
        >
          <DataMission setMissionCount={setMissionCount} />
        </TabPane>
        <TabPane tab="Location" key="2">
          <DataLocation />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default DataList;
