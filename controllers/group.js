/*
 * @Author: astar
 * @Date: 2021-04-19 13:54:52
 * @LastEditors: astar
 * @LastEditTime: 2021-04-19 17:00:07
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\group.js
 */
const GroupModel = require('@models').getModel('groupmodel');
class ChatController {
  constructor () {
    this.Model = GroupModel;
  }

  createGroup ({ groupName, groupOwnerId, members }) {
    return this.Model.create({ groupName, groupOwnerId, members });
  }

  joinUser ({ groupId, userId }) {
    return this.Model.updateOne({ _id: groupId }, { $addToSet: { 'members': userId }});
  }

  getGroups ({ receiverId }) {
    return this.Model.find({ members: { $in: receiverId } });
  }
};

module.exports = new ChatController();