/*
 * @Author: astar
 * @Date: 2021-05-08 16:36:51
 * @LastEditors: astar
 * @LastEditTime: 2021-05-10 00:05:39
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\socket.js
 */
const getModel = require('@models').getModel;
const groupModel = getModel('groupmodel');
const chatModel = getModel('chatmodel');
const userModel = getModel('usermodel');

const socket = {};

socket.handleSocketConnect = async (io, socket) => {
  const index = io.onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
  if (index !== -1) {
    io.onlineList[index].emit('error', { type: 'logout', msg: '该用户已在别处登录' });
    io.onlineList.splice(index, 1);
  };
  io.onlineList.push(socket);
  console.log(`${socket.decoded_token.userName}连接`);
}

socket.handleReceiveMessage = async (io, socket, msg) => {
  const { _id, lastOnlineTime } = socket.decoded_token;
  const userInfo = await userModel.findOne({ _id });
  if (!userInfo) return socket.emit('error', { type: 'logout', msg: '未授权，请重新登录' });
  if(new Date(lastOnlineTime).getTime() !== new Date(userInfo.lastOnlineTime).getTime()) {
    return socket.emit('error', { type: 'logout', msg: '未授权，请重新登录' });
  }

  try {
    const chat = {
      sender: _id,
      content: msg.content,
      receiver: msg.receiverId,
      receiverModel: msg.isGroup ? 'groupmodel' : 'usermodel'
    };
    let chatInfo = await chatModel.create(chat);
    chatInfo = await chatModel.findOne({ _id: chatInfo._id })
                              .populate('sender', ['userName', 'avatar'])
                              .populate('receiver', ['groupName', 'userName', 'avatar']);
    // 若发送给群
    // 拥有这个群的所有在线用户都要收到消息
    if (msg.isGroup) {
      let group = await groupModel.findOne({ _id: msg.receiverId, members: { $in: io.onlineList.map(item => item.decoded_token._id) } }, { members: 1 });
      if (group) {
        group.members.forEach(item => {
          let online = io.onlineList.find(ele => String(ele.decoded_token._id) === String(item));
          online && online.emit('message', chatInfo);
        });
      }
    } else { // 发送给个人
      let online = io.onlineList.find(item => String(item.decoded_token._id) === String(msg.receiverId));
      online && online.emit('message', chatInfo);
      socket.emit('message', chatInfo);
    }
  } catch (e) {
    console.log(e)
    socket.emit('error', { type: 'message', msg: e });
  }
}

socket.handleSocketDisconnect = (io, socket, reason) => {
  const index = io.onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
  if (index !== -1) {
    io.onlineList.splice(index, 1);
    console.log(`${socket.decoded_token.userName}断开连接`, reason);
  }
}

module.exports = socket;
