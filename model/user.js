/*
 * @author: cmx
 * @Date: 2020-09-09 15:26:39
 * @LastEditors: astar
 * @LastEditTime: 2020-09-09 21:18:44
 * @Description: 用户数据定义
 * @FilePath: \koa-chat\model\user.js
 */
const uuidv1 = require('uuid').v1;
class user {
  constructor (name, avatar) {
    this.uuid = uuidv1();
    this.name = name;
    this.avatar = avatar;
  }
}

class onlineUser extends user {
  constructor (props) {
    super(props);
    this.socket = null;
  }

  send (msg) {
    if (this.socket) {
      this.socket.send(msg)
    }
  }
}

module.exports = {
  onlineUser
}