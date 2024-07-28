
require("../script/loadEnv")({rootDir:"config"})
import db from "./typeorm"
import {bootstrap} from "./bootstrap"
import { Logger } from "@bylive/nestjs";
Logger.setting({
  error:{ write:true}
})
async function start(){
  try {
    await db()
    await bootstrap()
  } catch (error) {  
  }
}

start()


