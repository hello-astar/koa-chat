/*
 * @author: cmx
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: cmx
 * @LastEditTime: 2020-09-15 17:40:32
 * @Description: 后期扩展，展示用不上数据库
 * @FilePath: \koa-chat\db\connect.js
 */
const { host, port, dbName } = require('../config').DATABASE;
const mongoose = require('mongoose');


mongoose.connect(`mongodb://${host}:${port}/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

mongoose.connection.on('connected', function () {
  console.log('连接上数据库了')
});

mongoose.connection.on('error', function (err) {
  console.log('连接数据库出错', err)
});

mongoose.connection.on('disconnected', function () {
  console.log('断开数据库连接了')
});

module.exports = mongoose;