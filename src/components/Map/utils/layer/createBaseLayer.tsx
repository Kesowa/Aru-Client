import { ImportLayerSteps } from "./importLayerSteps";
import { UploadRasterData, UpdateRasterData } from "./rasterLayerSteps";
import {
  UploadVectorData,
  UpdateVectorData,
  AttrSelection,
  AttrMapping,
  LayerCreated,
  LayerUpdated,
} from "./vectorLayerSteps";
import React, { useState, useEffect, useContext } from "react";
import { v4 as uuid } from "uuid";
import {
  Modal,
  Steps,
  Button,
  message,
  Result,
  Upload,
  Row,
  Col,
  Form,
  Avatar,
  Card,
  Typography,
  Select,
  Collapse,
} from "antd";
import apis from "../../../../services/apis";
import http from "../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../services/httpErrorHandle";
import { UploadOutlined, ImportOutlined } from "@ant-design/icons";
import "../../index.less";
import MarkerIcon from "../../../../static/MarkerIcon.png";
import TankIcon from "../../../../static/TankIcon.png";
import ValveIcon from "../../../../static/ValveIcon.png";
import DotIcon from "../../../../static/DotIcon.png";
import { components } from "src/handlers/schema";
import { featureType, vectorProps } from "src/static/vectorprops";
import { rasterProps } from "src/static/rasterprops";
import { AuthContext } from "src/services/authUtils";
const { Dragger } = Upload;
const { Item } = Form;
const { Meta } = Card;
const { Option } = Select;
const { Text, Title } = Typography;
const { Panel } = Collapse;

