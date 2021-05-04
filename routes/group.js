/*
 * @Author: astar
 * @Date: 2021-04-19 13:58:06
 * @LastEditors: astar
 * @LastEditTime: 2021-05-04 20:23:34
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\group.js
 */
const Router = require('koa-router');
const router = new Router();
const groupController = require('@controllers').group;
const userController = require('@controllers').user;

router.get('/getGroups', async ctx => {
  const { _id } = ctx.userInfo;
  let res = await groupController.getGroups({ userId: _id });
  ctx.send(res);
});

router.post('/addGroup', async ctx => {
  ctx.verifyParams({
    groupName: { type: 'string', required: true }
  });
  const { groupName } = ctx.request.body;
  let { _id } = ctx.userInfo;
  let res = await groupController.createGroup({ groupName, groupOwner: _id, members: [_id] });
  ctx.send(res);
});

router.get('/getGroupInfoByGroupId', async ctx => {
  ctx.verifyParams({
    groupId: { type: 'string', required: true }
  });

  const { groupId } = ctx.query;
  let res = await groupController.getGroupInfoByGroupId({ groupId });
  ctx.send(res);
});

router.post('/updateGroupNameByGroupId', async ctx => {
  const { groupId, groupName } = ctx.request.body;
  let res = await groupController.updateGroupNameByGroupId({ groupId, groupName });
  ctx.send(res);
});

router.post('/joinMember', async ctx => {
  const { userId, groupId } = ctx.request.body;
  // 判断用户是否存在
  let user = await userController.getUserInfoById({ _id: userId });
  if (!user) {
    return ctx.sendError('请输入正确用户ID');
  }
  let res = await groupController.joinMember({ groupId, userId });
  ctx.send(res);
})

router.post('/exitGroup', async ctx => {
  const { groupId } = ctx.request.body;
  let { _id } = ctx.userInfo;
  await groupController.exitGroupByUserId({ userId: _id, groupId });
  ctx.send();
})
module.exports = router.routes();
