/*
 * @Author: astar
 * @Date: 2021-02-24 16:10:42
 * @LastEditors: astar
 * @LastEditTime: 2021-02-24 18:16:48
 * @Description: 懒人方案，一键修改file header
 */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
if (args.length < 2) {
  console.warn('请输入参数');
  return;
}
const from = args[0];
const to = args[1];

// 将项目下所有名字修改
const changeFile = (filepath) => {
  fs.readdir(filepath, function (err, files) {
    if (err) console.warn(err)
    else {
      files.forEach(filename => {
        let fileDir = path.join(filepath, filename);
        fs.stat(fileDir, function (error, stats) {
          if (error) console.warn(error)
          else {
            if (stats.isFile() && (new RegExp(/.*\.js$/)).test(fileDir)) {
              console.log(fileDir)
              // 读取文件内容
              let content = fs.readFileSync(fileDir, 'utf-8');
              // // 修改文件内容
              fs.writeFileSync(fileDir, content.replace(new RegExp("(@Author|@LastEditors|@author)(: | )" + from, "g"), "$1$2" + to));
            } else if (stats.isDirectory() && !(new RegExp("node_modules", "g")).test(fileDir)) {
              changeFile(fileDir)
            }
          }
        })
      })
    }
  })
}

changeFile(path.join(__dirname, '../'));