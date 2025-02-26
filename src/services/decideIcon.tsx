import {
  UserOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
  ShoppingCartOutlined,
  UsergroupAddOutlined,
  BorderInnerOutlined,
  ControlOutlined,
  LayoutOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  DiffOutlined,
  SolutionOutlined,
  SaveOutlined,
  MobileOutlined,
  TeamOutlined,
  ShopOutlined,
  GlobalOutlined,
  CompassOutlined,
} from "@ant-design/icons";

const decideIcon = (iconType: string) => {
  switch (iconType) {
    case "UserOutlined":
      return <UserOutlined />;
    case "PlusCircleOutlined":
      return <PlusCircleOutlined />;
    case "UnorderedListOutlined":
      return <UnorderedListOutlined />;
    case "ShoppingCartOutlined":
      return <ShoppingCartOutlined />;
    case "UsergroupAddOutlined":
      return <UsergroupAddOutlined />;
    case "BorderInnerOutlined":
      return <BorderInnerOutlined />;
    case "ControlOutlined":
      return <ControlOutlined />;
    case "LayoutOutlined":
      return <LayoutOutlined />;
    case "DatabaseOutlined":
      return <DatabaseOutlined />;
    case "ClusterOutlined":
      return <ClusterOutlined />;
    case "DiffOutlined":
      return <DiffOutlined />;
    case "UserAddOutlined":
      return <UserAddOutlined />;
    case "SolutionOutlined":
      return <SolutionOutlined />;
    case "SaveOutlined":
      return <SaveOutlined />;
    case "MobileOutlined":
      return <MobileOutlined />;
    case "TeamOutlined":
      return <TeamOutlined />;
    case "ShopOutlined":
      return <ShopOutlined />;
    case "GlobalOutlined":
      return <GlobalOutlined />;
    case "CompassOutlined":
      return <CompassOutlined />;
    default:
      return <UserOutlined />;
  }
};

export default decideIcon;
