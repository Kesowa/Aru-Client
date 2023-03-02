import axios from "axios";
import { API_URL } from "src/constants";

const http = axios.create({
  baseURL: API_URL,
});

export default http;
