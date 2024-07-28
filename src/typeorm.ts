import "reflect-metadata";
import  fs from "fs";
import { Logger } from "@bylive/nestjs";
import { DataSource, EntitySchema, MixedList } from "typeorm";
import { resolve } from "path";
import { resolveApp } from "./util";
function loadEntity(
  dirPath = "",
  result = []
): MixedList<Function | string | EntitySchema> {
  try {
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory())
      return result;
    // 读取实体文件
    let allFileOrDir = fs.readdirSync(dirPath);
    allFileOrDir.forEach((item) => {
      let filePath = resolve(dirPath, item);
      if (
        fs.statSync(filePath).isFile() &&
        (item.endsWith(".entity.js") || item.endsWith(".entity.ts"))
      ) {
        const importResult = require(filePath);
        const resultList = Object.values(importResult);
        result = result.concat(resultList);
      } else if (fs.statSync(filePath).isDirectory()) {
        result = result.concat(loadEntity(filePath));
      }
    });
    return result;
  } catch (error) {
    Logger.error(error);
    return result;
  }
}

export const AppDataSource = new DataSource({
  name: "default",
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "123456",
  database: "koa_nestjs",
  entities: loadEntity(resolveApp("entity")),
  synchronize: true,
  cache: true,
  multipleStatements: true,
  dropSchema: false,
  maxQueryExecutionTime: 1000,
  logging: ["error"],
});




export default () => {
  return AppDataSource.initialize()
    .then((result) => {
      Logger.info(`[TypeOrmModule] msyql service  is successful`);
      return result;
    })
    .catch((error) => {
      Logger.error(error.message);
      return Promise.reject(error);
    });
};

