import * as cacheManager from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';

// 创建内存缓存
const memoryCache = cacheManager.caching({ store: 'memory', max: 100 });

// 创建 Redis 缓存
const redisCache = cacheManager.caching({
    store: redisStore,
    host: 'localhost', // Redis 主机
    port: 6379, // Redis 端口
});

// 设置不同数据的不同过期时间
const ttlMap = {
    key1: 60, // 60秒
    key2: 120, // 120秒
};

export { memoryCache, redisCache, ttlMap };
