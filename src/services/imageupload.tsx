import { message } from "antd";

export function getBase64(img: any, callback: any) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

export const beforeUpload = (
  file: any,
  extension: Array<string>,
  size: number,
  cb: any
) => {
  console.log(file.size / 1024 / 1024, file.type);
  const isJpgOrPng = extension.includes(file.type);
  const isLt2M = file.size / 1024 / 1024 < size;
  if (!isJpgOrPng) {
    message.error("Invalid file type!");
  } else {
    if (!isLt2M) {
      message.error("Too large file!");
    } else {
      cb();
    }
  }
};
