const initialState = {
  gmapLoaded: false,
  showDrawing: true,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "GMAP_LOADED":
      return {
        ...state,
        gmapLoaded: true,
      };

    case "SHOW_DRAWING":
      return {
        ...state,
        showDrawing: action.payload,
      };

    default:
      return state;
  }
};
