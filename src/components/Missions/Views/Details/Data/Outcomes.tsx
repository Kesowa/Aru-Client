import React, { useState, useEffect } from "react";
import { default as Shimmer } from "react-loading-skeleton";
import { reverseGeocoder as geocoder } from "../../../../../services/MapBoxGeocoder";
import ExifReader from "exifreader";
import {
  Row,
  Col,
  Card,
  Typography,
  Modal,
  Button,
  notification,
  Tag,
  Select,
  Input,
  Pagination,
  Empty,
  Skeleton,
  message,
  Dropdown,
  Menu,
  Checkbox,
  Badge,
} from "antd";
import {
  ExclamationOutlined,
  CalendarOutlined,
  UserOutlined,
  DownloadOutlined,
  UploadOutlined,
  InboxOutlined,
  FlagOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { BsFlagFill } from "react-icons/bs";
import Dragger from "antd/lib/upload/Dragger";
import apis from "../../../../../services/apis";
import http from "../../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";
import { logout } from "../../../../../actions/authAction";
import { connect } from "react-redux";
import moment from "moment";
import "./data.less";
import OutcomeModal from "./OutcomeModal";
import { API_URL, STATIC_URL } from "src/constants";
import FilterToolbar from "src/components/shared/Toolbar/filter";
import ActionToolbar from "src/components/shared/Toolbar/action";

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;
let plainOptions = new Array<any>();
type OutcomeProps = {
  id: any;
  count: any;
  missionDetails: any;
  userType: any;
};
function Outcomes(outcomeProps) {
  const [outcomeData, setOutcomeData] = useState<any>(null);
  // const [outcomeDataCopy, setOutcomeDataCopy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAscending, setIsAscending] = useState(false);
  const [sortType, setSortType] = useState("timeStamp");
  const [listView, setListView] = useState(false);
  const [allOutcomes, setAllOutcomes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [alertType, setAlertType] = useState("");
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [refresh, setRefresh] = useState(true);
  const [isUploading, setUploading] = useState(false);
  const [uploadModall, setUploadModal] = useState(false);
  const [defaultFileList, setDefaultFileList] = useState([]);
  const [flag, setFlag] = useState(false);
  const [flaggedFilter, setFlaggedFilter] = useState(false);
  const [unflaggedFilter, setUnflaggedFilter] = useState(false);
  const [addr4Image, setAddr4Image] = useState("");
  const [progress, setProgress] = useState(0); //this can be used for a different progress component
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [storageModal, setStorageModal] = useState(false);
  const [activateSelection, setActivateSelection] = useState(false);
  const CheckboxGroup = Checkbox.Group;
  const defaultCheckedList = [];
  const [checkedList, setCheckedList] = useState<any>(defaultCheckedList);

  // console.log(outcomeProps.missionDetails);
  // console.log(outcomeData);
  const getFlaggedFilter = () => {
    if (flaggedFilter) {
      return flaggedFilter;
    } else if (unflaggedFilter) {
      return !unflaggedFilter;
    } else return undefined;
  };

  const getOutcomeThumbnail = (outcomes) => {
    return outcomes.map((data) => {
      let thumb = data.image.split("/");
      thumb[3] = "1x_" + thumb[3];
      thumb = thumb.join("/");
      data.thumb = thumb;
      return data;
    });
  };

  const getOutcomes = () => {
    setLoading(true);
    let sortBy, sortOrder;
    if (sortType === "timeStamp") sortBy = "createdAt";
    else sortBy = "pcount";
    if (isAscending) sortOrder = "asce";
    else sortOrder = "desc";
    const query = {
      sortBy: `${sortBy}:${sortOrder}`,
      id: outcomeProps.id,
      page,
      limit,
      alertType,
    };
    const flagFilter = getFlaggedFilter();
    if (flagFilter !== undefined) {
      query["isFlagged"] = flagFilter;
    }
    console.log(query);
    http
      .get(`${apis.GET_ALERT_BY_MISSION_ID_PAGINATION}`, {
        params: query,
      })
      .then((res) => {
        console.log(res.data);
        if (res.data.data.length) {
          const outcomes = getOutcomeThumbnail(res.data.data);
          setOutcomeData(outcomes);
        } else setOutcomeData([]);
        // setOutcomeDataCopy(res.data.data);
        setTotal(res.data.data.length);
        setAllOutcomes(res.data.data);
        console.log("Alerts: ", res.data.data);
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, outcomeProps.logout);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOutcomes();
  }, [
    page,
    limit,
    isAscending,
    sortType,
    alertType,
    refresh,
    flaggedFilter,
    unflaggedFilter,
  ]);

  // useEffect(() => {
  //   if (!loading) {
  //     handleSortChange(sortType);
  //   }
  // }, [isAscending]);
  function fetchOutcomes() {
    if (refresh) {
      setRefresh(false);
      getOutcomes();
    } else {
      getOutcomes();
    }
  }

  const updateAlert = (body) => {
    http
      .patch(`${apis.UPDATE_ALERT}`, body)
      .then((res) => {
        if (res.data.status) {
          message.success(
            `Image ${
              !body.update.isFlagged ? "un-flagged" : "flagged"
            } successfully!`
          );
          fetchOutcomes();
        } else message.error(res.data.message);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const toggleFlag = (item) => {
    const body = {
      id: item._id,
      update: { isFlagged: !item.isFlagged },
    };
    updateAlert(body);
  };
  const setPageLimit = (currPage, limit) => {
    setPage(currPage);
    setLimit(limit);
  };

  const OutcomeCompononent = (dataa: any, ind: any) => {
    const outcome = dataa;

    return (
      <>
        {listView ? (
          <Row
            className="listview-outcomes"
            align="middle"
            style={
              activateSelection && checkedList.includes(dataa._id)
                ? {
                    border: "4px solid #3b86ff",
                    cursor: "pointer",
                    padding: "6px",
                  }
                : {}
            }
            onClick={
              () => {
                if (activateSelection) {
                  if (checkedList.includes(dataa._id)) {
                    const filtered: any = checkedList.filter(
                      (i: any) => i !== dataa._id
                    );
                    setCheckedList(filtered);
                  } else {
                    setCheckedList([...checkedList, dataa._id]);
                  }
                } else {
                  setShowOutcomeModal(true);
                  setModalIndex(ind);
                }
              }
              // showModal(
              //   dataa._id,
              //   dataa.missionId._id,
              //   dataa.flightId._id,
              //   dataa.createdBy.name,
              //   dataa.createdBy.avatar,
              //   dataa.createdAt,
              //   API_URL + dataa.image,
              //   dataa.location,
              //   dataa.locationName
              //     ? dataa.locationName
              //     : "Default Location",
              //   dataa.pcount,
              // )
            }
          >
            <Col md={4} style={{ padding: "10px" }}>
              <img
                style={{ width: "100%", height: "auto" }}
                src={STATIC_URL + dataa.thumb}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = "/icons/fallback.png";
                }}
              />
            </Col>
            <Col md={19}>
              <div className="info-part">
                <Row>
                  <Title level={5}>
                    {dataa.locationName
                      ? truncateText(dataa.locationName)
                      : "Default Location"}
                  </Title>
                </Row>
                <Row>
                  <Col md={20}>
                    <Text type="secondary">
                      {dataa.location
                        ? dataa.location.lat == "0"
                          ? ""
                          : `${dataa.location.lat}, ${dataa.location.long}`
                        : ""}
                    </Text>
                  </Col>
                  <Col md={4}>
                    <Text type="secondary" className="inference">
                      Inference: {dataa.pcount}
                    </Text>
                  </Col>
                </Row>
                <Row>
                  <Col md={20}>
                    <Text type="secondary">
                      <UserOutlined /> {dataa.createdBy.name}
                    </Text>
                  </Col>
                  <Col md={4}>
                    <Text type="secondary" className="relative-time">
                      <em>{moment(dataa.createdAt).fromNow()}</em>
                    </Text>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        ) : (
          <Col xs={24} sm={24} md={24} lg={8} xl={6} xxl={6}>
            <div
              style={{
                padding: "2px",
              }}
            >
              <Badge
                style={{
                  backgroundColor: "#f5222d",
                  padding: "5px",
                  borderRadius: "5px",
                }}
                offset={[-15, 15]}
                count={
                  outcome.isFlagged ? (
                    <BsFlagFill
                      style={{
                        color: "#fff",
                        fontSize: "24px",
                      }}
                    />
                  ) : (
                    0
                  )
                }
              >
                <Card
                  className="outcome-cardd"
                  onClick={() => {
                    if (activateSelection) {
                      if (checkedList.includes(dataa._id)) {
                        const filtered: any = checkedList.filter(
                          (i: any) => i !== dataa._id
                        );
                        setCheckedList(filtered);
                      } else {
                        setCheckedList([...checkedList, dataa._id]);
                      }
                    } else {
                      setShowOutcomeModal(true);
                      setModalIndex(ind);
                    }
                  }}
                  style={
                    checkedList.includes(dataa._id)
                      ? {
                          border: "4px solid #3b86ff",
                          cursor: "pointer",
                        }
                      : {
                          cursor: "pointer",
                        }
                  }
                  cover={
                    <img
                      style={{
                        aspectRatio: "16/9",
                        objectFit: "fill",
                        objectPosition: "0 0",
                      }}
                      src={STATIC_URL + outcome.thumb}
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = "/icons/fallback.png";
                      }}
                    />
                  }
                >
                  <Row style={{ marginTop: "-12px" }}>
                    <Col span={18}>
                      <Text strong className="outcome-name">
                        {outcome.locationName}
                      </Text>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary">
                        <ExclamationOutlined /> {outcome.pcount}
                      </Text>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={18}>
                      <Row style={{ marginTop: "8px" }}>
                        <Text type="secondary" className="outcome-createdby">
                          <UserOutlined /> {outcome.createdBy.name}
                        </Text>
                      </Row>
                      <Row>
                        <Text type="secondary" className="outcome-timestamp">
                          <CalendarOutlined />{" "}
                          {moment(outcome.createdAt).format("llll")}
                        </Text>
                      </Row>
                    </Col>
                    <Col span={6}></Col>
                  </Row>
                </Card>
              </Badge>
            </div>
          </Col>
        )}
      </>
    );
  };

  useEffect(() => {
    plainOptions = [];
    console.log(outcomeData);

    outcomeData?.map((item: any, index) =>
      plainOptions.push({
        value: item._id,
        label: OutcomeCompononent(item, index),
      })
    );
  }, [outcomeData]);

  const handleAction = (e) => {
    if (e.key == 0) {
      setActivateSelection(!activateSelection);
      setCheckedList([]);
    } else if (e.key == 1) {
      setCheckedList([]);
    } else if (e.key == 2) {
      setActivateSelection(true);
      setCheckedList(
        plainOptions.map((item) => {
          return item.value;
        })
      );
    } else if (e.key == 3) {
      Modal.confirm({
        title: "Delete Image ?",
        icon: <ExclamationCircleOutlined />,
        content: "Are you sure you want to delete ?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => {
          deleteMultupleOutcome();
        },
      });
    }
  };

  const onChangeCheckbox = (list) => {
    setCheckedList(list);
  };
  useEffect(() => {
    console.log("dsifhfhihfoihsdifh :" + checkedList);
  }, [checkedList]);

  const openNotification = (copiedText, placement) => {
    const el = document.createElement("textarea");
    el.value = copiedText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    notification.info({
      message: `Link Copied!`,
      description:
        "Google map location link has been copied to your clipboard.",
      placement,
    });
  };

  const handleSortChange = (value) => {
    setSortType(value);
  };

  const onSearch = (e) => {
    const value = e.target.value;
    const regEx = new RegExp(value, "i");

    const results = allOutcomes.filter((outcome: any) => {
      return regEx.test(outcome.locationName);
    });

    setOutcomeData(results);
  };

  const setPaginationPage = (p) => {
    setPage(p);
  };

  const FilterOptions = [
    {
      value: "alertType",
      title: "Alert Type",
      selectable: false,
      children: [
        {
          value: "Manual",
          title: "Manual",
        },
        {
          value: "Automated",
          title: "Automated",
        },
      ],
    },
  ];

  const onChange = (value) => {
    switch (value) {
      case "Automated":
        setAlertType("Automated");
        break;
      case "Manual":
        setAlertType("Manual");
        break;
      default:
        setAlertType("");
    }
    console.log(value, alertType);
  };

  function truncateText(str) {
    return str.length > 15 ? str.substring(0, 15) + "..." : str;
  }
  console.log("Current OUtcomes: ", outcomeData?.length);

  const deleteOutcome = (outcome) => {
    const id = [outcome._id];
    message.loading("Deleting outcome...");
    http
      .delete(`${apis.DELETE_ALERT}`, { data: { id } })
      .then((res: any) => {
        message.success("Outcome deleted succesfully!");
        setRefresh(!refresh);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const deleteMultupleOutcome = () => {
    const id = checkedList;
    message.loading("Deleting outcome...");
    http
      .delete(`${apis.DELETE_ALERT}`, { data: { id } })
      .then((res: any) => {
        message.success("Outcome deleted succesfully!");
        setRefresh(!refresh);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  async function downloadImage(imageSrc) {
    const image = await fetch(imageSrc);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "outcome";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  function uploadModal() {
    setUploadModal(true);
  }

  async function extractExif(file: any) {
    const tags = await ExifReader.load(file);
    console.log(tags);

    if (tags.GPSLatitude && tags.GPSLongitude) {
      const address: any = await geocoder([
        tags.GPSLongitude.description,
        tags.GPSLatitude.description,
      ]).then((res: any) => {
        return res;
      });
      console.log(address);
      return {
        status: true,
        address: address,
      };
    } else
      return {
        status: false,
        address: outcomeProps.missionDetails.location,
      };
  }

  const UploadProps = {
    name: "file",
    multiple: true,
    action: `${API_URL}${apis.UPLOAD_ALERT}`,
    customRequest: (options: any) => {
      setUploading(true);
      const fData = new FormData();
      const proceed = extractExif(options.file).then((res: any) => {
        if (res.status) {
          console.log(res);
          fData.append("image", options.file);
          fData.append("locationName", res.address);
          fData.append("missionId", outcomeProps.missionDetails.missionId);
          fData.append(
            "locationId",
            outcomeProps.missionDetails.locationId._id
          );
          fData.append("pcount", "0");
          fData.append("type", "Manual");
          fData.append("note", "Alert uploaded from browser!");
          fData.append("onSite", "false");
          fData.append("flightId", outcomeProps.missionDetails.flightId);
          const config = {
            headers: {
              "content-type": "multipart/form-data;",
            },
            onUploadProgress: (event) => {
              const percent = Math.floor((event.loaded / event.total) * 100);
              setProgress(percent);
              if (percent === 100) {
                setTimeout(() => setProgress(0), 1000);
              }
              options.onProgress({
                percent: (event.loaded / event.total) * 100,
              });
            },
          };
          http
            .post(options.action, fData, config)
            .then((res: any) => {
              // options.onSuccess(res.data, options.file);
              if (res.data.status) {
                console.log("Upload successful! ", res.data);
                message.success(
                  "File " + options.file.name + " uploaded successfully"
                );
                options.onSuccess(res.data, options.file);
                setRefresh(!refresh);
              } else {
                message.error("File " + options.file.name + " uploaded error");
                options.onError({ res });
              }
            })
            .catch((err) => {
              if (err?.response?.status === 403) {
                console.log(err.response);
                if (
                  err.response.data.message ===
                  "Package has expired! Please renew!"
                ) {
                  setIsModalVisible2(true);
                  window.setTimeout(function () {
                    AxiosErrorHandler(err, outcomeProps.logout); //needs to be connected with redux
                  }, 5000);
                } else if (
                  err.response?.data.message ===
                  "Actual storage exceeded the Limit of Set storage!"
                )
                  setStorageModal(true);
                else {
                  {
                    message.error(err.response?.data.message);
                    console.log(err.response);
                  }
                  setIsModalVisible(true);
                }
              } else {
                console.log("Upload Error!", err.message);
                message.error("Unable to upload file!");
              }
              options.onError({ err });
            })
            .finally(() => {
              setUploading(false);
            });
        } else {
          console.log(res);
          fData.append("image", options.file);
          fData.append("locationName", res.address);
          fData.append("missionId", outcomeProps.missionDetails.missionId);
          fData.append(
            "locationId",
            outcomeProps.missionDetails.locationId._id
          );
          fData.append("pcount", "0");
          fData.append("type", "Manual");
          fData.append("note", "Alert uploaded from browser!");
          fData.append("onSite", "false");
          fData.append("flightId", outcomeProps.missionDetails.flightId);
          const config = {
            headers: {
              "content-type": "multipart/form-data;",
            },
            onUploadProgress: (event) => {
              const percent = Math.floor((event.loaded / event.total) * 100);
              setProgress(percent);
              if (percent === 100) {
                setTimeout(() => setProgress(0), 1000);
              }
              options.onProgress({
                percent: (event.loaded / event.total) * 100,
              });
            },
          };
          http
            .post(options.action, fData, config)
            .then((res: any) => {
              // options.onSuccess(res.data, options.file);
              if (res.data.status) {
                console.log("Upload successful! ", res.data);
                message.success(
                  "File " + options.file.name + " uploaded successfully"
                );
                options.onSuccess(res.data, options.file);
                setRefresh(!refresh);
              } else {
                message.error("File " + options.file.name + " uploaded error");
                options.onError({ res });
              }
            })
            .catch((err) => {
              if (err?.response?.status === 403) {
                console.log(err.response);
                if (
                  err.response.data.message ===
                  "Package has expired! Please renew!"
                ) {
                  setIsModalVisible2(true);
                  window.setTimeout(function () {
                    AxiosErrorHandler(err, outcomeProps.logout); //needs to be connected with redux
                  }, 5000);
                } else if (
                  err.response?.data.message ===
                  "Actual storage exceeded the Limit of Set storage!"
                )
                  setStorageModal(true);
                else {
                  {
                    message.error(err.response?.data.message);
                    console.log(err.response);
                  }
                  setIsModalVisible(true);
                }
              } else {
                console.log("Upload Error!", err.message);
                message.error("Unable to upload file!");
              }
              options.onError({ err });
            })
            .finally(() => {
              setUploading(false);
            });
        }
      });
    },
  };

  // Render upload alert button based on user permissions
  function renderUploadButton() {
    if (
      outcomeProps.userType === "tenant-staff" ||
      outcomeProps.userType === "tenant-client"
    ) {
      let permissions: any = [];
      outcomeProps.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "alert_create"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Button onClick={() => uploadModal()}>
            <UploadOutlined /> Upload{" "}
          </Button>
        );
      }
    } else {
      return (
        <Button onClick={() => uploadModal()}>
          <UploadOutlined /> Upload{" "}
        </Button>
      );
    }
  }

  return (
    <React.Fragment>
      <Modal
        title="Upload Outcomes"
        visible={uploadModall}
        onOk={() => {
          if (isUploading) {
            message.warning("Cannot exit during an ongoing process!");
          } else {
            setUploadModal(false);
            setDefaultFileList([]);
          }
        }}
        onCancel={() => {
          if (isUploading) {
            message.warning("Cannot exit during an ongoing process!");
          } else {
            setUploadModal(false);
            setDefaultFileList([]);
          }
        }}
        footer={
          <Button
            type="default"
            disabled={isUploading}
            onClick={() => {
              if (isUploading) {
                message.warning("Cannot exit during an ongoing process!");
              } else {
                setUploadModal(false);
              }
            }}
          >
            Close
          </Button>
        }
      >
        <div className="upload-modal-video">
          <Dragger {...UploadProps} defaultFileList={defaultFileList}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload.
            </p>
          </Dragger>
        </div>
      </Modal>
      <FilterToolbar
        type="Outcome"
        loader={loading}
        setListView={setListView}
        listView={listView}
        setIsAscending={setIsAscending}
        isAscending={isAscending}
        handleSortChange={handleSortChange}
        onSearch={onSearch}
        onChange={onChange}
        setFlaggedFilter={setFlaggedFilter}
        flaggedFilter={flaggedFilter}
        setUnflaggedFilter={setUnflaggedFilter}
        unflaggedFilter={unflaggedFilter}
        FilterOptions={FilterOptions}
      />
      <ActionToolbar
        type="Outcome"
        setCheckedList={setCheckedList}
        checkedList={checkedList}
        setActivateSelection={setActivateSelection}
        activateSelection={activateSelection}
        setData={setOutcomeData}
        data={outcomeData}
        uploadBtn={renderUploadButton}
        delete={deleteMultupleOutcome}
        setFlag={setFlag}
        flag={flag}
        updateAPI={apis.UPDATE_MULTI_ALERT}
        thumb={getOutcomeThumbnail}
      />
      {!loading ? (
        <>
          {alertType && (
            <div style={{ height: "30px", width: "100%" }}>
              <div style={{ float: "right" }}>
                <Tag
                  color="blue"
                  style={{ fontWeight: "bold", marginTop: "5px" }}
                >
                  Total Filtered Outcomes: {total}
                </Tag>
              </div>
            </div>
          )}
          {outcomeData?.length !== 0 ? (
            <div>
              {activateSelection ? (
                listView ? (
                  <>
                    {outcomeData?.map((item: any, ind: any) =>
                      OutcomeCompononent(item, ind)
                    )}
                  </>
                ) : (
                  <Row>
                    {outcomeData?.map((item: any, ind: any) =>
                      OutcomeCompononent(item, ind)
                    )}
                  </Row>
                )
              ) : (
                <>
                  {listView ? (
                    <React.Fragment>
                      {outcomeData.map((dataa, ind) => (
                        <Row
                          className="listview-outcomes"
                          align="middle"
                          style={{ padding: "10px" }}
                          onClick={
                            () => {
                              setShowOutcomeModal(true);
                              setModalIndex(ind);
                            }

                            // showModal(
                            //   dataa._id,
                            //   dataa.missionId._id,
                            //   dataa.flightId._id,
                            //   dataa.createdBy.name,
                            //   dataa.createdBy.avatar,
                            //   dataa.createdAt,
                            //   API_URL + dataa.image,
                            //   dataa.location,
                            //   dataa.locationName
                            //     ? dataa.locationName
                            //     : "Default Location",
                            //   dataa.pcount,
                            // )
                          }
                        >
                          <Col md={4} style={{ padding: "10px" }}>
                            <img
                              style={{ width: "100%", height: "auto" }}
                              src={STATIC_URL + dataa.thumb}
                              onError={(e: any) => {
                                e.target.onerror = null;
                                e.target.src = "/icons/fallback.png";
                              }}
                            />
                          </Col>
                          <Col md={19}>
                            <div className="info-part">
                              <Row>
                                <Title level={5}>
                                  {dataa.locationName
                                    ? truncateText(dataa.locationName)
                                    : "Default Location"}
                                </Title>
                              </Row>
                              <Row>
                                <Col md={20}>
                                  <Text type="secondary">
                                    {dataa.location
                                      ? dataa.location.lat == "0"
                                        ? ""
                                        : `${dataa.location.lat}, ${dataa.location.long}`
                                      : ""}
                                  </Text>
                                </Col>
                                <Col md={4}>
                                  <Text type="secondary" className="inference">
                                    Inference: {dataa.pcount}
                                  </Text>
                                </Col>
                              </Row>
                              <Row>
                                <Col md={20}>
                                  <Text type="secondary">
                                    <UserOutlined /> {dataa.createdBy.name}
                                  </Text>
                                </Col>
                                <Col md={4}>
                                  <Text
                                    type="secondary"
                                    className="relative-time"
                                  >
                                    <em>{moment(dataa.createdAt).fromNow()}</em>
                                  </Text>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      ))}
                    </React.Fragment>
                  ) : (
                    <div>
                      <Row>
                        {outcomeData?.map((outcome, ind) => (
                          <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={8}
                            xl={6}
                            xxl={6}
                            key={`${outcome._id}`}
                          >
                            <Dropdown
                              trigger={["contextMenu"]}
                              overlay={
                                <Menu>
                                  <Menu.Item key="1">
                                    <span
                                      onClick={() =>
                                        downloadImage(
                                          STATIC_URL + outcome.thumb
                                        )
                                      }
                                    >
                                      <DownloadOutlined /> Download{" "}
                                    </span>
                                  </Menu.Item>
                                  <Menu.Item
                                    key="2"
                                    onClick={() => {
                                      toggleFlag(outcome);
                                    }}
                                  >
                                    {!outcome.isFlagged ? (
                                      <>
                                        <FlagOutlined /> Flag
                                      </>
                                    ) : (
                                      <>
                                        <FlagOutlined /> Unflag
                                      </>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item key="3">
                                    <span
                                      onClick={() => {
                                        Modal.confirm({
                                          title: "Delete outcome?",
                                          icon: <ExclamationCircleOutlined />,
                                          content:
                                            "Are you sure you want to delete this outcome?",
                                          okText: "Yes",
                                          cancelText: "No",
                                          onOk: () => {
                                            deleteOutcome(outcome);
                                          },
                                        });
                                      }}
                                    >
                                      <DeleteOutlined /> Delete
                                    </span>
                                  </Menu.Item>
                                </Menu>
                              }
                            >
                              <div
                                style={{
                                  padding: "2px",
                                }}
                              >
                                <Badge
                                  style={{
                                    backgroundColor: "#f5222d",
                                    padding: "5px",
                                    borderRadius: "5px",
                                  }}
                                  offset={[-15, 15]}
                                  count={
                                    outcome.isFlagged ? (
                                      <BsFlagFill
                                        style={{
                                          color: "#fff",
                                          fontSize: "24px",
                                        }}
                                      />
                                    ) : (
                                      0
                                    )
                                  }
                                >
                                  <Card
                                    className="outcome-cardd"
                                    cover={
                                      <img
                                        style={{
                                          aspectRatio: "16/9",
                                          objectFit: "fill",
                                          objectPosition: "0 0",
                                        }}
                                        className="card-img-size"
                                        onClick={() => {
                                          setShowOutcomeModal(true);
                                          setModalIndex(ind);
                                        }}
                                        src={STATIC_URL + outcome.thumb}
                                        onError={(e: any) => {
                                          e.target.onerror = null;
                                          e.target.src = "/icons/fallback.png";
                                        }}
                                      />
                                    }
                                  >
                                    <Row style={{ marginTop: "-12px" }}>
                                      <Col span={18}>
                                        <Text strong className="outcome-name">
                                          {outcome.locationName}
                                        </Text>
                                      </Col>
                                      <Col span={6}>
                                        <Text type="secondary">
                                          <ExclamationOutlined />{" "}
                                          {outcome.pcount}
                                        </Text>
                                      </Col>
                                    </Row>
                                    <Row>
                                      <Col span={18}>
                                        <Row style={{ marginTop: "8px" }}>
                                          <Text
                                            type="secondary"
                                            className="outcome-createdby"
                                          >
                                            <UserOutlined />{" "}
                                            {outcome.createdBy.name}
                                          </Text>
                                        </Row>
                                        <Row>
                                          <Text
                                            type="secondary"
                                            className="outcome-timestamp"
                                          >
                                            <CalendarOutlined />{" "}
                                            {moment(outcome.createdAt).format(
                                              "llll"
                                            )}
                                          </Text>
                                        </Row>
                                      </Col>
                                      <Col span={6}></Col>
                                    </Row>
                                  </Card>
                                </Badge>
                              </div>
                            </Dropdown>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <Empty />
          )}
          {outcomeData === undefined ? (
            <>
              <Empty style={{ margin: "auto" }} />
            </>
          ) : null}
          <OutcomeModal
            visible={showOutcomeModal}
            closeModal={setShowOutcomeModal}
            index={modalIndex}
            data={outcomeData}
            missionId={outcomeProps.id}
            openNotification={openNotification}
          />
        </>
      ) : (
        <Row>
          <Col span={8} className="vid-thumbnail">
            <Card
              className="video-card"
              cover={<Shimmer height={100} width={208} />}
            >
              <Row style={{ marginTop: "-12px" }}>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Row>
            </Card>
          </Col>
          <Col span={8} className="vid-thumbnail">
            <Card
              className="video-card"
              cover={<Shimmer height={100} width={208} />}
            >
              <Row style={{ marginTop: "-12px" }}>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Row>
            </Card>
          </Col>
          <Col span={8} className="vid-thumbnail">
            <Card
              className="video-card"
              cover={<Shimmer height={100} width={208} />}
            >
              <Row style={{ marginTop: "-12px" }}>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Row>
            </Card>
          </Col>
        </Row>
      )}
      <Pagination
        onShowSizeChange={setPageLimit}
        current={page}
        onChange={setPaginationPage}
        total={outcomeProps.count}
        hideOnSinglePage={true}
        showSizeChanger={true}
      />
    </React.Fragment>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
  Theme: state.Theme,
});

export default connect(mapStateToProps, { logout })(Outcomes);
