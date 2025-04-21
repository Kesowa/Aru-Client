import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import "./threeStreamsView.less";
import VideoBox from "../../utils/VideoBox";
import EmptyFeed from "../../utils/emptyFeed";
import ThreeStreamViewDetails from "./ThreeStreamsViewDetails";

function TwoStreamWithMap(props) {
  const [feeds, setFeeds] = useState<any>([]);
  const viewInLarge = (feedToSwap) => {
    let allFeeds = [...feeds];
    console.log(allFeeds);
    const firstFeed = allFeeds[0];

    allFeeds = allFeeds.map((feed, index) => {
      if (index === 0) {
        return feedToSwap;
      } else if (feed.type === "feed" && feed._id === feedToSwap._id) {
        return firstFeed;
      } else {
        return feed;
      }
    });

    props.setGroupOrder(props.groupNo, allFeeds);

    setFeeds(allFeeds);
  };

  useEffect(() => {
    const feeds = [...props.feeds];

    setFeeds(feeds);

    return () => {
      console.log("unmounted");
    };
  }, [props]);

  return (
    <div className="wrapper">
      {feeds.length && (
        <React.Fragment>
          <Row gutter={[16, 16]} className="large-section-row">
            <Col span={16} className="large-section">
              {feeds[0].type === "feed" ? (
                <VideoBox
                  index={0}
                  id={feeds[0].id}
                  group={props.groupNo}
                  removeFeed={props.removeFeed}
                  streamKey={feeds[0].streamKey}
                  value={feeds[0]}
                />
              ) : (
                <EmptyFeed
                  addFeed={props.addFeed}
                  group={props.groupNo}
                  index={0}
                />
              )}
            </Col>
            <Col span={8}>
              <ThreeStreamViewDetails feed={feeds[0]} />
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="small-section-row">
            {feeds.map((feed, index) => (
              <React.Fragment key={window.crypto.randomUUID()}>
                {feed.id === feeds[0].id ? (
                  <Col span={8} key={window.crypto.randomUUID()} className="small-section">
                    {feed.type === "feed" ? (
                      <span
                        onClick={() => {
                          viewInLarge(feed);
                        }}
                        className={"show-border"}
                      >
                        <VideoBox
                          index={index}
                          id={feed.id}
                          group={props.groupNo}
                          removeFeed={props.removeFeed}
                          swapFeed={props.swapFeed}
                          streamKey={feed.streamKey}
                          value={feed}
                        />
                      </span>
                    ) : (
                      <EmptyFeed
                        addFeed={props.addFeed}
                        group={props.groupNo}
                        index={index}
                      />
                    )}
                  </Col>
                ) : (
                  <Col span={8} key={window.crypto.randomUUID()} className="small-section">
                    {feed.type === "feed" ? (
                      <span
                        onClick={() => {
                          viewInLarge(feed);
                        }}
                      >
                        <VideoBox
                          index={index}
                          id={feed.id}
                          group={props.groupNo}
                          removeFeed={props.removeFeed}
                          swapFeed={props.swapFeed}
                          value={feed}
                        />
                      </span>
                    ) : (
                      <EmptyFeed
                        addFeed={props.addFeed}
                        group={props.groupNo}
                        index={index}
                      />
                    )}
                  </Col>
                )}
              </React.Fragment>
            ))}
          </Row>
        </React.Fragment>
      )}
    </div>
  );
}

export default TwoStreamWithMap;
