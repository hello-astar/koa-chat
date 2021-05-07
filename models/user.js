/*
 * @Author: astar
 * @Date: 2021-02-05 15:27:30
 * @LastEditors: astar
 * @LastEditTime: 2021-05-07 22:40:03
 * @Description: 用户表
 * @FilePath: \koa-chat\models\user.js
 */

module.exports = {
  name: 'usermodel',
  schema: {
    isAdmin: {
      type: Boolean,
      default: false
    },
    userName: {
      type: String,
      required: [true, '用户名不能为空'],
      unique: true, // The unique Option is Not a Validator
      validate: {
        validator: (value) => /^[0-9a-zA-Z_\u4e00-\u9eff]{1,8}$/.test(value), // 1-8位字母数字下划线汉字
        message: '用户名存在非法字符或长度过长'
      }
    },
    password: { type: String, required: [true, '密码不能为空'] },
    avatar: { type: String, required: [true, '用户头像不能为空'] },
    addTime: { type: Date, default: Date.now },
    lastOnlineTime: { type: Date, default: Date.now }
  }
};