/*
 * @author: cmx
 * @Date: 2020-09-16 14:06:54
 * @LastEditors: cmx
 * @LastEditTime: 2020-09-16 14:59:29
 * @Description: 基础controller
 * @FilePath: \koa-chat\db\controllers\base.js
 */
class BaseController {
  constructor (Model) {
    this.Model = Model
  }

  // 插入一条数据
  add(obj) {
    return new Promise((resolve, reject) => {
      const model = new this.Model(obj);
      model.save(function(err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  // 查找数据
  query (obj) {
    return new Promise((resolve, reject) => {
      this.Model.find(obj, (err, res) => {
        if(err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
};

module.exports = BaseController;