import  fs from "fs"
import path from "path"
import os from "os"
import url from "url"
// 创建工厂函数
export function createFacroy<T>(c: { new (...args: any[]): T }): (...args: any[]) => T {
  let instacen: T;
  return function (...args: any[]): T {
    if (!instacen) {
      instacen = new c(...args);
    }
    return instacen;
  };
}


export const getnetworkIp = ()=>{

  // 获取网络接口列表
  const networkInterfaces = os.networkInterfaces();

  // 遍历网络接口列表，查找内网地址
    let addressList = []
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        // 忽略非IPv4地址和loopback地址
        if (iface.family === 'IPv4' && !iface.internal) {
          addressList.push(iface.address)
        }
      }
    }

    return addressList
}


export const getUrlExtension = (urlString) => {
  let pathName  =  url.parse(urlString).pathname
  const lastDotIndex = pathName.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    return pathName.slice(lastDotIndex);
  } else {
    return '';
  }
};


export function writeJsonToFile(jsonData, filePath) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);

    writeStream.write(JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        writeStream.end();
        resolve(`写入成功： ${filePath}`);
      }
    });
  });
}


export function hasExtension(filePath) {
  return path.extname(filePath) !== '';
}

export function mkdirSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true
        }
    }
}


export function replaceSlashAndBackslash(str:string) {
  return str.replace(/[\/\\]/g, '-').replace(/\s/g, '');
}

export function sanitizeFileName(fileName:string,replaceStr="") {
  return fileName.replace(/[\\/:*?"<>|]/g, replaceStr).replace(/\s/g, '');
}

// 设置环境变量
export const appRoot = fs.realpathSync(process.cwd()); //
export const appEntry = path.dirname(path.resolve(__dirname)) ;


export const resolvePath = (isRoot:boolean,isMkdir:boolean,...paths:string[])=>{

     let dirs = isRoot? appRoot:appEntry;
     let resPath = path.resolve(dirs, ...paths)
     if(isMkdir){
      mkdirSync(hasExtension(resPath)? path.dirname(resPath):resPath)
     }
     return resPath

}

export const resolveRoot = (...paths:string[]) => resolvePath(true,false,...paths)

export const mkResolveRoot = (...paths:string[])=>resolvePath(true,true,...paths)

export const resolveApp = (...paths:string[]) => resolvePath(false,false, ...paths);
export const mkResolveApp = (...paths:string[]) => resolvePath(false,true, ...paths);
