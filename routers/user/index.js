/*
 * @Description: 
 * @Author: astar
 * @Date: 2020-09-09 20:53:41
 * @LastEditTime: 2020-09-14 10:20:47
 * @LastEditors: cmx
 */
const Router = require('koa-router');
const { user, response } = require('../../model');
const { onlineUserModel } = user;
const { successModel } = response;
let userList = require('../../onlineList').userList;


let router = new Router();
// 登录页面
router.post('/login', async ctx => {
  const { name, avatar } = ctx.request.body;
  let user = new onlineUserModel({ name, avatar });
  userList.push(user);

  ctx.response.body = new successModel({
    data: { uuid: user.uuid }
  })
});


module.exports = router.routes();
