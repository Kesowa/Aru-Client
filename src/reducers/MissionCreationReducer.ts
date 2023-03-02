const initialState = {
  geoFence: {
    polygon: null,
    circle: null,
  },
  flightDetails: {
    location: "",
    flightType: "",
    time: "",
    flightDuration: "",
    date: "",
    geoLocation: "",
    centerPoints: {},
  },
  flights: [],
  isEditing: false,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "SET_WEATHER":
      return {
        ...state,
        weather: action.payload,
      };
    case "SET_CIRCLE_MEASUREMENTS":
      return {
        ...state,
        geoFence: {
          polygon: null,
          circle: {
            area: action.payload.area,
            radius: action.payload.radius,
            center: action.payload.center,
          },
        },
      };

    case "SET_POLYGON_MEASUREMENTS":
      return {
        ...state,
        geoFence: {
          circle: null,
          polygon: {
            area: action.payload.area,
            length: action.payload.length,
            points: action.payload.pathPoints,
          },
        },
      };

    case "SET_FLIGHT_DETAILS":
      return {
        ...state,
        flightDetails: {
          ...action.payload,
          geoLocation: state.flightDetails.geoLocation,
          centerPoints: state.flightDetails.centerPoints,
        },
      };

    case "SET_LOCATION":
      return {
        ...state,
        flightDetails: {
          ...state.flightDetails,
          geoLocation: action.payload,
        },
      };

    case "SET_CENTER":
      return {
        ...state,
        flightDetails: {
          ...state.flightDetails,
          centerPoints: {
            lat: action.payload[0],
            lng: action.payload[1],
          },
        },
      };

    case "ADD_FLIGHT":
      const flights = [
        ...state.flights,
        {
          flightDetails: {
            ...state.flightDetails,
          },
          geoFence: {
            ...state.geoFence,
          },
        },
      ];
      return {
        ...state,
        flights: flights,
      };

    case "CLEAR_MISSION_CREATION_STATE":
      return {
        ...initialState,
        geoFence: { ...state.geoFence },
        flights: [],
      };

    case "CLEAR_MISSION_CREATION_STATE_WITH_GEOFENCE":
      return {
        ...initialState,
      };

    case "EDIT_FLIGHT":
      return {
        ...state,
        isEditing: action.payload,
      };

    case "SET_FLIGHT_DETAILS_TO_EDIT":
      console.log(action.payload);
      return {
        ...state,
        geoFence: {
          ...state.geoFence,
          polygon: action.payload.geoFence.polygon
            ? action.payload.geoFence.polygon
            : null,
          circle: action.payload.geoFence.circle
            ? action.payload.geoFence.circle
            : null,
        },
        flightDetails: {
          ...state.flightDetails,
          geoLocation: action.payload.geoLocation,
        },
      };

    default:
      return state;
  }
};
