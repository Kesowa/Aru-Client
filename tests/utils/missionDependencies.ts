import { Page } from "@playwright/test";
import { createAsset, deleteAsset } from "./asset";
import { createManufacturer, deleteManufacturer } from "./manufacturer";
import { createMission, completeMission, deleteMission } from "./mission";
import { createModel, deleteModel } from "./model";
import { createUser, deleteUser } from "./user";

export async function prepareMissionForTest(page: Page) {
    const locationName = "Base"; // TODO: Static value used, but we have removed functionality for location entity, flight form is yet to be updated
    // after flight form is updated, no location will be required, the center of the flight geofence will be set as the location

    // pilot creation
    const { userName: pilotName, userEmail, userGroupName, userGroupExisted } = await createUser(page, "pilot");

    // manufacturer creation
    const manufacturerName = await createManufacturer(page);
    
    // model creation
    const modelName = await createModel(page, manufacturerName);

    // asset creation
    const assetName = await createAsset(page, manufacturerName, modelName, pilotName); // re-using pilot as owner

    // mission creation
    const missionName = await createMission(page, locationName, pilotName, assetName);

    // mission completion
    await completeMission(page, missionName, pilotName);

    return { 
        locationName,
        pilotName,
        userEmail, 
        userGroupName, 
        userGroupExisted, 
        manufacturerName, 
        modelName, 
        assetName, 
        missionName, 
    };
}

export async function cleanupMissionAfterTest({
    page,
    missionName,
    assetName,
    modelName,
    manufacturerName,
    userGroupExisted,
    userEmail,
    userGroupName
} : {
    page: Page,
    missionName: string,
    assetName: string,
    modelName: string,
    manufacturerName: string,
    userGroupExisted: boolean,
    userEmail: string,
    userGroupName: string
} & {
    [key: string]: any;
}) {
    // mission deletion
    await deleteMission(page, missionName);

    // asset deletion
    await deleteAsset(page, assetName);

    // model deletion
    await deleteModel(page, modelName);

    // manufacturer deletion
    await deleteManufacturer(page, manufacturerName);
    
    // pilot deletion
    if (userGroupExisted) {
    await deleteUser(page, userEmail);
    } else {
    await deleteUser(page, userEmail, userGroupName);
    }
}