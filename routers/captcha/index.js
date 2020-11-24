/*
 * @author: cmx
 * @Date: 2020-11-24 16:38:40
 * @LastEditors: cmx
 * @LastEditTime: 2020-11-24 18:00:58
 * @Description: 验证码
 * @FilePath: \koa-chat\routers\captcha\index.js
 */

const Router = require('koa-router');
const { successModel, errorModel } = require('../../model').response;
const svgCaptcha = require('svg-captcha');
const router = new Router();

// 获取验证码图片
router.get('/get', ctx => {
  try {
    const cap = svgCaptcha.create({
      size: 4, // 验证码长度
      width:160,
      height:60,
      fontSize: 50,
      ignoreChars: '0oO1ilI', // 验证码字符中排除 0o1i
      noise: 2, // 干扰线条的数量
      color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
      background: '#eee' // 验证码图片背景颜色
    })
    ctx.response.body = new successModel({
      data: {
        img: cap.data,
        text: cap.text
      }
    });
  } catch (e) {
    ctx.response.body = new errorModel({
      msg: e
    });
  }
})

module.exports = router.routes();
