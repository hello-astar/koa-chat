/*
 * @Description: 七牛云
 * @Author: astar
 * @Date: 2020-09-20 20:03:22
 * @LastEditTime: 2020-11-24 16:45:11
 * @LastEditors: cmx
 */
const Router = require('koa-router');
const { successModel, errorModel } = require('../../model').response;
const qiniu = require('qiniu');

const router = new Router();

// 获取七牛云token
router.post('/getToken', async ctx => {
  try {
    const accessKey = 'bImBW9c57dN1JJfp-WZXugs0IK70iHIPBCpXqTYR';
    const secretKey = 'oi4dSoN2py0uCNHoiDMpAZw8YG8xfjRBVqZsqiAz';
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const options = {
      scope: 'astar-img'
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);
    ctx.response.body = new successModel({
      data: { token: uploadToken }
    });
  } catch (e) {
    ctx.response.body = new errorModel({
      msg: '获取token失败'
    });
  }
});

module.exports = router.routes();
