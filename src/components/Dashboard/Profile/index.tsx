import { Avatar, Drawer, Skeleton, Typography } from "antd";
import React, { useEffect, useState } from "react";
import "./index.less";
import { UserOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import Link from "antd/lib/typography/Link";
import { STATIC_URL, VERSION } from "src/constants";

const { Title, Text } = Typography;

function Profile(props: any) {
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    if (props.userDetails !== undefined) {
      //console.log("inDrawer",props.userDetails.userdetails);
      setLoader(false);
    }
  }, [props.userDetails]);
  return (
    <Drawer
      title="My Profile"
      placement="right"
      onClose={() => props.showProfile(false)}
      visible={props.visible}
      width={380}
      footer={
        <div
          style={
            {
              // width: "100%",
              // height: "50px",
              // //textAlign: "center",
              // backgroundColor: "#e9e9f0",
              // padding: "12px",
              // position: "fixed",
              // bottom: "0"
            }
          }
        >
          <Text type="secondary">{VERSION}</Text>
          <Link
            href="https://kesowa.atlassian.net/servicedesk/customer/portals"
            target="_blank"
            style={{ color: "#3b86ff", float: "right" }}
          >
            Need help <QuestionCircleOutlined />
          </Link>
        </div>
      }
    >
      <Skeleton loading={loader} paragraph={{ rows: 4 }}>
        <div className="profile-wrapper">
          <div className="header">
            <div className="cover" />
            <div className="profile">
              <Avatar
                className="pic"
                size={96}
                icon={<UserOutlined />}
                src={`${STATIC_URL}${props.userDetails.userdetails.avatar}`}
              />
            </div>
          </div>
          <div className="title-user">
            <Title level={4}>{props.userDetails.userdetails.name}</Title>
          </div>
          <div className="user-mail">
            <Text>{props.userDetails.userdetails.email}</Text>
          </div>
          <div className="user-type">
            <Text type="secondary">
              {props.userDetails.userdetails.userType == "tenant-root"
                ? "Root Admin"
                : props.userDetails.userdetails.userType == "super-admin"
                ? "Super Admin"
                : "Default User"}
            </Text>
          </div>
        </div>
      </Skeleton>
    </Drawer>
  );
}

export default Profile;
