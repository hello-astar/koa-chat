/*
 * @Author: astar
 * @Date: 2021-02-07 09:58:06
 * @LastEditors: astar
 * @LastEditTime: 2021-04-19 17:55:56
 * @Description: 文件描述
 * @FilePath: \koa-chat\middlewares\handleSocket.js
 */
module.exports = function handleSocket (io) {
  let onlineList = [];
  const chatController = require('@controllers').chat;
  
  return function (socket) {
    const index = onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
    if (index !== -1) {
      onlineList[index].emit('error', { type: 'logout', msg: '该用户已在别处登录' });
      onlineList.splice(index, 1);
    };
    onlineList.push(socket);
    console.log(`${socket.decoded_token.name}连接`);
    io.emit("online-list", onlineList.map(item => item.decoded_token));
    // 客户端发送消息
    socket.on("message", msg => {
      const { _id } = socket.decoded_token;
      const chat = { senderId: _id, content: msg };
      chatController.addOne(chat).then(res => {
        io.emit('message', res);
      }).catch(e => {
        console.log(e);
        socket.emit('error', { type: 'message', msg: e });
      });
    });
    // 客户端断开连接
    socket.on("disconnect", reason => {
      const index = onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
      if (index !== -1) {
        onlineList.splice(index, 1);
        console.log(`${socket.decoded_token.name}断开了`, reason);
      }
      io.emit("online-list", onlineList.map(item => item.decoded_token));
    });
  }
}