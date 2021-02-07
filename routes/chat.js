/*
 * @Author: astar
 * @Date: 2021-02-06 15:44:30
 * @LastEditors: astar
 * @LastEditTime: 2021-02-07 10:14:06
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\chat.js
 */
const Router = require('koa-router');
const router = new Router();
const chatController = require('@controllers').chat;

router.get('/getHistoryChatByCount', async ctx => {
  ctx.verifyParams({
    exitsCount: { type: 'string', required: true },
    fetchCount: { type: 'string', required: true }
  });

  const { exitsCount, fetchCount } = ctx.query;
  try {
    let res = await chatController.getHistoryChatByCount({ exitsCount: Number(exitsCount), fetchCount: Number(fetchCount) });
    ctx.send(res);
  } catch (e) {
    ctx.sendError(e);
  }
});

module.exports = router.routes();