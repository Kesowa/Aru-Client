const initialState = {
  manufacturers: [],
  manufacturer: null,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "SET_MANUFACTURERS_TO_STATE":
      return {
        ...state,
        manufacturers: action.payload,
        manufacturer: null,
      };

    case "EDIT_MANUFACTURER":
      return {
        ...state,
        manufacturers: state.manufacturers.map((manufacturer: any) => {
          if (manufacturer._id === action.payload._id) {
            return {
              ...action.payload,
              createdBy: {
                ...manufacturer.createdBy,
              },
            };
          } else {
            return manufacturer;
          }
        }),
      };

    case "DELETE_MANUFACTURER":
      return {
        ...state,
        manufacturers: state.manufacturers.filter((manufacturer: any) => {
          return manufacturer._id !== action.payload.id;
        }),
      };

    case "ADD_MANUFACTURER":
      return {
        ...state,
        manufacturers: [
          ...state.manufacturers,
          {
            ...action.payload.manufacturer,
            createdBy: {
              ...action.payload.manufacturerInfo,
            },
          },
        ],
      };

    default:
      return state;
  }
};