const CreateBaseLayer = (props) => {
  const [selectedKey, setSelectedKey] = useState<unknown>();
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [current1, setCurrent1] = useState(0);
  const [current2, setCurrent2] = useState(0);
  const [missionOptions, setMissionOptions] = useState<unknown>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [missionSearchValue, setMissionSearchValue] = useState("");
  const [layerOptions, setLayerOptions] = useState<unknown>([]);
  const [layersLoading, setLayersLoading] = useState(false);
  const [selectedMissions, setSelectedMissions] = useState<unknown>([]);
  const [selectedLayers, setSelectedLayers] = useState<unknown>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [layerName, setLayerName] = useState("");
  const [captureDate, setCaptureDate] = useState("");
  const [layerColor, setLayerColor] = useState("");
  const [layerType, setLayerType] = useState("");
  const [layerProp, setLayerProp] = useState<vectorProps | rasterProps | null>(
    null
  );
  const [fileList, setFileList] = useState<unknown>([]);
  const [showColorPicker, setShowColorPicker] = useState(true);
  const [inheritColor, setInheritColor] = useState(false);
  const [tableData, setTableData] = useState<unknown>([]);
  const [primeAttributes, setPrimeAttributes] = useState<unknown>([]);
  const [fields, setFields] = useState([]);
  const [layerPath, setLayerPath] = useState("");
  const [responseArray, setResponseArray] = useState<unknown>([]);
  const [vectorPath, setVectorPath] = useState("");
  const [metadata, setMetadata] = useState<unknown>([]);
  const [showAddMissions, setShowAddMissions] = useState(false);
  const [layerType1, setLayerType1] = useState("");
  const [currentLayerId, setCurrentLayerId] = useState("");
  const [fetchList, setFetch] = useState(false);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [uiElement, setUIElement] = useState<unknown>([]);
  const [allowApiCall, setApiCall] = useState(true);
  const [storageModal, setStorageModal] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState({});
  const [activeTab, setActiveTab] = useState<unknown>([]);
  const [icon, setIcon] = useState<unknown>("MarkerIcon");

  const { logout } = useContext(AuthContext);

  const iconOptions = [
    {
      value: "MarkerIcon",
      title: "Marker Icon",
      icon: <img src={MarkerIcon} style={{ width: "10px" }} />,
    },
    {
      value: "TankIcon",
      title: "Tank Icon",
      icon: <img src={TankIcon} style={{ width: "10px" }} />,
    },
    {
      value: "ValveIcon",
      title: "Valve Icon",
      icon: <img src={ValveIcon} style={{ width: "10px" }} />,
    },
    {
      value: "DotIcon",
      title: "Dot Icon",
      icon: <img src={DotIcon} style={{ width: "10px" }} />,
    },
  ];
  useEffect(
    () => console.log("Prime attributes", primeAttributes),
    [primeAttributes]
  );

  useEffect(() => {
    if (selectedLayers.length > 0) {
      const layertype = new Set();
      const layertype1 = new Set();
      const layertype2 = new Set();
      selectedLayers.map((item) => {
        layerOptions.map((layer) => {
          if (layer._id == item) {
            layertype.add(layer.type);
            if (layer.type == "Vector")
              layertype1.add(featureType[layer.vector]);
            else layertype2.add(layer.raster);
          }
        });
      });

      console.log(layertype, layertype1, layertype2);

      if (layertype.size == 2) {
        message.warning("Cannot merge a raster and vector!");
        setApiCall(false);
      }

      if (layertype1.size > 1) {
        message.warning(
          "Cannot merge vector layers of different geometric types! "
        );
        setApiCall(false);
      }

      if (layertype2.size > 1) {
        message.warning("Cannot merge raster layers of different type!");
        setApiCall(false);
      }

      if (layertype.has("Raster")) setLayerType1("Raster");
      else if (layertype.has("Vector")) setLayerType1("Vector");
    }
  }, [selectedLayers]);

  useEffect(() => {
    //need to check this value and trigger
    console.log("layerType1", layerType1, allowApiCall);
  }, [layerType1, allowApiCall]);

  const onScroll = (event) => {
    const target = event.target;
    if (
      !missionsLoading &&
      target.scrollTop + target.offsetHeight === target.scrollHeight
    ) {
      target.scrollTo(0, target.scrollHeight);
      setPage(page + 1);
      setFetch(true);
    }
  };

  const handleSearch = (e) => {
    setMissionOptions([]);
    setMissionSearchValue(e);
    setFetch(true);
  };

  // -------Populate mission list----------------
  useEffect(() => {
    if (isModalVisible2) {
      if (fetchList) {
        if (missionSearchValue) {
          setPage(1);
          setMissionsLoading(true);
          console.log("searching");
          console.log("page", page);
          http
            .get(
              `${apis.GET_ALL_MISSIONS_FOR_TENANT}?page=${page}&limit=10&filter=Completed&sort=createdAt:descend&searchFilters=name:${missionSearchValue}`
            )
            .then((res) => {
              console.log(res.data.data);
              const missions: unknown = [...missionOptions];
              res.data.data.map((i: unknown) => {
                missions.push(i);
              });
              console.log(missions);
              setMissionOptions(missions);
            })
            .catch((err) => {
              console.log(err);
              AxiosErrorHandler(err, logout);
            })
            .finally(() => {
              setMissionsLoading(false);
              setFetch(false);
            });
        } else {
          setMissionsLoading(true);
          console.log("not searching");
          console.log("page", page);
          http
            .get(
              `${apis.GET_ALL_MISSIONS_FOR_TENANT}?page=${page}&limit=10&filter=Completed&sort=createdAt:descend&searchFilters=name:${missionSearchValue}`
            )
            .then((res) => {
              const missions: unknown = [...missionOptions];
              res.data.data.map((i: unknown) => {
                missions.push(i);
              });
              setMissionOptions(missions);
            })
            .catch((err) => {
              console.log(err);
              AxiosErrorHandler(err, logout);
            })
            .finally(() => {
              setMissionsLoading(false);
              setFetch(false);
            });
        }
      }
    }
  }, [isModalVisible2, missionSearchValue, fetchList]);

  useEffect(() => console.log(missionOptions), [missionOptions]);

  useEffect(() => {
    if (selectedMissions.length > 0) {
      setLayersLoading(true);
      http
        .get(
          `${apis.GET_ALL_LAYERS_FOR_MISSION}?missionId=${selectedMissions[0]}`
        )
        .then((res) => {
          console.log(res);
          if (props.isUpdate) {
            const filtered: unknown = res.data.data.layers.filter(
              (i: unknown) => i.type == props.updateType
            );
            setLayerOptions(filtered);
          } else {
            setLayerOptions(res.data.data.layers);
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => setLayersLoading(false));
    }
  }, [selectedMissions]);

  // FILETYPES TO VALIDATE
  const fileTypesUpdateVector = ["geojson", "kml", "shp", "zip"];
  const fileTypeUpdateRaster = ["tif", "dem"];

  // FOR UPDATING/CREATING BASE LAYER VIA UPLOAD - BOTH RASTER AND VECTOR
  const createUpdateBaseLayerUpload = async () => {
    // FORM VALIDATIONS FIRST
    if (!fileList.length) {
      message.error("Please select file to upload");
      return;
    }

    if (!props.isUpdate) {
      if (!layerType || !layerProp || !captureDate || !layerName) {
        message.error("Please fill all the required field");
        return;
      }
    }

    const file = fileList[0];
    const ext = file.name.split(".").pop();

    // FILE VALIDATIONS
    if (props.isUpdate) {
      if (props.updateType == "Vector") {
        if (!fileTypesUpdateVector.includes(ext)) {
          message.error("Please select the geojson file");
          return;
        }
      } else {
        if (!fileTypeUpdateRaster.includes(ext)) {
          message.error("Please select a tif file");
          return;
        }
      }
    } else {
      if (layerType == "Raster") {
        if (!fileTypeUpdateRaster.includes(ext)) {
          message.error("Please select a tif file for raster layer!");
          return;
        }
      } else {
        if (!fileTypesUpdateVector.includes(ext)) {
          message.error("Please select a tif file for raster layer!");
          return;
        }
      }
    }

    try {
      setUploading(true);
      if (props.isUpdate) {
        if (props.updateType == "Raster") {
          // UPDATE RASTER BY FILE UPLOAD
          console.log("here");
          const fmData = new FormData();
          const config = {
            headers: { "content-type": "multipart/form-data" },
            onUploadProgress: (event) => {
              const percent = Math.floor((event.loaded / event.total) * 100);
              setProgress(percent);
              if (percent === 100) {
                setTimeout(() => setProgress(0), 1000);
              }
            },
          };
          fmData.append("file", fileList[0]);
          fmData.append("layerId", props.BaseLayerId);
          const result = await http.patch(
            `${apis.UPDATE_BASE_RASTER_UPLOAD}/Raster`,
            fmData,
            config
          );

          if (result.data.status) {
            console.log("update by file", result.data);
            //message.success("Layer updated successfully!");
            props.updateLayer(result.data.data, null, null);
            setCurrent1(1);
          } else {
            message.error(result.data.message);
          }
        } else {
          // UPDATE VECTOR BY FILE UPLOAD
          console.log("inside vector update by upload");
          const fmData = new FormData();
          const config = {
            headers: { "content-type": "multipart/form-data" },
            onUploadProgress: (event) => {
              const percent = Math.floor((event.loaded / event.total) * 100);
              setProgress(percent);
              if (percent === 100) {
                setTimeout(() => setProgress(0), 1000);
              }
            },
          };
          fmData.append("file", fileList[0]);
          fmData.append("baseLayer", props.BaseLayerId);
          const result = await http.post(
            `${apis.UPDATE_BASE_VECTOR_UPLOAD}`,
            fmData,
            config
          );
          if (result.data.success) {
            console.log("update by file", result.data);
            setPrimeAttributes(
              result.data.data.primeAttributes.filter(
                (i: unknown) => i !== "color" && i !== "icon" && i !== "sys_id"
              )
            );
            setFields(result.data.data.layerAttributes);
            setLayerPath(result.data.data.filePath);
            setCurrent1(1);
          } else {
            console.log(result.data);
            message.error(result.data.message);
          }
        }
      } else {
        // CREATE BASE LAYER BY UPLOAD
        const fmData = new FormData();
        const config = {
          headers: { "content-type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const percent = Math.floor((event.loaded / event.total) * 100);
            setProgress(percent);
            if (percent === 100) {
              setTimeout(() => setProgress(0), 1000);
            }
          },
        };
        fmData.append("file", fileList[0]);
        fmData.append("captureDate", captureDate);
        fmData.append("name", layerName);
        console.log(layerType);
        fmData.append("type", layerType);
        console.log(
          "Before call",
          fmData.get("name"),
          fmData.get("type"),
          fmData.get("captureDate"),
          fmData.get("file")
        );
        fmData.append("icon", icon);

        if (layerType === "Vector") {
          // CREATE BASE LAYER BY VECTOR UPLOAD
          fmData.append("color", layerColor);
          fmData.append(
            "inHeritOriginalColorFromFile",
            inheritColor.toString()
          );
          fmData.append("vector", String(layerProp));
          console.log(
            "Before call",
            fmData.get("name"),
            fmData.get("type"),
            fmData.get("captureDate"),
            fmData.get("file"),
            fmData.get("color"),
            fmData.get("vector")
          );

          const result = await http.post(
            `${apis.CREATE_BASELAYER}/Vector`,
            fmData,
            config
          );

          if (result.data.status) {
            console.log(result.data);
            message.success("Vector Base Layer Created!");
            const data: unknown = [];
            let c = 0;
            setVectorPath(result.data.data.layer.layerpath);
            setCurrentLayerId(result.data.data.layer._id);
            for (const [key, value] of Object.entries(
              result.data.data.properties
            )) {
              if (key !== "sys_id" && key !== "icon" && key !== "color") {
                data.push({
                  attribute: key,
                  key: ++c,
                });
              }
            }
            console.log(data);
            setTableData(data);
            setCurrent1(1);
          } else {
            message.error(result.data.message);
          }
        }

        if (layerType === "Raster") {
          // CREATE BASE LAYER BY RASTER UPLOAD
          fmData.append("raster", String(layerProp));

          const result = await http.post(
            `${apis.UPLOAD_RASTER_BASELAYER}/Raster`,
            fmData,
            config
          );

          if (result.data.status) {
            console.log(result.data);
            message.success("Raster Base Layer Created!");
            props.addLayer(result.data.data);
            setCurrent1(1);
          } else {
            message.error(result.data.message);
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setIsModalVisible1(false);
        if (
          err.response?.data.message ===
          "Actual storage exceeded the Limit of Set storage!"
        ) {
          setStorageModal(true);
        } else {
          message.error(err.response?.data.message);
          console.log(err.response);
        }
      } else console.log(err);
    } finally {
      setUploading(false);
      setFileList([]);
      setCaptureDate("");
      setLayerName("");
      setLayerProp(null);
      form.resetFields();
    }
  };

  const getMetadataForBaseLayer = (layers) => {
    if (selectedLayers.length > 0) {
      setUploading(true);
      console.log(layers);
      let payload: unknown = {};
      if (props.isUpdate) {
        payload = {
          layers: layers,
          baseLayer: props.BaseLayerId,
        };
      } else {
        payload = {
          layers: layers,
        };
      }
      http
        .patch<
          components["schemas"]["GetMetaDataBaseLayerResponse"],
          components["schemas"]["GetMetaDataUpdateResponse"]
        >(
          !props.isUpdate
            ? `${apis.GET_METADATA}`
            : `${apis.GET_METADATA_FOR_UPDATE}`,
          payload
        )
        .then((res) => {
          console.log("--------------------", res);
          if (res.data.success == false) message.error(res.data.message);
          else {
            if (!props.isUpdate) {
              const attrset: unknown = [];
              res.data.data.map((mission) => {
                mission.layers.map((layer) => {
                  layer.fields.map((field) => {
                    let obj: unknown = {};
                    switch (field.layerMatches) {
                      case "Matches With All":
                        obj = {
                          key: field.key,
                          match: "Present in all layers",
                        };
                        break;
                      case "No Other Mathces":
                        obj = {
                          key: field.key,
                          match: "Not present in all layers",
                        };
                        break;
                      default:
                    }
                    attrset.push(obj);
                  });
                });
              });
              console.log("attribute set", attrset);
              const data: unknown = [];
              let c = 0;
              attrset.map((i: unknown) => {
                if (
                  i.key !== "sys_id" &&
                  i.key !== "icon" &&
                  i.key !== "color"
                ) {
                  data.push({
                    attribute: i.key,
                    key: ++c,
                    occurs: i.match,
                  });
                }
              });
              console.log(data);
              setTableData(data);
              setMetadata(res.data.data);
              setCurrent2(1);
            } else {
              const attrArray: unknown = [];
              console.log("in here...");
              setMetadata(res.data.data.layerAttr);
              res.data.data.pAttr.map((value: unknown, i) => {
                let obj: unknown = {};
                if (
                  value !== "color" &&
                  value !== "icon" &&
                  value !== "sys_id"
                ) {
                  obj = {
                    attribute: value,
                    key: i,
                    occurs: "placeholder text here",
                  };
                  attrArray.push(obj);
                }
              });
              setPrimeAttributes(attrArray);
              setCurrent2(1);
            }
          }
        })
        .catch((err) => {
          console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setUploading(false);
          setMissionOptions([]);
          setSelectedLayers([]);
          setUIElement([]);
        });
    } else
      void message.warning(
        "Please choose at least 1 layer in order to proceed!"
      );
  };

  useEffect(() => console.log("id", currentLayerId), [currentLayerId]);

  const setPrimeAttr = () => {
    const data: unknown = [];
    primeAttributes.map((attr) => {
      data.push(String(attr["attribute"]));
    });
    const body = {
      path: vectorPath,
      pattr: data,
      id: currentLayerId,
    };
    console.log("Prime attribute body: ", body);
    setUploading(true);
    http
      .put(`${apis.SET_PRIME_ATTR}`, body)
      .then((res) => {
        console.log(res);
        if (res.data.success) {
          console.log(res.data);
          void message.success(res.data.message);
          setCurrent1(2);
          props.addLayer(res.data.data);
        } else void message.error(res.data.message);
      })
      .catch((err) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => setUploading(false));
  };

  const createVectorBaseByAttr = () => {
    setUploading(true);
    let body: unknown = {};
    if (props.isUpdate) {
      body = {
        baseLayer: props.BaseLayerId,
        layers: responseArray,
      };
      http
        .patch(`${apis.UPDATE_BASE_VECTOR_IMPORT}`, body)
        .then((res) => {
          console.log("import update vector res", res);
          void message.success("Layer was successfully update!");
          props.updateLayer(res.data.data, null, null);
        })
        .catch((err) => {
          if (err.response?.status === 403) {
            setIsModalVisible1(false);
            setIsModalVisible2(false);
            if (
              err.response?.data.message ===
              "Actual storage exceeded the Limit of Set storage!"
            ) {
              setStorageModal(true);
            } else {
              message.error(err.response?.data.message);
              console.log(err.response);
            }
          } else console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setLayerName("");
          setCaptureDate("");
          setSelectedLayers([]);
          setLayerColor("");
          setLayerType("");
          setLayerProp(null);
          setShowAddMissions(false);
          setMissionOptions([]);
          setUIElement([]);
          setCurrent2(2);
          setResponseArray([]);
          setLayerType1("");
          setUploading(false);
          form.resetFields();
        });
    } else {
      body = {
        name: layerName,
        vectorType: layerProp,
        color: layerColor,
        pattr: primeAttributes,
        layers: responseArray,
      };
      http
        .post(`${apis.CREATE_VECTOR_BASE_BY_ATTR}`, body)
        .then((res) => {
          console.log(res);
          props.addLayer(res.data.data);
          message.success("Layer was successfully created!");
        })
        .catch((err) => {
          if (err.response?.status === 403) {
            setIsModalVisible1(false);
            setIsModalVisible2(false);
            if (
              err.response?.data.message ===
              "Actual storage exceeded the Limit of Set storage!"
            ) {
              setStorageModal(true);
            } else {
              message.error(err.response?.data.message);
              console.log(err.response);
            }
          } else console.log(err);
          AxiosErrorHandler(err, logout);
        })
        .finally(() => {
          setLayerName("");
          setCaptureDate("");
          setSelectedLayers([]);
          setLayerColor("");
          setLayerType("");
          setLayerProp(null);
          setShowAddMissions(false);
          setMissionOptions([]);
          setUIElement([]);
          setCurrent2(0);
          setResponseArray([]);
          setLayerType1("");
          setUploading(false);
          setIsModalVisible2(false);
          form.resetFields();
        });
    }
  };

  const updateRasterBaseByImporting = () => {
    setUploading(true);
    const fmData = new FormData();
    let payload: unknown = {};
    if (props.isUpdate) {
      payload = {
        layerId: props.BaseLayerId,
        layers: selectedLayers,
      };
    }
    http
      .patch(`${apis.UPDATE_BASE_RASTER_IMPORT}`, payload)
      .then((res: unknown) => {
        if (res.data.status) {
          console.log("update by import", res.data.data);
          props.updateLayer(res.data.data, null, null);
        } else {
          console.log(res.data);
          message.warning(res.data.message);
        }
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setIsModalVisible1(false);
          setIsModalVisible2(false);
          if (
            err.response?.data.message ===
            "Actual storage exceeded the Limit of Set storage!"
          ) {
            setStorageModal(true);
          } else {
            message.error(err.response?.data.message);
            console.log(err.response);
          }
        } else console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLayerName("");
        setCaptureDate("");
        setSelectedLayers([]);
        setShowAddMissions(false);
        setMissionOptions([]);
        setUIElement([]);
        setCurrent2(2);
        setResponseArray([]);
        setUploading(false);
        form.resetFields();
      });
  };

  const createRasterBaseByImporting = () => {
    setUploading(true);
    const body = {
      layers: selectedLayers,
      name: layerName,
      captureDate: captureDate,
    };
    http
      .post(`${apis.CREATE_RASTER_BASE_BY_IMPORTING}`, body)
      .then((res) => {
        if (res.data.status) {
          console.log(res);
          props.addLayer(res.data.data);
          message.success("Layer created successfully!");
        } else {
          console.log(res.data);
          message.warning(res.data.message);
        }
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setIsModalVisible1(false);
          setIsModalVisible2(false);
          if (
            err.response?.data.message ===
            "Actual storage exceeded the Limit of Set storage!"
          ) {
            setStorageModal(true);
          } else {
            message.error(err.response?.data.message);
            console.log(err.response);
          }
        } else console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setLayerName("");
        setCaptureDate("");
        setSelectedLayers([]);
        setShowAddMissions(false);
        setMissionOptions([]);
        setUIElement([]);
        setCurrent2(0);
        setResponseArray([]);
        setLayerType1("");
        setUploading(false);
        setIsModalVisible2(false);
        form.resetFields();
      });
  };

  useEffect(() => {
    console.log(uiElement);
  }, [uiElement]);

  const addMore = () => {
    const array: unknown = [...uiElement];
    array.push(uuid());
    setUIElement(array);
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    onRemove: (file) => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      console.log(file);
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const changeLayerType = (value: string) => {
    if (Object.values(vectorProps).includes(value as vectorProps)) {
      setShowColorPicker(true);
      setLayerType("Vector");
      setLayerProp(value as vectorProps);
    } else if (Object.values(rasterProps).includes(value as rasterProps)) {
      setShowColorPicker(false);
      setLayerType("Raster");
      setLayerProp(value as rasterProps);
    }
  };

  function onChangeInherit(checked) {
    if (checked) {
      setInheritColor(true);
      setShowColorPicker(false);
    } else {
      setInheritColor(false);
      setShowColorPicker(true);
    }
  }

  function renderFooterButtons() {
    if (isModalVisible1) {
      if (layerType == "Raster" || props.updateType == "Raster") {
        switch (current1) {
          case 0:
            return (
              <>
                {!uploading ? (
                  <Button
                    type={"primary"}
                    onClick={() => createUpdateBaseLayerUpload()}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type={"primary"} loading>
                    Uploading...
                  </Button>
                )}
              </>
            );
          case 1:
            return (
              <>
                <Button
                  onClick={() => {
                    setIsModalVisible1(false);
                    setFileList([]);
                    setCaptureDate("");
                    setLayerName("");
                    setLayerType("");
                    setLayerProp(null);
                    setCurrent1(0);
                  }}
                >
                  Close
                </Button>
              </>
            );

          default:
            return <></>;
        }
      } else {
        switch (current1) {
          case 0:
            return (
              <>
                {!uploading ? (
                  <Button
                    type={"primary"}
                    onClick={() => createUpdateBaseLayerUpload()}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type={"primary"} loading>
                    Uploading...
                  </Button>
                )}
              </>
            );
          case 1:
            return (
              <>
                {!uploading ? (
                  <Button
                    type={"primary"}
                    onClick={() => {
                      if (props.isUpdate) {
                        if (responseArray.length > 0) {
                          updateBaseLayerAfterUploadedFile();
                        } else
                          message.warning(
                            "Please map atleast one field in order to continue!"
                          );
                      } else setPrimeAttr();
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type={"primary"} loading>
                    {props.isUpdate ? "Updating..." : "Applying..."}
                  </Button>
                )}
              </>
            );
          case 2:
            return (
              <>
                <Button
                  onClick={() => {
                    setIsModalVisible1(false);
                    setFileList([]);
                    setCaptureDate("");
                    setLayerName("");
                    setLayerType("");
                    setLayerProp(null);
                    setCurrent1(0);
                  }}
                >
                  Close
                </Button>
              </>
            );

          default:
            return <></>;
        }
      }
    }

    if (isModalVisible2) {
      switch (current2) {
        case 0:
          return (
            <>
              {!uploading ? (
                <Button
                  type={"primary"}
                  onClick={() => {
                    if (selectedLayers.length > 0) {
                      if (layerType1 == "Vector") {
                        if (allowApiCall) {
                          getMetadataForBaseLayer(selectedLayers);
                        } else
                          message.warning(
                            "Selected layer's types are incompatible. Please clear selection and try again!"
                          );
                      } else if (layerType1 == "Raster") {
                        if (allowApiCall) {
                          if (props.isUpdate) {
                            //--base raster update here
                            updateRasterBaseByImporting();
                          } else setCurrent2(3);
                        } else
                          message.warning(
                            "Select layer's types are incompatible. Please clear selection and try again!"
                          );
                      }
                    } else
                      message.warning(
                        "Please select atleast 1 layer to proceed forward!"
                      );
                  }}
                  disabled={!showAddMissions || !selectedLayers}
                >
                  Next
                </Button>
              ) : (
                <Button type={"primary"} loading>
                  Loading...
                </Button>
              )}
            </>
          );
        case 1:
          return (
            <>
              {props.isUpdate ? (
                <>
                  {!uploading ? (
                    <Button
                      type={"primary"}
                      onClick={() => {
                        let totalLayers = 0;
                        metadata.map((mission: unknown) => {
                          mission.layers.map((layers: unknown) => {
                            ++totalLayers;
                          });
                        });
                        console.log("total layers", totalLayers);
                        if (responseArray.length == totalLayers) {
                          createVectorBaseByAttr();
                        } else
                          message.warning(
                            "Please complete this step before proceeding!"
                          );
                      }}
                    >
                      Update Layer
                    </Button>
                  ) : (
                    <Button type={"primary"} loading>
                      Updating layer...
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  type={"primary"}
                  onClick={() => {
                    if (primeAttributes.length > 0) {
                      setCurrent2(2);
                    } else
                      message.warning(
                        "Please select at least 1 attribute to proceed!"
                      );
                  }}
                >
                  Next
                </Button>
              )}
            </>
          );
        case 2:
          return (
            <>
              {props.isUpdate ? (
                <>
                  {layerType1 == "Raster" ? (
                    <Button
                      type={"primary"}
                      onClick={() => {
                        setIsModalVisible2(false);
                        setShowAddMissions(false);
                        setMissionOptions([]);
                        setUIElement([]);
                        setSelectedLayers([]);
                        setCurrent2(0);
                        setResponseArray([]);
                        setLayerType1("");
                        setCaptureDate("");
                        setLayerName("");
                        setLayerType("");
                        setLayerProp(null);
                        form.resetFields();
                      }}
                    >
                      Finish
                    </Button>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <Button
                  type={"primary"}
                  onClick={() => {
                    let totalLayers = 0;
                    metadata.map((mission: unknown) => {
                      mission.layers.map((layers: unknown) => {
                        ++totalLayers;
                      });
                    });
                    console.log("total layers", totalLayers);
                    if (responseArray.length == totalLayers) {
                      setCurrent2(3);
                    } else
                      message.warning(
                        "Please complete this step before proceeding!"
                      );
                  }}
                >
                  Next
                </Button>
              )}
            </>
          );
        case 3:
          return (
            <>
              {!uploading ? (
                <Button
                  type={"primary"}
                  onClick={() => {
                    console.log("clicked");

                    if (layerName == "") {
                      message.warning("PLease neter layer name");
                      return;
                    }
                    if (layerType1 == "Vector") {
                      if (!layerProp) {
                        message.warning("Please select a layer type!");
                        return;
                      }
                    }

                    if (captureDate == "") {
                      message.warning("Please choose a capture date!");
                      return;
                    }
                    if (layerType1 == "Vector") {
                      createVectorBaseByAttr();
                    } else if (layerType1 == "Raster") {
                      createRasterBaseByImporting();
                    }
                  }}
                >
                  Finish
                </Button>
              ) : (
                <Button type={"primary"} loading>
                  Creating layer...
                </Button>
              )}
            </>
          );
      }
    }
  }

  const columns = [
    {
      title: "Attributes",
      dataIndex: "attribute",
    },
  ];

  const columns2 = [
    {
      title: "Attributes",
      dataIndex: "attribute",
    },
    {
      title: "Occurence In Layers",
      dataIndex: "occurs",
      render: (e) => (
        <>
          {e == "Present in all layers" ? (
            <>
              <span style={{ color: "green", marginRight: "5px" }}>●</span>
              {e}
            </>
          ) : (
            <>
              <span style={{ color: "red", marginRight: "5px" }}>●</span>
              {e}
            </>
          )}
        </>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
      setPrimeAttributes(selectedRows);
    },
  };

  useEffect(
    () => console.log("Prime attributes", primeAttributes),
    [primeAttributes]
  );

  const steps1 = [
    {
      title: "Upload Data",
      content: (
        <UploadVectorData
          form={form}
          setLayerName={setLayerName}
          layerName={layerName}
          changeLayerType={changeLayerType}
          setCaptureDate={setCaptureDate}
          iconOptions={iconOptions}
          setIcon={setIcon}
          uploadProps={uploadProps}
          uploading={uploading}
          progress={progress}
          showColorPicker={showColorPicker}
          layerColor={layerColor}
          setLayerColor={setLayerColor}
          onChangeInherit={onChangeInherit}
        />
      ),
    },
    {
      title: "Attribute Selection",
      content: (
        <AttrSelection
          rowSelection={rowSelection}
          columns={columns}
          tableData={tableData}
        />
      ),
    },
    {
      title: "Layer Created!",
      content: <LayerCreated />,
    },
  ];

  // steps for update vector by upload

  const steps1Update = [
    {
      title: "Upload Data",
      content: (
        <UpdateVectorData
          uploadProps={uploadProps}
          uploading={uploading}
          progress={progress}
        />
      ),
    },
    {
      title: "Attribute Mapping",
      content: (
        <AttrMapping
          uuid={uuid}
          handleAttributeMapping2={handleAttributeMapping2}
          fields={fields}
          selectedAttr={selectedAttr}
          primeAttributes={primeAttributes}
        />
      ),
    },
    {
      title: "Layer Updated!",
      content: <LayerUpdated />,
    },
  ];

  // -------For raster -------------------------------
  const steps1Raster = [
    {
      title: "Upload Data",
      content: (
        <UploadRasterData
          form={form}
          setLayerName={setLayerName}
          layerName={layerName}
          changeLayerType={changeLayerType}
          setCaptureDate={setCaptureDate}
          iconOptions={iconOptions}
          setIcon={setIcon}
          uploadProps={uploadProps}
          uploading={uploading}
          progress={progress}
        />
      ),
    },
    {
      title: "Layer Created!",
      content: <LayerCreated />,
    },
  ];

  // -------For raster -------------------------------
  const steps1RasterUpdate = [
    {
      title: "Upload Data",
      content: (
        <UpdateRasterData
          form={form}
          uploadProps={uploadProps}
          uploading={uploading}
          progress={progress}
        />
      ),
    },
    {
      title: "Layer Updated!",
      content: <LayerUpdated />,
    },
  ];

  useEffect(() => console.log(selectedLayers), [selectedLayers]);
  useEffect(
    () => console.log("response array", responseArray),
    [responseArray]
  );
  useEffect(() => console.log("onSelect: ", selectedAttr), [selectedAttr]);

  // UPDATE BASE LAYER AFTER UPLOADED FILE
  function updateBaseLayerAfterUploadedFile() {
    setUploading(true);
    console.log("insdie function", responseArray[0]);
    const payload: unknown = {
      baseLayer: props.BaseLayerId,
      attrMapping: responseArray[0],
      filePath: layerPath,
    };
    http
      .patch(`${apis.UPDATE_BASE_VECTOR_AFTER_UPLOAD}`, payload)
      .then((res: unknown) => {
        if (res.data.success) {
          console.log(res.data);
          props.updateLayer(res.data.data, null, null);
        } else {
          console.log(res.data);
          message.warning(res.data.message);
        }
      })
      .catch((err: unknown) => {
        console.log(err);
        AxiosErrorHandler(err, logout);
      })
      .finally(() => {
        setCurrent1(2);
        setResponseArray([]);
        setSelectedAttr({});
        setFileList([]);
        setUploading(false);
        setPrimeAttributes([]);
        setLayerPath("");
      });
  }

  function handleAttributeMapping2(
    e: unknown,
    fields: unknown,
    layers: unknown
  ) {
    const temp = {
      ...selectedAttr,
    };

    temp[`${fields.attr}`] = e;
    setSelectedAttr(temp);

    const obj: unknown = { ...responseArray[0] };
    const array: unknown = [];
    console.log("testtt", responseArray, e, fields, layerPath);
    obj[`${e}`] = fields.attr;
    console.log(obj);
    array.push(obj);
    setResponseArray(array);
  }

  function handleAttributeMapping(
    e: unknown,
    fields: unknown,
    layers: unknown
  ) {
    console.log(e);
    console.log(fields);
    console.log(layers);
    const temp = {
      ...selectedAttr,
    };

    if (temp[layers._id]) {
      temp[layers._id][`${fields.key}`] = e;
    } else {
      temp[layers._id] = {};
      temp[layers._id][`${fields.key}`] = e;
    }

    setSelectedAttr(temp);

    let ooi: unknown = [];
    const finalArray: unknown = [...responseArray];
    if (responseArray.length > 0) {
      ooi = responseArray.filter((i) => i.layerId == layers._id);
      if (ooi.length > 0) {
        ooi[0].attrMapping[`${e}`] = fields.key;
        const arraywoObj: unknown = responseArray.filter(
          (i) => i.layerId !== layers._id
        );
        arraywoObj.push(ooi[0]);
        setResponseArray(arraywoObj);
      } else {
        const obj: unknown = {
          layerId: layers._id,
          attrMapping: {},
        };
        obj.attrMapping[`${e}`] = fields.key;
        finalArray.push(obj);
        setResponseArray(finalArray);
      }
    } else {
      const obj: unknown = {
        layerId: layers._id,
        attrMapping: {},
      };
      obj.attrMapping[`${e}`] = fields.key;
      finalArray.push(obj);
      setResponseArray(finalArray);
    }
  }

  useEffect(
    () => console.log(layerName, captureDate, layerType, layerProp, fileList),
    [layerName, captureDate, layerType, layerProp, fileList]
  );

  return (
    <div>
      <Modal
        title={props.isUpdate ? "Update layer" : "Create layer"}
        open={props.isModalVisible}
        onCancel={() => {
          props.setShow(false);
          setSelectedKey(0);
        }}
        okText="Next"
        width={600}
        onOk={() => {
          props.setShow(false);
          if (selectedKey == 1) setIsModalVisible1(true);
          else if (selectedKey == 2) setIsModalVisible2(true);
          else if (selectedKey == 3) props.openPic2Mapv2(true);
          setSelectedKey(0);
        }}
        okButtonProps={{ disabled: !selectedKey }}
      >
        <Row
          align="middle"
          justify="center"
          style={{ width: "450px", margin: "0 auto" }}
        >
          <Col>
            <Card
              key="1"
              onClick={() => setSelectedKey(1)}
              className={`create-mission-extended-card ${
                selectedKey == 1 ? "create-mission-extended-card-selected" : ""
              }`}
              hoverable
            >
              <Meta
                avatar={
                  <Avatar
                    size={50}
                    icon={<UploadOutlined />}
                    style={{
                      backgroundColor: "transparent",
                      color: "black",
                    }}
                  />
                }
                title={"Upload From File"}
                description={
                  props.isUpdate
                    ? "Update layer by uploading a vector file from your system"
                    : "Create a new layer by uploading a vector file from your system"
                }
              />
            </Card>
            <Card
              key="2"
              onClick={() => {
                setSelectedKey(2);
                setMissionOptions([]);
              }}
              className={`create-mission-extended-card ${
                selectedKey == 2 ? "create-mission-extended-card-selected" : ""
              }`}
              hoverable
            >
              <Meta
                avatar={
                  <Avatar
                    size={50}
                    icon={<ImportOutlined />}
                    style={{
                      backgroundColor: "transparent",
                      color: "black",
                    }}
                  />
                }
                title={"Import From Missions"}
                description={
                  props.isUpdate
                    ? "Update layer by importing existing data from missions"
                    : "Create a new layer by importing existing data from missions"
                }
              />
            </Card>
            {props.isUpdate ? (
              <></>
            ) : (
              <Card
                key="3"
                onClick={() => setSelectedKey(3)}
                className={`create-mission-extended-card ${
                  selectedKey == 3
                    ? "create-mission-extended-card-selected"
                    : ""
                }`}
                hoverable
              >
                <Meta
                  avatar={
                    <Avatar
                      size={50}
                      icon={<ImportOutlined />}
                      style={{
                        backgroundColor: "transparent",
                        color: "black",
                      }}
                    />
                  }
                  title={"Upload Images"}
                  description="Create a new layer by uploading geolocated images"
                />
              </Card>
            )}
          </Col>
        </Row>
      </Modal>

      <Modal
        title={props.isUpdate ? "Update Layer" : "Create Layer"}
        open={isModalVisible1}
        onCancel={() => {
          if (!uploading) {
            setIsModalVisible1(false);
            setFileList([]);
            setCaptureDate("");
            setLayerName("");
            setLayerType("");
            setLayerProp(null);
            setCurrent1(0);
            setSelectedAttr({});
            form.resetFields();
          } else
            message.warning("Cannot close window during an ongoing process!");
        }}
        footer={renderFooterButtons()}
        bodyStyle={{
          padding: "1rem",
          width: "800px",
          margin: "auto",
        }}
        width={900}
        centered={true}
      >
        {props.isUpdate ? (
          <>
            {props.updateType == "Raster" ? (
              <>
                <Steps
                  current={current1}
                  items={steps1RasterUpdate.map((item) => {
                    return {
                      title: item.title,
                    };
                  })}
                ></Steps>
                <div className="steps-content">
                  {steps1RasterUpdate[current1].content}
                </div>
              </>
            ) : (
              <>
                <Steps
                  current={current1}
                  items={steps1Update.map((item) => {
                    return {
                      title: item.title,
                    };
                  })}
                ></Steps>
                <div className="steps-content">
                  {steps1Update[current1].content}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {layerType == "Raster" ? (
              <>
                <Steps
                  current={current1}
                  items={steps1Raster.map((item) => {
                    return {
                      title: item.title,
                    };
                  })}
                ></Steps>
                <div className="steps-content">
                  {steps1Raster[current1].content}
                </div>
              </>
            ) : (
              <>
                <Steps
                  current={current1}
                  items={steps1.map((item) => {
                    return {
                      title: item.title,
                    };
                  })}
                ></Steps>
                <div className="steps-content">{steps1[current1].content}</div>
              </>
            )}
          </>
        )}
      </Modal>

      <Modal
        title={props.isUpdate ? "Update layer" : "Create layer"}
        open={isModalVisible2}
        onCancel={() => {
          if (!uploading) {
            setIsModalVisible2(false);
            setShowAddMissions(false);
            setMissionOptions([]);
            setUIElement([]);
            setSelectedLayers([]);
            setCurrent2(0);
            setResponseArray([]);
            setLayerType1("");
            setCaptureDate("");
            setLayerName("");
            setLayerType("");
            setLayerProp(null);
            setSelectedAttr({});
            form.resetFields();
          } else message.warning("Cannot close window during ongoing process!");
        }}
        footer={renderFooterButtons()}
        bodyStyle={{
          padding: "1rem",
          width: "1100px",
          margin: "auto",
          height: "600px",
        }}
        width={1150}
        centered={true}
      >
        <ImportLayerSteps
          setLayerColor={setLayerColor}
          layerColor={layerColor}
          setCaptureDate={setCaptureDate}
          changeLayerType={changeLayerType}
          layerType1={layerType1}
          setLayerName={setLayerName}
          primeAttributes={primeAttributes}
          handleAttributeMapping={handleAttributeMapping}
          selectedAttr={selectedAttr}
          metadata={metadata}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tableData={tableData}
          setPrimeAttributes={setPrimeAttributes}
          addMore={addMore}
          layerOptions={layerOptions}
          uiElement={uiElement}
          onScroll={onScroll}
          current2={current2}
          showAddMissions={showAddMissions}
          setShowAddMissions={setShowAddMissions}
          missionsLoading={missionsLoading}
          handleSearch={handleSearch}
          isUpdate={props.isUpdate}
          selectedMissions={selectedMissions}
          setSelectedMissions={setSelectedMissions}
          setPage={setPage}
          setMissionOptions={setMissionOptions}
          setMissionSearchValue={setMissionSearchValue}
          setFetch={setFetch}
          missionOptions={missionOptions}
          layersLoading={layersLoading}
          selectedLayers={selectedLayers}
          setSelectedLayers={setSelectedLayers}
          setApiCall={setApiCall}
          form={form}
        />
      </Modal>
      <Modal
        title="Storage Exceeded!"
        open={storageModal}
        onOk={() => setStorageModal(false)}
        onCancel={() => setStorageModal(false)}
      >
        <Result
          status="403"
          title="Oops! It seems you have run out of storage!"
          subTitle="Please contact admin@kesowa.com to renew our services! to see you storage details, head over to My Account > Package."
        />
      </Modal>
    </div>
  );
};

export default CreateBaseLayer;
