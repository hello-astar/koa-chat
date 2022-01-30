/*
 * @author: astar
 * @Date: 2021-01-26 17:39:28
 * @LastEditors: astar
 * @LastEditTime: 2022-01-30 19:47:27
 * @Description: 增强context对象
 * @FilePath: \koa-chat\middlewares\enhanceCtx.js
 */
const jwt = require("jsonwebtoken");
const config = require('@config');

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
  const getUserInfoByToken = ctx => {
    try {
      if (!ctx.headers.authorization) return {}
      let token = ctx.headers.authorization.split(' ')[1];
      return { token, ...jwt.verify(token, config.JWT_SECRET) };
    } catch (e) {
      return null
    }
  }

  return async (ctx, next) => {
    ctx.send = render(ctx);
    ctx.sendError = renderError(ctx);
    ctx.userInfo = getUserInfoByToken(ctx);
    await next();
  }
}

module.exports = enhanceCtx;