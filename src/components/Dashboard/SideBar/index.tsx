import React, { useEffect, useState } from "react";
import {
  Avatar,
  Col,
  Layout,
  Menu,
  Popconfirm,
  Row,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import decideIcon from "../../../services/decideIcon";
import { MenuOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import AryaLogo from "../../static/kesowa-logo.svg";
import { logout } from "../../../actions/authAction";
import { STATIC_URL } from "src/constants";
import { useThemeSwitcher } from "react-css-theme-switcher";
import "./index.less";
import KesowaLogo from "../../static/kiv_logo_new.png";
import Logo from "../../shared/Logo";
const { Sider } = Layout;

function SideBar(props: any) {
  const [href, setHref] = useState<any>(null);
  const [r, setR] = useState(true);
  const { switcher, themes, currentTheme, status } = useThemeSwitcher();
  const history = useHistory();

  useEffect(() => {
    history.listen((location) => {
      const loc = location.pathname.split("/");
      console.log(loc);
      if (loc[3] === "live") {
        setHref("/dashboard/missions");
      } else {
        setHref(location.pathname);
      }
    });
  }, []);

  useEffect(() => {
    const l = window.location.pathname;
    const loc = l.split("/");
    //console.log(loc);
    if (loc[3] === "live") {
      setHref("/dashboard/missions");
    } else {
      setHref(l);
    }
  }, [r]);
  useEffect(() => {
    if (href !== null) {
      if (href.includes("control-center")) {
        switcher({ theme: themes.dark });
      } else {
        switcher({ theme: themes.light });
      }
    }
  }, [href]);
  function getInitials(string) {
    let names = string.split(" "),
      initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  const headerContents = (usergroup: any) => {
    console.log(props.UserDetails);
    return (
      <>
        {props.sidebarState ? (
          <div className="sidebar-header">
            <div>
              <Row>
                <Col span={8}>
                  <MenuOutlined
                    onClick={props.toggleSideBar}
                    className="hamburger"
                  />
                </Col>
              </Row>
            </div>
            <div className="user-info">
              <Row>
                <Col
                  span={8}
                  onClick={() => props.showProfileDrawer(true)}
                  style={{ cursor: "pointer" }}
                >
                  <Avatar
                    className="user-avatar"
                    icon={<UserOutlined />}
                    src={STATIC_URL + props.UserDetails.avatar}
                    style={{ marginBottom: "1rem" }}
                  />
                </Col>
              </Row>
            </div>
          </div>
        ) : (
          <div className="sidebar-header">
            <div>
              <Row>
                <Col span={8}>
                  <MenuOutlined
                    onClick={props.toggleSideBar}
                    className="hamburger"
                  />
                </Col>
                <Col span={8}>
                  <Typography.Title className="header-brand-name" level={3}>
                    Aru
                  </Typography.Title>
                </Col>
                <Col span={8}>
                  <Tooltip title="logout">
                    <Popconfirm
                      placement="rightTop"
                      title="Are you sure you want to logout?"
                      onConfirm={props.logout}
                      okText="Yes"
                      cancelText="No"
                    >
                      <LogoutOutlined className="logout" />
                    </Popconfirm>
                  </Tooltip>
                </Col>
              </Row>
            </div>
            <div
              className="user-info"
              onClick={() => props.showProfileDrawer(true)}
              style={{ cursor: "pointer" }}
            >
              <Row>
                <Col span={8}>
                  <Avatar
                    className="user-avatar"
                    // icon={<UserOutlined />}
                    src={STATIC_URL + props.UserDetails.avatar}
                  >
                    {getInitials(props.UserDetails.name)}
                  </Avatar>
                </Col>
                <Col span={16}>
                  <div className="username-link">
                    <Tooltip placement="right" title={props.UserDetails.name}>
                      <Typography.Title
                        level={5}
                        className="user-name"
                        style={{
                          width: "120px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {props.UserDetails.name}
                      </Typography.Title>
                    </Tooltip>
                    <p
                      style={{
                        width: "120px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {usergroup}
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </>
    );
  };
  function renderHeader() {
    if (
      props.UserDetails.userType === "tenant-staff" ||
      props.UserDetails.userType === "tenant-client"
    ) {
      return headerContents(props.UserDetails.customPermissions[0].name);
    } else {
      return headerContents(props.UserDetails.userType);
    }
  }

  return (
    <React.Fragment>
      {href && (
        <div className="dasboard-sidebar-wrapper">
          {renderHeader()}
          <Sider
            trigger={null}
            collapsible
            collapsed={props.sideBarCollapsed}
            className="menu-items-sidebar"
          >
            <Menu
              key={props.Auth.userdetails}
              style={{ backgroundColor: "#18447A" }}
              theme="dark"
              mode="inline"
              selectedKeys={[href]}
            >
              {props.Auth.userdetails.sideBar.map((ele: any, i: number) => {
                //console.log(ele, i);
                if (ele.type === "sub_menu") {
                  return (
                    <Menu.SubMenu
                      key={`sub_menu${i}`}
                      icon={decideIcon(ele.icon)}
                      title={ele.text}
                    >
                      {ele.sub_menu.map((subEle: any, j: number) => {
                        return (
                          <Menu.Item key={subEle.link} onClick={() => setR(!r)}>
                            <Link to={subEle.link}>
                              {decideIcon(subEle.icon)}
                              <span>{subEle.text}</span>
                            </Link>
                          </Menu.Item>
                        );
                      })}
                    </Menu.SubMenu>
                  );
                } else if (ele.type === "menu") {
                  return (
                    <Menu.Item key={`${ele.link}`} onClick={() => setR(!r)}>
                      <Link to={ele.link}>
                        {decideIcon(ele.icon)}
                        <span>{ele.text}</span>
                      </Link>
                    </Menu.Item>
                  );
                }
              })}
              {/* <Menu.Item key={`global-map-12123123`} onClick={() => setR(!r)}>
                <Link to="/dashboard/basemap">
                  {decideIcon("CompassOutlined")}
                  <span>Map</span>
                </Link>
              </Menu.Item> */}

              {/* <Menu.SubMenu key="main-1" icon={<UserOutlined />} title="Tenant">
                    <Menu.Item  key="sub-1">
                        <Link to="/dashboard/admin/tenant/list">
                            <UnorderedListOutlined />
                            <span>Tenat List</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item  key="sub-2">
                        <Link to="/dashboard/admin/tenant/create">
                            <PlusCircleOutlined />
                            <span>Add Tenat</span>
                        </Link>
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu key="main-2" icon={<ShoppingCartOutlined />} title="Package">
                    <Menu.Item  key="sub-3">
                        <Link to="/dashboard/admin/package/list">
                            <UnorderedListOutlined />
                            <span>Package List</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item  key="sub-4">
                        <Link to="/dashboard/admin/package/create">
                            <PlusCircleOutlined />
                            <span>Add Package</span>
                        </Link>
                    </Menu.Item>
                </Menu.SubMenu> */}
            </Menu>
          </Sider>
          <div className="logo-container">
            <Logo className="brand-logo" alt="kiv-logo" />
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
  UserDetails: state.Auth.userdetails,
});
export default connect(mapStateToProps, {
  logout,
})(SideBar);
