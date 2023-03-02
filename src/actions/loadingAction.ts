export const loading = (data: boolean) => {
  return {
    type: "LOADING",
    payload: data,
  };
};
