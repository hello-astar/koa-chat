/*
 * @author: astar
 * @Date: 2021-01-26 18:22:14
 * @LastEditors: astar
 * @LastEditTime: 2021-03-30 17:24:16
 * @Description: 设置白名单
 * @FilePath: \koa-chat\middlewares\setWhiteList.js
 */
module.exports = function (WHITE_WEBSITES) {
  return async function (ctx, next) {
    const allowHost = WHITE_WEBSITES; // 白名单
    if (allowHost.includes(ctx.request.header.origin)) {
      ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin);
      ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
      ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      ctx.set('Access-Control-Allow-Credentials', true);
    }
    if (ctx.method == 'OPTIONS') {
      ctx.response.status = 204;
    } else {
      await next();
    }
  }
}