import { ISODate, ObjectId } from "./common";

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
  };
  vector: {
    _id: ObjectId;
    name: string;
    type: "Point" | "MultiLineString" | "MultiPolygon";
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
