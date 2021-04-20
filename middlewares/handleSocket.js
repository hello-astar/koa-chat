/*
 * @Author: astar
 * @Date: 2021-02-07 09:58:06
 * @LastEditors: astar
 * @LastEditTime: 2021-04-20 18:35:43
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
        let group = await groupController.Model.find({ _id: msg.receiverId, members: { $in: onlineList.map(item => item.decoded_token._id) } }, { members: 1 })
        if (group) {
          group.members.forEach(item => {
            let online = onlineList.find(ele => ele.decoded_token._id === item)
            online && online.emit('message', 'hhh')
          })
        }
      } else { // 发送给个人
        let online = onlineList.find(item => item.decoded_token._id === res.receiverId)
        online && online.emit('message', 'hhh')
      }
    } catch (e) {
        console.log('---------------------------', e)
        this.emit('error', { type: 'message', msg: e });
      };
  }

  function handleDisconnect (reason) {

  }
  
  return function (socket) {
    const index = onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
    if (index !== -1) {
      onlineList[index].emit('error', { type: 'logout', msg: '该用户已在别处登录' });
      onlineList.splice(index, 1);
    };
    onlineList.push(socket);
    console.log(`${socket.decoded_token.userName}连接`);
    // io.emit("online-list", onlineList.map(item => item.decoded_token));
    // 客户端发送消息
    socket.on("message", handleMessage);
    // 客户端断开连接
    socket.on("disconnect", reason => {
      const index = onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
      if (index !== -1) {
        onlineList.splice(index, 1);
        console.log(`${socket.decoded_token.userName}断开了`, reason);
      }
      // io.emit("online-list", onlineList.map(item => item.decoded_token));
    });
  }
}