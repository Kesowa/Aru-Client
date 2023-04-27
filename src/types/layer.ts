import { ISODate, ObjectId } from "./common";

export type ILayer = {
  _id: ObjectId;
  type: "Vector" | "Raster"; // index
  raster: ObjectId;
  vector: ObjectId;
  missionId: ObjectId; // index
  tenantId: ObjectId; // index
  createdBy: ObjectId;
  updatedBy: ObjectId;
  layerGroupId: ObjectId;
  captureDate: Date;
  color: string;
  layerpath: string;
  name: string;
  layerdataArr: [{}];
  //here why arent we creating an array
  center: [{}];
  minp: number;
  maxp: number;
  featureCount: number;
  layers?: ObjectId[];
  layerLabel?: string;
  isPublic: boolean; // index
  publicMapRef?: string;
  isBase: boolean;
  fileSize: number;
  flaggedFeatures: number[];
  isFlagged: boolean;
  createdAt: ISODate; // index
  updatedAt: ISODate;
};
