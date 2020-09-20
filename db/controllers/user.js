/*
 * @author: cmx
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: astar
 * @LastEditTime: 2020-09-21 01:28:25
 * @Description: 文件描述
 * @FilePath: \koa-chat\db\controllers\user.js
 */
const mongoose = require('../connect');
const { Schema, model } = mongoose;
const BaseController = require('./base');
const jwt = require("jsonwebtoken");
const config = require('../../config');

const userSchema = new Schema({
  uuid: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  avatar: { type: String, required: true },
  addTime: { type: Date, default: Date.now }
});

const UserModel = model('userModel', userSchema);

class UserController extends BaseController {
  constructor () {
    super(UserModel);
  }

  register ({ uuid, name, avatar, password}) {
    return this.add({ uuid, name, avatar, password }).then(res => {
      return res;
    }, _ => {
      if (_.code === 11000) {
        return Promise.reject('该名称已存在');
      }
      return Promise.reject(_);
    });
  }

  login ({ name, password }) {
    return this.query({ name, password }).then(res => {
      if (res.length === 1) {
        let token = jwt.sign({
            name,
            avatar: res[0].avatar,
            uuid: res[0].uuid
          },
          config.JWT_SECRET,
          { expiresIn: "24h" }
        );
        return { token };
      };
      return Promise.reject('当前用户不存在');
    }, _ => {
      return Promise.reject('内部错误');
    }).catch(e => {
      return Promise.reject('内部错误');
    });
  }

  getUserInfo ({ token }) {
    try {
      let { name, avatar, uuid } = jwt.verify(token, config.JWT_SECRET);
      return { name, avatar, uuid };
    } catch (e) {
      return Promise.reject('内部错误');
    }
  }
};

module.exports = new UserController();
