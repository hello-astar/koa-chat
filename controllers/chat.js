/*
 * @author: astar
 * @Date: 2020-09-16 10:47:02
 * @LastEditors: astar
 * @LastEditTime: 2021-02-04 17:27:50
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\chat.js
 */
const mongoose = require('../db/connect');
const { Schema, model } = mongoose;
const BaseController = require('./base');

const chatSchema = new Schema({
  userId: { type: String, required: true },
  avatar: { type: String, required: true },
  name: { type: String, required: true },
  content: [{ kind: String, value: String }],
  addTime: { type: Date, default: Date.now }
});

const ChatModel = model('chatModel', chatSchema);
class ChatController extends BaseController {
  constructor () {
    super(ChatModel);
  }
};

module.exports = new ChatController();