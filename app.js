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
let server = require('http').createServer(app.callback());
const options = {
  key: fs.readFileSync("./server.key", "utf8"),
  cert: fs.readFileSync("./server.cert", "utf8")
};
const serverhttps = require('https').createServer(options, app.callback());
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
const httpsio = require('socket.io')(serverhttps, socketOptions);

parameter(app); // 参数校验

// 中间件
app.use(koaConditional()); // 使协商缓存返回304 // koa-static自动加上了last-modified
app.use(koaEtag());
app.use(koaStatic(path.resolve(__dirname, 'static'), { maxage: 10 * 1000, gzip: true })); // 强缓存10s // cache-control // 托管静态文件
app.use(koaStatic(path.resolve(__dirname, 'public'), { maxage: 10 * 1000, gzip: true })); // 强缓存10s // cache-control // 托管静态文件
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
app.use(setWhiteList(config.WHITE_WEBSITES)); // 白名单
app.use(logger());
app.use(async (ctx, next) => {
  let koaSessionConfig = {
    ...config.KOA_SESSION
  }
  // 测试环境支持跨站请求cookie
  // https://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html
  if (process.env.NODE_ENV === 'development'
      && ctx.request.origin.includes('https')
      && ctx.request.header['sec-fetch-site'] === 'cross-site'
      && ctx.req.url.includes('/tool/getCaptcha')) {
    koaSessionConfig.sameSite = 'none'
    koaSessionConfig.secure = true
  }
  return koaSession(koaSessionConfig, app)(ctx, next)
});
// app.use(koaSession(config.KOA_SESSION, app))
app.use(koaBody({
  multipart: true,
  formidable:{
    uploadDir:path.join(__dirname,'public/upload/'), // 设置文件上传目录
    keepExtensions: true,    // 保持文件的后缀
    onFileBegin:(name,file) => { // 文件上传前的设置
    }
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
httpsio.use(socketioJwt.authorize({
  secret: config.JWT_SECRET,
  handshake: true,
  auth_header_required: true
}));
io.on('connection', handleSocket(io));
httpsio.on('connection', handleSocket(httpsio));

// app.on('error', () =>
//   console.error('server error')
// );

server.listen(config.HTTP_PORT, () => {
  console.log(`http://${getIPAddress()}:${config.HTTP_PORT}`)
});

serverhttps.listen(config.HTTPS_PORT, () => {
  console.log(`https://${getIPAddress()}:${config.HTTPS_PORT}`)
});