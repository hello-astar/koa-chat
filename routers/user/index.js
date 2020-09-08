const Router = require('koa-router');
let router = new Router();

// 登录页面
router.all('/', async ctx => {
  // ctx.status = 200
  console.log(ctx)
  ctx.response.body = {
    message: 'dd'
  }
  console.log(ctx);
});


module.exports = router.routes();//暴露路由的routes方法
