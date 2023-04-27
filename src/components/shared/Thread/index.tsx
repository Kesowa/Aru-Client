import React, { useEffect, useState } from "react";
import ReactDom from "react-dom";
import {
  Input,
  Comment,
  Avatar,
  Drawer,
  Form,
  Button,
  message,
  Row,
  Tooltip,
  Modal,
} from "antd";
import apis from "src/services/apis";
import http from "src/services/httpCall";
import { STATIC_URL } from "src/constants";
import {
  UserOutlined,
  DeleteFilled,
  DeleteTwoTone,
  EditFilled,
  EditTwoTone,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { logout } from "../../../actions/authAction";
import { thread } from "../../../actions/threadAction";
import { connect } from "react-redux";
import "./index.less";
const { TextArea } = Input;
message.config({
  getContainer: () => document.getElementById("thread")!,
});
const CREATE_THREAD = async (docType: any, docID: any) => {
  return await http.post(`${apis.THREAD}/${docType}/${docID}`);
};

const GET_THREAD = async (docType: any, docID: any) => {
  return await http.get(`${apis.THREAD}/${docType}/${docID}`);
};

const ADD_COMMENT = async (docType: any, docID: any, content: any) => {
  return await http.patch(`${apis.THREAD}/${docType}/${docID}`, { content });
};

const EDIT_COMMENT = async (
  docType: any,
  docID: any,
  content: any,
  commentId: any
) => {
  return await http.patch(`${apis.THREAD}/${docType}/${docID}`, {
    content,
    commentId,
  });
};

const DELETE_COMMENT = async (docType: any, docID: any, commentID: any) => {
  return await http.delete(`${apis.THREAD}/${docType}/${docID}/${commentID}`);
};
const Editor = ({
  onChange,
  onSubmit,
  submitting,
  value,
  type,
  action,
  setAction,
}) => (
  <div>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button
        htmlType="submit"
        loading={submitting}
        onClick={onSubmit}
        type="primary"
      >
        {type} Comment
      </Button>
      {action === "edit" && type !== "Add" && (
        <Button
          style={{ marginLeft: "1rem" }}
          type="primary"
          danger
          onClick={() => setAction("")}
        >
          Cancel
        </Button>
      )}
    </Form.Item>
  </div>
);
const Thread = (props) => {
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [addCommentValue, setAddCommentValue] = useState("");
  const [editCommentValue, setEditCommentValue] = useState("");
  const [comments, setComments] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [action, setAction] = useState("");
  const [commentId, setCommentId] = useState("");
  const [actionIdx, setActionIdx] = useState("");
  const getActions = (comment: any, idx: any) => {
    return [
      <span key="delete">
        <Tooltip title="Delete">
          {action === "delete" && commentId === comment._id ? (
            <DeleteFilled />
          ) : (
            <DeleteTwoTone
              onClick={() => {
                setAction("delete");
                setCommentId(comment._id);
                setActionIdx(idx);
              }}
            />
          )}
        </Tooltip>
      </span>,
      <span key="edit">
        <Tooltip title="Edit">
          {action === "edit" && commentId === comment._id ? (
            <EditFilled />
          ) : (
            <EditTwoTone
              onClick={() => {
                setAction("edit");
                setCommentId(comment._id);
                setEditCommentValue(comment.content);
                setActionIdx(idx);
              }}
            />
          )}
        </Tooltip>
      </span>,
    ];
  };
  const fetchThread = async () => {
    const response = await GET_THREAD(props.Thread.docType, props.Thread.docId);
    setComments(response.data.data.comments);
  };
  const deleteComment = async () => {
    const response = await DELETE_COMMENT(
      props.Thread.docType,
      props.Thread.docId,
      commentId
    );
    console.log(response);
  };
  useEffect(() => {
    console.log("Thread", props.Thread);
    if (props.open || refresh) {
      fetchThread();
      if (refresh) {
        setRefresh(false);
      }
    }
  }, [props.open, refresh]);
  const onClose = () => {
    if (props.setThumbnail) {
      props.setThumbnail("");
    }
    props.thread(false);
  };

  useEffect(() => {
    if (action === "delete") {
      Modal.confirm({
        title: "Delete comment?",
        className: "thread-action-confirm",
        getContainer: ".thread",
        icon: <ExclamationCircleOutlined />,
        content: "Are you sure you want to delete this comment?",
        okText: "Yes",
        cancelText: "No",
        onOk: async () => {
          await deleteComment();
          setRefresh(true);
          setAction("");
          setCommentId("");
          setActionIdx("");
        },
        onCancel: () => {
          setAction("");
          setCommentId("");
          setActionIdx("");
        },
      });
    }
  }, [action]);

  // ----- Form handler (Add or Edit Comment)
  const addHandleChange = (e) => {
    setAddCommentValue(e.target.value);
  };
  const editHandleChange = (e) => {
    setEditCommentValue(e.target.value);
  };
  const addHandleSubmit = async (e) => {
    try {
      if (!addCommentValue) {
        message.error("Empty content cannot be submitted!");
        return;
      }
      setAddSubmitting(true);
      const response = await ADD_COMMENT(
        props.Thread.docType,
        props.Thread.docId,
        addCommentValue
      );
      message.success("Comment submitted successfuly!");
      setAddCommentValue("");
      console.log("add_comment", response);
      setRefresh(true);
      setAddSubmitting(false);
      setAction("");
      setCommentId("");
      setActionIdx("");
    } catch (err) {
      console.log("Error", err);
      message.error("Validation error!");
      setAddSubmitting(false);
      setAction("");
      setCommentId("");
      setActionIdx("");
    }
  };
  const editHandleSubmit = async (e) => {
    try {
      if (!editCommentValue) {
        message.error("Empty content cannot be updated!");
        return;
      }
      if (editCommentValue === comments[actionIdx].content) {
        message.info("You haven't made any update to the comment!");
        return;
      }
      setEditSubmitting(true);
      const response = await EDIT_COMMENT(
        props.Thread.docType,
        props.Thread.docId,
        editCommentValue,
        commentId
      );
      message.success("Comment updated successfuly!");
      setEditCommentValue("");
      console.log("edit_comment", response);
      setRefresh(true);
      setEditSubmitting(false);
      setAction("");
      setCommentId("");
      setActionIdx("");
    } catch (err) {
      console.log("Error", err);
      message.error("Validation error!");
      setEditSubmitting(false);
      setAction("");
      setCommentId("");
      setActionIdx("");
    }
  };
  return ReactDom.createPortal(
    <div id="thread">
      <Drawer
        title="Thread"
        className="thread"
        placement="right"
        onClose={onClose}
        open={props.open}
        zIndex={9999}
        bodyStyle={{
          overflow: "hidden",
        }}
      >
        <Row
          style={{
            marginBottom: "10px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {props.thumbnail}
        </Row>
        <div className="comments-section">
          {comments.map((comment, idx) => {
            return (
              <>
                {action === "edit" && commentId === comment._id ? (
                  <Comment
                    avatar={
                      <Avatar
                        icon={<UserOutlined />}
                        src={`${STATIC_URL}${props.userDetails.avatar}`}
                        alt={props.userDetails.name}
                      />
                    }
                    content={
                      <Editor
                        onChange={editHandleChange}
                        onSubmit={editHandleSubmit}
                        submitting={editSubmitting}
                        value={editCommentValue}
                        type="Edit"
                        action={action}
                        setAction={setAction}
                      />
                    }
                  />
                ) : (
                  <Comment
                    actions={
                      props.userDetails.name === comment.authorName &&
                      getActions(comment, idx)
                    }
                    author={<a>{comment.authorName}</a>}
                    avatar={
                      <Avatar
                        icon={<UserOutlined />}
                        src={`${STATIC_URL}/${comment.avatar}`}
                        alt={comment.authorName}
                      />
                    }
                    content={<p>{`${comment.content}`}</p>}
                  />
                )}
              </>
            );
          })}
        </div>
        <Comment
          avatar={
            <Avatar
              icon={<UserOutlined />}
              src={`${STATIC_URL}${props.userDetails.avatar}`}
              alt={props.userDetails.name}
            />
          }
          content={
            <Editor
              onChange={addHandleChange}
              onSubmit={addHandleSubmit}
              submitting={addSubmitting}
              value={addCommentValue}
              type="Add"
            />
          }
        />
      </Drawer>
    </div>,
    document.getElementById("portal-root") as Element
  );
};

const mapStateToProps = (state) => {
  return {
    userDetails: state.Auth.userdetails,
    open: state.Thread.open,
    Thread: state.Thread,
  };
};

export default connect(mapStateToProps, { thread, logout })(Thread);
