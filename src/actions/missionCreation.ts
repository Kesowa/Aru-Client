export const setCircleMeasurements = (payload) => {
  return {
    type: "SET_CIRCLE_MEASUREMENTS",
    payload,
  };
};

export const setPolygonMeasurements = (payload) => {
  return {
    type: "SET_POLYGON_MEASUREMENTS",
    payload,
  };
};

export const setFlightDetails = (payload) => {
  return {
    type: "SET_FLIGHT_DETAILS",
    payload,
  };
};

export const clearMissionCreationState = () => {
  return {
    type: "CLEAR_MISSION_CREATION_STATE",
  };
};

export const setGeolocation = (address) => {
  return {
    type: "SET_LOCATION",
    payload: address,
  };
};

export const setCenterPoints = (payload) => {
  return {
    type: "SET_CENTER",
    payload,
  };
};

export const addFlight = () => {
  return {
    type: "ADD_FLIGHT",
  };
};

export const enableFlightEditing = (payload) => {
  return {
    type: "EDIT_FLIGHT",
    payload,
  };
};

export const clearMissionCreationStateWithGeoFence = () => {
  return {
    type: "CLEAR_MISSION_CREATION_STATE_WITH_GEOFENCE",
  };
};

export const setWeather = (payload) => {
  return {
    type: "SET_WEATHER",
    payload,
  };
};
