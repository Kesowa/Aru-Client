import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Layout, Row, Col, Modal, Button, Typography, Result } from "antd";
import { useLocation, Switch, Route, useHistory } from "react-router-dom";

import { logout } from "../../actions/authAction";
import SideBar from "./SideBar";
import "./index.less";
import ProfileDrawer from "./Profile";
import { CloseCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import TermsAndCondition from "./utils/TnC";
import FallbackComponent from "./utils/Fallback";

function Dashboard(props: any) {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const { Paragraph, Text } = Typography;
  const [showProfile, setShowProfile] = useState(false);
  const history = useHistory();

  const toggleSideBar = () => {
    setSideBarCollapsed(!sideBarCollapsed);
  };

  //console.log(sideBarCollapsed);

  return (
    <Layout className="dashboard-container">
      {/* <Header toggleSideBar={toggleSideBar} /> */}
      <Row className="dashboard-content-container">
        <TermsAndCondition {...props} />
        <Col>
          <SideBar
            sideBarCollapsed={sideBarCollapsed}
            toggleSideBar={toggleSideBar}
            sidebarState={sideBarCollapsed}
            showProfileDrawer={setShowProfile}
          />
        </Col>
        <Col
          className={
            "dashboard-content-col" +
            (sideBarCollapsed
              ? " dashboadr-sidebar-collapsed"
              : " dashboard-sidebar-normal")
          }
        >
          <Layout.Content className="dasboard-content-wrapper">
            <div className="dashboard-content-inner">
              <ProfileDrawer
                visible={showProfile}
                userDetails={props.Auth}
                showProfile={setShowProfile}
              />
              <FallbackComponent
                {...props}
                setSideBarCollapsed={setSideBarCollapsed}
              />
            </div>
          </Layout.Content>
        </Col>
      </Row>
    </Layout>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});
export default connect(mapStateToProps, { logout })(Dashboard);
