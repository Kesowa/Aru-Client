import React from "react";
import { Row, Col, Typography } from "antd";
import apis from "../../../../services/apis";
import tenantPlaceholder from "../../../../static/tenant-placeholder.svg";
import Skeleton from "react-loading-skeleton";
import { STATIC_URL } from "src/constants";

export default function BasicInfo(props: any) {
  return (
    <Row align="middle" justify="center" className="basic-info">
      <Col span={6} className="tenant-image-wrapper">
        {props.loadingTenantDetails ? (
          <Skeleton circle={true} height={150} width={150} />
        ) : (
          <img
            alt="tenant-image"
            className="tenant-image"
            src={
              props.tenantDetails?.avatar
                ? `${STATIC_URL}/${props.tenantDetails.avatar}`
                : tenantPlaceholder
            }
          />
        )}
      </Col>
      <Col span={12} className="tenant-description-texts">
        {props.loadingTenantDetails ? (
          <Skeleton count={5} />
        ) : (
          <div>
            <Typography.Title level={2}>
              {props.tenantDetails.name}
            </Typography.Title>
            <Typography.Title
              level={4}
            >{`Contact Person : ${props.tenantDetails.contactPerson}`}</Typography.Title>
            <Typography.Title
              level={4}
            >{`Email Id : ${props.tenantDetails.email}`}</Typography.Title>
            <Typography.Title
              level={4}
            >{`Contact Number : ${props.tenantDetails.phoneNo}`}</Typography.Title>
          </div>
        )}
      </Col>
      <Col span={6} className={"tenant-deadline-wrapper"}>
        {props.loadingTenantDetails ? (
          <Skeleton circle={true} height={200} width={200} />
        ) : (
          <div
            className={
              "tenant-deadline" +
              (props.tenantDetails?.isActivated ? " activated" : " deactivated")
            }
          >
            {props.tenantDetails.isActivated ? (
              <span></span>
            ) : (
              <Typography.Title level={4}>No active package</Typography.Title>
            )}
          </div>
        )}
      </Col>
    </Row>
  );
}
