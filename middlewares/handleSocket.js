/*
 * @Author: astar
 * @Date: 2021-02-07 09:58:06
 * @LastEditors: astar
 * @LastEditTime: 2022-01-10 03:08:05
 * @Description: 文件描述
 * @FilePath: \koa-chat\middlewares\handleSocket.js
 */
const socketController = require('@controllers').socket;

module.exports = function handleSocket (io) {
  io.onlineList = io.onlineList || [];
  console.log('启动socket服务')
  return function (socket) {
    // 客户端用户连接
    socketController.handleSocketConnect(io, socket);
    // 客户端发送消息
    socket.on("message", socketController.handleReceiveMessage.bind(null, io, socket));
    // 客户端断开连接
    socket.on("disconnect", socketController.handleSocketDisconnect.bind(null, io, socket));
  }
}