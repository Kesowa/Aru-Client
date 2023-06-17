import { useState, Suspense, lazy } from "react";
import { connect } from "react-redux";
import { Layout, Row, Col, Typography, Space, Spin } from "antd";
import { useHistory } from "react-router-dom";

import { logout } from "../../actions/authAction";
import "./index.less";
import TermsAndCondition from "./utils/TnC";
import SideBar from "./SideBar";
const ProfileDrawer = lazy(() => import("./Profile"));
const FallbackComponent = lazy(() => import("./utils/Fallback"));

function Dashboard(props: any) {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const { Paragraph, Text } = Typography;
  const [showProfile, setShowProfile] = useState(false);
  const history = useHistory();

  const toggleSideBar = () => {
    setSideBarCollapsed(!sideBarCollapsed);
  };


  return (
    <Layout className="dashboard-container">
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
              <Suspense
                fallback={
                  <div className="example">
                    <Space size="middle">
                      <Spin size="large" />
                    </Space>
                  </div>
                }
              >
                <ProfileDrawer
                  visible={showProfile}
                  userDetails={props.Auth}
                  showProfile={setShowProfile}
                />
                <FallbackComponent
                  {...props}
                  setSideBarCollapsed={setSideBarCollapsed}
                />
              </Suspense>
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
