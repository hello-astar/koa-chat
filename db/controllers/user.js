/*
 * @author: cmx
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: cmx
 * @LastEditTime: 2020-11-20 13:47:57
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
      console.log('register_error: ', _)
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
      return Promise.reject('当前用户不存在或密码错误');
    }, _ => {
      console.log('login_error: ', _)
      return Promise.reject('内部错误');
    }).catch(e => {
      console.log('login_error: ', e)
      return Promise.reject(e);
    });
  }

  getUserInfo ({ token }) {
    try {
      let { name, avatar, uuid } = jwt.verify(token, config.JWT_SECRET);
      return { name, avatar, uuid };
    } catch (e) {
      console.log('get_user_info_error: ', e)
      return Promise.reject(e);
    }
  }
};

module.exports = new UserController();
