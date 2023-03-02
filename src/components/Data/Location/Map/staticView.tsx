import React, { useState } from "react";
import { Tag, Row, Col, Typography, Tooltip, Table, Button } from "antd";
import { Input } from "antd";
import { AudioOutlined, SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkedAlt } from "@fortawesome/free-solid-svg-icons";

interface MapParams {
  center: string;
  zoom: string;
  markerSize: string;
  markerColor: string;
  markerLocation: string;
}
function DataLocation() {}

export default DataLocation;
