/*
 * @Author: astar
 * @Date: 2021-02-04 18:01:08
 * @LastEditors: astar
 * @LastEditTime: 2021-02-21 14:42:55
 * @Description: 文件描述
 * @FilePath: \koa-chat\middlewares\handleError.js
 */
module.exports = function handleError () {
  const error = require('koa-json-error'); // 错误处理并返回json格式
  return error(function (err) {
    console.log('throw error=====', err);
    const mapError = {
      'e_401': '登录过期, 请重新登录',
      'e_422': '参数错误',
      'e_500': '服务器异常'
    }
    return {
      result: err.status,
      msg: typeof err.message === 'String' ? err.message : mapError[`e_${err.status}`] || '未知错误',
      data: null
    }
  });
}