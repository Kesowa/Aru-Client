import { useState, useEffect } from "react";
import {
  Row,
  Card,
  Typography,
  Modal,
  Button,
  Avatar,
  Empty,
  message,
  Popconfirm,
  Checkbox,
} from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import apis from "../../../../../services/apis";
import http from "../../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";
import { logout } from "../../../../../actions/authAction";
import { connect } from "react-redux";
import "./data.less";
import { STATIC_URL } from "src/constants";

const { Text, Title } = Typography;

function ManageClients(props) {
  const [isClientModalVidible, setIsClientModalVisible] = useState(false);
  const [addClient, setAddClient] = useState(false);
  const [clientList, populateClientList] = useState([]);
  const [currClientId, setCurrClientId] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [client, setMissionClient] = useState<any>([
    {
      id: "no-client",
      name: "",
      avatar: "",
    },
  ]);

  useEffect(() => {
    if (props.missionClient) {
      setMissionClient(props.missionClient);
    }
  }, [props.missionClient]);

  useEffect(() => {
    http
      .get(`${apis.GET_CLIENT_LIST}?page=1&limit=100`)
      .then((res) => {
        if (res.data.status) {
          populateClientList(res.data.data);
        }
      })
      .catch((err) => {
        console.log("client list error", err);
      });
  }, []);

  function getInitials(string) {
    let names = string.split(" "),
      initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  // Add client
  function addClientToMission() {
    console.log("................................", currClientId);
    setLoading(true);
    const payload: any = {
      missionId: props.missionId,
      clientId: currClientId,
    };
    http
      .patch(`${apis.ADD_CLIENT_TO_MISSION}`, payload)
      .then((res) => {
        if (res.data.status) {
          const finalArray: any = [];
          console.log("res", res.data);
          setIsClientModalVisible(false);
          if (res.data.existingClients.length > 0) {
            message.info(
              "Some of the selected clients already exist in the mission!"
            );
          }
          message.success("Added client!");

          res.data.data.map((item: any) => {
            if (!props.missionClient.includes(item._id)) {
              const obj: any = {
                id: item._id,
                name: item.name,
                avatar: item.avatar,
              };
              finalArray.push(obj);
            }
          });
          props.setClients(finalArray); // using the same state declared in missionview, to populate clients
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => console.log(props.missionClient), [props.missionClient]);

  useEffect(() => console.log(currClientId), [currClientId]);

  const onChange = (a) => {
    console.log("value of a", a);
    setCurrClientId(a);
    setAddClient(true);
  };

  // Add Client Buttons
  function renderAddClientBtn() {
    if (
      props.userType === "tenant-staff" ||
      props.userType === "tenant-client"
    ) {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) =>
            d.name === "create_client" ||
            d.name === "edit_client" ||
            d.name === "delete_client"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <>
            <div
              style={{ float: "left", cursor: "pointer" }}
              onClick={() => {
                setIsClientModalVisible(true);
                setAddClient(false);
              }}
            >
              <Avatar key="2" size="large" icon={<PlusOutlined />} />
              <div
                style={{
                  float: "right",
                  marginLeft: "12px",
                  marginTop: "8px",
                }}
              >
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  Add Client
                </Text>
              </div>
            </div>
          </>
        );
      }
    } else {
      return (
        <>
          <div
            style={{ float: "left", cursor: "pointer" }}
            onClick={() => {
              setIsClientModalVisible(true);
              setAddClient(false);
            }}
          >
            <Avatar key="2" size="large" icon={<PlusOutlined />} />
            <div
              style={{
                float: "right",
                marginLeft: "12px",
                marginTop: "8px",
              }}
            >
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Add Client
              </Text>
            </div>
          </div>
        </>
      );
    }
  }

  // Remove Client
  function removeClient(id: any) {
    props.loading(true);
    http
      .patch(
        `${apis.REMOVE_CLIENT_FROM_MISSION}?id=${props.missionId}&clientId=${id}`
      )
      .then((res) => {
        if (res.data.status) {
          console.log(res.data);
          const filteredArray: any = props.missionClient.filter(
            (i: any) => i.id !== id
          ); // popping out the client removed from the same state
          props.setClients(filteredArray); // and pushing the new filtered array into the state
          message.success("Removed client from mission!");
        } else {
          message.warning(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => props.loading(false));
  }

  //----------------Render manageclient Button---------------------

  function renderClientManageBtns(client: any) {
    if (
      props.userType === "tenant-staff" ||
      props.userType === "tenant-client"
    ) {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) =>
            d.name === "create_client" ||
            d.name === "edit_client" ||
            d.name === "delete_client"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Popconfirm
              title="Are you want to remove this client?"
              placement="topRight"
              onConfirm={() => removeClient(client)}
              onCancel={() => {}}
              okText="Yes"
              cancelText="No"
            >
              <CloseOutlined style={{ color: "#a19f9f", cursor: "pointer" }} />
            </Popconfirm>
          </>
        );
      }
    } else {
      return (
        <>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Popconfirm
            title="Are you want to remove this client?"
            placement="topRight"
            onConfirm={() => removeClient(client)}
            onCancel={() => {}}
            okText="Yes"
            cancelText="No"
          >
            <CloseOutlined style={{ color: "#a19f9f", cursor: "pointer" }} />
          </Popconfirm>
        </>
      );
    }
  }

  return (
    <>
      <Row>
        <Card title="Client" className="customer-card" bordered={false}>
          {props.missionClient.length > 0 ? (
            props.missionClient.map((client: any) => {
              return (
                <Row>
                  <div style={{ float: "left" }}>
                    <Avatar
                      key="2"
                      size="large"
                      src={STATIC_URL + client.avatar}
                    >
                      {getInitials(client.name)}
                    </Avatar>

                    <div
                      style={{
                        float: "right",
                        marginTop: "12px",
                        marginLeft: "12px",
                      }}
                    >
                      {renderClientManageBtns(client.id)}
                    </div>
                    <div
                      style={{
                        float: "right",
                        marginLeft: "12px",
                      }}
                    >
                      <Text type="secondary">Client</Text>
                      <Title
                        level={5}
                        style={{
                          marginTop: "-4px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: "118px",
                        }}
                      >
                        {client.name}&nbsp;&nbsp;&nbsp;&nbsp;
                      </Title>
                    </div>
                  </div>
                </Row>
              );
            })
          ) : (
            <Empty description="no clients assigned to this mission!" />
          )}
          {renderAddClientBtn()}
        </Card>
      </Row>
      <Modal
        title="My Clients"
        destroyOnClose={true}
        open={isClientModalVidible}
        onOk={() => setIsClientModalVisible(false)}
        onCancel={() => setIsClientModalVisible(false)}
        footer={
          <>
            {addClient ? (
              <Button
                type="primary"
                onClick={() => addClientToMission()}
                loading={loading}
              >
                Add Client
              </Button>
            ) : (
              <Button type="primary" disabled>
                Add Client
              </Button>
            )}
          </>
        }
      >
        {clientList.length > 0 ? (
          <>
            <Title level={5}>Choose client for this mission: </Title>
            <Checkbox.Group onChange={onChange}>
              {clientList.map((item: any) => {
                return (
                  <>
                    <Checkbox
                      value={`${item._id}`}
                      id={item._id}
                      style={{ marginBottom: "12px" }}
                    >
                      <Avatar
                        key={`avatar-${item._id}`}
                        src={`${STATIC_URL}${item.avatar}`}
                        size="large"
                      >
                        {getInitials(item.name)}
                      </Avatar>
                      <div
                        style={{
                          float: "right",
                          marginLeft: "12px",
                          marginTop: "8px",
                        }}
                      >
                        <Text style={{ fontSize: "16px" }}>{item.name}</Text>
                      </div>
                    </Checkbox>
                    <br />
                  </>
                );
              })}
            </Checkbox.Group>
          </>
        ) : (
          <Empty description={<span>No client users were found!</span>} />
        )}
      </Modal>
    </>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { logout })(ManageClients);
