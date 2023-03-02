const initialState = {
  clientToEdit: null,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "SET_CLIENT_TO_EDIT":
      return {
        ...state,
        clientToEdit: action.payload,
      };
    default:
      return state;
  }
};
