import "./index.less";
import {
  Typography,
  message,
  Modal,
  Tooltip,
  Dropdown,
  Space,
  Switch,
  MenuProps,
} from "antd";
import { ExclamationCircleOutlined, DownOutlined } from "@ant-design/icons";
import { TbFlag, TbFlagOff } from "react-icons/tb";
import http from "src/services/httpCall";
const ActionToolbar = (props) => {
  const { Text } = Typography;
  const actionMenu: MenuProps["items"] = [
    {
      key: "0",
      label: "Toggle Selection",
    },
    {
      key: "1",
      label: "Clear Selection",
      disabled: props.checkedList.length > 0 ? false : true,
    },
    {
      key: "2",
      label: "Select all files",
      disabled: props.data.length > 0 ? false : true,
    },
    {
      key: "3",
      label: "Delete files",
      disabled: props.checkedList.length > 0 ? false : true,
    },
  ];
  const handleAction = (e) => {
    if (e.key == 0) {
      props.setActivateSelection(!props.activateSelection);
      props.setCheckedList([]);
    } else if (e.key == 1) {
      props.setCheckedList([]);
    } else if (e.key == 2) {
      if (!props.activateSelection) {
        props.setActivateSelection(true);
        props.setCheckedList(
          props.data.map((item: any) => {
            return item._id;
          })
        );
      } else {
        props.setCheckedList(
          props.data.map((item: any) => {
            return item._id;
          })
        );
      }
    } else if (e.key == 3) {
      Modal.confirm({
        title: `Delete ${props.type} ?`,
        icon: <ExclamationCircleOutlined />,
        content: "Are you sure you want to delete ?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => {
          props.delete(props.checkedList);
        },
      });
    }
  };
  const toggleFlag = () => {
    const body = {
      Id: props.checkedList,
      update: { isFlagged: !props.flag },
    };
    console.log("toggleFlag", body);
    props.setFlag(!props.flag);
    http
      .patch(`${props.updateAPI}`, body)
      .then((res) => {
        if (res.data.status) {
          const updatedOutcome = props.thumb(res.data.data);
          const updatedData: any = props.data.map((prevData: any) => {
            if (
              props.checkedList.length > 0 &&
              props.checkedList.includes(prevData._id)
            ) {
              return updatedOutcome.filter(
                (newData: any) => newData._id === prevData._id
              )[0];
            } else {
              return prevData;
            }
          });
          console.log("toggleFlag", props.data, updatedData);
          props.setData(updatedData);
          message.success(
            `${props.type}${props.checkedList.length > 1 ? "s" : ""} ${
              props.flag ? "un-" : ""
            }flagged successfully!`
          );
        } else message.error(res.data.message);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };
  return (
    <div className="toolbar">
      <Text type="secondary">
        {props.activateSelection
          ? `${props.checkedList.length} Selected`
          : `Total ${
              props.totalCount ? props.totalCount : props.data?.length
            } ${props.type}s`}
      </Text>
      <div className="upload-btn">
        <Tooltip
          title={`${
            !(props.activateSelection && props.checkedList.length > 0)
              ? "Toggle Flag"
              : !props.flag
              ? `Flag ${props.type}`
              : `Un-flag ${props.type}`
          }`}
          placement="bottom"
        >
          <Switch
            disabled={
              !(props.activateSelection && props.checkedList.length > 0)
            }
            checkedChildren={<TbFlag size={16} />}
            unCheckedChildren={<TbFlagOff size={16} color="#da1c5c" />}
            onChange={toggleFlag}
            checked={props.flag}
          />
        </Tooltip>
        <Dropdown
          menu={{ items: actionMenu, onClick: handleAction }}
          trigger={["click"]}
        >
          <a onClick={(e) => e.preventDefault()} style={{ margin: "0 30px" }}>
            <Space>
              Actions
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
        {props.uploadBtn()}
      </div>
    </div>
  );
};

export default ActionToolbar;
