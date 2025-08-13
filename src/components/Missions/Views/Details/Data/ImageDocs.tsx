import { useState, useRef, useContext, useEffect } from "react";
import {
  Alert,
  message,
  Modal,
  Row,
  Spin,
  Image,
  Col,
  Dropdown,
  Button,
  Typography,
  Empty,
  Result,
  Checkbox,
  Badge,
  Pagination,
  MenuProps,
} from "antd";
import "./data.less";
import "./checkbox.less";

import apis from "../../../../../services/apis";
import http from "../../../../../services/httpCall";
import axios from "axios";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";
import {
  InboxOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  DownloadOutlined,
  DeleteOutlined,
  UploadOutlined,
  FlagOutlined,
  UserOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import Dragger from "antd/lib/upload/Dragger";
import io from "src/services/socketConnect";
import moment from "moment";
import { API_URL, STATIC_URL } from "src/constants";
import ActionToolbar from "src/components/shared/Toolbar/action";
import FilterToolbar from "src/components/shared/Toolbar/filter";
import { BsFlagFill } from "react-icons/bs";
import Thread from "src/components/shared/Thread";
import ThermalImaging from "src/components/shared/ThermalImaging";
import { DocModel, uploadFile } from "src/services/fileUpload";

import { PERMS } from "src/static/permissions";
import { AuthContext } from "src/services/authUtils";
import { ThreadContext } from "src/services/threadUtils";

function ImageDocs(props) {
  const [plainOptions, setPlainOptions] = useState([]);
  const [refreshState, setRefreshState] = useState(false);
  const socket: any = useRef();
  const [loader, setLoader] = useState(false);
  const [images, setImages] = useState([]);
  const [storageModal, setStorageModal] = useState(false);
  const [listView, setListView] = useState(false);
  const [activateSelection, setActivateSelection] = useState(false);
  const [isAscending, setIsAscending] = useState(false);
  const [sortType, setSortType] = useState("timeStamp");
  const [thermalPayload, setThermalPayload] = useState({});
  const [flag, setFlag] = useState(false);
  const [flaggedFilter, setFlaggedFilter] = useState(false);
  const [unflaggedFilter, setUnflaggedFilter] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const CheckboxGroup = Checkbox.Group;
  const { Text, Title } = Typography;
  const [checkedList, setCheckedList] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedImg, setSelectedImg] = useState({});

  const { Auth, logout } = useContext(AuthContext);
  const userDetails = Auth.userdetails;
  const userType = userDetails.userType;

  const { thread, openThread } = useContext(ThreadContext);

  const imgMenu: MenuProps["items"] = (data) => {
    const item = [
      {
        key: "1",
        label: "Download",
        icon: <DownloadOutlined />,
      },
      {
        key: "2",
        label: "Thermal View",
        icon: <FireOutlined />,
      },
      {
        key: "3",
        label: "Open Thread",
        icon: <MessageOutlined />,
      },
    ];
    if (
      props.missionDetails.currentUserDetails.customPermissions.includes(
        PERMS.UPDATE_DOCUMENT
      )
    ) {
      item.push({
        key: "4",
        label: !data.isFlagged ? "Flag" : "Unflag",
        icon: <FlagOutlined />,
      });
    }
    if (
      props.missionDetails.currentUserDetails.customPermissions.includes(
        PERMS.DELETE_DOCUMENT
      )
    ) {
      item.push({
        key: "5",
        label: "Delete Image",
        icon: <DeleteOutlined />,
      });
    }
    return item;
  };
  const imgMenuOnClick: MenuProps["onClick"] = (e) => {
    switch (e.key) {
      case "1":
        window.open(`${STATIC_URL}${selectedImg.filePath}`);
        break;
      case "2":
        setThermalPayload({
          id: selectedImg._id,
          doc: "document",
          filePath: selectedImg.filePath,
        });
        break;
      case "3":
        setThumbnail(
          ImageComponent(
            selectedImg,
            false,
            {
              width: "100%",
              height: "auto",
              minHeight: "200px",
            },
            true
          )
        );
        openThread("document", selectedImg._id, {});
        break;
      case "4":
        toggleFlag(selectedImg);
        break;
      case "5":
        Modal.confirm({
          title: "Delete Image?",
          icon: <ExclamationCircleOutlined />,
          content: "Are you sure you want to delete this Image?",
          okText: "Yes",
          cancelText: "No",
          onOk: () => {
            deleteSingleFile(selectedImg._id);
          },
        });
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    if (images.length < 1) {
      setActivateSelection(false);
    }
  }, [images]);
  //--------------------------- ImageCompononent --------------

  const ImageCompononent = (item: any) => {
    return (
      <Row
        className="listview-outcomes"
        align="middle"
        style={{ padding: "10px" }}
      >
        <Col md={4} style={{ padding: "20px", width: 1060 }}>
          <Image
            key={`${item._id}`}
            style={{ padding: "8px" }}
            width={150}
            height={150}
            src={STATIC_URL + "/documents/1x_" + item.filePath.split("/")[2]}
            preview={{
              src: STATIC_URL + "/documents/2x_" + item.filePath.split("/")[2],
            }}
          ></Image>
        </Col>
        <Col md={19}>
          <div className="info-part">
            <Row>
              <Title level={5}>{item.name}</Title>
            </Row>
            <Row>
              <Col md={20}>
                <Text type="secondary">Size : {item.fileSize} mb</Text>
              </Col>
              <Col md={4}>
                <Text type="secondary" className="inference">
                  Inference: {item.__v}
                </Text>
              </Col>
            </Row>
            <Row>
              <Col md={20}>
                <Text type="secondary">
                  <UserOutlined /> {item.createdBy.name}
                </Text>
              </Col>
              <Col md={4}>
                <Text type="secondary" className="relative-time">
                  <em>{moment(item.createdAt).fromNow()}</em>
                </Text>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    );
  };

  useEffect(() => {
    console.log("Images:", images);
    if (images.length > 0) {
      setPlainOptions(
        images.map(
          image => ({ value: image._id, label: ImageCompononent(image) })
        )
      )
    }
  }, [images]);

  //---------------------File validator----------------
  function validateFile(file: any) {
    switch (file.type) {
      case "image/png":
        return true;
      case "image/jpeg":
        return true;
      default:
        message.warning("Image file type not supported!");
        return false;
    }
  }
  //---------------------Upload props-------------------------------
  const UploadProps = {
    name: "file",
    multiple: true,
    action: `${API_URL}${apis.UPLOAD_DOCUMENT}`,
    customRequest: async (options: any) => {
      const cancelToken = axios.CancelToken;
      const source = cancelToken.source();
      if (validateFile(options.file)) {
        const uploadToken = await uploadFile(options.file, DocModel.DOCUMENTS, (prog) => { options.onProgress({ percent: prog * 100 }) }, source.token);

        const body = {
          file: uploadToken,
          missionId: props.missionDetails.missionId,
          folderName: "photos",
          type: options.file.type,
        };

        // const fData = new FormData();
        // fData.append("file", options.file);
        // fData.append("missionId", props.missionDetails.missionId);
        // fData.append("folderName", "photos");
        console.log("File type: ", options.file.type);

        switch (
        props.missionDetails.userType //upload priviledge checks
        ) {
          case "tenant-root":
          case "tenant-staff": // when user is tenant staff
            http
              .post(options.action, body)
              .then((res: any) => {
                options.onSuccess(res.data, options.file);
                message.success(
                  "File " + options.file.name + " uploaded successfully"
                );
              })
              .catch((err) => {
                if (axios.isCancel(err)) {
                  console.log("Upload Cancelled");
                  return;
                } else if (err.response?.status === 403) {
                  if (
                    err.response?.data.message ===
                    "Actual storage exceeded the Limit of Set storage!"
                  ) {
                    setStorageModal(true);
                  } else {
                    message.error(err.response?.data.message);
                    console.log(err.response);
                  }
                } else {
                  console.log(err);
                  message.error("Unable to upload file!");
                  options.onError({ err });
                }
                AxiosErrorHandler(err, logout);
              });
            break;

          default:
            message.warning("You are not permitted to upload!");
        }
      } else {
        options.onError("File not Supported!");
      }
      return {
        abort() {
          console.log("Aborting file upload");
          source.cancel("User cancelled file upload");
        },
      };
    },
  };

  //-------- Upload Modal ------------------------

  function uploadModal() {
    Modal.info({
      title: "Upload Documents",
      content: (
        <div className="upload-modal-video">
          <Alert
            style={{ marginBottom: "8px" }}
            message="Only jpeg and png supported"
            type="info"
            showIcon
          />
          <Dragger {...UploadProps} defaultFileList={[]}>
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
      ),
      centered: true,
      width: 640,
      cancelText: "Cancel",
      onOk() { },
      onCancel() { },
    });
  }
  useEffect(() => {
    if (!thread.open) {
      fetchDocuments();
    }
  }, [thread.open]);
  //------------------Get Images------------------------------------------
  const getFlaggedFilter = () => {
    if (flaggedFilter) {
      return flaggedFilter;
    } else if (unflaggedFilter) {
      return !unflaggedFilter;
    } else return undefined;
  };

  function getImages() {
    setLoader(true);
    const query = {
      missionId: props.missionId,
      page,
      limit,
    };
    const flagFilter = getFlaggedFilter();
    if (flagFilter !== undefined) {
      query["isFlagged"] = flagFilter;
    }
    if (sortType === "timeStamp") {
      if (isAscending) {
        query["sortBy"] = `createdAt:asce`;
      } else {
        query["sortBy"] = `createdAt:desc`;
      }
    }
    http
      .get(`${apis.GET_IMAGES}`, {
        params: query,
      })
      .then((res: any) => {
        if (res.data.status) {
          setTotalCount(res.data.data.total);
          setImages(res.data.data.documents);
          props.setTotalImages(res.data.data.total);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err: Error) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => setLoader(false));
  }
  const ImageComponent = (
    item: any,
    preview: boolean,
    imgStyle: any,
    thumbnail: boolean = false
  ) => {
    return (
      <Badge
        style={{
          backgroundColor: "#f5222d",
          padding: "5px",
          borderRadius: "5px",
        }}
        offset={[-30, 30]}
        count={
          item.isFlagged ? (
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
        {thumbnail ? (
          <Image
            key={`${item._id}`}
            style={imgStyle}
            src={STATIC_URL + "/documents/1x_" + item.filePath.split("/")[2]}
            preview={
              !preview
                ? false
                : {
                  src:
                    STATIC_URL +
                    "/documents/2x_" +
                    item.filePath.split("/")[2],
                }
            }
            fallback="/icons/fallback.png"
          ></Image>
        ) : (
          <Badge
            style={{
              backgroundColor: "#3b86ff",
              boxShadow: "0 0 3px 1px black",
            }}
            offset={[-10, 10]}
            count={item.isThreadExist ? item.commentCount : 0}
            overflowCount={9}
          >
            <Image
              key={`${item._id}`}
              style={imgStyle}
              src={STATIC_URL + "/documents/1x_" + item.filePath.split("/")[2]}
              preview={
                !preview
                  ? false
                  : {
                    src:
                      STATIC_URL +
                      "/documents/2x_" +
                      item.filePath.split("/")[2],
                  }
              }
              fallback="/icons/fallback.png"
            ></Image>
          </Badge>
        )}
      </Badge>
    );
  };
  //------------------Fetch DOcuments------------------------------------
  function fetchDocuments() {
    if (refreshState) {
      setRefreshState(false);
      getImages();
    } else {
      getImages();
    }
  }

  const updateDocument = (body) => {
    http
      .patch(`${apis.UPDATE_DOC}`, body)
      .then((res) => {
        if (res.data.status) {
          message.success(
            `Image ${!body.update.isFlagged ? "un-flagged" : "flagged"
            } successfully!`
          );
          fetchDocuments();
        } else message.error(res.data.message);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const toggleFlag = (item) => {
    const body = {
      Id: item._id,
      update: { isFlagged: !item.isFlagged },
    };
    updateDocument(body);
  };
  // Delete multiple file
  function deleteFile(id: any) {
    console.log(checkedList);
    if (checkedList.length > 0) {
      message.loading("Deleting image...");
      http
        .delete(`${apis.DELETE_DOCUMENT_MULTIPLE}`, {
          data: { id },
        })
        .then((res) => {
          if (res.data.status) {
            message.success("Files deleted succesfully!");
            setRefreshState(true);
            fetchDocuments();
            setCheckedList([]);
          } else {
            message.error(res.data.message);
          }
        })
        .catch((err) => {
          message.error("ERROR" + err);
          AxiosErrorHandler(err, logout);
        });
    } else {
      message.info("Please select some images to delete!");
    }
  }

  function deleteSingleFile(id: any) {
    http
      .delete(`${apis.DELETE_DOCUMENT_MULTIPLE}`, {
        data: {
          id: [id],
        },
      })
      .then((res) => {
        if (res.data.status) {
          message.success("File deleted succesfully!");
          setRefreshState(true);
          fetchDocuments();
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error("ERROR" + err);
        AxiosErrorHandler(err, logout);
      });
  }

  //--------------- Hooke to fetch documents and handle socket events -----------------------------
  useEffect(() => {
    fetchDocuments();
    if (props.missionDetails.missionId) {
      if (!socket.current) {
        socket.current = io(
          `${API_URL}/stream/mission-specific?missionID=${props.missionDetails.missionId}`
        );

        socket.current.on("DOCUMENT_CREATED", () => {
          setRefreshState(true);
          fetchDocuments();
        });

        socket.current.on("DOCUMENT_DELETED", (data) => {
          console.log("Document Deleted", data);
          setRefreshState(true);
          fetchDocuments();
        });
      }
    }
  }, [props.missionDetails.missionId, page, limit]);

  //----------render upload button----------------------

  function renderUploadBtn() {
    if (userType === "tenant-staff" || userType === "tenant-client") {
      if (userDetails.customPermissions.includes(PERMS.UPLOAD_DOCUMENT)) {
        return (
          <div className="upload-btn">
            <Button onClick={() => uploadModal()}>
              <UploadOutlined /> Upload{" "}
            </Button>
          </div>
        );
      }
    } else {
      return (
        <div className="upload-btn">
          <Button onClick={() => uploadModal()}>
            <UploadOutlined /> Upload{" "}
          </Button>
        </div>
      );
    }
  }

  //--------render delete button-------------------
  const onChange = (list) => {
    setCheckedList(list);
  };

  useEffect(() => {
    console.log("checked items:----", checkedList);
  }, [checkedList]);

  const handleSortChange = (value) => {
    setSortType(value);
    setRefreshState(!refreshState);
  };
  useEffect(() => {
    if (!(activateSelection && checkedList.length > 0)) {
      setFlag(false);
    }

    const flaggedArray = images
      .map((data: any) => {
        if (checkedList.includes(data._id)) {
          return data.isFlagged;
        }
      })
      .filter((flag) => flag !== undefined);
    if (!flaggedArray.includes(false)) {
      setFlag(true);
    } else if (flaggedArray.includes(false)) {
      setFlag(false);
    }
  }, [activateSelection, checkedList, images]);

  useEffect(() => {
    setRefreshState(!refreshState);
    fetchDocuments();
  }, [isAscending, flaggedFilter, unflaggedFilter, page, limit]);

  // This is a list view
  return (
    <>
      <ThermalImaging
        thermalPayload={thermalPayload}
        setThermalPayload={setThermalPayload}
      />
      <Thread thumbnail={thumbnail} setThumbnail={setThumbnail} />
      <FilterToolbar
        type="Image"
        loader={loader}
        setListView={setListView}
        listView={listView}
        setIsAscending={setIsAscending}
        isAscending={isAscending}
        setFlaggedFilter={setFlaggedFilter}
        flaggedFilter={flaggedFilter}
        setUnflaggedFilter={setUnflaggedFilter}
        unflaggedFilter={unflaggedFilter}
        handleSortChange={handleSortChange}
      />

      <ActionToolbar
        type="Image"
        setCheckedList={setCheckedList}
        checkedList={checkedList}
        setActivateSelection={setActivateSelection}
        activateSelection={activateSelection}
        setData={setImages}
        data={images}
        totalCount={totalCount}
        setFlag={setFlag}
        flag={flag}
        uploadBtn={renderUploadBtn}
        updateAPI={apis.UPDATE_MULTI_DOC}
        delete={deleteFile}
        canToggleFlag={userDetails.customPermissions.includes(
          PERMS.UPDATE_DOCUMENT
        )}
        canDelete={userDetails.customPermissions.includes(
          PERMS.DELETE_DOCUMENT
        )}
      />
      {loader ? (
        <div
          style={{
            width: "100%",
            height: "200px",
          }}
        >
          <Spin
            style={{
              display: "block",
              margin: "auto",
            }}
            tip={<span>Loading...</span>}
          />
        </div>
      ) : (
        <div>
          {images.length < 1 ? (
            <Empty style={{ margin: "auto" }} />
          ) : (
            <>
              {listView ? (
                <>
                  {activateSelection ? (
                    <Col md={2} style={{ padding: "10px" }}>
                      <CheckboxGroup
                        options={plainOptions}
                        value={checkedList}
                        onChange={onChange}
                      />
                    </Col>
                  ) : (
                    <Image.PreviewGroup>
                      {images.map((item: any) => {
                        return (
                          <Row
                            className="listview-outcomes"
                            align="middle"
                            style={{ padding: "10px" }}
                            // onMouseDown={() => handleLongPressStart(item)}
                            // onMouseUp={handleLongPressEnd}
                            // onTouchStart={() => handleLongPressStart(item)}
                            // onTouchEnd={handleLongPressEnd}
                            // onClick={() => {
                            //   if (longPressOccurred) {
                            //     setLongPressOccurred(false);
                            //     return;
                            //   }
                            //   if (activateSelection) {
                            //     if (checkedList.includes(item._id)) {
                            //       const filtered = checkedList.filter((i: any) => i !== item._id);
                            //       setCheckedList(filtered);
                            //     } else {
                            //       setCheckedList([...checkedList, item._id]);
                            //     }
                            //   } else { /* empty */ }
                            // }}
                            key={item._id}
                          >
                            <Col md={8} style={{ padding: "10px" }}>
                              <Dropdown
                                onOpenChange={() => setSelectedImg(item)}
                                menu={{
                                  items: imgMenu(item),
                                  onClick: imgMenuOnClick,
                                }}
                                trigger={["contextMenu"]}
                              >
                                {ImageComponent(item, true, {
                                  padding: "8px",
                                  width: "270px",
                                  height: "150px",
                                })}
                              </Dropdown>
                            </Col>
                            <Col md={16}>
                              <div className="info-part">
                                <Row>
                                  <Title level={5}>{item.name}</Title>
                                </Row>
                                <Row>
                                  <Col md={20}>
                                    <Text type="secondary">
                                      Size : {item.fileSize} mb
                                    </Text>
                                  </Col>
                                  <Col md={4}>
                                    <Text
                                      type="secondary"
                                      className="inference"
                                    >
                                      Inference: {item.__v}
                                    </Text>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col md={20}>
                                    <Text type="secondary">
                                      <UserOutlined /> {item.createdBy.name}
                                    </Text>
                                  </Col>
                                  <Col md={4}>
                                    <Text
                                      type="secondary"
                                      className="relative-time"
                                    >
                                      <em>
                                        {moment(item.createdAt).fromNow()}
                                      </em>
                                    </Text>
                                  </Col>
                                </Row>
                              </div>
                            </Col>
                          </Row>
                        );
                      })}
                    </Image.PreviewGroup>
                  )}
                </>
              ) : (
                <>
                  {activateSelection ? (
                    <Row>
                      {images.map((item: any) => {
                        return (
                          <Badge
                            style={{
                              backgroundColor: "#f5222d",
                              padding: "5px",
                              borderRadius: "5px",
                            }}
                            offset={[-20, 30]}
                            count={
                              item.isFlagged ? (
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
                            key={window.crypto.randomUUID()}
                          >
                            <Image
                              alt={`${item._id}`}
                              className="imageMain"
                              key={`${item._id}`}
                              style={
                                checkedList.includes(item._id)
                                  ? {
                                    border: "4px solid #3b86ff",
                                    cursor: "pointer",
                                    aspectRatio: "16/9",
                                  }
                                  : {
                                    cursor: "pointer",
                                    aspectRatio: "16/9",
                                  }
                              }
                              width={267}
                              height={150}
                              src={
                                STATIC_URL +
                                "/documents/1x_" +
                                item.filePath.split("/")[2]
                              }
                              preview={false}
                              fallback="data:image/png;base64,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"
                              onClick={() => {
                                if (checkedList.includes(item._id)) {
                                  const filtered: any = checkedList.filter(
                                    (i: any) => i !== item._id
                                  );
                                  setCheckedList(filtered);
                                } else {
                                  setCheckedList([...checkedList, item._id]);
                                }
                              }}
                            ></Image>
                          </Badge>
                        );
                      })}
                    </Row>
                  ) : (
                    <Image.PreviewGroup>
                      {images.map((item: any) => {
                        return (
                          <Dropdown
                            onOpenChange={() => setSelectedImg(item)}
                            menu={{
                              items: imgMenu(item),
                              onClick: imgMenuOnClick,
                            }}
                            trigger={["contextMenu"]}
                            key={item._id}
                          >
                            {ImageComponent(item, true, {
                              padding: "8px",
                              width: "270px",
                              height: "150px",
                            })}
                          </Dropdown>
                        );
                      })}
                    </Image.PreviewGroup>
                  )}
                </>
              )}
              <Pagination
                defaultCurrent={page}
                defaultPageSize={limit}
                onShowSizeChange={(currPage, limit) => {
                  setPage(currPage);
                  setLimit(limit);
                }}
                current={page}
                onChange={(currPage, limit) => {
                  setPage(currPage);
                  setLimit(limit);
                }}
                total={totalCount}
                hideOnSinglePage={true}
                showSizeChanger={true}
              />
            </>
          )}
        </div>
      )}
      <Modal
        title="Storage Exceeded!"
        open={storageModal}
        onOk={() => setStorageModal(false)}
        onCancel={() => setStorageModal(false)}
      >
        <Result
          status="403"
          title="Oops! You have run out of storage!"
          subTitle="Please contact admin@kesowa.com to renew our services! to see you storage details, head over to My Account > Package."
        />
      </Modal>
    </>
  );
}

export default ImageDocs;
