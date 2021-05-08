/*
 * @Author: astar
 * @Date: 2021-05-08 14:07:38
 * @LastEditors: astar
 * @LastEditTime: 2021-05-08 17:37:29
 * @Description: 保存数据
 * @FilePath: \koa-chat\controllers\save.js
 */
const getModel = require('@models').getModel;
const groupModel = getModel('groupmodel');
const userModel = getModel('usermodel');
const chatModel = getModel('chatmodel');

const save = {};

/**
 * 添加群组
 * @author astar
 * @date 2021-05-08 16:24
 */
save.addGroup = async ctx => {
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
save.joinMemberToGroup = async ctx => {
  const { userId, groupId } = ctx.request.body;
  // 判断用户是否存在
  let user = await userModel.findOne({ _id: userId });
  if (!user) {
    return ctx.sendError('请输入正确用户ID');
  }
  let res = await groupModel.updateOne({ _id: groupId }, { $addToSet: { 'members': userId }})
  ctx.send(res);
}
module.exports = save;