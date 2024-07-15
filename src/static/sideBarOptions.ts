import { components } from "src/handlers/schema";
import { permissions } from "./permissions";

//++++++++++++++++++++++++++++++++ super admin ++++++++++++++++++++++++++++++++++++++
export const superAdminOptions = [
  {
    type: "sub_menu",
    icon: "UserOutlined",
    text: "Tenant",
    sub_menu: [
      {
        type: "menu",
        link: "/dashboard/admin/tenant/list",
        icon: "UnorderedListOutlined",
        text: "Tenat List",
      },
      {
        type: "menu",
        link: "/dashboard/admin/tenant/create",
        icon: "PlusCircleOutlined",
        text: "Tenat Create",
      },
    ],
  },
  {
    type: "sub_menu",
    icon: "ShoppingCartOutlined",
    text: "Package",
    sub_menu: [
      {
        type: "menu",
        link: "/dashboard/admin/package/list",
        icon: "UnorderedListOutlined",
        text: "Package List",
      },
      {
        type: "menu",
        link: "/dashboard/admin/package/create",
        icon: "PlusCircleOutlined",
        text: "Add Package",
      },
    ],
  },
  {
    type: "menu",
    link: "/dashboard/admin/permission/create",
    icon: "PlusCircleOutlined",
    text: "Add Permission",
  },
];

export const clientOptions = [
  {
    type: "menu",
    link: "/dashboard/client/missions",
    icon: "BorderInnerOutlined",
    text: "Missions",
  },
];

//+++++++++++++++++++++++++++++++++ Tenant Root +++++++++++++++++++++++++++++++++
export const tenantRootOptions = [
  {
    type: "menu",
    link: "/dashboard",
    icon: "LayoutOutlined",
    text: "Dashboard",
  },
  {
    type: "menu",
    link: "/dashboard/tenant/organisation",
    icon: "UsergroupAddOutlined",
    text: "My Account",
  },
  {
    type: "menu",
    link: "/dashboard/missions",
    icon: "BorderInnerOutlined",
    text: "Missions",
  },
  {
    type: "sub_menu",
    icon: "UserOutlined",
    text: "User",
    sub_menu: [
      {
        type: "menu",
        link: "/dashboard/tenant/user/list",
        icon: "UnorderedListOutlined",
        text: "User List",
      },
      {
        type: "menu",
        link: "/dashboard/tenant/user/create",
        icon: "PlusCircleOutlined",
        text: "Create User",
      },
    ],
  },
  {
    type: "sub_menu",
    icon: "ShopOutlined",
    text: "Client",
    sub_menu: [
      {
        type: "menu",
        link: "/dashboard/tenant/client/list",
        icon: "UnorderedListOutlined",
        text: "Client List",
      },
      {
        type: "menu",
        link: "/dashboard/tenant/client/create",
        icon: "PlusCircleOutlined",
        text: "Create Client",
      },
      {
        type: "menu",
        link: "/dashboard/tenant/client/missions",
        icon: "BorderInnerOutlined",
        text: "Missions",
      },
    ],
  },
  {
    type: "sub_menu",
    icon: "TeamOutlined",
    text: "User Groups",
    sub_menu: [
      {
        type: "menu",
        link: "/dashboard/tenant/user-group/create",
        icon: "UsergroupAddOutlined",
        text: "Create User Group",
      },
      {
        type: "menu",
        link: "/dashboard/tenant/user-group/list",
        icon: "UnorderedListOutlined",
        text: "User Group List",
      },
    ],
  },
  {
    type: "menu",
    link: "/dashboard/data",
    icon: "DatabaseOutlined",
    text: "Data",
  },
  {
    type: "menu",
    link: "/dashboard/basemap",
    icon: "CompassOutlined",
    text: "Map",
  },
  {
    type: "menu",
    link: "/dashboard/control-center",
    icon: "ControlOutlined",
    text: "Control Center",
  },
  {
    type: "menu",
    link: "/dashboard/assets",
    icon: "ClusterOutlined",
    text: "Assets",
  },
];

export const permissionGuardedOptions = [
  {
    permission: permissions.MISSION_CREATE,
    link: "/dashboard/missions/create",
    icon: "PlusCircleOutlined",
    label: "Create mission",
  },
  {
    permission: permissions.MISSION_LIST,
    link: "/dashboard/missions",
    icon: "BorderInnerOutlined",
    label: "Missions",
  },
  {
    permission: permissions.DATA_PAGE,
    link: "/dashboard/data",
    icon: "DatabaseOutlined",
    label: "Data",
  },
  {
    permission: permissions.ASSET_LIST,
    link: "/dashboard/assets",
    icon: "ClusterOutlined",
    label: "Assets",
  },
  {
    permission: permissions.USER_LIST,
    link: "/dashboard/tenant/user/list",
    icon: "UserOutlined",
    label: "User list",
  },
  {
    permission: permissions.DASHBOARD,
    link: "/dashboard",
    icon: "LayoutOutlined",
    label: "Dashboard",
  },
  {
    permission: permissions.CREATE_CLIENT,
    link: "/dashboard/tenant/client/create",
    icon: "UserAddOutlined",
    label: "Create Client",
  },
  {
    permission: permissions.CLIENT_LIST,
    link: "/dashboard/tenant/client/list",
    icon: "SolutionOutlined",
    label: "Client List",
  },
  {
    permission: permissions.CLIENT_DATA,
    link: "/dashboard/tenant/client/missions",
    icon: "SaveOutlined",
    label: "Client Data",
  },
  {
    permission: permissions.USER_CREATE,
    link: "/dashboard/tenant/user/create",
    icon: "UserAddOutlined",
    label: "Create User",
  },
];

export const permissionsToSideBar = (
  permissions: components["schemas"]["IPermission"][]
) => {
  const permissionNames = permissions.map((p) => p);
  return permissionGuardedOptions
    .filter((p) => permissionNames.includes(p.permission))
    .map(({ link, icon, label }) => ({
      type: "menu",
      link,
      icon,
      text: label,
    }));
};

export const getSideBar = ({
  userType,
  customPermissions,
}: components["schemas"]["IUserCustomPermission"]) => {
  switch (userType) {
    case "tenant-root":
      return tenantRootOptions;
    case "tenant-client":
      return clientOptions;
    case "super-admin":
      return superAdminOptions;
    default: {
      const userGroup = customPermissions[0];
      return permissionsToSideBar(userGroup.permissions);
    }
  }
};
