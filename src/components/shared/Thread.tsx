import React, { useEffect, useState } from "react";
import ReactDom from "react-dom";
import { Input, Comment, Avatar, Drawer, Form, Button, message } from "antd";
import apis from "src/services/apis";
import http from "src/services/httpCall";
import { STATIC_URL } from "src/constants";
import { UserOutlined } from "@ant-design/icons";
import { logout } from "../../actions/authAction";
import { thread } from "../../actions/threadAction";
import { connect } from "react-redux";
const { TextArea } = Input;

const CREATE_THREAD = async (docType: any, docID: any) => {
  return await http.post(`${apis.THREAD}/${docType}/${docID}`);
};

const GET_THREAD = async (docType: any, docID: any) => {
  return await http.get(`${apis.THREAD}/${docType}/${docID}`);
};

const ADD_COMMENT = async (docType: any, docID: any, content: any) => {
  return await http.patch(`${apis.THREAD}/${docType}/${docID}`, { content });
};

const DELETE_COMMENT = async (docType: any, docID: any, commentID: any) => {
  return await http.delete(`${apis.THREAD}/${docType}/${docID}/${commentID}`);
};

const Editor = ({ onChange, onSubmit, submitting, value }) => (
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
        Add Comment
      </Button>
    </Form.Item>
  </div>
);

const Thread = (props) => {
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState("");
  const [comments, setComments] = useState([]);
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    console.log("Thread", props.Thread);
    const fetchThread = async () => {
      const response = await GET_THREAD(
        props.Thread.docType,
        props.Thread.docId
      );
      setComments(response.data.data.comments);
    };
    if (props.open || refresh) {
      fetchThread();
      if (refresh) {
        setRefresh(false);
      }
    }
  }, [props.open, refresh]);
  const onClose = () => {
    props.thread(false);
  };
  const handleChange = (e) => {
    setValue(e.target.value);
  };
  const handleSubmit = async (e) => {
    try {
      if (!value) {
        message.error("Empty content cannot be submitted!");
        return;
      }
      setSubmitting(true);
      const response = await ADD_COMMENT(
        props.Thread.docType,
        props.Thread.docId,
        value
      );
      console.log("add_comment", response);
      setRefresh(true);
      message.success("Comment submitted successfuly!");
      setSubmitting(false);
      setValue("");
    } catch (err) {
      console.log("Error", err);
      message.error("Validation error!");
      setSubmitting(false);
      setValue("");
    }
  };
  return ReactDom.createPortal(
    <>
      <Drawer
        title="Thread"
        placement="right"
        onClose={onClose}
        open={props.open}
        style={{ position: "absolute", zIndex: 9999 }}
      >
        {comments.map((comment) => {
          return (
            <Comment
              author={<a>{comment.authorName}</a>}
              avatar={
                <Avatar
                  icon={<UserOutlined />}
                  src={`${STATIC_URL}/${comment.avatar}`}
                  alt={comment.authorName}
                />
              }
              content={<p>{`${comment.content}`}</p>}
            ></Comment>
          );
        })}
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
              onChange={handleChange}
              onSubmit={handleSubmit}
              submitting={submitting}
              value={value}
            />
          }
        />
      </Drawer>
    </>,
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
