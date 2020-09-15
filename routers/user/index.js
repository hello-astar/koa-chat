/*
 * @Description: 
 * @Author: astar
 * @Date: 2020-09-09 20:53:41
 * @LastEditTime: 2020-09-15 18:10:29
 * @LastEditors: cmx
 */
const Router = require('koa-router');
const { user, response } = require('../../model');
const { successModel, errorModel } = response;
const { onlineUserModel } = user;
let userController = require('../../db/user');


let router = new Router();

// 注册
router.post('/register', async ctx => {
  ctx.verifyParams({
    name: { type: 'string', required: true },
    avatar: { type: 'string', required: true  }
  })
  const { name, avatar } = ctx.request.body;
  let user = new onlineUserModel({ name, avatar });
  try {
    let res = await userController.add(user);
    ctx.response.body = new successModel({
      data: res
    });
  } catch (e) {
    ctx.response.body = new errorModel({
      msg: '注册失败'
    });
  }
});

// 登录页面
router.post('/login', async ctx => {
  // ctx.verifyParams({
  //   uuid: { type: 'string', required: true }
  // })
  const { name } = ctx.request.body;
  try {
    let res = await userController.query({ name });
    if (res.length === 1) {
      ctx.response.body = new successModel({
        data: res[0]
      });
    } else {
      ctx.response.body = new errorModel({
        msg: '登录失败'
      });
    }
  } catch (e) {
    ctx.response.body = new errorModel({
      msg: '登录失败'
    });
  }
});


module.exports = router.routes();
