import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Tabs, message, Badge } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import type { TabsProps } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import MissionTable from "./Views/List/Table";
import { AxiosErrorHandler } from "../../services/httpErrorHandle";
import http from "../../services/httpCall";
import apis from "../../services/apis";
import { connect } from "react-redux";
import { setMissionsToState } from "../../actions/missionActions";
import { logout } from "../../actions/authAction";
import "./index.less";

function MissionList(props) {
  const location = useLocation<any>();
  const [displayedMissionType, setDisplayedMissionType] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [missionTableData, setMissionTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [usedFilter, setUsedFilter] = useState("");
  const [missionCount, setMissionCount] = useState({});
  const [totalMissions, settotalMissions] = useState(0);
  const [sortOrder, setSortOrder] = useState("createdAt:descend");
  const [searchFilters, setSearchFilters] = useState("");
  const setPaginationPage = (p) => {
    setPage(p);
  };

  const setPageLimit = (currPage, limit) => {
    setPage(currPage);
    setLimit(limit);
  };

  const renderMissionTable = (filter: unknown) => {
    return (
      <MissionTable
        filter={filter}
        setMissionTableData={setMissionTableData}
        setIsTableLoading={setIsTableLoading}
        isTableLoading={isTableLoading}
        missionTableData={missionTableData}
        setPage={setPage}
        page={page}
        setLimit={setLimit}
        limit={limit}
        setPaginationPage={setPaginationPage}
        setPageLimit={setPageLimit}
        total={total}
        setTotal={setTotal}
        usedFilter={usedFilter}
        setSortOrder={setSortOrder}
        setFilters={setSearchFilters}
      />
    );
  };
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span>
          All{" "}
          <Badge style={{ backgroundColor: "#43425d" }} count={totalMissions} />
        </span>
      ),
      children: renderMissionTable("all"),
    },
    {
      key: "2",
      label: (
        <span>
          Upcoming{" "}
          <Badge
            style={{ backgroundColor: "#ffaa00" }}
            count={missionCount["Upcoming"] ? missionCount["Upcoming"] : 0}
          ></Badge>
        </span>
      ),
      children: renderMissionTable("Upcoming"),
    },
    {
      key: "3",
      label: (
        <span>
          In Progress{" "}
          <Badge
            style={{ backgroundColor: "#3D85FC" }}
            count={missionCount["Live"] ? missionCount["Live"] : 0}
          ></Badge>
        </span>
      ),
      children: renderMissionTable("Live"),
    },
    {
      key: "4",
      label: (
        <span>
          To Be Reviewed{" "}
          <Badge
            style={{ backgroundColor: "#E21717" }}
            count={missionCount["Review"] ? missionCount["Review"] : 0}
          ></Badge>
        </span>
      ),
      children: renderMissionTable("Review"),
    },
    {
      key: "5",
      label: (
        <span>
          Completed{" "}
          <Badge
            style={{ backgroundColor: "#36a556" }}
            count={missionCount["Completed"] ? missionCount["Completed"] : 0}
          />
        </span>
      ),
      children: renderMissionTable("Completed"),
    },
  ];
  const filters = {
    "1": "all",
    "2": "Upcoming",
    "3": "Live",
    "4": "Review",
    "5": "Completed",
  };

  function fetchMissions() {
    if (usedFilter.length === 0) return;
    const { userType } = props;
    const { tenantId } = props;
    setIsTableLoading(true);
    if (userType === "tenant-root" || userType === "tenant-staff") {
      http
        .get(`${apis.GET_ALL_MISSIONS_FOR_TENANT}`, {
          params: {
            id: tenantId,
            page,
            limit,
            filter: usedFilter,
            sort: sortOrder,
            searchFilters,
          },
        })
        .then((result) => {
          if (result.data.status) {
            props.setMissionsToState(result.data.data);
            setMissionTableData(result.data.data);
            setTotal(result.data.total);
            const count = {};
            let tm = 0;
            result.data.missionCount.forEach((c) => {
              count[c._id] = c.count;
              tm += Number(c.count);
            });
            setMissionCount(count);
            settotalMissions(tm);
          } else {
            message.error(result.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, props.logout);
        })
        .finally(() => {
          setIsTableLoading(false);
        });
    } else {
      return;
    }
  }

  useEffect(() => {
    const missionPage = location?.state?.missionPage;

    if (missionPage) {
      setUsedFilter(missionPage.usedFilter);
      setPage(missionPage.page);
      setLimit(missionPage.limit);

      for (const [key, value] of Object.entries(filters)) {
        if (value === missionPage.usedFilter) {
          setDisplayedMissionType(key);
        }
      }
    } else {
      setUsedFilter("all");
      setPage(1);
      setLimit(10);
      setDisplayedMissionType("1");
    }
  }, [location]);

  useEffect(() => {
    fetchMissions();
  }, [page, limit, usedFilter, sortOrder, searchFilters, props.refresh]);

  //----------------------Render create mission based on permission----------------------------------------
  function renderCreateBtn() {
    if (props.userType === "tenant-staff") {
      let permissions: any = [];
      props.userDetails.customPermissions.forEach((p) => {
        const filteredPermissions = p.permissions.filter(
          (d) => d.name === "mission_create"
        );
        permissions = [...filteredPermissions, ...permissions];
      });
      if (permissions.length > 0) {
        return (
          <Link to="/dashboard/missions/create" key="1">
            <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
              Add New Mission
            </Button>
          </Link>
        );
      }
    } else {
      return (
        <Link to="/dashboard/missions/create" key="1">
          <Button key="1" type="primary" icon={<PlusCircleOutlined />}>
            Add New Mission
          </Button>
        </Link>
      );
    }
  }

  return (
    <div className="mission-list-wrapper">
      <PageHeader
        onBack={() => window.history.back()}
        title="Request a Mission!"
        className="site-page-header-responsive"
        subTitle="Here you can create a job and monitor its progress!"
        extra={[renderCreateBtn()]}
      />

      <Tabs
        activeKey={displayedMissionType}
        onChange={(key) => {
          setDisplayedMissionType(key);
          setUsedFilter(filters[key]);
          setPage(1);
        }}
        items={items}
      />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    userType: state.Auth.userdetails.userType,
    tenantId:
      state.Auth.userdetails.tenantId._id || state.Auth.userdetails.tenantId,
    userId: state.Auth.userdetails._id,
    missions: state.Missions.missions,
    userDetails: state.Auth.userdetails,
    refresh: state.Missions.refresh,
  };
};

export default connect(mapStateToProps, {
  setMissionsToState,
  logout,
})(MissionList);
