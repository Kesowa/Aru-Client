import React, { useState, useRef, useCallback } from "react";
import {
  Alert,
  Button,
  message,
  Modal,
  notification,
  Spin,
  Result,
} from "antd";
import "./data.less";
import {
  setChonkyDefaults,
  FileArray,
  FullFileBrowser,
  ChonkyActions,
  FileData,
  ChonkyFileActionData,
  FileHelper,
  defineFileAction,
  ChonkyIconProps,
} from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import apis from "../../../../../services/apis";
import http from "../../../../../services/httpCall";
import { AxiosErrorHandler } from "../../../../../services/httpErrorHandle";
import { logout } from "../../../../../actions/authAction";
import { connect } from "react-redux";
import {
  InboxOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import Dragger from "antd/lib/upload/Dragger";
import { useEffect } from "react";
import io from "socket.io-client";
import { useMemo } from "react";
import download from "downloadjs";
import { API_URL, STATIC_URL } from "src/constants";
import { thread } from "../../../../../actions/threadAction";
import Thread from "src/components/shared/Thread";
import axios from "axios";
import { PERMS } from "src/static/permissions";

function Documents(props) {
  const [defaultFileList, setDefaultFileList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [refreshState, setRefreshState] = useState(false);
  const socket: any = useRef();
  const [loader, setLoader] = useState(false);
  const [myFileActions, setMyFileActions] = useState([]);
  const [storageModal, setStorageModal] = useState(false);
  const OpenThread = defineFileAction({
    id: "open_thread",
    button: {
      name: "Open Thread",
      toolbar: false,
      contextMenu: true,
      icon: "thread",
    },
  } as const);
  const customChonkyIcon: { [iconName: string]: any } = {
    thread: <MessageOutlined />,
  };
  const CustomChonkyIcon: React.FC<ChonkyIconProps> = React.memo((props) => {
    const customIcon = customChonkyIcon[props.icon];
    if (customIcon) {
      return <span>{customIcon}</span>;
    }
    return <ChonkyIconFA {...props} />;
  });
  setChonkyDefaults({ iconComponent: CustomChonkyIcon });
  //----------------Set Perms----------------------------
  useEffect(() => {
    if (
      props.userType === "tenant-staff" ||
      props.userType === "tenant-client"
    ) {
      let upload: any = [];
      let deleteDoc: any = [];
      const perms: any = [
        ChonkyActions.EnableListView,
        ChonkyActions.EnableGridView,
        ChonkyActions.ClearSelection,
        ChonkyActions.DownloadFiles,
        OpenThread,
        ChonkyActions.SelectAllFiles,
        ChonkyActions.SortFilesBySize,
        ChonkyActions.SortFilesByDate,
        ChonkyActions.SortFilesByName,
        ChonkyActions.OpenSelection,
      ];

      //----checking upload perms--------------------------
      if (props.userDetails.customPermissions.includes(PERMS.UPLOAD_DOCUMENT)) {
        perms.push(ChonkyActions.UploadFiles);
      }

      if (props.userDetails.customPermissions.includes(PERMS.DELETE_DOCUMENT)) {
        perms.push(ChonkyActions.DeleteFiles);
      }

      setMyFileActions(perms);
    } else {
      const perms: any = [
        ChonkyActions.EnableListView,
        ChonkyActions.EnableGridView,
        ChonkyActions.ClearSelection,
        ChonkyActions.DownloadFiles,
        OpenThread,
        ChonkyActions.SelectAllFiles,
        ChonkyActions.SortFilesBySize,
        ChonkyActions.SortFilesByDate,
        ChonkyActions.SortFilesByName,
        ChonkyActions.UploadFiles,
        ChonkyActions.DeleteFiles,
        ChonkyActions.OpenSelection,
      ];
      setMyFileActions(perms);
    }
  }, []);

  //-----------Defining File System Structure in State------------------
  const [filesSystem, setFileSystem] = useState({
    rootFolderId: "root1234",
    fileMap: {
      root1234: {
        id: "root1234",
        name: `${props.missionName} Documents`,
        isDir: true,
        childrenIds: ["rawData"],
        childrenCount: 1,
      },
      rawData: {
        id: "rawData",
        name: "Raw Data",
        isDir: true,
        childrenIds: ["rawPhotos", "rawVideos"],
        parentId: "root1234",
        childrenCount: 2,
      },
      rawPhotos: {
        id: "rawPhotos",
        name: "Photos",
        isDir: true,
        childrenIds: [],
        parentId: "rawData",
        childrenCount: 0,
      },
      rawVideos: {
        id: "rawVideos",
        name: "Videos",
        isDir: true,
        childrenIds: [],
        parentId: "rawData",
        childrenCount: 0,
      },
    },
  });

  //--------------Defining Roor folde and FileMap -------------------------------
  const rootFolderId = filesSystem.rootFolderId;
  const fileMap = filesSystem.fileMap as unknown as {
    [fileId: string]: FileData & { childrenIds: string[] };
  };
  //----------------------Fetch Files list from fileSystem state ----------------
  const useFiles = (currentFolderId: string): FileArray => {
    return useMemo(() => {
      const currentFolder = fileMap[currentFolderId];
      const files = currentFolder.childrenIds
        ? currentFolder.childrenIds.map(
            (fileId: string) => fileMap[fileId] ?? null
          )
        : [];
      return files;
    }, [currentFolderId, filesSystem]);
  };

  //----------- setting Folder chain management -------------------------
  const useFolderChain = (currentFolderId: string): FileArray => {
    return useMemo(() => {
      const currentFolder = fileMap[currentFolderId];

      const folderChain = [currentFolder];

      let parentId = currentFolder.parentId;
      while (parentId) {
        const parentFile = fileMap[parentId];
        if (parentFile) {
          folderChain.unshift(parentFile);
          parentId = parentFile.parentId;
        } else {
          parentId = null;
        }
      }

      return folderChain;
    }, [currentFolderId]);
  };

  function bulkDownload(id: any) {
    http
      .get(`${apis.BULK_DOWNLOAD}`, {
        params: {
          missionId: props.missionId,
          folderName: id,
        },
      })
      .then((res) => {
        if (res.data.status) {
          const url = `${STATIC_URL}${res.data.link}`;
          const key = `open${Date.now()}`;
          const btn = (
            <a href={url} target="_blank" rel="noreferrer">
              <Button type="primary" size="small" onClick={() => {}}>
                Download
              </Button>
            </a>
          );
        } else {
          console.log(res.data);
          message.info("No files to download inside this folder!");
        }
      })
      .catch((err) => {
        message.error(err);
        AxiosErrorHandler(err, props.logout);
      });
  }
  //------------File actions handler--------------------------------------
  const useFileActionHandler = (
    setCurrentFolderId: (folderId: string) => void
  ) => {
    return useCallback(
      (data: ChonkyFileActionData) => {
        switch (data.id) {
          case OpenThread.id:
            props.thread(true, {
              docType: "document",
              docId: data.state.selectedFiles[0].id,
            });
            break;
          //-----Changing DIR state--------------------------------------------------
          case ChonkyActions.OpenFiles.id:
            const { targetFile, files } = data.payload;
            const fileToOpen = targetFile ?? files[0];
            if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
              setCurrentFolderId(fileToOpen.id);
              return;
            } else {
              if (
                currentFolderId === "root1234" ||
                currentFolderId === "rawPhotos" ||
                currentFolderId === "rawVideos"
              ) {
                var url = data.state.selectedFilesForAction[0]?.path;
                window.open(url);
              }
            }
            break;
          //----------Delete Files---------------------------------------------------
          case ChonkyActions.DeleteFiles.id:
            if (data.state.selectedFilesForAction.length > 1) {
              let restrictedFolder = 0;
              data.state.selectedFilesForAction.map((file: any) => {
                if (file.id === "rawData" || file.parentId === "rawData") {
                  restrictedFolder = restrictedFolder + 1;
                }
              });
              if (restrictedFolder > 1) {
                message.warning("Operation Restricted!");
              } else {
                const files: any = data.state.selectedFilesForAction.filter(
                  (i) => i.id !== "rawData"
                );
                Modal.confirm({
                  title: "Delete Files?",
                  icon: <ExclamationCircleOutlined />,
                  content:
                    "Are you sure you want to delete these files from mission?",
                  okText: "Yes",
                  cancelText: "No",
                  onOk: () => {
                    deleteMultiple(files);
                  },
                });
              }
            } else if (data.state.selectedFilesForAction.length === 1) {
              if (
                data.state.selectedFilesForAction[0].parentId === "rawData" ||
                data.state.selectedFilesForAction[0].id === "rawData"
              ) {
                message.warning("Operation Restricted!");
              } else {
                Modal.confirm({
                  title: "Delete File?",
                  icon: <ExclamationCircleOutlined />,
                  content:
                    "Are you sure you want to delete this file from mission?",
                  okText: "Yes",
                  cancelText: "No",
                  onOk: () => {
                    deleteFile(data.state.selectedFilesForAction[0].id);
                  },
                });
              }
            }
            break;
          //-------------Upload Files------------------------------------------------
          case ChonkyActions.UploadFiles.id:
            if (currentFolderId === "rawData") {
              message.warning("Upload to this folder is not permitted!");
            } else {
              uploadModal();
            }
            break;
          //----------------Download Files-------------------------------------------
          case ChonkyActions.DownloadFiles.id:
            if (data.state.selectedFilesForAction.length > 1) {
              if (currentFolderId === "root1234") {
                data.state.selectedFilesForAction.map((data) => {
                  if (data.id === "rawData") {
                    bulkDownload("rawData");
                  } else {
                    download(data.path);
                  }
                });
              } else if (currentFolderId === "rawData") {
                bulkDownload("rawData");
              } else {
                data.state.selectedFilesForAction.map((data) => {
                  download(data.path);
                });
              }
            } else if (data.state.selectedFilesForAction.length === 1) {
              if (
                currentFolderId === "root1234" ||
                currentFolderId === "rawData"
              ) {
                if (currentFolderId === "root1234") {
                  if (data.state.selectedFilesForAction[0].id === "rawData") {
                    bulkDownload("rawData");
                  } else {
                    var url = data.state.selectedFilesForAction[0].path;
                    window.open(url);
                  }
                } else {
                  bulkDownload(data.state.selectedFilesForAction[0].id);
                }
              } else {
                var url = data.state.selectedFilesForAction[0].path;
                window.open(url);
              }
            }
            break;
          default:
        }
      },
      [setCurrentFolderId, currentFolderId]
    );
  };

  const [currentFolderId, setCurrentFolderId] = useState(rootFolderId);
  const files = useFiles(currentFolderId);
  const folderChain = useFolderChain(currentFolderId);
  const handleFileAction = useFileActionHandler(setCurrentFolderId);

  //---------------------File validator----------------
  function validateFile(file: any) {
    const extension = file.name.split(".")[1];
    if (currentFolderId === "rawPhotos") {
      switch (file.type) {
        case "image/png":
          return true;
        case "image/jpeg":
          return true;
        default:
          message.warning("Image file type not supported!");
          return false;
      }
    } else if (currentFolderId === "rawVideos") {
      switch (file.type) {
        case "video/mp4":
          return true;
        case "video/x-matroska":
          return true;
        default:
          message.warning("Video file type not supported!");
          return false;
      }
    } else if (currentFolderId === "root1234") {
      return true;
    }
  }
  //---------------------Upload props-------------------------------
  const UploadProps = {
    name: "file",
    multiple: true,
    action: `${API_URL}${apis.UPLOAD_DOCUMENT}`,
    customRequest: (options: any) => {
      const cancelToken = axios.CancelToken;
      const source = cancelToken.source();
      if (validateFile(options.file)) {
        const fData = new FormData();
        fData.append("file", options.file);
        fData.append("missionId", props.missionDetails.missionId);
        fData.append("folderName", currentFolderId);
        if (
          options.file.name.substring(
            options.file.name.lastIndexOf(".") + 1
          ) === "las" ||
          options.file.name.substring(
            options.file.name.lastIndexOf(".") + 1
          ) === "LAS"
        ) {
          fData.append("type", "pointCloud");
        } else {
          fData.append("type", options.file.type);
        }
        const config = {
          headers: {
            "content-type": "multipart/form-data;",
          },
          onUploadProgress: (event) => {
            const percent = Math.floor((event.loaded / event.total) * 100);
            setProgress(percent);
            if (percent === 100) {
              setTimeout(() => setProgress(0), 1000);
            }
            options.onProgress({ percent: (event.loaded / event.total) * 100 });
          },
          cancelToken: source.token,
        };

        switch (
          props.missionDetails.userType //upload priviledge checks
        ) {
          case "tenant-root": //when user is a tenant root
            http
              .post(options.action, fData, config)
              .then((res: any) => {
                options.onSuccess(res.data, options.file);
                message.success(
                  "File " + options.file.name + " uploaded successfully"
                );
              })
              .catch((err) => {
                if (axios.isCancel(err)) {
                  console.log("Upload Cancelled");
                  return;
                } else if (err.response?.status === 403) {
                  if (
                    err.response?.data.message ===
                    "Actual storage exceeded the Limit of Set storage!"
                  ) {
                    setStorageModal(true);
                  } else {
                    message.error(err.response?.data.message);
                    console.log(err.response);
                  }
                } else {
                  console.log(err);
                  message.error("Unable to upload file!");
                  options.onError({ err });
                }
                AxiosErrorHandler(err, props.logout);
              });

            break;

          case "tenant-staff": // when user is tenant staff
            http
              .post(options.action, fData, config)
              .then((res: any) => {
                options.onSuccess(res.data, options.file);
                message.success(
                  "File " + options.file.name + " uploaded successfully"
                );
              })
              .catch((err) => {
                if (axios.isCancel(err)) {
                  console.log("Upload Cancelled");
                  return;
                } else if (err.response?.status === 403) {
                  if (
                    err.response?.data.message ===
                    "Actual storage exceeded the Limit of Set storage!"
                  ) {
                    setStorageModal(true);
                  } else {
                    message.error(err.response?.data.message);
                    console.log(err.response);
                  }
                } else {
                  console.log(err);
                  message.error("Unable to upload file!");
                  options.onError({ err });
                }
                AxiosErrorHandler(err, props.logout);
              });
            break;

          default:
            message.warning("You are not permitted to upload!");
        }
      } else {
        options.onError("File not Supported!");
      }
      return {
        abort() {
          console.log("Aborting file upload");
          source.cancel("User cancelled file upload");
        },
      };
    },
  };

  //-------- Upload Modal ------------------------

  function uploadModal() {
    Modal.info({
      title: "Upload Documents",
      content: (
        <div className="upload-modal-video">
          <Alert
            style={{ marginBottom: "8px" }}
            message="Supported files"
            description=".jpeg, .png, .mp4, .mkv and all word document, excel, presentationa and pdf files are supported. For potree point clouds, you mave upload the .zip version of the potree output folder"
            type="info"
            showIcon
          />
          <Dragger {...UploadProps} defaultFileList={defaultFileList}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload.
            </p>
          </Dragger>
        </div>
      ),
      centered: true,
      width: 640,
      cancelText: "Cancel",
      onOk() {},
      onCancel() {},
    });
  }

  //------------------Get Docs------------------------------------------
  function getDocs() {
    setLoader(true);
    http
      .get(`${apis.GET_DOCUMENTS}?missionId=${props.missionId}`)
      .then((res: any) => {
        if (res.data.status) {
          const reports: any = [];
          const rawPhotos: any = [];
          const rawVideos: any = [];
          let reportsChildrenCount = 0;
          const reportsChildrenIds: any = ["rawData"];
          let rawphotosChildrenCount = 0;
          const rawphotosChildrenIds: any = [];
          let rawvideosChildrenCount = 0;
          const rawvideosChildrenIds: any = [];
          res.data.data.documents.map((data: any) => {
            //pushing data into reports
            if (data.folderName === "root1234") {
              reportsChildrenCount = reportsChildrenCount + 1;
              reportsChildrenIds.push(data._id);
              const file: any = {
                id: data._id.toString(),
                name: data.name,
                modDate: data.createdAt,
                size: data.fileSize,
                path: `${STATIC_URL}${data.filePath}`,
              };
              reports.push(file);
            }
            //pushing data into raw images
            if (data.folderName === "rawPhotos") {
              rawphotosChildrenCount = rawphotosChildrenCount + 1;
              rawphotosChildrenIds.push(data._id);
              const file: any = {
                id: data._id.toString(),
                name: data.name,
                modDate: data.createdAt,
                size: data.fileSize,
                thumb: `${STATIC_URL}/documents/1x_${
                  data.filePath.split("/")[2]
                }`,
                path: `${STATIC_URL}/documents/${data.filePath.split("/")[2]}`,
              };
              rawPhotos.push(file);
            }
            if (data.folderName === "rawVideos") {
              rawvideosChildrenCount = rawvideosChildrenCount + 1;
              rawvideosChildrenIds.push(data._id);
              const file: any = {
                id: data._id.toString(),
                name: data.name,
                modDate: data.createdAt,
                size: data.fileSize,
                path: `${STATIC_URL}${data.filePath}`,
              };
              rawVideos.push(file);
            }
          });
          const fileState = {
            rootFolderId: "root1234",
            fileMap: {
              root1234: {
                id: "root1234",
                name: `${props.missionName} Documents`,
                isDir: true,
                childrenIds: reportsChildrenIds,
                childrenCount: 1 + reportsChildrenCount,
              },
              reports: {
                id: "reports",
                name: "Reports",
                isDir: true,
                childrenIds: reportsChildrenIds,
                parentId: "root1234",
                childrenCount: reportsChildrenCount,
              },
              rawData: {
                id: "rawData",
                name: "Raw Data",
                isDir: true,
                childrenIds: ["rawPhotos", "rawVideos"],
                parentId: "root1234",
                childrenCount: 2,
              },
              rawPhotos: {
                id: "rawPhotos",
                name: "Photos",
                isDir: true,
                childrenIds: rawphotosChildrenIds,
                parentId: "rawData",
                childrenCount: rawphotosChildrenCount,
              },
              rawVideos: {
                id: "rawVideos",
                name: "Videos",
                isDir: true,
                childrenIds: rawvideosChildrenIds,
                parentId: "rawData",
                childrenCount: rawvideosChildrenCount,
              },
            },
          };
          reports.map((file: any) => {
            fileState.fileMap[file.id] = {
              id: file.id,
              name: file.name,
              modDate: file.modDate,
              size: file.size,
              path: file.path,
              parentId: "root1234",
            };
          });
          rawPhotos.map((file: any) => {
            fileState.fileMap[file.id] = {
              id: file.id,
              name: file.name,
              modDate: file.modDate,
              size: file.size,
              path: file.path,
              parentId: "rawPhotos",
              thumbnailUrl: file.thumb,
            };
          });
          rawVideos.map((file: any) => {
            fileState.fileMap[file.id] = {
              id: file.id,
              name: file.name,
              modDate: file.modDate,
              size: file.size,
              path: file.path,
              parentId: "rawVideos",
            };
          });
          setFileSystem(fileState);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err: Error) => {
        AxiosErrorHandler(err, props.logout);
        console.log(err);
      })
      .finally(() => setLoader(false));
  }
  //------------------Fetch DOcuments------------------------------------
  function fetchDocuments() {
    if (refreshState || props.refreshDoc) {
      props.setRefreshDoc(false);
      setRefreshState(false);
      getDocs();
    } else {
      getDocs();
    }
  }

  //------------------- Delete Documents ------------------------------------------
  function deleteFile(id: any) {
    http
      .delete(`${apis.DELETE_DOCUMENT}?id=${id}`)
      .then((res) => {
        if (res.data.status) {
          message.success("File deleted succesfully!");
          setRefreshState(true);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error("ERROR" + err);
        AxiosErrorHandler(err, props.logout);
      });
  }

  //-------------------Delete Multiple Documents-----------------------------------

  function deleteMultiple(files: any) {
    const IdsArray: any = [];
    files.map((file) => {
      IdsArray.push(file.id);
    });
    const payload = {
      id: IdsArray,
    };
    http
      .delete(`${apis.DELETE_DOCUMENT_MULTIPLE}`, {
        data: payload,
      })
      .then((res) => {
        if (res.data.status) {
          message.success("Documents deleted successfully!");
          setRefreshState(true);
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        message.error("API Error: Please report bug!");
        AxiosErrorHandler(err, props.logout);
      });
  }

  //--------------- Hooke to fetch documents and handle socket events -----------------------------
  useEffect(() => {
    fetchDocuments();
    if (props.missionDetails.missionId) {
      if (!socket.current) {
        socket.current = io(
          `${API_URL}/stream/mission-specific?missionID=${props.missionDetails.missionId}`
        );

        socket.current.on("DOCUMENT_CREATED", (data) => {
          setRefreshState(true);
          fetchDocuments();
        });

        socket.current.on("DOCUMENT_DELETED", (data) => {
          setRefreshState(true);
          fetchDocuments();
        });

        socket.current.on("DOCUMENT_ZIP_START", (data) => {
          message.success("Preparing your download...");
        });

        socket.current.on("DOCUMENT_ZIP_COMPLETED", (data) => {
          const key = `open${Date.now()}`;
          const btn = (
            <a href={`${STATIC_URL}${data}`} target="_blank" rel="noreferrer">
              <Button type="primary" size="small" onClick={() => {}}>
                Download
              </Button>
            </a>
          );
          notification["success"]({
            message: `Your folder files are ready!`,
            description: `Click the download button to download the contents of folder in a zipped file.`,
            btn,
            key,
            placement: "bottomRight",
            duration: null,
          });
        });
        socket.current.on("DOCUMENT_ZIP_FAILED", (data) => {
          console.log("ERROR! Could not compress folder items!", data);
          message.error("Oops! Failed to compress files. Please try again!");
        });
      }
    }
  }, [props.missionDetails.missionId, refreshState]);

  return (
    <>
      <Spin spinning={loader}>
        <Thread />
        <div className="documents-wrapper">
          <FullFileBrowser
            files={files}
            folderChain={folderChain}
            fileActions={myFileActions}
            disableDefaultFileActions={true}
            onFileAction={handleFileAction}
          />
        </div>
      </Spin>
      <Modal
        title="Storage Exceeded!"
        open={storageModal}
        onOk={() => setStorageModal(false)}
        onCancel={() => setStorageModal(false)}
      >
        <Result
          status="403"
          title="Oops! You have run out of storage!"
          subTitle="Please contact admin@kesowa.com to renew our services! to see you storage details, head over to My Account > Package."
        />
      </Modal>
    </>
  );
}

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { logout, thread })(Documents);
