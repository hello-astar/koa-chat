/*
 * @author: astar
 * @Date: 2020-09-09 14:18:07
 * @LastEditors: astar
 * @LastEditTime: 2021-02-06 15:57:57
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\index.js
 */
// todo 获取文件夹中的路由并自动注册
const fs = require('fs');
const Router = require('koa-router');
const router = new Router();

fs.readdirSync(__dirname).filter(file => file !== 'index.js').forEach(file => {
  if (file.toLowerCase().endsWith('js')) {
    router.use(`/${file.replace(/\.js/, '')}`, require(`./${file}`));
  }
})

module.exports = router;