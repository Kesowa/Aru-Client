import React, { useState, useEffect } from "react";
import { Row, Col, Card, message, Skeleton, Button } from "antd";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { logout } from "../../../../actions/authAction";
import { loading } from "../../../../actions/loadingAction";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { STATIC_URL } from "src/constants";

function ChoosePackage(props: any) {
  const [packages, setPackages] = useState([undefined, undefined, undefined]);
  const history = useHistory();

  const fetchActivePackages = () => {
    http
      .get(apis.FETCH_ACTIVE_PACKAGES)
      .then((result) => {
        if (result.data.status) {
          //console.log(result.data.data)
          setPackages(result.data.data);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      });
  };

  const ActivatePackage = (packageId: string) => {
    console.log(packageId, props.tenantData._id);
    props.loading(true);
    http
      .post(apis.ADD_INITIAL_PACKAGE_BY_ADMIN, {
        tenantId: props.tenantData._id,
        packageId,
      })
      .then((result) => {
        if (result.data.status) {
          history.push(`/dashboard/tenant/details/${props.tenantData._id}`);
        } else {
          message.error(result.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, props.logout);
      })
      .finally(() => {
        props.loading(false);
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
            <PackageCard ActivatePackage={ActivatePackage} package={ele} />
          </Col>
        ))}
      </Row>
      {/* <Row gutter={16} justify="end">
                <Col>
                    <Button type="primary">Custom package</Button>
                </Col>
            </Row> */}
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  Theme: state.Theme,
});

export default connect(mapStateToProps, { loading, logout })(ChoosePackage);

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
          onClick={() => props.ActivatePackage(props.package._id)}
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
