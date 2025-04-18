import { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button, Typography, Result, Space, Spin } from "antd";
import { Switch, Route } from "react-router-dom";

import "./../index.less";
import { CloseCircleOutlined } from "@ant-design/icons";

/* dynamic import */

const CreateTenant = lazy(() => import("../../SuperAdminPages/Tenant/Create"));
const ListAllTanents = lazy(() => import("../../SuperAdminPages/Tenant/List"));
const TenantDetails = lazy(
  () => import("../../SuperAdminPages/Tenant/Details")
);
const EditTenant = lazy(() => import("../../SuperAdminPages/Tenant/Edit"));
const CreatePackage = lazy(
  () => import("../../SuperAdminPages/Package/Create")
);
const ListAllPackages = lazy(
  () => import("../../SuperAdminPages/Package/List")
);
const EditPackage = lazy(() => import("../../SuperAdminPages/Package/Edit"));
const CreatePermission = lazy(
  () => import("../../SuperAdminPages/Permissions/Create")
);
const ListAllPermissions = lazy(
  () => import("../../SuperAdminPages/Permissions/List")
);
const UserListPage = lazy(() => import("../../TenantRootPages/User/List"));

const Organisation = lazy(() => import("../../MyAccount"));
const ClientListPage = lazy(() => import("../../TenantRootPages/Client/List"));
const ClientMissionList = lazy(
  () => import("../../TenantRootPages/Client/Missions")
);
const UserCreatePage = lazy(() => import("../../TenantRootPages/User/Create"));
const UserGroupCreatePage = lazy(
  () => import("../../TenantRootPages/UserGroup/Create")
);
const UserGroupEditPage = lazy(
  () => import("../../TenantRootPages/UserGroup/Edit")
);
const UserGroupListPage = lazy(
  () => import("../../TenantRootPages/UserGroup/List")
);
const ClientCreatePage = lazy(
  () => import("../../TenantRootPages/Client/Create")
);
const ChangePassword = lazy(
  () => import("../../TenantRootPages/Client/Edit/ChangePassword")
);
const ClientEditPage = lazy(() => import("../../TenantRootPages/Client/Edit"));
const UserEditPage = lazy(() => import("../../TenantRootPages/User/Edit"));
const UserChangePassword = lazy(
  () => import("../../TenantRootPages/User/Edit/ChangePassword")
);
const MissionList = lazy(() => import("../../Missions"));
const MissionView = lazy(() => import("../../Missions/Views/Details"));
const DataList = lazy(() => import("../../Data"));
const LiveViewBase = lazy(() => import("../../Missions/Views/Live"));
const CreateMissionBase = lazy(() => import("../../Missions/Create"));
const EditFlight = lazy(() => import("../../Missions/Flight/Edit"));
const ViewFlight = lazy(() => import("../../Missions/Flight/View"));
const AssetBase = lazy(() => import("../../Assets"));
const CreateOrEditLocation = lazy(
  () => import("../../Data/Location/CreateOrEdit")
);
const DashboardContent = lazy(() => import("./Content"));
const AssetView = lazy(() => import("../../Assets/View"));
const LocationCard = lazy(() => import("../../Data/Location/View"));
const Map = lazy(() => import("../../Map"));
const ClientMission = lazy(() => import("../../shared/Client/MissionList"));
const ControlCenter = lazy(() => import("../../ControlCenter"));
const MavlinkTest = lazy(() => import("../../shared/MavlinkTest"));
const Payment = lazy(() => import("../../shared/Payment"));

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
      <Suspense
        fallback={
          <div className="example">
            <Space size="middle">
              <Spin size="large" />
            </Space>
          </div>
        }
      >
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
            <CreateOrEditLocation isEditing={false} />
          </Route>
          <Route path="/dashboard/data/location/edit/:id">
            <CreateOrEditLocation isEditing={true} />
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
      </Suspense>
    </ErrorBoundary>
  );
};

export default FallbackComponent;
