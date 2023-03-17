import React from "react";
import { Form, Input, Row, Col, Button } from "antd";

export default function BillingDetails(props: any) {
  const [form] = Form.useForm();

  const onFinish = (data: any) => {
    //console.log(data);
    props.goToNextfromBilling(data);
  };

  return (
    <div className="billing-details">
      <Form
        layout="vertical"
        form={form}
        initialValues={props.tenantData}
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span="12">
            <Form.Item
              label="GST Number"
              name="gstNumber"
              rules={[
                { required: true, message: "Please enter the GST number!" },
              ]}
            >
              <Input placeholder="GST Number" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span="12">
            <Form.Item
              label="Address Line 1"
              name="billingAddressLine1"
              rules={[{ required: true, message: "Please enter the address!" }]}
            >
              <Input placeholder="Address Line 1" />
            </Form.Item>
          </Col>
          <Col span="12">
            <Form.Item label="Address Line 2" name="billingAddressLine2">
              <Input placeholder="Address Line 2" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span="6">
            <Form.Item
              label="City"
              name="billingCity"
              rules={[{ required: true, message: "Please enter the city!" }]}
            >
              <Input placeholder="City" />
            </Form.Item>
          </Col>
          <Col span="6">
            <Form.Item
              label="District"
              name="billingDistrict"
              rules={[
                { required: true, message: "Please enter the district!" },
              ]}
            >
              <Input placeholder="District" />
            </Form.Item>
          </Col>
          <Col span="6">
            <Form.Item
              label="State"
              name="billingState"
              rules={[{ required: true, message: "Please enter the state!" }]}
            >
              <Input placeholder="State" />
            </Form.Item>
          </Col>
          <Col span="6">
            <Form.Item
              label="Pin"
              name="billingPin"
              rules={[
                { required: true, message: "Please enter the pin number!" },
                { len: 6, message: "Enter a valid pin number!" },
              ]}
            >
              <Input
                type="number"
                placeholder="Pin"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end" gutter={16}>
          <Col>
            <Form.Item>
              <Button type="primary" onClick={() => props.setFormState(0)}>
                Previous
              </Button>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Next
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
