/*
 * @Author: astar
 * @Date: 2021-04-19 13:54:52
 * @LastEditors: astar
 * @LastEditTime: 2021-07-05 18:48:52
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\group.js
 */
const Mongoose = require('mongoose');
const getModel = require('@models').getModel;
const groupModel = getModel('groupmodel');
const userModel = getModel('usermodel');
const chatModel = getModel('chatmodel');
const { mergePics } = require('@utils');

const group = {};

/**
* 获取群组信息
* @author astar
* @date 2021-05-09 19:59
*/
group.getGroupInfo = async ctx => {
  ctx.verifyParams({
    groupId: { type: 'string', required: true }
  });

  const { groupId } = ctx.query;
  let res = await groupModel.findOne({ _id: groupId }).populate('members').populate('groupOwner');
  ctx.send(res);
}

/**
 * 查询群组头像
 * @author astar
 * @dateaaaa 2021-05-08 15:22
 */
 group.getGroupAvatar = async ctx => {
  const { groupId } = ctx.query;
  let groupInfo = await groupModel.aggregate([
    {
      $match: { _id: Mongoose.Types.ObjectId(groupId) }
    },
    {
      $project: {
        members: {
          $slice: ['$members', 9]
        }
      }
    },
    {
      $lookup: {
        from: 'usermodels',
        localField: 'members',
        foreignField: '_id',
        as: 'members'
      }
    }
  ])
  if (!groupInfo || !groupInfo.length) return ctx.sendError('当前群组不存在');
  let members = groupInfo[0].members;
  let res = '';
  try {
    res = await mergePics(members.map(item => item.avatar)); // 最多获取九张头像
  } catch (e) {
    res = await mergePics(['https://p.qqan.com/up/2021-2/16137992359659254.jpg']); // 本地调试暂用此图
  }
  ctx.set('Content-Type', 'image/png');
  ctx.response.body = res;
}

group.updateGroupNameByGroupId = async ctx => {
  ctx.verifyParams({
    groupId: { type: 'string', required: true },
    groupName: { type: 'string', required: true }
  });
  const { groupId, groupName } = ctx.request.body;
  let res = await groupModel.updateOne({ _id: groupId }, { groupName }, { runValidators: true });
  ctx.send(res);
}

group.exitGroup = async ctx => {
  ctx.verifyParams({
    groupId: { type: 'string', required: true }
  });
  let { groupId } = ctx.request.body;
  let res = await groupModel.updateOne({ _id: groupId }, { $pull: { members: ctx.userInfo._id } });
  ctx.send(res);
}

/**
 * 添加群组
 * @author astar
 * @date 2021-05-08 16:24
 */
 group.addGroup = async ctx => {
  ctx.verifyParams({
    groupName: { type: 'string', required: true }
  });
  const { groupName } = ctx.request.body;
  let { _id } = ctx.userInfo;
  let res = await groupModel.create({ groupName, groupOwner: _id, members: [_id] });
  // 自动添加管理员提醒
  const admin = await userModel.findOne({ isAdmin: true });
  const chat = { sender: admin._id, content: [{ kind: 'TEXT', value: '欢迎' }], receiver: res._id, receiverModel: 'groupmodel' };
  await chatModel.create(chat);
  ctx.send(res);
}

/**
 * 为群组添加用户
 * @author astar
 * @date 2021-05-08 17:35
 */
group.joinMemberToGroup = async ctx => {
  const { userId, groupId } = ctx.request.body;
  // 判断用户是否存在
  let user = await userModel.findOne({ _id: userId });
  if (!user) {
    return ctx.sendError('请输入正确用户ID');
  }
  let res = await groupModel.updateOne({ _id: groupId }, { $addToSet: { 'members': userId }})
  ctx.send(res);
}
module.exports = group;