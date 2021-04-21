/*
 * @author: astar
 * @Date: 2020-09-16 10:47:02
 * @LastEditors: astar
 * @LastEditTime: 2021-04-21 14:10:13
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\chat.js
 */
const ChatModel = require('@models').getModel('chatmodel');
const Mongoose = require('mongoose');
class ChatController {
  constructor () {
    this.Model = ChatModel;
  }

  async addChat ({ senderId, receiverId, content, receiverModel }) {
    let res = await this.Model.create({
      sender: senderId,
      receiver: receiverId,
      receiverModel,
      content
    });
    return this.Model.findOne({ _id: res._id })
              .populate('sender', ['userName', 'avatar'])
              .populate('receiver', ['groupName', 'userName', 'avatar']);
  }
  /**
   * 获取历史聊天记录, 从startId获取
   * @author astar
   * @date 2021-03-03 16:01
   */
  async getHistoryChatByCount ({ receiverId, startId, fetchCount }) {
    return this.Model.find(startId ? { receiver: receiverId, _id: { $lt: startId } } : { receiver: receiverId })
              .populate('sender', ['userName', 'avatar'])
              .populate('receiver', ['groupName', 'avatar', 'userName'])
              .limit(fetchCount);
  }

  /**
   * 按群组获取聊天历史
   * @author astar
   * @date 2021-04-19 16:53
   * @param {*}
   * @returns {*}
   */
  getHistoryChatSortByGroup ({ userId, pageNo, pageSize }) {
    // 查询我发出的或我收到的消息
    // 分组
    // 分页
    let key = Mongoose.Types.ObjectId(userId)
    return this.Model.aggregate([
      {
        $match: {
          $or: [
            { 'sender': key },
            { 'receiver': key, receiverModel: 'usermodel' }
          ]
        }
      },
      {
        $group: {
          _id: { receiver: "$receiver", sender: '$sender' },
          latest: { $last: "$content" },
          count: { $sum: 1 }
        }
      },
      {
        $skip: (pageNo - 1) * pageSize
      },
      {
        $limit: pageSize
      },
      {
        $project: {
          receiver: '$_id.receiver',
          sender: '$_id.sender',
          latest: '$latest',
          count: '$count',
          _id: 0
        }
      }
    ]);
  }
};

module.exports = new ChatController();
