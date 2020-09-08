const Router = require('koa-router');
let router = new Router();

router.all('/',async ctx => {
  // console.log(ctx);
  ctx.websocket.on('message', function(message) {
    console.log(message.message)
    ctx.websocket.send(`用户说：${message}`);
  });
});


module.exports = router.routes();//暴露路由的routes方法
