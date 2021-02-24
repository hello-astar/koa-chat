/*
 * @Author: astar
 * @Date: 2021-02-04 18:01:08
 * @LastEditors: astar
 * @LastEditTime: 2021-02-24 14:25:21
 * @Description: 文件描述
 * @FilePath: \koa-chat\middlewares\handleError.js
 */
module.exports = function handleError () {
  const error = require('koa-json-error'); // 错误处理并返回json格式
  return error(function (err) {
    console.log('throw error=====', err);
    const mapError = {
      'e_400': '请求错误', // bad request
      'e_401': '未授权, 请重新登录', // unauthorized
      'e_403': '拒绝访问', // forbidden
      'e_405': '请求方法错误', // method not allow
      'e_422': '参数错误',
      'e_500': '服务器异常' // internal server error
    }
    let errStatus = err.status || err.statusCode || 500
    return {
      code: errStatus,
      msg: typeof err.message === 'String' ? err.message : mapError[`e_${errStatus}`] || '未知错误',
      data: null
    }
  });
}