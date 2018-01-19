'use strict';

const fs = require('mz/fs');
const mime = require('mime');
const path = require('path');

module.exports = getStaticFile;

/**
 * 获取处理静态文件的中间件
 */
function getStaticFile() {
    return async (context, next) => {
        // 获取当前文件夹名
        let currentDir = '/' + __dirname.split('\\').pop() + '/';
        // 获取请求path
        let requestPath = context.request.path;

        if (requestPath.startsWith(currentDir)) {
            // 如果是请求静态文件
            // 获取文件完整路径
            let fileWholePath = path.join(__dirname, requestPath.substring(currentDir.length));
            // 判断文件是否存在
            if (await fs.exists(fileWholePath)) {
                // 获取文件类型
                context.response.type = mime.getType(fileWholePath);
                // 读取文件
                context.response.body = await fs.readFile(fileWholePath);
            } else {
                // 文件不存在
                console.error(`Cannt find file: ${fileWholePath}`);
                context.response.status = 404;
            }
        } else {
            await next();
        }
    }
}