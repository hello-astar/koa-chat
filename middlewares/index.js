/*
 * @author: astar
 * @Date: 2021-01-26 17:50:33
 * @LastEditors: astar
 * @LastEditTime: 2021-02-04 18:08:07
 * @Description: 文件描述
 * @FilePath: \koa-chat\middlewares\index.js
 */
const handleResponse = require('./handleResponse');
const setWhiteList = require('./setWhiteList');
const checkAuth = require('./checkAuth');
const logger = require('./logger');
const handleError = require('./handleError');


module.exports = {
  handleResponse,
  setWhiteList,
  checkAuth,
  logger,
  handleError
}