const initialState = {
  open: false,
  docType: "",
  docId: "",
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "THREAD_DETAILS":
      let thread = { open: action.open };
      if (action.open) {
        thread = { ...thread, ...action.doc };
      }
      return thread;
    default:
      return state;
  }
};
