require('module-alias/register');
const Koa = require('koa');
const koaStatic = require('koa-static'); // 静态文件
const koaConditional = require('koa-conditional-get'); // 协商缓存
const koaEtag = require('koa-etag');
const path = require('path');
const config = require('@config');
const { getIPAddress } = require('@utils');
const koaBody = require('koa-body'); // 解析post请求body
const parameter = require('koa-parameter'); // 校验接口参数
const koaSession = require('koa-session'); // 使用session,保存验证码数据
const koaCompress = require('koa-compress'); // 开启gzip
const { enhanceCtx, setWhiteList, checkAuth, logger, handleError, handleSocket } = require('@middlewares');
const route = require('@routes');
const fs = require('fs');

const koaJwt = require('koa-jwt');
const socketioJwt = require('socketio-jwt');
const app = new Koa();
app.keys = ['koaChatApplication'];
const server = require('http').createServer(app.callback());
let socketOptions = {
  path: '/chat-room',
  cors: {
    origin: config.WHITE_WEBSITES, // from the screenshot you provided
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization"],
    credentials: true
  }
}
const io = require('socket.io')(server, socketOptions);

parameter(app); // 参数校验

// 中间件
app.use(koaConditional()); // 使协商缓存返回304 // koa-static自动加上了last-modified
app.use(koaEtag());
app.use(koaStatic(path.resolve(__dirname, 'static'), { maxage: 60 * 60 * 24 * 30 * 1000, gzip: true })); // 强缓存30天 // cache-control // 托管静态文件
app.use(koaStatic(path.resolve(__dirname, 'public'), { maxage: 60 * 60 * 24 * 30 * 1000, gzip: true })); // 强缓存30天 // cache-control // 托管静态文件
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
app.use(handleError());
// app.use(setWhiteList(config.WHITE_WEBSITES)); // 白名单 // 前端代理
app.use(logger());
app.use(koaSession(config.KOA_SESSION, app));
app.use(koaBody({
  multipart: true,
  formidable:{
    uploadDir:path.join(__dirname,'public/temp/'), // 设置文件上传目录
    keepExtensions: true,    // 保持文件的后缀
    onFileBegin: (name, file) => { // 文件上传前的设置
      // 新建文件夹
      let paths = [path.join(__dirname, 'public/temp'), path.join(__dirname, 'public/upload')];
      paths.forEach(path => {
        !fs.existsSync(path) && fs.mkdirSync(path);
      })
    },
  }
})); // 解析body参数
app.use(
  koaJwt({ secret: config.JWT_SECRET }).unless({
    path: config.NOT_NEED_TOKEN_PATH_REGS
  })
);
app.use(enhanceCtx());
app.use(checkAuth()); // 多处登录互踢
// 路由
app.use(route.routes());
app.use(route.allowedMethods());

io.use(socketioJwt.authorize({
  secret: config.JWT_SECRET,
  handshake: true,
  auth_header_required: true
}));
io.on('connection', handleSocket(io));

// app.on('error', () =>
//   console.error('server error')
// );

server.listen(config.HTTP_PORT, () => {
  console.log(`http://${getIPAddress()}:${config.HTTP_PORT}`)
});
