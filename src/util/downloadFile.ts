import axios, { AxiosRequestConfig } from "axios";
import {getRequestHeaders} from "./requestHeaders"
import fs from 'fs'

export const downloadFile = async (url:string, outputPath:string,option:AxiosRequestConfig={}) => {
  try {
    const {headers={},...config} = option || {};
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers:{
          ...getRequestHeaders(),
          ...headers
      },
      ...config
    });
    return  writerStearm(response.data,outputPath)
  } catch (error) {
    return Promise.reject(error)
  }
};

export const writerStearm = (data,outputPath)=>{
    return new Promise((resolve,reject)=>{
      try {
        const writer = fs.createWriteStream(outputPath);
        data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      } catch (error) {
        reject(error)
      }
    })

}






