/*
 * @Author: astar
 * @Date: 2021-02-06 15:43:45
 * @LastEditors: astar
 * @LastEditTime: 2021-05-08 18:11:51
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\user.js
 */
const Router = require('koa-router');
const router = new Router();
const userController = require('@controllers').user;
const queryController = require('@controllers').query;

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/getUserInfo', ctx => {
  ctx.send(ctx.userInfo);
});
router.get('/getRecentContacts', queryController.getRecentContacts);

module.exports = router.routes();
