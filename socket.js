/*
 * @author: astar
 * @Date: 2021-01-27 14:09:56
 * @LastEditors: astar
 * @LastEditTime: 2021-02-05 17:51:22
 * @Description: 聊天室
 * @FilePath: \koa-chat\socket.js
 */
module.exports = function handleSocket (io) {
  let onlineList = [];
  // let record = [];
  const chatController = require('./controllers').chat;
  
  return function (socket) {
    const index = onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
    if (index !== -1) {
      onlineList[index].emit('logout', '该用户已在别处登录');
      onlineList.splice(index, 1);
    };
    onlineList.push(socket);
    io.emit("online-list", onlineList.map(item => item.decoded_token));
    chatController.getChatRecordByPage({pageNo: 1, pageSize: 20 }).then(res => {
      socket.emit('record-list', res);
    });
  
    socket.on("message", msg => {
      const { avatar, name, _id } = socket.decoded_token;
      const chat = { avatar, name, userId: _id, content: msg };
      chatController.addOne(chat).then(() => {
        chatController.getChatRecordByPage({pageNo: 1, pageSize: 20 }).then(res => {
          io.emit('record-list', res);
        });
      }).catch(e => {
        console.log(e);
        socket.emit('error', e);
      });
    });
  
    socket.on("disconnect", reason => {
      console.log('有人断开了', reason);
      const index = onlineList.findIndex(item => item.decoded_token._id === socket.decoded_token._id);
      if (index !== -1) {
        onlineList.splice(index, 1);
      }
      io.emit("online-list", onlineList.map(item => item.decoded_token));
    });
  }
}