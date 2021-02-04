/*
 * @author: astar
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: astar
 * @LastEditTime: 2021-02-04 18:23:11
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\user.js
 */
const mongoose = require('../db/connect');
const { Schema, model } = mongoose;
const BaseController = require('./base');
const jwt = require("jsonwebtoken");
const config = require('../config');
const privateDecrypt = require('../utils').privateDecrypt;
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const userSchema = new Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, required: true },
  addTime: { type: Date, default: Date.now },
  lastOnlineTime: { type: Date, default: Date.now }
});

const UserModel = model('userModel', userSchema);

class UserController extends BaseController {
  constructor () {
    super(UserModel);
  }

  register (registerData) {
    const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem')).toString('utf8');
    let { name, avatar, password } = privateDecrypt(privateKey, 'astar', Buffer.from(registerData, 'base64'));
    const hash = crypto.createHash('sha256');
    // const pepper = 'astar'; // 服务器存一个固定盐，数据库存一个随机盐
    // let sha256Pass = hash.update(hash.update(password) + salt).digest('hex');
    let sha256Pass = hash.update(password).digest('hex');
    return this.add({ name, avatar, password: sha256Pass }).then(res => {
      return res;
    }, _ => {
      console.log('register_error: ', _)
      if (_.code === 11000) {
        return Promise.reject('该名称已存在');
      }
      return Promise.reject(_);
    });
  }

  login (loginData) {
    const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem')).toString('utf8');
    let { name, password } = privateDecrypt(privateKey, 'astar', Buffer.from(loginData, 'base64'));
    const hash = crypto.createHash('sha256');
    let sha256Pass = hash.update(password).digest('hex');
    
    return this.query({ name, password: sha256Pass }).then(res => {
      if (res) {
        let lastOnlineTime = new Date();
        let token = jwt.sign({
            _id: res._id,
            name,
            avatar: res.avatar,
            lastOnlineTime
          },
          config.JWT_SECRET,
          { expiresIn: "24h" }
        );
        // 更新最后在线时间
        this.update({ _id: res._id }, { lastOnlineTime });
        return { token };
      }
      return Promise.reject('当前用户不存在或密码错误');
    }, _ => {
      console.log('login_error: ', _)
      return Promise.reject('内部错误');
    }).catch(e => {
      console.log('login_error: ', e)
      return Promise.reject(e);
    });
  }

  getUserInfoByToken ({ token }) {
    try {
      let { _id, name, avatar, lastOnlineTime } = jwt.verify(token, config.JWT_SECRET);
      return { _id, name, avatar, lastOnlineTime };
    } catch (e) {
      console.log('get_user_info_error: ', e)
      return Promise.reject(e);
    }
  }
};

module.exports = new UserController();
