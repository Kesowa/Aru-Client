import { Form, Input } from "antd";

function PhoneNumberChanger() {
  const [form] = Form.useForm();

  const onFinish = (data: any) => {
    console.log(data);
  };

  return (
    <div className="tenant-root-organisation-phone-changer-col">
      <Form
        layout="vertical"
        form={form}
        initialValues={{}}
        onFinish={onFinish}
        scrollToFirstError={true}
        className="phoneNumber-form"
      >
        <Form.Item
          name="phoneNo"
          rules={[
            { required: true, message: "Please enter the phone number!" },
          ]}
        >
          <Input
            placeholder="Contact Number"
            style={{ width: "100%" }}
            disabled={true}
          />
        </Form.Item>
      </Form>
    </div>
  );
}

export default PhoneNumberChanger;
