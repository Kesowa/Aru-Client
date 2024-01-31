import {
  Button,
  Result,
  Upload,
  Row,
  Col,
  Form,
  Alert,
  Input,
  TreeSelect,
  DatePicker,
  Progress,
  Switch,
  Card,
  Typography,
  Table,
  Select,
  Collapse,
  Divider,
} from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { SketchPicker } from "react-color";
const { Dragger } = Upload;
const { Item } = Form;
const { Meta } = Card;
const { Option } = Select;
const { Text, Title } = Typography;
const { Panel } = Collapse;
export const UploadVectorData = ({
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
  showColorPicker,
  layerColor,
  setLayerColor,
  onChangeInherit,
  options,
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
        <Row
          style={{
            paddingLeft: "10px",
            paddingRight: "5px",
          }}
        >
          <Alert
            style={{
              width: "100%",
            }}
            message="Please note!"
            description={`Make sure that your geojson file has the "color" attribute in each feature, in order to inherit colors`}
            type="info"
            banner
            showIcon
          />
        </Row>
        <Row>
          <Col
            span={14}
            style={{
              padding: "10px",
            }}
          >
            <Form.Item label="Name" name="name">
              <Input
                placeholder="Layer's Name"
                onChange={(e) => {
                  setLayerName(e.target.value);
                }}
                value={layerName}
              />
            </Form.Item>
            <Form.Item label="Layer Type" name="type">
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
            <Row>
              <Form.Item label="Capture Date" name="date">
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
                message={`Only .geojson files support for type "Vector" and .tif for type "Raster"`}
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
          <Col
            span={10}
            style={{
              padding: "5px",
            }}
          >
            {showColorPicker && (
              <Row>
                <SketchPicker
                  color={layerColor}
                  onChangeComplete={(color) => setLayerColor(color.hex)}
                />
              </Row>
            )}
            <Row
              style={{
                paddingLeft: "2rem",
              }}
            >
              <p>
                Inherit color&nbsp;&nbsp;&nbsp;
                <Switch onChange={onChangeInherit} />
              </p>
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export const AttrSelection = ({ rowSelection, columns, tableData }) => {
  return (
    <>
      <div
        style={{
          height: "500px",
        }}
      >
        <Title
          level={5}
          style={{
            marginTop: "1rem",
          }}
        >
          <span
            style={{
              color: "red",
            }}
          >
            *
          </span>{" "}
          Choose attributes to inherit in layer.
        </Title>
        <Table
          rowSelection={{ ...rowSelection }}
          style={{
            height: "200px",
            width: "100%",
          }}
          columns={columns}
          dataSource={tableData}
          scroll={{
            y: "400px",
          }}
          pagination={false}
        />
      </div>
    </>
  );
};

export const LayerCreated = () => {
  return (
    <>
      <div
        style={{
          marginTop: "100px",
        }}
      >
        <Result
          status="success"
          title="Successfully created layer!"
          subTitle="You can now view the layer in the map."
        />
      </div>
    </>
  );
};

export const UpdateVectorData = ({ uploadProps, uploading, progress }) => {
  return (
    <>
      <Row>
        <div
          style={{
            width: "500px",
            padding: "1rem",
            margin: "auto",
          }}
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Upload a vector file</p>
            <p className="ant-upload-hint">only .geojson files are supported</p>
          </Dragger>

          {uploading ? (
            <Progress strokeLinecap="square" percent={progress} />
          ) : null}
        </div>
      </Row>
    </>
  );
};

export const AttrMapping = ({
  uuid,
  handleAttributeMapping2,
  fields,
  selectedAttr,
  primeAttributes,
}) => {
  return (
    <>
      <Title
        level={4}
        style={{
          marginTop: "8px",
        }}
      >
        Map attributes to existing
      </Title>
      <Text>
        Select the attributes of you existing layer, to map against attributes
        from the file. Remaining un-mapped attribute information will not be
        lost as it will be still stored in your layer.
      </Text>
      <div
        style={{
          padding: "20px",
        }}
        key={uuid()}
      >
        <Row>
          <Col span={12}>
            <Title level={5}>Attribute name</Title>
          </Col>
          <Col span={12}>
            <Title level={5}>Map to field</Title>
          </Col>
        </Row>
        <div
          style={{
            height: "400px",
            overflow: "auto",
          }}
        >
          {/* -ROW------------------- */}
          {fields.map((f: unknown) => {
            if (
              f.attr !== "sys_id" &&
              f.attr !== "icon" &&
              f.attr !== "color"
            ) {
              return (
                <>
                  <Row
                    style={{
                      padding: "5px",
                    }}
                    key={uuid()}
                  >
                    <Col span={12}>
                      <Text>{f.attr}</Text>
                      <br />
                      <Text type="secondary">Sample: {f.value}</Text>
                    </Col>
                    <Col span={12}>
                      <Select
                        key={`${f.attr}-${uuid()}`}
                        style={{
                          width: "200px",
                        }}
                        defaultValue={
                          selectedAttr[f.attr] ? selectedAttr[f.attr] : null
                        }
                        onSelect={(e) => handleAttributeMapping2(e, f, null)}
                        placeholder="Map the attribute selected"
                      >
                        {primeAttributes.map((item) => (
                          <Option key={`${uuid()}-${item}`} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                  <Divider />
                </>
              );
            }
          })}
        </div>
      </div>
    </>
  );
};

export const LayerUpdated = () => {
  return (
    <>
      <div
        style={{
          marginTop: "100px",
        }}
      >
        <Result
          status="success"
          title="Successfully updated layer!"
          subTitle="You can now view the layer in the map."
        />
      </div>
    </>
  );
};
