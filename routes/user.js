/*
 * @Author: astar
 * @Date: 2021-02-06 15:43:45
 * @LastEditors: cmx
 * @LastEditTime: 2021-02-21 15:40:22
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\user.js
 */
const Router = require('koa-router');
const router = new Router();
const userController = require('@controllers').user;
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
    name: { type: 'string', required: true },
    avatar: { type: 'string', required: true },
    password: { type: 'string', required: true },
    captcha: { type: 'string', required: true }
  });

  const { name, avatar, password, captcha } = ctx.request.body;

  if (captcha.toLowerCase() !== ctx.session.captcha.toLowerCase()) {
    return ctx.sendError('验证码错误');
  }
  return dealWithRes(ctx, userController.register.bind(userController, { name, avatar, password }));
});

// 登录页面
router.post('/login', ctx => {
  ctx.verifyParams({
    name: { type: 'string', required: true },
    password: { type: 'string', required: true },
    captcha: { type: 'string', required: true }
  });
  const { captcha, name, password } = ctx.request.body;
  if (captcha.toLowerCase() !== ctx.session.captcha.toLowerCase()) {
    return ctx.sendError('验证码错误');
  }
  return dealWithRes(ctx, userController.login.bind(userController, { name, password }));
});

// 获取用户信息
router.get('/getUserInfo', ctx => {
  return dealWithRes(ctx, userController.getUserInfoByToken.bind(userController, { token: ctx.headers.authorization.split(' ')[1] }))
});

// 获取验证码图片
router.get('/getCaptcha', ctx => {
  const cap = svgCaptcha.createMathExpr({
    size: 4, // 验证码长度
    width:160,
    height:60,
    fontSize: 50,
    ignoreChars: '0oO1ilI', // 验证码字符中排除 0o1i
    noise: 2, // 干扰线条的数量
    color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
    background: '#eee' // 验证码图片背景颜色
  });
  // 将验证码保存到session
  ctx.session.captcha = cap.text;
  ctx.set('Content-Type', 'image/svg+xml');
  ctx.response.body = cap.data;
});

module.exports = router.routes();
