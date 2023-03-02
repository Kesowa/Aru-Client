const initialState = {
  packageToEdit: null,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "SET_PACKAGE_TO_EDIT":
      return {
        ...state,
        packageToEdit: action.payload,
      };
    default:
      return state;
  }
};
