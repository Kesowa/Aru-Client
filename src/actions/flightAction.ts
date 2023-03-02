export const setFlightDetaisToEdit = (data: any) => {
  return {
    type: "SET_FLIGHT_DETAILS_TO_EDIT",
    payload: data,
  };
};

export const updateFlight = (data: any) => {
  return {
    type: "UPDATE_FLIGHT",
    payload: data,
  };
};

export const assignPilot = (data: any) => {
  return {
    type: "ASSIGN_PILOT",
    payload: data,
  };
};
