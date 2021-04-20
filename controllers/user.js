/*
 * @author: astar
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: astar
 * @LastEditTime: 2021-04-20 14:30:57
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\user.js
 */
const jwt = require("jsonwebtoken");
const config = require('@config');
const privateDecrypt = require('@utils').privateDecrypt;
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const UserModel = require('@models').getModel('usermodel');

class UserController {
  constructor () {
    this.Model = UserModel;
  }

  /**
   * 注册
   * @author astar
   * @date 2021-03-03 17:25
   */
  register ({ userName, avatar, password }) {
    const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem')).toString('utf8');
    let originPassword = privateDecrypt(privateKey, 'astar', Buffer.from(password, 'base64'));
    const hash = crypto.createHash('sha256');
    // const pepper = 'astar'; // 服务器存一个固定盐，数据库存一个随机盐
    // let sha256Pass = hash.update(hash.update(password) + salt).digest('hex');
    let sha256Pass = hash.update(originPassword).digest('hex');
    return this.Model.create({ userName, avatar, password: sha256Pass }).then(res => {
      return {
        _id: res._id,
        userName: res.userName,
        avatar: res.avatar,
        addTime: res.addTime
      };
    }).catch((error) => {
      if (error.name === 'MongoError' && error.code === 11000) {
        return Promise.reject('该用户名已被占用');
      }
      if (error.name === 'ValidationError') {
        let firstKey = Object.keys(error.errors)[0];
        return Promise.reject(error.errors[firstKey].message);
      }
      return Promise.reject(error);
    });
  }

  /**
   * 登录
   * @author astar
   * @date 2021-03-03 17:25
   */
  login ({ userName, password }) {
    const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem')).toString('utf8');
    let originPassword = privateDecrypt(privateKey, 'astar', Buffer.from(password, 'base64'));
    const hash = crypto.createHash('sha256');
    let sha256Pass = hash.update(originPassword).digest('hex');
    
    return this.Model.findOne({ userName, password: sha256Pass }).then(async res => {
      if (res) {
        let lastOnlineTime = new Date();
        let token = jwt.sign({
            _id: res._id,
            userName,
            avatar: res.avatar,
            lastOnlineTime
          },
          config.JWT_SECRET,
          { expiresIn: "24h" }
        );
        // 更新最后在线时间
        await this.Model.updateOne({ _id: res._id }, { lastOnlineTime });
        return { token };
      }
      return Promise.reject('当前用户不存在或密码错误');
    }).catch(e => {
      return Promise.reject(e);
    });
  }

  /**
   * 根据token获取用户信息
   * @author astar
   * @date 2021-03-03 17:15
   */
  getUserInfoByToken ({ token }) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (e) {
      console.log('get_user_info_error: ', e);
      return null;
    }
  }

  /**
   * 根据id查询数据库获取用户信息
   * @author astar
   * @date 2021-03-03 17:16
   */
  getUserInfoById ({ _id }) {
    return this.Model.findOne({ _id });
  }
};

module.exports = new UserController();
