/*
 * @Author: astar
 * @Date: 2021-05-08 11:49:01
 * @LastEditors: astar
 * @LastEditTime: 2021-05-08 16:20:50
 * @Description: 查询
 * @FilePath: \koa-chat\controllers\query.js
 */
const getModel = require('@models').getModel;
const groupModel = getModel('groupmodel');
const userModel = getModel('usermodel');
const chatModel = getModel('chatmodel');
const Mongoose = require('mongoose');
const { getIPAddress } = require('@utils');
const { mergePics } = require('@utils');

const query = {};
/**
 * 查询群组头像
 * @author astar
 * @date 2021-05-08 15:22
 */
query.getGroupAvatar = async ctx => {
  const { groupId } = ctx.query;
  let groupInfo = await groupModel.findOne({ _id: groupId }).populate('members');
  if (!groupInfo) return ctx.sendError('当前群组不存在');
  
  let members = groupInfo.members.slice(0, 9);
  let res = await mergePics(members.map(item => item.avatar)); // 最多获取九张头像
  ctx.set('Content-Type', 'image/png');
  ctx.response.body = res;
}

/**
 * 查询最近联系人
 * @author astar
 * @date 2021-05-08 15:47
 */
query.getRecentContacts = async ctx => {
  ctx.verifyParams({
    pageNo: { type: 'number', required: true },
    pageSize: { type: 'number', required: true }
  })
  const userId = ctx.userInfo._id;
  const { pageNo, pageSize } = ctx.request.body;
  // 查询我发出的或我收到的消息或我所在群组收到的消息
  let key = Mongoose.Types.ObjectId(userId)
  let res = await chatModel.aggregate([
    {
      $project: {
        sender: 1,
        content: 1,
        receiver: 1,
        addTime: 1,
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
          { 'sender._id': key, isGroup: false }, // 我发送的数据
          { 'person._id': key }, // 我接收的数据
          { 'group.members': key } // 群组中有我
        ]
      }
    },
    {
      $project: {
        sender: 1,
        isGroup: 1,
        content: 1,
        addTime: 1,
        contact: { // 对方
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
        _id: { contactId: '$contact._id', groupName: '$contact.groupName', userName: '$contact.userName', avatar: '$contact.avatar', isGroup: '$isGroup' }, // 将同一联系对象分为一组
        sender: { $last: '$sender' },
        latest: { $last: '$content' },
        sendTime: { $last: '$addTime' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        isGroup: '$_id.isGroup',
        name: {
          $cond: {
            if: '$_id.isGroup',
            then: '$_id.groupName',
            else: '$_id.userName'
          }
        },
        avatar: {
          $cond: {
            if: '$_id.isGroup',
            then: { $concat: [`http://${getIPAddress()}:3000/query/getGroupAvatar?groupId=`, { '$toString' : '$_id.contactId' }] },
            else: '$_id.avatar'
          }
        },
        sendTime: 1,
        sender: 1,
        latest: 1, // 展示
        count: 1, // 展示
        _id: '$_id.contactId'
      }
    },
    {
      $skip: (pageNo - 1) * pageSize
    },
    {
      $limit: pageSize
    },
    {
      $sort: {
        sendTime: -1
      }
    }
  ]);
  ctx.send(res);
}

/**
 * 获取历史聊天记录, 从startId获取
 * @author astar
 * @date 2021-03-03 16:01
 */
query.getHistoryChatByCount = async ctx => {
  ctx.verifyParams({
    receiverId: { type: 'string', required: true },
    fetchCount: { type: 'string', required: true }
  });

  const { receiverId, startId, fetchCount } = ctx.query;
  let res = await chatModel.find(startId ? { receiver: receiverId, _id: { $lt: startId } } : { receiver: receiverId })
            .sort({ addTime: -1 })
            .limit(Number(fetchCount))
            .populate('sender', ['userName', 'avatar'])
            .populate('receiver', ['groupName', 'avatar', 'userName'])
            .then(res => {
              return res.reverse();
            });
  ctx.send(res);
}

query.getGroupInfo = async ctx => {
  ctx.verifyParams({
    groupId: { type: 'string', required: true }
  });

  const { groupId } = ctx.query;
  let res = await groupModel.findOne({ _id: groupId }).populate('members').populate('groupOwner');
  ctx.send(res);
}
module.exports = query;
