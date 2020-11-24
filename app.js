const Koa = require('koa');
const koaStatic = require('koa-static'); // 静态文件
const koaConditional = require('koa-conditional-get'); // 协商缓存
const path = require('path');
const config = require('./config');
const bodyParser = require('koa-bodyparser'); // 解析post请求body
const parameter = require('koa-parameter'); // 校验接口参数
const error = require('koa-json-error'); // 错误处理并返回json格式
// 路由
const router = require('koa-router');
const route = new router();
const wsRoute = new router();

const koaJwt = require('koa-jwt');
// koa封装的websocket这是官网（很简单有时间去看一下https://www.npmjs.com/package/koa-websocket）
const websockify = require('koa-websocket');
const app = websockify(new Koa());

app.use(bodyParser());
app.use(parameter(app));
app.use(error());
app.use(koaConditional()); // 10smaxage后走last-modified(协商缓存)
// 托管静态文件
app.use(koaStatic(path.resolve(__dirname, 'static'), { maxage: 10 * 1000 })); // 强缓存10s // cache-control
app.use(async (ctx, next)=> {
    const allowHost = ['192.168.23.179:3000', 'localhost:3000', '192.168.0.105:3000']; // 白名单
    if (allowHost.includes(ctx.request.header.host)) {
      ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin);
    }
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (ctx.method == 'OPTIONS') {
      ctx.body = 200;
    } else {
      await next();
    }
  }
)

app.use(
  koaJwt({ secret: config.JWT_SECRET }).unless({
    path: [
      /^\/user\/login/,
      /^\/user\/register/,
      /^\/qiniu\/getToken/,
      /^\/captcha\/get/
    ]
  })
);

route.use('/captcha', require('./routers/captcha'));
route.use('/user', require('./routers/user')); // 普通请求
route.use('/qiniu', require('./routers/qiniu'));
wsRoute.use('/chat', require('./routers/chat')); // websocket连接
app.use(route.routes());
app.ws.use(wsRoute.routes());

app.on('error', (err, ctx) =>
  console.error('server error', err)
)


app.listen(config.PORT, () => {
  console.log(`${config.BASE_URL}:${config.PORT}`)
})