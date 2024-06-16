import React from "react";
import { Menu, Card, MenuProps } from "antd";
import decideIcon from "../../../services/decideIcon";
import "./UserGroup.less";
import { permissionsToSideBar } from "src/static/sideBarOptions";

export default function RenderSideBar(props: any) {
  const menuItems: MenuProps["items"] = permissionsToSideBar(props.selectedPermissions).map((ele, i) => ({
    key: `menu${i}`,
    label: ele.text,
    icon: decideIcon(ele.icon),
  }));
  return (
    <div className="demo-sidebar-wrapper">
      <h3>Sidebar Template</h3>
      <Card className="demo-sidebar-inner">
        <Menu
          key={props.selectedPermissions}
          theme="dark"
          mode="inline"
          className="demo-sidebard"
          items={menuItems()}
        ></Menu>
      </Card>
    </div>
  );
}
