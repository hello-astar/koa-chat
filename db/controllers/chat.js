/*
 * @author: astar
 * @Date: 2020-09-16 10:47:02
 * @LastEditors: astar
 * @LastEditTime: 2021-01-27 16:22:45
 * @Description: 文件描述
 * @FilePath: \koa-chat\db\controllers\chat.js
 */
const mongoose = require('../connect');
const { Schema, model } = mongoose;
const BaseController = require('./base');

const chatSchema = new Schema({
  userId: { type: String, required: true },
  avatar: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  addTime: { type: Date, default: Date.now }
});

const ChatModel = model('chatModel', chatSchema);
class ChatController extends BaseController {
  constructor () {
    super(ChatModel);
  }
};

module.exports = new ChatController();
