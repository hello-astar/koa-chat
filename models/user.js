/*
 * @Author: astar
 * @Date: 2021-02-05 15:27:30
 * @LastEditors: astar
 * @LastEditTime: 2021-02-05 16:51:44
 * @Description: 用户表
 * @FilePath: \koa-chat\models\user.js
 */

module.exports = {
  name: 'usermodel',
  schema: {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, required: true },
    addTime: { type: Date, default: Date.now },
    lastOnlineTime: { type: Date, default: Date.now }
  }
};