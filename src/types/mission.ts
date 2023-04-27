import { ISODate, ObjectId } from "./common";

export type IMission = {
  _id: ObjectId;
  deliverables: string[];
  status: "Upcoming" | "Live" | "Completed" | "Review"; // index
  user: ObjectId; // index
  pilotAssigned: string;
  assetID?: ObjectId;
  name: string;
  description: string;
  tenantId: ObjectId; // index
  clientId: ObjectId[]; // index
  missionType: ObjectId;
  invites: ObjectId[];
  createdAt: ISODate;
  updatedAt: ISODate;
  size: number;
  isPublic: boolean;
}
