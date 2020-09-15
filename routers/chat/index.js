/*
 * @author: cmx
 * @Date: 2020-09-09 10:19:58
 * @LastEditors: cmx
 * @LastEditTime: 2020-09-15 18:00:41
 * @Description: 文件描述
 * @FilePath: \koa-chat\routers\chat\index.js
 */
const Router = require('koa-router');
let router = new Router();
let userController = require('../../db/user');
const { successModel, errorModel } = require('../../model').response;
const { onlineUserModel } = require('../../model').user;
let records = [];
let onlineList = [];

router.all('/room', async ctx => {
  const uuid = ctx.request.query.uuid;
  let res = await userController.query({ uuid });
  if (res.length === 1) {
    let currentUser = new onlineUserModel(res[0]);
    onlineList.push(currentUser);
    currentUser.initSocket(
      ctx.websocket,
      {
        onMessage: (request) => {
          const req = JSON.parse(request);
          const { type, uuid, content } = req;
          let currentUser = onlineList.find(item => item.uuid === uuid);
          if (type === 0) {
            broadcastToSend(new successModel({ data: { type: 0, onlineList: onlineList } }));
          } else if (type === 1) {
            records.push({
              uuid: currentUser.uuid,
              avatar: currentUser.avatar,
              name: currentUser.name,
              content,
              id: new Date().toISOString()
            })
            broadcastToSend(new successModel({ data: { type: 1, records } }));
          }
        },
        onClose: () => {
          const index = onlineList.findIndex(item => item.uuid === uuid);
          if (index !== -1) {
            onlineList.splice(index, 1)
          }
          broadcastToSend(new successModel({ data: { type: 0, onlineList: onlineList } }));
        }
      }
    );
    broadcastToSend(new successModel({ data: { type: 0, onlineList }}));
  }
});


function broadcastToSend (msg) {
  onlineList.forEach(user => {
    user.send(JSON.stringify(msg));
  })
}
module.exports = router.routes();//暴露路由的routes方法
