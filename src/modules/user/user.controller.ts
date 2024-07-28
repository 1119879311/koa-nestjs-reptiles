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
} from '@bylive/router';
import Koa from 'koa';
import { UserServer } from './user.serves';
import * as Cookies from 'cookies';
import { customCache } from '../../share/cacheManager';

@Controller('user')
export class UserController {
  constructor(private usererver: UserServer) {}


  @GET('list')
  async list() {
    return  await this.usererver.find()
  }
  @GET('setCookies')
  setCookies(@Cookie() cookie: Cookies, @Query() user:any) {
    console.log('ctx.state.useConfig', user,{ttl:30});
    cookie.set('userInfo', JSON.stringify(user));
    customCache.set("userinfo",(user))
    return user;
  }
  @GET('getCookies')
  async getCookies(@Cookie() cookie: Cookies) {
    let result  = await customCache.get("userinfo")
    console.log("缓存",result)
    return {cache:result,cookie: cookie.get('userInfo') || {}}
  }
  @GET()
  index(@Ctx() ctx: any) {
    ctx.render("index",{title:"title"})
  }
  getd() {
    return 'lallalla';
  }
}
