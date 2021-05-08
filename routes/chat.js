/*
 * @Author: astar
 * @Date: 2021-02-06 15:44:30
 * @LastEditors: astar
 * @LastEditTime: 2021-05-08 18:12:09
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\chat.js
 */
const Router = require('koa-router');
const router = new Router();
const queryController = require('@controllers').query;

router.get('/getHistoryChatByCount', queryController.getHistoryChatByCount);

module.exports = router.routes();