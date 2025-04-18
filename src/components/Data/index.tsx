import { useState } from "react";

import { Link } from "react-router-dom";
import { Button, Tabs, Badge } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { PlusCircleOutlined } from "@ant-design/icons";
import DataMission from "./Mission";
import DataLocation from "./Location";

function DataList() {
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

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: (
              <span>
                Completed{" "}
                <Badge
                  style={{ backgroundColor: "#3D85FC" }}
                  count={missionCount}
                />
              </span>
            ),
            children: <DataMission setMissionCount={setMissionCount} />,
          },
          {
            key: "2",
            label: "Location",
            children: <DataLocation />,
          },
        ]}
      ></Tabs>
    </div>
  );
}

export default DataList;
