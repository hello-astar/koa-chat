/*
 * @author: astar
 * @Date: 2020-09-09 13:53:55
 * @LastEditors: astar
 * @LastEditTime: 2022-01-30 21:22:21
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\user.js
 */
const jwt = require("jsonwebtoken");
const config = require('@config');
const { privateDecrypt, genSalt, sha512 } = require('@utils');
const fs = require('fs');
const path = require('path');
const Mongoose = require('mongoose');

const getModel = require('@models').getModel;
const userModel = getModel('usermodel');
const groupModel = getModel('groupmodel');
const chatModel = getModel('chatmodel');

const user = {};

/**
 * 注册用户
 * @author astar
 * @date 2021-05-08 14:31
 */
user.register = async ctx => {
  ctx.verifyParams({
    avatar: { type: 'string', required: true },
    userName: { type: 'string', required: true },
    password: { type: 'string', required: true },
    captcha: { type: 'string', required: true }
  });
  
  const { userName, password, captcha, avatar } = ctx.request.body;
  
  if (captcha.toLowerCase() !== ctx.session.captcha.toLowerCase()) {
    return ctx.sendError('验证码错误');
  }

  const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem')).toString('utf8');
  let originPassword = privateDecrypt(privateKey, 'astar', Buffer.from(password, 'base64'));
  const salt = genSalt(16); // 生成16位的盐
  let sha512Pass = sha512(originPassword, salt);
  let user = await userModel.create({ userName, avatar, password: sha512Pass, salt });
  // 加入默认群组
  let defaultGroup = await groupModel.findOne({ isDefault: true });
  if (defaultGroup) {
    await groupModel.updateOne({ _id: defaultGroup._id }, { $addToSet: { 'members': user._id }});
  }
  ctx.session = null;
  ctx.send({
    _id: user._id,
    userName: user.userName,
    avatar: user.avatar,
    addTime: user.addTime
  });
}

/**
* 登录
* @author astar
* @date 2021-07-05 15:09
*/
user.login = async ctx => {
  ctx.verifyParams({
    userName: { type: 'string', required: true },
    password: { type: 'string', required: true },
    captcha: { type: 'string', required: true }
  });

  const { captcha, userName, password } = ctx.request.body;

  if (captcha.toLowerCase() !== ctx.session.captcha.toLowerCase()) {
    return ctx.sendError('验证码错误');
  }
  let user = await userModel.findOne({ userName });
  if (!user) return ctx.sendError('当前用户不存在');
  const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem')).toString('utf8');
  let originPassword = privateDecrypt(privateKey, 'astar', Buffer.from(password, 'base64'));
  let sha512Pass = sha512(originPassword, user.salt);
  if (user.password !== sha512Pass) return ctx.sendError('密码错误');
  // 更新最后在线时间
  let lastOnlineTime = new Date();
  let token = jwt.sign({
      _id: user._id,
      userName: user.userName,
      avatar: user.avatar,
      lastOnlineTime
    },
    config.JWT_SECRET,
    { expiresIn: "24h" }
  );
  await userModel.updateOne({ _id: user._id }, { lastOnlineTime });
  ctx.session = null;
  return ctx.send({ token });
}

/**
* 获取最新用户详情信息
* @author astar
* @date 2021-07-05 15:10
*/
user.getUserDetail = async ctx => {
  let user = await userModel.findOne({ _id: ctx.userInfo._id }, { userName: 1, avatar: 1, signature: 1, isAdmin: 1 });
  ctx.send(user);
}

/**
* 编辑用户信息
* @author astar
* @date 2021-07-05 15:10
*/
user.editUser = async ctx => {
  const { userName, avatar, oldPassword, newPassword, signature } = ctx.request.body;
  let params = { signature: signature || '', userName, avatar };
  if (newPassword) {
    let user = await userModel.findOne({ _id: ctx.userInfo._id });
    const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem')).toString('utf8');
    let originPassword = privateDecrypt(privateKey, 'astar', Buffer.from(oldPassword, 'base64'));
    let originNewPass = privateDecrypt(privateKey, 'astar', Buffer.from(newPassword, 'base64'));
    let sha512Pass = sha512(originPassword, user.salt);
    if (user.password !== sha512Pass) return ctx.sendError('旧密码输入错误，无法修改密码！');
    params.password = sha512(originNewPass, user.salt);
  }
  // 更新最后在线时间
  let lastOnlineTime = new Date();
  params.lastOnlineTime = lastOnlineTime;
  await userModel.updateOne({ _id: ctx.userInfo._id }, params, { runValidators: true });
  let token = jwt.sign({
      _id: ctx.userInfo._id,
      userName,
      avatar,
      lastOnlineTime
    },
    config.JWT_SECRET,
    { expiresIn: "24h" }
  );
  return ctx.send(token);
}

/**
* 添加好友
* @author astar
* @date 2021-07-05 15:10
*/
user.addFriend = async ctx => {
  // 目前简易版本：无需好友确认，直接双向添加
  ctx.verifyParams({
    friendId: { type: 'string', required: true },
  });
  let { friendId } = ctx.request.body;
  let friend = await userModel.findOne({ _id: friendId });
  if (!friend) return ctx.sendError('查无此人');
  await userModel.updateOne({ _id: ctx.userInfo._id }, { $addToSet: { friends: friendId }});
  await userModel.updateOne({ _id: friendId }, { $addToSet: { friends: ctx.userInfo._id }});
  ctx.send();
}

