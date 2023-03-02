export const gmapLoded = (data: boolean) => {
  return {
    type: "GMAP_LOADED",
    payload: data,
  };
};

export const showDrawing = (data: boolean) => {
  return {
    type: "SHOW_DRAWING",
    payload: data,
  };
};
