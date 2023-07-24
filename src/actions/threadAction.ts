export const thread = (open: boolean, docData: any) => {
  return {
    type: "THREAD_DETAILS",
    open: open,
    doc: docData,
  };
};