/**
 * 查询最近联系人
 * @author astar
 * @date 2021-05-08 15:47
 */
 user.getRecentContacts = async ctx => {
  ctx.verifyParams({
    pageNo: { type: 'number', required: true },
    pageSize: { type: 'number', required: true }
  })
  const userId = ctx.userInfo._id;
  const { pageNo, pageSize } = ctx.request.body;
  // 查询我发出的或我收到的消息或我所在群组收到的消息
  let key = Mongoose.Types.ObjectId(userId);
  // 先查出我所在的群组
  let myGroups = (await groupModel.find({ members: { $in: key } })).map(item => item._id);
  let res = await chatModel.aggregate([
    {
      $match: {
        $or: [
          { 'sender': key, receiverModel: 'usermodel' }, // 我发送的数据
          { 'receiver': key, receiverModel: 'usermodel' }, // 我接收的数据
          { 'receiver': { $in: myGroups }, receiverModel: 'groupmodel' } // 群组中有我
        ]
      }
    },
    {
      $project: {
        sender: '$sender',
        sendTime: '$addTime',
        content: '$content',
        isGroup: {
          $cond: {
            if: { $eq: ['$receiverModel', 'groupmodel'] },
            then: true,
            else: false
          }
        },
        contact: { // 联系人或联系群
          $cond: {
            if: { $eq: ['$receiverModel', 'groupmodel'] },
            then: '$receiver',
            else: {
              $cond: {
                if: { $eq: [key, '$sender'] },
                then: '$receiver',
                else: '$sender'
              }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: { contact: '$contact', isGroup: '$isGroup' }, // 将同一联系对象分为一组
        content: { $last: '$content' },
        sender: { $last: '$sender' },
        sendTime: { $last: '$sendTime' },
        count: { $sum: 1 }
      }
    },
    {
      $skip: (pageNo - 1) * pageSize
    },
    {
      $limit: pageSize
    },
    {
      $sort: {
        sendTime: -1
      }
    },
    {
      $lookup: {
        from: 'groupmodels',
        let: { isGroup: '$_id.isGroup', contact: '$_id.contact' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$$isGroup', true] },
                  { $eq: ['$$contact', '$_id'] }
                ]
              }
            }
          },
          {
            $project: {
              name: '$groupName',
              isDefault: 1,
              avatar: { $concat: [`${config.BASE_URL}/group/getGroupAvatar?groupId=`, { '$toString' : '$_id' }] }
            }
          }
        ],
        as: 'group'
      }
    },
    {
      $lookup: {
        from: 'usermodels',
        let: { contact: '$_id.contact', isGroup: '$_id.isGroup' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$$isGroup', false] },
                  { $eq: ['$$contact', '$_id'] }
                ]
              }
            }
          },
          {
            $project: {
              name: '$userName',
              isAdmin: 1,
              avatar: '$avatar'
            }
          }
        ],
        as: 'person'
      }
    },
    {
      $lookup: {
        from: 'usermodels',
        localField: 'sender',
        foreignField: '_id',
        as: 'sender'
      }
    },
    {
      $unwind: { "path": "$sender", "preserveNullAndEmptyArrays": true }
    },
    {
      $project: {
        sendTime: '$sendTime',
        content: '$content',
        sender: {
          userName: 1,
          // avatar: 1,
          isAdmin: 1
        },
        count: '$count',
        contact: {
          $cond: {
            if: '$_id.isGroup',
            then: '$group',
            else: '$person'
          }
        },
        isGroup: '$_id.isGroup'
      }
    },
    {
      $unwind: { "path": "$contact", "preserveNullAndEmptyArrays": true }
    }
  ]);
  res = res.map(item => ({
    content: item.content,
    sender: item.sender,
    sendTime: item.sendTime,
    count: item.count,
    isGroup: item.isGroup,
    ...item.contact
  }))
  ctx.send(res);
}

/**
* 查询我的群
* @author astar
* @date 2021-05-09 11:32
*/
user.getMyGroups = async ctx => {
  const { _id } = ctx.userInfo;
  let res = await groupModel.find({ members: { $in: _id } }, { groupName: 1, avatar: 1, members: 1 });
  ctx.send(res);
}

/**
* 查询我的好友
* @author astar
* @date 2021-05-09 11:32
*/
user.getMyFriends = async ctx => {
  let res = await userModel.findOne({ _id: ctx.userInfo._id }, { friends: 1 }).populate('friends', ['userName', 'avatar', 'signature']);
  ctx.send(res.friends);
}

/**
* 判断是否为我的好友
* @author astar
* @date 2021-05-09 23:48
*/
user.checkIsMyFriend = async ctx => {
  ctx.verifyParams({
    userId: { type: 'string', required: 'true' }
  });
  const { userId } = ctx.request.body;
  let res = await userModel.findOne({ _id: ctx.userInfo._id, friends: { $in: userId }});
  ctx.send(res ? true : false);
}
module.exports = user;
