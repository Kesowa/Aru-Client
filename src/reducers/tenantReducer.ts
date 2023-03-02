const initialState = {
  tenantToEdit: null,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "SET_TENANT_TO_EDIT":
      return {
        ...state,
        tenantToEdit: action.payload,
      };
    default:
      return state;
  }
};
