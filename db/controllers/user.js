/*
 * @author: cmx
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: astar
 * @LastEditTime: 2020-09-16 20:41:23
 * @Description: 文件描述
 * @FilePath: \koa-chat\db\controllers\user.js
 */
const mongoose = require('../connect');
const { Schema, model } = mongoose;
const BaseController = require('./base');


const userSchema = new Schema({
  uuid: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  avatar: { type: String, required: true },
  addTime: { type: Date, default: Date.now }
});

const UserModel = model('userModel', userSchema);

class UserController extends BaseController {
  constructor () {
    super(UserModel);
  }

  register ({ name, avatar, uuid}) {
    return this.add({ name, avatar, uuid }).then(res => {
      return res;
    }, _ => {
      if (_.code === 11000) {
        return Promise.reject('该名称已存在');
      }
      return Promise.reject(_);
    });
  }

  login ({ name }) {
    return this.query({ name }).then(res => {
      if (res.length === 1) return res[0];
      return Promise.reject('当前用户不存在');
    }, _ => {
      return Promise.reject('内部错误');
    });
  }

  getUserInfo (uuid) {
    return new Promise((resolve, reject) => {
      this.query({ uuid })
    })
  }
};

module.exports = new UserController();
