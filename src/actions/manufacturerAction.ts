export const addManufacturer = (data: any) => {
  return {
    type: "ADD_MANUFACTURER",
    payload: data,
  };
};

export const setManufacturersToState = (data: any[]) => {
  return {
    type: "SET_MANUFACTURERS_TO_STATE",
    payload: data,
  };
};

export const EditManufacturer = (data: any[]) => {
  return {
    type: "EDIT_MANUFACTURER",
    payload: data,
  };
};

export const deleteManufacturer = (data: any) => {
  return {
    type: "DELETE_MANUFACTURER",
    payload: {
      id: data,
    },
  };
};
