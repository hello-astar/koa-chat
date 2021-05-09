/*
 * @author: astar
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: astar
 * @LastEditTime: 2021-05-09 10:21:48
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\user.js
 */
const jwt = require("jsonwebtoken");
const config = require('@config');
const privateDecrypt = require('@utils').privateDecrypt;
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const getModel = require('@models').getModel;
const userModel = getModel('usermodel');
const groupModel = getModel('groupmodel');

const user = {};

/**
 * 注册用户
 * @author astar
 * @date 2021-05-08 14:31
 */
user.register = async ctx => {
  ctx.verifyParams({
    userName: { type: 'string', required: true },
    avatar: { type: 'string', required: true },
    password: { type: 'string', required: true },
    captcha: { type: 'string', required: true }
  });
  
  const { userName, avatar, password, captcha } = ctx.request.body;
  
  if (process.env.NODE_ENV !== 'development') {
    if (captcha.toLowerCase() !== ctx.session.captcha.toLowerCase()) {
      return ctx.sendError('验证码错误');
    }
  }

  const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem')).toString('utf8');
  let originPassword = privateDecrypt(privateKey, 'astar', Buffer.from(password, 'base64'));
  const hash = crypto.createHash('sha256');
  // const pepper = 'astar'; // 服务器存一个固定盐，数据库存一个随机盐
  // let sha256Pass = hash.update(hash.update(password) + salt).digest('hex');
  let sha256Pass = hash.update(originPassword).digest('hex');
  try {
    let user = await userModel.create({ userName, avatar, password: sha256Pass });
    // 加入默认群组
    let defaultGroup = await groupModel.findOne({ isDefault: true });
    if (defaultGroup) {
      await groupModel.updateOne({ _id: defaultGroup._id }, { $addToSet: { 'members': user._id }});
    }
    ctx.send({
      _id: user._id,
      userName: user.userName,
      avatar: user.avatar,
      addTime: user.addTime
    });
  } catch (error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return ctx.sendError('该用户名已被占用');
    }
    if (error.name === 'ValidationError') {
      let firstKey = Object.keys(error.errors)[0];
      return ctx.sendError(error.errors[firstKey].message);
    }
    return ctx.sendError(error);
  };
}

user.login = async ctx => {
  ctx.verifyParams({
    userName: { type: 'string', required: true },
    password: { type: 'string', required: true },
    captcha: { type: 'string', required: true }
  });

  const { captcha, userName, password } = ctx.request.body;

  if (process.env.NODE_ENV !== 'development') {
    if (captcha.toLowerCase() !== ctx.session.captcha.toLowerCase()) {
      return ctx.sendError('验证码错误');
    }
  }
  
  const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem')).toString('utf8');
  let originPassword = privateDecrypt(privateKey, 'astar', Buffer.from(password, 'base64'));
  const hash = crypto.createHash('sha256');
  let sha256Pass = hash.update(originPassword).digest('hex');
  
  let user = await userModel.findOne({ userName, password: sha256Pass });
  if (!user) return ctx.sendError('当前用户不存在或密码错误');
  // 更新最后在线时间
  let lastOnlineTime = new Date();
  let token = jwt.sign({
      _id: user._id,
      userName: user.userName,
      avatar: user.avatar,
      lastOnlineTime
    },
    config.JWT_SECRET,
    { expiresIn: "24h" }
  );
  await userModel.updateOne({ _id: user._id }, { lastOnlineTime });
  return ctx.send({ token });
}

module.exports = user;
