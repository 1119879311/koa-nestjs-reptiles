// const compose = require('koa-compose');
import compose from "koa-compose"
import {resolve} from 'path'
import Koa from "koa"

export function koaMount(prefix:string, ...middlewares:Koa.Middleware[]) {
  const middleware = compose(middlewares);

  return async (ctx, next) => {
    const path = ctx.path;

    // Check if the current request path starts with the given prefix
    if (path.startsWith(prefix)) {
      // Rewrite path to remove the prefix
      ctx.path = ctx.path.substring(prefix.length) || '/';

      // Call the mounted middleware chain
      await middleware(ctx, next);

      // Restore the original request path after handling
      ctx.path = path;
    } else {
      // Pass to the next middleware if prefix doesn't match
      await next();
    }
  };
}




