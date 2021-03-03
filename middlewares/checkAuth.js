/*
 * @Author: astar
 * @Date: 2021-01-27 17:27:32
 * @LastEditors: astar
 * @LastEditTime: 2021-03-03 17:28:24
 * @Description: 互踢
 * @FilePath: \koa-chat\middlewares\checkAuth.js
 */
module.exports = function checkAuth () {
  const userController = require('@controllers').user;
  return async function (ctx, next) {
    if (ctx.headers.authorization) {
      const token = ctx.headers.authorization.split(' ')[1];
      const userInfoByToken = userController.getUserInfoByToken({ token });
      const userInfo = await userController.getUserInfoById({ _id: userInfoByToken._id });
      if(new Date(userInfoByToken.lastOnlineTime).getTime() !== new Date(userInfo.lastOnlineTime).getTime()) {
        ctx.throw(401);
      } else {
        await next();
      }
    } else {
      await next();
    }
  }
}