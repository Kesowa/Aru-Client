import { Button } from "antd";
import "./videoBox.less";

function EmptyFeed(props) {
  return (
    <Button
      type="text"
      className="empty_feed"
      onMouseDown={() => {
        props.addFeed(props.group, props.index);
      }}
    >
      <div className="inner">
        <span>+</span>
      </div>
    </Button>
  );
}

export default EmptyFeed;
