const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
// 生成 rsa 非对称密钥对
// 返回 {publicKey, privateKey}
function getKeyPair(passphrase) {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // 模数的位数，即密钥的位数，2048 或以上一般是安全的
    publicExponent: 0x10001, // 指数值，必须为奇数，默认值为 0x10001，即 65537
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8', // 用于存储私钥信息的标准语法标准
      format: 'pem', // base64 编码的 DER 证书格式
      cipher: 'aes-256-cbc', // 加密算法和操作模式
      passphrase
    }
  });
}

// 生成 rsa 非对称密钥对文件到指定路径，名称分别为 private.pem 和 public.pem
function createKeyPairFile(filePath, passphrase) {
  const { publicKey, privateKey } = getKeyPair(passphrase);
  try {
    fs.writeFileSync(path.join(filePath, 'private.pem'), privateKey, 'utf8');
    fs.writeFileSync(path.join(filePath, 'public.pem'), publicKey, 'utf8');
  } catch (err) {
    console.error(err);
  }
}

// 使用公钥加密数据
// function publicEncrypt(data, publicKey, encoding) {
//   const msg = JSON.stringify(data);
//   const encryptBuffer = crypto.publicEncrypt({
//       key: publicKey,
//       padding: crypto.constants.RSA_PKCS1_PADDING // 填充方式，需与解密一致
//   }, Buffer.from(msg, 'utf8'));
//   if (encoding) {
//       return encryptBuffer.toString(encoding);
//   } else {
//       return encryptBuffer;
//   }
// }

// 使用私钥解密数据
function privateDecrypt(privateKey, passphrase, encryptBuffer) {
  const msgBuffer = crypto.privateDecrypt({
    key: privateKey,
    passphrase,
    padding: crypto.constants.RSA_PKCS1_PADDING
  }, encryptBuffer);

  // return JSON.parse(msgBuffer.toString('utf8'));
  return msgBuffer.toString('utf8'); // 前端加密不一定是json数据
}

// 使用私钥签名数据
// function privateSign(privateKey, passphrase, encryptBuffer, encoding) {
//   const sign = crypto.createSign('SHA256');
//   sign.update(encryptBuffer);
//   sign.end();
//   const signatureBuffer = sign.sign({
//       key: privateKey,
//       passphrase
//   });
//   if (encoding) {
//       return signatureBuffer.toString(encoding);
//   } else {
//       return signatureBuffer;
//   }
// }

// // 使用公钥验证签名
// function publicVerify(publicKey, encryptBuffer, signatureBuffer) {
//   const verify = crypto.createVerify('SHA256');
//   verify.update(encryptBuffer);
//   verify.end();
//   return verify.verify(publicKey, signatureBuffer);
// }

// 生成盐
function genSalt (length = 16) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

// 哈希算法
function sha512 (origin, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(origin)
  return hash.digest('hex');
}

function getIPAddress () {
  let interfaces = require('os').networkInterfaces();
  for (let devName in interfaces) {
    let iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
}

// 破解百度图片加密url
function decodeBaiduImgURL (data = '') {
  if (!data) return ''
  let str_table = {
    '_z2C\\$q': ':',
    '_z&e3B': '.',
    'AzdH3F': '/'
  }
  let char_table = {
    'w': 'a',
    'k': 'b',
    'v': 'c',
    '1': 'd',
    'j': 'e',
    'u': 'f',
    '2': 'g',
    'i': 'h',
    't': 'i',
    '3': 'j',
    'h': 'k',
    's': 'l',
    '4': 'm',
    'g': 'n',
    '5': 'o',
    'r': 'p',
    'q': 'q',
    '6': 'r',
    'f': 's',
    'p': 't',
    '7': 'u',
    'e': 'v',
    'o': 'w',
    '8': '1',
    'd': '2',
    'n': '3',
    '9': '4',
    'c': '5',
    'm': '6',
    '0': '7',
    'b': '8',
    'l': '9',
    'a': '0'
  }
  for (let key in str_table) {
    let reg = new RegExp(key, 'g');
    data = data.replace(reg, str_table[key]);
  }
  return data.split('').map(item => char_table[item] || item).join('');
}

/**
 * 将多张图片合成一张
 * @author astar
 * @date 2021-05-07 15:21
 * @param {Array} picList - 原始图片url列表
 * @returns {base64} 合成的图片
 */
async function mergePics (picList, size = 200) {
  const sharp = require('sharp');
  const axios = require('axios');
  const https = require('https');
  // 获取图片buffer
  let requests = [];
  picList.forEach(url => {
    requests.push(axios({
      methos: 'get',
      url: url,
      responseType: "arraybuffer",
      httpsAgent: process.env.NODE_ENV === 'development' ? new https.Agent({ rejectUnauthorized: false }) : null // ignore ssl certificate validation in env-development
    }));
  });
  let picBuffers = (await axios.all(requests)).map(item => item.data);

  // 计算布局 // 行列大致均匀分布
  let columns = Math.ceil(Math.sqrt(picBuffers.length)); // 列数
  let rows = Math.ceil(picBuffers.length / columns); // 行数
  let eachSize = Math.floor(size / columns); // 每张图片大小
  let specialLen = picBuffers.length % columns; // 第一行个数跟其他行不同时，第一行个数

  // 图片背景
  const backgroundBuffer = sharp({
    create: {
      width: size,
      height: rows * eachSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 128 }
    }
  }).raw().toBuffer();

  // 将每张图片合并到背景上
  let composite = await (picBuffers.reduce((input, overlay, idx) => {
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

  // 新生成size*size正方形背景，将以上合并成的size*(rows*eachSize)图片居中
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
  }])
  .png()
  // .toBuffer();

  // return 'data:image/png;base64,'+ composite.toString('base64');
  return composite;
}

module.exports = {
  getKeyPair,
  createKeyPairFile,
  // publicEncrypt,
  privateDecrypt,
  genSalt,
  sha512,
  // privateSign,
  // publicVerify,
  getIPAddress,
  decodeBaiduImgURL,
  mergePics
};