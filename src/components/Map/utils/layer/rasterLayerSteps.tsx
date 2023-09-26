import {
  Button,
  Upload,
  Row,
  Col,
  Form,
  Alert,
  Input,
  TreeSelect,
  DatePicker,
  Progress,
  Card,
  Typography,
  Select,
  Collapse,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React from "react";
const { Dragger } = Upload;
const { Item } = Form;
const { Meta } = Card;
const { Option } = Select;
const { Text, Title } = Typography;
const { Panel } = Collapse;
export const UploadRasterData = ({
  form,
  setLayerName,
  layerName,
  changeLayerType,
  setCaptureDate,
  iconOptions,
  setIcon,
  uploadProps,
  uploading,
  progress,
  options
}) => {
  return (
    <>
      <Form
        name="upload2"
        layout="vertical"
        style={{
          width: "700px",
          margin: "20px auto",
        }}
        form={form}
      >
        <Col span={24}>
          <Row>
            <Form.Item
              label="Name"
              name="name"
              style={{
                width: "100%",
              }}
            >
              <Input
                placeholder="Layer's Name"
                onChange={(e) => {
                  setLayerName(e.target.value);
                }}
                value={layerName}
              />
            </Form.Item>
          </Row>

          <Row>
            <Form.Item
              label="Layer Type"
              name="type"
              style={{
                width: "100%",
              }}
            >
              <TreeSelect
                showSearch
                style={{
                  width: "100%",
                }}
                dropdownStyle={{
                  maxHeight: 400,
                  overflow: "auto",
                }}
                placeholder="Select Layer Type"
                allowClear
                treeData={options}
                onChange={changeLayerType}
              />
            </Form.Item>
          </Row>

          <Row>
            <Form.Item
              label="Capture Date"
              name="date"
              style={{
                width: "100%",
              }}
            >
              <DatePicker
                format={"YYYY/MM/DD HH:mm"}
                onChange={(value: unknown) => {
                  if (value) {
                    setCaptureDate(value.toISOString(true));
                  } else setCaptureDate("");
                }}
              />
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="Icon" name="icon">
              <TreeSelect
                showSearch
                style={{
                  width: "150%",
                }}
                dropdownStyle={{
                  maxHeight: 400,
                  overflow: "auto",
                }}
                placeholder="Select Icon"
                placement="bottomLeft"
                defaultValue={"MarkerIcon"}
                treeData={iconOptions}
                onChange={(value) => setIcon(value)}
                treeIcon={true}
              />
            </Form.Item>
          </Row>
          <Row>
            <Alert
              style={{
                width: "100%",
              }}
              message={`Only .tif for type "Raster"`}
              type="info"
              showIcon
            />
            <Form.Item label="Upload File" name="file">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>

              {uploading ? (
                <Progress strokeLinecap="square" percent={progress} />
              ) : null}
            </Form.Item>
          </Row>
        </Col>
      </Form>
    </>
  );
};

export const UpdateRasterData = ({
  form,
  uploadProps,
  uploading,
  progress,
}) => {
  return (
    <>
      <Form
        name="upload2"
        layout="vertical"
        style={{
          width: "700px",
          margin: "20px auto",
        }}
        form={form}
      >
        <Col span={24}>
          <Row>
            <Alert
              style={{
                width: "100%",
              }}
              message="Update layer by uploading a raster file!"
              description={`Only .tif for type "Raster"`}
              type="info"
              showIcon
            />
            <div
              style={{
                width: "500px",
                height: "300px",
                margin: "auto",
                padding: "2rem",
              }}
            >
              <Form.Item
                name="file"
                style={{
                  margin: "auto",
                  textAlign: "center",
                }}
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>

                {uploading ? (
                  <Progress strokeLinecap="square" percent={progress} />
                ) : null}
              </Form.Item>
            </div>
          </Row>
        </Col>
      </Form>
    </>
  );
};
