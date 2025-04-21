import axios, { AxiosInstance } from "axios";
import { useState } from "react";
axios.defaults.withCredentials = true;

import { API_URL } from "src/constants";

const http = axios.create({
  baseURL: API_URL,
  timeout: 1000 * 60 * 60 * 2,
});

export default http;

export const useProgress = (axiosInstance: AxiosInstance) => {
  const [progress, setProgress] = useState(0);
  axiosInstance.defaults.onUploadProgress = (event) => {
    const percent = Math.floor((event.loaded / event.total) * 100);
    setProgress(percent);
    if (percent === 100) {
      setTimeout(() => setProgress(0), 1000);
    }
  };
  return progress;
}