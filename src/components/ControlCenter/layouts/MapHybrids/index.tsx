import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";

import { SortableContainer, SortableElement } from "react-sortable-hoc";
import arrayMove from "array-move";
import "./twoStreamsWithMap.less";
import VideoBox from "../../utils/VideoBox";
import EmptyFeed from "../../utils/emptyFeed";
import TwoFeedsMap from "./TwoFeedsMap";

const SortableItem = SortableElement(
  ({
    value,
    type,
    ind,
    removeFeed,
    group,
    swapFeed,
    addFeed,
    streamKey,
  }: {
    value: any;
    type: any;
    ind: any;
    removeFeed: any;
    group: any;
    swapFeed: any;
    addFeed: any;
    streamKey: any;
  }) => (
    <Col span={24} className="section-col-videos">
      {type === "feed" ? (
        <VideoBox
          group={group}
          index={ind}
          removeFeed={removeFeed}
          swapFeed={swapFeed}
          streamKey={streamKey}
          value={value}
        />
      ) : (
        <EmptyFeed addFeed={addFeed} group={group} index={ind} />
      )}
    </Col>
  )
);

const SortableList = SortableContainer(
  ({ items, removeFeed, group, addFeed, swapFeed }) => {
    return (
      <Row style={{ height: "100%", alignContent: "space-between" }}>
        {items.map((value, index) => (
          <SortableItem
            key={`item-${index}`}
            index={index}
            ind={index}
            group={group}
            value={value}
            type={value.type}
            removeFeed={removeFeed}
            addFeed={addFeed}
            swapFeed={swapFeed}
            streamKey={value.streamKey}
          />
        ))}
      </Row>
    );
  }
);

function TwoStreamWithMap(props) {
  const [feeds, setFeeds] = useState<any>([]);

  useEffect(() => {
    const feeds = [...props.feeds];
    setFeeds(feeds);
  }, [props]);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const order = arrayMove(feeds, oldIndex, newIndex);
    props.setGroupOrder(props.groupNo, order);
    setFeeds(order);
  };

  return (
    <div className="wrapper">
      <Row className="section-row" gutter={[16, 16]}>
        <Col span={12}>
          <SortableList
            items={feeds}
            onSortEnd={onSortEnd}
            axis="y"
            group={props.groupNo}
            removeFeed={props.removeFeed}
            swapFeed={props.swapFeed}
            addFeed={props.addFeed}
          />
        </Col>
        <Col span={12}>
          {feeds.length && (
            <div className="live-map">
              <TwoFeedsMap feeds={feeds} />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default TwoStreamWithMap;
