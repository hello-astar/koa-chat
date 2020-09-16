/*
 * @author: cmx
 * @Date: 2020-09-09 15:28:52
 * @LastEditors: cmx
 * @LastEditTime: 2020-09-16 14:42:11
 * @Description: response格式定义
 * @FilePath: \koa-chat\model\response.js
 */
class successModel {
  constructor ({ data, msg } = {}) {
    this.result = 1
    this.msg = msg || 'success'
    this.data = data || {}
  }
}

class errorModel {
  constructor ({ msg, result } = {}) {
    this.result = result || -1
    this.msg = msg || 'error'
    this.data = null
  }
}

module.exports = {
  successModel,
  errorModel
}