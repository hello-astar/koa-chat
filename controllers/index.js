/*
 * @Author: astar
 * @Date: 2021-02-05 15:42:09
 * @LastEditors: astar
 * @LastEditTime: 2021-02-05 16:01:40
 * @Description: 文件描述
 * @FilePath: \koa-chat\controllers\index.js
 */
const fs = require('fs');

const files = fs.readdirSync(__dirname).filter(file => !['index.js', 'base.js'].includes(file));

const controllers = {};
for (const file of files) {
  if (file.toLowerCase().endsWith('js')) {
    const controller = require(`./${file}`);
    controllers[`${file.replace(/\.js/, '')}`] = controller;
  }
}

module.exports = controllers;

