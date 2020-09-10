/*
 * @Description: 
 * @Author: astar
 * @Date: 2020-09-09 20:53:41
 * @LastEditTime: 2020-09-10 18:28:12
 * @LastEditors: cmx
 */
const Router = require('koa-router');
let router = new Router();
const onlineUser = require('../../model').user.onlineUser;
let userList = require('../../onlineList').userList;

// 登录页面
router.post('/login', async ctx => {
  const { name, avatar } = ctx.request.body;
  let user = new onlineUser({ name, avatar });
  userList.push(user);

  ctx.response.body = {
    result: 1,
    msg: 'success',
    data: {
      uuid: user.uuid
    }
  }
});


module.exports = router.routes();
