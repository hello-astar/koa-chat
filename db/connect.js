/*
 * @author: cmx
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: cmx
 * @LastEditTime: 2020-09-14 15:53:36
 * @Description: 后期扩展，展示用不上数据库
 * @FilePath: \koa-chat\db\connect.js
 */
const { host, port } = require('../config').DATABASE;
const mongoose = require('mongoose');


mongoose.connect(`mongodb://${host}:${port}/local`);

mongoose.connection.on('connected', function () {
  console.log('连接上数据库了')
});

mongoose.connection.on('error', function (err) {
  console.log('连接出错', err)
});

mongoose.connection.on('disconnected', function () {
  console.log('断开连接了')
});

module.exports = mongoose;