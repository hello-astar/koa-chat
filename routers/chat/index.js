const Router = require('koa-router');
let router = new Router();
let onLineList = require('../user').userList;


router.all('/', async ctx => {
  // 判断参数中是否有uuid且该uuid在onLineList中，符合条件则是在线用户，没有则新建user
  console.log(ctx, '1')
  console.log(userList)
  ctx.websocket.send(userList);
  
  ctx.websocket.on('message', function(request) {
    const req = JSON.parse(request);
    console.log(req)
    if (req.uuid) {

    }
    console.log(message, '2')
    broadcastToSend(message);
    // ctx.websocket.send(`用户说：${message}`);
  });

  ctx.websocket.on('close', () => {
    // 在数组中寻找当前用户，直接删除
    console.log('前端关闭了websocket');
  });
});


function broadcastToSend (msg) {
  onLineList.forEach(user => {
    user.socket.send(msg);
  })
}
module.exports = router.routes();//暴露路由的routes方法
