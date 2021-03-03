/*
 * @author: astar
 * @Date: 2020-09-16 10:47:02
 * @LastEditors: astar
 * @LastEditTime: 2021-03-03 16:01:46
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\chat.js
 */
const BaseController = require('./base');
const ChatModel = require('@models').getModel('chatmodel');
class ChatController extends BaseController {
  constructor () {
    super(ChatModel);
  }

  /**
   * 获取历史聊天记录
   * @author astar
   * @date 2021-03-03 16:01
   */
  getHistoryChatByCount ({ exitsCount, fetchCount }) {
    return this.Model.find().skip(exitsCount).limit(fetchCount).sort({ addTime: -1 }).then(res => {
      return res.reverse();
    }, _ => {
      return Promise.reject(_);
    });
  }
};

module.exports = new ChatController();
