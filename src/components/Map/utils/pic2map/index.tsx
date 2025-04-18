//----lolo--------------------
import { useState, useEffect, useRef, useContext } from "react";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import {
  Image,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Dropdown,
  Modal,
  Button,
  Steps,
  Result,
  Divider,
  Progress,
  Switch,
} from "antd";
import {
  InboxOutlined,
  EnvironmentOutlined,
  DownOutlined,
} from "@ant-design/icons";
import apis from "../../../../services/apis";
import Dragger from "antd/lib/upload/Dragger";
import { API_URL, STATIC_URL } from "src/constants";
import io from "socket.io-client";
import { DocModel, uploadFile } from "src/services/fileUpload";
import { AuthContext } from "src/services/authUtils";

const { Title, Text } = Typography;

function Pictomap(props) {
  const socket: any = useRef();
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fileList, setFileList] = useState<any>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [loader, setLoader] = useState(false);
  const [layerFiles, populateLayerFiles] = useState<any>([]);
  const [layerFeatures, setLayerFeatures] = useState<any>([]);
  const [reviewList, setReviewList] = useState<any>([]);
  const [reviewPending, setReviewPending] = useState(false);
  const [storageModal, setStorageModal] = useState(false);
  const [subHeading, setSubHeading] = useState("");
  const [matchMode, setMatchMode] = useState<"LayerLabel" | "GeoCoord">(
    "GeoCoord"
  );
  const { logout } = useContext(AuthContext);
  const menuItem1 = () => {
    const items = [
      {
        key: "1",
        label: "Unassign Group",
      },
    ];
    layerFeatures.map((item) => {
      items.push({
        key: `2-${item.index}-${item.label}`,
        label: item.label,
      });
    });
    return items;
  };
  const onClickMenu1 = (e) => {
    if (e.key === "1") {
      unAssignGroup(subHeading.label);
    }
    const splitKey = e.key.split("-");
    if (splitKey[0] === "2") {
      updateReviewList(`${splitKey[1]}-${splitKey[2]}`, subHeading.data.fIndex);
    }
  };
  const menuItem2 = () => {
    const item = [
      {
        key: "submenu",
        label: "Move To",
        children: layerFeatures.map((item) => {
          return {
            key: `1-${item._id}-${item.index}-${item.label}`,
            label: item.label,
          };
        }),
      },
    ];
    return item;
  };
  const onClickMenu2 = (e) => {
    const splitKey = e.key.split("-");
    if (splitKey[0] === "1") {
      updateReviewListSingle(
        splitKey[1],
        splitKey[2],
        subHeading.data.fIndex,
        splitKey[3]
      );
    }
  };

  //---------------------File validator----------------
  function validateFile(file: any) {
    switch (file.type) {
      case "image/png":
        return true;
      case "image/jpeg":
        return true;
      default:
        return false;
    }
  }

  const handleBeforeUpload = (file) => {
    setFileList([...fileList, file]);
    return false;
  };

  const handleChangeFiles = ({ fileList, file }) => {
    setFileList([...fileList]);
  };

  const handleRemove = (selectedFile) => {
    return fileList.filter((file) => {
      return selectedFile.uid !== file.uid;
    });
  };

  async function handleUploadFiles() {
    if (fileList.length > 0) {
      setIsUploading(true);
      const config = {
        onUploadProgress: (event) => {
          const percent = Math.floor((event.loaded / event.total) * 100);
          setProgress(percent);
          if (percent === 100) {
            setTimeout(() => setProgress(0), 1000);
          }
        },
      };
      const uploadTokenPromises = fileList.map((file) =>
        uploadFile(file.originFileObj, DocModel.LAYER_FILES, (prog) =>
          console.info("PROGRESS: " + prog)
        )
      );
      const uploadTokens = await Promise.all(uploadTokenPromises);

      const body = {
        file: uploadTokens,
        Id: props.layerId,
      };

      // const fData = new FormData();
      // fData.append("Id", props.layerId);
      // fileList.forEach((file) => {
      //   fData.append("file", file.originFileObj);
      // });
      http
        .patch(`${apis.PIC_TO_MAP}?mode=${matchMode}`, body, config)
        .then((res: any) => {
          if (res.data.status) {
            console.log(res.data.result);
            setLoader(true);
            setIsUploading(false);
            setCurrentStage(1);
            setFileList([]);
          } else {
            console.log(res.data);
            message.error(res.data.message);
          }
        })
        .catch((err: any) => {
          if (err.response?.status === 403) {
            if (
              err.response?.data.message ===
              "Actual storage exceeded the Limit of Set storage!"
            ) {
              setStorageModal(true);
            } else {
              message.error(err.response?.data.message);
              console.log(err.response);
            }
          } else console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setLoader(false);
        });
    } else {
      message.warning("Please upload some files before proceeding forward!");
    }
  }
  function fetchJSON() {
    return fetch(`${API_URL}${props.layerPath}`)
      .then(function (res) {
        return res.json();
      })
      .catch((err) => console.log(err));
  }

  //-----------------populating data-----------------------------------------------------------------
  useEffect(() => {
    if (currentStage === 1) {
      if (props.data.length > 0) {
        console.log("DAT HERE", props.data);
        const finalArray: any = [];
        const LastFeature: any = [];
        props.data.map((data: any) => {
          if (LastFeature.includes(data.sys_Id) === false) {
            //----init structure of each element-----
            const x: any = {
              label: data.featureLabel,
              data: {
                fIndex: data.sys_Id,
                files: [],
              },
            };

            const index = data.sys_Id;
            props.data.map((dataa: any) => {
              if (index === dataa.sys_Id) {
                x.data.files.push(dataa);
              }
            });
            finalArray.push(x);
            LastFeature.push(data.sys_Id);
          }
        });
        const UnassignedImages: any = finalArray.filter(
          (i) => i.label === null
        ); // filtering the unassigned entries from array
        const filtered2Array: any = finalArray.filter((i) => i.label !== null); //filtering the array to get rid of the unassigned object
        if (UnassignedImages.length > 0) {
          filtered2Array.unshift(UnassignedImages[0]);
          populateLayerFiles(filtered2Array);
          setCurrentStage(2);
          props.setData([]);
        } else {
          populateLayerFiles(finalArray);
          setCurrentStage(2);
          props.setData([]);
        }
      }
    }
  }, [currentStage, props.data]);

  // //--------testing socket-----------------

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(
        `${API_URL}/stream/mission-specific?missionID=${props.missionId}`
      );
      socket.current.on("pic-to-map", (dataa) => {
        console.log("socket testing!  ", dataa);
      });
    }
  }, [props.missionId]);

  //---Set layer features list for combo box---------------------
  useEffect(() => {
    if (currentStage === 2) {
      fetchJSON().then((data) => {
        const filterArray: any = [];
        data.features.forEach(function (value, i) {
          let objecty: any = {};
          let test;
          if (props.layerLabel) {
            test = value.properties[props.layerLabel];
          }
          objecty = {
            index: value.properties.sys_id,
            label: test,
          };
          filterArray.push(objecty);
        });
        setLayerFeatures(filterArray);
      });
    }
  }, [currentStage]);

  //set Review list--------------------
  useEffect(() => {
    if (currentStage === 2) {
      const currentReviewList: any = [];

      //----Filtering array from unassigned objects------
      const filteredReviewList: any = layerFiles.filter(
        (i: any) => i.label !== null
      );
      if (filteredReviewList.length > 0) {
        filteredReviewList.map((item: any) => {
          let sampleObj: any = {};
          item.data.files.map((data: any) => {
            sampleObj = {
              _id: data._id,
              sys_Id: item.data.fIndex !== null ? item.data.fIndex : null,
            };
            currentReviewList.push(sampleObj);
          });
        });
        setReviewList(currentReviewList);
      }
    }
  }, [layerFiles, currentStage]);

  useEffect(() => console.log("ReviewList: ", reviewList), [reviewList]);
  useEffect(() => console.log("LayerFiles: ", layerFiles), [layerFiles]);

  // ----------Unassign whole group-----------------
  function unAssignGroup(label: any) {
    const file: any = layerFiles;
    const fileToUnassign: any = file.filter((i) => i.label == label);
    const filteredArray: any = file.filter((i) => i.label !== label);
    fileToUnassign.map((i: any) => {
      const x: any = {
        label: null,
        data: {
          fIndex: i.data.fIndex,
          files: i.data.files,
        },
      };
      filteredArray.push(x);
    });
    populateLayerFiles(filteredArray);
  }

  // ------UnAssign a single image------------------
  function unAssignFile(id: any) {
    const files: any = layerFiles;
    console.log(files);
    let fileToUnAssign: any = [];
    let uExists = false;
    // pick the file to unassign
    files.map((file: any) => {
      const y: any = file.data.files.filter((i) => i._id == id);
      if (y.length > 0) {
        fileToUnAssign = y;
      }
    });
    console.log(fileToUnAssign, id);
    // remove the file to unassign from file list
    const filteredFile: any = files;
    filteredFile.map((file: any) => {
      file.data.files = file.data.files.filter((i) => i._id !== id);
      // check whether unsassign group already exists of not
      if (file.label === null) {
        uExists = true;
      }
    });

    filteredFile.filter((i) => i.data.files.length === 0);

    if (uExists) {
      filteredFile.map((file: any) => {
        if (file.label === null) {
          file.data.files.push(fileToUnAssign[0]);
        }
      });
    } else {
      const x: any = {
        label: null,
        data: {
          fIndex: null,
          files: fileToUnAssign,
        },
      };
      filteredFile.push(x);
    }
    console.log(filteredFile);
  }

  //-------update review list-----------------------
  function updateReviewList(value, currentIndex) {
    const files: any = layerFiles;
    const [featureIndex, featureLabel] = value.split(/-(.+)/);
    if (currentIndex === featureIndex) {
      console.log("no change");
    } else {
      let newIndexFiles: any = [];
      newIndexFiles = files.filter((i) => i.data.fIndex == featureIndex);
      const currentIndexFiles: any = files.filter(
        (i) => i.data.fIndex === currentIndex
      );
      if (newIndexFiles.length > 0) {
        currentIndexFiles[0].data.files.map((i: any) => {
          newIndexFiles[0].data.files.push(i);
        });
        const filteredArray: any = files.filter(
          (i) =>
            i.data.fIndex !== currentIndex && i.data.fIndex !== featureIndex
        );
        newIndexFiles.map((i: any) => {
          filteredArray.push(i);
        });
        populateLayerFiles(filteredArray);
      } else {
        const newFiles: any = [
          {
            label: featureLabel,
            data: {
              fIndex: featureIndex,
              files: [],
            },
          },
        ];
        currentIndexFiles[0].data.files.map((i: any) => {
          newFiles[0].data.files.push(i);
        });
        const filteredArray: any = files.filter(
          (i) => i.data.fIndex !== currentIndex
        );
        newFiles.map((i: any) => {
          filteredArray.push(i);
        });
        populateLayerFiles(filteredArray);
      }
    }
  }

  function updateReviewListSingle(
    id: any,
    index: any,
    current: any,
    newLabel: any
  ) {
    console.log(id, index, current);
    if (index.toString() !== current) {
      const files: any = layerFiles;
      const originalDesitination = files.filter(
        (i: any) => i.data.fIndex === current
      ); //---filtering the current layerfile
      const fileInQuestion = originalDesitination[0].data.files.filter(
        (i: any) => i._id === id
      ); //------filtering the file in question
      originalDesitination[0].data.files =
        originalDesitination[0].data.files.filter((i: any) => i._id !== id); //---removing selected file from original destination
      const newDestination = files.filter(
        (i: any) => i.data.fIndex === index.toString()
      ); //-----filtering new destination for file
      if (newDestination.length > 0) {
        newDestination[0].data.files.push(fileInQuestion[0]);
        const filtered = files.filter(
          (i: any) =>
            i.data.fIndex !== index.toString() && i.data.fIndex !== current
        );
        if (originalDesitination[0].data.files.length > 0) {
          filtered.push(originalDesitination[0]);
        }
        filtered.push(newDestination[0]);
        const UnassignedImages: any = filtered.filter((i) => i.label === null); // filtering the unassigned entry
        const filtered2Array: any = filtered.filter((i) => i.label !== null); //filtering the array to get rid of the unassigned object
        if (UnassignedImages.length > 0) {
          filtered2Array.unshift(UnassignedImages[0]);
          populateLayerFiles(filtered2Array);
        } else {
          populateLayerFiles(filtered);
        }
      } else {
        const object: any = {
          label: newLabel,
          data: {
            fIndex: index.toString(),
            files: [],
          },
        };
        object.data.files.push(fileInQuestion[0]);
        const filtered = files.filter((i: any) => i.data.fIndex !== current);
        filtered.push(object);
        if (originalDesitination[0].data.files.length > 0) {
          filtered.push(originalDesitination[0]);
        }
        const UnassignedImages: any = filtered.filter((i) => i.label === null); // filtering the unassigned entry
        const filtered2Array: any = filtered.filter((i) => i.label !== null); //filtering the array to get rid of the unassigned object
        if (UnassignedImages.length > 0) {
          filtered2Array.unshift(UnassignedImages[0]);
          populateLayerFiles(filtered2Array);
        } else {
          populateLayerFiles(filtered);
        }
        populateLayerFiles(filtered);
      }
    }
  }

  function confirmReviewdFiles() {
    if (reviewList.length > 0) {
      const payload: any = {
        layerId: props.layerId,
        check: reviewList,
      };
      setIsReviewing(true);
      http
        .patch(`${apis.CONFIRM_REVIEW_IMAGES}`, payload)
        .then((res) => {
          if (res.data.status) {
            console.log(res.data);
          } else {
            message.error(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setCurrentStage(3);
          setIsReviewing(false);
        });
    } else {
      setCurrentStage(3);
      setIsReviewing(false);
      setReviewPending(true);
    }
  }

  const steps = [
    {
      title: "Upload",
      description: "Upload photos to ARU",
      content: (
        <>
          <Dragger
            {...{
              style: { marginTop: "8px" },
              fileList,
              defaultFileList: fileList,
              onRemove: handleRemove,
              beforeUpload: handleBeforeUpload,
              multiple: true,
              onChange: handleChangeFiles,
              progress: { showInfo: true },
              data: (file) => {
                console.log("Data:", file);
              },
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag images to this area to upload
            </p>
            <p className="ant-upload-hint">Supports jpeg and png images only</p>
          </Dragger>

          <>
            {isUploading ? (
              <Progress strokeLinecap="square" percent={Math.floor(progress)} />
            ) : null}
          </>
        </>
      ),
      stage: 0,
    },
    {
      title: "Processing",
      description: "Now processing images",
      content: (
          <Result
            status="success"
            title="Images uploaded successfully!"
            subTitle="We are now processing your images on our servers, to find the best matches for each image, to their respective features of the layer."
          >
            <div className="desc">
              <Row>
                <Col md={6}>
                  <Spin
                    size="large"
                    style={{ marginLeft: "35%", marginTop: "15%" }}
                  />
                </Col>
                <Col md={18}>
                  <Text>
                    Processing images. This may take some time. You can also
                    close this window and continue with your work, we will
                    notify you once the process is complete. From there on, you
                    can find your files under the layer's review section (right
                    on layer - more - review)
                  </Text>
                </Col>
              </Row>
            </div>
          </Result>
      ),
      stage: 1,
    },
    {
      title: "Review",
      description: "Verify assigned photos",
      content: (
          <Spin size="large" spinning={loader}>
            <>
              <Title level={2}>Please review the geolocated images</Title>
              <Divider />
              <div style={{ overflow: "auto", height: "300px" }}>
                {layerFiles.map((subHeading: any) => {
                  return (
                    <>
                      <Row>
                        <Dropdown
                          onOpenChange={() => setSubHeading(subHeading)}
                          menu={{
                            items: menuItem1(),
                            onClick: onClickMenu1,
                          }}
                          trigger={["click"]}
                        >
                          <Text
                            onClick={(e: any) => e.preventDefault()}
                            style={{ cursor: "pointer" }}
                          >
                            <EnvironmentOutlined />{" "}
                            {subHeading.label === null
                              ? "Unassigned Images"
                              : subHeading.label}{" "}
                            <DownOutlined />
                          </Text>
                        </Dropdown>
                      </Row>
                      <Row>
                        {subHeading.data.files.map((item: any) => {
                          return (
                            <Col span={8} md={8} key={window.crypto.randomUUID()}>
                              <div>
                                <Dropdown
                                  onOpenChange={() => setSubHeading(subHeading)}
                                  menu={{
                                    items: menuItem2(),
                                    onClick: onClickMenu2,
                                  }}
                                  trigger={["contextMenu"]}
                                >
                                  <Image
                                    key={`${item._id}`}
                                    style={{ padding: "8px" }}
                                    width={"auto"}
                                    height={180}
                                    src={`${STATIC_URL}/images/geojson/1x_${
                                      item.filePath.split("/")[3]
                                    }`}
                                    preview={false}
                                    fallback="data:image/png;base64,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"
                                  />
                                </Dropdown>
                              </div>
                            </Col>
                          );
                        })}
                        <Divider />
                      </Row>
                    </>
                  );
                })}
              </div>
            </>
          </Spin>
      ),
      stage: 2,
    },
    {
      title: "Finish",
      description: "Images assigned!",
      content: (
        <>
          {reviewPending ? (
            <Result
              status="info"
              title="Your images are still pending to be reviewed!"
              subTitle="You can review them later by right-clicking on a layer > more > Review"
            />
          ) : (
            <Result
              status="success"
              title="Successfully Assigned Images to features!"
              subTitle="Your images was successfully tagged along with the said features of this layer."
            />
          )}
        </>
      ),
      stage: 3,
    },
  ];

  function renderFooterButtons() {
    switch (currentStage) {
      case 0:
        if (props.layerLabel === "No label selected") {
          return (
            <Button
              onClick={() => {
                props.setVisible(false);
                setCurrentStage(0);
              }}
            >
              Close
            </Button>
          );
        } else {
          return (
            <>
              <p>
                Match Label?
                <Switch
                  onChange={(matchLayer) =>
                    setMatchMode(matchLayer ? "LayerLabel" : "GeoCoord")
                  }
                  style={{ margin: "0.5rem 1rem" }}
                />
              </p>
              <Button
                onClick={() => {
                  if (isUploading) {
                    message.warning(
                      "Please stay in this window as files is still uploading!"
                    );
                  } else {
                    props.setVisible(false);
                    setCurrentStage(0);
                    setFileList([]);
                  }
                }}
              >
                Close
              </Button>
              <Button
                type="primary"
                onClick={handleUploadFiles}
                loading={isUploading}
                disabled={isUploading}
              >
                Upload
              </Button>
            </>
          );
        }

      case 1:
        return <></>;
      case 2:
        return (
          <>
            <Button
              type="primary"
              onClick={() => {
                confirmReviewdFiles();
              }}
              loading={isReviewing}
              disabled={isReviewing}
            >
              Confirm and proceed
            </Button>
          </>
        );
      case 3:
        return (
          <>
            <Button
              type="primary"
              onClick={() => {
                props.setVisible(false);
                setCurrentStage(0);
                props.setRefresh(true);
                setReviewPending(false);
              }}
            >
              Close
            </Button>
          </>
        );
    }
  }

  //------------prevent user from closing tab while uploading------------------
  useEffect(() => {
    if (isUploading) {
      window.addEventListener("beforeunload", (ev) => {
        ev.preventDefault();
        ev.returnValue = "Are you sure you want to close? Data uploading proccess will be terminated!";
        return ev.returnValue;
      });
    }
  }, [isUploading]);
  return (
    <>
      <Modal
        title="Upload images to feature"
        open={props.visible}
        onOk={() => {
          props.setVisible(false);
        }}
        onCancel={() => {
          if (isUploading) {
            message.warning(
              "Please stay in this window as files is still uploading!"
            );
          } else {
            props.setVisible(false);
            setCurrentStage(0);
            setFileList([]);
            props.triggerReviewReload(true);
            setReviewPending(false);
          }
        }}
        footer={renderFooterButtons()}
        bodyStyle={{
          padding: "1rem",
          width: "800px",
          margin: "auto",
        }}
        width={1000}
        centered={true}
      >
        {props.layerLabel === "No label selected" ? (
          <Result
            title="Please choose a layer label first!"
            subTitle="You will find the option to choose layer label, by right clicking on a layer from sidebar > More > Layer settings."
            status="info"
          />
        ) : (
          <>
            <Steps
              current={currentStage}
              items={steps.map((item) => {
                return {
                  title: item.title,
                  description: item.description,
                };
              })}
            ></Steps>
            <div>{steps[currentStage].content}</div>
          </>
        )}
      </Modal>
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

export default Pictomap;
