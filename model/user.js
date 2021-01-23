/*
 * @author: cmx
 * @Date: 2020-09-09 15:26:39
 * @LastEditors: cmx
 * @LastEditTime: 2021-01-23 16:50:40
 * @Description: 用户数据定义
 * @FilePath: \koa-chat\model\user.js
 */
// const uuidv1 = require('uuid').v1;
class userModel {
  constructor ({ uuid, name, avatar }) {
    // this.uuid = uuid || uuidv1();
    this.name = name;
    this.avatar = avatar;
  }
}

class onlineUserModel extends userModel {
  constructor (props) {
    super(props);
    this.socket = null;
  }

  initSocket (socket, { onMessage, onClose }) {
    this.socket = socket;
    if (socket) {
      socket.on('message', function(request) {
        typeof onMessage === 'function' && onMessage(request);
      });
    
      socket.on('close', (request) => {
        this.socket = null;
        typeof onClose === 'function' && onClose(request);
      });
    }
  }

  send (msg) {
    if (this.socket) {
      this.socket.send(JSON.stringify(msg));
    }
  }
}

module.exports = {
  onlineUserModel
}