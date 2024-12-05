// Changelog:
// 1. You can now upload KML as a vector file in mapping MissionLists
// 2. You can now create a new layer from geolocated images uploaded
// 3. Image sidepan rendering issue fixed

import { PUBLIC_URL } from "src/constants";

// 4. Bug fixes
const apis = {
  BASE_SERVER_URL: PUBLIC_URL,

  LOGIN: "/apis/v1/auth/login",
  GET_USER_DETAILS: "/apis/v1/auth/userdetails",
  FORGOT_PASSWORD: "/apis/v1/auth/forgot-password",
  //tenants
  UPLOAD_TENANT_AVATAR: "/apis/v1/admin/tenant/upload-avatar",
  CREATE_TENANT_ACCOUNT: "/apis/v1/admin/tenant/create",
  FETCH_ALL_TENANTS: "/apis/v1/admin/tenant/fetchall",
  ADD_INITIAL_PACKAGE_BY_ADMIN: "/apis/v1/admin/tenant/add-initial-package",
  FETCH_TENANT_DETAILS: "/apis/v1/admin/tenant/fetch-tenant-details",
  DELETE_TENANT: "/apis/v1/admin/tenant/delete-tenant",
  EDIT_TENANT_BY_ID: "/apis/v1/admin/tenant/edit-tenant",

  //Tenant Registration
  RESEND_VERIFICATION_CODE: "/apis/v1/admin/tenant/resend-verification-code",
  VERIFY_TENANT: "/apis/v1/admin/tenant/verify-tenant",
  FETCH_ACTIVE_PUBLIC_PACKAGE:
    "/apis/v1/admin/tenant/fetch-active-package-public",
  REGISTER_TENANT: "/apis/v1/admin/tenant/register-tenant",

  //package
  UPLOAD_PACKAGE_POSTER: "/apis/v1/admin/package/upload-poster",
  CREATE_PACKAGE: "/apis/v1/admin/package/create",
  FETCH_ALL_PACKAGES: "/apis/v1/admin/package/fetchall",
  FETCH_PACKAGE_BY_ID: "/apis/v1/admin/package/fetch-by-id",
  FETCH_ACTIVE_PACKAGES: "/apis/v1/admin/package/fetchactive",
  DELETE_PACKAGE: "/apis/v1/admin/package/delete-package-for-Id",
  EDIT_PACKAGE_BY_ID: "/apis/v1/admin/package/edit-package-for-Id",

  //permissions
  CREATE_PERMISSION: "/apis/v1/admin/permission/create",
  FETCH_ALL_PERMISSIONS: "/apis/v1/admin/permission/admin-permission-list",

  //common
  CHECK_IF_EMAIL_EXIST: "/apis/v1/common/check-email-available",
  TERMS_CONDITIONS_CHECK:
    "/apis/v1/tenant/user/terms-conditions-check?terms=true",

  //Tenant Organisation
  FETCH_ORGANISATION_BASIC_DETAILS:
    "/apis/v1/tenantroot/fetch-organisation-details",
  UPDATE_ORGANISATION_BASIC_DETAILS:
    "/apis/v1/tenantroot/update-organisation-details",
  REQUEST_OTP_FOR_TEANT_EMAIL_CHANGE:
    "/apis/v1/tenantroot/request-otp-for-email-change",
  RESEND_OTP_FOR_TENANT_EMAIL_CHANGE:
    "/apis/v1/tenantroot/resend-otp-for-email-change",
  VALIDATE_OTP_FOR_TENANT_EMAIL_CHANGE:
    "/apis/v1/tenantroot/validate-otp-update-email",
  GET_TENANT_STATS: "/apis/v1/admin/tenant/get-tenant-stats",

  //Tenant User Group
  FETCH_TENANT_PERMISSION_LIST:
    "/apis/v1/tenantroot/permission/tenant-permission-list",
  CREATE_TENANT_USER_GROUP: "/apis/v1/tenant/usergroup/tenant-usergroup-create",
  FETCH_TENANT_USER_GROUP: "/apis/v1/tenant/usergroup/tenant-usergroup-list",
  FETCH_TENANT_USER_GROUP_BY_ID:
    "/apis/v1/tenant/usergroup/tenant-usergroup-by-id",
  DELETE_USERGROUP: "/apis/v1/tenant/usergroup/tenant-usergroup-delete",
  EDIT_USERGROUP: "/apis/v1/tenant/usergroup/tenant-usergroup-edit",
  //USER
  UPLOAD_USER_PROFILE_PICTURE: "/apis/v1/tenant/user/upload-profile-picture",

  CREATE_TENANT_USER: "/apis/v1/tenant/user/create-tenant-user",
  FETCH_ALL_USERS_OF_TENANT: "/apis/v1/tenant/user/fetch-all-user",
  FETCH_USER_OF_TENANT_BY_ID: "/apis/v1/tenant/user/fetch-user-by-id",
  DELETE_USER: "/apis/v1/tenant/user/delete-user",
  EDIT_USER: "/apis/v1/tenant/user/edit-user",

  //MISSION
  CREATE_MISSION_TYPE_BY_ADMIN: "/apis/v1/common/missiontype/create",
  GET_ALL_MISSION_TYPES: "/apis/v1/common/missiontype/getall",
  CREATE_MISSION: "/apis/v1/mission/create",
  GET_ALL_MISSIONS_FOR_TENANT: "/apis/v1/mission/get/tenant/",
  GET_MISSION_BY_ID: "/apis/v1/mission/get/",
  EDIT_MISSION_BY_ID: "/apis/v1/mission/edit/",
  DELETE_MISSION_BY_ID: "/apis/v1/mission/delete/",
  GET_MISSION_BY_LOCATION_ID: "/apis/v1/mission/get-missions-by-locationID",
  GET_MISSION_BY_LOCATION_MAP_REF:
    "/apis/v1/mission/get-missions-by-location-mapref",
  GET_MISSION_DOC_COUNT: "/apis/v1/mission/get-mission-doc-count",
  UPDATE_MISSION_STATUS: "/apis/v1/mission/update-status",
  GET_MISSION_GEOJSON: "/apis/v1/mission",
  //Flight
  EDIT_FLIGHT_BY_ID: "/apis/v1/flight/edit/",
  FETCH_FLIGHTS_BY_MISSION_ID: "/apis/v1/flight/mission-specific-view",

  //ALERT
  UPLOAD_ALERT: "/apis/v1/alert/manual-upload-alert",
  UPLOAD_ALERT_IMAGE: "/apis/v1/alert/upload-alert-image",
  FETCH_ALL_ALERTS_BY_MISSION_ID: "/apis/v1/alert/get/",
  CREATE_ALERT: "/apis/v1/alert/create",
  DELETE_ALERT: "/apis/v1/alert/delete-multiple-alerts",
  GET_ALERT_BY_MISSION_ID_PAGINATION: "/apis/v1/alert/get-alerts-By-mission-ID",
  GET_ALL_ALERTS_BY_LOCATION_ID: "/apis/v1/alert/get-alerts-by-location-ID",
  GET_ALL_ALERTS_FOR_MISSION: "/apis/v1/alert/get-alerts-by-mission-mapref",
  FETCH_ALERTS_BY_TIME: "/apis/v1/alert/get-alert-by-location-ID-and-time",
  FETCH_ALERTS_BY_LOCATION_ID_PAGINATION:
    "/apis/v1/alert/get-alerts-By-location-id-pagination",
  FETCH_ALERT_BY_ID: "/apis/v1/alert/get-alert-by-ID",
  UPDATE_ALERT: "/apis/v1/alert/update-alert-by-ID",
  UPDATE_MULTI_ALERT: "/apis/v1/alert/update-multi-alert-by-ID",
  // add page and limit as query parameters

  // STREAMS
  FETCH_ALL_STREAM_KEYS: "/apis/v1/streamtoken/get-active-streams",
  FETCH_STREAM_KEY_BY_FLIGHT_ID:
    "/apis/v1/streamtoken/get-active-stream/flight",

  //VOD
  FETCH_VIDEOS_BY_ID: "/apis/v1/VOD/get-by-ID",
  FETCH_VIDEOS_BY_MISSION_ID: "/apis/v1/VOD/get-by-missionID",
  UPLOAD_VOD: "/apis/v1/VOD/save-vod-manual",
  DELETE_VOD: "/apis/v1/VOD/delete-by-ID",
  DELETE_MULTI_VOD: "/apis/v1/VOD/delete-multi-by-ID",
  RENAME_VOD: "/apis/v1/VOD/edit-by-ID",
  UPDATE_VOD: "/apis/v1/VOD/update-vod-by-ID",
  UPDATE_MULTI_VOD: "/apis/v1/VOD/update-multi-vod-by-ID",
  FETCH_VIDEOS_BY_LOCATION_ID: "/apis/v1/VOD/get-by-location-ID",

  //Pilot
  FETCH_ALL_PILOTS: "/apis/v1/pilot/get-all-pilots",
  ASSIGN_PILOT: "/apis/v1/flight/assign-pilot",

  //Location
  CREATE_LOCATION: "/apis/v1/location/create",
  GET_ALL_LOCATIONS: "/apis/v1/location/get",
  EDIT_LOCATION: "/apis/v1/location/update",
  DELETE_LOCATION: "/apis/v1/location/delete",
  GET_LOCATION_BY_ID: "/apis/v1/location/get-by-id",

  //AIML 
  BASE_VOD_VOILATION_INFERENCE: "/apis/v1/VOD/vod/",
  BASE_TREE_COUNT_INFERENCE:"/apis/v1/layer/",


  //ASSETS
  GET_MANUFACTURERS: "/apis/v1/manufacturer/get",
  GET_MODELS: "/apis/v1/model/get",
  CREATE_ASSET: "/apis/v1/asset/create",
  GET_ALL_ASSETS: "/apis/v1/asset/get-all-asset",
  DELETE_ASSET_BY_ID: "/apis/v1/asset/delete",
  DELETE_MANUFACTURER_BY_ID: "/apis/v1/manufacturer/delete",
  GET_MODEL_BY_ID: "/apis/v1/model/get-by-id",
  GET_MANUFACTURER_BY_ID: "/apis/v1/manufacturer/get-by-id",
  UPDATE_MODEL: "/apis/v1/model/update",
  GET_ASSET_CLASSES: "/apis/v1/assetclass/get",
  CREATE_MODEL: "/apis/v1/model/create",
  CREATE_MANUFACTURER: "/apis/v1/manufacturer/create",
  GET_ASSET_BY_ID: "/apis/v1/asset/get",
  CREATE_THERMALTABLE: "/apis/v1/data/thermal/table",
  GET_THERMALPOINT: "/apis/v1/data/thermal",

  //LAYERS
  GET_ALL_LAYERS_FOR_MISSION: "/apis/v1/layer/getbymissionId",
  CREATE_LAYER: "/apis/v1/layer/create",
  EDIT_LAYER: "/apis/v1/layer/edit-layer",
  DELETE_LAYER: "/apis/v1/layer/delete",
  DELETE_MULTIPLE_LAYERS: "/apis/v1/layer/delete-layers",
  SORT_ALL_LAYER: "/apis/v1/layer/sort-all-layer",
  FILTER_LAYER: "/apis/v1/layer/filter-layer",
  CHANGE_COLOR_BY_ID: "/apis/v1/layer/changecolorbyId",
  GET_RASTER_DETAILS_BY_ID: "/apis/v1/layer/getrasterdetailsbyID",
  GET_RASTER_PROPS: "/apis/v1/rasterProp/get-all-rasterProps",
  GET_VECTOR_PROPS: "/apis/v1/vectorProp/get",
  CREATE_VECTOR_LAYER: "/apis/v1/layer/create-vector-layer",
  ADD_FEATURE_TO_GEOJSON: "/apis/v1/layer/addFeature",
  GET_FEATURE_BY_LAYER: "/apis/v1/layer/get-feature-by-layerId",
  EDIT_GEOJSON_FEATURE: "/apis/v1/layer/edit-geojson",
  DELETE_GEOJSON_FEATURE: "/apis/v1/layer/delete-geojson",
  UPLOAD_FILE_TO_FEATURE: "/apis/v1/layer/upload-file-geojson",
  EXPORT_FEATURES: "/apis/v1/layer/get-feature-csv-by-layerIndex",
  FETCH_FEATURE_FILES: "/apis/v1/layer/get-files-by-layerId-fIndex",
  DELETE_FEATURE_FILE: "/apis/v1/layer/delete-file-geojson",
  DELETE_FEATURE_FILES: "/apis/v1/layer/delete-multipleLayerFiles",
  EDIT_FEATURE: "/apis/v1/layer/edit-geojson",
  SET_COVER_PHOTO: "/apis/v1/layer/set-cover-photo-by-layerFiles-Id",
  CREATE_GROUP_LAYER: "/apis/v1/layergroup/create",
  DELETE_LAYER_GROUP: "/apis/v1/layergroup/delete",
  EDIT_LAYER_GROUP: "/apis/v1/layergroup/edit",
  DELETE_LAYER_ID_FROM_GROUP: "/apis/v1/layergroup/delete-layerId",
  SET_LAYER_LABEL: "/apis/v1/layer/assignLayerLabel",
  PIC_TO_MAP: "/apis/v1/layer/auto-assign-uploaded-image",
  CREATE_LAYER_FROM_IMAGES: "/apis/v1/layer/pick-to-map-for-layer",
  FETCH_UNCHECKED_FILES: "/apis/v1/layer/fetch-to-be-reviwed-files",
  CONFIRM_REVIEW_IMAGES: "/apis/v1/layer/images-review",
  DOWNLOAD_ALL_LAYER_FOR_MISSION: "/apis/v1/layer/all-layers-for-mission",
  GET_PUBLIC_LAYER_BY_MISSION_ID: "/apis/v1/layer/layers-by-missionId",
  FLAG_FEATURE: "/apis/v1/layer/flag-feature",
  FLAG_LAYER: "/apis/v1/layer/flag-layer",

  // BaseLayers
  CREATE_BASELAYER: "/apis/v1/baselayer/create", // vector upload
  UPLOAD_RASTER_BASELAYER: "/apis/v1/baselayer/create-base-raster-upload",
  GET_METADATA: "/apis/v1/baselayer/get-meta-data",
  SET_PRIME_ATTR: "/apis/v1/baselayer/set-prime-attr",
  CREATE_VECTOR_BASE_BY_ATTR: "/apis/v1/baselayer/create-by-layers",
  CREATE_RASTER_BASE_BY_IMPORTING:
    "/apis/v1/baselayer/create-base-raster-import-mission",
  GET_METADATA_FOR_UPDATE: "/apis/v1/baselayer/get-meta-data-for-update",
  UPDATE_BASE_VECTOR_IMPORT: "/apis/v1/baselayer/update-by-layers",
  UPDATE_BASE_RASTER_IMPORT: "/apis/v1/baselayer/updateRasterLayerImport",
  UPDATE_BASE_RASTER_UPLOAD: "/apis/v1/baselayer/updateRasterLayerUpload",
  UPDATE_BASE_VECTOR_UPLOAD:
    "/apis/v1/baselayer/upload-to-update-base-layer/Vector",
  UPDATE_BASE_VECTOR_AFTER_UPLOAD:
    "/apis/v1/baselayer/update-base-layer-by-uploaded-layer",
  FILTER_BASE_LAYER: "/apis/v1/baselayer/filter-base-layer",
  DELETE_BASE_LAYER: "/apis/v1/baselayer/delete-baseLayer-id",
  CREATE_BASE_LAYER_FROM_DRAWING: "/apis/v1/baselayer/create-base-vector-layer",
  FETCH_PUBLIC_LAYERS: "/apis/v1/baselayer/getallpublicbaselayers",
  MAKE_LAYER_PUBLIC: "/apis/v1/baselayer/publishBaseLayer",
  PUBLIC_SEARCH: "/apis/v1/baselayer/searchPublicLayer",
  GET_ALERT_LOCATION_GEOJSON: "/apis/v1/baselayer/alerts",
  GET_VOD_LOCATION_GEOJSON: "/apis/v1/baselayer/vods",

  //documents
  UPLOAD_DOCUMENT: "/apis/v1/document/create",
  DELETE_DOCUMENT: "/apis/v1/document/delete",
  DELETE_DOCUMENT_MULTIPLE: "/apis/v1/document/delete-multiple",
  GET_DOCUMENTS: "/apis/v1/document/getbymissionId",
  GET_IMAGES: "/apis/v1/document/getImagesByMissionId",
  BULK_DOWNLOAD: "/apis/v1/document/zipbyId",
  UPDATE_DOC: "/apis/v1/document/update-doc-by-ID",
  UPDATE_MULTI_DOC: "/apis/v1/document/update-multi-docs-by-ID",
  CREATE_REPORT: "/apis/v1/report/",
  DOWNLOAD_KML: "/apis/v1/layer/download-asset-by-Id-to-kml",
  CREATE_BLOCK_REPORT: "/apis/v1/report/block",
  CREATE_PLOT_REPORT: "/apis/v1/report/plot",
  //Clients
  CREATE_CLIENT: "/apis/v1/client/create",
  GET_CLIENT_LIST: "/apis/v1/client/get-list-client",
  GET_CLIENT_BY_ID: "/apis/v1/client/get-client-by-id",
  DELETE_CLIENT: "/apis/v1/client/delete-client",
  EDIT_CLIENT: "/apis/v1/client/edit-client-details",
  GET_MISSION_FOR_CLIENT: "/apis/v1/client/get-mission-list-for-Id",
  ADD_CLIENT_TO_MISSION: "/apis/v1/client/insert-client-for-mission",
  REMOVE_CLIENT_FROM_MISSION: "/apis/v1/client/remove-client-from-mission",
  GET_MISSION_ID_CLIENT: "/apis/v1/client/get-client-mission-details/",

  //Payment
  GENERATE_ORDER: "/apis/v1/payment/generate-order",
  SAVE_ORDER: "/apis/v1/payment/complete-order",
  PAYMENT_FAILED: "/apis/v1/payment/payment-fail",
  //Base Map APIS
  GET_ALL_BASELAYERS: "/apis/v1/baselayer/fetch/All",
  GEN_SYSID_LAYER: "/apis/v1/layer/inject_sysId_layerfiles",

  //Threads
  THREAD: "/apis/v1/thread",

  //AIML
  INFER_VOD_VIOLENCE: "apis/v1/aiml/vod/:vodId/violence/infer",
  FETCH_AI_TASK: "apis/v1/aiml", //  /:docModel/:docId?infer=

  //Data
  THERMAL_DATA: "/apis/v1/data/thermal",
};

export default apis;
