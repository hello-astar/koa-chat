/*
 * @Author: astar
 * @Date: 2021-02-06 15:44:30
 * @LastEditors: astar
 * @LastEditTime: 2021-06-16 10:27:15
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\chat.js
 */
const Router = require('koa-router');
const router = new Router();
const chatController = require('@controllers').chat;

router.post('/getHistoryChatByCount', chatController.getHistoryChatByCount);

module.exports = router.routes();