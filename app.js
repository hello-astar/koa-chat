const Koa = require('koa');
const koaStatic = require('koa-static'); // 静态文件
const path = require('path');
const config = require('./config');
const bodyParser = require('koa-bodyparser'); // 解析post请求body
const parameter = require('koa-parameter'); // 校验接口参数
const error = require('koa-json-error'); // 错误处理并返回json格式

// 路由
const router = require('koa-router');
const route = new router();
const wsRoute = new router();


// koa封装的websocket这是官网（很简单有时间去看一下https://www.npmjs.com/package/koa-websocket）
const websockify = require('koa-websocket');
const app = websockify(new Koa());

app.use(bodyParser());
app.use(parameter(app));
app.use(error());
// 托管静态文件
app.use(koaStatic(path.resolve(__dirname, 'static')));


// 主要解决跨域问题
app.use(async (ctx, next)=> {
  const allowHost = ['192.168.23.179:3000', 'localhost:3000'];
  if (allowHost.includes(ctx.request.header.host)) {
    ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin);
  }
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
});

app.ws.use(function (ctx, next) {
    return next(ctx);
});


route.use('/user', require('./routers/user')); // 普通请求
wsRoute.use('/chat', require('./routers/chat')); // websocket连接
app.use(route.routes());
app.ws.use(wsRoute.routes());

// app.use(async ctx => {
//   ctx.verifyParams({
//     uuid: { type: 'string', required: true }
//   })
//   const { uuid } = ctx.request.body;
//   try {
//     let res = await userController.query({ uuid });
//     if (res.length === 1) {
//       next();
//     } else {
//       ctx.response.body = new errorModel({
//         msg: '登录失败'
//       });
//     }
//   } catch (e) {
//     ctx.response.body = new errorModel({
//       msg: '登录失败'
//     });
//   }
// })
app.on('error', (err, ctx) =>
  console.error('server error', err)
)


app.listen(config.PORT, () => {
  console.log(`${config.BASE_URL}:${config.PORT}`)
})