/*
 * @Author: astar
 * @Date: 2021-05-06 11:22:15
 * @LastEditors: astar
 * @LastEditTime: 2021-05-08 10:26:09
 * @Description: 初始化文档
 * @FilePath: \koa-chat\init\index.js
 */
require('module-alias/register');
const userController = require('@controllers').user;
const groupController = require('@controllers').group;
const chatController = require('@controllers').chat;
const defaultData = require('./data/default.json');
const testData = require('./data/test.json');

(async function () {
  async function initDefault () {
    // 创建管理员
    let admin = await userController.Model.findOne({ isAdmin: true });
    if (admin) {
      console.log('存在管理员');
    } else {
      admin = await userController.Model.create(defaultData.admin);
    }
    // 创建系统默认群组
    let defaultGroup = await groupController.Model.findOne({ isDefault: true });
    if (defaultGroup) {
      console.log('存在系统群组');
    } else {
      defaultGroup = await groupController.Model.create(defaultData.group);
    }
    console.log('初始化系统成功!');
  }

  async function initTest () {
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
  try {
    await initDefault(); // 初始化系统默认数据
    // await initTest(); // 初始化测试数据 // 可以不初始化
    console.log('All Done!')
  } catch (e) {
    console.log(e)
  }
})();
