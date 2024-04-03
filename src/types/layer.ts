import { ISODate, ObjectId } from "./common";

export enum VectorName {
  Zone_Boundary = "Zone Boundary",
  Block_Boundary = "Block Boundary",
  Area_Boundary = "Area Boundary",
  Median = "Median",
  Electric_Pole = "Electric Pole",
  Garbage_Collection_Point = "Garbage Collection Point",
  Landmark = "Landmark",
  Solar_Area = "Solar Area",
  Metro_station = "Metro station",
  Playground = "Playground",
  Election_Ward_Boundary = "Election Ward Boundary",
  Cycle_Track = "Cycle Track",
  Powersupply_Network = "Powersupply Network",
  Manhole = "Manhole",
  Bus_Shelters = "Bus Shelters",
  Landfill = "Landfill",
  Metro_Route = "Metro Route",
  Canal = "Canal",
  Water_Body = "Waterbody",
  Bus_shelters = "Bus shelters",
  Restricted_Area = "Restricted Area",
  Cycle_Stand = "Cycle Stand",
  Roundabout = "Roundabout",
  Plot = "Plot",
  Boundary_Wall = "Boundary Wall",
  Pumping_Station = "Pumping Station",
  Over_Head_Tank = "Over Head Tank",
  Sewerage_Network = "Sewerage Network",
  Fire_Station = "Fire Station",
  Revenew_Ward_Boundary = "Revenew Ward Boundary",
  Metro_Station = "Metro Station",
  Sub_Station = "Sub Station",
  Municipal_Boundary = "Municipal Boundary",
  Cellphone_Tower = "Cellphone Tower",
  Public_Convenience = "Public Convenience",
  Sector_Boundary = "Sector Boundary",
  Right_of_Way = "Right of Way",
  Footpath = "Footpath",
  Parcel = "Parcel",
  Circle = "Circle",
  Water_Transmission_Line = "Water Transmission Line",
  Water_Treatment_Plant = "Water Treatment Plant",
  Drainage_Pumping_Station = "Drainage Pumping Station",
  Electric_Transformer = "Electric Transformer",
  Street_Light = "Street Light",
  Traffic_Square = "Traffic Square",
  Park = "Park",
  Bridge_Flyover = "Bridge/Flyover",
  Green_Verge = "Green Verge",
  Farming_Land = "Farming Land",
  Jungle = "Jungle",
  Building_Footprint = "Building Footprint",
  Panchayat_Boundary = "Panchayat Boundary",
  Slum_Boundary = "Slum Boundary",
  Measurement = "Measurement",
  Farming_land = "Farming land",
  Flyover = "Flyover",
  Parking_Area = "Parking Area",
  Solar = "Solar",
  Vacant_Plot = "Vacant Plot",
  Bridge = "Bridge",
  Carriage_Way = "Carriage Way",
  Drainage_Network = "Drainage Network",
  Road = "Road",
  Street = "Street",
  Garbage_Collection_Area = "Garbage Collection Area",
  Mobile_Drone_Port = "Mobile Drone Port",
  Potholes = "Potholes",
};

export type ILayer = {
  _id: ObjectId;
  type: "Vector" | "Raster"; // index
  raster: {
    _id: ObjectId;
    name: "ORTHO" | "DEM" | "NDVI" | "DTM" | "NDWI";
    bidx?: string;
    bandExp?: string;
    colorMap?: string;
    resamplingMethod?: string;
    createdBy: ObjectId;
    updatedBy: ObjectId;
    createdAt: ISODate;
    updatedAt: ISODate;
    overlayId?: string; // only for DEM layers
  };
  vector: {
    _id: ObjectId;
    name: VectorName;
    type: "Point" | "MultiLineString" | "MultiPolygon" | "air_pollution" | "wind_direction";
    createdBy: ObjectId;
    updatedBy: ObjectId;
    createdAt: ISODate;
    updatedAt: ISODate;
  };
  missionId: ObjectId; // index
  tenantId: ObjectId; // index
  createdBy: ObjectId;
  updatedBy: ObjectId;
  layerGroupId: {
    _id: ObjectId;
    name: string;
    layers: ObjectId[]; // index
    createdBy: ObjectId;
    tenantId: ObjectId; // index
    createdAt: Date;
    updatedAt: Date;
  };
  captureDate: ISODate;
  color: string;
  layerpath: string;
  name: string;
  layerdataArr: [{}]; // stored minp/maxp for baselayers and being used on frontend
  //here why arent we creating an array
  center: [{}];
  minp: number;
  maxp: number;
  featureCount: number;
  layers?: ObjectId[];
  layerLabel?: string;
  layerPopupLabel?: string;
  isPublic: boolean; // index
  publicMapRef?: string;
  isBase: boolean;
  fileSize: number;
  flaggedFeatures: number[];
  isFlagged: boolean;
  isThreadExist: boolean;
  commentCount: Number;
  createdAt: ISODate; // index
  updatedAt: ISODate;
};
