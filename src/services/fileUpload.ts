import type { RcFile } from "antd/lib/upload";
import axios from "axios";
import http from "./httpCall";

export async function uploadFile(file: RcFile, model: DocModel, progress?: (frac: number) => void) {
  const getUrlRes = await http.post<{
    status: true,
    message: string,
    data: {
      presigned: {
        postURL: string,
        formData: Record<string, string>
      },
      _id: string,
    }
  } | {
    status: false,
    message: string,
  }>("/apis/v1/common/upload-url", {
    name: file.name,
    size: file.size,
    type: file.type,
    model,
  });
  if (getUrlRes.data.status == false) {
    console.error("ERROR GETTING PRESIGNED URL!!!: ", getUrlRes.data.message);
    return;
  }
  const { postURL, formData } = getUrlRes.data.data.presigned;
  const postFormData = new FormData();
  Object.entries(formData).forEach(([key, val]) => postFormData.set(key, val));
  postFormData.append("file", file);
  await axios.post(postURL, postFormData, progress && {
    onUploadProgress(event) {
      progress(event.loaded/event.total);
    }
  })
  return getUrlRes.data.data._id;
}

export enum DocModel {
  VOD = "VOD",
  USER_AVATARS = "user",
  ALERT_IMAGES = "alert",
  VECTOR = "vector",
  RASTER = "raster",
  DOCUMENTS = "document",
  LAYER_FILES = "layerFiles",
}
