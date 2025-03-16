import { useState, useEffect } from "react";
import {
  Button,
  Row,
  Col,
  Typography,
  Tooltip,
  Select,
  Dropdown,
  Carousel,
  Modal,
  Card,
  Layout,
  message,
  Avatar,
  Divider,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  SettingOutlined,
  LayoutOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  BellFilled,
} from "@ant-design/icons";
import "./index.less";
import GridView from "./layouts/GridView";
import MapHybrids from "./layouts/MapHybrids"; //TwoStreamWithMap
import FocusHybrids from "./layouts/FocusHybrids"; //ThreeStreamsView
import http from "../../services/httpCall";
import apis from "../../services/apis";
import moment from "moment";
import Video from "./utils/thumbnailVideo";
import { STATIC_URL } from "src/constants";

const { Content, Footer, Header, Sider } = Layout;
const { Meta } = Card;
const { Title } = Typography;
const { Option } = Select;

const themes = {
  dark: `/dark-theme.css`,
  light: `/light-theme.css`,
};

function GridLive(props: any) {
  const [allFeeds, setallFeeds] = useState<any>([]);
  const [feedGroups, setFeedGroups] = useState<any>([]);
  const [currentPage, setcurrentPage] = useState(0);
  const [isLayoutModalVisible, setisLayoutModalVisible] = useState(false);
  const [feedPool, setFeedPool] = useState<any>([]);
  const [addFeedModal, setAddFeedModal] = useState(false);
  const [feedToAdd, setFeedToAdd] = useState<any>({});
  const [placeToAddFeed, setPlaceToAddFeed] = useState<any>([]);
  const [feedToReplace, setFeedToReplace] = useState<any>([]);
  const [replaceWith, setReplaceWith] = useState<any>({});
  const [replaceFeedModalData, setReplaceFeedModalData] = useState<any>([]);
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    props.setSideBarCollapsed(true);
  }, []);
  const menu = {
    items: [
      {
        key: "1",
        label: (
          <a target="_blank" rel="noopener noreferrer">
            {"   "}
            Change layout
          </a>
        ),
        icon: <LayoutOutlined />,
      },
    ],
    onClick: (e) => setisLayoutModalVisible(true),
  };

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++ change current page layout +++++++++++++++++++++++++++++++++++++++++++++++++

  const changeLayout = (layout: any, type: any = null) => {
    const allGroups = [...feedGroups];
    const currentGroup = { ...allGroups[currentPage] };
    const feeds = [...currentGroup.feeds];
    const extraFeeds: any = [];
    const pool = [...feedPool];
    let newLayout;
    if (currentGroup.layout === layout && type == null) {
      setisLayoutModalVisible(false);
      return;
    }
    console.log("Layout", layout, currentGroup, pool);
    switch (layout) {
      case "twoFeeds":
        while (feeds.length > 2) {
          extraFeeds.push(feeds.pop());
        }

        while (extraFeeds.length) {
          const feed = extraFeeds.pop();
          if (feed.type === "feed") {
            pool.push(feed);
          }
        }
        break;

      case "grid":
        console.log("Grid Layout 1", feeds, pool);
        if (currentGroup.layout === "twoFeeds") {
          feeds.push(...pool.splice(0, 2));
        } else {
          feeds.push(...pool.splice(0, 1));
        }
        if (type === 2) {
          if (feeds.length > 4) {
            while (feeds.length > 4) {
              extraFeeds.push(feeds.pop());
            }

            while (extraFeeds.length) {
              const feed = extraFeeds.pop();
              if (feed.type === "feed") {
                pool.push(feed);
              }
            }
          } else {
            while (feeds.length < 4) {
              feeds.push({
                type: "emptyFeed",
              });
            }
          }
        } else if (type === 3) {
          while (feeds.length < 9) {
            feeds.push({
              type: "emptyFeed",
            });
          }
        }
        console.log("Grid Layout 2", feeds, pool);
        break;

      case "threeFeeds":
        if (currentGroup.layout === "twoFeeds") {
          if (feeds.length == 1) {
            feeds.push(...pool.splice(0, 2));
          } else {
            feeds.push(...pool.splice(0, 1));
          }
        } else {
          if (feeds.length > 3) {
            extraFeeds.push(feeds.pop());
          }
          while (extraFeeds.length) {
            const feed = extraFeeds.pop();
            if (feed.type === "feed") {
              pool.push(feed);
            }
          }
        }

        break;

      default:
        return;
    }
    newLayout = {
      layout,
      type,
      feeds: [...feeds],
    };
    allGroups[currentPage] = { ...newLayout };

    // Set extra feeds in the feed pool
    setFeedPool(pool);

    // set modified groups
    setFeedGroups(allGroups);
    setisLayoutModalVisible(false);
  };

  function handleChange(value) {
    console.log(`selected ${value}`);
  }

  const chunk = function (arr, size) {
    const result: any[] = [];
    while (arr.length) {
      result.push(arr.splice(0, size));
    }

    return result;
  };

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const userdetails = await http.get(`${apis.GET_USER_DETAILS}`);
        const tenantId = userdetails.data.data.tenantId._id;

        const result = await http.get(
          `${apis.FETCH_ALL_STREAM_KEYS}?tenantID=${tenantId}`
        );

        const resultFeeds = result.data;
        console.log(resultFeeds);
        console.log("Result feeds here: ---------" + resultFeeds);
        if (resultFeeds.length) {
          const feeds = await Promise.all(
            resultFeeds.map(async (feed) => {
              console.log("Result feed missionID: ---------" + feed.missionID);
              const flight = await http.post(
                `${apis.FETCH_FLIGHTS_BY_MISSION_ID}`,
                {
                  missionID: `${feed.missionID}`,
                }
              );
              console.log("Flight data+++++++++++++++++++++" + flight.data);
              return {
                ...feed,
                flight: {
                  ...flight.data.data,
                },
                type: "feed",
              };
            })
          );

          setallFeeds(feeds);

          const feedChunks = chunk(feeds, 4);

          const groups = feedChunks.map((feed) => {
            console.log(feed);
            return {
              layout: "grid",
              feeds: feed,
            };
          });

          const allGroups = groups.map((group) => {
            const layout = group.layout;
            const feeds = [...group.feeds];
            if (layout === "grid") {
              while (feeds.length < 4) {
                feeds.push({
                  type: "emptyFeed",
                });
              }
            } else if (layout === "twoFeeds") {
              while (feeds.length < 2) {
                feeds.push({
                  type: "emptyFeed",
                });
              }
            } else {
              while (feeds.length < 3) {
                feeds.push({
                  type: "emptyFeed",
                });
              }
            }

            return {
              layout,
              feeds,
            };
          });

          setFeedGroups(allGroups);
        } else {
          setallFeeds(0);
        }
      } catch (err) {
        console.log(err);
        message.error("Could Not Fetch The Streams");
      }
    };

    fetchStreams();
  }, []);

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++ REMOVE FEED +++++++++++++++++++++++++++++++++++++++++++++++++
  const removeFeed = (group, index) => {
    const groups = [...feedGroups];

    const requiredGroup = {
      ...groups[group],
    };

    const feed = {
      ...requiredGroup.feeds[index],
    };

    requiredGroup.feeds[index] = {
      type: "emptyFeed",
    };

    const pool = [...feedPool];

    pool.push(feed);

    groups[group] = requiredGroup;

    console.log(pool);

    setFeedPool(pool);
    setFeedGroups(groups);
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++ add feed +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const addFeed = (group, index) => {
    setFeedToAdd(null);
    setPlaceToAddFeed([]);
    setPlaceToAddFeed([group, index]);
    setAddFeedModal(true);
  };

  const setGroupOrder = (groupno, group) => {
    const allGroups = [...feedGroups];
    allGroups[groupno].feeds = [...group];
  };

  const addFeedToPlace = () => {
    if (!feedToAdd) {
      setAddFeedModal(false);
      return;
    }

    const [group, index] = [...placeToAddFeed];
    const feed = {
      ...feedToAdd,
    };

    const allGroups = [...feedGroups];

    const requiredGroup = {
      ...allGroups[group],
    };

    requiredGroup.feeds[index] = {
      ...feed,
    };

    allGroups[group] = {
      ...requiredGroup,
    };

    // find the item from the pool which has to be removed
    const pool = [...feedPool];
    const indexToRemove = pool.findIndex(
      (feedToRemove) => feedToRemove.id === feed.id
    );

    // remove the item from the pool
    pool.splice(indexToRemove, 1);

    setFeedPool(pool);
    setFeedGroups(allGroups);
    setAddFeedModal(false);
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++ feed started before ++++++++++++++++++++++++++++++++++++++++++++++++++

  const streamStarted = (feed) => {
    const startTime = feed.createdAt.split(".")[0];

    const flightStarted = moment(startTime);

    const now = moment(new Date());

    const duration = moment.duration(now.diff(flightStarted));

    const hours = ("0" + duration.hours().toString()).slice(-2);

    // duration in minutes
    let minutes = ("0" + duration.minutes().toString()).slice(-2);

    minutes = JSON.stringify(Number(hours) * 60 + Number(minutes));

    const time = `${minutes} mins ago`;

    return time;
  };

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++ Add a new page ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const addNewPage = () => {
    const allGroups = [...feedGroups];

    const newGroup: any = {
      layout: "grid",
      feeds: [],
    };

    while (newGroup.feeds.length < 4) {
      newGroup.feeds.push({
        type: "empty feed",
      });
    }

    allGroups.push(newGroup);

    setFeedGroups(allGroups);
  };

  const swapFeed = (group, index) => {
    setFeedToReplace([group, index]);
    const allGroups = [...feedGroups];
    const allFeeds: any = [];

    for (let i = 0; i < allGroups.length; i++) {
      allGroups[i].feeds.forEach((feed, index) => {
        if (feed.type === "feed") {
          allFeeds.push({
            group: i,
            index: index,
            feed: {
              ...feed,
            },
          });
        }
      });
    }
    console.log("setReplaceFeedModalData", allFeeds);
    setReplaceFeedModalData(allFeeds);
    setShowSwapModal(true);
  };
  const resetChangeFeedModal = () => {
    setShowSwapModal(false);
    setFeedToReplace([]);
    setReplaceWith(null);
  };
  const replaceFeed = () => {
    if (!feedToReplace) {
      setShowSwapModal(false);
      return;
    }
    const [group, index] = [...feedToReplace];
    const allGroups = [...feedGroups];
    const feed = {
      ...replaceWith,
    };

    allGroups[feed.group].feeds[feed.index] = {
      ...allGroups[group].feeds[index],
    };

    allGroups[group].feeds[index] = {
      ...feed.feed,
    };
    setFeedGroups(allGroups);
    resetChangeFeedModal();
  };

  return (
    <div className="wrap">
      <Layout hasSider>
        <Sider className="right-sider">
          <div className="sider-header-div">
            <Dropdown menu={menu} placement="bottom">
              <Button
                size="large"
                shape="circle"
                icon={<SettingOutlined />}
                className="header-button"
              ></Button>
            </Dropdown>
          </div>
          <div
            className="sider-center-div"
            onClick={addNewPage}
            style={{ cursor: "pointer" }}
          >
            <Tooltip title="Add new page">
              <Button
                size="large"
                shape="circle"
                onClick={addNewPage}
                icon={<PlusOutlined />}
                className="add-button"
              ></Button>
            </Tooltip>
          </div>
        </Sider>
        <Layout className="layout">
          <Header className="header">
            <Row style={{ justifyContent: "flex-end" }}>
              <div className="header-right-content">
                <Tooltip title="Notification">
                  <BellFilled className="header-icon gray" />
                </Tooltip>

                <Tooltip title="User Info">
                  <Button
                    size="small"
                    shape="circle"
                    icon={<UserOutlined />}
                    className="header-icon header-button gray"
                  />
                </Tooltip>
              </div>
            </Row>
          </Header>
          <Content>
            <div
              style={{
                width: "100%",
                height: "100%",
                margin: "auto",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              {allFeeds !== 0 ? (
                <Carousel
                  arrows
                  nextArrow={<ArrowRightOutlined />}
                  prevArrow={<ArrowLeftOutlined />}
                  afterChange={(current) => {
                    setcurrentPage(current);
                  }}
                >
                  {feedGroups.map((group, index) => {
                    if (group.layout === "grid") {
                      return (
                        <GridView
                          group={group}
                          groupNo={index}
                          removeFeed={removeFeed}
                          addFeed={addFeed}
                          swapFeed={swapFeed}
                          setGroupOrder={setGroupOrder}
                        />
                      );
                    } else if (group.layout === "twoFeeds") {
                      return (
                        <MapHybrids
                          feeds={group.feeds}
                          groupNo={index}
                          removeFeed={removeFeed}
                          addFeed={addFeed}
                          swapFeed={swapFeed}
                          setGroupOrder={setGroupOrder}
                        />
                      );
                    } else if (group.layout === "threeFeeds") {
                      return (
                        <FocusHybrids
                          feeds={group.feeds}
                          groupNo={index}
                          removeFeed={removeFeed}
                          addFeed={addFeed}
                          swapFeed={swapFeed}
                          setGroupOrder={setGroupOrder}
                        />
                      );
                    }
                  })}
                </Carousel>
              ) : (
                <div
                  className="wrapper"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      fontWeight: "bold",
                      fontSize: "32px",
                      letterSpacing: "0.1rem",
                    }}
                  >
                    No Missions Are Live
                  </p>
                </div>
              )}
            </div>
          </Content>
          {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ change layout model +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
          <Modal
            title="Change Layout"
            open={isLayoutModalVisible}
            footer={null}
            onCancel={() => {
              setisLayoutModalVisible(false);
            }}
            bodyStyle={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 200px)",
            }}
            className="change-layout-modal"
          >
            <h3>Grids</h3>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col
                onClick={() => {
                  changeLayout("grid", 2);
                }}
              >
                <img
                  src={`/layout-images/2x2grid.svg`}
                  alt=""
                  className="layout-icon"
                />
                <h3>2 x 2</h3>
              </Col>
              <Col
                onClick={() => {
                  changeLayout("grid", 3);
                }}
              >
                <img
                  src={`/layout-images/3x3grid.svg`}
                  alt=""
                  className="layout-icon"
                />
                <h3>3 x 3</h3>
              </Col>
            </Row>
            <Divider />
            <div
              onClick={() => {
                changeLayout("twoFeeds");
              }}
            >
              <h3>Map hybrids</h3>
              <img
                src={`/layout-images/2feedmap_view.svg`}
                alt=""
                className="layout-icon"
              />
              <h3>2 Feeds + Map</h3>
            </div>
            <Divider />
            <div
              onClick={() => {
                changeLayout("threeFeeds");
              }}
            >
              <h3>Focus hybrids</h3>
              <img
                src={`/layout-images/3feed_view.svg`}
                alt=""
                className="layout-icon"
              />
              <h3>Three Feeds</h3>
            </div>
          </Modal>

          {/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++Modal to add feed ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

          <Modal
            title="Add Feed"
            bodyStyle={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 200px)",
            }}
            className="feed-modal"
            open={addFeedModal}
            cancelButtonProps={{ style: { display: "none" } }}
            okText="Add"
            onCancel={() => {
              setFeedToAdd(null);
              setAddFeedModal(false);
            }}
            onOk={addFeedToPlace}
          >
            {feedPool.length !== 0 ? (
              <Row className={"add-feed-row"}>
                {feedPool.map((feed, idx) => (
                  <>
                    {console.log("AddFeed", feed)}
                    <Col
                      span={24}
                      style={{
                        padding: "8px",
                        height: "100px",
                        cursor: "pointer",
                      }}
                      className={`feed-to-add ${
                        feedToAdd && feedToAdd._id === feed._id
                          ? "feed-to-add-selected"
                          : ""
                      }`}
                      onClick={() => setFeedToAdd(feed)}
                    >
                      <Row gutter={[16, 0]} className="feed">
                        <Col span={8} className="feed-thumbnail">
                          <Video />
                        </Col>
                        <Col span={16} className="feed-details">
                          <span className="feed-location">
                            {feed.flight[0].geoLocation}
                          </span>
                          <p className="feed-mission-name">
                            {feed.flight[0].mission?.name}
                          </p>
                          <div className="pilot-avatar">
                            <div>
                              <Avatar
                                size={20}
                                style={{ background: "#758283" }}
                                src={`${STATIC_URL}${feed.flight[0].pilotID.avatar}`}
                              />
                              <span style={{ paddingLeft: "10px" }}>
                                {feed.flight[0].pilotID.name} . NKDA-Phantom
                              </span>
                            </div>
                            <div className="feed-started">
                              <span>{streamStarted(feed)}</span>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                    {feedPool.length - 1 !== idx ? <Divider /> : ""}
                  </>
                ))}
              </Row>
            ) : (
              <div className="no-feed">
                <h3>No Feeds to Add</h3>
              </div>
            )}
          </Modal>

          <Modal
            title="Change Feed"
            bodyStyle={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 200px)",
            }}
            className="feed-modal"
            cancelButtonProps={{ style: { display: "none" } }}
            okText="Switch"
            open={showSwapModal}
            onCancel={resetChangeFeedModal}
            onOk={replaceFeed}
          >
            <Row className={"add-feed-row"}>
              {replaceFeedModalData.map((feed, idx) => (
                <>
                  <Col
                    span={24}
                    style={{
                      padding: "8px",
                      height: "100px",
                      cursor: "pointer",
                    }}
                    className={`feed-to-add ${
                      replaceWith &&
                      replaceWith.feed &&
                      replaceWith.feed._id &&
                      replaceWith.feed._id === feed.feed._id
                        ? "feed-to-add-selected"
                        : ""
                    }`}
                    onClick={() => setReplaceWith(feed)}
                  >
                    <Row gutter={[16, 0]} className="feed">
                      <Col span={8} className="feed-thumbnail">
                        <Video />
                      </Col>
                      <Col span={16} className="feed-details">
                        <span className="feed-location">
                          {feed?.feed?.flight[0]?.geoLocation}
                        </span>
                        <p className="feed-mission-name">
                          {feed?.feed?.flight[0]?.mission?.name}
                        </p>
                        <div className="pilot-avatar">
                          <div>
                            <Avatar
                              size={20}
                              style={{ background: "#758283" }}
                              src={`${STATIC_URL}${feed?.feed?.flight[0]?.pilotID?.avatar}`}
                            />
                            <span style={{ paddingLeft: "10px" }}>
                              {feed?.feed?.flight[0]?.pilotID?.name} .
                              NKDA-Phantom
                            </span>
                          </div>
                          <div className="feed-started">
                            <span>{streamStarted(feed.feed)}</span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  {replaceFeedModalData.length - 1 !== idx ? <Divider /> : ""}
                </>
              ))}
            </Row>
          </Modal>
        </Layout>
      </Layout>
    </div>
  );
}

export default GridLive;
