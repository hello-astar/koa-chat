require('module-alias/register');
const Koa = require('koa');
const koaStatic = require('koa-static'); // 静态文件
const koaConditional = require('koa-conditional-get'); // 协商缓存
const path = require('path');
const config = require('@config');
const { getIPAddress } = require('@utils');
const bodyParser = require('koa-bodyparser'); // 解析post请求body
const parameter = require('koa-parameter'); // 校验接口参数
const koaSession = require('koa-session'); // 使用session,保存验证码数据
const koaCompress = require('koa-compress'); // 开启gzip
const { handleResponse, setWhiteList, checkAuth, logger, handleError, handleSocket } = require('@middlewares');
const route = require('@routes');
const fs = require('fs');

const koaJwt = require('koa-jwt');
const socketioJwt = require('socketio-jwt');
const app = new Koa();
app.keys = ['koaChatApplication'];
let server = require('http').createServer(app.callback());
const options = {
  key: fs.readFileSync("./server.key", "utf8"),
  cert: fs.readFileSync("./server.cert", "utf8")
};
const serverhttps = require('https').createServer(options, app.callback());
const io = require('socket.io')(server, {
  cors: {
    origin: config.WHITE_WEBSITES, // from the screenshot you provided
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization"],
    credentials: true
  }
});

const httpsio = require('socket.io')(serverhttps, {
  cors: {
    origin: config.WHITE_WEBSITES, // from the screenshot you provided
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization"],
    credentials: true
  }
})

parameter(app); // 参数校验

// 中间件
app.use(handleError());
app.use(koaCompress({
  filter (content_type) {
    // console.log(/image/gi.test(content_type))
    return /text|image|javascript/gi.test(content_type)
  },
  threshold: 0, // 压缩门槛
  gzip: {
    flush: require('zlib').constants.Z_SYNC_FLUSH
  },
  deflate: {
    flush: require('zlib').constants.Z_SYNC_FLUSH,
  },
  br: false // disable brotli
}));
app.use(koaStatic(path.resolve(__dirname, 'static'), { maxage: 10 * 1000, gzip: true })); // 强缓存10s // cache-control // 托管静态文件
app.use(koaConditional()); // 10smaxage后走last-modified(协商缓存)
app.use(logger());
io.use(socketioJwt.authorize({
  secret: config.JWT_SECRET,
  handshake: true,
  auth_header_required: true
}));
httpsio.use(socketioJwt.authorize({
  secret: config.JWT_SECRET,
  handshake: true,
  auth_header_required: true
}));
io.on('connection', handleSocket(io));
httpsio.on('connection', handleSocket(httpsio));
app.use(koaSession(config.KOA_SESSION, app));
app.use(bodyParser()); // 解析body参数
app.use(setWhiteList(config.WHITE_WEBSITES)); // 白名单
app.use(
  koaJwt({ secret: config.JWT_SECRET }).unless({
    path: config.NOT_NEED_TOKEN_PATH_REGS
  })
);
app.use(checkAuth()); // 多处登录互踢
app.use(handleResponse());
// 路由
app.use(route.routes());
app.use(route.allowedMethods());

// app.on('error', () =>
//   console.error('server error')
// );

server.listen(config.PORT, () => {
  console.log(`http://${getIPAddress()}:${config.PORT}`)
});

serverhttps.listen(443, () => {
  console.log(`https://${getIPAddress()}`)
});