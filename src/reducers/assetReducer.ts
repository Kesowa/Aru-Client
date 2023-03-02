const initialState = {
  assets: [],
  asset: null,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case "SET_ASSETS_TO_STATE":
      return {
        ...state,
        assets: action.payload,
        asset: null,
      };

    case "EDIT_ASSET":
      return {
        ...state,
        assets: state.assets.map((asset: any) => {
          if (asset._id === action.payload._id) {
            return {
              ...action.payload,
              assetInfo: {
                ...asset.assetInfo,
              },
            };
          } else {
            return asset;
          }
        }),
      };

    case "DELETE_ASSET":
      return {
        ...state,
        assets: state.assets.filter((asset: any) => {
          return asset._id !== action.payload.id;
        }),
      };

    case "ADD_ASSET":
      return {
        ...state,
        assets: [
          ...state.assets,
          {
            ...action.payload.asset,
            assetInfo: {
              ...action.payload.assetInfo,
            },
          },
        ],
      };

    case "CHANGE_ASSET_STATUS":
      return {
        ...state,
        assets: state.assets.map((asset: any) => {
          if (asset._id.toString() === action.payload.assetId) {
            return {
              ...asset,
              isActive: action.payload.isActive,
            };
          } else {
            return asset;
          }
        }),
      };
    default:
      return state;
  }
};
