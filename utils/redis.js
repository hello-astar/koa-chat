/*
 * @Description: redis缓存
 * @Author: astar
 * @Date: 2022-01-05 18:47:09
 * @LastEditTime: 2022-01-05 19:59:02
 * @LastEditors: astar
 */
const redis = require('redis');
const config = require('@config');

const redisClient = redis.createClient(config.REDIS);
redisClient.connect();

redisClient.on('error', (err) => console.log('Redis Client Error', err));


module.exports = redisClient;
