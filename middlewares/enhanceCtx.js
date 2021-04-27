/*
 * @author: astar
 * @Date: 2021-01-26 17:39:28
 * @LastEditors: astar
 * @LastEditTime: 2021-04-27 16:52:10
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

  // 获取用户信息
  const getUserInfo = ctx => {
      const userController = require('@controllers').user;
      if (!ctx.headers.authorization) return {}
      let token = ctx.headers.authorization.split(' ')[1];
      return { token, ...userController.getUserInfoByToken({ token }) };
  }

  return async (ctx, next) => {
      ctx.send = render(ctx);
      ctx.sendError = renderError(ctx);
      ctx.userInfo =  getUserInfo(ctx);
      await next();
  }
}

module.exports = enhanceCtx;