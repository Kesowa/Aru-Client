import React, { useState, useEffect, useContext } from "react";
import { connect } from "react-redux";
import {
  Progress,
  Row,
  Col,
  message,
  Typography,
  Skeleton,
  Divider,
} from "antd";
import http from "../../../services/httpCall";
import apis from "../../../services/apis";
import { AxiosErrorHandler } from "../../../services/httpErrorHandle";
import "../index.less";
import moment from "moment";
import {
  FilePdfOutlined,
  LayoutOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { STATIC_URL } from "src/constants";
import { AuthContext } from "src/services/authUtils";
const today = moment();

function OrganisationPackageDetails(props: any) {
  const [loader, setLoader] = useState(false);
  const [storage, setStorage] = useState<any>({});
  const [packageInfo, setPackageInfo] = useState<any>({});

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    setLoader(true);
    http
      .get(`${apis.GET_TENANT_STATS}`)
      .then((res: any) => {
        if (res.data.status) {
          console.log(res.data);
          setStorage(res.data.data);
          setPackageInfo(res.data.packageData);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err: any) => {
        AxiosErrorHandler(err, logout);
      })
      .finally(() => setLoader(false));
  }, []);

  return (
    <div className="organisation-level-package-details-wrapper">
      <div className="organisation-level-package-details-inner">
        <Row justify="start" align="middle">
          <Col style={{ marginRight: "30px" }}>
            {packageInfo ? (
              <Progress
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                strokeWidth={10}
                width={250}
                type="circle"
                strokeLinecap="square"
                percent={
                  !loader
                    ? (today.diff(
                        moment(props.tenantData.packageStartDate),
                        "days"
                      ) *
                        100) /
                      packageInfo.duration
                    : 0
                }
                format={(percent) => (
                  <p style={{ fontSize: "15px" }}>
                    {!loader
                      ? `Expires on : ${moment(
                          props.tenantData.packageStartDate
                        )
                          .add(packageInfo.duration, "days")
                          .format("DD-MM-YYYY")}`
                      : "loading..."}
                  </p>
                )}
              />
            ) : (
              <Progress
                strokeWidth={10}
                width={250}
                status="exception"
                type="circle"
                percent={100}
                format={(percent) => (
                  <Typography.Title level={3}>
                    No active package
                  </Typography.Title>
                )}
              />
            )}
          </Col>
          <Col flex="auto">
            <Skeleton loading={loader} paragraph={{ rows: 3 }} active>
              <Typography.Title
                level={4}
              >{`Package name : ${packageInfo.name}`}</Typography.Title>
              <Typography.Title level={4}>{`Total Storage : ${
                packageInfo.storage / 1000
              } GB`}</Typography.Title>
              <Typography.Title
                level={4}
              >{`Total users : ${packageInfo.userCount}`}</Typography.Title>
            </Skeleton>
          </Col>

          <Col>
            <Skeleton
              loading={loader}
              active
              avatar={{ size: "large", shape: "square" }}
            >
              <img
                src={`${STATIC_URL}${packageInfo.poster}`}
                alt="package-poster"
                className="organisation-package-poster"
              />
            </Skeleton>
          </Col>
        </Row>
        <div className="Progress-stack">
          <Skeleton loading={loader} active paragraph={{ rows: 6 }}>
            <Row justify="space-between">
              <Col>
                <Typography.Title level={4}>Total Storage</Typography.Title>
              </Col>
              <Col>{`${(storage.actualSize / 1000).toFixed(3)} GB used / ${
                packageInfo.storage / 1000
              } GB`}</Col>
            </Row>
            <Progress
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              strokeWidth={20}
              showInfo={false}
              percent={Math.round(
                (storage.actualSize * 100) / packageInfo.storage
              )}
            />

            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>
                <VideoCameraOutlined /> Videos:
              </Col>
              <Col>{`${(storage.allVodSize / 1000).toFixed(3)} GB / ${(
                storage.actualSize / 1000
              ).toFixed(3)} GB`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.allVodSize * 100) / storage.actualSize
              )}
            />

            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>
                <FileImageOutlined /> Alerts:
              </Col>
              <Col>{`${(storage.allAlertSize / 1000).toFixed(3)} GB / ${(
                storage.actualSize / 1000
              ).toFixed(3)} GB`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.allAlertSize * 100) / storage.actualSize
              )}
            />

            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>
                <LayoutOutlined /> Layers:
              </Col>
              <Col>{`${(storage.allLayerSize / 1000).toFixed(3)} GB / ${(
                storage.actualSize / 1000
              ).toFixed(3)} GB`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.allLayerSize * 100) / storage.actualSize
              )}
            />

            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>
                <FilePdfOutlined /> Documents:
              </Col>
              <Col>{`${(storage.allDocumentsSize / 1000).toFixed(3)} GB / ${(
                storage.actualSize / 1000
              ).toFixed(3)} GB`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.allDocumentsSize * 100) / storage.actualSize
              )}
            />
            <Divider />
            <Typography.Title level={4}>Package stats</Typography.Title>
            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>User Count:</Col>
              <Col>{`${storage.actualUserCount} / ${packageInfo.userCount}`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.actualUserCount * 100) / packageInfo.userCount
              )}
            />
            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>Usergroup count:</Col>
              <Col>{`${storage.actualUserGroupCount} / ${packageInfo.userGroupCount}`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.actualUserGroupCount * 100) /
                  packageInfo.userGroupCount
              )}
            />
            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>Alert count:</Col>
              <Col>{`${storage.actualAlertCount} / ${packageInfo.alertCount}`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.actualAlertCount * 100) / packageInfo.alertCount
              )}
            />

            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>Client count:</Col>
              <Col>{`${storage.actualClientCount} / ${packageInfo.clientCount}`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.actualClientCount * 100) / packageInfo.clientCount
              )}
            />

            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>Layer count:</Col>
              <Col>{`${storage.actualLayerCount} / ${packageInfo.layerCount}`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.actualLayerCount * 100) / packageInfo.layerCount
              )}
            />

            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>Location count:</Col>
              <Col>{`${storage.actualLocationCount} / ${packageInfo.locationCount}`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.actualLocationCount * 100) / packageInfo.locationCount
              )}
            />

            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>Mission count:</Col>
              <Col>{`${storage.actualMissionCount} / ${packageInfo.missionCount}`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.actualMissionCount * 100) / packageInfo.missionCount
              )}
            />

            <Row justify="space-between" style={{ marginTop: "20px" }}>
              <Col>Videos count:</Col>
              <Col>{`${storage.actualVodCount} / ${packageInfo.vodCount}`}</Col>
            </Row>
            <Progress
              strokeWidth={12}
              showInfo={false}
              percent={Math.round(
                (storage.actualVodCount * 100) / packageInfo.vodCount
              )}
            />
          </Skeleton>
        </div>
      </div>
    </div>
  );
}

export default OrganisationPackageDetails;
