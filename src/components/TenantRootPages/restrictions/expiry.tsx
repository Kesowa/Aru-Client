import { Result } from "antd";

function Expiry() {
  return (
    <>
      <Result
        status="403"
        title="Tenant Expired!"
        subTitle="Please contact admin@kesowa.com to renew our services!"
      />
      ,
    </>
  );
}

export default Expiry;
