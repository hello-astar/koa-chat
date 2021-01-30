/*
 * @author: astar
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: astar
 * @LastEditTime: 2021-01-30 11:37:19
 * @Description: 后期扩展，展示用不上数据库
 * @FilePath: \koa-chat\db\connect.js
 */
const { host, port, dbName } = require('../config').DATABASE;
const mongoose = require('mongoose');
const Moment = require("moment");

mongoose.connect(`mongodb://${host}:${port}/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

mongoose.connection.on('connected', function () {
  console.log(Moment().format('YYYY-MM-DD HH:mm:ss'), ' [Mongoose] 连接上数据库了')
});

mongoose.connection.on('error', function (err) {
  console.log(Moment().format('YYYY-MM-DD HH:mm:ss'), ' [Mongoose] 连接数据库出错', err)
});

mongoose.connection.on('disconnected', function () {
  console.log(Moment().format('YYYY-MM-DD HH:mm:ss'), ' [Mongoose] 断开数据库连接了')
});

module.exports = mongoose;