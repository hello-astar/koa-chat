/*
 * @Author: astar
 * @Date: 2021-04-19 13:54:52
 * @LastEditors: astar
 * @LastEditTime: 2021-04-22 00:19:07
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

  getGroups ({ receiverId }) {
    return this.Model.find({ members: { $in: receiverId } })
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
                        let size = 150;
                        let eachSize = 50;
                        // let eachSize = Math.floor(Math.sqrt(size * size / avatarBuffers.length));
                        let columns = Math.floor(size / eachSize);
                        let x = 0, y = 0;
                        // 获取背景
                        const backgroundBuffer = sharp({
                          create: {
                            width: size,
                            height: size,
                            channels: 4,
                            background: { r: 255, g: 255, b: 255, alpha: 128 }
                          }
                        }).raw().toBuffer();

                        let composite = await (avatarBuffers.reduce((input, overlay) => {
                          return input.then(async function (data) {
                            let temp = sharp(data, { raw: { width: size, height: size, channels: 4 } })
                                        .composite([{
                                            input: await sharp(overlay).resize(eachSize, eachSize).toBuffer(),
                                            top: eachSize * y,
                                            left: eachSize * x
                                          }])
                                        .raw()
                                        .toBuffer();
                            x++;
                            if (x === columns) {
                              x = 0;
                              y++;
                            }
                            return temp;
                          })
                        }, backgroundBuffer));

                        composite = await sharp(composite, { raw: {
                          width: size,
                          height: size,
                          channels: 4
                        }}).png().toBuffer();

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