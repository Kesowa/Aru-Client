const initialState = {
  location: {},
  isEditing: false,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "EDIT_LOCATION":
      return {
        location: action.payload.location,
        isEditing: action.payload.isEditing,
      };

    default:
      return initialState;
  }
};
