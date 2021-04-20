/*
 * @Author: astar
 * @Date: 2021-04-19 13:58:06
 * @LastEditors: astar
 * @LastEditTime: 2021-04-20 14:20:01
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\group.js
 */
const Router = require('koa-router');
const router = new Router();
const groupController = require('@controllers').group;

router.get('/getGroups', async ctx => {
  const { _id } = ctx.userInfo;
  let res = await groupController.getGroups({ receiverId: _id });
  ctx.send(res);
});

router.post('/addGroup', async ctx => {
  ctx.verifyParams({
    groupName: { type: 'string', required: true }
  });
  const { groupName } = ctx.request.body;
  let { _id } = ctx.userInfo;
  let res = await groupController.createGroup({ groupName, groupOwnerId: _id, members: [_id] });
  ctx.send(res);
})

module.exports = router.routes();
