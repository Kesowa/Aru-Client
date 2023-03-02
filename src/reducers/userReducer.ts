const initialState = {
  userToEdit: null,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "SET_USER_TO_EDIT":
      return {
        ...state,
        userToEdit: action.payload,
      };
    default:
      return state;
  }
};
