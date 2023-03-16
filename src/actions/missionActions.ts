export const addMission = (data: any) => {
  return {
    type: "ADD_MISSION",
    payload: data,
  };
};

export const changeMissionStatus = (data: any) => {
  return {
    type: "CHANGE_MISSION_STATUS",
    payload: {
      status: data.status,
      missionId: data.id,
    },
  };
};

export const setMissionsToState = (data: any[]) => {
  return {
    type: "SET_MISSIONS_TO_STATE",
    payload: data,
  };
};

export const EditMission = (data: any[]) => {
  return {
    type: "EDIT_MISSION",
    payload: data,
  };
};

export const deleteMission = (data: any) => {
  return {
    type: "DELETE_MISSION",
    payload: {
      id: data,
    },
  };
};

export const refreshMissions = (data: any) => {
  return {
    type: "REFRESH_MISSIONS",
    payload: data,
  };
};
