import { Col, Collapse, Divider, Row, Select, Typography } from "antd";
import { memo } from "react";
import { v4 as uuid } from "uuid";

const { Panel } = Collapse;
const { Text, Title } = Typography;
const { Option } = Select;

function AttributeMapping(props: any) {
  function handleAttributeMapping(e: any, fields: any, layers: any) {
    let ooi: any = [];
    const finalArray: any = [...props.responseArray];
    if (props.responseArray.length > 0) {
      ooi = props.responseArray.filter((i) => i.layerId == layers._id);
      if (ooi.length > 0) {
        //console.log("test",ooi)
        ooi[0].attrMapping[`${e}`] = fields.key;
        // console.log(ooi);
        const arraywoObj: any = props.responseArray.filter(
          (i) => i.layerId !== layers._id
        );
        //console.log("array",arraywoObj);
        arraywoObj.push(ooi[0]);
        props.setResponseArray(arraywoObj);
      } else {
        const obj: any = {
          layerId: layers._id,
          attrMapping: {},
        };
        obj.attrMapping[`${e}`] = fields.key;
        finalArray.push(obj);
        props.setResponseArray(finalArray);
      }
    } else {
      const obj: any = {
        layerId: layers._id,
        attrMapping: {},
      };
      obj.attrMapping[`${e}`] = fields.key;
      finalArray.push(obj);
      props.setResponseArray(finalArray);
    }
  }
  return (
    <Collapse
      //defaultActiveKey={["1"]}
      //onChange={(e) => console.log(e)}
      style={{
        width: "100%",
        overflow: "auto",
        maxHeight: "400px",
        marginTop: "12px",
      }}
      //accordion
    >
      {props.metadata.map((missions: any) => {
        return (
          <>
            {missions.layers.map((layers: any) => {
              return (
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
                    {layers.fields.map((fields: any) => {
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
                                  // onChange={(e)=>{
                                  //   handleAttributeMapping(e, fields, layers)
                                  // }}
                                  onSelect={(e) =>
                                    handleAttributeMapping(e, fields, layers)
                                  }
                                  placeholder="Map the attribute selected"
                                >
                                  {props.primeAttributes.map((item, index) => (
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
  );
}

export default memo(AttributeMapping);
