import axios, { AxiosRequestConfig } from "axios";
import {getRequestHeaders} from "./requestHeaders"
import fs from 'fs'

export const downloadFile = async (url:string, outputPath:string,option:AxiosRequestConfig={}) => {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    headers:{
        ...getRequestHeaders()
    },
    ...option
  });

  const writer = fs.createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};
