/*
 * @Author: astar
 * @Date: 2021-02-06 15:44:30
 * @LastEditors: cmx
 * @LastEditTime: 2021-04-19 18:34:46
 * @Description: 文件描述
 * @FilePath: \koa-chat\routes\chat.js
 */
const Router = require('koa-router');
const axios = require('axios');
const router = new Router();
const chatController = require('@controllers').chat;
const { decodeBaiduImgURL } = require('@utils');

router.get('/getHistoryChatByCount', async ctx => {
  ctx.verifyParams({
    receiverId: { type: 'string', required: true },
    exitsCount: { type: 'string', required: true },
    fetchCount: { type: 'string', required: true }
  });

  const { receiverId, exitsCount, fetchCount } = ctx.query;
  try {
    let res = await chatController.getHistoryChatByCount({ receiverId, exitsCount: Number(exitsCount), fetchCount: Number(fetchCount) });
    ctx.send(res);
  } catch (e) {
    ctx.sendError(e);
  }
});

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