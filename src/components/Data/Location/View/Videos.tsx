import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  message,
  Modal,
  Spin,
  Empty,
  Pagination,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import "./data.less";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import moment from "moment";
import VideoPlayer from "../../../shared/VideoPlayer";
import { STATIC_URL } from "src/constants";
import { AuthContext } from "src/services/authUtils";

const { Text } = Typography;
function Videos(VideoProps) {
  const [VodData, setVodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    if (VideoProps.missionID !== 0) {
      http
        .get(`${apis.FETCH_VIDEOS_BY_LOCATION_ID}`, {
          params: {
            id: VideoProps.id,
            page: page,
            limit: limit,
          },
        })
        .then((res) => {
          setVodData(res.data.data);
          setTotal(res.data.total);
          setLoading(false);
        })
        .catch((err) => {
          message.error("ERROR" + err + "Could not fetch streams");
          AxiosErrorHandler(err, logout);
        });
    }
  }, [VideoProps, page, limit]);

  const setPageLimit = (currPage, limit) => {
    setPage(currPage);
    setLimit(limit);
  };

  const setPaginationPage = (p) => {
    setPage(p);
  };

  function openVideoPlayer(link: any, name: any, missionDetails: any[]) {
    Modal.info({
      title: "Flight Name: " + name,
      content: (
        <div style={{ height: "510px", backgroundColor: "#0000" }}>
          <VideoPlayer // NEED TO PASS MISSION DETAILS AND LIVE TAG CHECK
            url={STATIC_URL + link}
            handleTheater=""
            theater=""
            handlePip=""
            pip=""
            streamKey=""
            mission={missionDetails}
            alertBtnStatus="none"
            theatreModeStatus="none"
            liveTagStatus="none"
          />
        </div>
      ),
      centered: true,
      width: 1000,
      onOk() {},
    });
  }
  function renderVideos(data: any[]) {
    return data.map((dataa) => (
      <Col span={5} className="video-thumbnail">
        <Card
          onClick={() =>
            openVideoPlayer(dataa.videoPath, dataa.flightID?.name, dataa)
          }
          className="video-card"
          cover={<img src={STATIC_URL + dataa.thumbnail} />}
        >
          <Row style={{ marginTop: "-12px" }}>
            <Col span={18}>
              <Text strong>{dataa.flightID?.name}</Text>
            </Col>
          </Row>

          <Text type="secondary">
            <CalendarOutlined />
            {moment(dataa.createdAt).format("lll")}
          </Text>
        </Card>
      </Col>
    ));
  }
  return (
    <React.Fragment>
      <Row>
        {loading ? (
          <div style={{ margin: "auto", marginTop: "5%" }}>
            <Spin size="large" />
          </div>
        ) : VodData.length > 0 ? (
          renderVideos(VodData)
        ) : (
          <Empty style={{ margin: "auto" }} />
        )}
      </Row>
      <Pagination
        onShowSizeChange={setPageLimit}
        current={page}
        onChange={setPaginationPage}
        total={total}
        style={{ marginBottom: "20px", marginTop: "20px" }}
      />
    </React.Fragment>
  );
}

export default Videos;
