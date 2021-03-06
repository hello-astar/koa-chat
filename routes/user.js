/*
 * @Author: astar
 * @Date: 2021-02-06 15:43:45
 * @LastEditors: astar
 * @LastEditTime: 2021-07-05 15:09:12
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\user.js
 */
const Router = require('koa-router');
const router = new Router();
const userController = require('@controllers').user;

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/editUser', userController.editUser);
router.get('/getUserInfoByToken', ctx => {
  ctx.send(ctx.userInfo);
});
router.get('/getUserDetail', userController.getUserDetail);
router.post('/getRecentContacts', userController.getRecentContacts);
router.post('/addFriend', userController.addFriend);
router.get('/getMyGroups', userController.getMyGroups);
router.get('/getMyFriends', userController.getMyFriends);
router.post('/checkIsMyFriend', userController.checkIsMyFriend);
module.exports = router.routes();
