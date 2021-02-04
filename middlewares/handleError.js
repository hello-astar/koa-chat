/*
 * @Author: astar
 * @Date: 2021-02-04 18:01:08
 * @LastEditors: astar
 * @LastEditTime: 2021-02-04 18:15:40
 * @Description: 文件描述
 * @FilePath: \koa-chat\middlewares\handleError.js
 */
module.exports = function handleError () {
  const error = require('koa-json-error'); // 错误处理并返回json格式
  return error(function (err) {
    console.log('format-error', err)
    return {
      result: err.status,
      msg: err.message,
      data: null
    }
  });
}