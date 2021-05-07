/*
 * @Author: astar
 * @Date: 2021-04-19 13:54:52
 * @LastEditors: astar
 * @LastEditTime: 2021-05-07 18:45:59
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\group.js
 */
const GroupModel = require('@models').getModel('groupmodel');
const { mergePics } = require('@utils');
class ChatController {
  constructor () {
    this.Model = GroupModel;
  }

  /**
  * 新建群组
  * @author astar
  * @date 2021-05-04 20:11
  */
  createGroup ({ groupName, groupOwner, members }) {
    return this.Model.create({ groupName, groupOwner, members });
  }

  /**
  * 拉人进群
  * @author astar
  * @date 2021-05-04 20:11
  */
  joinMember ({ groupId, userId }) {
    return this.Model.updateOne({ _id: groupId }, { $addToSet: { 'members': userId }});
  }

  /**
  * 根据用户ID获取群组列表
  * @author astar
  * @date 2021-05-04 20:10
  */
  getGroups ({ userId }) {
    return this.Model.find({ members: { $in: userId } });
  }

  /**
  * 获取群信息
  * @author astar
  * @date 2021-05-04 20:10
  */
  getGroupInfoByGroupId ({ groupId }) {
    return this.Model.findOne({ _id: groupId }).populate('members').populate('groupOwner');
  }

  /**
  * 修改群名称
  * @author astar
  * @date 2021-05-04 20:10
  */
  updateGroupNameByGroupId ({ groupId, groupName }) {
    return this.Model.updateOne({ _id: groupId }, { groupName })
  }

  /**
  * 用户退出群组
  * @author astar
  * @date 2021-05-04 18:33
  */
  exitGroupByUserId ({ userId, groupId }) {
    return this.Model.updateOne({ _id: groupId }, { $pull: { members: userId } });
  }
};

module.exports = new ChatController();