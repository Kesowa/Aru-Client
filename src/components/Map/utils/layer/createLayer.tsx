import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Modal,
  Steps,
  Button,
  message,
  Result,
  Upload,
  Row,
  Col,
  Spin,
  Typography,
  Form,
  Input,
  TreeSelect,
  Progress,
} from "antd";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { InboxOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { SketchPicker } from "react-color";
import { vectorProps } from "src/static/vectorprops";
import { options } from "../propUtils";
import { AuthContext } from "src/services/authUtils";

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;
const { Item } = Form;

const CreateLayer = (props: any) => {
  const socket: any = useRef();
  const [current, setCurrent] = useState(0);
  const [fileList, setFileList] = useState<any>([]);
  const [layerName, setLayerName] = useState("");
  const [layerType, setLayerType] = useState<vectorProps | null>(null);
  const [layerColor, setLayerColor] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [badImages, setBadImages] = useState<any>([]);
  const [storageModal, setStorageModal] = useState(false);

  const [form] = Form.useForm();

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    if (current === 1) {
      if (props.status) {
        console.log(props.data);
        setBadImages(props.data.badImages);
        props.addLayer(props.data.result);
        setCurrent(2);
        props.setStatus(false);
      }
    }
  }, [props.status, current]);

  const handleChangeFiles = ({ fileList, file }) => {
    setFileList([...fileList]);
  };

  const handleBeforeUpload = (file) => {
    setFileList([...fileList, file]);
    return false;
  };

  const handleRemove = (selectedFile) => {
    return fileList.filter((file) => {
      return selectedFile.uid !== file.uid;
    });
  };

  const uploadProps = {
    multiple: true,
    fileList,
    defaultFileList: fileList,
    onChange: handleChangeFiles,
    onRemove: handleRemove,
    beforeUpload: handleBeforeUpload,
    progress: { showInfo: true },
    data: (file) => {
      console.log("Data:", file);
    },
  };
  //---------------------File validator----------------
  function validateFile(file: any) {
    const extension = file.name.split(".")[1];
    switch (file.type) {
      case "image/png":
        return true;
      case "image/jpeg":
        return true;
      default:
        return false;
    }
  }

  function handleUploadFiles() {
    if (fileList.length > 0) {
      if (!layerName || !layerType) {
        message.error("Please fill all the required fields!");
        form.resetFields();
        return;
      }
      setIsUploading(true);
      const fData = new FormData();
      if (props.isBaseMap) {
        //fData.append("missionId", null);
      } else {
        fData.append("missionId", props.missionId);
      }
      fData.append("name", layerName);
      fData.append("color", layerColor);
      fData.append("vectorType", String(layerType));
      fileList.forEach((file) => {
        if (validateFile(file)) {
          fData.append("file", file.originFileObj);
        } else {
          message.warning("Please upload a jpeg/jpg or png file!");
          setIsUploading(false);
          form.resetFields();
          return;
        }
      });

      if (layerTYpe === vectorProps.OVER_HEAD_TANK) {
        featureData.features[0].properties["icon"] = "TankIcon";
      } else {
        featureData.features[0].properties["icon"] = "MarkerIcon";
      }

      const config = {
        headers: { "content-type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.floor((event.loaded / event.total) * 100);
          setProgress(percent);
          if (percent === 100) {
            setTimeout(() => setProgress(0), 1000);
          }
        },
      };

      http
        .post(`${apis.CREATE_LAYER_FROM_IMAGES}`, fData, config)
        .then((res) => {
          console.log(res);
          if (res.data.status) {
            console.log(res.data);
            message.success("Successfully Uploaded!");
            setIsUploading(false);
            setCurrent(1);
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
          setLayerName("");
          setLayerType(null);
          setLayerColor("");
          setFileList([]);
          form.resetFields();
        });
    } else {
      message.warning("Please upload some files before proceeding forward!");
    }
  }

  const steps = [
    {
      title: "Upload",
      description: "Upload Layer Information and Images",
      content: (
        <>
          <Form layout="vertical" form={form}>
            <Row>
              <Col span={14} style={{ padding: "10px" }}>
                <Item label="Name" name="name">
                  <Input
                    placeholder="Layer's Name"
                    onChange={(e) => {
                      setLayerName(e.target.value);
                    }}
                  />
                </Item>
                <Item label="Layer Type" name="type">
                  <TreeSelect
                    showSearch
                    style={{ width: "100%" }}
                    dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                    placeholder="Select Layer Type"
                    allowClear
                    treeData={options[1].children[2].children} // all vectorProps of featureType "Point"
                    onChange={(value) => setLayerType(value as vectorProps)}
                  />
                </Item>
              </Col>
              <Col span={10} style={{ padding: "5px" }}>
                <Row>
                  <SketchPicker
                    color={layerColor}
                    onChangeComplete={(color) => setLayerColor(color.hex)}
                  />
                </Row>
              </Col>
            </Row>
          </Form>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag images to this area to upload
            </p>
            <p className="ant-upload-hint">
              Supports jpeg/jpg and png images only
            </p>
          </Dragger>
          <>
            {isUploading ? (
              <Progress
                width="100%"
                strokeLinecap="square"
                percent={progress}
              />
            ) : null}
          </>
          <Row
            style={{
              display: "flex",
              flexFlow: "row",
              justifyContent: "end",
              marginTop: "5px",
            }}
          >
            <Button
              style={{ marginRight: "10px" }}
              onClick={() => {
                if (isUploading) {
                  message.warning(
                    "Please stay in this window as files is still uploading!"
                  );
                } else {
                  props.setVisbible(false);
                  setCurrent(0);
                  setFileList([]);
                  form.resetFields();
                }
              }}
            >
              Close
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleUploadFiles();
              }}
              loading={isUploading}
              disabled={isUploading}
            >
              Upload
            </Button>
          </Row>
        </>
      ),
    },
    {
      title: "Processing",
      description: "Now Processing Images and Layer Information",
      content: (
        <>
          <Result
            status="success"
            title="Images uploaded successfully!"
            subTitle="We are now geolocating your images on the map!"
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
                    notify you once the process is complete.
                  </Text>
                </Col>
              </Row>
            </div>
          </Result>
        </>
      ),
    },
    {
      title: "Finish",
      description: "Layer Created From Images",
      content: (
        <>
          {badImages.length > 0 ? (
            <Result
              status="success"
              title="Successfully Created Layer From Images!"
              subTitle="Your images were successfully geolocated on the map by creating a new layer."
            >
              <div className="desc">
                <Paragraph>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                    }}
                  >
                    Some of the images you uploaded have the following error:
                  </Text>
                </Paragraph>
                {badImages.map((item: any) => {
                  return (
                    <Paragraph>
                      <CloseCircleOutlined style={{ color: "red" }} /> File{" "}
                      {item} has no geocoordinates. Failed to geolocate!
                    </Paragraph>
                  );
                })}
              </div>
            </Result>
          ) : (
            <Result
              status="success"
              title="Successfully Created Layer From Images!"
              subTitle="Your images were successfully geolocated on the map by creating a new layer."
            />
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <Modal
        title="Create Layer From Images"
        open={props.isModalVisible}
        onCancel={() => {
          props.setVisbible(false);
          setCurrent(0);
          form.resetFields();
        }}
        footer={null}
        bodyStyle={{
          padding: "1rem",
          width: "800px",
          margin: "auto",
        }}
        width={1000}
        centered={true}
      >
        <Steps
          current={current}
          items={steps.map((item) => {
            return {
              title: item.title,
              description: item.description,
            };
          })}
        ></Steps>
        <div className="steps-content">{steps[current].content}</div>
      </Modal>
      <Modal
        title="Storage Exceeded!"
        open={storageModal}
        onOk={() => setStorageModal(false)}
        onCancel={() => setStorageModal(false)}
      >
        <Result
          status="403"
          title="Oops! It seems you have run out of storage!"
          subTitle="Please contact admin@kesowa.com to renew our services! to see you storage details, head over to My Account > Package."
        />
      </Modal>
    </div>
  );
};

export default CreateLayer;
