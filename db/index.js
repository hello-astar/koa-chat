/*
 * @author: cmx
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: cmx
 * @LastEditTime: 2020-09-14 16:38:04
 * @Description: 文件描述
 * @FilePath: \koa-chat\db\index.js
 */
const mongoose = require('./connect');
const Schema = mongoose.Schema;

const ceshiSchema = new Schema({
  title: String,
  body: String,
  date: Date
});

const MyModel = mongoose.model('ceshi', ceshiSchema);


class Mongodb {
  constructor () {

  }
// 查询
  query () {
     return new Promise((resolve, reject) => {
       MyModel.find({}, (err, res) => {
         if(err) {
           reject(err)
         }
         resolve(res)
       })
     })
  }
// 保存
  save (obj) {
     const m = new MyModel(obj)
     return new Promise((resolve, reject)=> {
       m.save((err, res) => {
         if (err) {
           reject(err)
         }
         resolve(res)
         console.log(res)
       })
     })
     
  }
}
module.exports = new Mongodb();
