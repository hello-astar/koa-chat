/*
 * @Author: astar
 * @Date: 2021-04-19 13:58:06
 * @LastEditors: astar
 * @LastEditTime: 2021-05-09 20:02:37
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\group.js
 */
const Router = require('koa-router');
const router = new Router();
const groupController = require('@controllers').group;

router.get('/getGroupAvatar', groupController.getGroupAvatar);
router.get('/getGroupInfo', groupController.getGroupInfo);

router.post('/updateGroupNameByGroupId', groupController.updateGroupNameByGroupId);
router.post('/addGroup', groupController.addGroup);
router.post('/joinMemberToGroup', groupController.joinMemberToGroup);
router.post('/exitGroup', groupController.exitGroup);

module.exports = router.routes();
