import { useState, useEffect, useContext } from "react";
import { Row, Col, Card, message, Skeleton, Button } from "antd";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { connect } from "react-redux";
import { STATIC_URL } from "src/constants";
import { AuthContext } from "src/services/authUtils";

function ChoosePackage(props: any) {
  const [packages, setPackages] = useState([undefined, undefined, undefined]);
  const { logout } = useContext(AuthContext);

  const fetchActivePackages = () => {
    http
      .get(apis.FETCH_ACTIVE_PACKAGES)
      .then((result) => {
        if (result.data.status) {
          setPackages(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      });
  };

  useEffect(() => {
    fetchActivePackages();
  }, []);

  return (
    <div className="package-selection">
      <Row gutter={[16, 16]}>
        {packages.map((ele, i) => (
          <Col key={i} span="6">
            <PackageCard
              finalSubmitTenantCreation={props.finalSubmitTenantCreation}
              package={ele}
            />
          </Col>
        ))}
      </Row>
      <Row justify="end" gutter={16}>
        <Col>
          <Button type="primary" onClick={() => props.setFormState(1)}>
            Previous
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default ChoosePackage;

const PackageCard = (props: any) => {
  return (
    <Card
      style={{ width: "90%" }}
      cover={
        props.package ? (
          <img
            alt="package-poster"
            src={`${STATIC_URL}${props.package.poster}`}
          />
        ) : null
      }
      actions={[
        <Button
          key="1"
          onClick={() => props.finalSubmitTenantCreation(props.package._id)}
          disabled={!props.package}
          style={{ width: "90%" }}
          type="primary"
        >
          Activate
        </Button>,
      ]}
    >
      {props.package ? (
        <Card.Meta
          title={props.package.name}
          description={
            <div>
              <p>Bandwidth : {props.package.bandwidth}</p>
              <p>Storage : {props.package.storage} GB</p>
              <p>Duration : {props.package.duration} days</p>
              <p>User : {props.package.userCount}</p>
            </div>
          }
        />
      ) : (
        <Skeleton loading={true} avatar active />
      )}
    </Card>
  );
};
