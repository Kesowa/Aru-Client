import React, { useContext, useEffect, useState } from "react";
import ReactDom from "react-dom";
import {
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
import moment from "moment-timezone";
import "./index.less";
import Mentions from "../Mentions";
import VideoPlayer from "../VideoPlayer";
import { AuthContext } from "src/services/authUtils";
import { ThreadContext } from "src/services/threadUtils";

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
  tags,
}) => {
  return (
    <div>
      <Form.Item>
        <Mentions tags={tags} handleChange={onChange} value={value} />
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
};
const Thread = (props) => {
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [addCommentValue, setAddCommentValue] = useState("");
  const [editCommentValue, setEditCommentValue] = useState("");
  const [allMentions, setAllMentions] = useState([]);
  const [openVOD, setOpenVOD] = useState({ status: false, seek: 0 });
  const [comments, setComments] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [action, setAction] = useState("");
  const [commentId, setCommentId] = useState("");
  const [actionIdx, setActionIdx] = useState("");

  const { Auth } = useContext(AuthContext);
  const userDetails = Auth.userdetails;

  const { thread, closeThread } = useContext(ThreadContext);

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
  const filterArrayWithUniqueIds = (data: any) => {
    const uniqueIds = new Set();
    return data.filter((obj) => {
      if (uniqueIds.has(obj.id)) {
        return false; // Skip duplicates
      } else {
        uniqueIds.add(obj.id);
        return true; // Include unique objects
      }
    });
  };

  const extractMentionsAndFormatText = (comments) => {
    const regex = /@\[([^[\]]+)\]\(([^()]+)\)/g;
    const mentions = [];
    const modifiedComments = [];
    comments.map((comment) => {
      const modifiedText = comment.content.replace(
        regex,
        (match, display, id) => {
          mentions.push({ display, id });
          return display;
        }
      );
      modifiedComments.push({ ...comment, displayContent: modifiedText });
    });
    const uniqueMentions = filterArrayWithUniqueIds(mentions);
    setAllMentions(uniqueMentions);
    setComments(modifiedComments);
  };

  const checkStringForMentions = (str) => {
    for (const mention of allMentions) {
      if (str.includes(mention.display)) {
        return true;
      }
    }
    return false;
  };
  const checkStringForKeyValue = (str, key) => {
    const foundObject = allMentions.find(
      (obj) => obj[key] && str.includes(obj[key])
    );
    return foundObject || false;
  };
  const CommentWithFormattedMentions = ({ text }) => {
    const words = text.replace("\n", " \n").split(" ");
    return words.map((word) => {
      const mention = checkStringForKeyValue(word, "display");
      // Apply formatting to specific words based on conditions
      if (mention) {
        return (
          <a
            className="mention-link"
            onClick={() => {
              setOpenVOD({ status: true, seek: mention.id });
            }}
            key={window.crypto.randomUUID()}
          >
            <span
              key={window.crypto.randomUUID()}
              style={{
                backgroundColor: "#d3d3d3",
                borderRadius: "3px",
                textDecoration: "underline",
              }}
            >
              {word}
            </span>{" "}
          </a>
        );
      } else {
        return `${word} `;
      }
    });
  };

  const fetchThread = async () => {
    const response = await GET_THREAD(thread.docType, thread.docId);
    extractMentionsAndFormatText(response.data.data.comments);
  };
  const deleteComment = async () => {
    const response = await DELETE_COMMENT(
      thread.docType,
      thread.docId,
      commentId
    );
    console.log(response);
  };
  useEffect(() => {
    console.log("Thread", thread);
    if (thread.open || refresh) {
      fetchThread();
      if (refresh) {
        setRefresh(false);
      }
    }
  }, [thread.open, refresh]);
  const onClose = () => {
    if (props.thumbnail) {
      props.setThumbnail("");
    }
    if (thread.docType === "vod") {
      setOpenVOD({ status: false, seek: 0 });
    }
    closeThread();
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
        thread.docType,
        thread.docId,
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
        thread.docType,
        thread.docId,
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
      {thread.docType === "vod" && props.data && openVOD.status && (
        <>
          <div
            style={{
              height: "400px", //video player
              width: "712px",
              margin: "auto",
              backgroundColor: "black",
              zIndex: 9999,
            }}
            className="video-div"
          >
            <VideoPlayer // NEED TO PASS MISSION DETAILS AND LIVE TAG CHECK
              url={STATIC_URL + props.data.link}
              mission={props.data.missionDetails}
              alertBtnStatus=""
              theatreModeStatus="none"
              liveTagStatus="none"
              liveTelemetry={false}
              showHUD={false}
              seek={openVOD.seek}
            />
          </div>
        </>
      )}
      <Drawer
        title="Thread"
        className="thread"
        placement="right"
        onClose={onClose}
        open={thread.open}
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
                        src={`${STATIC_URL}${userDetails.avatar}`}
                        alt={userDetails.name}
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
                        tags={thread.tags?.bookmarks ? thread.tags.bookmarks : {}}
                      />
                    }
                  />
                ) : (
                  <Comment
                    actions={
                      userDetails.name === comment.authorName &&
                      getActions(comment, idx)
                    }
                    author={<a>{comment.authorName}</a>}
                    datetime={
                      <span style={{ display: "flex" }}>
                        {moment(comment.updatedAt).format("DD/MM/YYYY")}
                        {Date.parse(comment.updatedAt) >
                          Date.parse(comment.createdAt) && (
                          <p>&nbsp;&nbsp;[ edited ]</p>
                        )}
                      </span>
                    }
                    avatar={
                      <Avatar
                        icon={<UserOutlined />}
                        src={`${STATIC_URL}/${comment.avatar}`}
                        alt={comment.authorName}
                      />
                    }
                    content={
                      checkStringForMentions(comment.content) &&
                      comment.displayContent ? (
                        <p>
                          <CommentWithFormattedMentions
                            text={comment.displayContent}
                          />
                        </p>
                      ) : (
                        <p>{`${comment.content}`}</p>
                      )
                    }
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
              src={`${STATIC_URL}${userDetails.avatar}`}
              alt={userDetails.name}
            />
          }
          content={
            <>
              <Editor
                onChange={addHandleChange}
                onSubmit={addHandleSubmit}
                submitting={addSubmitting}
                value={addCommentValue}
                tags={thread.tags?.bookmarks ? thread.tags.bookmarks : {}}
                type="Add"
              />
            </>
          }
        />
      </Drawer>
    </div>,
    document.getElementById("portal-root") as Element
  );
};

export default Thread;
