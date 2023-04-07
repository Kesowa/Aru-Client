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
      console.log("Thread state changed...", thread);
      return thread;
    default:
      return state;
  }
};
