import {
  Button,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Steps,
  Table,
  TreeSelect,
  Typography,
} from "antd";
import React from "react";
import { LayerUpdated } from "./vectorLayerSteps";
import { SketchPicker } from "react-color";
const { Item } = Form;
const { Option } = Select;
const { Text, Title } = Typography;
const { Panel } = Collapse;
export const ImportLayerSteps = ({
  current2,
  showAddMissions,
  setShowAddMissions,
  missionsLoading,
  handleSearch,
  onScroll,
  isUpdate,
  setSelectedMissions,
  setPage,
  setMissionOptions,
  setMissionSearchValue,
  setFetch,
  missionOptions,
  layersLoading,
  selectedLayers,
  setSelectedLayers,
  setApiCall,
  selectedMissions,
  uiElement,
  layerOptions,
  addMore,
  setPrimeAttributes,
  tableData,
  activeTab,
  setActiveTab,
  metadata,
  selectedAttr,
  setLayerColor,
  layerColor,
  setCaptureDate,
  changeLayerType,
  options,
  layerType1,
  setLayerName,
  primeAttributes,
  handleAttributeMapping,
}) => {
  const columns2 = [
    {
      title: "Attributes",
      dataIndex: "attribute",
    },
    {
      title: "Occurence In Layers",
      dataIndex: "occurs",
      render: (e) => (
        <>
          {e == "Present in all layers" ? (
            <>
              <span style={{ color: "green", marginRight: "5px" }}>●</span>
              {e}
            </>
          ) : (
            <>
              <span style={{ color: "red", marginRight: "5px" }}>●</span>
              {e}
            </>
          )}
        </>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
      setPrimeAttributes(selectedRows);
    },
  };
  const steps2 = [
    {
      title: "Import Data",
      content: (
        <>
          {!showAddMissions ? (
            <div
              style={{
                width: "500px",
                margin: "100px auto",
                border: "1px solid #d9d9d9",
                padding: "1rem",
                borderRadius: "4px",
              }}
            >
              <Empty description="Add new mission to select layers from which to import data" />
              <Button
                type="default"
                onClick={() => setShowAddMissions(true)}
                style={{ position: "relative", left: "40%", marginTop: "20px" }}
              >
                Add Mission
              </Button>
            </div>
          ) : (
            <div style={{ margin: "10px auto", height: "100%" }}>
              <div
                className="vertical-center"
                style={{
                  height: "500px",
                  overflow: "auto",
                }}
              >
                <Row>
                  <Col span={12}>
                    <h4>
                      <span style={{ color: "red" }}>*</span> Choose mission to
                      import data from
                    </h4>
                    <Select
                      placeholder="Select Mission(s)"
                      showSearch
                      loading={missionsLoading}
                      onSearch={handleSearch}
                      showArrow
                      allowClear
                      onChange={(e) => setSelectedMissions([e])}
                      style={{ width: "200px" }}
                      onPopupScroll={onScroll}
                      onFocus={() => {
                        setPage(1);
                        setMissionOptions([]);
                        setMissionSearchValue("");
                        setFetch(true);
                      }}
                      notFoundContent={null}
                      filterOption={false}
                    >
                      {missionOptions.map((mission) => (
                        <Option key={mission._id} value={mission._id}>
                          {mission.name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={12}>
                    <h4>
                      <span style={{ color: "red" }}>*</span> Choose layer(s)
                      from mission
                    </h4>
                    <Select
                      placeholder="Select Layers(s)"
                      showSearch
                      loading={layersLoading}
                      optionFilterProp="label"
                      showArrow
                      allowClear={false}
                      onDeselect={(e) => {
                        console.log(e);
                        const filtered: unknown = selectedLayers.filter(
                          (i) => i !== e && i !== undefined
                        );
                        setSelectedLayers(filtered);
                        setApiCall(true);
                      }}
                      onChange={(e) => {
                        const value: unknown = e;
                        const array: unknown = [...selectedLayers];
                        if (value.length > 1) {
                          console.log(array.includes(value.at(-1)));
                          array.push(value.at(-1));
                        } else {
                          console.log(array.includes(value[0]));
                          array.push(value[0]);
                        }
                        setSelectedLayers(array);
                      }}
                      mode="tags"
                      style={{ minWidth: "200px", maxWidth: "500px" }}
                    >
                      {selectedMissions &&
                        layerOptions.map((layer) => (
                          <Option key={layer._id} value={layer._id}>
                            {layer.name}
                          </Option>
                        ))}
                    </Select>
                  </Col>
                </Row>
                {uiElement.map((id: unknown) => {
                  return (
                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <h4>
                          <span style={{ color: "red" }}>*</span> Choose mission
                          to import data from
                        </h4>
                        <Select
                          placeholder="Select Mission(s)"
                          showSearch
                          loading={missionsLoading}
                          onSearch={handleSearch}
                          showArrow
                          allowClear
                          onChange={(e) => setSelectedMissions([e])}
                          style={{ width: "200px" }}
                          onPopupScroll={onScroll}
                          onFocus={() => {
                            setPage(1);
                            setMissionOptions([]);
                            setMissionSearchValue("");
                            setFetch(true);
                          }}
                          notFoundContent={null}
                          filterOption={false}
                        >
                          {missionOptions.map((mission) => (
                            <Option key={mission._id} value={mission._id}>
                              {mission.name}
                            </Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={12}>
                        <h4>
                          <span style={{ color: "red" }}>*</span> Choose
                          layer(s) from mission
                        </h4>
                        <Select
                          placeholder="Select Layers(s)"
                          showSearch
                          loading={layersLoading}
                          optionFilterProp="label"
                          showArrow
                          allowClear={false}
                          onDeselect={(e) => {
                            console.log(e);
                            const filtered: unknown = selectedLayers.filter(
                              (i) => i !== e && i !== undefined
                            );
                            setSelectedLayers(filtered);
                            setApiCall(true);
                          }}
                          onChange={(e) => {
                            const value: unknown = e;
                            const array: unknown = [...selectedLayers];
                            if (value.length > 1) {
                              console.log(array.includes(value.at(-1)));
                              array.push(value.at(-1));
                            } else {
                              console.log(array.includes(value[0]));
                              array.push(value[0]);
                            }
                            setSelectedLayers(array);
                          }}
                          mode="tags"
                          style={{ minWidth: "200px", maxWidth: "500px" }}
                        >
                          {selectedMissions &&
                            layerOptions.map((layer) => (
                              <Option key={layer._id} value={layer._id}>
                                {layer.name}
                              </Option>
                            ))}
                        </Select>
                      </Col>
                    </Row>
                  );
                })}

                <Button
                  type="primary"
                  style={{ marginTop: "10px" }}
                  onClick={() => addMore()}
                >
                  Add more missions
                </Button>
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      title: "Attribute Selection",
      content: (
        <>
          <Title level={4} style={{ marginTop: "8px" }}>
            Select Attributes to inherit in layer
          </Title>
          <Text>
            Select the attributes that you want as to be the base attribute
            structure of your layer.
          </Text>

          <Table
            rowSelection={{
              ...rowSelection,
            }}
            columns={columns2}
            dataSource={tableData}
            style={{ height: "400px", width: "100%", margin: "10px auto" }}
            scroll={{ y: "390px" }}
            pagination={false}
          />
        </>
      ),
    },
    {
      title: "Attribute Mapping",
      content: (
        <>
          <Title level={4} style={{ marginTop: "8px" }}>
            Map attributes to existing
          </Title>
          <Text>
            Select the attributes imported from your missions, to map against
            existing attributes of the layer. Remaining un-mapped attribute
            information will not be lost as it will be still stored in your
            layer.
          </Text>

          <Collapse
            defaultActiveKey={activeTab}
            onChange={(e) => setActiveTab(e)}
            style={{
              width: "100%",
              overflow: "auto",
              maxHeight: "400px",
              marginTop: "12px",
            }}
            //accordion
          >
            {metadata.map((missions: unknown) => {
              return (
                <>
                  {missions.layers.map((layers: unknown, i) => {
                    return (
                      <Panel
                        header={`${layers.name} (${missions.missionName})`}
                        key={i}
                      >
                        <div style={{ padding: "20px" }} key={uuid()}>
                          <Row>
                            <Col span={12}>
                              <Title level={5}>Attribute name</Title>
                            </Col>
                            <Col span={12}>
                              <Title level={5}>Map to field</Title>
                            </Col>
                          </Row>
                          {/* -ROW------------------- */}
                          {layers.fields.map((fields: unknown) => {
                            if (
                              fields.key !== "sys_id" &&
                              fields.key !== "icon" &&
                              fields.key !== "color"
                            ) {
                              return (
                                <>
                                  <Row style={{ padding: "5px" }} key={uuid()}>
                                    <Col span={12}>
                                      <Text>{fields.key}</Text>
                                      <br />
                                      <Text type="secondary">
                                        Sample: {fields.value}
                                      </Text>
                                    </Col>
                                    <Col span={12}>
                                      <Select
                                        key={`${fields.key}-${uuid()}`}
                                        style={{ width: "200px" }}
                                        defaultValue={
                                          selectedAttr[layers._id]
                                            ? selectedAttr[layers._id][
                                                fields.key
                                              ]
                                              ? selectedAttr[layers._id][
                                                  fields.key
                                                ]
                                              : null
                                            : null
                                        }
                                        onSelect={(e) =>
                                          handleAttributeMapping(
                                            e,
                                            fields,
                                            layers
                                          )
                                        }
                                        placeholder="Map the attribute selected"
                                      >
                                        {primeAttributes.map((item, index) => (
                                          <Option
                                            key={`${uuid()}-${item.key}`}
                                            value={item.attribute}
                                          >
                                            {item.attribute}
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
                      </Panel>
                    );
                  })}
                </>
              );
            })}
          </Collapse>
        </>
      ),
    },
    {
      title: "Layer Details",
      content: (
        <>
          <Form
            layout="vertical"
            style={{ height: "390px", marginTop: "10px" }}
            form={form}
          >
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
                {layerType1 == "Vector" && (
                  <Item label="Layer Type" name="layertype">
                    <TreeSelect
                      showSearch
                      style={{ width: "100%" }}
                      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                      placeholder="Select Layer Type"
                      allowClear
                      treeData={options[1].children[2].children}
                      onChange={changeLayerType}
                    />
                  </Item>
                )}
                <Item label="Capture Date" name="date">
                  <DatePicker
                    format={"YYYY/MM/DD HH:mm"}
                    onChange={(value: unknown) => {
                      if (value) {
                        setCaptureDate(value.toISOString(true));
                      } else setCaptureDate("");
                    }}
                  />
                </Item>
              </Col>
              <Col span={10} style={{ padding: "5px" }}>
                <Row>
                  {layerType1 == "Vector" && (
                    <SketchPicker
                      color={layerColor}
                      onChangeComplete={(color) => setLayerColor(color.hex)}
                    />
                  )}
                </Row>
              </Col>
            </Row>
          </Form>
        </>
      ),
    },
  ];

  // For updating layers
  const steps2Update = [
    {
      title: "Import Data",
      content: (
        <>
          {!showAddMissions ? (
            <div
              style={{
                width: "500px",
                margin: "100px auto",
                border: "1px solid #d9d9d9",
                padding: "1rem",
                borderRadius: "4px",
              }}
            >
              <Empty description="Add new mission to select layers from which to import data" />
              <Button
                type="default"
                onClick={() => setShowAddMissions(true)}
                style={{ position: "relative", left: "40%", marginTop: "20px" }}
              >
                Add Mission
              </Button>
            </div>
          ) : (
            <div style={{ margin: "10px auto", height: "100%" }}>
              <div
                className="vertical-center"
                style={{
                  height: "500px",
                  overflow: "auto",
                }}
              >
                <Row>
                  <Col span={12}>
                    <h4>
                      <span style={{ color: "red" }}>*</span> Choose mission to
                      import data from
                    </h4>
                    <Select
                      placeholder="Select Mission(s)"
                      showSearch
                      loading={missionsLoading}
                      onSearch={handleSearch}
                      showArrow
                      allowClear
                      onChange={(e) => setSelectedMissions([e])}
                      style={{ width: "200px" }}
                      onPopupScroll={onScroll}
                      onFocus={() => {
                        setPage(1);
                        setMissionOptions([]);
                        setMissionSearchValue("");
                        setFetch(true);
                      }}
                      notFoundContent={null}
                      filterOption={false}
                    >
                      {missionOptions.map((mission) => (
                        <Option key={mission._id} value={mission._id}>
                          {mission.name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={12}>
                    <h4>
                      <span style={{ color: "red" }}>*</span> Choose layer(s)
                      from mission
                    </h4>
                    <Select
                      placeholder="Select Layers(s)"
                      showSearch
                      loading={layersLoading}
                      optionFilterProp="label"
                      showArrow
                      allowClear={false}
                      onDeselect={(e) => {
                        console.log(e);
                        const filtered: unknown = selectedLayers.filter(
                          (i) => i !== e && i !== undefined
                        );
                        setSelectedLayers(filtered);
                        setApiCall(true);
                      }}
                      onChange={(e) => {
                        const value: unknown = e;
                        const array: unknown = [...selectedLayers];
                        if (value.length > 1) {
                          console.log(array.includes(value.at(-1)));
                          array.push(value.at(-1));
                        } else {
                          console.log(array.includes(value[0]));
                          array.push(value[0]);
                        }
                        setSelectedLayers(array);
                      }}
                      mode="tags"
                      style={{ minWidth: "200px", maxWidth: "500px" }}
                    >
                      {selectedMissions &&
                        layerOptions.map((layer) => (
                          <Option key={layer._id} value={layer._id}>
                            {layer.name}
                          </Option>
                        ))}
                    </Select>
                  </Col>
                </Row>
                {uiElement.map((id: unknown) => {
                  return (
                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <h4>
                          <span style={{ color: "red" }}>*</span> Choose mission
                          to import data from
                        </h4>
                        <Select
                          placeholder="Select Mission(s)"
                          showSearch
                          loading={missionsLoading}
                          onSearch={handleSearch}
                          showArrow
                          allowClear
                          onChange={(e) => setSelectedMissions([e])}
                          style={{ width: "200px" }}
                          onPopupScroll={onScroll}
                          onFocus={() => {
                            setPage(1);
                            setMissionOptions([]);
                            setMissionSearchValue("");
                            setFetch(true);
                          }}
                          notFoundContent={null}
                          filterOption={false}
                        >
                          {missionOptions.map((mission) => (
                            <Option key={mission._id} value={mission._id}>
                              {mission.name}
                            </Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={12}>
                        <h4>
                          <span style={{ color: "red" }}>*</span> Choose
                          layer(s) from mission
                        </h4>
                        <Select
                          placeholder="Select Layers(s)"
                          showSearch
                          loading={layersLoading}
                          optionFilterProp="label"
                          showArrow
                          allowClear={false}
                          onDeselect={(e) => {
                            console.log(e);
                            const filtered: unknown = selectedLayers.filter(
                              (i) => i !== e && i !== undefined
                            );
                            setSelectedLayers(filtered);
                            setApiCall(true);
                          }}
                          onChange={(e) => {
                            const value: unknown = e;
                            const array: unknown = [...selectedLayers];
                            if (value.length > 1) {
                              console.log(array.includes(value.at(-1)));
                              array.push(value.at(-1));
                            } else {
                              console.log(array.includes(value[0]));
                              array.push(value[0]);
                            }
                            setSelectedLayers(array);
                          }}
                          mode="tags"
                          style={{ minWidth: "200px", maxWidth: "500px" }}
                        >
                          {selectedMissions &&
                            layerOptions.map((layer) => (
                              <Option key={layer._id} value={layer._id}>
                                {layer.name}
                              </Option>
                            ))}
                        </Select>
                      </Col>
                    </Row>
                  );
                })}

                <Button
                  type="primary"
                  style={{ marginTop: "10px" }}
                  onClick={() => addMore()}
                >
                  Add more missions
                </Button>
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      title: "Attribute Mapping",
      content: (
        <>
          <Title level={4} style={{ marginTop: "8px" }}>
            Map attributes to existing
          </Title>
          <Text>
            Select the attributes imported from your missions, to map against
            existing attributes of the layer. Remaining un-mapped attribute
            information will not be lost as it will be still stored in your
            layer.
          </Text>

          <Collapse
            defaultActiveKey={activeTab}
            onChange={(e) => setActiveTab(e)}
            style={{
              width: "100%",
              overflow: "auto",
              maxHeight: "400px",
              marginTop: "12px",
            }}
            //accordion
          >
            {metadata.map((missions: unknown) => {
              return (
                <>
                  {missions.layers.map((layers: unknown, i) => {
                    return (
                      <Panel
                        header={`${layers.name} (${missions.missionName})`}
                        key={i}
                      >
                        <div style={{ padding: "20px" }} key={uuid()}>
                          <Row>
                            <Col span={12}>
                              <Title level={5}>Attribute name</Title>
                            </Col>
                            <Col span={12}>
                              <Title level={5}>Map to field</Title>
                            </Col>
                          </Row>
                          {/* -ROW------------------- */}
                          {layers.fields.map((fields: unknown) => {
                            if (
                              fields.key !== "sys_id" &&
                              fields.key !== "icon" &&
                              fields.key !== "color"
                            ) {
                              return (
                                <>
                                  <Row style={{ padding: "5px" }} key={uuid()}>
                                    <Col span={12}>
                                      <Text>{fields.key}</Text>
                                      <br />
                                      <Text type="secondary">
                                        Sample: {fields.value}
                                      </Text>
                                    </Col>
                                    <Col span={12}>
                                      <Select
                                        key={`${fields.key}-${uuid()}`}
                                        style={{ width: "200px" }}
                                        defaultValue={
                                          selectedAttr[layers._id]
                                            ? selectedAttr[layers._id][
                                                fields.key
                                              ]
                                              ? selectedAttr[layers._id][
                                                  fields.key
                                                ]
                                              : null
                                            : null
                                        }
                                        onSelect={(e) =>
                                          handleAttributeMapping(
                                            e,
                                            fields,
                                            layers
                                          )
                                        }
                                        placeholder="Map the attribute selected"
                                      >
                                        {primeAttributes.map((item, index) => (
                                          <Option
                                            key={`${uuid()}-${item.key}`}
                                            value={item.attribute}
                                          >
                                            {item.attribute}
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
                      </Panel>
                    );
                  })}
                </>
              );
            })}
          </Collapse>
        </>
      ),
    },
    {
      title: "Layer Updated!",
      content: <LayerUpdated />,
    },
  ];
  return (
    <>
      <Steps
        current={current2}
        items={
          isUpdate
            ? steps2Update.map((item) => {
                return {
                  title: item.title,
                };
              })
            : steps2.map((item) => {
                return {
                  title: item.title,
                };
              })
        }
      />
      {isUpdate ? (
        <div className="steps-content">{steps2Update[current2].content}</div>
      ) : (
        <div className="steps-content">{steps2[current2].content}</div>
      )}
    </>
  );
};
