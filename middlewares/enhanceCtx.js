/*
 * @author: astar
 * @Date: 2021-01-26 17:39:28
 * @LastEditors: astar
 * @LastEditTime: 2021-04-19 14:13:16
 * @Description: 增强context对象
 * @FilePath: \koa-chat\middlewares\enhanceCtx.js
 */
const enhanceCtx = () => {
  // 处理请求成功方法
  const render = ctx => {
      return (data, msg) => {
          ctx.response.body = {
              code: 1,
              data: data,
              msg: msg || '请求成功'
          }
      }
  }

  // 处理请求失败方法
  const renderError = ctx => {
      return (msg, code = -1) => {
          ctx.response.body = {
              code: code,
              data: null,
              msg: msg || '请求失败'
          }
      }
  }

  return async (ctx, next) => {
      ctx.send = render(ctx);
      ctx.sendError = renderError(ctx);
      ctx.token =  ctx.headers.authorization ? ctx.headers.authorization.split(' ')[1] : null;
      await next();
  }
}

module.exports = enhanceCtx;