/*
 * @Description: 
 * @Author: astar
 * @Date: 2020-09-09 20:53:41
 * @LastEditTime: 2020-09-16 15:21:25
 * @LastEditors: cmx
 */
const Router = require('koa-router');
const { user, response } = require('../../model');
const { successModel, errorModel } = response;
const { onlineUserModel } = user;
let { userController } = require('../../db');


let router = new Router();

async function dealWithRes (ctx, callback, params) {
  try {
    let res = await callback(params);
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
    avatar: { type: 'string', required: true  }
  })
  const { name, avatar } = ctx.request.body;
  let user = new onlineUserModel({ name, avatar });
  return dealWithRes(ctx, userController.register.bind(userController), { uuid: user.uuid, name, avatar });
});

// 登录页面
router.post('/login', ctx => {
  ctx.verifyParams({
    name: { type: 'string', required: true }
  })
  const { name } = ctx.request.body;
  return dealWithRes(ctx, userController.login.bind(userController), { name });
});


module.exports = router.routes();
