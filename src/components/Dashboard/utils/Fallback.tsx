import { ErrorBoundary } from "react-error-boundary";
import { Layout, Row, Col, Modal, Button, Typography, Result } from "antd";
import { useLocation, Switch, Route, useHistory } from "react-router-dom";

import { logout } from "../../../actions/authAction";
import SideBar from "../SideBar";
import CreateTenant from "../../SuperAdminPages/Tenant/Create";
import ListAllTanents from "../../SuperAdminPages/Tenant/List";
import TenantDetails from "../../SuperAdminPages/Tenant/Details";
import EditTenant from "../../SuperAdminPages/Tenant/Edit";
import CreatePackage from "../../SuperAdminPages/Package/Create";
import ListAllPackages from "../../SuperAdminPages/Package/List";
import EditPackage from "../../SuperAdminPages/Package/Edit";
import CreatePermission from "../../SuperAdminPages/Permissions/Create";
import ListAllPermissions from "../../SuperAdminPages/Permissions/List";

import Organisation from "../../MyAccount";
import UserListPage from "../../TenantRootPages/User/List";
import ClientListPage from "../../TenantRootPages/Client/List";
import ClientMissionList from "../../TenantRootPages/Client/Missions";
import UserCreatePage from "../../TenantRootPages/User/Create";
import UserGroupCreatePage from "../../TenantRootPages/UserGroup/Create";
import UserGroupEditPage from "../../TenantRootPages/UserGroup/Edit";
import UserGroupListPage from "../../TenantRootPages/UserGroup/List";
import ClientCreatePage from "../../TenantRootPages/Client/Create";
import ChangePassword from "../../TenantRootPages/Client/Edit/ChangePassword";
import ClientEditPage from "../../TenantRootPages/Client/Edit";
import UserEditPage from "../../TenantRootPages/User/Edit";
import UserChangePassword from "../../TenantRootPages/User/Edit/ChangePassword";

import "./../index.less";
import MissionList from "../../Missions/Views/List";
import MissionView from "../../Missions/Views/Details";
import DataList from "../../Data";
import LiveViewBase from "../../Missions/Views/Live";
import CreateMissionBase from "../../Missions/Create";
import EditFlight from "../../Missions/Flight/Edit";
import ViewFlight from "../../Missions/Flight/View";
import AssetBase from "../../Assets";
import CreateLocation from "../../Data/Location/Create";
import EditLocation from "../../Data/Location/Edit";
import DashboardContent from "./Content";
import AssetView from "../../Assets/View";
import LocationCard from "../../Data/Location/View";
import Map from "../../Map";
import ClientMission from "../../shared/Client/MissionList";
import ControlCenter from "../../ControlCenter";
import MavlinkTest from "../../shared/MavlinkTest";
import React from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
import Payment from "../../shared/Payment";

const FallbackComponent = (props: any) => {
  const { Paragraph, Text } = Typography;
  function fallBackComponent({ error, resetErrorBoundary }) {
    return (
      <div>
        <Result
          status="500"
          title="Opps! There seems to be a problem!"
          subTitle="Please refresh the page to try again."
          extra={[
            <Button key="dashboard" onClick={() => window.location.reload()}>
              Refresh page
            </Button>,
          ]}
        >
          <div className="desc">
            <Paragraph>
              <Text
                strong
                style={{
                  fontSize: 16,
                }}
              >
                Error log:
              </Text>
            </Paragraph>
            <Paragraph>
              <CloseCircleOutlined className="site-result-demo-error-icon" />{" "}
              {error.message}
            </Paragraph>
          </div>
        </Result>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={fallBackComponent}>
      <Switch>
        <Route path="/dashboard/admin/tenant/create">
          <CreateTenant />
        </Route>
        <Route path="/dashboard/admin/tenant/list">
          <ListAllTanents />
        </Route>
        <Route path="/dashboard/admin/tenant/details/:id">
          <TenantDetails />
        </Route>
        <Route path="/dashboard/admin/tenant/edit/:id">
          <EditTenant />
        </Route>
        <Route path="/dashboard/admin/package/create">
          <CreatePackage />
        </Route>
        <Route path="/dashboard/admin/package/edit/:id">
          <EditPackage />
        </Route>
        <Route path="/dashboard/admin/package/list">
          <ListAllPackages />
        </Route>
        <Route path="/dashboard/admin/permission/create">
          <CreatePermission />
        </Route>
        <Route path="/dashboard/admin/permission/list">
          <ListAllPermissions />
        </Route>
        <Route path="/dashboard/tenant/organisation">
          <Organisation />
        </Route>
        <Route path="/dashboard/tenant/user/list">
          <UserListPage />
        </Route>
        <Route path="/dashboard/tenant/user/edit/:id">
          <UserEditPage />
        </Route>
        <Route path="/dashboard/tenant/user/change-password/:id">
          <UserChangePassword />
        </Route>
        <Route path="/dashboard/tenant/client/list">
          <ClientListPage />
        </Route>
        <Route path="/dashboard/tenant/client/edit/:id">
          <ClientEditPage />
        </Route>
        <Route path="/dashboard/tenant/client/change-password/:id">
          <ChangePassword />
        </Route>
        <Route path="/dashboard/tenant/client/missions">
          <ClientMissionList />
        </Route>
        <Route path="/dashboard/tenant/user/create">
          <UserCreatePage />
        </Route>
        <Route path="/dashboard/tenant/client/create">
          <ClientCreatePage />
        </Route>
        <Route path="/dashboard/tenant/user-group/create">
          <UserGroupCreatePage />
        </Route>
        <Route path="/dashboard/tenant/user-group/edit/:id">
          <UserGroupEditPage />
        </Route>
        <Route path="/dashboard/tenant/user-group/list">
          <UserGroupListPage />
        </Route>
        <Route path="/dashboard/missions" exact>
          <MissionList />
        </Route>
        <Route path="/dashboard/missions/create">
          <CreateMissionBase />
        </Route>
        <Route path="/dashboard/mission/view/:id">
          <MissionView />
        </Route>
        <Route path="/dashboard/flight/edit/:id">
          <EditFlight />
        </Route>
        <Route path="/dashboard/flight/view/:id">
          <ViewFlight />
        </Route>
        <Route path="/dashboard/data/locations/create">
          <CreateLocation />
        </Route>
        <Route path="/dashboard/data/location/edit/:id">
          <EditLocation />
        </Route>
        <Route path="/dashboard/data" exact>
          <DataList />
        </Route>
        <Route path="/dashboard/data/live/:id">
          <LiveViewBase />
        </Route>
        <Route path="/dashboard/data/location/:id">
          <LocationCard />
        </Route>
        <Route path="/dashboard/assets" exact>
          <AssetBase />
        </Route>
        <Route path="/dashboard/asset/view/:id">
          <AssetView />
        </Route>
        <Route path="/dashboard/map/:id">
          <Map isBaseMap={false} />
        </Route>
        <Route path="/dashboard/basemap" exact>
          <Map isBaseMap={true} />
        </Route>
        <Route path="/dashboard/client/missions">
          <ClientMission />
        </Route>
        <Route path="/dashboard/mavlink-testing">
          <MavlinkTest />
        </Route>
        <Route path="/dashboard/payment">
          <Payment />
        </Route>
        <Route path="/dashboard/control-center" exact>
          <ControlCenter setSideBarCollapsed={props.setSideBarCollapsed} />
        </Route>
        <Route>
          <DashboardContent />
        </Route>
      </Switch>
    </ErrorBoundary>
  );
};

export default FallbackComponent;
