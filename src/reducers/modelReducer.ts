const initialState = {
  models: [],
  model: null,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "SET_MODELS_TO_STATE":
      return {
        ...state,
        models: action.payload,
        model: null,
      };

    case "EDIT_MODEL":
      return {
        ...state,
        models: state.models.map((model: any) => {
          if (model._id === action.payload._id) {
            return {
              ...action.payload,
              modelInfo: {
                ...model.modelInfo,
              },
            };
          } else {
            return model;
          }
        }),
      };

    case "DELETE_MODEL":
      return {
        ...state,
        models: state.models.filter((model: any) => {
          return model._id !== action.payload.id;
        }),
      };

    case "ADD_MODEL":
      return {
        ...state,
        models: [
          ...state.models,
          {
            ...action.payload.model,
            modelInfo: {
              ...action.payload.modelInfo,
            },
          },
        ],
      };

    default:
      return state;
  }
};
