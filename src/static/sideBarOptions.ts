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
