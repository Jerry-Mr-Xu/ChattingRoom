'use strict';

const nunjucks = require('nunjucks');

/**
 * 创建nunjucks.Environment
 * @param {string} path views文件夹路径（即html文件夹的路径）
 * @param {object} opts 环境配置参数
 */
var createEnv = (path, opts) => {
    let
        autoescape = opts.autoescape || true,
        noCache = opts.noCache || false,
        watch = opts.watch || false,
        throwOnUndefined = opts.throwOnUndefined || false,
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(path, {
                noCache: noCache,
                watch: watch
            }), {
                autoescape: autoescape,
                throwOnUndefined: throwOnUndefined
            }
        );

    if (opts.filters) {
        for (const name in opts.filters) {
            if (opts.filters.hasOwnProperty(name)) {
                const filter = opts.filters[name];
                env.addFilter(name, filter);
            }
        }
    }

    return env;
};

/**
 * 为context加上render函数的中间件
 * @param {string} path html文件夹路径
 * @param {object} opts 环境配置参数
 */
var putRenderFn = (path, opts) => {
    let env = createEnv(path, opts);

    return async (context, next) => {
        context.render = (view, model) => {
            // 将渲染之后的模板放入response的body中（这里将一些所有页面公用的数据放在context.state中）
            context.response.body = env.render(view, Object.assign({}, context.state || {}, model || {}));
            // 设置页面Content-Type
            context.response.type = 'text/html';
        };

        await next();
    };
};

module.exports = putRenderFn;