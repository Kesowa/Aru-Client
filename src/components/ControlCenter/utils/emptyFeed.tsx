import React from "react";

import "./videoBox.less";

function EmptyFeed(props) {
  return (
    <div
      className="empty_feed"
      onMouseDown={() => {
        props.addFeed(props.group, props.index);
      }}
    >
      <div className="inner">
        <span>+</span>
      </div>
    </div>
  );
}

export default EmptyFeed;
