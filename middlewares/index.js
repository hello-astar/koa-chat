/*
 * @author: astar
 * @Date: 2021-01-26 17:50:33
 * @LastEditors: astar
 * @LastEditTime: 2021-02-05 15:43:02
 * @Description: 文件描述
 * @FilePath: \koa-chat\middlewares\index.js
 */
const fs = require('fs');
const files = fs.readdirSync(__dirname).filter(file => file !== 'index.js');

let middlewares = {};
for (const file of files) {
  if (file.toLowerCase().endsWith('js')) {
    const middleware = require(`./${file}`);
    middlewares[`${file.replace(/\.js/, '')}`] = middleware;
  }
}

module.exports = middlewares;