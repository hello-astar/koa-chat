// 基于koa-websocket实现的即时通讯
// 把下面的这个几个模块安装一下
// 这只是功能模块完成，后期肯定要连接数据库保存数据
const Koa = require('koa')
const koaStatic = require('koa-static') // 处理静态资源
const path = require('path')
// 路由
const route = require('koa-route')
// koa封装的websocket这是官网（很简单有时间去看一下https://www.npmjs.com/package/koa-websocket）
const websockify = require('koa-websocket')
const app = websockify(new Koa());
const config = require('./config')
// 托管静态文件
app.use(koaStatic(path.resolve(__dirname, 'static')))

app.ws.use(function (ctx, next) {
    return next(ctx)
})
app.ws.use(route.all('/', function (ctx) {
    ctx.websocket.on('message', function (message) {
        // 返回给前端的数据
        ctx.websocket.send(message)
    })
}))
app.on('error', (err, ctx) =>
  console.error('server error', err)
)
app.listen(config.PORT, () => {
  console.log(`${config.BASE_URL}:${config.PORT}`)
})
// 会默认打开127.0.0.1:3000这个端口号