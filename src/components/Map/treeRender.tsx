import { Layer as GLayer } from "./layerRender";
import { Typography } from "antd";
import {
  FolderOutlined,
  FileImageOutlined,
  EnvironmentOutlined,
  BranchesOutlined,
  GatewayOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { featureType, featureTypes } from "src/static/vectorprops";
import { AirPollutionIcon, WindDirectionIcon } from "../shared/CustomLayerIcons";

const { Text } = Typography;

export const ILayersToTree = (
  layers: GLayer[],
  getTitleElement: (layer: GLayer) => JSX.Element,
  getGroupTitleElement: (layerGroup: GLayer["layerGroupId"]) => JSX.Element,
  renderRangePicker: () => JSX.Element,
  sortType: string,
  isAscending: boolean
): TreeData => {
  const treeData: TreeData = [
    {
      title: "Vector",
      key: "1",
      children: [],
    },
    {
      title: "Raster",
      key: "2",
      children: [],
    },
    {
      title: "Mission",
      key: "3",
      children: [],
    },
  ];

  const sortFunc = (a: Child, b: Child) => {
    if (sortType === "createdAt") {
      if (isAscending) return moment(a.createdAt).diff(moment(b.createdAt));
      else return moment(b.createdAt).diff(moment(a.createdAt));
    } else {
      // sortType is "name"
      if (isAscending) return a.name.localeCompare(b.name);
      else return b.name.localeCompare(a.name);
    }
  };

  treeData[0].children = groupLayers(
    layers.filter((layer) => layer.type === "Vector"),
    getTitleElement,
    getGroupTitleElement
  ).sort(sortFunc);
  treeData[1].children = groupLayers(
    layers.filter((layer) => layer.type === "Raster"),
    getTitleElement,
    getGroupTitleElement
  ).sort(sortFunc);
  treeData[2].children = missionLayersMenu(renderRangePicker);

  return treeData;
};

// function titleElement(title: string, onClick: MenuClickEventHandler) {
//   return (
//     <Dropdown menu={{
//       items: [
//         {
//           key: "1",
//           label: "Rename",
//         },
//         {
//           key: "2",
//           label: "Delete",
//         },
//       ],
//       onClick,
//     }} trigger={["contextMenu"]}>
//       <Text style={{ width: "160px" }} ellipsis={true}>
//         {title}
//       </Text>
//     </Dropdown>
//   )
// }

type Layer = GLayer & {
  icon: Object;
  key: string;
  title: Object;
  groupId: string;
  group: false;
};

type LayerGroup = GLayer["layerGroupId"] & {
  key: string;
  group: true;
  groupId: string;
  icon: Object;
  title: Object;
  children: Layer[];
  groupType: 1 | 2;
};
type Child = Layer | LayerGroup;
type MissionChild = MissionLayer & {
  icon: Object;
  key: string;
  title: Object;
  group: boolean;
};

type TreeData = [
  {
    title: "Vector";
    key: "1";
    children: Child[];
  },
  {
    title: "Raster";
    key: "2";
    children: Child[];
  },
  {
    title: "Mission";
    key: "3";
    children: MissionChild[];
  }
];

function vectorIcon(type: featureTypes, color: string) {
  switch (type) {
    case featureTypes.POINT:
      return <EnvironmentOutlined style={{ color: color }} />;
    case featureTypes.MULTI_LINE_STRING:
      return <BranchesOutlined style={{ color: color }} />;
    case featureTypes.MULTI_POLYGON:
      return <GatewayOutlined style={{ color: color }} />;
    case featureTypes.AIR_POLLUTION:
      return <AirPollutionIcon color={color} />;
    case featureTypes.WIND_DIRECTION:
      return <WindDirectionIcon color={color} />;
  }
}

function groupLayers(
  layers: GLayer[],
  getTitleElement: (layer: GLayer) => JSX.Element,
  getGroupTitleElement: (layerGroup: GLayer["layerGroupId"]) => JSX.Element
) {
  const groupedLayers: Child[] = [];
  layers.forEach((layer) => {
    const cookedLayer: Layer = {
      ...layer,
      icon:
        layer.type == "Raster" ? (
          <FileImageOutlined />
        ) : (
          vectorIcon(featureType[layer.vector], layer.color)
        ),
      key: layer._id,
      title: getTitleElement(layer),
      groupId: layer.layerGroupId?._id,
      group: false,
    };
    if (layer.layerGroupId?._id) {
      const layerGroup = groupedLayers.find(
        (child) => child.group && child.groupId == layer.layerGroupId._id
      );
      if (layerGroup == undefined) {
        groupedLayers.push({
          ...layer.layerGroupId,
          key: layer.layerGroupId._id,
          group: true,
          groupId: layer.layerGroupId._id,
          icon: <FolderOutlined />,
          title: getGroupTitleElement(layer.layerGroupId),
          children: [cookedLayer],
          groupType: layer.type == "Vector" ? 1 : 2,
        });
      }
      if (layerGroup?.group && layerGroup) {
        layerGroup.children.push(cookedLayer);
      }
    } else {
      groupedLayers.push(cookedLayer);
    }
  });
  return groupedLayers;
}

function missionLayersMenu(renderRangePicker: () => JSX.Element) {
  return [
    {
      title: renderRangePicker(),
      key: "dateRangePicker",
      checkable: false,
    },
    {
      name: "Alert",
      id: "alert",
      icon: vectorIcon(featureTypes.POINT, "#d0021b"),
      key: "alert",
      // title: titleElement("Alert", () => {}),
      title: (
        <Text style={{ width: "160px" }} ellipsis={true}>
          Alert
        </Text>
      ),
      group: false,
    },
    {
      name: "VOD",
      id: "vod",
      icon: vectorIcon(featureTypes.POINT, "#d0021b"),
      key: "vod",
      // title: titleElement("VOD", () => {}),
      title: (
        <Text style={{ width: "160px" }} ellipsis={true}>
          VOD
        </Text>
      ),
      group: false,
    },
  ];
}