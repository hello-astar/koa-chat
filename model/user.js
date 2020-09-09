/*
 * @author: cmx
 * @Date: 2020-09-09 15:26:39
 * @LastEditors: cmx
 * @LastEditTime: 2020-09-09 16:31:55
 * @Description: 用户数据定义
 * @FilePath: \koa-chat\model\user.js
 */
class user {
  constructor (uuid, name, avatar) {
    this.uuid = uuid;
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