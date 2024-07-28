import Redis from "ioredis"
const redisCache = new Redis();

redisCache.set("mykey", '1212').then(res=>{
  console.log("res",res);
}); // Returns a promise which resolves to "OK" when the command succeeds.

// ioredis supports the node.js callback style
redisCache.get("mykey", (err, result) => {
  
  if (err) {
    console.error(err);
  } else {
    console.log(result); // Prints "value"
  }
});