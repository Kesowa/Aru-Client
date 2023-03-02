import { message } from "antd";
//import Modal from "antd/lib/modal/Modal";

export const AxiosErrorHandler = (error: any, cb: any) => {
  if (error.response?.status === 401) {
    cb(true);
    message.error("Un-Authorized! Please re-login to continue.");
  } else if (error.response?.status === 403) {
    message.error("Forbidden!");
  } else {
    if (typeof error.response === "string") {
      message.error(error.response);
    } else if (typeof error.message === "string") {
      if (error.status === false) {
        message.error(error.message);
      } else {
        console.debug(error.message);
        message.error("Something went wrong!");
      }
    } else {
      console.debug(error);
      message.error("Something went wrong!");
    }
  }
};
