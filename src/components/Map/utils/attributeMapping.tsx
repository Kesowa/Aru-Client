import { Col, Collapse, Divider, Row, Select, Typography } from "antd";
import React, { memo } from "react";
import { v4 as uuid } from "uuid";
const { Panel } = Collapse;
const { Text, Title } = Typography;
const { Option } = Select;

interface Attribute {
  key: string;
  value: string;
}

interface Layer {
  _id: string;
  name: string;
  fields: Attribute[];
}

interface Mission {
  missionName: string;
  layers: Layer[];
}

interface PrimeAttribute {
  key: string;
  attribute: string;
}

interface ResponseObject {
  layerId: string;
  attrMapping: { [key: string]: string };
}

interface AttributeMappingProps {
  metadata: Mission[];
  primeAttributes: PrimeAttribute[];
  responseArray: ResponseObject[];
  setResponseArray: (responseArray: ResponseObject[]) => void;
}

function AttributeMapping(props: Readonly<AttributeMappingProps>) {
  function handleAttributeMapping(
    attribute: string,
    fields: Attribute,
    layers: Layer
  ) {
    const { responseArray, setResponseArray } = props;
    const updatedArray: ResponseObject[] = [...responseArray];
    const ooiIndex = updatedArray.findIndex(
      (item) => item.layerId === layers._id
    );

    if (ooiIndex !== -1) {
      updatedArray[ooiIndex].attrMapping[attribute] = fields.key;
    } else {
      const newObj: ResponseObject = {
        layerId: layers._id,
        attrMapping: { [attribute]: fields.key },
      };
      updatedArray.push(newObj);
    }

    setResponseArray(updatedArray);
  }

  return (
    <Collapse
      style={{
        width: "100%",
        overflow: "auto",
        maxHeight: "400px",
        marginTop: "12px",
      }}
    >
      {props.metadata.map((missions: Mission) => (
        <React.Fragment key={uuid()}>
          {missions.layers.map((layers: Layer) => (
            <Panel
              header={`${layers.name} (${missions.missionName})`}
              key={uuid()}
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
                {layers.fields.map((fields: Attribute) => {
                  if (
                    fields.key !== "sys_id" &&
                    fields.key !== "icon" &&
                    fields.key !== "color"
                  ) {
                    return (
                      <React.Fragment key={uuid()}>
                        <Row style={{ padding: "5px" }} key={uuid()}>
                          <Col span={12}>
                            <Text>{fields.key}</Text>
                            <br />
                            <Text type="secondary">Sample: {fields.value}</Text>
                          </Col>
                          <Col span={12}>
                            <Select
                              key={`${fields.key}-${uuid()}`}
                              style={{ width: "200px" }}
                              onSelect={(attribute) =>
                                handleAttributeMapping(
                                  attribute,
                                  fields,
                                  layers
                                )
                              }
                              placeholder="Map the attribute selected"
                            >
                              {props.primeAttributes.map((item) => (
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
                        <Divider key={uuid()} />
                      </React.Fragment>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            </Panel>
          ))}
        </React.Fragment>
      ))}
    </Collapse>
  );
}

export default memo(AttributeMapping);
