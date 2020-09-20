/*
 * @Description: 
 * @Author: astar
 * @Date: 2020-09-09 20:53:41
 * @LastEditTime: 2020-09-21 01:04:02
 * @LastEditors: astar
 */
const Router = require('koa-router');
const { user, response } = require('../../model');
const { successModel, errorModel } = response;
const { onlineUserModel } = user;
let { userController } = require('../../db');
let router = new Router();

async function dealWithRes (ctx, callback) {
  try {
    let res = await callback();
    ctx.response.body = new successModel({
      data: res
    });
  } catch (e) {
    console.log(e)
    ctx.response.body = new errorModel({
      msg: e
    });
  }
}
// 注册
router.post('/register', async ctx => {
  ctx.verifyParams({
    name: { type: 'string', required: true },
    avatar: { type: 'string', required: true  },
    password: { type: 'string', required: true }
  });
  const { name, avatar, password } = ctx.request.body;
  let user = new onlineUserModel({ name, avatar });
  return dealWithRes(ctx, userController.register.bind(userController, { uuid: user.uuid, name, avatar, password }));
});

// 登录页面
router.post('/login', ctx => {
  ctx.verifyParams({
    name: { type: 'string', required: true },
    password: { type: 'string', required: true }
  });
  const { name, password } = ctx.request.body;
  return dealWithRes(ctx, userController.login.bind(userController, { ctx, name, password }));
});

// 获取用户信息
router.post('/getUserInfo', ctx => {
  return dealWithRes(ctx, userController.getUserInfo.bind(userController, { token: ctx.headers.authorization.split(' ')[1] }))
})
module.exports = router.routes();
