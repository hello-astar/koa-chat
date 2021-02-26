# koa-chat
`koa-chat`是一个使用koa实现的在线聊天应用服务端，该项目基于nodejs、koa、socket.io等技术开发。

[前端项目(vue-chat)](https://github.com/hello-astar/vue-chat)

# 功能
1. 用户-登陆注册、用户信息获取、JWT校验
2. 聊天室-在线通信、获取聊天历史记录、获取在线用户列表

# To-Do-List
- [x] 基本websocket通信 
- [x] 在线用户通信
- [x] mongodb
- [x] 用户详情接口
- [x] 引入jwt进行登录验证
- [x] 登录注册密码加密
- [x] socket校验用户身份
- [x] 七牛云存储
- [x] 设置缓存,性能优化
- [x] 实现jwt下的同端互踢，增加最后登录时间进行对比
- [ ] 密码加密加盐
- [x] 配置koa-logger，启用日志
- [x] 热更新nodemon
- [x] 增加发送表情包功能
- [ ] redis缓存
- [ ] 优化当前在线人功能
- [ ] 试下koa-compress开启gzip

# 安装运行
1. 拉取项目
```
git clone git@github.com:hello-astar/koa-chat.git
```
2. 安装依赖
```
npm install
```
3. 运行项目
```
npm run dev
```