/*
 * @Author: astar
 * @Date: 2021-05-06 11:22:15
 * @LastEditors: astar
 * @LastEditTime: 2022-01-05 15:13:40
 * @Description: 初始化文档
 * @FilePath: \koa-chat\init\index.js
 */
require('module-alias/register');
const getModel = require('@models').getModel;
const userModel = getModel('usermodel');
const groupModel = getModel('groupmodel');
const chatModel = getModel('chatmodel');
const defaultData = require('./data/default.json');
const testData = require('./data/test.json');

(async function () {
  async function initDefault () {
    // 创建管理员
    let admin = await userModel.findOne({ isAdmin: true });
    if (admin) {
      console.log('存在管理员');
    } else {
      admin = await userModel.create(defaultData.admin);
    }
    // 创建系统默认群组
    let defaultGroup = await groupModel.findOne({ isDefault: true });
    if (defaultGroup) {
      console.log('存在系统群组');
    } else {
      defaultGroup = await groupModel.create(defaultData.group);
      await chatModel.create({ sender: admin._id, receiver: defaultGroup._id, content: [{ kind: 'TEXT', value: '开始聊天吧' }], receiverModel: 'groupmodel' })
    }
    console.log('初始化系统成功!');
  }

  async function initTest () {
    let res = await userModel.insertMany(testData.user);
    // 加入默认群组
    let defaultGroup = await groupModel.findOne({ isDefault: true });
    if (defaultGroup) {
      await groupModel.updateOne({ _id: defaultGroup._id }, { $addToSet: { members: { $each: res.map(item => item._id) }}})
    }
    // 聊天记录
    await chatModel.insertMany(testData.message);
    console.log('初始化测试用户成功');
  }

  // async function readDatabase () {
  //   const fs = require('fs');
  //   const path = require('path');
  //   let chat = await userModel.find({ isAdmin: false });
  //   fs.writeFileSync(path.join(__dirname, './data/database.json'), JSON.stringify(chat), 'utf8');
  // }
  try {
    // await readDatabase()
    await initDefault(); // 初始化系统默认数据
    await initTest(); // 初始化测试数据 // 可以不初始化
    console.log('All Done!')
  } catch (e) {
    console.log(e)
  }
})();
