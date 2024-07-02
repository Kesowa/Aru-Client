import { rasterProps } from "src/static/rasterprops";
import { vectorProps, featureTypes, featureType } from "src/static/vectorprops";

export interface ILayerTypeDetails {
  layerType: "Vector" | "Raster";
  featureType: featureTypes | null;
  layerProp: vectorProps | rasterProps;
}

function getPropOptions(propNames: string[]) {
  return propNames
    .sort()
    .map((propName) => ({ title: propName, value: propName }));
}

export const options = [
  {
    value: "raster",
    title: "RASTER",
    children: getPropOptions(Object.values(rasterProps)),
    selectable: false,
  },
  {
    value: "vector",
    title: "VECTOR",
    selectable: false,
    children: [
      {
        value: "MultiLineString",
        title: "Line",
        selectable: false,
        children: getPropOptions(
          Object.values(vectorProps).filter(
            (p) => featureType[p] === featureTypes.MULTI_LINE_STRING
          )
        ),
      },
      {
        value: "MultiPolygon",
        title: "Area",
        children: getPropOptions(
          Object.values(vectorProps).filter(
            (p) => featureType[p] === featureTypes.MULTI_POLYGON
          )
        ),
        selectable: false,
      },
      {
        value: "Point",
        title: "Point",
        children: getPropOptions(
          Object.values(vectorProps).filter(
            (p) => featureType[p] === featureTypes.POINT
          )
        ),
        selectable: false,
      },
      {
        value: "Other",
        title: "Other",
        children: getPropOptions(
          Object.values(vectorProps).filter(
            (p) =>
              ![
                featureTypes.POINT,
                featureTypes.MULTI_LINE_STRING,
                featureTypes.MULTI_POLYGON,
              ].includes(featureType[p])
          )
        ),
        selectable: false,
      },
    ],
  },
];

export const getEditLayerTypeOptions = (
  defaultLayerType: ILayerTypeDetails
) => {
  // defaultLayerType stores the layerType, featureType and layerProp of selected layer
  // when editing, user should be able to change only layerProp, not the layerType or featureType
  // options need to be set accordingly

  // also, the options object stores options for tree menu, which are similar to that of cascader but with
  // the "title" field named as "label", so that needs to be mapped as well

  if (defaultLayerType?.layerType === "Raster") {
    return [{
      label: options[0].title,
      value: options[0].value,
      children: options[0].children.map(({ title, value }) => ({ label: title, value })),
    }]
  } else {
    return [{
      label: options[1].title,
      value: options[1].value,
      children: options[1].children
                  .filter(child => child.value == defaultLayerType?.featureType)
                  .map(({ title, value, children }) => ({ 
                    label: title, 
                    value, 
                    children: children.map(({ title, value }) => ({ label: title, value })), 
                  })),
    }]
  }
};
