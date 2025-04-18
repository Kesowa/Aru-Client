import { useContext, useEffect, useState } from "react";
import { Row, Col, Typography } from "antd";
import tenantPlaceholder from "../../../../static/tenant-placeholder.svg";
import Skeleton from "react-loading-skeleton";
import { STATIC_URL } from "src/constants";
import http from "src/services/httpCall";
import apis from "src/services/apis";
import { AxiosErrorHandler } from "src/services/httpErrorHandle";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { AuthContext } from "src/services/authUtils";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BasicInfo(props: any) {
  const [storageLoading, setStorageLoading] = useState(true);
  const [storage, setStorage] = useState<any>({});
  const { logout } = useContext(AuthContext);
  function fetchTenantStats() {
    setStorageLoading(true);
    http
      .get(`${apis.GET_TENANT_STATS}`)
      .then((res: any) => {
        setStorage(res.data.data);
      })
      .catch((err: any) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => setStorageLoading(false));
  }
  useEffect(() => fetchTenantStats(), [props.tenantDetails]);
  function getDataFormat(size: any) {
    if (size >= 1000) {
      return "GB";
    } else {
      return "MB";
    }
  }
  const renderStorageStats = () => {
    const videos: any = storage.allVodSize;
    const alerts: any = storage.allAlertSize;
    const layers: any = storage.allLayerSize;
    const documents: any = storage.allDocumentsSize;

    const format = getDataFormat((videos + alerts + layers + documents) / 4);
    const data: any = {
      labels: [
        `Videos (${format})`,
        `Alerts (${format})`,
        `Layers (${format})`,
        `Documents (${format})`,
      ],
      datasets: [
        {
          label: "# of Size",
          data: [
            format === "GB" ? videos / 1000 : videos,
            format === "GB" ? alerts / 1000 : alerts,
            format === "GB" ? layers / 1000 : layers,
            format === "GB" ? documents / 1000 : documents,
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
    return (
        <div style={{ width: "400px" }}>
          {props.tenantDetails.isActivated ? (
            <>
              {videos === 0 &&
              alerts === 0 &&
              layers === 0 &&
              documents === 0 ? (
                <div className="tenant-deadline activated">
                  <Typography.Title level={4}>
                    No data uploaded !
                  </Typography.Title>
                </div>
              ) : (
                <Doughnut data={data} draggable={true} />
              )}
            </>
          ) : (
            <div className="tenant-deadline deactivated">
              <Typography.Title level={4}>No active package</Typography.Title>
            </div>
          )}
        </div>
    );
  };
  return (
    <Row align="middle" justify="center" className="basic-info">
      <Col span={8} className="tenant-image-wrapper">
        {props.loadingTenantDetails ? (
          <Skeleton circle={true} height={150} width={150} />
        ) : (
          <img
            alt="tenant-avatar"
            className="tenant-image"
            src={
              props.tenantDetails?.avatar
                ? `${STATIC_URL}/${props.tenantDetails.avatar}`
                : tenantPlaceholder
            }
          />
        )}
      </Col>
      <Col span={8} className="tenant-description-texts">
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
      <Col span={8} className={"tenant-deadline-wrapper"}>
        {props.loadingTenantDetails || storageLoading ? (
          <Skeleton circle={true} height={200} width={200} />
        ) : (
          <>{renderStorageStats()}</>
        )}
      </Col>
    </Row>
  );
}
