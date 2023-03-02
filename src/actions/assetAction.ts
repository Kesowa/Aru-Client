export const addAsset = (data: any) => {
  return {
    type: "ADD_ASSET",
    payload: data,
  };
};

export const changeAssetStatus = (data: any) => {
  return {
    type: "CHANGE_ASSET_STATUS",
    payload: {
      status: data.status,
      assetId: data.id,
    },
  };
};

export const setAssetsToState = (data: any[]) => {
  return {
    type: "SET_ASSETS_TO_STATE",
    payload: data,
  };
};

export const EditAsset = (data: any[]) => {
  return {
    type: "EDIT_ASSET",
    payload: data,
  };
};

export const deleteAsset = (data: any) => {
  return {
    type: "DELETE_ASSET",
    payload: {
      id: data,
    },
  };
};
