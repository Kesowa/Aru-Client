export interface IPlotReportError {
  layers: string[];
  plots: {
    plotNo: number[];
    premiseNo: number[];
    buildingAvailable: number[];
    pincode: number[];
    category: number[];
    shopFloor: number[];
    buildingStatus: number[];
    blockName: number[];
    sys_id: number[];
    sanctionedBuildingNo: number[];
    infraction: number[];
    isIncentiveEligible: number[];
    isGreenTopEligible: number[];
    isSolarPlantEligible: number[];
    hasTradeLicense: number[];
    tax: number[];
    garbageCollectionInfo: number[];
    averageBuildingHeight: number[];
    averageBlockHeight: number[];
    averageIncentives: number[];
  };
  blocks: {
    blockName: number[];
    averageBlockHeight: number[];
    averageIncentives: number[];
  };
  buildings: {
    premiseNo: number[];
    height: number[];
    sys_id: number[];
    blockName: number[];
  };
}
