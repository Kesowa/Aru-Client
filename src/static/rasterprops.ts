export enum rasterProps {
  POINT_CLOUD = "POINT_CLOUD",
  CESIUM_3D = "CESIUM_3D",
  ORTHO = "ORTHO",
  DEM = "DEM",
  NDWI = "NDWI",
}

export const rasterSettings = {
  bidx: {
    [rasterProps.DEM]: "1",
    [rasterProps.NDWI]: "1%2C2%2C4",
  },
  colorMap: {
    [rasterProps.DEM]: "plasma",
  },
  resamplingMethod: {
    [rasterProps.DEM]: "nearest",
    [rasterProps.NDWI]: "nearest",
  },
};
