/*
 * @Author: astar
 * @Date: 2021-01-27 17:27:32
 * @LastEditors: astar
 * @LastEditTime: 2021-05-08 15:04:38
 * @Description: 互踢
 * @FilePath: \koa-chat\middlewares\checkAuth.js
 */
module.exports = function checkAuth () {
  return async function (ctx, next) {
    const { NOT_NEED_TOKEN_PATH_REGS } = require('@config');
    const userModel = require('@models').getModel('usermodel');
    for (let reg of NOT_NEED_TOKEN_PATH_REGS) {
      if (reg.test(ctx.url)) {
        return await next();
      }
    }
    const userInfoByToken = ctx.userInfo;
    const userInfo = await userModel.findOne({ _id: userInfoByToken._id });
    if (!userInfo) ctx.throw(401);
    if(new Date(userInfoByToken.lastOnlineTime).getTime() !== new Date(userInfo.lastOnlineTime).getTime()) {
      ctx.throw(401);
    } else {
      await next();
    }
  }
}