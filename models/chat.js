/*
 * @Author: astar
 * @Date: 2021-02-05 15:27:35
 * @LastEditors: astar
 * @LastEditTime: 2021-04-20 15:16:17
 * @Description: 聊天记录表
 * @FilePath: \koa-chat\models\chat.js
 */
const { Schema } = require('mongoose');

module.exports = {
  name: 'chatmodel',
  schema: {
    sender: { type: Schema.Types.ObjectId, ref: 'usermodel', required: true }, // 发送者
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverModel'
    }, // 接收者，个人或群
    receiverModel: {
      type: String,
      required: true,
      enum: ['usermodel', 'groupmodel']
    },
    content: [ // 数组
      {
        kind: {
          type: String,
          enum: ['TEXT', 'IMG', 'AT', 'EMOJI']
        },
        value: String
      }
    ],
    addTime: { type: Date, default: Date.now }
  }
};