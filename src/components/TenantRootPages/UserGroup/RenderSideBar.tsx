import React from "react";
import { Menu, Card, MenuProps } from "antd";
import decideIcon from "../../../services/decideIcon";
import "./UserGroup.less";

export default function RenderSideBar(props: any) {
  const menuItems: MenuProps["items"] = () => {
    props.selectedPermissions.map((ele: any, i: number) => {
      if (ele.isSideNavOption) {
        return {
          key: `menu${i}`,
          label: ele.sideNavOptionLabel,
          icon: decideIcon(ele.sideNavOptionIcon),
        };
      } else return [];
    });
  };
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
