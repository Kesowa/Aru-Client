import axios from "axios";
import { API_URL } from "src/constants";

const http = axios.create({
  baseURL: API_URL,
  timeout: 1000 * 60 * 60 * 2,
});

export default http;
