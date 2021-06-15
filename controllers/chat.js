/*
 * @Description: 
 * @Author: astar
 * @Date: 2021-05-09 19:55:25
 * @LastEditTime: 2021-06-16 00:57:41
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
    isGroup: { type: 'boolean', required: true },
    fetchCount: { type: 'string', required: true }
  });

  const { receiverId, startId, fetchCount, isGroup } = ctx.query;

  let query = {
    receiverModel: isGroup ? 'groupmodel' : 'usermodel',
    receiver: receiverId
  }
  if (startId) {
    params._id = { $lt: startId }
  }
  if (!isGroup) {
    params.sender = ctx.userInfo._id
  }
  let res = await chatModel.find(query)
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