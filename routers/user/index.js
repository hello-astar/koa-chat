/*
 * @Description: 
 * @Author: astar
 * @Date: 2020-09-09 20:53:41
 * @LastEditTime: 2021-01-12 17:45:30
 * @LastEditors: cmx
 */
const Router = require('koa-router');
const { user, response } = require('../../model');
const { successModel, errorModel } = response;
const { onlineUserModel } = user;
const { userController } = require('../../db');
const router = new Router();
const svgCaptcha = require('svg-captcha');

async function dealWithRes (ctx, callback) {
  try {
    let res = await callback();
    ctx.response.body = new successModel({
      data: res
    });
  } catch (e) {
    ctx.response.body = new errorModel({
      msg: e
    });
  }
}
// 注册
router.post('/register', async ctx => {
  ctx.verifyParams({
    name: { type: 'string', required: true },
    avatar: { type: 'string', required: true  },
    password: { type: 'string', required: true },
    captcha: { type: 'string', required: true }
  });
  const { name, avatar, password, captcha } = ctx.request.body;
  if (captcha.toLowerCase() !== ctx.session.captcha.toLowerCase()) {
    return ctx.response.body = new errorModel({
      msg: '验证码错误'
    });
  }

  let user = new onlineUserModel({ name, avatar });
  return dealWithRes(ctx, userController.register.bind(userController, { uuid: user.uuid, name, avatar, password }));
});

// 登录页面
router.post('/login', ctx => {
  ctx.verifyParams({
    name: { type: 'string', required: true },
    password: { type: 'string', required: true }
  });
  const { name, password } = ctx.request.body;
  return dealWithRes(ctx, userController.login.bind(userController, { ctx, name, password }));
});

// 获取用户信息
router.post('/getUserInfo', ctx => {
  return dealWithRes(ctx, userController.getUserInfo.bind(userController, { token: ctx.headers.authorization.split(' ')[1] }))
});

// 获取验证码图片
router.get('/getCaptcha', ctx => {
  try {
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
  } catch (e) {
    ctx.response.body = new errorModel({
      msg: e
    });
  }
});
module.exports = router.routes();
