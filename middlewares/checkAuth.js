/*
 * @Author: astar
 * @Date: 2021-01-27 17:27:32
 * @LastEditors: astar
 * @LastEditTime: 2021-04-19 14:09:30
 * @Description: 互踢
 * @FilePath: \koa-chat\middlewares\checkAuth.js
 */
module.exports = function checkAuth () {
  return async function (ctx, next) {
    const { NOT_NEED_TOKEN_PATH_REGS } = require('@config');
    const userController = require('@controllers').user;
    for (let reg of NOT_NEED_TOKEN_PATH_REGS) {
      if (reg.test(ctx.url)) {
        return await next();
      }
    }
    const userInfoByToken = userController.getUserInfoByToken({ token: ctx.token });
    const userInfo = await userController.getUserInfoById({ _id: userInfoByToken._id });
    if(new Date(userInfoByToken.lastOnlineTime).getTime() !== new Date(userInfo.lastOnlineTime).getTime()) {
      ctx.throw(401);
    } else {
      await next();
    }
  }
}