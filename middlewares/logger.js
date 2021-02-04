/*
 * @Author: astar
 * @Date: 2021-02-04 17:48:06
 * @LastEditors: astar
 * @LastEditTime: 2021-02-04 18:18:55
 * @Description: logger中间件
 * @FilePath: \koa-chat\middlewares\logger.js
 */
module.exports = function logger () {
  const logger = require('koa-logger');
  const Moment = require("moment");
  return logger(str => {
    console.log(Moment().format('YYYY-MM-DD HH:mm:ss')+str);
  });
}