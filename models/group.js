/*
 * @Author: astar
 * @Date: 2021-04-14 16:07:11
 * @LastEditors: astar
 * @LastEditTime: 2022-01-30 21:45:40
 * @Description: 群组
 * @FilePath: \koa-chat\models\group.js
 */
const { Schema } = require('mongoose');
const config = require('@config');

module.exports = {
  name: 'groupmodel',
  schema: {
    groupName: {
      type: String,
      required: [true, '群名不能为空'],
      validate: {
        validator: (value) => /^[\w\u4e00-\u9eff]{1,12}$/.test(value), // 1-12位字母数字下划线汉字
        message: '群名只能由1-12位字母、数字、汉字、下划线_组成'
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
  },
  virtual: {
    avatar: { // 群组头像设置为虚拟值
      get: function () {
        return `${config.BASE_URL}/group/getGroupAvatar?groupId=${this._id}`
      }
    }
  }
};