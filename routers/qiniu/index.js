/*
 * @Description: 七牛云
 * @Author: astar
 * @Date: 2020-09-20 20:03:22
 * @LastEditTime: 2021-01-27 10:48:14
 * @LastEditors: astar
 */
const Router = require('koa-router');
const qiniu = require('qiniu');

const router = new Router();

// 获取七牛云token
router.post('/getToken', async ctx => {
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

module.exports = router.routes();
