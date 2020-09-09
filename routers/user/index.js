const Router = require('koa-router');
let router = new Router();

// 登录页面
router.post('/login', async ctx => {
  console.log(ctx.request.body)
  ctx.response.body = {
    result: 1,
    msg: 'success',
    data: {
      message: 'dd'
    }
  }
  // console.log(ctx);
});


module.exports = router.routes();
