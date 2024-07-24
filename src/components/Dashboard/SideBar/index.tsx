import React, { useEffect, useState } from "react";
import {
  Avatar,
  Col,
  Layout,
  Menu,
  MenuProps,
  Modal,
  Popconfirm,
  Row,
  Tooltip,
  Typography,
} from "antd";
import { Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import decideIcon from "../../../services/decideIcon";
import { MenuOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { logout } from "../../../actions/authAction";
import {
  API_URL,
  COG_URL,
  LIVE_URL,
  PUBLIC_URL,
  RTMP_URL,
  STATIC_URL,
} from "src/constants";
import { useThemeSwitcher } from "react-css-theme-switcher";
import QRCode from "qrcode";
import "./index.less";
import Logo from "../../shared/Logo";
const { Sider } = Layout;
const { Title } = Typography;

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
    return headerContents(props.UserDetails.userType);
  }

  // Connect to app with qr code modal
  const [visible, setVisible] = useState(false);
  const [qrCode, setqrCode] = useState("");
  useEffect(() => {
    if (visible) {
      getQrCode();
    }
  }, [visible]);

  const getQrCode = () => {
    const data = {
      BASE_SERVER_URL: PUBLIC_URL,
      BASE_STREAM_URL: LIVE_URL,
      COG_SERVER_URL: COG_URL,
      RTMP_URL: RTMP_URL,
      API_URL: API_URL,
      CDN_URL: STATIC_URL,
    };
    QRCode.toDataURL(JSON.stringify(data), function (err, url) {
      setqrCode(url);
    });
  };

  const connectToAppModal = () => {
    return (
      <Modal
        title="Connect To App"
        centered
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={1000}
      >
        <Row>
          <Col span={16}>
            <Title
              className="card-title"
              style={{ color: "#33324E" }}
              level={2}
            >
              {"To connect the app to the platform"}
            </Title>

            <div style={{ marginLeft: "10px", marginTop: "50px" }}>
              <Title
                className="card-title"
                style={{ color: "#242B2E" }}
                level={4}
              >
                1. &nbsp;&nbsp;Open Aru app on your phone
              </Title>
              <Title
                className="card-title"
                style={{ color: "#242B2E" }}
                level={4}
              >
                2. &nbsp;&nbsp;Tap Menu and select connect to ARU
              </Title>
              <Title
                className="card-title"
                style={{ color: "#242B2E" }}
                level={4}
              >
                3. &nbsp;&nbsp;Point your phone to this screen to capture the
                code
              </Title>
            </div>
          </Col>
          <Col span={8}>
            <img src={qrCode} style={{ width: "100%" }} />
          </Col>
        </Row>
      </Modal>
    );
  };

  // Final menu items
  const menu: MenuProps["items"] = () => {
    const items: MenuProps["items"] = [];
    props.Auth.userdetails.sideBar.map((ele: any, i: number) => {
      if (ele.type === "sub_menu") {
        const submenu = {
          key: `sub_menu${i}`,
          icon: decideIcon(ele.icon),
          label: ele.text,
        };
        const children: MenuProps["items"] = [];
        ele.sub_menu.map((subEle: any, j: number) => {
          children.push({
            key: subEle.link,
            label: (
              <Link to={subEle.link}>
                {decideIcon(subEle.icon)}
                <span>{subEle.text}</span>
              </Link>
            ),
          });
        });
        submenu["children"] = children;
        items.push(submenu);
      } else if (ele.type === "menu") {
        items.push({
          key: ele.link,
          label: (
            <Link to={ele.link}>
              {decideIcon(ele.icon)}
              <span>{ele.text}</span>
            </Link>
          ),
        });
      }
    });
    if (props.UserDetails.userType === "tenant-client") {
      items.push({
        key: "connect_to_app_sidebar",
        label: (
          <div onClick={() => setVisible(true)}>
            {decideIcon("MobileOutlined")}
            <span>Connect to App</span>
          </div>
        ),
      });
    }
    return items;
  };

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
              items={menu()}
            />
          </Sider>
          {connectToAppModal()}
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
