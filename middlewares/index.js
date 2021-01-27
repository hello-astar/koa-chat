/*
 * @author: cmx
 * @Date: 2021-01-26 17:50:33
 * @LastEditors: cmx
 * @LastEditTime: 2021-01-27 10:32:08
 * @Description: 文件描述
 * @FilePath: \koa-chat\middlewares\index.js
 */
const handleResponse = require('./handleResponse');
const setWhiteList = require('./setWhiteList');

module.exports = {
  handleResponse,
  setWhiteList
}