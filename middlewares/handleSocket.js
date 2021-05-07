/*
 * @Author: astar
 * @Date: 2021-02-07 09:58:06
 * @LastEditors: astar
 * @LastEditTime: 2021-05-06 16:53:09
 * @Description: 文件描述
 * @FilePath: \koa-chat\middlewares\handleSocket.js
 */
module.exports = function handleSocket (io) {
  let onlineList = [];
  const chatController = require('@controllers').chat;
  const groupController = require('@controllers').group;

  async function handleMessage (msg) {
    const { _id } = this.decoded_token;
    const chat = { senderId: _id, content: msg.content, receiverId: msg.receiverId, receiverModel: msg.isGroup ? 'groupmodel' : 'usermodel' };
    try {
      let res = await chatController.addChat(chat);
      // 若发送给群
      // 拥有这个群的所有在线用户都要收到消息
      if (msg.isGroup) {
        let group = await groupController.Model.findOne({ _id: msg.receiverId, members: { $in: onlineList.map(item => item.decoded_token._id) } }, { members: 1 });
        if (group) {
          group.members.forEach(item => {
            let online = onlineList.find(ele => String(ele.decoded_token._id) === String(item));
            online && online.emit('message', res);
          });
        }
      } else { // 发送给个人
        let online = onlineList.find(item => String(item.decoded_token._id) === String(msg.receiverId));
        online && online.emit('message', res);
      }
    } catch (e) {
        console.log('---------------------------', e)
        this.emit('error', { type: 'message', msg: e });
      };
  }

  function handleDisconnect (reason) {
    const socket = this;
    const index = onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
    if (index !== -1) {
      onlineList.splice(index, 1);
      console.log(`${socket.decoded_token.userName}断开了`, reason);
    }
  }
  
  return function (socket) {
    const index = onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
    if (index !== -1) {
      onlineList[index].emit('error', { type: 'logout', msg: '该用户已在别处登录' });
      onlineList.splice(index, 1);
    };
    onlineList.push(socket);
    console.log(`${socket.decoded_token.userName}连接`);
    // 客户端发送消息
    socket.on("message", handleMessage);
    // 客户端断开连接
    socket.on("disconnect", handleDisconnect);
  }
}