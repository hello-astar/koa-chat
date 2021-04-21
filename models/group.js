/*
 * @Author: astar
 * @Date: 2021-04-14 16:07:11
 * @LastEditors: astar
 * @LastEditTime: 2021-04-20 13:55:12
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
      unique: true, // The unique Option is Not a Validator
      validate: {
        validator: (value) => /^[a-zA-Z][0-9a-zA-Z_\u4e00-\u9eff]{1,8}$/.test(value), // 字母开头，后带1-8位字母数字下划线汉字
        message: '群名存在非法字符或长度过长'
      }
    },
    groupOwnerId: {
      type: Schema.Types.ObjectId,
      ref: 'usermodel'
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'usermodel'
      }
    ],
    addTime: { type: Date, default: Date.now }
  }
};