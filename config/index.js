/*
 * @Description: 
 * @Author: astar
 * @Date: 2021-07-02 17:54:23
 * @LastEditTime: 2021-12-11 15:19:32
 * @LastEditors: astar
 */
exports.HTTP_PORT = 3000;
exports.BASE_URL = process.env.NODE_ENV === 'development' ? 'https://localhost:3001' : 'https://hello-astar.asia/api';
exports.DATABASE = {
  dbName: 'chat_db',
  host: 'localhost',
  port: '27017',
  user: 'root',
  password: '123456'
};
exports.JWT_SECRET = 'JWT_SECRET';

exports.WHITE_WEBSITES = ['http://113.104.235.170:2000', 'http://localhost:2000', 'http://127.0.0.1:2000'];

exports.DEFAULT_VAVTAR = 'https://tupian.qqw21.com/article/UploadPic/2018-1/20181721495856428.gif';

exports.NOT_NEED_TOKEN_PATH_REGS = process.env.NODE_ENV === 'development' ? [
  /[\s\S]*/
] : [
  /\/user\/login/,
  /\/user\/register/,
  /\/tool\/getCaptcha/,
  /\/tool\/getQiniuToken/,
  /\/group\/getGroupAvatar/
]

exports.PASSPHRASE = 'astar'

exports.KOA_SESSION = {
  key: 'koaChatApplication.sess', /** (string) cookie key (default is koa.sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */ // 只能服务器端访问
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
  secure: false, /** (boolean) secure cookie*/ // 安全/加密连接才能用
  sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */ // lax、Strict、None（需要结合secure使用
}
