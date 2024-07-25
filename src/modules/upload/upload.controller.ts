import {
  Controller,
  GET,
  Query,
  Ctx,
  Guard,
  Pipe,
  IContextOption,
  IGuard,
  Use,
  setMetadata,
  Cookie,
  Body,
  POST,
  

} from "@bylive/router";
import { UploadServer } from "./upload.service";
import { mkResolveRoot,  } from '../../util';
import fs from 'fs'
import { Inject } from "@bylive/ioc";


@Controller("upload")
export class UploadController {

  constructor(private uploadServer: UploadServer){}
  
  @GET()
  async uploadView(@Ctx() ctx: any,){
    ctx.render("upload", {  });
  }

  @POST()
   async index(@Ctx() ctx: any,@Body() body:any) {
    const file = ctx.request.files.file; // 获取上传文件
    // 生成保存文件的路径，这里是将文件保存在当前目录的 uploads 文件夹下

    const filePath =  mkResolveRoot ("public","upload" ,file.originalFilename);
    fs.renameSync(file.filepath,filePath)
    
  
    // 返回上传成功信息
    ctx.body = {success:true,message:`文件上传成功，保存路径为：${filePath}`,code:200};
  }
}
