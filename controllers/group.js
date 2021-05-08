/*
 * @Author: astar
 * @Date: 2021-04-19 13:54:52
 * @LastEditors: astar
 * @LastEditTime: 2021-05-08 17:38:48
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
  * 按条件查找群组
  * @author astar
  * @date 2021-05-07 20:24
  */
  findGroup (params) {
    return this.Model.findOne(params);
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