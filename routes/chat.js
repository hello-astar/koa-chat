/*
 * @Author: astar
 * @Date: 2021-02-06 15:44:30
 * @LastEditors: astar
 * @LastEditTime: 2021-05-09 19:56:16
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\chat.js
 */
const Router = require('koa-router');
const router = new Router();
const chatController = require('@controllers').chat;

router.get('/getHistoryChatByCount', chatController.getHistoryChatByCount);

module.exports = router.routes();