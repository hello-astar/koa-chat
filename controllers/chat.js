/*
 * @author: astar
 * @Date: 2020-09-16 10:47:02
 * @LastEditors: astar
 * @LastEditTime: 2021-05-07 18:10:39
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
          receiver: 1,
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
          },
          isGroup: {
            $cond: {
              if: { $eq: ['$receiverModel', 'groupmodel'] },
              then: true,
              else: false
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
        $unwind: { "path": "$group", "preserveNullAndEmptyArrays": true }
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
        $lookup: {
          from: 'usermodels',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $unwind: { "path": "$sender", "preserveNullAndEmptyArrays": true }
      },
      {
        $match: {
          $or: [
            { 'sender': key, isGroup: false }, // 我发送的数据
            { 'person._id': key }, // 我接收的数据
            { 'group.members': key } // 群组中有我
          ]
        }
      },
      {
        $project: {
          sender: 1,
          receiver: 1,
          isGroup: 1,
          content: 1,
          concat: { // 对方
            $cond: {
              if: '$isGroup',
              then: '$group',
              else: {
                $cond: {
                  if: { $eq: [key, '$sender._id'] }, // 我作为sender，联系对象是receiver
                  then: '$person',
                  else: '$sender'
                }
              }
            }
          },
        }
      },
      {
        $group: {
          _id: { concat: '$concat', isGroup: '$isGroup' }, // 将同一联系对象分为一组
          latest: { $last: '$content' },
          count: { $sum: 1 }
        }
      },
      {
        $unwind: { "path": "$latest", "preserveNullAndEmptyArrays": true }
      },
      {
        $project: {
          isGroup: '$_id.isGroup',
          concat: '$_id.concat',
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
      }
    ])
  }
};

module.exports = new ChatController();
