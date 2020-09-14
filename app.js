const Koa = require('koa');
const koaStatic = require('koa-static');
const path = require('path');
const config = require('./config');
const bodyParser = require('koa-bodyparser');
// const ModelDb = require('./db');

// 路由
const router = require('koa-router');
const route = new router();
const wsRoute = new router();


// koa封装的websocket这是官网（很简单有时间去看一下https://www.npmjs.com/package/koa-websocket）
const websockify = require('koa-websocket');
const app = websockify(new Koa());

app.use(bodyParser())
// 托管静态文件
app.use(koaStatic(path.resolve(__dirname, 'static')))


// 主要解决跨域问题
app.use(async (ctx, next)=> {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200; 
  } else {
    await next();
  }
});

// app.use(async ctx => {
//   let data = await ModelDb.query()
//   console.log('====================', data);
//   next();
// })

app.ws.use(function (ctx, next) {
    return next(ctx)
});


route.use('/user',require('./routers/user')); // 普通请求
wsRoute.use('/chat',require('./routers/chat')); // websocket连接
app.use(route.routes());
app.ws.use(wsRoute.routes());

app.on('error', (err, ctx) =>
  console.error('server error', err)
)


app.listen(config.PORT, () => {
  console.log(`${config.BASE_URL}:${config.PORT}`)
})