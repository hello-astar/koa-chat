exports.PORT = 3000;
exports.BASE_URL = 'http://192.168.22.173';
exports.DATABASE = {
  dbName: 'chat_db',
  host: 'localhost',
  port: '27017',
  user: 'root',
  password: '123456'
};
exports.JWT_SECRET = 'JWT_SECRET';

exports.WHITE_WEBSITES = ['http://192.168.22.173:8080', 'http://localhost:8080', 'http://192.168.0.105:8080'];