// 基于koa-websocket实现的即时通讯
// 把下面的这个几个模块安装一下
// 这只是功能模块完成，后期肯定要连接数据库保存数据
const Koa = require('koa');
const koaStatic = require('koa-static'); // 处理静态资源
const path = require('path');
const config = require('./config');
// 路由
const router = require('koa-router');

const route = new router();
const wsRoute = new router();
// koa封装的websocket这是官网（很简单有时间去看一下https://www.npmjs.com/package/koa-websocket）
const websockify = require('koa-websocket')
const app = websockify(new Koa());


// 托管静态文件
app.use(koaStatic(path.resolve(__dirname, 'static')))

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

app.ws.use(function (ctx, next) {
    return next(ctx)
});

route.use('/user',require('./routers/user'));
wsRoute.use('/chat',require('./routers/chat'));

app.use(route.routes());
app.ws.use(wsRoute.routes());

app.on('error', (err, ctx) =>
  console.error('server error', err)
)
app.listen(config.PORT, () => {
  console.log(`${config.BASE_URL}:${config.PORT}`)
})
// 会默认打开127.0.0.1:3000这个端口号