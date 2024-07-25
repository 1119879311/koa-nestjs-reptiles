
import { Logger } from "@bylive/nestjs";
import * as cacheManager from "cache-manager";
import { ErrorEventHandler, Store } from "cache-manager";
import { StoreConfig, WrapTTL } from "cache-manager";
import { caching } from "cache-manager";



// cacheManager.MemoryCache | redisStore.RedisStore

export class CustomCache<T extends cacheManager.Cache>  {
  constructor(private instance:Promise<T>| T) {
    if(!instance){
      throw new Error("请提供缓存引擎")
    }
  }
  
  set = async (
    key: string,
    value: unknown,
    ttl?: cacheManager.Milliseconds
  ): Promise<void> => {
    if (this.instance) {
      const ins = await this.instance;
      return  ins.set(key, value, ttl);
    } else {
      Logger.error(`CacheModule] 实例不存在,缓存设置失败:${key}`);
    }
  };
  get = async <T>(key: string): Promise<T | undefined> => {
    if (this.instance) {
      const ins = await this.instance;
      return ins.get<T>(key);
    } else {
      Logger.error(`CacheModule] 实例不存在,缓存获取失败:${key}`);
    }
  };
  del = async (key: string): Promise<void> => {
    if (this.instance) {
        const ins = await this.instance;
        return ins.del(key);
    } else {
      Logger.error(`CacheModule] 实例不存在,缓存删除失败:${key}`);
    }
  };
  reset = async (): Promise<void> => {
    if (this.instance) {
        const ins = await this.instance;
        return ins.reset();
    } else {
      Logger.error(`CacheModule] 实例不存在,缓存重置失败`);
    }
  };

  on=async <T>(event: 'error', handler: ErrorEventHandler<T>) => {
    if (this.instance) {
      const ins = await this.instance;
      return ins.on("error",handler);
  } else {
    Logger.error(`CacheModule] 实例不存在,缓存重置失败`);
  }
  };
  removeListener =async <T>(
    event: "error",
    handler: cacheManager.ErrorEventHandler<T>
  ) => {
    if (this.instance) {
        const ins = await this.instance;
        return ins.removeListener(event, handler);
    } else {
      Logger.error(`CacheModule] 实例不存在,移除Error事件失败`);
    }
  };
  wrap =async <T>(
    key: string,
    function_: () => Promise<T>,
    ttl?: WrapTTL<T>,
    refreshThreshold?: cacheManager.Milliseconds,
    options?: cacheManager.WrapOptions
  ): Promise<T> => {
    if (this.instance) {
        const ins = await this.instance;
        return ins.wrap(key, function_, ttl, refreshThreshold, options);
    } else {
      Logger.error(`CacheModule] 实例不存在,wrap 方法操作失败`);
    }
  };
}





// 

// 创建内存缓存
const memoryCache= caching("memory",{ max:100,ttl: 10*60*1000 });


// 创建自定义缓存
export const customCache = new CustomCache(memoryCache);




// async function test(){
//   await customCache.set("foo",'sss')
//   console.log('---',await customCache.get("foo"))
  
// }


// test()

// 设置不同数据的不同过期时间
export const CachettlMap = {
  key1: 60, // 60秒
  key2: 120, // 120秒
};

export const InjectCacheKey = "INJECT_CACHE_KEY";
