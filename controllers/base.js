/*
 * @author: astar
 * @Date: 2020-09-16 14:06:54
 * @LastEditors: astar
 * @LastEditTime: 2021-02-21 15:19:01
 * @Description: 基础controller
 * @FilePath: \koa-chat\controllers\base.js
 */
class BaseController {
  constructor (Model) {
    this.Model = Model;
  }

  // 插入一条数据
  addOne (obj) {
    const model = new this.Model(obj);
    return model.save().then(res => {
      return res;
    }, _ => {
      return Promise.reject(_);
    });
  }

  // 查找数据
  query (obj) {
    return new Promise((resolve, reject) => {
      this.Model.findOne(obj, (err, res) => {
        if(err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  // 更新数据
  update (query, obj) {
    return new Promise((resolve, reject) => {
      this.Model.updateOne(query, obj, (err, res) => {
        if(err) {
          reject(err);
        } else {
          resolve(res);
        }
      })
    })
  }
};

module.exports = BaseController;