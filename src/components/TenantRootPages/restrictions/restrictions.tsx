import React from "react";
import { Button, Result } from "antd";

function Restrictions(props) {
  //console.log(props.content);
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
