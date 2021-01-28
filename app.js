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
const { handleResponse, setWhiteList, checkAuth } = require('./middlewares');
const handleSocket = require('./socket');
// 路由
const router = require('koa-router');
const route = new router();

const koaJwt = require('koa-jwt');
const socketioJwt = require('socketio-jwt');
const app = new Koa();
app.use(error(function (err) {
  console.log('format-error', err)
  return {
    result: err.status,
    msg: err.message,
    data: null
  }
}));
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

io.use(socketioJwt.authorize({
  secret: config.JWT_SECRET,
  handshake: true,
  auth_header_required: true
}));

io.on('connection', handleSocket(io));

// session
app.keys = ['koaChatApplication'];
app.use(koaSession(config.KOA_SESSION, app));
app.use(bodyParser());
app.use(parameter(app));
app.use(koaConditional()); // 10smaxage后走last-modified(协商缓存)
// 托管静态文件
app.use(koaStatic(path.resolve(__dirname, 'static'), { maxage: 10 * 1000 })); // 强缓存10s // cache-control
// 白名单
app.use(setWhiteList(config.WHITE_WEBSITES));

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

// 多处登录互踢
app.use(checkAuth());

app.use(handleResponse());
route.use('/user', require('./routers/user')); // 普通请求
route.use('/qiniu', require('./routers/qiniu'));
app.use(route.routes());
app.use(route.allowedMethods());

app.on('error', (err) =>
  console.error('server error', err)
)


server.listen(config.PORT, () => {
  console.log(`${config.BASE_URL}:${config.PORT}`)
})