/*
 * @Description: 
 * @Author: astar
 * @Date: 2021-05-09 19:55:25
 * @LastEditTime: 2021-05-09 20:00:40
 * @LastEditors: astar
 */
const getModel = require('@models').getModel;
const chatModel = getModel('chatmodel');

let chat = {};
/**
 * 获取历史聊天记录, 从startId获取
 * @author astar
 * @date 2021-03-03 16:01
 */
 chat.getHistoryChatByCount = async ctx => {
  ctx.verifyParams({
    receiverId: { type: 'string', required: true },
    fetchCount: { type: 'string', required: true }
  });

  const { receiverId, startId, fetchCount } = ctx.query;
  let res = await chatModel.find(startId ? { receiver: receiverId, _id: { $lt: startId } } : { receiver: receiverId })
            .sort({ addTime: -1 })
            .limit(Number(fetchCount))
            .populate('sender', ['userName', 'avatar'])
            .populate('receiver', ['groupName', 'avatar', 'userName'])
            .then(res => {
              return res.reverse();
            });
  ctx.send(res);
}

module.exports = chat;