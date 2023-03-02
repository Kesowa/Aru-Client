const initialState = {
  missions: [],
  mission: null,
  refresh: false,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "SET_MISSIONS_TO_STATE":
      return {
        ...state,
        missions: action.payload,
        mission: null,
      };

    case "EDIT_MISSION":
      return {
        ...state,
        missions: state.missions.map((mission: any) => {
          if (mission._id === action.payload._id) {
            return {
              ...action.payload,
              flight: {
                ...mission.flight,
              },
            };
          } else {
            return mission;
          }
        }),
      };

    case "DELETE_MISSION":
      return {
        ...state,
        missions: state.missions.filter((mission: any) => {
          return mission._id !== action.payload.id;
        }),
      };

    case "UPDATE_FLIGHT":
      return {
        ...state,
        missions: state.missions.map((mission: any) => {
          if (action.payload.mission === mission._id) {
            return {
              ...mission,
              flight: action.payload,
            };
          } else {
            return mission;
          }
        }),
      };

    case "ASSIGN_PILOT":
      return {
        ...state,
        missions: state.missions.map((mission: any) => {
          if (action.payload.mission === mission._id.toString()) {
            return {
              ...mission,
              flight: {
                ...mission["flight"],
                pilotID: {
                  name: action.payload.name,
                  avatar: action.payload.avatar,
                },
              },
            };
          } else {
            return mission;
          }
        }),
      };

    case "ADD_MISSION":
      return {
        ...state,
        missions: [
          ...state.missions,
          {
            ...action.payload.mission,
            flight: {
              ...action.payload.flight,
            },
          },
        ],
      };

    case "CHANGE_MISSION_STATUS":
      return {
        ...state,
        missions: state.missions.map((mission: any) => {
          if (mission._id.toString() === action.payload.missionId) {
            return {
              ...mission,
              status: action.payload.status,
            };
          } else {
            return mission;
          }
        }),
      };

    case "REFRESH_MISSIONS":
      return {
        ...state,
        refresh: action.payload,
      };
    default:
      return state;
  }
};
