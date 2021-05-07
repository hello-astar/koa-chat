/*
 * @Author: astar
 * @Date: 2021-02-06 15:43:45
 * @LastEditors: astar
 * @LastEditTime: 2021-05-06 11:19:57
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\user.js
 */
const Router = require('koa-router');
const router = new Router();
const userController = require('@controllers').user;
const groupController = require('@controllers').group;
const svgCaptcha = require('svg-captcha');


async function dealWithRes (ctx, callback) {
  try {
    let res = await callback();
    ctx.send(res);
  } catch (e) {
    if (typeof e === 'string') {
      ctx.sendError(e);
    } else {
      ctx.throw(500, e);
    }
  }
}
// 注册
router.post('/register', async ctx => {
  ctx.verifyParams({
    userName: { type: 'string', required: true },
    avatar: { type: 'string', required: true },
    password: { type: 'string', required: true },
    captcha: { type: 'string', required: true }
  });

  const { userName, avatar, password, captcha } = ctx.request.body;

  if (process.env.NODE_ENV !== 'development') {
    if (captcha.toLowerCase() !== ctx.session.captcha.toLowerCase()) {
      return ctx.sendError('验证码错误');
    }
  }
  try {
    let res = await userController.register({ userName, avatar, password });
    // 加入默认群组
    let defaultGroup = await groupController.findGroup({ isDefault: true });
    await groupController.joinMember({ groupId: defaultGroup._id, userId: res._id });
    ctx.send(res);
  } catch (e) {
    ctx.sendError(e);
  }
});

// 登录页面
router.post('/login', ctx => {
  ctx.verifyParams({
    userName: { type: 'string', required: true },
    password: { type: 'string', required: true },
    captcha: { type: 'string', required: true }
  });
  const { captcha, userName, password } = ctx.request.body;

  if (process.env.NODE_ENV !== 'development') {
    if (captcha.toLowerCase() !== ctx.session.captcha.toLowerCase()) {
      return ctx.sendError('验证码错误');
    }
  }
  return dealWithRes(ctx, userController.login.bind(userController, { userName, password }));
});

// 获取用户信息
router.get('/getUserInfo', ctx => {
  ctx.send(ctx.userInfo);
});

// 获取验证码图片
router.get('/getCaptcha', ctx => {
  const cap = svgCaptcha.create({
    size: 4, // 验证码长度
    width: 250,
    height: 100,
    fontSize: 100,
    ignoreChars: '0oO1ilI', // 验证码字符中排除 0o1i
    noise: 1 // 干扰线条的数量
    // color: false, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
    // background: '#eee' // 验证码图片背景颜色
  });
  // 将验证码保存到session
  ctx.session.captcha = cap.text;
  ctx.set('Content-Type', 'image/svg+xml');
  ctx.response.body = cap.data;
});

module.exports = router.routes();
