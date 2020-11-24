/*
 * @author: cmx
 * @Date: 2020-09-09 10:19:58
 * @LastEditors: cmx
 * @LastEditTime: 2020-11-24 16:45:23
 * @Description: 文件描述
 * @FilePath: \koa-chat\routers\chat\index.js
 */
const Router = require('koa-router');
const router = new Router();
const { userController, chatController } = require('../../db');
const { successModel, errorModel } = require('../../model').response;
const { onlineUserModel } = require('../../model').user;
let records = [];
let onlineList = [];

router.all('/room', async ctx => {
  const token = ctx.request.query.token;
  let { name, avatar, uuid } = {};
  try {
    let res = await userController.getUserInfo({ token });
    name = res.name;
    avatar = res.avatar;
    uuid = res.uuid;
  } catch (e) {
    return ctx.websocket.send(JSON.stringify(new errorModel({ msg: e })));
  }
  const index = onlineList.findIndex(item => item.uuid === uuid);
  if (index !== -1) {
    onlineList[index].send(new errorModel({ msg: '该用户已在别处登录' }));
    onlineList.splice(index, 1);
  };
  let currentUser = new onlineUserModel({ name, avatar, uuid });
  onlineList.push(currentUser);
  currentUser.initSocket(
    ctx.websocket,
    {
      onMessage: async (request) => {
        const req = JSON.parse(request);
        const { type, content } = req;
        let currentUser = onlineList.find(item => item.uuid === uuid);
        if (type === 0) {
          broadcastToSend(new successModel({ data: { type: 0, onlineList: onlineList.map(item => ({ name: item.name, avatar: item.avatar, uuid: item.uuid })) } }));
        } else if (type === 1) {
          try {
            records.push({
              uuid: currentUser.uuid,
              avatar: currentUser.avatar,
              name: currentUser.name,
              content
            });
            await chatController.add({ content, user: { avatar: currentUser.avatar, name: currentUser.name, uuid: currentUser.uuid }});
            broadcastToSend(new successModel({ data: { type: 1, records } }));
          } catch (e) {
            broadcastToSend(new errorModel())
          }
        }
      },
      onClose: () => {
        console.log('有人断开了')
        const index = onlineList.findIndex(item => item.uuid === uuid);
        if (index !== -1) {
          onlineList.splice(index, 1);
        }
        broadcastToSend(new successModel({ data: { type: 0, onlineList: onlineList.map(item => ({ name: item.name, avatar: item.avatar, uuid: item.uuid })) } }));
      }
    }
  );
  broadcastToSend(new successModel({ data: { type: 0, onlineList: onlineList.map(item => ({ name: item.name, avatar: item.avatar, uuid: item.uuid })) }}));
  broadcastToSend(new successModel({ data: { type: 1, records: records }}));
});


function broadcastToSend (msg) {
  console.log('广播', msg)
  onlineList.forEach(user => {
    user.send(msg);
  })
}

module.exports = router.routes(); //暴露路由的routes方法
