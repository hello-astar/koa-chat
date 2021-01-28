/*
 * @author: astar
 * @Date: 2021-01-27 14:09:56
 * @LastEditors: astar
 * @LastEditTime: 2021-01-27 16:21:48
 * @Description: 聊天室
 * @FilePath: \koa-chat\socket.js
 */
module.exports = function handleSocket (io) {
  let onlineList = [];
  let record = [];
  const { chatController } = require('./db')
  return function (socket) {
    const index = onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
    if (index !== -1) {
      socket.emit('logout', '该用户已在别处登录');
      onlineList.splice(index, 1);
    };
    onlineList.push(socket);
    io.emit("online-list", onlineList.map(item => item.decoded_token));
    socket.emit('record-list', record);
  
    socket.on("message", msg => {
      const { avatar, name, _id } = socket.decoded_token;
      const chat = { avatar, name, userId: _id, content: String(msg) }
      record.push(chat);
      chatController.add(chat)
      io.emit('record-list', record);
    });
  
    socket.on("disconnect", reason => {
      console.log('有人断开了', reason)
      const index = onlineList.findIndex(item => item.id === socket.id);
      if (index !== -1) {
        onlineList.splice(index, 1);
      }
      io.emit("online-list", onlineList.map(item => item.decoded_token));
    });
  }
}