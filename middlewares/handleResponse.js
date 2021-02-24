/*
 * @author: astar
 * @Date: 2021-01-26 17:39:28
 * @LastEditors: astar
 * @LastEditTime: 2021-02-24 15:03:47
 * @Description: 统一返回数据
 * @FilePath: \koa-chat\middlewares\handleResponse.js
 */
const sendHandle = () => {
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
      await next();
  }
}

module.exports = sendHandle;