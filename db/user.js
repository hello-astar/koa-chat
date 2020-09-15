/*
 * @author: cmx
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: cmx
 * @LastEditTime: 2020-09-15 17:22:58
 * @Description: 文件描述
 * @FilePath: \koa-chat\db\user.js
 */
const mongoose = require('./connect');
const { Schema, model } = mongoose;

const userSchema = new Schema({
  uuid: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  avatar: { type: String, required: true },
  addTime: { type: Date, default: Date.now }
});

const UserModel = model('userModel', userSchema);

class UserController {
  constructor () {}

  // 新增
  add ({ uuid, name, avatar }) {
    return new Promise((resolve, reject) => {
      const userModel = new UserModel({ uuid, name, avatar });
      userModel.save(function(err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
  // 查询
  query (obj) {
     return new Promise((resolve, reject) => {
      UserModel.find(obj, (err, res) => {
         if(err) {
           reject(err);
         } else {
           resolve(res);
         }
       });
     });
  }
}

module.exports = new UserController();
