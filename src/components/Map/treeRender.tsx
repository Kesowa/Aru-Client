import { Layer as GLayer } from "./layerRender";
import { Typography } from "antd";
import { FolderOutlined, FileImageOutlined, EnvironmentOutlined, BranchesOutlined, GatewayOutlined } from "@ant-design/icons";
import moment from "moment";

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
  icon: Object,
  key: string,
  title: Object,
  groupId: string,
  group: false,
}

type LayerGroup = GLayer["layerGroupId"] & {
  key: string,
  group: true,
  groupId: string,
  icon: Object,
  title: Object,
  children: Layer[],
  groupType: 1 | 2,
};
type Child = Layer | LayerGroup;
type MissionChild = MissionLayer & {
  icon: Object,
  key: string,
  title: Object,
  group: boolean,
};

type TreeData = [
  {
    title: "Vector",
    key: "1",
    children: Child[]
  },
  {
    title: "Raster",
    key: "2",
    children: Child[]
  },
  {
    title: "Mission",
    key: "3",
    children: MissionChild[]
  }
];

function vectorIcon(type: GLayer["vector"]["type"], color: string) {
  switch (type) {
    case "Point":
      return <EnvironmentOutlined style={{ color: color }} />;
    case "MultiLineString":
      return <BranchesOutlined style={{ color: color }} />;
    case "MultiPolygon":
      return <GatewayOutlined style={{ color: color }} />;
    case "air_pollution":
      return <AirPollutionIcon color={color} />;
    case "wind_direction":
      return <WindDirectionIcon color={color} />;
  }
}

function groupLayers(
  layers: GLayer[],
  getTitleElement: (layer: GLayer) => JSX.Element,
  getGroupTitleElement: (layerGroup: GLayer["layerGroupId"]) => JSX.Element
) {
  const groupedLayers: Child[] = []
  layers.forEach(layer => {
    const cookedLayer: Layer = {
      ...layer,
      icon: layer.type == "Raster" ? <FileImageOutlined /> : vectorIcon(layer.vector.type, layer.color),
      key: layer._id,
      title: getTitleElement(layer),
      groupId: layer.layerGroupId?._id,
      group: false,
    };
    if (layer.layerGroupId?._id) {
      let layerGroup = groupedLayers.find(child => (child.group && child.groupId == layer.layerGroupId._id));
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
        })
      }
      if (layerGroup?.group && layerGroup) {
        layerGroup.children.push(cookedLayer);
      }
    } else {
      groupedLayers.push(cookedLayer);
    }
  })
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
      icon: vectorIcon("Point", "#d0021b"),
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
      icon: vectorIcon("Point", "#d0021b"),
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

function AirPollutionIcon({ color }: { color: string }) {
  return (
    <svg
      fill={color}
      version="1.1"
      id="Smoke"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="68"
      height="68"
      viewBox="64 64 896 896"
      enable-background="new 0 0 256 256"
      xmlSpace="preserve"
      style={{ padding: "0.5px" }}
    >
      <path
        d="M220.37,102.96c1.66-4.58,2.5-9.39,2.5-14.34c0-23.29-18.95-42.24-42.24-42.24c-2.36,0-4.71,0.19-7.01,0.58
	c-5.67-13.22-16.76-23.52-30.54-28.11C116.59,10.02,87.85,24.39,79,50.9c-0.06,0.16-0.11,0.33-0.17,0.49
	c-7.15,2.98-12.97,8.1-16.84,14.46C46.56,63,30.46,68.32,19.83,80.13c-8.14,9.04-12.28,20.71-11.64,32.85
	c0.63,12.14,5.96,23.31,14.99,31.45c2.91,2.62,6.09,4.83,9.5,6.6c-2.21,8.11-1.14,16.84,3.16,24.28
	c4.26,7.37,11.13,12.65,19.35,14.85c2.75,0.74,5.54,1.1,8.31,1.1c5.52,0,10.97-1.45,15.88-4.28c3.85-2.23,7.22-5.3,9.88-8.98H137
	c3.31,0,6-2.69,6-6s-2.69-6-6-6H86c-2.16,0-4.15,1.16-5.21,3.03c-1.8,3.15-4.43,5.83-7.41,7.56c-4.6,2.65-9.95,3.35-15.08,1.98
	s-9.41-4.66-12.07-9.26c-3.34-5.79-3.545-12.817-0.56-18.81c0.872-1.75,0.927-3.81,0.247-5.25c-0.68-1.45-2.097-2.55-3.597-3.09
	c-4.1-1.46-7.83-3.69-11.1-6.64c-6.66-6-10.58-14.22-11.05-23.17c-0.47-8.94,2.58-17.53,8.58-24.19c7.3-8.1,18.1-12.04,28.73-10.83
	c-0.48,2.36-0.75,4.8-0.75,7.29c0,17.5,12.31,32.05,28.93,35.33C86.54,136.94,99.99,150,117,150h45c12.17,0,22.06,9.89,22.06,22.04
	V178h12v-5.96c0-18.77-15.28-34.04-34.06-34.04h-45c-10.87,0-19.39-8.71-19.39-19.83v-3.55c0-3.23-2.55-5.88-5.77-6
	c-12.96-0.48-23.11-11.02-23.11-24c0-10.55,6.76-19.76,16.82-22.91c1.99-0.63,3.51-2.24,4.02-4.26c0.22-0.88,0.5-1.82,0.82-2.77
	c6.75-20.22,28.68-31.18,48.9-24.44c11.89,3.96,21.16,13.49,24.78,25.51c0.46,1.54,1.52,2.82,2.93,3.57
	c1.42,0.75,3.08,0.91,4.61,0.42c2.89-0.9,5.93-1.36,9.02-1.36c16.68,0,30.24,13.56,30.24,30.24c0,2.78-0.37,5.5-1.1,8.12
	c-4.54-1.79-9.49-2.77-14.7-2.77h-5.67c-5.54-14.74-21.4-23.38-37.09-19.53c-6.82,1.69-12.73,5.47-17.09,10.94
	c-2.06,2.59-1.63,6.37,0.96,8.43c2.59,2.07,6.37,1.64,8.43-0.95c2.69-3.38,6.35-5.72,10.58-6.77
	c10.48-2.57,21.132,3.852,23.67,14.35c0.921,3.81,3.328,5.53,6.2,5.53h10.01c16.22,0,28.93,13.63,28.93,31.03v41h12v-41
	C236,123,229.94,110.77,220.37,102.96z M172.044,188.062L248,188v26h-12v24h-52v-24h-12L172.044,188.062z"
      />
    </svg>
  );
};

function WindDirectionIcon({ color }: { color: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="28"
      width="28"
      viewBox="64 64 896 896"
      style={{ padding: "1.5px" }}
    >
      <path
        fill={color}
        d="M288 32c0 17.7 14.3 32 32 32h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H352c53 0 96-43 96-96s-43-96-96-96H320c-17.7 0-32 14.3-32 32zm64 352c0 17.7 14.3 32 32 32h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H384c-17.7 0-32 14.3-32 32zM128 512h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H160c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32 14.3-32 32s14.3 32 32 32z"
      />
    </svg>
  );
};

