/*
 * @Author: astar
 * @Date: 2021-05-06 11:22:15
 * @LastEditors: astar
 * @LastEditTime: 2021-05-06 16:51:21
 * @Description: 初始化文档
 * @FilePath: \koa-chat\init\index.js
 */
require('module-alias/register');
const userController = require('@controllers').user;
const groupController = require('@controllers').group;
const chatController = require('@controllers').chat;
const userList = require('./data/user.json');
const messageList = require('./data/message.json');

const fs = require('fs');
const path = require('path');

(async function () {
  async function initDefaultGroup () {
    let defaultGroup = await groupController.Model.findOne({ isDefault: true });
    if (defaultGroup) {
      console.log('存在系统群组');
      return;
    }
    await groupController.Model.create({ _id: '6093a3f3d108423c7878bf5f', groupName: '系统群组', groupOwner: '6093a3f3d108423c7878bf60', members: [], isDefault: true });
    console.log('初始化系统群组成功');
  }

  async function initUser () {
    let res = await userController.Model.insertMany(userList);
    // 加入默认群组
    let defaultGroup = await groupController.Model.findOne({ isDefault: true });
    if (defaultGroup) {
      await groupController.Model.updateOne({ _id: defaultGroup._id }, { $addToSet: { members: { $each: res.map(item => item._id) }}})
    }
    console.log('初始化用户成功');
  }

  async function initMessage () {
    await chatController.Model.insertMany(messageList);
    console.log('初始化群消息成功');
  }

  await initDefaultGroup();
  await initUser();
  await initMessage();
})();
