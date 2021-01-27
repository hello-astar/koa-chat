/*
 * @author: astar
 * @Date: 2020-09-16 10:47:02
 * @LastEditors: astar
 * @LastEditTime: 2020-09-16 14:13:03
 * @Description: 文件描述
 * @FilePath: \koa-chat\db\controllers\chat.js
 */
const mongoose = require('../connect');
const { Schema, model } = mongoose;
const BaseController = require('./base');

const chatSchema = new Schema({
  content: { type: String, required: true },
  user: { type: Object, required: true },
  addTime: { type: Date, default: Date.now }
});

const ChatModel = model('chatModel', chatSchema);
class ChatController extends BaseController {
  constructor () {
    super(ChatModel);
  }
};

module.exports = new ChatController();
