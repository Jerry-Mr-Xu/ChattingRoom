'use strict';

/**
 * 获取router对象（由这个方法统一处理url）
 */
var getRouter = () => {
    const router = require('koa-router')();
    const fs = require('mz/fs');

    let isNeedBodyParser = false;

    // 筛选出所有url文件
    let allUrlFileNames = fs.readdirSync(__dirname).filter((fileName) => {
        return /^url_\w+.js$/.test(fileName) && fileName !== __filename.split('\\').pop();
    });

    allUrlFileNames.forEach(urlFileName => {
        // 动态导入每个url文件
        const url = require(`${__dirname}\\${urlFileName}`);

        let urlArray = [];
        if (url instanceof Array) {
            urlArray = url;
        } else {
            urlArray.push(url);
        }

        if (urlArray) {
            // 将所有url放入router中
            urlArray.forEach(urlObj => {
                // 根据请求方式不同调用不同的router函数
                switch (urlObj.method) {
                    case 'get':
                    case 'GET':
                        router.get(urlObj.url, urlObj.fn);
                        break;

                    case 'post':
                    case 'POST':
                        // 如果有post请求则需要bodyparser
                        isNeedBodyParser = true;
                        router.post(urlObj.url, urlObj.fn);
                        break;

                    default:
                        console.error(`Invalid url method: ${urlObj.method}`);
                        break;
                }
            });
        } else {
            console.error(`Undefined urlArray in ${__dirname}\\${urlFileName}`);
        }
    });

    // 将是否有需要bodyparser放入router中
    router.isNeedParser = isNeedBodyParser;
    return router;
};

module.exports = getRouter;