/*
 * @Author: astar
 * @Date: 2021-05-08 17:47:11
 * @LastEditors: astar
 * @LastEditTime: 2021-05-09 10:38:09
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\tool.js
 */
const Router = require('koa-router');
const router = new Router();
const toolController = require('@controllers').tool;

router.get('/getCaptcha', toolController.createCaptcha);
router.get('/getQiuniuToken', toolController.getQiniuToken);
router.get('/searchGifs', toolController.getBaiduImage);

module.exports = router.routes();