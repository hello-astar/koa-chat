/*
 * @author: cmx
 * @Date: 2020-09-09 10:19:58
 * @LastEditors: cmx
 * @LastEditTime: 2020-09-14 16:37:19
 * @Description: 文件描述
 * @FilePath: \koa-chat\routers\chat\index.js
 */
const Router = require('koa-router');
let router = new Router();
let onlineList = require('../../onlineList').userList;
const { successModel } = require('../../model').response;


router.all('/room', async ctx => {
  // 连接websocket
  const uuid = ctx.request.query.uuid;
  let currentUser = onlineList.find(item => item.uuid === uuid);
  if (currentUser) {
    // 新增用户
    broadcastToSend({ type: 0, onlineList: onlineList.filter(item => item.socket) });
    currentUser.initSocket(
      ctx.websocket,
      {
        onMessage: (request) => {
          const req = JSON.parse(request);
          const { type, uuid, content } = req;
          let currentUser = onlineList.find(item => item.uuid === uuid);
          if (type === 0) {
            broadcastToSend({ type: 0, onlineList: onlineList });
          } else if (type === 1) {
            broadcastToSend({
              type: 1,
              uuid,
              avatar: currentUser.avatar,
              name: currentUser.name,content,
              id: new Date().toISOString()
            });
          }
        },
        onClose: (request) => {
          // 删除当前socket
          console.log('客户端关闭socket')
        }
      }
    );
  }
});


function broadcastToSend (msg) {
  onlineList.forEach(user => {
    user.send(JSON.stringify(new successModel({ data: msg })));
  })
}
module.exports = router.routes();//暴露路由的routes方法
