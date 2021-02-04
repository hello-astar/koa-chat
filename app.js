const Koa = require('koa');
const koaStatic = require('koa-static'); // 静态文件
const koaConditional = require('koa-conditional-get'); // 协商缓存
const path = require('path');
const config = require('./config');
const bodyParser = require('koa-bodyparser'); // 解析post请求body
const parameter = require('koa-parameter'); // 校验接口参数
const koaSession = require('koa-session'); // 使用session,保存验证码数据
const { handleResponse, setWhiteList, checkAuth, logger, handleError } = require('./middlewares');
const handleSocket = require('./socket');
const router = require('koa-router');

const route = new router();
const koaJwt = require('koa-jwt');
const socketioJwt = require('socketio-jwt');
const app = new Koa();
app.keys = ['koaChatApplication'];
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, {
  cors: {
    origin: config.WHITE_WEBSITES, // from the screenshot you provided
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization"],
    credentials: true
  }
});

// 中间件
app.use(koaStatic(path.resolve(__dirname, 'static'), { maxage: 10 * 1000 })); // 强缓存10s // cache-control // 托管静态文件
app.use(koaConditional()); // 10smaxage后走last-modified(协商缓存)
app.use(handleError());
app.use(logger());
io.use(socketioJwt.authorize({
  secret: config.JWT_SECRET,
  handshake: true,
  auth_header_required: true
}));
io.on('connection', handleSocket(io));
app.use(koaSession(config.KOA_SESSION, app));
app.use(bodyParser()); // 解析body参数
app.use(parameter(app)); // 参数校验
app.use(setWhiteList(config.WHITE_WEBSITES)); // 白名单
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
app.use(checkAuth()); // 多处登录互踢
app.use(handleResponse());

// 路由
route.use('/user', require('./routes/user')); // 普通请求
route.use('/qiniu', require('./routes/qiniu'));
app.use(route.routes());
app.use(route.allowedMethods());

app.on('error', (err) =>
  console.error('server error', err)
);

server.listen(config.PORT, () => {
  console.log(`${config.BASE_URL}:${config.PORT}`)
});