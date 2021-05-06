/*
 * @Author: astar
 * @Date: 2021-04-14 16:07:11
 * @LastEditors: astar
 * @LastEditTime: 2021-05-06 10:28:25
 * @Description: 群组
 * @FilePath: \koa-chat\models\group.js
 */
const { Schema } = require('mongoose');
module.exports = {
  name: 'groupmodel',
  schema: {
    groupName: {
      type: String,
      required: [true, '群名不能为空'],
      validate: {
        validator: (value) => /^[a-zA-Z0-9a-zA-Z_\u4e00-\u9eff]{1,8}$/.test(value), // 1-8位字母数字下划线汉字
        message: '群名存在非法字符或长度过长'
      }
    },
    groupOwner: {
      type: Schema.Types.ObjectId,
      ref: 'usermodel'
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'usermodel'
      }
    ],
    isDefault: {
      type: Boolean,
      default: false
    },
    addTime: { type: Date, default: Date.now }
  }
};