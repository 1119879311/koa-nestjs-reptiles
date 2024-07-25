
require("../script/loadEnv")({rootDir:"config"})
import { KoaNestTs, Logger } from '@bylive/nestjs';
import { appModule } from './app.module';
import { setStateMiddleware ,koaMount} from './share/middlewares';
import { authGuards } from './share/guards';
import { ValidationPip } from './share/pipes';
import koa2Cors from "koa2-cors";
import  koaArtTemplate from "koa-art-template"
import koaBody from "koa-body"
import koaStatic from "koa-static"
import { resolveRoot,getnetworkIp, mkResolveRoot } from './util';

const PROT = Number(process.env.APP_PORT);
const networkIps = getnetworkIp()
Logger.setting({
  error:{ write:true}
})
function start() {
  const app = KoaNestTs.create(appModule);
  const koaInastance = app.getKoa()
  app.use(setStateMiddleware);
  app.setGlobalGuard(authGuards);
  app.setGlobalPip(new ValidationPip());
  koaArtTemplate(koaInastance, {
    root: resolveRoot("view"),
    extname: '.html',
    debug: process.env.NODE_ENV !== 'production'
  });
  // 中间间
  app.use(
    koa2Cors(), 
    // koaBodyParser(),
    koaBody({
      // 支持的请求体格式，例如 'json', 'form', 'text', 'multipart'
      // 这里根据需要配置，可以同时支持多种格式
      multipart: true, // 支持文件上传
      formidable: {
        uploadDir: mkResolveRoot("public","upload"), // 设置上传文件存放的目录,//false 禁止保存到临时目录
        keepExtensions: true, // 保持文件的后缀
        maxFileSize: 5000 * 1024 * 1024, // 设置最大文件大小为 200MB.
      },
      urlencoded: true, // 支持 URL 编码的表单数据
      json: true, // 支持 JSON 格式的请求体
      text: true // 支持文本格式的请求体
    }),
    koaStatic(mkResolveRoot("public"))
    // koaMount("/public",koaStatic(mkResolveRoot("public")) ) ,

  ); //全局中间件
  app.listen(PROT, () => {
    
    Logger.info(`service is successful: http://127.0.0.1:${PROT}/`);
    networkIps.forEach(ip=>{
      Logger.info(`service is successful: http://${ip}:${PROT}/`);
    })
  });
}
start();


