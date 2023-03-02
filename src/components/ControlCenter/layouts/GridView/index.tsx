import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";

import "./gridLayout.less";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import arrayMove from "array-move";
import GridVideoBox from "./GridVideoBox";
import EmptyFeed from "../../utils/emptyFeed";

const SortableItem = SortableElement(
  ({
    ind,
    value,
    type,
    gridType,
    group,
    addFeed,
    removeFeed,
    swapFeed,
    streamKey,
  }: {
    ind: any;
    value: any;
    type: any;
    gridType: any;
    group: any;
    addFeed: any;
    removeFeed: any;
    swapFeed: any;
    streamKey: any;
  }) => (
    <Col
      span={gridType == 3 ? 8 : 12}
      className="section-col-videos"
      style={{ height: `calc(${100 / gridType}% - 1%)` }}
    >
      {type === "feed" ? (
        <GridVideoBox
          id={value}
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
  ({ items, gridType, groupNo, addFeed, removeFeed, swapFeed }) => {
    return (
      <Row gutter={[16, 8]} className="section-row">
        {items.map((value, index) => (
          <SortableItem
            key={`item-${index}`}
            index={index}
            ind={index}
            value={value}
            streamKey={value.streamKey}
            type={value.type}
            gridType={gridType}
            group={groupNo}
            addFeed={addFeed}
            swapFeed={swapFeed}
            removeFeed={removeFeed}
          />
        ))}
      </Row>
    );
  }
);

function GridLayout(props) {
  const [feeds, setFeeds] = useState<any>([]);

  useEffect(() => {
    const feeds = [...props.group.feeds];
    setFeeds(feeds);
  }, [props]);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const order = arrayMove(feeds, oldIndex, newIndex);
    props.setGroupOrder(props.groupNo, order);
    setFeeds(order);
  };

  return (
    <div className="wrapper">
      <SortableList
        items={feeds}
        gridType={props.group.type}
        groupNo={props.groupNo}
        removeFeed={props.removeFeed}
        addFeed={props.addFeed}
        swapFeed={props.swapFeed}
        onSortEnd={onSortEnd}
        axis="xy"
      />
    </div>
  );
}

export default GridLayout;
