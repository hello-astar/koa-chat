/*
 * @author: astar
 * @Date: 2020-09-16 10:47:02
 * @LastEditors: astar
 * @LastEditTime: 2021-02-05 17:49:10
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\chat.js
 */
const BaseController = require('./base');
const ChatModel = require('../models').getModel('chatmodel');
class ChatController extends BaseController {
  constructor () {
    super(ChatModel);
  }

  getChatRecordByPage ({ pageNo, pageSize }) {
    return this.Model.find().limit(pageSize).skip((pageNo - 1) * pageSize).then(res => {
      return res;
    }, _ => {
      console.log(_)
    });
  }
};

module.exports = new ChatController();
