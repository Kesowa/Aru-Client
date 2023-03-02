import React from "react";
import { Menu, Card } from "antd";
import decideIcon from "../../../services/decideIcon";
import "./UserGroup.less";

export default function RenderSideBar(props: any) {
  return (
    <div className="demo-sidebar-wrapper">
      <h3>Sidebar Template</h3>
      <Card className="demo-sidebar-inner">
        <Menu
          key={props.selectedPermissions}
          theme="dark"
          mode="inline"
          className="demo-sidebard"
        >
          {props.selectedPermissions.map((ele: any, i: number) => {
            if (ele.isSideNavOption) {
              return (
                <Menu.Item key={`menu${i}`}>
                  {decideIcon(ele.sideNavOptionIcon)}
                  <span>{ele.sideNavOptionLabel}</span>
                </Menu.Item>
              );
            }
          })}
        </Menu>
      </Card>
    </div>
  );
}
