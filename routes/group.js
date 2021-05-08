/*
 * @Author: astar
 * @Date: 2021-04-19 13:58:06
 * @LastEditors: astar
 * @LastEditTime: 2021-05-08 18:07:54
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\group.js
 */
const Router = require('koa-router');
const router = new Router();
const groupController = require('@controllers').group;
const saveController = require('@controllers').save;
const queryController = require('@controllers').query;

router.get('/getGroupAvatar', queryController.getGroupAvatar);
router.post('/getRecentContacts', queryController.getRecentContacts);
router.get('/getGroupInfo', queryController.getGroupInfo);


router.get('/getGroups', async ctx => {
  const { _id } = ctx.userInfo;
  let res = await groupController.getGroups({ userId: _id });
  ctx.send(res);
});

router.post('/updateGroupNameByGroupId', async ctx => {
  const { groupId, groupName } = ctx.request.body;
  let res = await groupController.updateGroupNameByGroupId({ groupId, groupName });
  ctx.send(res);
});
router.post('/addGroup', saveController.addGroup);
router.post('/joinMemberToGroup', saveController.joinMemberToGroup);

module.exports = router.routes();
