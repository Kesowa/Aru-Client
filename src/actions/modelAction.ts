export const addModel = (data: any) => {
  return {
    type: "ADD_MODEL",
    payload: data,
  };
};

export const setModelsToState = (data: any[]) => {
  return {
    type: "SET_MODELS_TO_STATE",
    payload: data,
  };
};

export const EditModel = (data: any[]) => {
  return {
    type: "EDIT_MODEL",
    payload: data,
  };
};

export const deleteModel = (data: any) => {
  return {
    type: "DELETE_MODEL",
    payload: {
      id: data,
    },
  };
};
