/*
 * @Author: astar
 * @Date: 2021-02-05 15:28:02
 * @LastEditors: astar
 * @LastEditTime: 2021-02-05 15:58:19
 * @Description: 连接数据库
 * @FilePath: \koa-chat\models\index.js
 */
const { host, port, dbName } = require('@config').DATABASE;
const mongoose = require('mongoose');
const Moment = require("moment");
const fs = require('fs');
const path = require('path');

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

let db = {
  mongoose,
  models: {}
};
// 整合models文件下的其它js文件
fs.readdirSync(__dirname).filter(file => file !== 'index.js').forEach(file => {
  let modelFile = require(path.join(__dirname, file));
  let schema = new mongoose.Schema(modelFile.schema);
  db.models[modelFile.name] = mongoose.model(modelFile.name, schema);
});

db.getModel = (name) => db.models[name];

module.exports = db;