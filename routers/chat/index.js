/*
 * @author: cmx
 * @Date: 2020-09-09 10:19:58
 * @LastEditors: cmx
 * @LastEditTime: 2020-09-10 18:28:45
 * @Description: 文件描述
 * @FilePath: \koa-chat\routers\chat\index.js
 */
const Router = require('koa-router');
let router = new Router();
let onlineList = require('../../onlineList').userList;


router.all('/', async ctx => {
  // 判断参数中是否有uuid且该uuid在onlineList中，符合条件则是在线用户，没有则新建user
  // console.log(ctx)
  ctx.websocket.send(JSON.stringify({
    result: 1,
    msg: 'success',
    data: {
      type: 0,
      onlineList
    }
  }));
  
  ctx.websocket.on('message', function(request) {
    const req = JSON.parse(request);
    const { type, uuid, content } = req;
    console.log(req) // type: 1, uuid: getUUID(), content: this.text
    if (type === 1) {
      broadcastToSend(req);
    }
    // ctx.websocket.send(`用户说：${message}`);
  });

  ctx.websocket.on('close', () => {
    // 在数组中寻找当前用户，直接删除
    console.log('前端关闭了websocket');
  });
});


function broadcastToSend (msg) {
  onlineList.forEach(user => {
    user.send(msg);
  })
}
module.exports = router.routes();//暴露路由的routes方法
