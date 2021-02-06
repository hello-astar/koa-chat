/*
 * @Author: astar
 * @Date: 2021-02-06 15:44:41
 * @LastEditors: astar
 * @LastEditTime: 2021-02-06 15:44:51
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\qiniu.js
 */
const Router = require('koa-router');
const qiniu = require('qiniu');

const router = new Router();

// 获取七牛云token
router.get('/getToken', async ctx => {
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