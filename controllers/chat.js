/*
 * @author: astar
 * @Date: 2020-09-16 10:47:02
 * @LastEditors: astar
 * @LastEditTime: 2021-02-07 10:12:55
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\chat.js
 */
const BaseController = require('./base');
const ChatModel = require('@models').getModel('chatmodel');
class ChatController extends BaseController {
  constructor () {
    super(ChatModel);
  }

  getHistoryChatByCount ({ exitsCount, fetchCount }) {
    return this.Model.find().skip(exitsCount).limit(fetchCount).sort({ addTime: -1 }).then(res => {
      return res.reverse();
    }, _ => {
      console.log(_);
    });
  }
};

module.exports = new ChatController();
