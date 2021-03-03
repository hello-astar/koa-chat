/*
 * @Author: astar
 * @Date: 2021-02-05 15:27:35
 * @LastEditors: astar
 * @LastEditTime: 2021-03-03 16:45:36
 * @Description: 聊天记录表
 * @FilePath: \koa-chat\models\chat.js
 */
module.exports = {
  name: 'chatmodel',
  schema: {
    userId: { type: String, required: true },
    avatar: { type: String, required: true },
    name: { type: String, required: true },
    content: [ // 数组
      { kind: String, value: String }
    ],
    addTime: { type: Date, default: Date.now }
  }
};