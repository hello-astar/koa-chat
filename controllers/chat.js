/*
 * @author: astar
 * @Date: 2020-09-16 10:47:02
 * @LastEditors: astar
 * @LastEditTime: 2021-05-07 00:38:38
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
              .sort({ addTime: -1 })
              .limit(fetchCount)
              .populate('sender', ['userName', 'avatar'])
              .populate('receiver', ['groupName', 'avatar', 'userName'])
              .then(res => {
                return res.reverse();
              });
  }

  /**
   * 获取最近联系人列表
   * @author astar
   * @date 2021-04-19 16:53
   * @param {*}
   * @returns {*}
   */
  getRecentConcats ({ userId, pageNo, pageSize }) {
    // 查询我发出的或我收到的消息或我所在群组收到的消息
    let key = Mongoose.Types.ObjectId(userId)
    return this.Model.aggregate([
      {
        $project: {
          sender: 1,
          content: 1,
          receiverModel: 1,
          group: {
            $cond: {
              if: { $eq: [ '$receiverModel', 'groupmodel' ] },
              then: '$receiver',
              else: null
            }
          },
          person: {
            $cond: {
              if: { $eq: ['$receiverModel', 'usermodel'] },
              then: '$receiver',
              else: null
            }
          }
        }
      },
      {
        $lookup: {
          from: 'groupmodels',
          localField: 'group',
          foreignField: '_id',
          as: 'group'
        }
      },
      {
        $unwind: '$group'
      },
      {
        $lookup: {
          from: 'usermodels',
          localField: 'person',
          foreignField: '_id',
          as: 'person'
        }
      },
      {
        $unwind: { "path": "$person", "preserveNullAndEmptyArrays": true }
      },
      {
        $match: {
          $or: [
            { 'sender': key, receiverModel: 'usermodel' },
            { 'person._id': key },
            { 'group.members': key }
          ]
        }
      },
      {
        $group: {
          _id: { person: '$person', group: '$group' },
          latest: { $last: '$content' },
          count: { $sum: 1 }
        }
      },
      {
        $unwind: { "path": "$latest", "preserveNullAndEmptyArrays": true }
      },
      {
        $project: {
          isGroup: {
            $cond: {
              if: '$_id.group',
              then: true,
              else: false
            }
          },
          receiver: {
            $cond: {
              if: '$_id.group',
              then: '$_id.group',
              else: '$_id.person'
            }
          },
          latest: 1, // 展示
          count: 1, // 展示
          _id: 0 // 不展示
        }
      },
      {
        $skip: (pageNo - 1) * pageSize
      },
      {
        $limit: pageSize
      },
    ]);
  }
};

module.exports = new ChatController();
