import React from "react";
import { Typography, Divider, Select, Input, TreeSelect } from "antd";
import {
  BarsOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { TbFlag, TbFlagOff } from "react-icons/tb";
import "./index.less";

const FilterToolbar = (props) => {
  const { Text } = Typography;
  const { Option } = Select;
  const { Search } = Input;
  return (
    <div className="toolbar-alerts">
      {props.onSearch ? (
        <Search
          className="search-bar"
          placeholder="input search text"
          onChange={props.onSearch}
          style={{ width: 160 }}
        />
      ) : (
        ""
      )}
      <span className="switcher">
        <AppstoreOutlined
          onClick={() => {
            props.setListView(false);
          }}
          style={{
            fontSize: "30px",
            marginRight: "10px",
            color: props.listView ? "#000000" : "#1B98F5",
          }}
        />
        <BarsOutlined
          onClick={() => {
            props.setListView(true);
          }}
          style={{
            fontSize: "30px",
            color: !props.listView ? "#000000" : "#1B98F5",
          }}
        />
      </span>
      {props.type === "Outcome" ? (
        <TreeSelect
          showSearch
          style={{ width: 140 }}
          className="filter-by"
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          placeholder="Filter By"
          allowClear
          onChange={props.onChange}
          treeData={props.FilterOptions}
          treeDefaultExpandAll
        />
      ) : (
        ""
      )}
      <div className="sort-tool">
        <div className="sort-Direction">
          {!props.loader ? (
            <div>
              <TbFlag
                onClick={() => {
                  props.setFlaggedFilter(!props.flaggedFilter);
                  if (props.unflaggedFilter) {
                    props.setUnflaggedFilter(false);
                  }
                }}
                style={{
                  color: props.flaggedFilter ? "#da1c5c" : "#000",
                  fontSize: "1rem",
                  marginRight: "0.4rem",
                }}
              />
              <TbFlagOff
                onClick={() => {
                  props.setUnflaggedFilter(!props.unflaggedFilter);
                  if (props.flaggedFilter) {
                    props.setFlaggedFilter(false);
                  }
                }}
                style={{
                  color: props.unflaggedFilter ? "#da1c5c" : "#000",
                  fontSize: "1rem",
                  marginRight: "0.4rem",
                }}
              />
              <SortAscendingOutlined
                onClick={() => props.setIsAscending(true)}
                style={{
                  color: props.isAscending ? "#1890ff" : "#000",
                  fontSize: "1.2rem",
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                  marginRight: "0.4rem",
                }}
              />
              <SortDescendingOutlined
                onClick={() => props.setIsAscending(false)}
                style={{
                  color: !props.isAscending ? "#1890ff" : "#000",
                  fontSize: "1.2rem",
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              />
            </div>
          ) : null}
        </div>
        <Text className="sort-by">Sort by</Text>
        <Select
          className="sort-select"
          style={{ width: 120 }}
          disabled={props.loader}
          defaultValue="timeStamp"
          onChange={props.handleSortChange}
        >
          <Option value="timeStamp">Timestamp</Option>
          {/* <Option value='inference'>Inference</Option> */}
        </Select>
      </div>
      <Divider style={{ margin: "16px 0" }} />
    </div>
  );
};

export default FilterToolbar;
