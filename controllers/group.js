/*
 * @Author: astar
 * @Date: 2021-04-19 13:54:52
 * @LastEditors: astar
 * @LastEditTime: 2021-04-22 14:21:59
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\group.js
 */
const GroupModel = require('@models').getModel('groupmodel');
const sharp = require('sharp');
const axios = require('axios');
class ChatController {
  constructor () {
    this.Model = GroupModel;
  }

  createGroup ({ groupName, groupOwnerId, members }) {
    return this.Model.create({ groupName, groupOwnerId, members });
  }

  joinUser ({ groupId, userId }) {
    return this.Model.updateOne({ _id: groupId }, { $addToSet: { 'members': userId }});
  }

  getGroups ({ userId }) {
    return this.Model.find({ members: { $in: userId } })
                    .populate({
                      path: 'members',
                      select: 'avatar -_id',
                      options: {
                        limit: 9
                      }
                    }).then(async res => {
                      return await Promise.all(res.map(async item => {
                        // 合成头像
                        let requests = []
                        item.members.forEach(member => {
                          let avatarBuffer = axios({
                            methos: 'get',
                            url: member.avatar,
                            responseType: "arraybuffer"
                          })
                          requests.push(avatarBuffer)
                        });
                        let avatarBuffers = (await axios.all(requests)).map(item => item.data);
                        let size = 200;
                        let columns = Math.ceil(Math.sqrt(avatarBuffers.length));
                        let rows = Math.ceil(avatarBuffers.length / columns);
                        let eachSize = size / columns;
                        // 获取背景
                        const backgroundBuffer = sharp({
                          create: {
                            width: size,
                            height: rows * eachSize,
                            channels: 4,
                            background: { r: 255, g: 255, b: 255, alpha: 128 }
                          }
                        }).raw().toBuffer();

                        let composite = await (avatarBuffers.reduce((input, overlay, idx) => {
                          return input.then(async function (data) {
                            let left = 0;
                            let top = 0;
                            let specialLen = avatarBuffers.length % columns;
                            if (idx < specialLen) {
                              top = 0;
                              left = (size - eachSize * specialLen) / 2 + (idx + 1) * eachSize;
                            } else {
                              top = eachSize * (Math.floor((idx - specialLen) / columns) + (specialLen ? 1 : 0));
                              left = Math.floor(avatarBuffers.length  / columns) * (idx - specialLen) * eachSize;
                            }
                            let temp = sharp(data, { raw: { width: size, height: rows * eachSize, channels: 4 } })
                                        .composite([{
                                            input: await sharp(overlay).resize(eachSize, eachSize).toBuffer(),
                                            top,
                                            left
                                          }])
                                        .raw()
                                        .toBuffer();
                            return temp;
                          })
                        }, backgroundBuffer));

                        composite = await sharp(composite, { raw: {
                          width: size,
                          height: eachSize * rows,
                          channels: 4
                        }}).png().toBuffer();
                        
                        composite = await sharp({
                          create: {
                            width: size,
                            height: size,
                            channels: 4,
                            background: { r: 255, g: 255, b: 255, alpha: 128 }
                          }
                        }).composite([{
                          input: composite
                        }]).png().toBuffer();

                        return {
                          _id: item._id,
                          groupName: item.groupName,
                          addTime: item.addTime,
                          avatar: 'data:image/png;base64,'+ composite.toString('base64')
                        }
                      }));
                    });
  }
};

module.exports = new ChatController();