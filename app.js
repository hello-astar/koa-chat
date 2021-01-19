const Koa = require('koa');
const koaStatic = require('koa-static'); // 静态文件
const koaConditional = require('koa-conditional-get'); // 协商缓存
const path = require('path');
const config = require('./config');
const bodyParser = require('koa-bodyparser'); // 解析post请求body
const parameter = require('koa-parameter'); // 校验接口参数
const error = require('koa-json-error'); // 错误处理并返回json格式
const koaSession = require('koa-session'); // 使用session,保存验证码数据
const logger = require('koa-logger');
const Moment = require("moment");
// 路由
const router = require('koa-router');
const route = new router();

const koaJwt = require('koa-jwt');
const socketioJwt = require('socketio-jwt');
const app = new Koa();
app.use(logger(str => {
  console.log(Moment().format('YYYY-MM-DD HH:mm:ss')+str);
}));

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, {
  cors: {
    origin: config.WHITE_WEBSITES, // from the screenshot you provided
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization"],
    credentials: true
  }
});
let onlineList = [];
let record = [];

io.use(socketioJwt.authorize({
  secret: config.JWT_SECRET,
  handshake: true,
  auth_header_required: true
}));

io.on('connection', socket => {
  const index = onlineList.findIndex(item => item.decoded_token.uuid === socket.decoded_token.uuid);
  if (index !== -1) {
    socket.emit('logout', '该用户已在别处登录');
    onlineList.splice(index, 1);
  };
  onlineList.push(socket);
  io.emit("online-list", onlineList.map(item => item.decoded_token));
  socket.emit('record-list', record);

  socket.on("message", msg => {
    record.push({ ...socket.decoded_token,content: String(msg) });
    io.emit('record-list', record);
  });

  socket.on("disconnect", reason => {
    console.log('有人断开了', reason)
    const index = onlineList.findIndex(item => item.id === socket.id);
    if (index !== -1) {
      onlineList.splice(index, 1);
    }
    io.emit("online-list", onlineList.map(item => item.decoded_token));
  })
});


// session
app.keys = ['koaChatApplication'];
app.use(koaSession({
  key: 'koaChatApplication.sess', /** (string) cookie key (default is koa.sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
  secure: false, /** (boolean) secure cookie*/
  sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
}, app));
app.use(bodyParser());
app.use(parameter(app));
app.use(error());
app.use(koaConditional()); // 10smaxage后走last-modified(协商缓存)
// 托管静态文件
app.use(koaStatic(path.resolve(__dirname, 'static'), { maxage: 10 * 1000 })); // 强缓存10s // cache-control
app.use(async (ctx, next)=> {
    const allowHost = config.WHITE_WEBSITES; // 白名单
    if (allowHost.includes(ctx.request.header.origin)) {
      ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin);
      ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
      ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
      ctx.set('Access-Control-Allow-Credentials', true);
    }
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
      /^\/user\/getCaptcha/,
      /^\/qiniu\/getToken/
    ]
  })
);

// app.ws.use();
route.use('/user', require('./routers/user')); // 普通请求
route.use('/qiniu', require('./routers/qiniu'));
app.use(route.routes());

app.on('error', (err, ctx) =>
  console.error('server error', err)
)


server.listen(config.PORT, () => {
  console.log(`${config.BASE_URL}:${config.PORT}`)
})