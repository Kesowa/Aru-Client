import * as React from "react";
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
      break;
    case "PlusCircleOutlined":
      return <PlusCircleOutlined />;
      break;
    case "UnorderedListOutlined":
      return <UnorderedListOutlined />;
      break;
    case "ShoppingCartOutlined":
      return <ShoppingCartOutlined />;
      break;
    case "UsergroupAddOutlined":
      return <UsergroupAddOutlined />;
      break;
    case "BorderInnerOutlined":
      return <BorderInnerOutlined />;
      break;
    case "ControlOutlined":
      return <ControlOutlined />;
      break;
    case "LayoutOutlined":
      return <LayoutOutlined />;
      break;
    case "DatabaseOutlined":
      return <DatabaseOutlined />;
      break;
    case "ClusterOutlined":
      return <ClusterOutlined />;
      break;
    case "DiffOutlined":
      return <DiffOutlined />;
      break;
    case "UserAddOutlined":
      return <UserAddOutlined />;
      break;
    case "SolutionOutlined":
      return <SolutionOutlined />;
      break;
    case "SaveOutlined":
      return <SaveOutlined />;
      break;
    case "MobileOutlined":
      return <MobileOutlined />;
      break;
    case "TeamOutlined":
      return <TeamOutlined />;
      break;
    case "ShopOutlined":
      return <ShopOutlined />;
      break;
    case "GlobalOutlined":
      return <GlobalOutlined />;
      break;
    case "CompassOutlined":
      return <CompassOutlined />;
      break;
    default:
      return <UserOutlined />;
      break;
  }
};

export default decideIcon;
