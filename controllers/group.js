/*
 * @Author: astar
 * @Date: 2021-04-19 13:54:52
 * @LastEditors: astar
 * @LastEditTime: 2021-05-04 20:40:15
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

  /**
  * 新建群组
  * @author astar
  * @date 2021-05-04 20:11
  */
  createGroup ({ groupName, groupOwnerId, members }) {
    return this.Model.create({ groupName, groupOwnerId, members });
  }

  /**
  * 拉人进群
  * @author astar
  * @date 2021-05-04 20:11
  */
  joinMember ({ groupId, userId }) {
    return this.Model.updateOne({ _id: groupId }, { $addToSet: { 'members': userId }});
  }

  /**
  * 根据用户ID获取群组列表
  * @author astar
  * @date 2021-05-04 20:10
  */
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
                        let eachSize = Math.floor(size / columns);
                        let specialLen = avatarBuffers.length % columns;
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
                            if (idx < specialLen) {
                              top = 0;
                              left = (size - eachSize * specialLen) / 2 + idx * eachSize;
                            } else {
                              top = eachSize * (Math.floor((idx - specialLen) / columns) + (specialLen ? 1 : 0));
                              left = (idx - specialLen) % columns * eachSize;
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

  /**
  * 获取群信息
  * @author astar
  * @date 2021-05-04 20:10
  */
  getGroupInfoByGroupId ({ groupId }) {
    return this.Model.findOne({ _id: groupId }).populate('members')
  }

  /**
  * 修改群名称
  * @author astar
  * @date 2021-05-04 20:10
  */
  updateGroupNameByGroupId ({ groupId, groupName }) {
    return this.Model.updateOne({ _id: groupId }, { groupName })
  }

  /**
  * 用户退出群组
  * @author astar
  * @date 2021-05-04 18:33
  */
  exitGroupByUserId ({ userId, groupId }) {
    return this.Model.updateOne({ _id: groupId }, { $pull: { members: userId } });
  }
};

module.exports = new ChatController();