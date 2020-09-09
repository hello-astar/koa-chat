const Router = require('koa-router');
const uuidv1 = require('uuid').v1;


console.log(uuidv1());


let router = new Router();

let onLineList = []; // 当前在线人

router.all('/room', async ctx => {
  // 判断参数中是否有uuid且该uuid在onLineList中，符合条件则是在线用户，没有则新建user
  console.log(ctx.request.body, '1')
  ctx.websocket.on('message', function(request) {
    const req = JSON.parse(request);
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
