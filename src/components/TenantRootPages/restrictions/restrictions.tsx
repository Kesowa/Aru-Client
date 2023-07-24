import { Button, Result } from "antd";

function Restrictions(props) {
  return (
    <Result
      status="500"
      title={props.content}
      subTitle="Please contact your admin."
      extra={
        <Button type="primary" onClick={() => window.history.back()}>
          Back
        </Button>
      }
    />
  );
}

export default Restrictions;
