/*
 * @author: astar
 * @Date: 2021-01-26 17:50:33
 * @LastEditors: astar
 * @LastEditTime: 2021-01-27 17:29:52
 * @Description: 文件描述
 * @FilePath: \koa-chat\middlewares\index.js
 */
const handleResponse = require('./handleResponse');
const setWhiteList = require('./setWhiteList');
const checkAuth = require('./checkAuth');

module.exports = {
  handleResponse,
  setWhiteList,
  checkAuth
}