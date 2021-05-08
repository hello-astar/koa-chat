/*
 * @Author: astar
 * @Date: 2021-05-08 17:47:11
 * @LastEditors: astar
 * @LastEditTime: 2021-05-08 18:09:15
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\tool.js
 */
const Router = require('koa-router');
const router = new Router();
const svgCaptcha = require('svg-captcha');
const qiniu = require('qiniu');
const axios = require('axios');
const { decodeBaiduImgURL } = require('@utils');

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

// 获取七牛云token
router.get('/getQiuniuToken', async ctx => {
  const accessKey = 'bImBW9c57dN1JJfp-WZXugs0IK70iHIPBCpXqTYR';
  const secretKey = 'oi4dSoN2py0uCNHoiDMpAZw8YG8xfjRBVqZsqiAz';
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const options = {
    scope: 'astar-img'
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);
  ctx.send({ token: uploadToken });
});

// 搜索百度图片
router.get('/searchGifs', async ctx => {
  ctx.verifyParams({
    keyword: { type: 'string', required: true }
  });
  const { keyword } = ctx.query;
  const limit = 3;
  const width = 300;
  const height = 300;
  let pn = Math.abs(Math.floor(Math.random() * 21)) + 0; // 0-20随机挑选
  const res = await axios({
    method: 'get',
    url: `https://image.baidu.com/search/acjson?tn=resultjson_com&logid=10835174772054701445&ipn=rj&ct=201326592&is=&fp=result&queryWord=${encodeURIComponent(keyword)}&cl=2&lm=6&ie=utf-8&oe=utf-8&adpicid=&st=-1&z=&ic=&hd=0&latest=0&copyright=0&word=${encodeURIComponent(keyword)}&s=&se=&tab=&width=${width}&height=${height}&face=0&istype=2&qc=&nc=1&fr=&expermode=&force=&pn=${pn}&rn=${limit}&gsm=d2&1618561098342=`,
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
    }
  });
  if (res.data.listNum > 50) { // 数量太少的说明不热门，不推送
    const list = res.data.data.slice(0, res.data.data.length - 1);
    ctx.send(list.map(item => ({ url: item.type === 'gif' ? decodeBaiduImgURL(item.objURL) : item.middleURL, id: item.di, type: item.type })));
  } else {
    ctx.send([]);
  }
})
module.exports = router.routes();